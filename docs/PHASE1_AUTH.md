# Phase 1 — Fondations Auth (livré)

**Date :** 23 juillet 2026  
**Base URL :** `https://new.bi3oo.com/api` (Postman préprod)  
**Contrats :** `mobile_api.md` §2 · collection Postman « Auth » · audit GO

## Implémenté

| Élément | Fichier | Route |
|---------|---------|-------|
| TokenManager (SecureStore) | `src/api/tokenManager.ts` | access + refresh — **pas AsyncStorage** |
| ApiClient + refresh 401 | `src/api/client.ts` | `POST /auth/refresh` (rotation) |
| Error handler | `src/api/errorHandler.ts` | 400–503 documentés |
| Query keys | `src/api/queryKeys.ts` | `me`, catalogue… |
| AuthService | `src/services/authService.ts` | login, register, OTP, forgot, reset, refresh, oauth exchange, logout, me |
| Types DTO | `src/types/auth.ts` | AuthSession, User, ApiError… |
| AuthContext | `src/context/AuthContext.js` | session + bootstrap `GET /users/me` |
| Logout UI | `AccountSettingsScreen` | `POST /auth/logout` + clear Keychain |
| TanStack Query | `App.js` | `QueryClientProvider` |

## Checklist Postman Auth

- [ ] Login → tokens stockés  
- [ ] Profil connecté `GET /users/me`  
- [ ] Refresh token (rotation) — via interceptor 401  
- [ ] Logout (révoque access + refresh)  
- [ ] Inscription + (hors Postman) verify-email / resend-otp  
- [ ] Demande reset mot de passe  
- [x] OAuth exchange — `expo-web-browser` + scheme `bi3oo://oauth` + `exchangeOAuthCode`  
- [ ] Sans JWT → 401 JSON (`GET /me/favoris`)

## Non fait (hors Phase 1)

- Écran reset password deep link
- STOMP / catalogue / favoris
- Sign in with Apple (requis si Google reste pour iOS store)

## Tests manuels app

1. Relancer Expo (`npx expo start -c`) — vérifier `API : new.bi3oo.com`  
2. Login compte préprod vérifié  
3. Tuer l’app → relancer → session restaurée via SecureStore + `/users/me`  
4. Account & Settings → Déconnexion → retour auth  
5. Attendre expiration access (~1 h) ou forcer 401 → refresh automatique
