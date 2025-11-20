import { create } from "zustand";
import { chatApi, chatSocket } from "../services/chat";

const useChatStore = create((set, get) => ({
  messages: [],
  currentRoomId: null,
  isLoading: false,

  // 앱 시작 시 소켓 연결
  connectSocket: () => chatSocket.connect(),
  disconnectSocket: () => chatSocket.disconnect(),

  // 채팅방 입장
  enterRoom: async (roomId) => {
    const prevRoomId = get().currentRoomId;
    if (prevRoomId) chatSocket.unsubscribe(prevRoomId);

    set({ currentRoomId: roomId, isLoading: true, messages: [] });

    try {
      // 이전 대화 불러오기 (역순 정렬되어 옴 -> 다시 뒤집기)
      const res = await chatApi.getMessages(roomId);
      const pastMessages = res.data.content.reverse();
      set({ messages: pastMessages });

      // 실시간 구독 시작
      chatSocket.subscribe(roomId, (newMsg) => {
        set((state) => ({ messages: [...state.messages, newMsg] }));
      });
    } catch (err) {
      console.error("Failed to enter room:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  // 메시지 전송
  sendMessage: (content) => {
    const { currentRoomId } = get();
    if (currentRoomId && content.trim()) {
      chatSocket.sendMessage(currentRoomId, content);
    }
  },
}));

export default useChatStore;
