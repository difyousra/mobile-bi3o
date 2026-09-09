FROM node:22-bookworm-slim

WORKDIR /app

# Dépendances système utiles pour Metro / sharp éventuel
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ENV CI=1 \
    EXPO_NO_TELEMETRY=1 \
    EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0 \
    CHOKIDAR_USEPOLLING=1 \
    EXPO_PUBLIC_API_URL=https://bi3oo.com/api \
    EXPO_PUBLIC_WS_URL=wss://bi3oo.com/ws

EXPOSE 8081

# Web + LAN : accessible hors du conteneur (pas de tunnel ngrok dans Docker)
CMD ["npx", "expo", "start", "--web", "--port", "8081", "--host", "lan"]
