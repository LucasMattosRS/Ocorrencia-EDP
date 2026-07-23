const express = require("express");
const cors = require("cors");

const ocorrenciaRouter = require("./routes/ocorrencia");
const authRouter = require("./routes/auth");


const app = express();


app.use(cors());
app.use(express.json());


// rota de validação de login SGS
app.use("/auth", authRouter);

// rota da ocorrência
app.use("/ocorrencia", ocorrenciaRouter);


app.get("/", (req,res)=>{
    res.json({
        status:"API EDP funcionando"
    });
});

const port = process.env.PORT || 3001;
app.listen(port,()=>{
    console.log(`Servidor rodando na porta ${port}`);
});