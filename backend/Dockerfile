# ===================================================================
# Dockerfile para a aplicação Backend de Automação EDP
# ===================================================================

# Estágio 1: Build da imagem base do Playwright
# Usamos a imagem oficial da Microsoft que já vem com Node.js e todas as dependências do Playwright.
FROM mcr.microsoft.com/playwright/javascript:v1.40.0-jammy

# Define o diretório de trabalho dentro do contêiner.
WORKDIR /app

# Copia os arquivos de definição de pacotes.
COPY package.json package-lock.json ./

# Instala as dependências do projeto.
RUN npm install

# Copia o restante do código da aplicação para o diretório de trabalho.
COPY . .

# Expõe a porta que o servidor vai usar.
EXPOSE 3001

# Comando para iniciar a aplicação quando o contêiner for executado.
CMD ["node", "server.js"]