const SGS_CONFIG = require("../config");

// ============================================
// Funções Auxiliares
// ============================================
//
// O formulário atual do SGS usa dropdowns customizados (Select2) por cima de <select>
// escondidos — por isso setamos o valor direto no DOM e disparamos 'change', em vez de
// tentar clicar na parte visual (é assim que o próprio Select2 espera ser atualizado
// programaticamente, e é o mesmo evento que ele escuta quando um usuário interage de verdade).

async function setText(page, id, value) {
    if (!value) return;
    try {
        await page.fill(`#${id}`, String(value));
        console.log(`✓ (Texto) ${id}`);
    } catch (e) {
        console.log(`✗ Erro ao preencher texto "${id}":`, e.message);
    }
}

// O campo de CPF tem uma máscara de digitação (___.___.___-__) que só reage a eventos de
// teclado de verdade — page.fill() seta o value direto e a máscara não reconhece, ficando
// vazia. page.type() simula a digitação caractere por caractere e funciona com a máscara.
async function setTextTyped(page, id, value) {
    if (!value) return;
    try {
        await page.click(`#${id}`);
        await page.keyboard.press("Control+A");
        await page.keyboard.press("Delete");
        await page.type(`#${id}`, String(value), { delay: 30 });
        console.log(`✓ (Texto digitado) ${id}`);
    } catch (e) {
        console.log(`✗ Erro ao digitar em "${id}":`, e.message);
    }
}

async function setSelectByLabel(page, id, label) {
    if (!label) return;
    const result = await page.evaluate(({ id, label }) => {
        const el = document.getElementById(id);
        if (!el) return "no-element";
        const opt = Array.from(el.options).find((o) => o.text.trim() === label);
        if (!opt) return "no-option";
        el.value = opt.value;
        el.dispatchEvent(new Event("change", { bubbles: true }));
        el.dispatchEvent(new Event("input", { bubbles: true }));
        return "ok";
    }, { id, label });

    if (result === "ok") {
        console.log(`✓ (Select) ${id} = "${label}"`);
    } else {
        console.log(`✗ Falhou "${label}" em "${id}": ${result}`);
    }
}

