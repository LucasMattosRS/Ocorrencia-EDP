const express = require("express");
const router = express.Router();

const { loginEDP } = require("../playwright/loginEDP");
const { preencherOcorrenciaEDP } = require("../playwright/ocorrenciaEDP");

router.post("/", async (req, res) => {
    let browser; // Declarar browser aqui para ser acessível no finally

    try {
        const {
            matricula,
            senha,
            ocorrencia
        } = req.body;

        console.log("Recebido. Iniciando automação...");
        console.log("Dados da ocorrência:", ocorrencia);

        // 1. Fazer login e obter a página e o navegador
        const loginResult = await loginEDP(
            matricula,
            senha
        );
        browser = loginResult.browser;
        const page = loginResult.page;

        // 2. Preencher o formulário na página obtida
        await preencherOcorrenciaEDP(page, ocorrencia);

        res.json({
            sucesso: true,
            mensagem: "Automação de preenchimento concluída com sucesso!"
        });

    } catch (error) {
        console.error("Ocorreu um erro durante a automação:", error);
        res.status(500).json({
            sucesso: false,
            erro: error.message
        });

    } finally {
        // 3. Garantir que o navegador seja fechado
        if (browser) {
            await browser.close();
            console.log("Navegador fechado.");
        }
    }
});

module.exports = router;