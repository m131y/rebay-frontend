import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { chatApi } from "../../services/chat";
import MainLayout from "../../components/layout/MainLayout";
import Header from "../../components/layout/Header";
import Avatar from "../../components/ui/Avatar";

const ChatList = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const res = await chatApi.getChatRooms();
        setRooms(res.data);
      } catch (err) {
        console.error("채팅방 목록 조회 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now - date;

    // 하루 미만이면 시간, 그 이상이면 날짜
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString();
  };

  return (
    <MainLayout>
      <Header />
      <div className="w-full max-w-[600px] mx-auto px-4 py-8 min-h-[calc(100vh-200px)]">
        <h1 className="text-2xl font-bold mb-6 font-presentation">채팅 목록</h1>

        {loading ? (
          <div className="text-center text-gray-500 py-10">로딩 중...</div>
        ) : rooms.length === 0 ? (
          <div className="text-center text-gray-400 py-20 flex flex-col gap-2">
            <span className="text-5xl">💬</span>
            <span>참여 중인 채팅방이 없습니다.</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {rooms.map((room) => (
              <div
                key={room.roomId}
                onClick={() => navigate(`/chat/${room.roomId}`)}
                className="flex items-center p-4 bg-white border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors shadow-sm"
              >
                <div className="mr-4">
                  {/* Avatar 컴포넌트는 user 객체를 받으므로 맞춰서 전달 */}
                  <div className="w-12 h-12 rounded-full overflow-hidden pointer-events-none">
                    <Avatar
                      user={{
                        id: room.partnerId,
                        profileImageUrl: room.partnerImage,
                      }}
                      size="size-12"
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-base font-semibold text-gray-900 truncate">
                      {room.partnerName}
                    </h3>
                    <span className="text-xs text-gray-400 ml-2 shrink-0">
                      {formatTime(room.lastMessageTime)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {room.lastMessage || (
                      <span className="text-gray-400 italic">
                        대화 내용 없음
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ChatList;
