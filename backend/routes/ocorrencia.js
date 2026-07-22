const express = require("express");
const router = express.Router();

const { loginEDP } = require("../playwright/loginEDP");
const { preencherOcorrenciaEDP } = require("../playwright/ocorrenciaEDP");

// Importa a configuração do banco de dados
const db = require('../db/pool'); 

// NOVA ROTA: Obter histórico de ocorrências
router.get("/", async (req, res) => {
    const { search, status, page = 1, limit = 10 } = req.query;

    try {
        // --- Parte 1: Construir a query de busca e contagem ---
        let countQuery = 'SELECT COUNT(*) FROM ocorrencias';
        let dataQuery = 'SELECT id, matricula_autor, descricao, status, erro_mensagem, created_at FROM ocorrencias';
        
        const conditions = [];
        const values = [];
        let paramIndex = 1;

        if (search) {
            conditions.push(`descricao ILIKE $${paramIndex++}`);
            values.push(`%${search}%`);
        }

        if (status) {
            conditions.push(`status = $${paramIndex++}`);
            values.push(status);
        }

        if (conditions.length > 0) {
            const whereClause = ' WHERE ' + conditions.join(' AND ');
            countQuery += whereClause;
            dataQuery += whereClause;
        }

        // --- Parte 2: Executar a query de contagem ---
        const totalResult = await db.query(countQuery, values);
        const totalItems = parseInt(totalResult.rows[0].count, 10);
        const totalPages = Math.ceil(totalItems / limit);

        // --- Parte 3: Executar a query de dados com paginação ---
        const offset = (page - 1) * limit;
        dataQuery += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
        const dataValues = [...values, limit, offset];

        const { rows } = await db.query(dataQuery, dataValues);

        // --- Parte 4: Retornar os dados e a metadata de paginação ---
        res.json({ 
            sucesso: true, 
            data: rows,
            pagination: {
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                totalItems,
                totalPages
            }
        });
    } catch (error) {
        console.error("❌ Erro ao buscar histórico de ocorrências:", error);
        res.status(500).json({
            sucesso: false,
            erro: "Falha ao buscar dados do banco de dados."
        });
    }
});

router.post("/", async (req, res) => {
    let browser; // Declarar browser aqui para ser acessível no finally
    let novaOcorrenciaId; // Para armazenar o ID da ocorrência no banco
    try {
        const {
            matricula,
            senha,
            ocorrencia
        } = req.body;

        console.log("Recebido. Iniciando automação...");
        console.log("Dados da ocorrência:", ocorrencia);

        // --- PASSO 1: Salvar a ocorrência no banco de dados com status 'iniciado' ---
        try {
            const queryText = `
                INSERT INTO ocorrencias(matricula_autor, descricao, endereco, cpf, acoes_imediatas, machucado, tipo_evento, categoria, tipo_tipologia, latitude, longitude, status)
                VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'iniciado')
                RETURNING id;
            `;
            const queryValues = [
                matricula, ocorrencia.descricao, ocorrencia.endereco, ocorrencia.cpf, 
                ocorrencia.acoesImediatas, ocorrencia.machucado, ocorrencia.tipoEvento, 
                ocorrencia.categoria, ocorrencia.tipoTipologia, ocorrencia.latitude, ocorrencia.longitude
            ];
            const dbResult = await db.query(queryText, queryValues);
            novaOcorrenciaId = dbResult.rows[0].id;
            console.log(`✅ Ocorrência salva no banco de dados com ID: ${novaOcorrenciaId}`);
        } catch (dbError) {
            console.error("Erro ao salvar no banco de dados:", dbError);
            // Se não conseguir salvar no DB, o processo não deve continuar.
            throw new Error("Falha crítica ao registrar ocorrência no banco de dados.");
        }

        // --- PASSO 2: Executar a automação com Playwright ---

        // Fazer login e obter a página e o navegador
        const loginResult = await loginEDP(
            matricula,
            senha
        );
        browser = loginResult.browser;
        const page = loginResult.page;

        // Preencher o formulário na página obtida
        await preencherOcorrenciaEDP(page, ocorrencia);

        // --- PASSO 3: Atualizar o status para 'concluido' no sucesso ---
        await db.query(
            'UPDATE ocorrencias SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            ['concluido', novaOcorrenciaId]
        );
        console.log(`✅ Status da ocorrência ${novaOcorrenciaId} atualizado para 'concluido'.`);

        res.json({
            sucesso: true,
            mensagem: "Automação de preenchimento concluída com sucesso!"
        });

    } catch (error) {
        console.error("❌ Ocorreu um erro durante a automação:", error);
        // --- PASSO 4: Se der erro, atualizar o status para 'falha' e registrar a mensagem ---
        if (novaOcorrenciaId) {
            await db.query(
                'UPDATE ocorrencias SET status = $1, erro_mensagem = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
                ['falha', error.message, novaOcorrenciaId]
            );
            console.log(`❌ Status da ocorrência ${novaOcorrenciaId} atualizado para 'falha'.`);
        }
        res.status(500).json({
            sucesso: false,
            erro: "Ocorreu uma falha no servidor durante a automação."
        });

    } finally {
        // --- PASSO 5: Garantir que o navegador seja fechado ---
        if (browser) {
            await browser.close();
            console.log("Navegador fechado.");
        }
    }
});

module.exports = router;