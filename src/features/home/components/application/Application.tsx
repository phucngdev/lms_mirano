import React from 'react';
import './Application.scss';
import { AIStar, ArrowRight } from '../../../../assets/svg/externalIcon';
import kanjiLogo from '/src/assets/images/specialRanking/kanji_mnemonic_resized.png';
import aiLogo from '/src/assets/images/application/kaiwa.png';
import tduc1Logo from '/src/assets/images/application/tduc1.png';
import tduc2Logo from '/src/assets/images/application/tduc01.png';
import applicationTitleImage from '/src/assets/images/application/icon_title.png';
import applicationTitleImage02 from '/src/assets/images/application/icon_title02.png';
import leaderboardContentImage from '/src/assets/images/application/app01.png';
import { useNavigate } from 'react-router-dom';

interface ApplicationCard {
  id: number;
  title: string;
  description: string;
  link: string;
  hasStars: boolean;
  image: string | React.ReactNode;
}

const Application = () => {
  const navigate = useNavigate();
  const applications: ApplicationCard[] = [
    {
      id: 1,
      title: 'Kaiwa AI',
      description: 'Luyện tập hội thoại Tiếng Nhật mọi lúc mọi nơi với AI',
      hasStars: true,
      link: '/kaiwa-ai',
      image: (
        <div className="application-card-image application-card-image-ai">
          <img src={aiLogo} alt="Kanji Mnemonic" />
        </div>
      ),
    },
    {
      id: 2,
      title: 'Học từ vựng Minna',
      description:
        'Học Tiếng Nhật theo chủ đề đa dạng, từ giao tiếp hàng ngày đến chuyên ngành',
      hasStars: false,
      link: '/topics',
      image: (
        <div className="application-card-image application-card-image-tduc">
          <img src={tduc1Logo} alt="Kanji Mnemonic" />
        </div>
      ),
    },
    {
      id: 3,
      title: 'Thi thử cùng Mirano',
      description:
        'Kiểm tra trình độ Tiếng Nhật của bạn với các bài thi thử mô phỏng thực tế',
      hasStars: true,
      link: '/test-page',
      image: (
        <div className="application-card-image application-card-image-tduc2">
          <img src={tduc2Logo} alt="Kanji Mnemonic" />
        </div>
      ),
    },
    {
      id: 4,
      title: 'Kanji Mnemonic',
      description: 'Phương pháp ghi nhớ chữ Hán (Kanji) mẹo nhớ từ',
      hasStars: false,
      link: '/kanji-mnemonic',
      image: (
        <div className="application-card-image application-card-image-kanji">
          <img src={kanjiLogo} alt="Kanji Mnemonic" />
        </div>
      ),
    },
  ];

  return (
    <section className="application">
      <div className="application-title">
        <h2 className="application-heading">
          Học cùng <span className="application-brand">Mirano Academy</span>
        </h2>
        <div className="application-title-image">
          <img src={applicationTitleImage} alt="Application Title" />
        </div>
        <p className="application-description">
          Cải thiện kỹ năng mỗi ngày với lộ trình học tập thông minh và theo dõi
          tiến bộ cá nhân
        </p>
      </div>
      <div className="application-container">
        <div className="application-layout">
          <div className="application-left-column">
            <div className="application-cards">
              {applications.map(application => (
                <div key={application.id} className="application-card">
                  <div className="application-card-content">
                    <div className="application-card-left">
                      <div className="application-card-title-wrapper">
                        <h3 className="application-card-title">
                          {application.title}
                        </h3>
                        {application.hasStars && (
                          <div className="application-card-stars">
                            <AIStar width={20} height={20} />
                            <AIStar width={20} height={20} />
                          </div>
                        )}
                      </div>
                      <p className="application-card-description">
                        {application.description}
                      </p>
                      <button
                        onClick={() => navigate(`${application.link}`)}
                        className="application-card-button"
                      >
                        <span>Khám phá ngay</span>
                        <div className="application-card-button-icon">
                          <ArrowRight color="white" width={20} height={20} />
                        </div>
                      </button>
                    </div>
                    <div className="application-card-right">
                      {application.image}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="application-right-column">
            <div className="leaderboard-header">
              <h2 className="leaderboard-title">
                Làm bài thi – Đánh giá năng lực ngay tại <br />{' '}
                <span className="leaderboard-brand">Mirano Academy</span>
              </h2>
            </div>
            <div className="leaderboard-title-image">
              <img src={applicationTitleImage02} alt="Leaderboard Title" />
            </div>
            <div className="leaderboard-content">
              <div className="leaderboard-content-item">
                <div className="leaderboard-content-item-image">
                  <img
                    src={leaderboardContentImage}
                    alt="Leaderboard Content"
                  />
                </div>
              </div>
              <div className="leaderboard-content-item">
                <div className="leaderboard-content-description">
                  <p className="leaderboard-content-description-text">
                    Làm bài thi và đánh giá năng lực ngay tại Rikkei Edu, giúp
                    bạn khám phá điểm mạnh, cải thiện kỹ năng và xây dựng lộ
                    trình học tập hiệu quả
                  </p>
                </div>
              </div>
              <div className="leaderboard-content-item-button">
                <button className="leaderboard-content-item-button-text">
                  <span>Trải nghiệm 30+ bộ đề khác</span>
                  <div className="leaderboard-content-item-button-icon">
                    <ArrowRight color="white" width={20} height={20} />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Application;
