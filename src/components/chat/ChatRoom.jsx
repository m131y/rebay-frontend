import { useCallback, useEffect, useRef, useState } from "react";
import { FiSend, FiArrowLeft, FiShield, FiAlertCircle } from "react-icons/fi";
import useChatStore from "../../store/chatStore";
import useAuthStore from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function debounce(func, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
}

const ChatRoom = ({ roomId }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { messages, enterRoom, sendMessage, isLoading } = useChatStore();
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);
  const [warning, setWarning] = useState(false); // 계좌번호 입력 시 경고
  const [checking, setChecking] = useState(false); // AI로 입력 검사
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (roomId) enterRoom(roomId);
  }, [roomId]);

  // 새 메시지 오면 스크롤 하단으로
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const checkAccount = useCallback(
    debounce(async (value) => {
      if (!value.trim()) {
        setWarning(false);
        setChecking(false);
        return;
      }

      try {
        setChecking(true);
        const res = await api.post("/api/chatai/detect/account", {
          message: value,
        });

        setWarning(res.data.isAccount);
      } catch (e) {
        console.error("AI 검사 오류: ", e);
      } finally {
        setChecking(false);
        setIsTyping(false);
      }
    }, 300),
    []
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    setIsTyping(true);
    setWarning(false);
    setChecking(false);
    checkAccount(value);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (warning) return; // 금융정보 공유 시 전송 불가
    if (checking) return; // 입력 검사 중 전송 불가
    sendMessage(input);
    setInput("");
  };

  const handleBack = () => {
    navigate(-1);
    console.log("뒤로가기");
  };

  const canSend = input.trim().length > 0 && !warning && !checking && !isTyping;

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
        className="bg-white/90 backdrop-blur-sm border-t border-gray-100 px-3 sm:px-5 py-3 sm:py-4"
      >
        {/* 경고 / 검사 메세지 */}
        <div className={`${warning || checking ? "mb-3" : ""}`}>
          {warning && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-200/50 animate-slideDown shadow-sm">
              <FiAlertCircle
                size={18}
                className="text-red-500 mt-0.5 flex-shrink-0"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-700">
                  계좌번호가 감지되었습니다
                </p>
                <p className="text-xs text-red-600/80 mt-0.5">
                  Rebay는 금융정보 공유를 권장하지 않습니다
                </p>
              </div>
            </div>
          )}

          {checking && !warning && (
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/30 animate-slideDown">
              <div className="flex gap-1">
                <div
                  className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
              <span className="text-xs text-blue-700 font-medium flex items-center gap-1.5">
                <FiShield size={14} className="text-blue-500" />
                AI 채팅 어시스트가 메시지를 검사하고 있어요
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2 sm:gap-3 items-end">
          <div className="flex-1 relative group">
            <input
              type="text"
              className={`w-full bg-gray-50 border-2 rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 text-sm sm:text-[15px] transition-all duration-300
          ${
            warning
              ? "border-red-300 bg-red-50/50 focus:border-red-400 focus:ring-4 focus:ring-red-100"
              : "border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          }
          focus:outline-none focus:bg-white placeholder:text-gray-400`}
              placeholder="메시지를 입력하세요..."
              value={input}
              onChange={handleInputChange}
            />
            <div
              className={`absolute inset-0 rounded-2xl transition-opacity duration-300 pointer-events-none ${
                warning
                  ? "opacity-0"
                  : "opacity-0 group-focus-within:opacity-100"
              }`}
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-xl"></div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!canSend}
            className={`relative p-3 sm:p-3.5 rounded-2xl transition-all duration-300 shadow-lg flex items-center justify-center overflow-hidden group 
              ${
                canSend
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-sky-600 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
          >
            {input.trim() && !warning && !checking && (
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            )}
            <FiSend size={18} style={{ transform: "translateY(2px)" }} />
          </button>
        </div>
      </form>

      {/* 애니메이션 */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
  
        .animate-slideDown {
          animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
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
