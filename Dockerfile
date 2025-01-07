# FROM node:20.18.0-bullseye

# # Establecer el directorio de trabajo
# WORKDIR /usr/src/app

# # # Instalar yarn globalmente
# # RUN corepack enable && corepack prepare yarn@stable --activate

# # Copiar los archivos de dependencias
# COPY package.json yarn.lock ./

# # Instalación de dependencias
# RUN yarn install --frozen-lockfile

# # Instalar NestJS CLI globalmente usando yarn
# RUN yarn global add @nestjs/cli

# # Copiar el resto del código fuente
# COPY . .

# # Exponer el puerto
# EXPOSE 3000

FROM node:20.18.0-bullseye AS base
WORKDIR /usr/src/app
COPY package.json yarn.lock ./

# Alias de desarrollo que extiende de base
FROM base AS development
RUN yarn install
RUN yarn global add @nestjs/cli
COPY . .
EXPOSE 3000
# CMD ["yarn", "run", "start:dev"]

# Alias de construcción que extiende de base
FROM base AS builder
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

# Alias de producción que usa una imagen más ligera
FROM node:20.18.0-bullseye-slim AS production
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/yarn.lock ./
COPY --from=builder /usr/src/app/.env ./.env
COPY --from=builder /usr/src/app/public ./public

RUN mkdir -p ./temp/reports && \
    chown -R node:node . && \
    chmod -R 755 . && \
    chmod -R 777 ./temp/reports

RUN yarn install --production --frozen-lockfile
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/main"]