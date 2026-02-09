#!/bin/sh
# Script para injetar variáveis de ambiente do .env no build do Vite

# Carrega o arquivo .env e exporta todas as variáveis VITE_*
if [ -f /app/.env ]; then
  echo "Carregando variáveis do .env..."
  export $(grep -v '^#' /app/.env | grep '^VITE_' | xargs)
  echo "Variáveis carregadas:"
  env | grep '^VITE_'
else
  echo "Arquivo .env não encontrado!"
fi

# Executa o build
npm run build
