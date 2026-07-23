# EDP Ocorrência Automation

Automação de preenchimento do formulário "Nova Ocorrência" do SGS (site interno da EDP,
`sgo.edp.com.br` / `sgs.edp.com.br`). A pessoa preenche só Descrição, CPF e Endereço num app
simples pelo celular; o backend loga no SGS via Playwright e preenche o resto (campos fixos
sempre iguais: Segmento, Empresa EDP, Área, Localidade, etc. — definidos em `backend/config.js`).

## Arquitetura (duas partes independentes)

- **Frontend** (`src/` — HTML/CSS/JS puro, sem build tool, sem framework): PWA estática, deploy
  no **Netlify** (`ocorrencia-edp.netlify.app`). Público, acessível de qualquer rede/celular.
  Fala com o backend via `fetch` numa URL configurável (campo "Endereço do Servidor de
  Automação" na tela de login, atrás do ícone ⚙️ — só existe na tela de login, não dá pra mudar
  depois de avançar pro formulário).
- **Backend** (`backend/` — Express + Playwright + Postgres): deploy no **Render**
  (`ocorrencia-edp.onrender.com`). Tem seu próprio `package.json`/`server.js` — é o projeto real,
  não os arquivos soltos na raiz (ver "Armadilhas" abaixo). É este componente que precisa
  conseguir alcançar `sgo.edp.com.br`, não o celular da pessoa (ver pergunta em aberto no fim).

### Fluxo

1. Tela de login → `POST /auth/login` (`backend/routes/auth.js`) faz um login de teste real no
   SGS via `backend/playwright/loginEDP.js`, fecha o browser, retorna sucesso/falha. Só avança
   pra tela de formulário se o login passar.
2. Tela de formulário → `POST /ocorrencia` (`backend/routes/ocorrencia.js`): salva a ocorrência
   no Postgres com status `iniciado`, loga de novo no SGS (sessão nova, não reaproveita a do
   passo 1), preenche o formulário real via `backend/playwright/ocorrenciaEDP.js`
   (`setValueByLabel`/`setRadioByLabel` casam campos pelo texto da label), atualiza status pra
   `concluido` ou `falha` (com `erro_mensagem`).
3. Tela de histórico → `GET /ocorrencia` com paginação/busca/filtro por status.

## Como testar localmente (processo validado)

O backend sozinho não sobe sem Postgres. Processo que funciona nesta máquina (Windows):

```bash
# 1. Subir Docker Desktop se não estiver rodando (o daemon demora ~30-60s pra ficar pronto)
powershell -Command "Start-Process 'C:\Program Files\Docker\Docker\Docker Desktop.exe'"
# esperar com: until docker info >/dev/null 2>&1; do sleep 3; done

# 2. Postgres temporário
docker run -d --name edp-test-pg -e POSTGRES_PASSWORD=test -e POSTGRES_DB=edp_test \
  -p 55432:5432 postgres:16-alpine

# 3. backend/.env (NÃO existe por padrão, NÃO commitar — já está no backend/.gitignore)
# DATABASE_URL=postgres://postgres:test@localhost:55432/edp_test
# PORT=3055        <-- NÃO usar 3001! Nesta máquina a porta 3001 já é ocupada por
#                       com.docker.backend/wslrelay (serviços do Docker Desktop/WSL,
#                       nada a ver com o projeto). Confirmar com `netstat -ano | grep :PORTA`
#                       antes de assumir que é conflito do projeto.
# NODE_ENV=development

cd backend && npm run db:migrate   # roda backend/db/schema.sql
node server.js                     # usar run_in_background (Bash tool) — não usar `cmd &`
                                    # solto em Git Bash, o processo morre quando a tool call
                                    # termina

# 4. Frontend: sem build step, é só servir src/ estático
cd src && npx --yes serve -l 3000 .

# 5. Limpar depois: docker rm -f edp-test-pg ; rm backend/.env
```

**Testar o fluxo de verdade no navegador** (não só `curl`): usar Playwright direto (tem em
`backend/node_modules/playwright`, não precisa instalar de novo) pra abrir `localhost:3000`,
clicar nos botões de verdade e tirar screenshot. `chromium-cli` não está instalado nesta
máquina — usar um script Node ad-hoc com `chromium.launch({ headless: true })`. **Isso foi o
que achou o bug crítico do campo `acoes-imediatas`** — só rodando `curl` direto no backend
não apareceria, porque o erro é 100% do lado do frontend (JS quebrando antes de montar o
fetch).

Antes de mandar POST pra `/ocorrencia` ou `/auth/login` via `curl` no Git Bash, **cuidado com
acentos**: heredocs/strings inline no Git Bash no Windows corrompem UTF-8 (`ã`→``). Escrever o
JSON num arquivo com a tool `Write` (que grava UTF-8 correto) e mandar com
`curl --data-binary @arquivo.json` em vez de `-d '...'` inline.

