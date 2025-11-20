import { useParams } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import Header from "../../components/layout/Header";
import ChatRoom from "../../components/chat/ChatRoom";

const ChatPage = () => {
  const { roomId } = useParams();

  return (
    <MainLayout>
      <Header />
      <main className="w-full flex-grow flex justify-center mt-[20px] mb-10 px-4 h-[calc(100vh-150px)]">
        <div className="w-full max-w-[600px] h-full">
          <ChatRoom roomId={roomId} />
        </div>
      </main>
    </MainLayout>
  );
};

export default ChatPage;
