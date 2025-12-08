import { useTranslation } from 'react-i18next';
import './Banner.scss';
import iconBanner1 from '/src/assets/images/banner/iconbanner1.png';
import iconBanner2 from '/src/assets/images/banner/iconbanner2.png';
import iconBanner3 from '/src/assets/images/banner/iconbanner3.png';
import bannerMankai from '/src/assets/images/banner/bannerMankai.png';

const Banner = () => {
  const { t } = useTranslation();

  return (
    <section className="banner">
      <div className="banner-container">
        <div className="banner-content">
          <div className="banner-left">
            <div className="banner-headings">
              <h1 className="banner-heading">{t('banner.headings.learn')}</h1>
              <h1 className="banner-heading">
                {t('banner.headings.practice')}
              </h1>
              <h1 className="banner-heading">{t('banner.headings.test')}</h1>
            </div>

            <div className="banner-features">
              <div className="banner-feature">
                <div className="feature-icon">
                  <img src={iconBanner1} alt="lecture icon" />
                </div>
                <span className="feature-text">
                  {t('banner.features.lecture')}
                </span>
              </div>
              <div className="banner-feature">
                <div className="feature-icon">
                  <img src={iconBanner2} alt="path icon" />
                </div>
                <span className="feature-text">
                  {t('banner.features.path')}
                </span>
              </div>
              <div className="banner-feature">
                <div className="feature-icon">
                  <img src={iconBanner3} alt="exercise icon" />
                </div>
                <span className="feature-text">
                  {t('banner.features.exercise')}
                </span>
              </div>
            </div>

            <button className="banner-cta">
              {t('banner.cta')}
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.5 15L12.5 10L7.5 5"
                  stroke="#f37142"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;