O site real (`sgo.edp.com.br`) responde e carrega a página de login normalmente a partir desta
máquina de dev (fora da rede da EDP) — só falha no login em si com credenciais falsas. Ou seja,
dá pra testar o fluxo de erro/timeout de login sem VPN nem estar na rede da EDP.

## Histórico de bugs corrigidos (2026-07-23)

- **Crítico**: `src/app.js` referenciava `#acoes-imediatas` em 5 lugares (submit, autoSave,
  loadSavedData, checkUrlParams, bindEvents) mas o campo não existia no `index.html`. Isso
  quebrava **o botão "Gerar Ocorrência" inteiro** (exceção lançada antes do fetch) e o
  auto-save de rascunho. Corrigido adicionando o textarea no HTML.
- Tela de login não validava as credenciais antes de avançar — só guardava localmente e ia
  direto pro formulário, então a pessoa só descobria que errou a senha depois de preencher tudo
  e mandar. Corrigido com o endpoint `POST /auth/login` + await no `loginSistema()`.
- `loginEDP.js`: a mensagem de erro amigável ("Verifique matrícula e senha") era código morto —
  o `waitForSelector` sempre estourava timeout primeiro com um erro técnico do Playwright antes
  de chegar na checagem de URL. Corrigido com try/catch ao redor do `waitForSelector`.
- Removidos arquivos vazios/mortos: `server.js` e `src/config.js` (raiz, vazios),
  `src/Dockerfile`, `backend/playwright/Dockerfile`, `backend/routes/Dockerfile` (vazios),
  `backend/middleware/auth.js` + `backend/routes/auth.js` antigo (vazios, nunca conectados —
  `routes/auth.js` foi recriado depois, dessa vez com conteúdo real), `estrutura.txt` (era saída
  de erro de comando do Windows redirecionada por acidente).

## Armadilhas / coisas pra não esquecer

- **Raiz do repo tem `package.json`/`package-lock.json`/`server.js` duplicados** do que tem em
  `backend/`. O `server.js` da raiz está vazio (morto). O `package.json`/`package-lock.json` da
  raiz **não mexer sem olhar o painel do Netlify primeiro** — o `netlify.toml` manda rodar
  `npm run build` mas esse `package.json` não tem script `build`; mesmo assim o deploy no
  Netlify está funcionando (usuário confirmou), então o painel do Netlify provavelmente tem
  build command/publish dir sobrescritos manualmente ali, diferente do que está no repo. Não dá
  pra saber sem acesso ao painel — perguntar antes de tocar.
- Porta **3001 está ocupada** nesta máquina por processos do Docker Desktop/WSL
  (`com.docker.backend`, `wslrelay`), não é nada do projeto. Usar outra porta ao testar local.
- `backend/storage/sessions/` existe mas está vazia e não é referenciada em lugar nenhum do
  código — não reaproveitar sessão de login entre o `/auth/login` e o `/ocorrencia` (são dois
  logins separados, de propósito, conforme o dono do projeto descreveu).
- CORS do backend está totalmente aberto (`app.use(cors())` sem restrição) e não há
  autenticação na API — qualquer um que souber a URL do Render pode chamar `/ocorrencia` ou
  `/auth/login` com qualquer matrícula/senha. Aceito por enquanto (uso pequeno/confiável), mas
  vale lembrar se o uso crescer.
- Risco não confirmado: `backend/Dockerfile` usa a imagem
  `mcr.microsoft.com/playwright/javascript:v1.40.0-jammy` (Playwright v1.40 pré-instalado), mas
  `backend/package.json` pede `playwright: ^1.45.1` via npm — descompasso de versão entre o
  navegador da imagem e a lib instalada. `loginEDP.js` também usa `channel: 'chrome'` (Google
  Chrome de verdade), que normalmente não vem pré-instalado nessa imagem base (ela traz só
  Chromium). Ainda não confirmado se isso quebra em produção — perguntar se uma ocorrência real
  já foi enviada com sucesso no Render antes de mexer.
- Faltam os ícones do PWA: `manifest.json` e `index.html` referenciam `icon-192.png` e
  `icon-512.png`, que não existem em `src/`.

## Pergunta em aberto (rede EDP)

O dono do projeto descreveu que `sgo.edp.com.br` "só abre no wifi da EDP" — o design assume que
só o **backend** (Render) precisa alcançar esse site; o celular da pessoa só fala com o Netlify
+ Render, então funcionaria de qualquer rede. Testei daqui (fora da rede EDP) e a página de
login carregou normalmente, o que sugere que não há bloqueio por IP/rede — só exige login
válido. Ainda não confirmado com um teste real (credenciais verdadeiras, do celular, em dados
móveis) se o Render de fato completa o fluxo inteiro em produção. Combinado de testar isso
"amanhã" (a partir de 2026-07-23).
