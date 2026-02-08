# Etapa 1: Construção da aplicação
FROM node:18-alpine AS build

# Definir diretório de trabalho
WORKDIR /app

# Vite envs precisam existir na etapa de build
ARG VITE_REACT_APP_API_HOST
ENV VITE_REACT_APP_API_HOST=$VITE_REACT_APP_API_HOST

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm install --frozen-lockfile

# Copiar o restante do código da aplicação
COPY . .

# Construir a aplicação para produção
RUN npm run build

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
