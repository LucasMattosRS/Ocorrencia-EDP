// ============================================
// APP PRINCIPAL - EDP OCORRÊNCIA
// ============================================

class EDPOcorrenciaApp {

  constructor() {
    this.loginEDP = {
      matricula: "",
      senha: ""
    };
    // Removido: generator e currentBookmarklet, não são mais necessários.
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadSavedData();
    this.checkUrlParams();
  }

  bindEvents() {
    document.getElementById('btn-login')?.addEventListener('click', () => this.loginSistema());

    const form = document.getElementById('form-ocorrencia');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    // O botão 'btn-gerar' agora dispara a automação diretamente.
    document.getElementById('btn-gerar')?.addEventListener('click', () => this.iniciarAutomacao());

    // Listener de eventos para botões antigos (abrir-sgs, copiar) foram removidos.
    document.getElementById('btn-imprimir')?.addEventListener('click', () => this.imprimirConfirmacao());
    document.getElementById('btn-compartilhar')?.addEventListener('click', () => this.compartilharWhatsApp());
    document.getElementById('btn-voltar')?.addEventListener('click', () => this.voltar());
    document.getElementById('btn-limpar')?.addEventListener('click', () => this.limpar());

    document.querySelectorAll('#descricao, #cpf, #endereco, #acoes-imediatas').forEach(el => {
      el.addEventListener('input', () => this.autoSave());
    });

    document.querySelectorAll('input[name="machucado"], #tipo-evento, #categoria-tipologia, #tipo-tipologia').forEach(el => {
      el.addEventListener('change', () => this.autoSave());
    });

    document.getElementById('btn-localizacao')?.addEventListener('click', () => this.obterLocalizacao());
  }

  // ============================================
  // LOGIN SGS
  // ============================================

  loginSistema() {
    const matricula = document.getElementById('matricula')?.value.trim();
    const senha = document.getElementById('senha')?.value.trim();

    if (!matricula || !senha) {
      this.showToast("⚠️ Informe matrícula e senha", "warning");
      return;
    }

    // Armazenar matrícula e senha para o envio da automação
    this.loginEDP = { matricula, senha };

    this.showScreen("screen-form");
    this.showToast("✅ Login informado. Preencha a ocorrência.", "success");
  }

  // ============================================
  // FORMULÁRIO E AUTOMAÇÃO
  // ============================================

  handleSubmit(e) {
    e.preventDefault();
    this.iniciarAutomacao();
  }

  async iniciarAutomacao() {
    // 1. Coletar dados do formulário
    const ocorrencia = {
      descricao: document.getElementById('descricao').value.trim(),
      endereco: document.getElementById('endereco').value.trim(),
      cpf: document.getElementById('cpf').value.trim(),
      acoesImediatas: document.getElementById('acoes-imediatas').value.trim(),
      machucado: document.querySelector('input[name="machucado"]:checked')?.value || "",
      tipoEvento: document.getElementById('tipo-evento').value,
      categoria: document.getElementById('categoria-tipologia').value,
      tipoTipologia: document.getElementById('tipo-tipologia').value,
      latitude: document.getElementById('latitude')?.value || '',
      longitude: document.getElementById('longitude')?.value || ''
    };

    // 2. Validar campos
    if (!ocorrencia.cpf || !ocorrencia.descricao || !ocorrencia.endereco || !ocorrencia.tipoEvento || !ocorrencia.categoria || !ocorrencia.tipoTipologia) {
      this.showToast("⚠️ Preencha todos os campos obrigatórios!", "warning");
      return;
    }

    // 3. Preparar para envio
    const btnGerar = document.getElementById('btn-gerar');
    btnGerar.disabled = true;
    btnGerar.textContent = "Enviando...";
    this.showToast("⏳ Iniciando automação, por favor aguarde...", "info");

    try {
      // 4. Enviar para o backend
      const response = await fetch('http://localhost:3001/ocorrencia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matricula: this.loginEDP.matricula,
          senha: this.loginEDP.senha,
          ocorrencia: ocorrencia,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.sucesso) {
        throw new Error(result.erro || 'Erro desconhecido no servidor.');
      }

      // 5. Lidar com o sucesso
      this.showToast("✅ Automação concluída com sucesso!", "success");
      this.saveData({...ocorrencia, timestamp: new Date().toISOString()}); // Salva no histórico
      
      // Opcional: limpar formulário após sucesso
      // this.limpar();

    } catch (error) {
      // 6. Lidar com o erro
      console.error("Erro na automação:", error);
      this.showToast(`❌ Falha na automação: ${error.message}`, "error");
    } finally {
      // 7. Restaurar o botão
      btnGerar.disabled = false;
      btnGerar.textContent = "Gerar Ocorrência";
    }
  }

  // Funções antigas de manipulação de bookmarklet (abrirSGS, copiarBookmarklet, etc) foram removidas.

  // ============================================
  // AÇÕES (remanescentes)
  // ============================================
  
  imprimirConfirmacao() { window.print(); }

