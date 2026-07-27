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
- **API** : `EXPO_PUBLIC_API_URL` (défaut `https://new.bi3oo.com/api`)

```bash
EXPO_PUBLIC_API_URL=https://new.bi3oo.com/api npx expo start --tunnel --web --port 8081
```
