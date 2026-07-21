const express = require("express");
const router = express.Router();

const { loginEDP } = require("../playwright/loginEDP");


router.post("/", async (req, res) => {

    try {

        const {
            matricula,
            senha,
            ocorrencia
        } = req.body;


        console.log("Recebido:");
        console.log(ocorrencia);


        await loginEDP(
            matricula,
            senha
        );


        res.json({
            sucesso:true,
            mensagem:"Automação iniciada"
        });


    } catch(error){

        console.error(error);


        res.status(500).json({
            sucesso:false,
            erro:error.message
        });

    }

});


module.exports = router;