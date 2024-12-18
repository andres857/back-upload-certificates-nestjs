FROM node:20.18.0-bullseye

# Establecer el directorio de trabajo
WORKDIR /usr/src/app

# # Instalar yarn globalmente
# RUN corepack enable && corepack prepare yarn@stable --activate

# Copiar los archivos de dependencias
COPY package.json yarn.lock ./

# Instalación de dependencias
RUN yarn install --frozen-lockfile

# Instalar NestJS CLI globalmente usando yarn
RUN yarn global add @nestjs/cli

# Copiar el resto del código fuente
COPY . .

# Exponer el puerto
EXPOSE 3000