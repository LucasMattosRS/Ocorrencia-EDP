-- Arquivo: backend/db/schema.sql
-- Este script define a estrutura da tabela para armazenar as ocorrências.

CREATE TABLE IF NOT EXISTS ocorrencias (
    id SERIAL PRIMARY KEY,
    matricula_autor VARCHAR(50),
    descricao TEXT NOT NULL,
    endereco TEXT,
    cpf VARCHAR(20),
    empresa VARCHAR(255),
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

-- Garante a coluna 'empresa' em bancos que já existiam antes dela ser adicionada
-- (CREATE TABLE IF NOT EXISTS acima não altera uma tabela que já existe).
ALTER TABLE ocorrencias ADD COLUMN IF NOT EXISTS empresa VARCHAR(255);

-- Função de gatilho (trigger function) para atualizar o campo 'updated_at'.
-- Esta função será executada automaticamente sempre que uma linha for atualizada.
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW(); -- Define o campo 'updated_at' do registro que está sendo atualizado para a hora atual.
   RETURN NEW; -- Retorna o registro modificado para que a operação de UPDATE possa continuar.
END;
$$ language 'plpgsql';

-- Cria o gatilho (trigger) na tabela 'ocorrencias', se ele não existir.
DROP TRIGGER IF EXISTS update_ocorrencias_updated_at ON ocorrencias;
CREATE TRIGGER update_ocorrencias_updated_at
BEFORE UPDATE ON ocorrencias
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
