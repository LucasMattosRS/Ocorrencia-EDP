const express = require("express");
const router = express.Router();

const { loginEDP } = require("../playwright/loginEDP");

// Valida as credenciais do SGS antes de liberar o formulário no frontend.
router.post("/login", async (req, res) => {
    const { matricula, senha } = req.body;

    if (!matricula || !senha) {
        return res.status(400).json({ sucesso: false, erro: "Matrícula e senha são obrigatórias." });
    }

    let browser;
    try {
        const result = await loginEDP(matricula, senha);
        browser = result.browser;
        res.status(200).json({ sucesso: true, mensagem: "Login validado com sucesso." });
    } catch (error) {
        console.error("❌ Falha ao validar login no SGS:", error.message);
        res.status(401).json({ sucesso: false, erro: error.message || "Falha ao validar login no SGS." });
    } finally {
        if (browser) {
            await browser.close();
        }
    }
});

module.exports = router;
