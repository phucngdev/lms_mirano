import { Link, useNavigate } from 'react-router-dom';
import { ArrowIconBack, DotIcon, ArrowRight } from '#/assets/svg/externalIcon';
import logoMankai from '#/assets/images/logomankaisvg.svg';
import './TestPage.scss';
import { Breadcrumb } from 'antd';

interface TestCard {
  id: number;
  name: string;
  emoji: string;
  testCount: number;
  participantCount: number;
}

const TestPage = () => {
  const navigate = useNavigate();
  const testCards: TestCard[] = [
    {
      id: 1,
      name: 'Cùng Manten N3',
      emoji: '😍😍',
      testCount: 6,
      participantCount: 199,
    },
    {
      id: 2,
      name: 'Cùng Manten N1',
      emoji: '🔥🔥',
      testCount: 6,
      participantCount: 532,
    },
    {
      id: 3,
      name: 'Thi thử',
      emoji: '',
      testCount: 2,
      participantCount: 21,
    },
    {
      id: 4,
      name: 'Cùng Manten N2',
      emoji: '🍀🍀',
      testCount: 6,
      participantCount: 380,
    },
  ];

  const breadcrumbItems = [
    {
      title: <Link to="/">Trang chủ</Link>,
    },
    {
      title: 'Thi thử cùng Mirano',
    },
  ];

  return (
    <div className="test-page">
      <div className="test-page-container">
        {/* Breadcrumb */}
        <div className="test-page-breadcrumb">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* Title */}
        <h1 className="test-page-title">Thi thử cùng Mirano</h1>

        {/* Test Cards Grid */}
        <div className="test-page-grid">
          {testCards.map(card => (
            <div key={card.id} className="test-card">
              {/* Logo */}
              <div className="test-card-logo">
                <img
                  src={logoMankai}
                  alt="Mankai Academy"
                  className="test-logo-icon"
                />
              </div>

              {/* Content */}
              <div className="test-card-content">
                <span className="test-card-label">Bài thi</span>
                <h3 className="test-card-title">
                  {card.name} {card.emoji && <span>{card.emoji}</span>}
                </h3>
                <div className="test-card-stats">
                  <span>{card.testCount} đề thi</span>
                  <DotIcon />
                  <span>{card.participantCount} người tham gia</span>
                </div>
                <button
                  className="test-card-button"
                  onClick={() => navigate(`/test-detail/${card.id}`)}
                >
                  Tham gia ngay{' '}
                  <ArrowRight color="white" width={20} height={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestPage;
