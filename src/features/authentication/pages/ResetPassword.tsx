import { useState, useEffect } from 'react';
import { Input, message } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import './ResetPassword.scss';
import { resetPasswordService } from '#/api/services/auth.service';
import frame_auth from '#/assets/images/login/frame_auth.png';

interface FormErrors {
  password?: string;
  confirmPassword?: string;
}

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get email and verifyCode from location state
  const email = location.state?.email || '';
  const verifyCode = location.state?.verifyCode || '';

  // Redirect if no email or verifyCode
  useEffect(() => {
    if (!email || !verifyCode) {
      message.error('Vui lòng xác thực OTP trước');
      navigate('/forgot-password');
    }
  }, [email, verifyCode, navigate]);

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'password':
        if (!value) {
          return 'Vui lòng nhập mật khẩu';
        }
        if (value.length < 6) {
          return 'Mật khẩu phải có ít nhất 6 ký tự';
        }
        return undefined;

      case 'confirmPassword':
        if (!value) {
          return 'Vui lòng xác nhận mật khẩu';
        }
        if (value !== password) {
          return 'Mật khẩu xác nhận không khớp';
        }
        return undefined;

      default:
        return undefined;
    }
  };

  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const value = name === 'password' ? password : confirmPassword;
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleChange = (name: string, value: string) => {
    if (name === 'password') {
      setPassword(value);
    } else if (name === 'confirmPassword') {
      setConfirmPassword(value);
    }

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
      const confirmError = validateField('confirmPassword', confirmPassword);
      setErrors(prev => ({ ...prev, confirmPassword: confirmError }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    const passwordError = validateField('password', password);
    if (passwordError) {
      newErrors.password = passwordError;
      isValid = false;
    }

    const confirmPasswordError = validateField(
      'confirmPassword',
      confirmPassword,
    );
    if (confirmPasswordError) {
      newErrors.confirmPassword = confirmPasswordError;
      isValid = false;
    }

    setErrors(newErrors);
    setTouched({
      password: true,
      confirmPassword: true,
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

    if (!email || !verifyCode) {
      message.error('Thông tin xác thực không hợp lệ');
      navigate('/forgot-password');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await resetPasswordService({
        email,
        verifyCode,
        password,
      });

      if (
        response.data.statusCode === 200 ||
        response.data.statusCode === 201
      ) {
        message.success('Đổi mật khẩu thành công!');
        setTimeout(() => {
          navigate('/auth/login');
        }, 1500);
      } else {
        message.error('Đổi mật khẩu thất bại. Vui lòng thử lại');
      }
    } catch (error: any) {
      console.log('🚀 ~ handleSubmit ~ error:', error);
      const errorMessage =
        error?.response?.data?.message ||
        'Đổi mật khẩu thất bại. Vui lòng thử lại';
      message.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!email || !verifyCode) {
    return null;
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-left">
        <div className="image-section">
          <img src={frame_auth} alt="Students learning" />
        </div>
      </div>

      <div className="reset-password-right">
        <div className="reset-password-form-wrapper">
          <h1 className="reset-password-title">Đặt lại mật khẩu</h1>
          <p className="reset-password-subtitle">
            Vui lòng nhập mật khẩu mới cho tài khoản <strong>{email}</strong>
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="password">Mật khẩu mới</label>
              <Input.Password
                id="password"
                placeholder="•••••••••"
                value={password}
                onChange={e => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                status={errors.password && touched.password ? 'error' : ''}
                className={errors.password && touched.password ? 'error' : ''}
                disabled={isSubmitting}
              />
              {errors.password && touched.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
              <Input.Password
                id="confirmPassword"
                placeholder="•••••••••"
                value={confirmPassword}
                onChange={e => handleChange('confirmPassword', e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
                status={
                  errors.confirmPassword && touched.confirmPassword
                    ? 'error'
                    : ''
                }
                className={
                  errors.confirmPassword && touched.confirmPassword
                    ? 'error'
                    : ''
                }
                disabled={isSubmitting}
              />
              {errors.confirmPassword && touched.confirmPassword && (
                <span className="error-message">{errors.confirmPassword}</span>
              )}
            </div>

            <button
              type="submit"
              className="reset-password-button"
              disabled={isSubmitting}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="165"
                height="49"
                viewBox="0 0 165 49"
                fill="none"
                className="reset-password-button-icon"
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
              {isSubmitting ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
            </button>

            <div className="back-to-login">
              <button
                type="button"
                className="back-link"
                onClick={() => navigate('/auth/login')}
              >
                ← Quay lại đăng nhập
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
