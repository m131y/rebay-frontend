import { EventSourcePolyfill } from "event-source-polyfill";
import api from "./api";
import StorageService from "./storage";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const notificationApi = {
  // 목록 조회
  getList: () => api.get("/api/notifications"),
  // 읽지 않은 개수
  getUnreadCount: () => api.get("/api/notifications/count"),
  // 읽음 처리
  markRead: (id) => api.post(`/api/notifications/${id}/read`),
};

// SSE 연결 관리 클래스
class NotificationStream {
  constructor() {
    this.eventSource = null;
  }

  connect(onMessage) {
    const token = StorageService.getAccessToken();
    if (!token || this.eventSource) return;

    // EventSourcePolyfill을 사용해 헤더에 토큰 전송
    this.eventSource = new EventSourcePolyfill(
      `${API_URL}/api/notifications/stream`,
      {
        headers: { Authorization: `Bearer ${token}` },
        heartbeatTimeout: 86400000, // 24시간 (필요시 조정)
      }
    );

    this.eventSource.onmessage = (event) => {
      // 연결 확인용 메시지("connected")는 무시
      if (event.data === "connected") return;

      try {
        const data = JSON.parse(event.data);
        if (onMessage) onMessage(data);
      } catch (e) {
        console.error("Notification Parse Error", e);
      }
    };

    this.eventSource.onerror = (err) => {
      console.error("SSE Error:", err);
      this.eventSource.close();
      this.eventSource = null;
      // 필요 시 재연결 로직 추가 가능
    };
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }
}

export const notificationStream = new NotificationStream();
