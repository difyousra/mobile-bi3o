import {
  createContext,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { useConversations } from "../hooks/useMessaging";

const MessagesContext = createContext(null);

/**
 * Messagerie — API REST Phase 5 (JWT).
 * Remplace AsyncStorage + mocks. STOMP volontairement off.
 */
export function MessagesProvider({ children }) {
  const { data = [], isLoading, isError, refetch, isRefetching } =
    useConversations();

  const getConversation = useCallback(
    (id) => data.find((c) => String(c.id) === String(id)),
    [data]
  );

  const filterConversations = useCallback(
    (query) => {
      if (!query?.trim()) return data;
      const q = query.toLowerCase();
      return data.filter(
        (c) =>
          c.sellerName.toLowerCase().includes(q) ||
          c.product.title.toLowerCase().includes(q) ||
          (c.preview ?? "").toLowerCase().includes(q)
      );
    },
    [data]
  );

  const value = useMemo(
    () => ({
      isReady: !isLoading,
      isLoading,
      isError,
      isRefetching,
      conversations: data,
      getConversation,
      filterConversations,
      refetch,
      /** @deprecated local persistence removed — use useSendMessage */
      updateMessages: () => {},
    }),
    [
      isLoading,
      isError,
      isRefetching,
      data,
      getConversation,
      filterConversations,
      refetch,
    ]
  );

  return (
    <MessagesContext.Provider value={value}>{children}</MessagesContext.Provider>
  );
}

export function useMessages() {
  const ctx = useContext(MessagesContext);
  if (!ctx) {
    throw new Error("useMessages must be used within MessagesProvider");
  }
  return ctx;
}
