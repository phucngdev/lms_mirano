import './Footer.scss';
import { useTranslation } from 'react-i18next';
import logoSvg from '/src/assets/images/footer/logo_ft.png';
import mapPinIcon from '/src/assets/images/footer/map_pin.png';
import phoneIcon from '/src/assets/images/footer/phone.png';
import linkedIcon from '/src/assets/images/footer/linked.png';
import facebookIcon from '/src/assets/images/footer/facebook.png';
import twitterIcon from '/src/assets/images/footer/twitter.png';

function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-container">
          <div className="footer-top">
            <div className="footer-logo-section">
              <div className="footer-logo">
                <img src={logoSvg} alt="Mirano Logo" />
              </div>
              <div className="footer-slogan">{t('footer.title')}</div>
            </div>
          </div>
          <div className="footer-center">
            <div className="footer-content">
              <div className="footer-column">
                <h3 className="footer-column-title">
                  {t('footer.contactInfo.title')}
                </h3>
                <div className="footer-contact-item">
                  <img src={mapPinIcon} alt="Address" className="footer-icon" />
                  <span>
                    <strong>{t('footer.contactInfo.address')}</strong>{' '}
                    {t('footer.contactInfo.addressText')}
                  </span>
                </div>
                <div className="footer-contact-item">
                  <img src={phoneIcon} alt="Phone" className="footer-icon" />
                  <span>
                    <strong>{t('footer.contactInfo.hotline')}</strong>{' '}
                    {t('footer.contactInfo.hotlineText')}
                  </span>
                </div>
                <div className="footer-contact-item">
                  <img src={linkedIcon} alt="Email" className="footer-icon" />
                  <span>
                    <strong>{t('footer.contactInfo.email')}</strong>{' '}
                    {t('footer.contactInfo.emailText')}
                  </span>
                </div>
              </div>

              {/* Quick Links */}
              <div className="footer-column">
                <h3 className="footer-column-title">
                  {t('footer.quickLinks.title')}
                </h3>
                <div className="footer-links">
                  <div className="footer-links-column">
                    {t('footer.quickLinks.links', { returnObjects: true })
                      .slice(0, 5)
                      .map((link: string, index: number) => (
                        <a key={index} href="#" className="footer-link">
                          {link}
                        </a>
                      ))}
                  </div>
                  <div className="footer-links-column">
                    {t('footer.quickLinks.links', { returnObjects: true })
                      .slice(5, 10)
                      .map((link: string, index: number) => (
                        <a key={index + 5} href="#" className="footer-link">
                          {link}
                        </a>
                      ))}
                  </div>
                </div>
              </div>

              <div className="footer-column">
                <h3 className="footer-column-title">
                  {t('footer.followUs.title')}
                </h3>
                <div className="footer-social">
                  <a href="#" className="footer-social-link">
                    <img src={facebookIcon} alt="Facebook" />
                  </a>
                  <a href="#" className="footer-social-link">
                    <img src={twitterIcon} alt="YouTube" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="footer-copyright">
        <p>© {t('footer.copyright.text')}</p>
      </div>
    </footer>
  );
}

export default Footer;
