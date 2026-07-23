const { chromium } = require("playwright");

async function loginEDP(matricula, senha){
    const browser = await chromium.launch({
        headless: true,
        // Esta linha é crucial para ambientes Docker.
        // Ela diz ao Playwright para usar o navegador Chromium que já vem na imagem,
        // em vez de tentar baixar um novo.
        channel: 'chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Argumentos de segurança para rodar no Linux
    });

    const page = await browser.newPage();



    await page.goto(
        "https://sgo.edp.com.br/SGSTUITemplate/Login.aspx"
    );


    await page.fill(
        "#wt5_wtUsername_wtUserNameInput",
        matricula
    );


    await page.fill(
        "#wt5_wtPassword_wtPasswordInput",
        senha
    );


    await page.click(
        "#wt5_wtAction_wtLoginButton"
    );

    // Espera robusta: Aguarda pela URL mudar para a página principal ou por um elemento específico.
    // O seletor 'a[href*="Logout.aspx"]' procura pelo link de Logout, um bom indicador de que o login foi bem-sucedido.
    try {
        await page.waitForSelector('a[href*="Logout.aspx"]', { timeout: 15000 });
    } catch (timeoutError) {
        // Se o timeout estourou e a página voltou/permaneceu no login, é credencial inválida.
        if (page.url().includes("Login.aspx")) {
            throw new Error("Falha no login. Verifique matrícula e senha.");
        }
        throw timeoutError;
    }
    console.log(
        "URL depois do login:",
        page.url()
    );


    return {
        browser,
        page
    };

}


module.exports = {
    loginEDP
};