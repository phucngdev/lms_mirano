import { useState } from 'react';
import { Input, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { registerService } from '#/api/services/auth.service';
import './Register.scss';
import frame_auth from '#/assets/images/login/frame_auth.png';
import { Link } from 'react-router-dom';

interface FormErrors {
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const PASSWORD_REGEX =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+{}|:<>?~-]).{8,}$/;

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'fullName':
        if (!value.trim()) {
          return 'Vui lòng nhập họ và tên';
        }
        return undefined;

      case 'phoneNumber':
        if (value.trim()) {
          // Remove spaces and special characters for validation
          const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
          // Vietnamese phone number: 10 digits starting with 0, or 11 digits starting with +84 or 84
          const phoneRegex = /^(0|\+84|84)[0-9]{9,10}$/;
          if (!phoneRegex.test(cleanPhone)) {
            return 'Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam (10 số)';
          }
        }
        return undefined;

      case 'email':
        if (!value.trim()) {
          return 'Vui lòng nhập email';
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'Email không hợp lệ';
        }
        return undefined;

      case 'password':
        if (!value) {
          return 'Vui lòng nhập mật khẩu';
        }
        if (!PASSWORD_REGEX.test(value)) {
          return 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt';
        }
        return undefined;

      case 'confirmPassword':
        if (!value) {
          return 'Vui lòng xác nhận mật khẩu';
        }
        if (value !== formData.password) {
          return 'Mật khẩu xác nhận không khớp';
        }
        return undefined;

      default:
        return undefined;
    }
  };

  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const value = formData[name as keyof typeof formData];
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FormErrors];
        return newErrors;
      });
    }

    // Re-validate confirmPassword when password changes
    if (name === 'password' && touched.confirmPassword) {
      const confirmError = validateField(
        'confirmPassword',
        formData.confirmPassword,
      );
      setErrors(prev => ({
        ...prev,
        confirmPassword: confirmError,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Validate all fields
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) {
        newErrors[key as keyof FormErrors] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const response = await registerService({
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber || null,
        password: formData.password,
      });
      console.log('🚀 ~ handleSubmit ~ response:', response);

      if (response.data.statusCode === 201 && response.data.data.success) {
        message.success('Đăng ký thành công! Vui lòng nhập mã OTP');
        // Navigate to OTP verification page with email
        navigate('/auth/verify-otp', {
          state: { email: formData.email },
        });
      } else {
        message.error('Đăng ký thất bại');
      }
    } catch (error: any) {
      console.error('Register error:', error);
      message.error(
        error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại',
      );
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
          <h1 className="login-title">{t('register.title')}</h1>
          <p className="login-subtitle">{t('register.subtitle')}</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fullName">{t('register.fullName')}</label>
              <Input
                id="fullName"
                placeholder={t('register.placeholder.fullName')}
                value={formData.fullName}
                onChange={e => handleChange('fullName', e.target.value)}
                onBlur={() => handleBlur('fullName')}
                className={errors.fullName && touched.fullName ? 'error' : ''}
              />
              {errors.fullName && touched.fullName && (
                <span className="error-message">{errors.fullName}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="phoneNumber">{t('register.phoneNumber')}</label>
              <Input
                id="phoneNumber"
                placeholder={t('register.placeholder.phoneNumber')}
                value={formData.phoneNumber}
                onChange={e => handleChange('phoneNumber', e.target.value)}
                onBlur={() => handleBlur('phoneNumber')}
                className={
                  errors.phoneNumber && touched.phoneNumber ? 'error' : ''
                }
              />
              {errors.phoneNumber && touched.phoneNumber && (
                <span className="error-message">{errors.phoneNumber}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="email">{t('register.email')}</label>
              <Input
                id="email"
                type="email"
                placeholder={t('register.placeholder.email')}
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                className={errors.email && touched.email ? 'error' : ''}
              />
              {errors.email && touched.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">{t('register.password')}</label>
              <Input
                id="password"
                type="password"
                placeholder={t('register.placeholder.password')}
                value={formData.password}
                onChange={e => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                className={errors.password && touched.password ? 'error' : ''}
              />
              {errors.password && touched.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">
                {t('register.confirmPassword')}
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder={t('register.placeholder.confirmPassword')}
                value={formData.confirmPassword}
                onChange={e => handleChange('confirmPassword', e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
                className={
                  errors.confirmPassword && touched.confirmPassword
                    ? 'error'
                    : ''
                }
              />
              {errors.confirmPassword && touched.confirmPassword && (
                <span className="error-message">{errors.confirmPassword}</span>
              )}
            </div>

            <div className="login-link-row">
              <Link to="/auth/login" className="login-link">
                Quay lại đăng nhập
              </Link>
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
