FROM node:20-alpine

WORKDIR /app

# Copia package.json e package-lock.json (se existir)
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o resto dos arquivos do projeto
COPY . .

# Exponha a porta web do Expo
EXPOSE 8081

# Inicia o servidor em modo web
CMD ["npm", "run", "web"]
