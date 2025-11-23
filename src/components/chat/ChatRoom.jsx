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

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const handleBack = () => {
    navigate(-1);
    console.log("뒤로가기");
  };

  return (
    <div className="font-presentation flex flex-col h-full max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-5 flex items-center shadow-lg">
        <button
          onClick={handleBack}
          className="mr-4 hover:bg-white/20 rounded-full p-2 transition-all duration-200"
        >
          <FiArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-bold">채팅방</h2>
          {/* <p className="text-xs text-blue-100 mt-0.5">상대방과 대화 중</p> */}
        </div>
        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
      </div>

      {/* 메시지 목록 */}
      <div
        className="flex-1 overflow-y-auto px-5 py-6 space-y-4"
        style={{
          background: "linear-gradient(to bottom, #fafafa 0%, #f5f5f5 100%)",
        }}
        ref={scrollRef}
      >
        {isLoading ? (
          <div className="text-center text-gray-500 mt-10">불러오는 중...</div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FiSend size={32} className="text-gray-300" />
            </div>
            <p className="text-lg font-medium">대화를 시작해보세요!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = Number(msg.senderId) === Number(user?.id);
            return (
              <div
                key={msg.messageId || Math.random()}
                className={`flex ${
                  isMe ? "justify-end" : "justify-start"
                } animate-fadeIn`}
              >
                <div
                  className={`flex flex-col ${
                    isMe ? "items-end" : "items-start"
                  } max-w-[75%]`}
                >
                  <div
                    className={`px-5 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm transition-all duration-200 hover:shadow-md ${
                      isMe
                        ? "bg-blue-500 text-white rounded-br-md"
                        : "bg-white text-gray-800 rounded-bl-md border border-gray-200"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 입력창 */}
      <form
        onSubmit={handleSend}
        className="bg-white border-t border-gray-200 px-4 py-4"
      >
        <div className="flex gap-3 items-center">
          <input
            type="text"
            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-5 py-3.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 placeholder-gray-400"
            placeholder="메시지를 입력하세요..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className={`p-3.5 rounded-full transition-all duration-200 shadow-md flex items-center justify-center ${
              input.trim()
                ? "bg-blue-500 text-white hover:bg-blue-600 hover:shadow-lg hover:scale-105 active:scale-95"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <FiSend size={18} style={{ transform: "translateY(2px)" }} />
          </button>
        </div>
      </form>

      {/* 애니메이션 */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ChatRoom;
