// ============================================
// APP PRINCIPAL - EDP OCORRÊNCIA
// ============================================

class EDPOcorrenciaApp {
  constructor() {
    this.generator = new BookmarkletGenerator(SGS_CONFIG);
    this.currentBookmarklet = '';
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadSavedData();
    this.checkUrlParams();
  }

  bindEvents() {
    // Formulário
    const form = document.getElementById('form-ocorrencia');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    // Botões
    document.getElementById('btn-gerar')?.addEventListener('click', () => this.gerarBookmarklet());
    document.getElementById('btn-abrir-sgs')?.addEventListener('click', () => this.abrirSGS());
    document.getElementById('btn-imprimir')?.addEventListener('click', () => this.imprimirConfirmacao());
    document.getElementById('btn-copiar')?.addEventListener('click', () => this.copiarBookmarklet());
    document.getElementById('btn-compartilhar')?.addEventListener('click', () => this.compartilharWhatsApp());
    document.getElementById('btn-confirmar-sim')?.addEventListener('click', () => this.confirmarEnvio());
    document.getElementById('btn-confirmar-nao')?.addEventListener('click', () => this.voltar());
    document.getElementById('btn-voltar')?.addEventListener('click', () => this.voltar());
    document.getElementById('btn-limpar')?.addEventListener('click', () => this.limpar());

    // Auto-save
    document.getElementById('descricao')?.addEventListener('input', () => this.autoSave());
    document.getElementById('endereco')?.addEventListener('input', () => this.autoSave());
    document.getElementById('cpf')?.addEventListener('input', () => this.autoSave());
    document.querySelectorAll('input[name="machucado"], #tipo-evento, #categoria-tipologia, #tipo-tipologia').forEach((el) => {
      el.addEventListener('change', () => this.autoSave());
    });

    // Geolocalização
    document.getElementById('btn-localizacao')?.addEventListener('click', () => this.obterLocalizacao());
  }

  // ========== FORMULÁRIO ==========

  handleSubmit(e) {
    e.preventDefault();
    this.gerarBookmarklet();
  }

  gerarBookmarklet() {
    const descricao = document.getElementById('descricao').value.trim();
    const endereco = document.getElementById('endereco').value.trim();
    const cpf = document.getElementById('cpf').value.trim();
    const machucado = document.querySelector('input[name="machucado"]:checked')?.value || '';
    const tipoEvento = document.getElementById('tipo-evento').value.trim();
    const categoria = document.getElementById('categoria-tipologia').value.trim();
    const tipoTipologia = document.getElementById('tipo-tipologia').value.trim();

    if (!cpf) {
      this.showToast('⚠️ Preencha o CPF!', 'warning');
      document.getElementById('cpf').focus();
      return;
    }

    if (!descricao) {
      this.showToast('⚠️ Preencha a Descrição!', 'warning');
      document.getElementById('descricao').focus();
      return;
    }

    if (!endereco) {
      this.showToast('⚠️ Preencha o Endereço!', 'warning');
      document.getElementById('endereco').focus();
      return;
    }

    if (!tipoEvento) {
      this.showToast('⚠️ Selecione o Tipo de Evento!', 'warning');
      document.getElementById('tipo-evento').focus();
      return;
    }

    if (!categoria) {
      this.showToast('⚠️ Selecione a categoria da tipologia!', 'warning');
      document.getElementById('categoria-tipologia').focus();
      return;
    }

    if (!tipoTipologia) {
      this.showToast('⚠️ Selecione o tipo de tipologia!', 'warning');
      document.getElementById('tipo-tipologia').focus();
      return;
    }

    if (!machucado) {
      this.showToast('⚠️ Responda se alguém poderia ter se machucado!', 'warning');
      return;
    }

    this.currentBookmarklet = this.generator.generateBookmarklet(descricao, endereco, cpf, machucado, tipoEvento, categoria, tipoTipologia);

    this.showScreen('screen-resultado');

    document.getElementById('res-cpf').textContent = cpf;
    document.getElementById('res-descricao').textContent = descricao;
    document.getElementById('res-endereco').textContent = endereco;
    document.getElementById('res-tipo-evento').textContent = tipoEvento;
    document.getElementById('res-machucado').textContent = machucado;

    this.saveData({ descricao, endereco, cpf, machucado, tipoEvento, categoria, tipoTipologia, timestamp: new Date().toISOString() });

    this.showToast('✅ Link gerado com sucesso!', 'success');
  }

