import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import MainLayout from "../components/layout/MainLayout";

const Home = () => {
  return (
    <MainLayout>
      <Header />
      <main className="bg-red-100">home</main>
      <Footer />
    </MainLayout>
  );
};

export default Home;
