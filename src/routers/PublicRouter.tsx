import { Outlet } from 'react-router-dom';
import { Header } from '#/shared/components/header/Header';
import Footer from '#/shared/components/footer/Footer';
import '../styles/main.router.scss';
import Contact from '#/shared/components/contact/Contact';
function PublicLayout() {
  return (
    <>
      <Header />
      <section className="main-content">
        <Outlet />
        <Contact />
      </section>
      <Footer />
    </>
  );
}

export default PublicLayout;
