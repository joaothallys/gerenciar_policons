# Etapa 1: Construção da aplicação
FROM node:18-alpine AS build

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm install --frozen-lockfile

# Copiar o restante do código da aplicação
COPY . .

# Copiar e tornar executável o script de build
COPY docker/build-env.sh /app/build-env.sh
RUN chmod +x /app/build-env.sh

# Construir a aplicação para produção usando o script que carrega o .env
RUN /app/build-env.sh

# Etapa 2: Configuração do servidor Nginx para servir os arquivos estáticos
FROM nginx:stable-alpine AS production

# Copiar a configuração personalizada do Nginx
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

# Copiar os arquivos estáticos do build anterior
COPY --from=build /app/dist /usr/share/nginx/html

# Expor a porta 80 para acesso HTTP
EXPOSE 80

# Comando para rodar o Nginx
CMD ["nginx", "-g", "daemon off;"]
