/** Aligné sur GET/PUT /me/notification-preferences */
export type NotificationPreferences = {
  pushEnabled: boolean;
  msgPush: boolean;
  favoritePush: boolean;
  publishedPush: boolean;
  expiryPush: boolean;
  newsletterPush: boolean;
  personalizedPush: boolean;
  activityPush: boolean;
};

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  pushEnabled: true,
  msgPush: true,
  favoritePush: true,
  publishedPush: true,
  expiryPush: true,
  newsletterPush: false,
  personalizedPush: true,
  activityPush: true,
};
