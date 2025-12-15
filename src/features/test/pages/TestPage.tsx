import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DotIcon, ArrowRight } from '#/assets/svg/externalIcon';
import logoMankai from '#/assets/images/logomankaisvg.svg';
import './TestPage.scss';
import { Breadcrumb, Spin } from 'antd';
import { getMockTestService } from '#/api/services/mockTest.service';
import Cookies from 'js-cookie';
import { TestCategoryEntity } from '#/api/requests';
import img_replace from '#/assets/images/header/logo_mirano.png';

const TestPage = () => {
  const navigate = useNavigate();
  const [testCards, setTestCards] = useState<TestCategoryEntity[]>([]);
  const [loading, setLoading] = useState(true);

  // Get userId from cookies
  const user = Cookies.get('user')
    ? JSON.parse(Cookies.get('user') as string)
    : null;
  const userId = user?.id || '';

  useEffect(() => {
    if (userId) {
      fetchTestCards();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const fetchTestCards = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getMockTestService(userId, 100, 0);
      const apiData = response.data;

      if (apiData.statusCode === 200 && apiData.data?.items) {
        setTestCards(apiData.data?.items);
      }
    } catch (error) {
      console.error('Error fetching test cards:', error);
    } finally {
      setLoading(false);
    }
  };

  // Extract emoji from name (if exists)
  const extractEmoji = (name: string): { name: string; emoji: string } => {
    // Match emoji pattern (Unicode emoji range)
    const emojiRegex =
      /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    const emojis = name.match(emojiRegex);
    const emoji = emojis ? emojis.join('') : '';
    const cleanName = name.replace(emojiRegex, '').trim();
    return { name: cleanName, emoji };
  };

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
        {loading ? (
          <div className="test-page-loading">
            <Spin size="large" />
          </div>
        ) : testCards.length > 0 ? (
          <div className="test-page-grid">
            {testCards.map(card => {
              const { name, emoji } = extractEmoji(card.name);
              return (
                <div key={card.id} className="test-card">
                  <div className="test-card-logo">
                    <img
                      src={img_replace}
                      alt={name}
                      className="test-logo-icon"
                    />
                  </div>

                  {/* Content */}
                  <div className="test-card-content">
                    <span className="test-card-label">Bài thi</span>
                    <h3 className="test-card-title">
                      {name} {emoji && <span>{emoji}</span>}
                    </h3>
                    <div className="test-card-stats">
                      <span>{card.numberOfTests} đề thi</span>
                      <DotIcon />
                      <span>{card.numberOfParticipants} người tham gia</span>
                    </div>
                    <button
                      className="test-card-button"
                      onClick={() =>
                        navigate(`/test-detail/${card.id}`, {
                          state: { categoryName: card.name },
                        })
                      }
                    >
                      Tham gia ngay{' '}
                      <ArrowRight color="white" width={20} height={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="test-page-empty">
            <p>Chưa có bài thi nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestPage;
