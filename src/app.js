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
    document.getElementById('btn-copiar')?.addEventListener('click', () => this.copiarBookmarklet());
    document.getElementById('btn-compartilhar')?.addEventListener('click', () => this.compartilharWhatsApp());
    document.getElementById('btn-voltar')?.addEventListener('click', () => this.voltar());
    document.getElementById('btn-limpar')?.addEventListener('click', () => this.limpar());

    // Auto-save
    document.getElementById('descricao')?.addEventListener('input', () => this.autoSave());
    document.getElementById('endereco')?.addEventListener('input', () => this.autoSave());

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

    // Validação
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

    // Gera o bookmarklet
    this.currentBookmarklet = this.generator.generateBookmarklet(descricao, endereco);

    // Mostra resultado
    this.showScreen('screen-resultado');

    // Preenche dados na tela de resultado
    document.getElementById('res-descricao').textContent = descricao;
    document.getElementById('res-endereco').textContent = endereco;

    // Salva no localStorage
    this.saveData({ descricao, endereco, timestamp: new Date().toISOString() });

    this.showToast('✅ Link gerado com sucesso!', 'success');
  }

  // ========== AÇÕES ==========

  abrirSGS() {
    if (!this.currentBookmarklet) {
      this.showToast('❌ Gere o link primeiro!', 'warning');
      return;
    }

    // Abre o SGS em nova aba
    window.open(SGS_CONFIG.URL_BASE, '_blank');

    // Copia o bookmarklet para clipboard
    this.copyToClipboard(this.currentBookmarklet);

    this.showToast('📋 Código copiado! Cole na barra de endereço do SGS', 'success');
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

    if (desc) document.getElementById('descricao').value = decodeURIComponent(desc);
    if (end) document.getElementById('endereco').value = decodeURIComponent(end);

    if (desc || end) {
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