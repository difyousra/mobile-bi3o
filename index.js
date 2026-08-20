import { registerRootComponent } from "expo";

// Polyfills requis par @stomp/stompjs (TextEncoder/Decoder) sur RN release.
import { TextEncoder, TextDecoder } from "text-encoding";

if (typeof global.TextEncoder === "undefined") {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === "undefined") {
  global.TextDecoder = TextDecoder;
}

import App from "./App";

registerRootComponent(App);
