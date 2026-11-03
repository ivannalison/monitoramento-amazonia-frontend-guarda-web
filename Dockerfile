# etapa 1: compilar o Angular
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# endereco da API gravado no site (so dentro da imagem): troque com --build-arg API_URL=...
ARG API_URL=http://localhost:3100
RUN sed -E -i "s#(apiUrl:[[:space:]]*)['\"][^'\"]*['\"]#\1'${API_URL}'#" src/environments/environment.prod.ts \
 && grep -q "'${API_URL}'" src/environments/environment.prod.ts
RUN npm run build

# etapa 2: servir os arquivos prontos
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/*/browser /usr/share/nginx/html
EXPOSE 8080