const { chromium } = require("playwright");


async function abrirSGS(){

    const browser = await chromium.launch({
        headless:false
    });

    const page = await browser.newPage();


    await page.goto(
        "https://sgo.edp.com.br/SGSTUITemplate/Login.aspx"
    );


    console.log("Página aberta");


    const inputs = await page.locator("input").evaluateAll(elements =>
        elements.map(input => ({
            tipo: input.type,
            id: input.id,
            name: input.name,
            placeholder: input.placeholder,
            value: input.value
        }))
    );


    console.log("CAMPOS ENCONTRADOS:");
    console.log(inputs);


    await page.waitForTimeout(60000);

}


module.exports = {
    abrirSGS
};