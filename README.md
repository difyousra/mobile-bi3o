# Bi3oo Mobile (Expo)

Projet React Native / Expo SDK 54.

## Emplacement serveur

```text
/var/www/mobile-bi3o
```

Remote Git :

```text
origin  git@github.com:difyousra/mobile-bi3o.git
```

## Lancer sur le serveur

```bash
cd /var/www/mobile-bi3o
npm install
npx expo start --tunnel --web --port 8081
```

- **Web (navigateur)** : `http://<IP-serveur>:8081`  
  Exemple préprod : http://168.231.76.45:8081
- **Tunnel Expo** : URL `*.exp.direct` (Expo Go sur téléphone)
- **API** : `EXPO_PUBLIC_API_URL` (défaut `https://bi3oo.com/api`, backend `/opt/monprojet/prod`)
- **WS** : `EXPO_PUBLIC_WS_URL` (défaut `wss://bi3oo.com/ws`)

```bash
EXPO_PUBLIC_API_URL=https://bi3oo.com/api EXPO_PUBLIC_WS_URL=wss://bi3oo.com/ws npx expo start --web --port 8081 --host lan
```
