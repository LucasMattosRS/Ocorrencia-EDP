const { chromium } = require("playwright");

async function loginEDP(matricula, senha){
    const browser = await chromium.launch({
        headless: true
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


    await page.waitForTimeout(5000);


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