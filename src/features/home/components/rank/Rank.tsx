import React, { useState } from 'react';
import './rank.scss';
import { IconStar, ArrowRight } from '../../../../assets/svg/externalIcon';
import avatarRank from '#/assets/images/specialRanking/avatarrank.png';

const CoinIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx="8" cy="8" r="8" fill="#FFC800" />
      <path
        d="M8 4L8 12M4 8L12 8"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

const Rank = () => {
  const [activeTab, setActiveTab] = useState('week');

  const topThreeUsers = [
    {
      rank: 2,
      name: 'Nguyễn Văn Anh',
      score: 800,
      avatar: avatarRank,
      color: '#5BAFFF',
    },
    {
      rank: 1,
      name: 'Nguyễn Thị Anh',
      score: 1000,
      avatar: avatarRank,
      color: '#FF6B6B',
      isFirst: true,
    },
    {
      rank: 3,
      name: 'Nguyễn Thị Anh',
      score: 600,
      avatar: avatarRank,
      color: '#FFA500',
    },
  ];

  const remainingUsers = Array.from({ length: 7 }, (_, i) => ({
    rank: i + 4,
    name: 'Nguyễn Văn Anh',
    score: 400,
    avatar: avatarRank,
    isCurrentUser: i === 5, // Highlight row 242 (which is rank 9 in the list)
  }));

  const tabs = [
    { key: 'week', label: 'Tuần' },
    { key: 'month', label: 'Tháng' },
    { key: 'year', label: 'Năm' },
    { key: 'test', label: 'Bài thi' },
  ];

  return (
    <section className="rank">
      <div className="rank-container">
        <div className="rank-header">
          <h2 className="rank-title">Đua top học tập, bứt phá thành tích</h2>
          <p className="rank-description">
            Cạnh tranh lành mạnh, theo dõi tiến bộ của bạn qua từng tuần, từng
            tháng và từng bài thi. Học càng nhiều, điểm càng cao, thứ hạng càng
            nổi bật!
          </p>
        </div>

        <div className="rank-tabs">
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`rank-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="rank-top-three">
          {topThreeUsers.map(user => (
            <div
              key={user.rank}
              className={`rank-podium ${user.isFirst ? 'rank-first' : ''}`}
            >
              <div className="rank-avatar-wrapper">
                <div
                  className="rank-avatar"
                  style={{ borderColor: user.color }}
                >
                  <img src={user.avatar} alt={user.name} />
                  <div
                    className="rank-crown"
                    style={{ backgroundColor: user.color }}
                  >
                    {user.isFirst ? (
                      <IconStar color="#FFC800" width={32} height={32} />
                    ) : user.rank === 2 ? (
                      <IconStar color="#5BAFFF" width={24} height={24} />
                    ) : (
                      <IconStar color="#FFA500" width={24} height={24} />
                    )}
                  </div>
                </div>
              </div>
              <div className="rank-info">
                <h3 className="rank-name">{user.name}</h3>
                <div className="rank-score">
                  <CoinIcon />
                  <span>{user.score.toLocaleString('vi-VN')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rank-list">
          {remainingUsers.map(user => (
            <div
              key={user.rank}
              className={`rank-item ${user.isCurrentUser ? 'highlight' : ''}`}
            >
              <span className="rank-number">{user.rank}</span>
              <div className="rank-avatar-small">
                <img src={user.avatar} alt={user.name} />
              </div>
              <span className="rank-name-list">{user.name}</span>
              <div className="rank-score-list">
                <CoinIcon />
                <span>{user.score}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="rank-cta">
          <button className="rank-button">
            Xem chi tiết
            <ArrowRight color="#fff" width={20} height={20} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Rank;
