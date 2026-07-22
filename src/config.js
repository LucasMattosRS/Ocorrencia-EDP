// ============================================
// CONFIGURAÇÕES FIXAS DO SGS - EDP
// ============================================

const SGS_CONFIG = {
  // URL do sistema
  URL_BASE: 'https://sgo.edp.com.br/SGSIncidentManagement/InformarOcorrencia.aspx',
  
  // Campos fixos (dropdowns)
  DROPDOWNS: {
    tipoOcorrencia: 'Relato de Ocorrência',
    segmento: 'Networks',
    empresaEDP: 'EDP SP DISTRIB DE ENERGIA',
    tipoEmpresa: 'Contratada',
    areaObservador: 'Prj e Construção SP',
    localidade: '12 - Sede São José dos Campos - EDP SP',
    resolvido: 'Sim',
    potencialGravidade: 'PG1-Baixo'
  },
  
  // Toggles (true = ligado, false = desligado)
  TOGGLES: {
    relatoAnonimo: false,
    desejaNotificado: false,
    localExterno: true
  },
  
  // Seletores CSS dos elementos (AJUSTAR conforme HTML real do SGS)
  // Para descobrir: abra o SGS no Chrome, F12, inspecione cada elemento
  SELECTORS: {
    // Dropdowns Fixos
    tipoOcorrencia: 'select[name*="TipoOcorrencia"], select[id*="TipoOcorrencia"]',
    segmento: 'select[name*="Segmento"], select[id*="Segmento"]',
    empresaEDP: 'select[name*="EmpresaEDP"], select[id*="EmpresaEDP"]',
    tipoEmpresa: 'select[name*="TipoEmpresa"], select[id*="TipoEmpresa"]',
    areaObservador: 'select[name*="AreaObservador"], select[id*="AreaObservador"]',
    localidade: 'select[name*="Localidade"], select[id*="Localidade"]',
    resolvido: 'select[name*="Resolvido"], select[id*="Resolvido"]',
    potencialGravidade: 'select[name*="Gravidade"], select[id*="Gravidade"]',

    // Campos de texto
    descricao: 'textarea[name*="Descricao"], textarea[id*="Descricao"], #txtDescricao',
    endereco: 'input[name*="Endereco"], input[id*="Endereco"], #txtEndereco',
    cpf: 'input[name*="CPF"], input[id*="CPF"]', // Adicionado
    latitude: 'input[name*="Latitude"], input[id*="Latitude"]',
    longitude: 'input[name*="Longitude"], input[id*="Longitude"]',
    acoesImediatas: 'textarea[name*="Acoes"], textarea[id*="Acoes"]',

    // Toggles
    toggleAnonimo: 'input[type="checkbox"][name*="Anonimo"]',
    toggleNotificado: 'input[type="checkbox"][name*="Notificado"]',
    toggleLocalExterno: 'input[type="checkbox"][name*="Externo"]',

    // Botão enviar
    btnEnviar: 'input[type="submit"], button[type="submit"], #btnInformar, .btn-informar'
  },
  
  // Textos e labels para busca de campos dinâmicos
  LABELS: {
    // Labels para campos fixos (se necessário como fallback)
    tipoOcorrencia: 'Tipo de Ocorrência',
    segmento: 'Segmento',
    empresaEDP: 'Empresa EDP',
    tipoEmpresa: 'Tipo de Empresa',
    areaObservador: 'Área do observador',
    localidade: 'Localidade da ocorrência',
    resolvido: 'A situação foi resolvida',
    potencialGravidade: 'Potencial de Gravidade',

    // Labels para campos do formulário do usuário
    descricao: 'Descrição',
    endereco: 'Endereço',
    cpf: 'CPF',
    tipoEvento: 'Tipo de Evento',
    categoria: 'Categoria de Tipologia da Ocorrência',
    tipoTipologia: 'Tipo de Tipologia da Ocorrência',
    machucado: 'Alguém poderia ter se machucado'
  }
};

// Exporta para uso nos outros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SGS_CONFIG;
}