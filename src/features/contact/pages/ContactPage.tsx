import { useState } from 'react';
import { Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftOutlined,
  UserOutlined,
  PhoneOutlined,
  MessageOutlined,
  MailOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import contactImage from '#/assets/images/contact/contact2.png';
import './ContactPage.scss';

const { TextArea } = Input;

interface FormErrors {
  name?: string;
  phone?: string;
  content?: string;
}

const ContactPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'name':
        if (!value.trim()) {
          return 'Vui lòng nhập tên';
        }
        if (value.trim().length < 2) {
          return 'Tên phải có ít nhất 2 ký tự';
        }
        return undefined;

      case 'phone':
        if (!value.trim()) {
          return 'Vui lòng nhập số điện thoại';
        }
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
          return 'Số điện thoại không hợp lệ';
        }
        return undefined;

      case 'content':
        if (!value.trim()) {
          return 'Vui lòng nhập nội dung';
        }
        if (value.trim().length < 10) {
          return 'Nội dung phải có ít nhất 10 ký tự';
        }
        return undefined;

      default:
        return undefined;
    }
  };

  const handleBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    const value =
      fieldName === 'name'
        ? name
        : fieldName === 'phone'
          ? phone
          : fieldName === 'content'
            ? content
            : '';
    const error = validateField(fieldName, value);
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  const handleChange = (name: string, value: string) => {
    if (name === 'name') {
      setName(value);
    } else if (name === 'phone') {
      setPhone(value);
    } else if (name === 'content') {
      setContent(value);
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

    const nameError = validateField('name', name);
    if (nameError) {
      newErrors.name = nameError;
      isValid = false;
    }

    const phoneError = validateField('phone', phone);
    if (phoneError) {
      newErrors.phone = phoneError;
      isValid = false;
    }

    const contentError = validateField('content', content);
    if (contentError) {
      newErrors.content = contentError;
      isValid = false;
    }

    setErrors(newErrors);
    setTouched({
      name: true,
      phone: true,
      content: true,
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
      // TODO: Gọi API submit contact form
      // const response = await submitContactService({ name, phone, content });

      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      message.success(
        'Gửi liên hệ thành công! Chúng tôi sẽ phản hồi sớm nhất có thể.',
      );

      // Reset form
      setName('');
      setPhone('');
      setContent('');
      setErrors({});
      setTouched({});
    } catch (error: any) {
      console.log('🚀 ~ handleSubmit ~ error:', error);
      const errorMessage =
        error?.response?.data?.message ||
        'Gửi liên hệ thất bại. Vui lòng thử lại';
      message.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-page-container">
        <div className="contact-page-wrapper">
          {/* Left Side - Form */}
          <div className="contact-page-form-section">
            <div className="contact-page-header">
              <h1 className="contact-page-title">Liên hệ với chúng tôi</h1>
              <p className="contact-page-subtitle">
                Chúng tôi luôn sẵn sàng hỗ trợ bạn về khóa học, lộ trình luyện
                thi hoặc các thắc mắc về nền tảng e-learning
              </p>
            </div>

            <form onSubmit={handleSubmit} className="contact-page-form">
              <div className="form-group">
                <label htmlFor="name">
                  <UserOutlined className="label-icon" />
                  Họ và tên *
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Nhập họ và tên của bạn"
                  value={name}
                  onChange={e => handleChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  status={errors.name && touched.name ? 'error' : ''}
                  className={errors.name && touched.name ? 'error' : ''}
                  disabled={isSubmitting}
                  size="large"
                />
                {errors.name && touched.name && (
                  <span className="error-message">{errors.name}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phone">
                  <PhoneOutlined className="label-icon" />
                  Số điện thoại *
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Nhập số điện thoại của bạn"
                  value={phone}
                  onChange={e => handleChange('phone', e.target.value)}
                  onBlur={() => handleBlur('phone')}
                  status={errors.phone && touched.phone ? 'error' : ''}
                  className={errors.phone && touched.phone ? 'error' : ''}
                  disabled={isSubmitting}
                  size="large"
                />
                {errors.phone && touched.phone && (
                  <span className="error-message">{errors.phone}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="content">
                  <MessageOutlined className="label-icon" />
                  Nội dung *
                </label>
                <TextArea
                  id="content"
                  placeholder="Nhập nội dung liên hệ của bạn..."
                  value={content}
                  onChange={e => handleChange('content', e.target.value)}
                  onBlur={() => handleBlur('content')}
                  status={errors.content && touched.content ? 'error' : ''}
                  className={errors.content && touched.content ? 'error' : ''}
                  rows={6}
                  disabled={isSubmitting}
                />
                {errors.content && touched.content && (
                  <span className="error-message">{errors.content}</span>
                )}
              </div>

              <div className="form-actions">
                <Button
                  type="default"
                  className="contact-page-cancel-button"
                  onClick={() => navigate(-1)}
                  disabled={isSubmitting}
                  size="large"
                >
                  Hủy
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="contact-page-submit-button"
                  disabled={isSubmitting}
                  loading={isSubmitting}
                  size="large"
                >
                  {isSubmitting ? 'Đang gửi...' : 'Gửi liên hệ'}
                </Button>
              </div>
            </form>
          </div>

          {/* Right Side - Info */}
          <div className="contact-page-info-section">
            <div className="contact-page-info-card">
              {/* <div className="info-image-wrapper">
                <img
                  src={contactImage}
                  alt="Contact support"
                  className="info-image"
                />
              </div> */}

              <div className="info-content">
                <h3 className="info-title">Thông tin liên hệ</h3>
                <div className="info-items">
                  <div className="info-item">
                    <div className="info-item-icon">
                      <MailOutlined />
                    </div>
                    <div className="info-item-content">
                      <p className="info-item-label">Email</p>
                      <p className="info-item-value">support@mirano.edu.vn</p>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-item-icon">
                      <PhoneOutlined />
                    </div>
                    <div className="info-item-content">
                      <p className="info-item-label">Hotline</p>
                      <p className="info-item-value">0793 395 545</p>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-item-icon">
                      <EnvironmentOutlined />
                    </div>
                    <div className="info-item-content">
                      <p className="info-item-label">Địa chỉ</p>
                      <p className="info-item-value">
                        Tòa nhà Sông Đà, Đường Phạm Hùng, Mỹ Đình, Nam Từ Liêm,
                        Hà Nội
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
