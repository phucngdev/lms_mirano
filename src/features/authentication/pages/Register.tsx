import { useState } from 'react';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { Input, Checkbox } from 'antd';
import type { CheckboxProps } from 'antd';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Register.scss';

const Register = () => {
  const { t } = useTranslation();
  const onChange: CheckboxProps['onChange'] = () => {};
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="image-section">
          <img
            src="/src/assets/images/login/Frame 1000007260.png"
            alt="Students learning"
          />
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-wrapper">
          <h1 className="login-title">{t('register.title')}</h1>
          <p className="login-subtitle">{t('register.subtitle')}</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fullName">{t('register.fullName')}</label>
              <Input
                id="fullName"
                placeholder={t('register.placeholder.fullName')}
                value={formData.fullName}
                onChange={e =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label htmlFor="phoneNumber">{t('register.phoneNumber')}</label>
              <Input
                id="phoneNumber"
                placeholder={t('register.placeholder.phoneNumber')}
                value={formData.phoneNumber}
                onChange={e =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">{t('register.email')}</label>
              <Input
                id="email"
                type="email"
                placeholder={t('register.placeholder.email')}
                value={formData.email}
                onChange={e =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">{t('register.password')}</label>
              <Input
                id="password"
                placeholder={t('register.placeholder.password')}
                value={formData.password}
                onChange={e =>
                  setFormData({ ...formData, password: e.target.value })
                }
                // iconRender={visible =>
                //   visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                // }
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">
                {t('register.confirmPassword')}
              </label>
              <Input
                id="confirmPassword"
                placeholder={t('register.placeholder.confirmPassword')}
                value={formData.confirmPassword}
                onChange={e =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
              />
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
              {t('register.title')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