  compartilharWhatsApp() {
    const descricao = document.getElementById('descricao').value;
    const endereco = document.getElementById('endereco').value;
    const mensagem = `📋 *Nova Ocorrência SGS EDP*

Descrição:
${descricao}

Endereço:
${endereco}

Abrir SGS:
${SGS_CONFIG.URL_BASE}`;
    const url = "https://wa.me/?text=" + encodeURIComponent(mensagem);
    window.open(url, "_blank");
  }

  // ============================================
  // UTILIDADES
  // ============================================

  copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
  }

  showScreen(id) {
    document.querySelectorAll(".screen").forEach(screen => {
      screen.classList.remove("active");
    });
    document.getElementById(id)?.classList.add("active");
    window.scrollTo(0, 0);
  }

  voltar() { this.showScreen("screen-form"); }

  limpar() {
    document.getElementById("form-ocorrencia").reset();
    localStorage.removeItem("edp_ocorrencia_draft");
    this.showToast("🧹 Formulário limpo!", "success");
  }

  // ============================================
  // GEOLOCALIZAÇÃO
  // ============================================

  obterLocalizacao(){
    if (!navigator.geolocation) {
      this.showToast("❌ Geolocalização não suportada", "warning");
      return;
    }
    const btn = document.getElementById("btn-localizacao");
    btn.disabled = true;
    btn.innerHTML = "⏳ Buscando...";
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        document.getElementById('latitude').value = lat;
        document.getElementById('longitude').value = lng;
        this.reverseGeocode(lat, lng)
          .then(endereco => {
            if (endereco) {
              document.getElementById("endereco").value = endereco;
            }
          })
          .finally(() => {
            btn.disabled = false;
            btn.innerHTML = "📍 Usar Localização Atual";
            this.showToast("📍 Localização encontrada!", "success");
          });
      },
      () => {
        btn.disabled = false;
        btn.innerHTML = "📍 Usar Localização Atual";
        this.showToast("❌ Erro ao obter localização", "warning");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async reverseGeocode(lat, lng) {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      return data.display_name || "";
    } catch (e) {
      return "";
    }
  }

  // ============================================
  // SALVAR DADOS
  // ============================================

  autoSave() {
    const dados = {
      descricao: document.getElementById("descricao").value,
      cpf: document.getElementById("cpf").value,
      endereco: document.getElementById("endereco").value,
      acoesImediatas: document.getElementById("acoes-imediatas").value,
      tipoEvento: document.getElementById("tipo-evento").value,
      categoria: document.getElementById("categoria-tipologia").value,
      tipoTipologia: document.getElementById("tipo-tipologia").value,
      machucado: document.querySelector('input[name="machucado"]:checked')?.value || "",
      latitude: document.getElementById('latitude')?.value || '',
      longitude: document.getElementById('longitude')?.value || ''
    };
    localStorage.setItem("edp_ocorrencia_draft", JSON.stringify(dados));
  }

  loadSavedData() {
    try {
      const dados = JSON.parse(localStorage.getItem("edp_ocorrencia_draft"));
      if (!dados) return;
      document.getElementById("descricao").value = dados.descricao || "";
      document.getElementById("cpf").value = dados.cpf || "";
      document.getElementById("endereco").value = dados.endereco || "";
      document.getElementById("acoes-imediatas").value = dados.acoesImediatas || "";
      document.getElementById("tipo-evento").value = dados.tipoEvento || "";
      document.getElementById("categoria-tipologia").value = dados.categoria || "";
      document.getElementById("tipo-tipologia").value = dados.tipoTipologia || "";
      document.getElementById('latitude').value = dados.latitude || '';
      document.getElementById('longitude').value = dados.longitude || '';
      const radio = document.querySelector(`input[name="machucado"][value="${dados.machucado}"]`);
      if (radio) radio.checked = true;
    } catch (e) {
      console.error("Erro ao carregar dados salvos:", e);
    }
  }

  saveData(data) {
    let historico = JSON.parse(localStorage.getItem("edp_ocorrencia_history") || "[]");
    historico.unshift(data);
    if (historico.length > 50) historico.pop();
    localStorage.setItem("edp_ocorrencia_history", JSON.stringify(historico));
  }

  // ============================================
  // PARAMETROS URL
  // ============================================

  checkUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const mapa = {
      descricao: "descricao",
      endereco: "endereco",
      cpf: "cpf",
      acoesImediatas: "acoes-imediatas",
      tipoEvento: "tipo-evento",
      categoria: "categoria-tipologia",
      tipoTipologia: "tipo-tipologia",
      machucado: "machucado"
    };
    Object.keys(mapa).forEach(param => {
      const valor = params.get(param);
      if (valor) {
        const campo = document.getElementById(mapa[param]);
        if (campo) {
          campo.value = decodeURIComponent(valor);
        }
      }
    });
  }

  // ============================================
  // TOAST
  // ============================================

  showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.className = "toast show";
    
    const colors = {
      success: "#00FF88",
      warning: "#ffaa00",
      error: "#E94560",
      info: "#00D4FF"
    };
    toast.style.background = colors[type] || colors.success;
    toast.style.color = (type === 'error') ? '#FFFFFF' : '#1a1a2e';

    setTimeout(() => {
      toast.classList.remove("show");
    }, 4000);
  }
}

// ============================================
// INICIAR APP
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  window.app = new EDPOcorrenciaApp();
});
