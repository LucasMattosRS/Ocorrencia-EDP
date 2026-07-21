const express = require("express");
const cors = require("cors");

const ocorrenciaRouter = require("./routes/ocorrencia");


const app = express();


app.use(cors());
app.use(express.json());


// rota da ocorrência
app.use("/ocorrencia", ocorrenciaRouter);


app.get("/", (req,res)=>{

    res.json({
        status:"API EDP funcionando"
    });

});


app.listen(3001,()=>{

    console.log(
        "Servidor rodando na porta 3001"
    );

});