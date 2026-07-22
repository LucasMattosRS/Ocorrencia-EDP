// Use 'node-fetch' para compatibilidade com versões mais antigas do Node.
// Se você não tiver, instale com: npm install node-fetch
const fetch = require('node-fetch');
require('dotenv').config(); // Carrega as variáveis do arquivo .env

// ==========================================================
// DADOS DE TESTE - Altere aqui para testar
// ==========================================================

// As credenciais agora são carregadas de forma segura do arquivo .env
const MATRICULA = process.env.TEST_MATRICULA;
const SENHA = process.env.TEST_SENHA;

// Dados de exemplo para a ocorrência
const DADOS_OCORRENCIA = {
  descricao: "Teste de automação - Descrição detalhada do evento ocorrido.",
  endereco: "Rua de Teste, 123, Bairro Exemplo, São Paulo, SP",
  cpf: "123.456.789-00",
  acoesImediatas: "Nenhuma ação imediata foi necessária.",
  machucado: "Não", // Opções: "Sim" ou "Não"
  tipoEvento: "Condição Insegura", // Opções do seu formulário
  categoria: "Acidentes", // Opções do seu formulário
  tipoTipologia: "Eletricidade", // Opções do seu formulário
  latitude: "-23.550520",
  longitude: "-46.633308"
};

// URL do seu backend local
const API_URL = 'http://localhost:3001/ocorrencia';

/**
 * Função principal que executa o teste.
 */
async function executarTeste() {
  console.log("🚀 Iniciando teste de automação...");

  if (!MATRICULA || !SENHA || MATRICULA === "SUA_MATRICULA_AQUI") {
    console.error("❌ ERRO: Por favor, configure as variáveis TEST_MATRICULA e TEST_SENHA no seu arquivo .env antes de rodar o teste.");
    return;
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        matricula: MATRICULA,
        senha: SENHA,
        ocorrencia: DADOS_OCORRENCIA,
      }),
    });

    console.log(`Status da Resposta: ${response.status}`);
    const result = await response.json();

    if (!response.ok || !result.sucesso) {
      throw new Error(result.erro || `Erro desconhecido com status ${response.status}`);
    }

    console.log("✅ Teste concluído com sucesso!");
    console.log("Mensagem do servidor:", result.mensagem);

  } catch (error) {
    console.error("🔥 Falha no teste de automação:");
    console.error(error.message);
  }
}

// Executa a função de teste
executarTeste();
