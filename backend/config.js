// ==========================================================
// ARQUIVO DE CONFIGURAÇÃO DO BACKEND
// ==========================================================

// Este arquivo centraliza todas as configurações de automação.

const SGS_CONFIG = {
    // URL base para navegação do Playwright
    URL_BASE: "https://sgo.edp.com.br/SGSIncidentManagement/InformarOcorrencia.aspx",

    // Mapeamento dos textos das labels para os campos do formulário SGS
    LABELS: {
        descricao: "Descrição da ocorrência",
        endereco: "Local da ocorrência",
        cpf: "CPF",
        tipoEvento: "Tipo de Evento",
        categoria: "Categoria de Tipologia da Ocorrência",
        tipoTipologia: "Tipo de Tipologia da Ocorrência",
        machucado: "Alguém poderia ter se machucado?",
    },

    // Seletores CSS para campos que não têm uma label clara
    SELECTORS: {
        acoesImediatas: "#AcoesImediatas",
        tipoOcorrencia: "#TipoOcorrencia",
        segmento: "#Segmento",
        empresaEDP: "#EmpresaEDP",
        tipoEmpresa: "#TipoEmpresa",
        areaObservador: "#AreaObservador",
        localidade: "#Localidade",
        resolvido: "#Resolvido",
        potencialGravidade: "#PotencialGravidade",
        toggleAnonimo: "#RelatoAnonimo",
        toggleNotificado: "#DesejaSerNotificado",
        toggleLocalExterno: "#LocalExterno",
    },
};

module.exports = SGS_CONFIG;