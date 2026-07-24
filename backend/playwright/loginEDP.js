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

        // A plataforma da EDP (OutSystems) é pesada — imagem, fonte e mídia não fazem
        // diferença nenhuma pra automação (só preenche campos, não precisa "ver" nada), então
        // bloquear esses recursos reduz bastante o tempo de carregamento das páginas.
        await page.route("**/*", (route) => {
            const tipo = route.request().resourceType();
            if (tipo === "image" || tipo === "font" || tipo === "media") {
                return route.abort();
            }
            return route.continue();
        });

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

        // Corre duas checagens em paralelo em vez de uma espera única: o link de Logout
        // (sucesso) e o texto de erro que a EDP mostra na tela pra credencial inválida
        // ("Usuário não localizado", etc). Assim uma credencial errada continua respondendo
        // rápido (poucos segundos) igual antes, e só a tentativa que realmente está
        // progredindo (credencial válida, site lento) usa o timeout generoso de até 150s.
        const sucessoPromise = page
            .waitForSelector('a[href*="Logout.aspx"]', { timeout: 150000 })
            .then(() => ({ tipo: "sucesso" }))
            .catch(() => ({ tipo: "timeout_sucesso" }));

        const erroPromise = page
            .waitForFunction(
                () => /não localizado|inv[aá]lid|incorret/i.test(document.body.innerText || ""),
                { timeout: 150000 }
            )
            .then(() => ({ tipo: "erro_detectado" }))
            .catch(() => ({ tipo: "timeout_erro" }));

        const resultado = await Promise.race([sucessoPromise, erroPromise]);

        if (resultado.tipo === "erro_detectado") {
            throw new Error("Falha no login. Verifique matrícula e senha.");
        }
        if (resultado.tipo !== "sucesso") {
            // Nenhuma das duas checagens resolveu antes do timeout de 150s — situação
            // ambígua (site travado de verdade, ou seletor de sucesso desatualizado).
            // Confirma pela URL antes de decidir, e inclui contexto extra no erro.
            if (page.url().includes("Login.aspx")) {
                throw new Error("Falha no login. Verifique matrícula e senha.");
            }
            let contexto = "";
            try {
                contexto = ` (URL atual: ${page.url()}, título: "${await page.title()}")`;
            } catch (_) {
                // ignora falha ao coletar contexto extra
            }
            throw new Error(`Timeout esperando confirmação de login.${contexto}`);
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
