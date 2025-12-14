import { useState } from 'react';
import { Input, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './ForgotPassword.scss';
import { forrgotPasswordService } from '#/api/services/auth.service';
import frame_auth from '#/assets/images/login/frame_auth.png';

interface FormErrors {
  email?: string;
}

const ForgotPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'email':
        if (!value.trim()) {
          return 'Vui lòng nhập email';
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'Email không hợp lệ';
        }
        return undefined;

      default:
        return undefined;
    }
  };

  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const value = name === 'email' ? email : '';
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleChange = (name: string, value: string) => {
    if (name === 'email') {
      setEmail(value);
    }

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FormErrors];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    const emailError = validateField('email', email);
    if (emailError) {
      newErrors.email = emailError;
      isValid = false;
    }

    setErrors(newErrors);
    setTouched({
      email: true,
    });

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form first
    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await forrgotPasswordService({ email });
      console.log('🚀 ~ handleSubmit ~ response:', response);
      if (
        response.data.statusCode === 201 ||
        response.data.statusCode === 200
      ) {
        message.success('Mã OTP đã được gửi đến email của bạn');
        navigate('/auth/verify-otp-forgot-password', {
          state: { email },
        });
      } else {
        message.error('Gửi mã OTP thất bại. Vui lòng thử lại');
      }
    } catch (error: any) {
      console.log('🚀 ~ handleSubmit ~ error:', error);
      if (error?.response?.data?.statusCode === 404) {
        message.error('Email không tồn tại');
        return;
      } else {
        message.error('Gửi mã OTP thất bại. Vui lòng thử lại');
      }
    } finally {
      setIsSubmitting(false);
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
          <h1 className="login-title">Quên mật khẩu</h1>
          <p className="login-subtitle">
            Nhập email của bạn để nhận mã OTP xác thực
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                status={errors.email && touched.email ? 'error' : ''}
                className={errors.email && touched.email ? 'error' : ''}
                disabled={isSubmitting}
              />
              {errors.email && touched.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={isSubmitting}
            >
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
              {isSubmitting ? 'Đang gửi...' : 'Xác nhận'}
            </button>

            <div className="back-to-login">
              <Link to="/auth/login" className="back-link">
                ← Quay lại đăng nhập
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
