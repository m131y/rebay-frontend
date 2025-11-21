import { create } from "zustand";
import { notificationApi, notificationStream } from "../services/notification";

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isConnected: false,

  // 초기화 및 SSE 연결
  init: async () => {
    // 1. 기존 데이터 로드
    try {
      const listRes = await notificationApi.getList();
      const countRes = await notificationApi.getUnreadCount();

      set({
        notifications: listRes.data,
        unreadCount: countRes.data,
      });
    } catch (err) {
      console.error("Failed to load notifications", err);
    }

    // 2. SSE 연결 (실시간 수신)
    if (!get().isConnected) {
      notificationStream.connect((newNotification) => {
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }));
      });
      set({ isConnected: true });
    }
  },

  // 연결 해제 (로그아웃 시 사용)
  disconnect: () => {
    notificationStream.disconnect();
    set({ notifications: [], unreadCount: 0, isConnected: false });
  },

  // 읽음 처리
  markAsRead: async (id) => {
    try {
      await notificationApi.markRead(id);
      set((state) => {
        const target = state.notifications.find((n) => n.id === id);
        if (target && target.read) return state; // 이미 읽음이면 변경 없음

        return {
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        };
      });
    } catch (err) {
      console.error(err);
    }
  },

  // 모두 읽음 처리 (프론트엔드 로직 예시)
  markAllRead: async () => {
    const { notifications } = get();
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);

    // 개별 요청 병렬 처리 (백엔드에 일괄 처리 API가 없으므로)
    await Promise.all(unreadIds.map((id) => notificationApi.markRead(id)));

    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },
}));

export default useNotificationStore;
