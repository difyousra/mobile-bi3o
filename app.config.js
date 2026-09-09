/** @type {import('expo/config').ExpoConfig} */
const appJson = require("./app.json");

module.exports = {
  expo: {
    ...appJson.expo,
    extra: {
      ...(appJson.expo.extra || {}),
      apiUrl:
        process.env.EXPO_PUBLIC_API_URL ?? "https://bi3oo.com/api",
      wsUrl: process.env.EXPO_PUBLIC_WS_URL ?? "wss://bi3oo.com/ws",
      eas: {
        projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID || undefined,
      },
    },
  },
};
