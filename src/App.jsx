import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/home";
import Signup from "./components/auth/signup";
import Login from "./components/auth/login";
import OAuth2Callback from "./pages/oAuth2Callback";
import UserProfile from "./pages/userProfile";
import EditProfile from "./pages/editProfile";
import SamplePage from "./pages/samplePage";
import Products from "./pages/products";
import ProductCreate from "./components/products/productCreate";
import CreateReview from "./components/review/createReview";
import UserProduct from "./pages/userProduct";
import Search from "./pages/Search";
import Checkout from "./pages/checkout";
import PaymentSuccess from "./pages/paymentSuccess";
import PaymentFail from "./pages/paymentFail";
import TransactionDetail from "./pages/TransactionDetail";
import FindPassword from "./components/auth/findPassword";

import { useEffect } from "react";
import ChatPage from "./pages/chat/ChatPage";
import useChatStore from "./store/chatStore";
import ChatList from "./pages/chat/ChatList";

const App = () => {
  const { connectSocket, disconnectSocket } = useChatStore();

  useEffect(() => {
    connectSocket(); // 앱 실행 시 소켓 연결 시도
    return () => disconnectSocket();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/sample" element={<SamplePage />} />
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/oauth2/callback" element={<OAuth2Callback />} />
        <Route path="/user/:targetUserId" element={<UserProfile />} />
        <Route path="/user/:targetUserId/edit" element={<EditProfile />} />
        <Route path="/products" element={<Products />} />
        <Route path="/sell" element={<ProductCreate />} />
        <Route path="/products/:postId/edit" element={<ProductCreate />} />
        <Route path="/createreview" element={<CreateReview />} />
        <Route path="/products/:postId" element={<UserProduct />} />
        <Route path="/search" element={<Search />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/fail" element={<PaymentFail />} />
        <Route
          path="/transaction/:transactionId"
          element={<TransactionDetail />}
        />

        <Route path="/chat" element={<ChatList />} />
        <Route path="/chat/:roomId" element={<ChatPage />} />
        <Route path="/findpw" element={<FindPassword />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
