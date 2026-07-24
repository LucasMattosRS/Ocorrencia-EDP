const express = require("express");
const cors = require("cors");

const ocorrenciaRouter = require("./routes/ocorrencia");
const authRouter = require("./routes/auth");
const { runMigration } = require("./db/migrate");


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

// Garante que a tabela existe a cada subida do servidor — seguro de rodar sempre porque
// schema.sql usa CREATE TABLE/ADD COLUMN IF NOT EXISTS (nunca apaga ou duplica nada). Não
// derruba o servidor se falhar (ex: banco momentaneamente fora do ar); só loga o erro.
runMigration().catch((error) => {
    console.error("❌ Falha ao rodar a migração do banco na subida do servidor:", error.message);
});