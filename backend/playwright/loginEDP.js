const { chromium } = require("playwright");

async function loginEDP(matricula, senha){
    const browser = await chromium.launch({
        headless: true,
        // NÃO usar channel: 'chrome' aqui — isso pede o Google Chrome de verdade, que não vem
        // instalado no ambiente do Render (só o Chromium do próprio Playwright vem, ver
        // PLAYWRIGHT_BROWSERS_PATH=0 nas variáveis de ambiente do serviço).
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Argumentos de segurança para rodar no Linux
    });

    let page;
    try {
        page = await browser.newPage();

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
    } catch (error) {
        // Se qualquer etapa do login falhar, o browser criado acima precisa ser fechado aqui
        // mesmo — quem chama loginEDP() só recebe o browser de volta em caso de sucesso, então
        // sem isso o processo do navegador ficava aberto pra sempre a cada tentativa de login
        // que falhasse (vazamento de recurso, especialmente grave no plano free do Render).
        if (page) {
            try {
                await page.screenshot({ path: "login_error_screenshot.png" });
                console.log("Screenshot do erro de login salvo em login_error_screenshot.png");
            } catch (_) {
                // ignora falha ao tirar screenshot
            }
        }
        await browser.close();
        throw error;
    }
}


module.exports = {
    loginEDP
};
