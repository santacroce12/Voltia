# Imagen base con Node 22 para servir el front en modo desarrollo
FROM node:22-alpine

WORKDIR /app

# Copiamos los manifiestos primero para aprovechar la cache de Docker
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos el resto del codigo del frontend
COPY . .

EXPOSE 5173

# Comando en caliente para desarrollo (permite hot-refresh)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
