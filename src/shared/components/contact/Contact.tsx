import './Contact.scss';
import { ArrowRight } from '../../../assets/svg/externalIcon';
import contactImage from '#/assets/images/contact/contact2.png';
const Contact = () => {
  return (
    <section className="contact">
      <div className="contact-container">
        <div className="contact-content">
          <div className="contact-left">
            <h2 className="contact-heading">
              Liên hệ ngay <span className="contact-brand">Mirano Academy</span>
            </h2>
            <p className="contact-description">
              Chúng tôi luôn sẵn sàng hỗ trợ bạn về khóa học, lộ trình luyện thi
              hoặc các thắc mắc về nền tảng e-learning
            </p>
            <button className="contact-button">
              Liên hệ tư vấn ngay
              <ArrowRight color="#fff" width={20} height={20} />
            </button>
          </div>
          <div className="contact-right">
            <div className="contact-image-wrapper">
              <img
                src={contactImage}
                alt="Contact support"
                className="contact-image"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
