import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import api from "./api";
import StorageService from "./storage";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const chatApi = {
  // 채팅방 생성 또는 기존 방 조회
  createOrGetRoom: (targetUserId) =>
    api.post(`/api/chat/rooms?targetUserId=${targetUserId}`),

  // 채팅방 메시지 내역 조회
  getMessages: (roomId, page = 0, size = 50) =>
    api.get(`/api/chat/rooms/${roomId}/messages`, { params: { page, size } }),

  // 내 채팅방 목록 조회
  getChatRooms: () => api.get("/api/chat/rooms"),
};

class ChatSocket {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = {};
  }

  connect() {
    const token = StorageService.getAccessToken();
    if (!token || this.client?.active) return;

    this.client = new Client({
      webSocketFactory: () => new SockJS(`${API_URL}/ws`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000, // 자동 재연결
      onConnect: () => {
        this.connected = true;
        console.log("Chat WebSocket Connected");
      },
      onStompError: (frame) => {
        console.error("STOMP Error", frame);
      },
    });

    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.connected = false;
      this.subscriptions = {};
      console.log("Chat WebSocket Disconnected");
    }
  }

  // 특정 채팅방 구독
  subscribe(roomId, onMessageReceived) {
    if (!this.client || !this.connected) {
      console.warn("Socket not connected yet. Retrying...");
      return;
    }

    if (this.subscriptions[roomId]) return; // 이미 구독 중

    this.subscriptions[roomId] = this.client.subscribe(
      `/topic/rooms/${roomId}`,
      (message) => {
        const body = JSON.parse(message.body);
        onMessageReceived(body);
      }
    );
    console.log(`Subscribed to room: ${roomId}`);
  }

  // 구독 해제
  unsubscribe(roomId) {
    if (this.subscriptions[roomId]) {
      this.subscriptions[roomId].unsubscribe();
      delete this.subscriptions[roomId];
      console.log(`Unsubscribed from room: ${roomId}`);
    }
  }

  // 메시지 전송
  sendMessage(roomId, content, type = "TEXT") {
    if (!this.client || !this.connected) return;

    const user = StorageService.getUser();

    this.client.publish({
      destination: `/app/rooms/${roomId}/send`,
      headers: { "user-id": String(user.id) },
      body: JSON.stringify({ content, type }),
    });
  }
}

export const chatSocket = new ChatSocket();
