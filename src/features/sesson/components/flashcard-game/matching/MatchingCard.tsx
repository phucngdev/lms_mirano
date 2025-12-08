import React, { useState, useEffect, useCallback } from 'react';
import { PoweroffOutlined } from '@ant-design/icons';
import './MatchingCard.scss';

interface CardData {
  id: string;
  front: string;
  back: string;
  fileErrorUrl: string;
  lessonId: string;
  reading: string;
}

interface Card extends CardData {
  type: 'front' | 'back';
  isRevealed: boolean;
  isMatched: boolean;
  position: number;
}

interface MatchingCardProps {
  cards?: CardData[];
  onExit?: () => void;
}

const MatchingCard: React.FC<MatchingCardProps> = ({ cards, onExit }) => {
  const mockCards: CardData[] = [
    {
      id: '1',
      front: 'こんにちは',
      back: 'Xin chào',
      fileErrorUrl: '',
      lessonId: 'lesson-1',
      reading: 'konnichiwa',
    },
    {
      id: '2',
      front: 'ありがとう',
      back: 'Cảm ơn',
      fileErrorUrl: '',
      lessonId: 'lesson-1',
      reading: 'arigatou',
    },
    {
      id: '3',
      front: 'さようなら',
      back: 'Tạm biệt',
      fileErrorUrl: '',
      lessonId: 'lesson-1',
      reading: 'sayounara',
    },
    {
      id: '4',
      front: 'おはよう',
      back: 'Chào buổi sáng',
      fileErrorUrl: '',
      lessonId: 'lesson-1',
      reading: 'ohayou',
    },
    {
      id: '5',
      front: 'こんばんは',
      back: 'Chào buổi tối',
      fileErrorUrl: '',
      lessonId: 'lesson-1',
      reading: 'konbanwa',
    },
    {
      id: '6',
      front: 'すみません',
      back: 'Xin lỗi',
      fileErrorUrl: '',
      lessonId: 'lesson-1',
      reading: 'sumimasen',
    },
  ];

  const cardData = cards || mockCards;

  // Tạo mảng cards gồm front và back
  const createGameCards = useCallback((): Card[] => {
    const gameCards: Card[] = [];
    cardData.forEach((card, index) => {
      gameCards.push({
        ...card,
        type: 'front',
        isRevealed: false,
        isMatched: false,
        position: index * 2,
      });
      gameCards.push({
        ...card,
        type: 'back',
        isRevealed: false,
        isMatched: false,
        position: index * 2 + 1,
      });
    });

    return gameCards.sort(() => Math.random() - 0.5);
  }, [cardData]);

  const [gameCards, setGameCards] = useState<Card[]>(() => createGameCards());
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [matchedCardIds, setMatchedCardIds] = useState<Set<string>>(new Set());
  const [time, setTime] = useState(0);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [feedbackState, setFeedbackState] = useState<
    'correct' | 'incorrect' | null
  >(null);

  useEffect(() => {
    if (isGameComplete) return;

    const interval = setInterval(() => {
      setTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isGameComplete]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (matchedCardIds.size === cardData.length && cardData.length > 0) {
      setIsGameComplete(true);
    }
  }, [matchedCardIds, cardData.length]);

  // Handle card click
  const handleCardClick = (position: number) => {
    const card = gameCards[position];

    // Không cho click nếu card đã matched hoặc đã chọn 2 cards hoặc card này đã được chọn
    if (
      card.isMatched ||
      selectedCards.length >= 2 ||
      selectedCards.includes(position)
    ) {
      return;
    }

    // Nếu đã chọn 1 card, kiểm tra xem có phải cùng type không
    if (selectedCards.length === 1) {
      const firstCard = gameCards[selectedCards[0]];
      // Nếu cùng id và cùng type, không cho chọn
      if (firstCard.id === card.id && firstCard.type === card.type) {
        return;
      }
    }

    setSelectedCards(prev => [...prev, position]);

    // Reveal card
    setGameCards(prev =>
      prev.map((c, idx) => (idx === position ? { ...c, isRevealed: true } : c)),
    );
  };

  // Check match khi có 2 cards được chọn
  useEffect(() => {
    if (selectedCards.length === 2) {
      const [firstPos, secondPos] = selectedCards;
      const firstCard = gameCards[firstPos];
      const secondCard = gameCards[secondPos];

      // Nếu 2 cards cùng id và khác type (front và back)
      const isMatch =
        firstCard.id === secondCard.id && firstCard.type !== secondCard.type;

      // Set feedback state
      setFeedbackState(isMatch ? 'correct' : 'incorrect');

      // Sau 0.5 giây, remove feedback và xử lý logic
      setTimeout(() => {
        setFeedbackState(null);
        if (isMatch) {
          // Match thành công - ẩn cả 2 cards
          setGameCards(prev =>
            prev.map(card =>
              card.id === firstCard.id ? { ...card, isMatched: true } : card,
            ),
          );
          setMatchedCardIds(prev => new Set([...prev, firstCard.id]));
        } else {
          // Không match - ẩn lại
          setGameCards(prev =>
            prev.map((c, idx) =>
              selectedCards.includes(idx) ? { ...c, isRevealed: false } : c,
            ),
          );
        }
        setSelectedCards([]);
      }, 500);
    }
  }, [selectedCards, gameCards]);

  // Get card state for styling
  const getCardState = (
    position: number,
  ): 'default' | 'selected' | 'matched' | 'correct' | 'incorrect' => {
    const card = gameCards[position];
    if (card.isMatched) return 'matched';

    // Nếu đang có feedback và card này đang được chọn
    if (selectedCards.includes(position) && feedbackState) {
      return feedbackState;
    }

    if (selectedCards.includes(position)) return 'selected';
    return 'default';
  };

  const handleExit = () => {
    if (onExit) {
      onExit();
    }
  };

  const handleRetry = () => {
    setGameCards(createGameCards());
    setSelectedCards([]);
    setMatchedCardIds(new Set());
    setTime(0);
    setIsGameComplete(false);
  };

  const handleContinue = () => {
    if (onExit) {
      onExit();
    }
  };

  return (
    <div className="matching-card-container">
      <div className="matching-card-content">
        {/* Header */}
        <div className="matching-card-header">
          <div className="timer-section">
            <div className="timer-label">Thời gian kiểm tra</div>
            <div className="timer-value">{formatTime(time)} giây</div>
          </div>
          <button className="exit-button" onClick={handleExit}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M5.63988 6.64C4.3815 7.89879 3.52463 9.50244 3.1776 11.2482C2.83057 12.9939 3.00897 14.8034 3.69025 16.4478C4.37152 18.0921 5.52508 19.4976 7.00505 20.4864C8.48503 21.4752 10.225 22.0029 12.0049 22.0029C13.7848 22.0029 15.5247 21.4752 17.0047 20.4864C18.4847 19.4976 19.6382 18.0921 20.3195 16.4478C21.0008 14.8034 21.1792 12.9939 20.8322 11.2482C20.4851 9.50244 19.6283 7.89879 18.3699 6.64M11.9999 2L11.9999 12"
                stroke="#F04438"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="cards-grid">
          {gameCards.map((card, index) => (
            <div
              key={`${card.id}-${card.type}-${index}`}
              className={`card-item card-${getCardState(index)}`}
              onClick={() => handleCardClick(index)}
            >
              <div className="card-content">
                {card.isMatched ? (
                  <div className="card-text"></div>
                ) : card.isRevealed ? (
                  card.type === 'front' ? (
                    <div className="card-text">{card.front}</div>
                  ) : (
                    <div className="card-text">{card.back}</div>
                  )
                ) : (
                  <div className="card-text">{card.front}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {isGameComplete && (
          <div className="game-complete-message">
            <div className="complete-content">
              <h2>Chúc mừng!</h2>
              <p>Bạn đã hoàn thành trò chơi trong {formatTime(time)}</p>

              <div className="game-complete-message-button">
                <button
                  onClick={handleRetry}
                  className="game-complete-message-button-retry"
                >
                  <span>Làm lại</span>
                </button>

                <button
                  onClick={handleContinue}
                  className="game-complete-message-button-continue"
                >
                  <span>Tiếp tục</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchingCard;
