-- Arquivo: backend/db/schema.sql
-- Este script define a estrutura da tabela para armazenar as ocorrências.

CREATE TABLE ocorrencias (
    id SERIAL PRIMARY KEY,
    matricula_autor VARCHAR(50),
    descricao TEXT NOT NULL,
    endereco TEXT,
    cpf VARCHAR(20),
    acoes_imediatas TEXT,
    machucado VARCHAR(10),
    tipo_evento VARCHAR(100),
    categoria VARCHAR(100),
    tipo_tipologia VARCHAR(100),
    latitude VARCHAR(50),
    longitude VARCHAR(50),
    status VARCHAR(20) DEFAULT 'iniciado', -- 'iniciado', 'concluido', 'falha'
    erro_mensagem TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);