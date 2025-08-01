// Frontend-only notification API using localStorage

const NOTIF_KEY = 'local_notifications';

export function fetchNotifications(userId: string) {
  // Simulate user-specific notifications
  const all = JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]');
  return Promise.resolve(all.filter((n: any) => n.userId === userId));
}

export function markNotificationRead(id: string) {
  const all = JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]');
  const updated = all.map((n: any) => n.id === id ? { ...n, read: true } : n);
  localStorage.setItem(NOTIF_KEY, JSON.stringify(updated));
  return Promise.resolve(updated.find((n: any) => n.id === id));
}

export function createNotification({ userId, title, message, type = 'SYSTEM' }: { userId: string, title: string, message: string, type?: string }) {
  const all = JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]');
  const notif = {
    id: Math.random().toString(36).slice(2),
    userId,
    type,
    title,
    message,
    read: false,
    createdAt: new Date().toISOString(),
  };
  all.unshift(notif);
  localStorage.setItem(NOTIF_KEY, JSON.stringify(all));
  return Promise.resolve(notif);
}