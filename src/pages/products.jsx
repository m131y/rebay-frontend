import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import MainLayout from "../components/layout/MainLayout";
import Product from "../components/products/product";

const Products = () => {
  return (
    <MainLayout>
      <Header />
      <main className="mt-[70px]">
        <section className="w-[690px] h-[700px] flex flex-col items-center justify-start space-y-5 mx-auto">
          <div className="w-full h-auto">
            <div className="grid grid-cols-5 gap-[10px]">
              <Product />
              <Product />
              <Product />
              <Product />
              <Product />
              <Product />
              <Product />
              <Product />
              <Product />
              <Product />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </MainLayout>
  );
};

export default Products;
