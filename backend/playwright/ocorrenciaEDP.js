const SGS_CONFIG = require("../config");

// ============================================
// Funções Auxiliares (inspiradas no bookmarklet.js)
// ============================================

/**
 * Normaliza o texto para facilitar a comparação, removendo acentos e caracteres especiais.
 * @param {string} value O texto a ser normalizado.
 * @returns {string} O texto normalizado.
 */
function normalizeText(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
}
  
/**
 * Encontra um campo (select, input, textarea) com base no texto de sua label associada e define seu valor.
 * @param {import('playwright').Page} page A instância da página do Playwright.
 * @param {string} label O texto da label a ser procurada.
 * @param {string} value O valor a ser inserido no campo.
 */
async function setValueByLabel(page, label, value) {
    if (!value) return;
    try {
        const fieldLocator = page.locator('*:visible', { has: page.locator(`text=${label}`) }).last();
        const container = fieldLocator.locator('xpath=ancestor::*[self::tr or self::div[contains(@class, "field")] or self::div[contains(@class, "row")]][1]');

        // Tenta encontrar um select
        const select = container.locator('select');
        if (await select.count() > 0) {
            await select.selectOption({ label: value });
            console.log(`✓ (Select) ${label} = ${value}`);
            return;
        }

        // Tenta encontrar um input de texto ou textarea
        const input = container.locator('input[type="text"], input[type="search"], textarea');
        if (await input.count() > 0) {
            await input.fill(value);
            console.log(`✓ (Input) ${label} = ${value}`);
            return;
        }

        console.log(`✗ Campo para "${label}" não encontrado no container.`);
    } catch (e) {
        console.log(`✗ Erro ao tentar preencher "${label}":`, e.message);
    }
}

/**
 * Encontra um grupo de radio buttons com base na label da pergunta e seleciona a opção correta.
 * @param {import('playwright').Page} page A instância da página do Playwright.
 * @param {string} label O texto da pergunta associada aos radio buttons.
 * @param {string} value O texto da opção de rádio a ser selecionada.
 */
async function setRadioByLabel(page, label, value) {
    if (!value) return;
    try {
        const radioGroupLocator = page.locator('*:visible', { has: page.locator(`text=${label}`) }).last();
        // Seleciona a opção de rádio pelo texto do seu label
        await radioGroupLocator.locator('label', { hasText: value }).click();
        console.log(`✓ (Radio) ${label} = ${value}`);
    } catch (e) {
        console.log(`✗ Erro ao tentar selecionar radio para "${label}" com valor "${value}":`, e.message);
    }
}


/**
 * Função principal que orquestra o preenchimento do formulário.
 * @param {import('playwright').Page} page - A instância da página do Playwright, já logada.
 * @param {object} ocorrencia - O objeto contendo os dados da ocorrência.
 */
async function preencherOcorrenciaEDP(page, ocorrencia) {
    console.log("Iniciando preenchimento do formulário de ocorrência...");

    try {
        await page.goto(SGS_CONFIG.URL_BASE);
        console.log(`Navegou para: ${SGS_CONFIG.URL_BASE}`);

        // 1. Preencher campos com base nos dados do formulário do usuário
        await setValueByLabel(page, SGS_CONFIG.LABELS.descricao, ocorrencia.descricao);
        await setValueByLabel(page, SGS_CONFIG.LABELS.endereco, ocorrencia.endereco);
        await setValueByLabel(page, SGS_CONFIG.LABELS.cpf, ocorrencia.cpf);
        await setValueByLabel(page, SGS_CONFIG.LABELS.tipoEvento, ocorrencia.tipoEvento);
        await setValueByLabel(page, SGS_CONFIG.LABELS.categoria, ocorrencia.categoria);
        await setValueByLabel(page, SGS_CONFIG.LABELS.tipoTipologia, ocorrencia.tipoTipologia);
        await setRadioByLabel(page, SGS_CONFIG.LABELS.machucado, ocorrencia.machucado);
        
        // Preenche Ações Imediatas se houver
        if (ocorrencia.acoesImediatas) {
            await page.fill(SGS_CONFIG.SELECTORS.acoesImediatas, ocorrencia.acoesImediatas);
            console.log("Preencheu: Ações Imediatas");
        }
        
        // 2. Preencher dropdowns com valores FIXOS para garantir consistência
        await page.selectOption(SGS_CONFIG.SELECTORS.tipoOcorrencia, { label: 'Relato de Ocorrência' });
        await page.selectOption(SGS_CONFIG.SELECTORS.segmento, { label: 'Networks' });
        await page.selectOption(SGS_CONFIG.SELECTORS.empresaEDP, { label: 'EDP SP DISTRIB DE ENERGIA' });
        await page.selectOption(SGS_CONFIG.SELECTORS.tipoEmpresa, { label: 'Contratada' });
        await page.selectOption(SGS_CONFIG.SELECTORS.areaObservador, { label: 'Prj e Construção SP' });
        await page.selectOption(SGS_CONFIG.SELECTORS.localidade, { label: '12 - Sede São José dos Campos' });
        await page.selectOption(SGS_CONFIG.SELECTORS.resolvido, { label: 'Sim' });
        await page.selectOption(SGS_CONFIG.SELECTORS.potencialGravidade, { label: 'PG1-Baixo' });
        console.log("Preencheu todos os Dropdowns fixos.");

        console.log("Formulário preenchido com sucesso.");

    } catch (error) {
        console.error("Erro ao preencher o formulário de ocorrência:", error);
        // Tira um screenshot para ajudar a depurar o erro
        await page.screenshot({ path: 'error_screenshot.png' });
        console.log('Screenshot de erro salvo em error_screenshot.png');
        throw new Error("Falha no preenchimento do formulário via Playwright.");
    }
}

module.exports = {
    preencherOcorrenciaEDP
};