async function setCheckbox(page, id, checked) {
    await page.evaluate(({ id, checked }) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.checked = checked;
        el.dispatchEvent(new Event("click", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
    }, { id, checked });
}

// Espera a lista de opções de um <select> em cascata (ex: Empresa EDP, Localidade, Tipo de
// Tipologia) ser atualizada pelo servidor depois que o campo do qual ele depende foi
// selecionado. Alguns desses campos já nascem com uma lista padrão (não vazia), então em vez
// de só checar "tem mais de 1 opção", compara a assinatura da lista antes/depois e espera
// ela mudar de verdade.
async function waitForCascade(page, id, timeout = 10000) {
    const before = await page.evaluate((fieldId) => {
        const el = document.getElementById(fieldId);
        return el ? Array.from(el.options).map((o) => o.value).join("|") : null;
    }, id);

    try {
        await page.waitForFunction(
            ({ fieldId, before }) => {
                const el = document.getElementById(fieldId);
                if (!el) return false;
                const now = Array.from(el.options).map((o) => o.value).join("|");
                return now !== before && el.options.length > 1;
            },
            { fieldId: id, before },
            { timeout }
        );
    } catch (e) {
        console.log(`⚠ Cascata de "${id}" não mudou dentro do timeout — seguindo assim mesmo.`);
    }
}

/**
 * Função principal que orquestra o preenchimento do formulário.
 * @param {import('playwright').Page} page - A instância da página do Playwright, já logada.
 * @param {object} ocorrencia - O objeto contendo os dados da ocorrência.
 */
async function preencherOcorrenciaEDP(page, ocorrencia) {
    const { IDS, FIXED_VALUES } = SGS_CONFIG;
    console.log("Iniciando preenchimento do formulário de ocorrência...");

    try {
        await page.goto(SGS_CONFIG.URL_BASE, { waitUntil: "domcontentloaded" });
        await page.waitForSelector(`#${IDS.descricao}`, { timeout: 20000 });
        console.log(`Navegou para: ${SGS_CONFIG.URL_BASE}`);

        // "Local Externo" precisa ser marcado ANTES — é o que revela o campo de Endereço.
        await setCheckbox(page, IDS.localExterno, true);
        await page.waitForTimeout(800);

        // 1. Campos escolhidos pela pessoa no app
        await setText(page, IDS.descricao, ocorrencia.descricao);
        await setTextTyped(page, IDS.cpf, ocorrencia.cpf);
        await setText(page, IDS.endereco, ocorrencia.endereco);
        await setText(page, IDS.acoesImediatas, ocorrencia.acoesImediatas);
        await setText(page, IDS.latitude, ocorrencia.latitude);
        await setText(page, IDS.longitude, ocorrencia.longitude);
        await setSelectByLabel(page, IDS.tipoEvento, ocorrencia.tipoEvento);
        await setSelectByLabel(page, IDS.machucado, ocorrencia.machucado);

        // Categoria de Tipologia -> Tipo de Tipologia também é cascata (a lista de Tipo de
        // Tipologia só chega do servidor depois da Categoria ser selecionada).
        await setSelectByLabel(page, IDS.categoria, ocorrencia.categoria);
        if (ocorrencia.categoria) {
            await waitForCascade(page, IDS.tipoTipologia);
        }
        await setSelectByLabel(page, IDS.tipoTipologia, ocorrencia.tipoTipologia);
        console.log("Preencheu os campos escolhidos pela pessoa.");

        // 2. Campos fixos/automáticos (sem dependência entre si)
        await setSelectByLabel(page, IDS.tipoOcorrencia, FIXED_VALUES.tipoOcorrencia);
        await setSelectByLabel(page, IDS.tipoEmpresa, FIXED_VALUES.tipoEmpresa);
        await setSelectByLabel(page, IDS.resolvido, FIXED_VALUES.resolvido);
        await setSelectByLabel(page, IDS.potencialGravidade, FIXED_VALUES.potencialGravidade);

        // Segmento -> Empresa EDP: a lista de Empresa só chega do servidor depois do Segmento.
        await setSelectByLabel(page, IDS.segmento, FIXED_VALUES.segmento);
        await waitForCascade(page, IDS.empresaEDP);
        await setSelectByLabel(page, IDS.empresaEDP, FIXED_VALUES.empresaEDP);

        // Área do observador -> Localidade: mesma lógica de cascata.
        await setSelectByLabel(page, IDS.areaObservador, FIXED_VALUES.areaObservador);
        await waitForCascade(page, IDS.localidade);
        await setSelectByLabel(page, IDS.localidade, FIXED_VALUES.localidade);

        // "Empresa" (qual contratada, escolhida pela pessoa) — tentamos por último, depois de
        // todos os outros campos fixos estarem selecionados, caso a lista dependa de mais de
        // um campo. Não é fatal se não achar a opção: em testes sem login válido essa lista
        // fica vazia (provavelmente depende da sessão autenticada), então só avisamos e
        // seguimos em frente em vez de travar o resto do preenchimento.
        if (ocorrencia.empresa) {
            await waitForCascade(page, IDS.empresa);
            await setSelectByLabel(page, IDS.empresa, ocorrencia.empresa);
        }

        console.log("Preencheu todos os Dropdowns fixos.");
        console.log("Formulário preenchido com sucesso.");
    } catch (error) {
        console.error("Erro ao preencher o formulário de ocorrência:", error);
        // Tira um screenshot para ajudar a depurar o erro
        try {
            await page.screenshot({ path: "error_screenshot.png" });
            console.log("Screenshot de erro salvo em error_screenshot.png");
        } catch (_) {
            // ignora falha ao tirar screenshot
        }
        throw new Error("Falha no preenchimento do formulário via Playwright: " + error.message);
    }
}

module.exports = {
    preencherOcorrenciaEDP
};
