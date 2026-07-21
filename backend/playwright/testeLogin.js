const { chromium } = require("playwright");

(async () => {

    const browser = await chromium.launch({
        headless: false
    });

    const page = await browser.newPage();

    await page.goto(
        "https://sgo.edp.com.br/SGSTUITemplate/Login.aspx"
    );

    console.log("Página aberta:", await page.title());

})();