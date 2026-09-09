import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useConversations } from "../hooks/useMessaging";
import { getBlockedUserIds } from "../utils/blockedUsers";

const MessagesContext = createContext(null);

/**
 * Messagerie — API REST Phase 5 (JWT).
 * Remplace AsyncStorage + mocks. STOMP volontairement off.
 */
export function MessagesProvider({ children }) {
  const { data = [], isLoading, isError, refetch, isRefetching } =
    useConversations();
  const [blockedIds, setBlockedIds] = useState([]);

  const refreshBlocked = useCallback(async () => {
    const ids = await getBlockedUserIds();
    setBlockedIds(ids);
  }, []);

  useEffect(() => {
    refreshBlocked();
  }, [refreshBlocked]);

  const visibleConversations = useMemo(() => {
    if (!blockedIds.length) return data;
    const set = new Set(blockedIds);
    return data.filter((c) => {
      const sid = Number(c.sellerId);
      return !Number.isFinite(sid) || !set.has(sid);
    });
  }, [data, blockedIds]);

  const getConversation = useCallback(
    (id) => data.find((c) => String(c.id) === String(id)),
    [data]
  );

  const filterConversations = useCallback(
    (query) => {
      if (!query?.trim()) return visibleConversations;
      const q = query.toLowerCase();
      return visibleConversations.filter(
        (c) =>
          c.sellerName.toLowerCase().includes(q) ||
          c.product.title.toLowerCase().includes(q) ||
          (c.preview ?? "").toLowerCase().includes(q)
      );
    },
    [visibleConversations]
  );

  const value = useMemo(
    () => ({
      isReady: !isLoading,
      isLoading,
      isError,
      isRefetching,
      conversations: visibleConversations,
      getConversation,
      filterConversations,
      refetch,
      refreshBlocked,
      /** @deprecated local persistence removed — use useSendMessage */
      updateMessages: () => {},
    }),
    [
      isLoading,
      isError,
      isRefetching,
      visibleConversations,
      getConversation,
      filterConversations,
      refetch,
      refreshBlocked,
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
