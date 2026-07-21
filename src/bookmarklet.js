// ============================================
// BOOKMARKLET GENERATOR - EDP OCORRÊNCIA
// ============================================

class BookmarkletGenerator {
  constructor(config) {
    this.config = config;
  }

  generateBookmarklet(descricao, endereco, cpf = '', respostaMachucado = '', tipoEvento = '', categoria = '', tipoTipologia = '') {
    const data = {
      descricao: this.escapeJS(descricao),
      endereco: this.escapeJS(endereco),
      cpf: this.escapeJS(cpf),
      respostaMachucado: this.escapeJS(respostaMachucado),
      tipoEvento: this.escapeJS(tipoEvento),
      categoria: this.escapeJS(categoria),
      tipoTipologia: this.escapeJS(tipoTipologia),
      ...this.config.DROPDOWNS
    };

    const code = `
(function(){
  const D = ${JSON.stringify(data)};
  const T = ${JSON.stringify(this.config.TOGGLES)};

  function log(message){ console.log('[SGS Auto] ' + message); }

  function normalizeText(value){
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  function setValueByLabel(label, value){
    if (!value) return false;
    const labels = Array.from(document.querySelectorAll('label,span,th,td,div'));
    const normalizedLabel = normalizeText(label);
    const normalizedValue = normalizeText(value);

    for (const node of labels) {
      const text = normalizeText(node.textContent || '');
      if (!text.includes(normalizedLabel)) continue;

      const container = node.closest('tr, .form-group, .field, [class*="row"], div');
      if (!container) continue;

      const select = container.querySelector('select');
      if (select) {
        const options = Array.from(select.options);
        const target = options.find((opt) => normalizeText(opt.textContent || '') === normalizedValue);
        if (target) {
          select.value = target.value || target.textContent;
          select.dispatchEvent(new Event('change', { bubbles: true }));
          log('✓ ' + label + ' = ' + value);
          return true;
        }
      }

      const input = container.querySelector('input[type="text"], input[type="search"], textarea');
      if (input) {
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        log('✓ ' + label + ' preenchido');
        return true;
      }
    }

    log('✗ ' + label + ' não encontrado');
    return false;
  }

  function setRadioByLabel(label, value){
    if (!value) return false;
    const labels = Array.from(document.querySelectorAll('label, span'));
    for (const node of labels) {
      const text = (node.textContent || '').trim();
      if (!text.includes(label)) continue;

      const parent = node.closest('label, div, tr, td');
      if (!parent) continue;

      const radios = Array.from(parent.querySelectorAll('input[type="radio"]'));
      for (const radio of radios) {
        const itemText = (radio.nextElementSibling?.textContent || radio.parentElement?.textContent || '').trim();
        if (itemText === value || String(value).toLowerCase() === String(itemText).toLowerCase()) {
          radio.checked = true;
          radio.dispatchEvent(new Event('click', { bubbles: true }));
          radio.dispatchEvent(new Event('change', { bubbles: true }));
          log('✓ ' + label + ' = ' + value);
          return true;
        }
      }
    }
    log('✗ ' + label + ' não encontrado');
    return false;
  }

  function setCheckboxByLabel(label, checked){
    const labels = Array.from(document.querySelectorAll('label, span'));
    for (const node of labels) {
      const text = (node.textContent || '').trim();
      if (!text.includes(label)) continue;

      const input = node.parentElement?.querySelector('input[type="checkbox"]') || node.querySelector('input[type="checkbox"]');
      if (input) {
        if (input.checked !== checked) {
          input.click();
        }
        log('✓ ' + label + ' = ' + (checked ? 'ON' : 'OFF'));
        return true;
      }
    }
    return false;
  }

  const hasCpf = !!D.cpf;
  const hasMachucado = !!D.respostaMachucado;

  setCheckboxByLabel('Relato Anônimo', T.relatoAnonimo);
  setCheckboxByLabel('Deseja ser notificado', T.desejaNotificado);
  setCheckboxByLabel('Local Externo', T.localExterno);

  setValueByLabel('Tipo de Ocorrência', D.tipoOcorrencia);
  setValueByLabel('Tipo de Evento', D.tipoEvento);
  setValueByLabel('Segmento', D.segmento);
  setValueByLabel('Empresa EDP', D.empresaEDP);
  setValueByLabel('Tipo de Empresa', D.tipoEmpresa);
  setValueByLabel('Área do observador', D.areaObservador);
  setValueByLabel('Localidade da ocorrência', D.localidade);
  setValueByLabel('A situação foi resolvida', D.resolvido);
  setValueByLabel('Potencial de Gravidade', D.potencialGravidade);
  setValueByLabel('Categoria de Tipologia da Ocorrência', D.categoria);
  setValueByLabel('Tipo de Tipologia da Ocorrência', D.tipoTipologia);

  if (hasCpf) {
    setValueByLabel('CPF', D.cpf);
  }

  if (hasMachucado) {
    setRadioByLabel('Alguém poderia ter se machucado', D.respostaMachucado);
  }

  setValueByLabel('Descrição', D.descricao);
  setValueByLabel('Endereço', D.endereco);

  setTimeout(function(){
    const desc = document.querySelector('textarea');
    const end = document.querySelector('input[name*="Endereco"], input[id*="Endereco"]');
    if (desc) desc.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (end) end.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 400);

  log('Concluído!');
})();
`;

    return 'javascript:' + encodeURIComponent(code.replace(/\s+/g, ' ').trim());
  }

  escapeJS(value) {
    return String(value || '')
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r');
  }
}

if (typeof window !== 'undefined') {
  window.BookmarkletGenerator = BookmarkletGenerator;
}
