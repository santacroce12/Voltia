# ETAPA 1: Construcción (Build)
FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

# Recibimos y propagamos la URL de la API para el build de Vite
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY . .
RUN npm run build

# ETAPA 2: Servidor de producción con Nginx
FROM nginx:stable-alpine

# Copiar el build generado a la ruta de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# El archivo default.conf se monta por docker-compose (volumen)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
