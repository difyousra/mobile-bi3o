/** @type {import('expo/config').ExpoConfig} */
const appJson = require("./app.json");

module.exports = {
  expo: {
    ...appJson.expo,
    extra: {
      apiUrl:
        process.env.EXPO_PUBLIC_API_URL ?? "https://new.bi3oo.com/api",
      wsUrl: process.env.EXPO_PUBLIC_WS_URL ?? "wss://new.bi3oo.com/ws",
    },
  },
};