  // ========== AÇÕES ==========

  abrirSGS() {
    if (!this.currentBookmarklet) {
      this.showToast('❌ Gere o link primeiro!', 'warning');
      return;
    }

    window.open(SGS_CONFIG.URL_BASE, '_blank');
    this.copyToClipboard(this.currentBookmarklet);

    this.showToast('📋 Código copiado! Abra o SGS e cole na barra de endereço', 'success');
  }

  confirmarEnvio() {
    if (!this.currentBookmarklet) {
      this.showToast('❌ Gere o link primeiro!', 'warning');
      return;
    }

    this.showToast('✅ Confirmação aceita. Agora abra o SGS e informe manualmente.', 'success');
    this.abrirSGS();
  }

  imprimirConfirmacao() {
    if (!this.currentBookmarklet) {
      this.showToast('❌ Gere o link primeiro!', 'warning');
      return;
    }

    this.showToast('🖨️ Abrindo janela de impressão da confirmação...', 'success');
    window.print();
  }

  copiarBookmarklet() {
    if (!this.currentBookmarklet) {
      this.showToast('❌ Gere o link primeiro!', 'warning');
      return;
    }

    this.copyToClipboard(this.currentBookmarklet);

    const btn = document.getElementById('btn-copiar');
    const originalText = btn.innerHTML;
    btn.innerHTML = '✅ Copiado!';
    btn.style.background = '#00ff88';
    btn.style.color = '#1a1a2e';

    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.style.background = '';
      btn.style.color = '';
    }, 2000);

    this.showToast('📋 Link copiado para a área de transferência!', 'success');
  }

  compartilharWhatsApp() {
    if (!this.currentBookmarklet) {
      this.showToast('❌ Gere o link primeiro!', 'warning');
      return;
    }

    // Gera mensagem para WhatsApp
    const descricao = document.getElementById('descricao').value.trim();
    const endereco = document.getElementById('endereco').value.trim();

    const mensagem = `📋 *Nova Ocorrência - SGS EDP*%0A%0A` +
      `*Descrição:* ${encodeURIComponent(descricao)}%0A` +
      `*Endereço:* ${encodeURIComponent(endereco)}%0A%0A` +
      `🔗 *Link para preencher no SGS:*%0A` +
      `${encodeURIComponent(SGS_CONFIG.URL_BASE)}%0A%0A` +
      `⚡ *Código de automação:*%0A` +
      `(copie e cole na barra de endereço do navegador após abrir o SGS)`;

    const whatsappUrl = `https://wa.me/?text=${mensagem}`;
    window.open(whatsappUrl, '_blank');

    this.showToast('📱 Abrindo WhatsApp...', 'success');
  }

  // ========== UTILIDADES ==========

  copyToClipboard(text) {
    // Método moderno
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).catch(() => this.fallbackCopy(text));
    } else {
      this.fallbackCopy(text);
    }
  }

  fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Falha ao copiar:', err);
    }

    document.body.removeChild(textarea);
  }

  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId)?.classList.add('active');
    window.scrollTo(0, 0);
  }

  voltar() {
    this.showScreen('screen-form');
    document.getElementById('descricao').focus();
  }

  limpar() {
    document.getElementById('descricao').value = '';
    document.getElementById('endereco').value = '';
    document.getElementById('cpf').value = '';
    document.getElementById('tipo-evento').value = '';
    document.getElementById('categoria-tipologia').value = '';
    document.getElementById('tipo-tipologia').value = '';
    document.querySelector('input[name="machucado"][value="Não"]').checked = true;
    localStorage.removeItem('edp_ocorrencia_draft');
    this.showToast('🧹 Formulário limpo!', 'success');
  }

  // ========== GEOLOCALIZAÇÃO ==========

  obterLocalizacao() {
    if (!navigator.geolocation) {
      this.showToast('❌ Geolocalização não suportada', 'warning');
      return;
    }

    const btn = document.getElementById('btn-localizacao');
    btn.innerHTML = '<span class="spinner"></span> Buscando...';
    btn.disabled = true;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const enderecoAtual = document.getElementById('endereco').value.trim();

        // Usa API de geocodificação reversa (opcional)
        this.reverseGeocode(latitude, longitude)
          .then(endereco => {
            if (endereco && !enderecoAtual) {
              document.getElementById('endereco').value = endereco;
            }
          })
          .catch(() => {
            // Fallback: coordenadas
            if (!enderecoAtual) {
              document.getElementById('endereco').value = `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;
            }
          })
          .finally(() => {
            btn.innerHTML = '📍 Usar Localização';
            btn.disabled = false;
            this.showToast('📍 Localização obtida!', 'success');
          });
      },
      (error) => {
        btn.innerHTML = '📍 Usar Localização';
        btn.disabled = false;
        this.showToast('❌ Erro ao obter localização: ' + error.message, 'warning');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  async reverseGeocode(lat, lng) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      return data.display_name || null;
    } catch (e) {
      return null;
    }
  }

  // ========== PERSISTÊNCIA ==========

  autoSave() {
    const data = {
      descricao: document.getElementById('descricao').value,
      endereco: document.getElementById('endereco').value,
      cpf: document.getElementById('cpf').value,
      machucado: document.querySelector('input[name="machucado"]:checked')?.value || '',
      tipoEvento: document.getElementById('tipo-evento').value,
      categoria: document.getElementById('categoria-tipologia').value,
      tipoTipologia: document.getElementById('tipo-tipologia').value,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('edp_ocorrencia_draft', JSON.stringify(data));
  }

  loadSavedData() {
    try {
      const saved = localStorage.getItem('edp_ocorrencia_draft');
      if (saved) {
        const data = JSON.parse(saved);
        document.getElementById('descricao').value = data.descricao || '';
        document.getElementById('endereco').value = data.endereco || '';
        document.getElementById('cpf').value = data.cpf || '';
        document.getElementById('tipo-evento').value = data.tipoEvento || '';
        document.getElementById('categoria-tipologia').value = data.categoria || '';
        document.getElementById('tipo-tipologia').value = data.tipoTipologia || '';

        const machucado = data.machucado || 'Não';
        const radio = document.querySelector(`input[name="machucado"][value="${machucado}"]`);
        if (radio) radio.checked = true;
      }
    } catch (e) {
      console.error('Erro ao carregar dados salvos:', e);
    }
  }

  saveData(data) {
    try {
      const history = JSON.parse(localStorage.getItem('edp_ocorrencia_history') || '[]');
      history.unshift(data);
      if (history.length > 50) history.pop();
      localStorage.setItem('edp_ocorrencia_history', JSON.stringify(history));
    } catch (e) {
      console.error('Erro ao salvar histórico:', e);
    }
  }

  // ========== URL PARAMS ==========

  checkUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const desc = params.get('descricao');
    const end = params.get('endereco');
    const cpf = params.get('cpf');
    const machucado = params.get('machucado');
    const tipoEvento = params.get('tipoEvento');
    const categoria = params.get('categoria');
    const tipoTipologia = params.get('tipoTipologia');

    if (desc) document.getElementById('descricao').value = decodeURIComponent(desc);
    if (end) document.getElementById('endereco').value = decodeURIComponent(end);
    if (cpf) document.getElementById('cpf').value = decodeURIComponent(cpf);
    if (tipoEvento) document.getElementById('tipo-evento').value = decodeURIComponent(tipoEvento);
    if (categoria) document.getElementById('categoria-tipologia').value = decodeURIComponent(categoria);
    if (tipoTipologia) document.getElementById('tipo-tipologia').value = decodeURIComponent(tipoTipologia);
    if (machucado) {
      const radio = document.querySelector(`input[name="machucado"][value="${decodeURIComponent(machucado)}"]`);
      if (radio) radio.checked = true;
    }

    if (desc || end || cpf || machucado || tipoEvento || categoria || tipoTipologia) {
      this.showToast('📋 Dados pré-preenchidos via URL!', 'success');
    }
  }

  // ========== UI ==========

  showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast show';

    if (type === 'warning') {
      toast.style.background = '#ffaa00';
      toast.style.color = '#1a1a2e';
    } else if (type === 'error') {
      toast.style.background = '#e94560';
      toast.style.color = '#fff';
    } else {
      toast.style.background = '#00ff88';
      toast.style.color = '#1a1a2e';
    }

    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
}

// Inicializa quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.app = new EDPOcorrenciaApp();
});