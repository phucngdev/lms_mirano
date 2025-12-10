import { useState } from 'react';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { Input, Checkbox, message } from 'antd';
import type { CheckboxProps } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Login.scss';
import { loginService } from '#/api/services/auth.service';
import Cookies from 'js-cookie';
import frame_auth from '#/assets/images/login/frame_auth.png';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const onChange: CheckboxProps['onChange'] = () => {};
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      // Handle login logic here
      const response = await loginService({ email, password });
      console.log('🚀 ~ handleSubmit ~ response:', response);
      if (response.data.statusCode === 201) {
        navigate('/');
        Cookies.set('accessToken', response.data.data.accessToken);
        Cookies.set('refreshToken', response.data.data.refreshToken);
        Cookies.set('user', JSON.stringify(response.data.data.user));
        message.success('Đăng nhập thành công');
      }
    } catch (error) {
      console.log('🚀 ~ handleSubmit ~ error:', error);
      message.error('Đăng nhập thất bại');
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="image-section">
          <img src={frame_auth} alt="Students learning" />
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-wrapper">
          <h1 className="login-title">{t('login.title')}</h1>
          <p className="login-subtitle">{t('login.subtitle')}</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">{t('login.email')}</label>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">{t('login.password')}</label>
              <Input
                id="password"
                placeholder="•••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                // iconRender={visible =>
                //   visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                // }
              />
            </div>

            <div className="forgot-password-row">
              <Link to="/forgot-password" className="forgot-password-link">
                {t('login.forgotPassword')}
              </Link>
              <Link to="/auth/register" className="create-account-link">
                {t('login.createAccount')}
              </Link>
            </div>

            <div className="remember-me">
              <Checkbox onChange={onChange}>
                {t('login.rememberLogin')}
              </Checkbox>
            </div>

            <button type="submit" className="login-button">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="165"
                height="49"
                viewBox="0 0 165 49"
                fill="none"
                className="login-button-icon"
              >
                <g opacity="0.5">
                  <g style={{ mixBlendMode: 'soft-light' }}>
                    <rect
                      x="9.36328"
                      y="-18.0518"
                      width="10.8577"
                      height="109.684"
                      transform="rotate(-27.1119 9.36328 -18.0518)"
                      fill="#FBD3C4"
                    ></rect>
                  </g>
                  <g style={{ mixBlendMode: 'soft-light' }}>
                    <rect
                      x="24.1191"
                      y="-18.0518"
                      width="1.9657"
                      height="109.684"
                      transform="rotate(-27.1119 24.1191 -18.0518)"
                      fill="#FBD3C4"
                    ></rect>
                  </g>
                  <g style={{ mixBlendMode: 'soft-light' }}>
                    <rect
                      y="-18.0518"
                      width="5.16073"
                      height="109.684"
                      transform="rotate(-27.1119 0 -18.0518)"
                      fill="#FBD3C4"
                    ></rect>
                  </g>
                </g>
              </svg>
              {t('login.title')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
