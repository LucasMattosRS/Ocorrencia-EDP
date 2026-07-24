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
            "https://sgo.edp.com.br/SGSTUITemplate/Login.aspx",
            { waitUntil: "load", timeout: 60000 }
        );

        // Espera o campo de usuário estar realmente pronto antes de mexer em qualquer coisa —
        // em servidores mais lentos (Render) a página pode demorar mais pra "assentar" do que
        // aqui no dev, mesmo depois do 'load' disparar.
        await page.waitForSelector("#wt5_wtUsername_wtUserNameInput", { timeout: 30000 });

        await page.fill(
            "#wt5_wtUsername_wtUserNameInput",
            matricula
        );

        await page.fill(
            "#wt5_wtPassword_wtPasswordInput",
            senha
        );

        // O clique no botão de login travava em produção mesmo com o botão visível/habilitado —
        // o call log mostrou que o Playwright fica tentando acompanhar uma cadeia de
        // redirecionamentos do próprio site (ex: Login.aspx -> SGSTUITemplate/ -> página final)
        // e se confunde tentando esperar "a" navegação certa depois do clique. noWaitAfter tira
        // essa espera embutida do click() — quem garante que o login realmente terminou é o
        // waitForSelector do Logout.aspx logo abaixo, que tem seu próprio timeout generoso e
        // não depende de acompanhar navegação nenhuma.
        await page.click("#wt5_wtAction_wtLoginButton", { timeout: 20000, noWaitAfter: true });

        // Espera robusta: Aguarda pela URL mudar para a página principal ou por um elemento específico.
        // O seletor 'a[href*="Logout.aspx"]' procura pelo link de Logout, um bom indicador de que o login foi bem-sucedido.
        // Timeout bem generoso porque a plataforma da EDP (OutSystems) é pesada pra carregar
        // depois do login, e a validação roda em segundo plano no app (a pessoa já está
        // preenchendo o formulário enquanto isso), então dá pra ser bem mais paciente aqui.
        try {
            await page.waitForSelector('a[href*="Logout.aspx"]', { timeout: 150000 });
        } catch (timeoutError) {
            // Se o timeout estourou e a página voltou/permaneceu no login, é credencial inválida.
            if (page.url().includes("Login.aspx")) {
                throw new Error("Falha no login. Verifique matrícula e senha.");
            }
            // Chegou a sair do Login.aspx mas não achou o link de Logout dentro do tempo —
            // inclui URL/título atuais no erro pra ajudar a diagnosticar sem precisar de outro
            // teste ao vivo (ex: descobrir se travou numa página intermediária de verdade, ou
            // se só o seletor de sucesso está errado pra essa página).
            let contexto = "";
            try {
                contexto = ` (URL atual: ${page.url()}, título: "${await page.title()}")`;
            } catch (_) {
                // ignora falha ao coletar contexto extra
            }
            timeoutError.message += contexto;
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
