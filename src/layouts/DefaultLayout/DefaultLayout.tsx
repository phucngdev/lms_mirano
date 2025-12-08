import { Outlet } from 'react-router-dom';
import styles from './DefaultLayout.module.scss';
import Header from '#/src/components/Header/Header';
import Footer from '#/src/components/Footer/Footer';

function DefaultLayout() {
  return (
    <section className={styles.wrapper}>
      <div className={styles.inner}>
        <Header />
        <Outlet />
        <Footer />
      </div>
    </section>
  );
}

export default DefaultLayout;
