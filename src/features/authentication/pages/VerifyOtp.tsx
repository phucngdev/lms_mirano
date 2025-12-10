import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { message } from 'antd';
import { confirmRegisterService } from '#/api/services/auth.service';
import Cookies from 'js-cookie';
import OTPInput from '../components/OTPInput';
import './VerifyOtp.scss';
import frame_auth from '#/assets/images/login/frame_auth.png';

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(600); // 600 giây = 10 phút
  const [isResending, setIsResending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get email from location state
  const email = location.state?.email || '';

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      message.error('Vui lòng đăng ký trước');
      navigate('/auth/register');
    }
  }, [email, navigate]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      countdownIntervalRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [countdown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      message.error('Vui lòng nhập đầy đủ mã OTP 6 số');
      return;
    }

    if (!email) {
      message.error('Email không hợp lệ');
      navigate('/auth/register');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await confirmRegisterService({
        email: email,
        verifyCode: otp,
      });

      if (response.data.statusCode === 201 && response.data.data) {
        const { user, accessToken, refreshToken } = response.data.data;

        // Lưu token và user info
        Cookies.set('accessToken', accessToken);
        Cookies.set('refreshToken', refreshToken);
        Cookies.set('user', JSON.stringify(user));

        message.success('Xác nhận thành công! Đang chuyển hướng...');
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        message.error('Mã OTP không đúng');
      }
    } catch (error: any) {
      console.error('Confirm register error:', error);
      message.error('Xác nhận thất bại. Vui lòng thử lại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (isResending || countdown > 0) return;

    message.info('Vui lòng quay lại trang đăng ký để gửi lại mã OTP');
    navigate('/auth/register', { state: { email } });
  };

  if (!email) {
    return null;
  }

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="image-section">
          <img src={frame_auth} alt="Students learning" />
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-wrapper">
          <h1 className="login-title">Xác nhận OTP</h1>
          <p className="login-subtitle">
            Chúng tôi đã gửi mã OTP đến email <strong>{email}</strong>
          </p>

          <form onSubmit={handleOtpSubmit}>
            <div className="form-group otp-group">
              <label htmlFor="otp">Mã OTP</label>
              <OTPInput
                value={otp}
                onChange={setOtp}
                length={6}
                disabled={isSubmitting}
              />
            </div>

            <div className="otp-timer">
              {countdown > 0 ? (
                <p className="otp-countdown">
                  Mã OTP sẽ hết hạn sau:{' '}
                  <strong>{formatTime(countdown)}</strong>
                </p>
              ) : (
                <p className="otp-expired">Mã OTP đã hết hạn</p>
              )}
            </div>

            <div className="otp-actions">
              <button
                type="button"
                className="resend-otp-button"
                onClick={handleResendOtp}
                disabled={countdown > 0 || isResending}
              >
                {isResending ? 'Đang gửi...' : 'Gửi lại mã OTP'}
              </button>
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={isSubmitting || otp.length !== 6}
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
              {isSubmitting ? 'Đang xác nhận...' : 'Xác nhận'}
            </button>

            <div className="back-to-register">
              <button
                type="button"
                className="back-link"
                onClick={() => navigate('/auth/register')}
              >
                ← Quay lại đăng ký
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
