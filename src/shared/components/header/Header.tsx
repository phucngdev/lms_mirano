import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Dropdown, MenuProps } from 'antd';
import {
  UserOutlined,
  EditOutlined,
  HistoryOutlined,
  LogoutOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import './Header.scss';
import logo from '/src/assets/images/header/logo_mirano.png';
import { useTranslation } from 'react-i18next';
import Cookies from 'js-cookie';
import { logoutService } from '#/api/services/auth.service';
import { message } from 'antd';

export function Header() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = Cookies.get('user')
    ? JSON.parse(Cookies.get('user') as string)
    : null;
  console.log('🚀 ~ Header ~ user:', user);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleNavClick = () => {
    closeMenu();
  };

  const handleLogout = async () => {
    try {
      // await logoutService();
      Cookies.remove('user');
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      message.success('Đăng xuất thành công');
      navigate('/auth/login');
    } catch (error) {
      console.error('Error logging out:', error);
      // Still logout even if API call fails
      Cookies.remove('user');
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      navigate('/auth/login');
    }
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: (
        <Link
          to="/profile"
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <EditOutlined style={{ marginRight: 8 }} />
          Cập nhật thông tin
        </Link>
      ),
    },
    {
      key: 'history',
      label: (
        <Link
          to="/exam-history"
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <HistoryOutlined style={{ marginRight: 8 }} />
          Lịch sử thi
        </Link>
      ),
    },
    {
      key: 'essay-history',
      label: (
        <Link
          to="/essay-history"
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <FileTextOutlined style={{ marginRight: 8 }} />
          Bài tự luận
        </Link>
      ),
    },

    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: (
        <span onClick={handleLogout} style={{ cursor: 'pointer' }}>
          <LogoutOutlined style={{ marginRight: 8 }} />
          Đăng xuất
        </span>
      ),
      danger: true,
    },
  ];

  return (
    <>
      <header className="header">
        <div className="header-container">
          <div className="header-left">
            <div className="header-logo">
              <img onClick={() => navigate('/')} alt="logo" src={logo} />
            </div>
            <div className="header-nav">
              <ul>
                <li>
                  <Link to="/test-page">{t('header.nav.dailyTest')}</Link>
                </li>
                <li>
                  <Link to="/topics">{t('header.nav.topics')}</Link>
                </li>
                <li>
                  <Link to="/study-page">{t('header.nav.learning')}</Link>
                </li>
                <li>
                  <Link to="/my-class">{t('header.nav.myClass')}</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="header-right">
            {user ? (
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                trigger={['hover']}
                overlayClassName="header-user-dropdown"
              >
                <div className="header-right__user">
                  <div className="header-right__user-info">
                    <div className="header-right__user-name">
                      <UserOutlined /> {user?.fullName}
                    </div>
                  </div>
                </div>
              </Dropdown>
            ) : (
              <button
                className="header-right__button"
                onClick={() => navigate('/auth/login')}
              >
                {t('header.login')}
              </button>
            )}
          </div>

          <button
            className="mobile-menu-toggle"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span className={isMenuOpen ? 'open' : ''}></span>
            <span className={isMenuOpen ? 'open' : ''}></span>
            <span className={isMenuOpen ? 'open' : ''}></span>
          </button>

          <div className={`popup-menu ${isMenuOpen ? 'active' : ''}`}>
            <div className="popup-menu__content">
              <ul className="popup-menu__nav">
                <li>
                  <Link to="/test-page" onClick={handleNavClick}>
                    {t('header.nav.dailyTest')}
                  </Link>
                </li>
                <li>
                  <Link to="/topics" onClick={handleNavClick}>
                    {t('header.nav.topics')}
                  </Link>
                </li>
                <li>
                  <Link to="/study-page" onClick={handleNavClick}>
                    {t('header.nav.learning')}
                  </Link>
                </li>
                <li>
                  <Link to="/my-class" onClick={handleNavClick}>
                    {t('header.nav.myClass')}
                  </Link>
                </li>
                {user && (
                  <li>
                    <Link to="/profile" onClick={handleNavClick}>
                      <div className="popup-menu__user-info">
                        <div className="popup-menu__user-name">
                          <UserOutlined /> {user.fullName}
                        </div>
                      </div>
                    </Link>
                  </li>
                )}
              </ul>
              {user ? null : (
                <button
                  className="popup-menu__login-button"
                  onClick={() => {
                    navigate('/auth/login');
                    closeMenu();
                  }}
                >
                  {t('header.login')}
                </button>
              )}
            </div>
            <div className="popup-menu__overlay" onClick={closeMenu}></div>
          </div>
        </div>
      </header>
    </>
  );
}
