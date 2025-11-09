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

const App = () => {
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
      </Routes>
    </BrowserRouter>
  );
};

export default App;
