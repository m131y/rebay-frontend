import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiBell } from "react-icons/fi";
import useNotificationStore from "../../store/notificationStore";
import useAuthStore from "../../store/authStore";

const NotificationBell = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore(); // 로그인 여부 확인
  const {
    notifications,
    unreadCount,
    init,
    disconnect,
    markAsRead,
    markAllRead,
  } = useNotificationStore();

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user) {
      init();
    } else {
      disconnect();
    }
    // 언마운트 시 연결 해제하지 않음 (페이지 이동해도 유지).
    // 로그아웃 시에만 disconnect 호출 권장.
  }, [user]);

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
      setIsOpen(false);
    }
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  return (
    <div className="font-presentation relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <FiBell size={24} className="text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-rebay-gray-100 overflow-hidden z-50">
            <div className="p-4 border-b border-rebay-gray-300 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-700">알림</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-blue-600 hover:underline"
                >
                  모두 읽음
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  새로운 알림이 없습니다.
                </div>
              ) : (
                notifications.map((noti) => (
                  <div
                    key={noti.id}
                    onClick={() => handleNotificationClick(noti)}
                    className={`p-4 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors ${
                      !noti.read ? "bg-blue-50/50" : "bg-white"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                        {noti.type}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatTime(noti.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 break-keep">
                      {noti.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
