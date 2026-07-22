const express = require("express");
const router = express.Router();

const { loginEDP } = require("../playwright/loginEDP");
const { preencherOcorrenciaEDP } = require("../playwright/ocorrenciaEDP");
const path = require('path');

// Importa a configuração do banco de dados usando um caminho absoluto para garantir compatibilidade no deploy.
const db = require(path.join(__dirname, '..', '..', 'db', 'pool'));

// NOVA ROTA: Obter histórico de ocorrências
router.get("/", async (req, res) => {
    // Converte os parâmetros para os tipos corretos, com valores padrão.
    const { search, status } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    try {
        const conditions = [];
        const values = [];
        let paramIndex = 1;

        if (search) {
            conditions.push(`(descricao ILIKE $${paramIndex} OR CAST(id AS TEXT) ILIKE $${paramIndex})`);
            paramIndex++;
            values.push(`%${search}%`);
        }

        if (status) {
            conditions.push(`status = $${paramIndex++}`);
            values.push(status);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // --- Executa as queries de contagem e de dados em paralelo para mais eficiência ---
        const countQuery = `SELECT COUNT(*) FROM ocorrencias ${whereClause}`;
        const dataQuery = `
            SELECT id, matricula_autor, descricao, status, erro_mensagem, created_at 
            FROM ocorrencias 
            ${whereClause} 
            ORDER BY created_at DESC 
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

        const [totalResult, dataResult] = await Promise.all([
            db.query(countQuery, values),
            db.query(dataQuery, [...values, limit, offset])
        ]);

        const totalItems = parseInt(totalResult.rows[0].count, 10);
        const totalPages = Math.ceil(totalItems / limit);

        res.status(200).json({
            sucesso: true,
            data: dataResult.rows,
            pagination: {
                page,
                limit,
                totalItems,
                totalPages
            }
        });
    } catch (error) {
        console.error("❌ Erro ao buscar histórico de ocorrências:", error);
        res.status(500).json({ sucesso: false, erro: "Falha ao buscar dados do banco de dados." });
    }
});

router.post("/", async (req, res) => {
    let browser;
    let novaOcorrenciaId;

    const { matricula, senha, ocorrencia } = req.body;

    if (!matricula || !senha || !ocorrencia) {
        return res.status(400).json({ sucesso: false, erro: "Dados incompletos. Matrícula, senha e ocorrência são obrigatórios." });
    }

    try {
        console.log("Recebido. Iniciando automação...");
        console.log("Dados da ocorrência:", ocorrencia);

        // --- PASSO 1: Salvar a ocorrência no banco com status 'iniciado' ---
        const queryText = `
            INSERT INTO ocorrencias(matricula_autor, descricao, endereco, cpf, acoes_imediatas, machucado, tipo_evento, categoria, tipo_tipologia, latitude, longitude, status)
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'iniciado')
            RETURNING id;
        `;
        const { 
            descricao, 
            endereco, 
            cpf, 
            acoesImediatas, 
            machucado, 
            tipoEvento, 
            categoria, 
            tipoTipologia, 
            latitude, 
            longitude 
        } = ocorrencia;

        const queryValues = [
            matricula, descricao, endereco, cpf, acoesImediatas, machucado, 
            tipoEvento, categoria, tipoTipologia, latitude, longitude
        ];
        const dbResult = await db.query(queryText, queryValues);
        novaOcorrenciaId = dbResult.rows[0].id;
        console.log(`✅ Ocorrência salva no banco de dados com ID: ${novaOcorrenciaId}`);

        // --- PASSO 2: Executar a automação com Playwright ---
        const loginResult = await loginEDP(matricula, senha);
        browser = loginResult.browser;
        const page = loginResult.page;

        await preencherOcorrenciaEDP(page, ocorrencia);

        // --- PASSO 3: Atualizar o status para 'concluido' no sucesso ---
        await db.query(
            'UPDATE ocorrencias SET status = $1 WHERE id = $2',
            ['concluido', parseInt(novaOcorrenciaId, 10)]
        );
        console.log(`✅ Status da ocorrência ${novaOcorrenciaId} atualizado para 'concluido'.`);

        res.status(200).json({
            sucesso: true,
            mensagem: "Automação de preenchimento concluída com sucesso!"
        });

    } catch (error) {
        console.error("❌ Ocorreu um erro durante a automação:", error);
        const errorMessage = error.message || "Erro desconhecido na automação.";

        // --- PASSO 4: Se der erro, atualizar o status para 'falha' ---
        if (novaOcorrenciaId) {
            try {
                await db.query(
                    'UPDATE ocorrencias SET status = $1, erro_mensagem = $2 WHERE id = $3',
                    ['falha', errorMessage, parseInt(novaOcorrenciaId, 10)]
                );
                console.log(`❌ Status da ocorrência ${novaOcorrenciaId} atualizado para 'falha'.`);
            } catch (dbError) {
                console.error(`Falha ao ATUALIZAR o status da ocorrência ${novaOcorrenciaId} para 'falha':`, dbError);
            }
        }
        res.status(500).json({ sucesso: false, erro: errorMessage });

    } finally {
        // --- PASSO 5: Garantir que o navegador seja fechado ---
        if (browser) {
            await browser.close();
            console.log("Navegador fechado.");
        }
    }
});

module.exports = router;