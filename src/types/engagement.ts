import type { Page } from "./auth";
import type { AdCard } from "./catalog";

export type FavoritePage = Page<AdCard>;

export type FollowStatus = {
  following?: boolean;
  isFollowing?: boolean;
  suivi?: boolean;
};

export type NotificationItem = {
  id: number;
  title?: string;
  titre?: string;
  message?: string;
  body?: string;
  read?: boolean;
  lu?: boolean;
  createdAt?: string;
  type?: string;
};

export type NotificationsPage = Page<NotificationItem>;

export type UnreadCount = {
  count?: number;
  unreadCount?: number;
  total?: number;
};

/** Meilleure hypothèse documentée uniquement par la route — champs optionnels. */
export type SavedSearch = {
  id: number;
  query?: string;
  titre?: string;
  label?: string;
  createdAt?: string;
};

export type SavedSearchesPage = Page<SavedSearch> | SavedSearch[];
