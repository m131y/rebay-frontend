import { useEffect, useRef, useState } from "react";
import { FiSend, FiArrowLeft } from "react-icons/fi";
import useChatStore from "../../store/chatStore";
import useAuthStore from "../../store/authStore";
import { useNavigate } from "react-router-dom";

const ChatRoom = ({ roomId }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { messages, enterRoom, sendMessage, isLoading } = useChatStore();
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (roomId) enterRoom(roomId);
  }, [roomId]);

  // 새 메시지 오면 스크롤 하단으로
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    sendMessage(input);
    setInput("");
  };

  return (
    <div className="font-presentation flex flex-col h-full max-h-[80vh] bg-white rounded-lg shadow-lg border border-rebay-gray-400 overflow-hidden">
      {/* 헤더 */}
      <div className="bg-rebay-blue text-white p-4 flex items-center">
        <button onClick={() => navigate(-1)} className="mr-3 hover:opacity-80">
          <FiArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-bold">채팅방</h2>
      </div>

      {/* 메시지 목록 */}
      <div
        className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3"
        ref={scrollRef}
      >
        {isLoading ? (
          <div className="text-center text-gray-500 mt-10">불러오는 중...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">
            대화를 시작해보세요!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = Number(msg.senderId) === Number(user?.id);
            return (
              <div
                key={msg.messageId || Math.random()}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                    isMe
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-white border border-rebay-gray-200 text-gray-800 rounded-bl-none"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 입력창 */}
      <form
        onSubmit={handleSend}
        className="p-3 bg-white border-t border-rebay-gray-400 flex gap-2"
      >
        <input
          type="text"
          className="flex-1 border border-rebay-gray-400 rounded-full px-4 py-2 focus:outline-none focus:border-blue-500"
          placeholder="메시지 입력..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="bg-rebay-blue text-white p-3 rounded-full hover:opacity-80 disabled:opacity-50"
        >
          <FiSend size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatRoom;
