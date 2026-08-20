/**
 * Client STOMP Bi3oo — wss://…/ws
 * Auth : header CONNECT Authorization Bearer <jwt>
 * Destinations user : /user/queue/notifications, /user/queue/notifications-count
 *
 * Sur React Native : frames binaires (NULL STOMP non stripé).
 * Sur web : WebSocket natif (binaire forcé casse le navigateur).
 */
import { Platform } from "react-native";
import { Client } from "@stomp/stompjs";
import { WS_URL } from "../config/api";
import { getAccessToken } from "../api/tokenManager";

/** WebSocket RN : envoie les frames STOMP en binaire pour conserver le \\0. */
class RnBinaryWebSocket {
  constructor(url) {
    this._ws = new WebSocket(url);
    this._ws.binaryType = "arraybuffer";
    this.binaryType = "arraybuffer";
    this.readyState = this._ws.readyState;

    this._ws.onopen = (e) => {
      this.readyState = this._ws.readyState;
      this.onopen?.(e);
    };
    this._ws.onclose = (e) => {
      this.readyState = this._ws.readyState;
      this.onclose?.(e);
    };
    this._ws.onerror = (e) => {
      this.onerror?.(e);
    };
    this._ws.onmessage = (e) => {
      this.onmessage?.(e);
    };
  }

  send(data) {
    if (typeof data === "string") {
      const buf = new Uint8Array(data.length);
      for (let i = 0; i < data.length; i += 1) {
        buf[i] = data.charCodeAt(i) & 0xff;
      }
      this._ws.send(buf.buffer);
      return;
    }
    this._ws.send(data);
  }

  close(code, reason) {
    this._ws.close(code, reason);
  }
}

let client = null;
let connected = false;

export function isStompConnected() {
  return connected && client?.connected === true;
}

/**
 * @param {{
 *   onNotification?: (payload: object) => void,
 *   onUnreadCount?: (count: number) => void,
 *   onConnected?: () => void,
 *   onDisconnected?: () => void,
 * }} handlers
 */
export async function connectNotificationsStomp(handlers = {}) {
  await disconnectNotificationsStomp();

  const token = await getAccessToken();
  if (!token) return null;

  const brokerURL = WS_URL;
  const isNative = Platform.OS === "ios" || Platform.OS === "android";

  const options = {
    brokerURL,
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    reconnectDelay: 4000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    onConnect: () => {
      connected = true;
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log("[stomp] connected", brokerURL);
      }
      handlers.onConnected?.();

      client.subscribe("/user/queue/notifications", (message) => {
        try {
          const body = message.body ? JSON.parse(message.body) : null;
          if (__DEV__) {
            // eslint-disable-next-line no-console
            console.log("[stomp] notification", body?.id, body?.type);
          }
          if (body) handlers.onNotification?.(body);
        } catch {
          // ignore malformed
        }
      });

      client.subscribe("/user/queue/notifications-count", (message) => {
        try {
          const body = message.body ? JSON.parse(message.body) : null;
          const count = Number(
            body?.unreadCount ?? body?.count ?? body?.total ?? NaN
          );
          if (Number.isFinite(count)) handlers.onUnreadCount?.(count);
        } catch {
          // ignore
        }
      });
    },
    onDisconnect: () => {
      connected = false;
      handlers.onDisconnected?.();
    },
    onWebSocketClose: () => {
      connected = false;
      handlers.onDisconnected?.();
    },
    onStompError: (frame) => {
      connected = false;
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.warn("[stomp] error", frame?.headers?.message || frame?.body);
      }
    },
    onWebSocketError: (evt) => {
      connected = false;
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.warn("[stomp] websocket error", evt?.message || evt);
      }
    },
  };

  if (isNative) {
    options.forceBinaryWSFrames = true;
    options.appendMissingNULLonIncoming = true;
    options.webSocketFactory = () => new RnBinaryWebSocket(brokerURL);
  }

  client = new Client(options);
  client.activate();
  return client;
}

export async function disconnectNotificationsStomp() {
  connected = false;
  if (!client) return;
  const c = client;
  client = null;
  try {
    await c.deactivate();
  } catch {
    // ignore
  }
}
