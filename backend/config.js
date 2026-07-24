// ==========================================================
// ARQUIVO DE CONFIGURAÇÃO DO BACKEND
// ==========================================================

// Este arquivo centraliza todas as configurações de automação.
//
// Os IDs abaixo foram levantados em 2026-07-24 direto do HTML de produção do SGS
// (a tela "Nova Ocorrência" roda em cima da plataforma OutSystems, que gera esses IDs
// automaticamente). Se a EDP redeployar a tela com alguma mudança estrutural, esses IDs
// podem mudar de novo e precisam ser relevantados.

const SGS_CONFIG = {
    // URL base para navegação do Playwright
    URL_BASE: "https://sgo.edp.com.br/SGSIncidentManagement/InformarOcorrencia.aspx",

    // Valores fixos que a automação sempre seleciona, iguais pra toda ocorrência.
    FIXED_VALUES: {
        tipoOcorrencia: "Relato de Ocorrência",
        segmento: "Networks",
        empresaEDP: "EDP SP DISTRIB DE ENERGIA",
        tipoEmpresa: "Contratada",
        areaObservador: "-Prj e Construção SP",
        localidade: "12 - Sede São José dos Campos - EDP SP",
        resolvido: "Sim",
        potencialGravidade: "PG1-Baixo",
    },

    // IDs reais dos campos no HTML da página (não são mais texto de label — o formulário
    // atual usa dropdowns customizados via Select2, então precisamos manipular o <select>
    // escondido por trás pelo id).
    IDS: {
        // Campos que a pessoa preenche no app
        descricao: "wtOccurrence_SGSTUITemplate_wt342_block_wtMainContent_wtOccurrence_Description",
        cpf: "wtOccurrence_SGSTUITemplate_wt342_block_wtMainContent_WebPatterns_wt114_block_wtColumn2_wtOccurrence_CPF",
        // "Empresa" (qual contratada) — obrigatório no site, mas a lista de opções parece
        // depender da sessão de quem está logado (ficou vazia mesmo sem login válido nos
        // testes). A pessoa digita o nome como aparece no SGS; a automação tenta casar com
        // uma opção existente e só avisa (não trava o resto) se não achar.
        empresa: "wtOccurrence_SGSTUITemplate_wt342_block_wtMainContent_WebPatterns_wt195_block_wtColumn2_wtOccurrence_CompanyId",
        endereco: "wtOccurrence_SGSTUITemplate_wt342_block_wtMainContent_WebPatterns_wt266_block_wtColumn2_wtOccurrence_LocationAddress",
        acoesImediatas: "wtOccurrence_SGSTUITemplate_wt342_block_wtMainContent_wtOccurrence_Actions",
        latitude: "wtOccurrence_SGSTUITemplate_wt342_block_wtMainContent_WebPatterns_wt266_block_wtColumn1_wtInputLatitude",
        longitude: "wtOccurrence_SGSTUITemplate_wt342_block_wtMainContent_WebPatterns_wt266_block_wtColumn2_wtInputLongitude",
        machucado: "wtOccurrence_SGSTUITemplate_wt342_block_wtMainContent_WebPatterns_wt192_block_wtColumn1_wtOccurrence_SeverityPotentialId2",
        tipoEvento: "wtOccurrence_SGSTUITemplate_wt342_block_wtMainContent_WebPatterns_wt192_block_wtColumn1_wtOccurrence_EnventTypeId",
        categoria: "wtOccurrence_SGSTUITemplate_wt342_block_wtMainContent_WebPatterns_wt192_block_wtColumn1_wtOccurrence_OccurrenceTopologyCategoryId",
        tipoTipologia: "wtOccurrence_SGSTUITemplate_wt342_block_wtMainContent_WebPatterns_wt192_block_wtColumn2_wtOccurrence_OccurrenceTopologyTypeId",

        // "Local Externo" precisa ser marcado pra revelar o campo de Endereço acima.
        localExterno: "wtOccurrence_SGSTUITemplate_wt342_block_wtMainContent_WebPatterns_wt266_block_wtColumn2_WebPatterns_wt118_block_wtCheckbox_wtOccurrence_isExternalLocation",

        // Campos fixos/automáticos (valores em FIXED_VALUES acima)
        tipoOcorrencia: "wtOccurrence_SGSTUITemplate_wt342_block_wtMainContent_WebPatterns_wt227_block_wtColumn1_wtOccurrence_IncidentTypeId2",
        segmento: "wtOccurrence_SGSTUITemplate_wt342_block_wtMainContent_WebPatterns_wt168_block_wtColumn1_wtInspection_BusinessSegmentId",
        empresaEDP: "wtOccurrence_SGSTUITemplate_wt342_block_wtMainContent_WebPatterns_wt168_block_wtColumn2_wtOccurrence_CompanyInternalId",
        tipoEmpresa: "wtOccurrence_SGSTUITemplate_wt342_block_wtMainContent_WebPatterns_wt195_block_wtColumn1_wtOccurrence_CompanyTypeId",
        areaObservador: "wtOccurrence_SGSTUITemplate_wt342_block_wtMainContent_WebPatterns_wt195_block_wtColumn2_wtOccurrence_OrganizationUnitId",
        // Localidade só ganha as opções reais depois que Área do observador é selecionada (cascata).
        localidade: "wtOccurrence_SGSTUITemplate_wt342_block_wtMainContent_WebPatterns_wt266_block_wtColumn1_wtOccurrence_LocationId",
        resolvido: "wtOccurrence_SGSTUITemplate_wt342_block_wtMainContent_WebPatterns_wt266_block_wtColumn1_wtOccurrence_WasResolved",
        potencialGravidade: "wtOccurrence_SGSTUITemplate_wt342_block_wtMainContent_WebPatterns_wt192_block_wtColumn2_wtOccurrence_SeverityPotentialId",
    },
};

module.exports = SGS_CONFIG;
