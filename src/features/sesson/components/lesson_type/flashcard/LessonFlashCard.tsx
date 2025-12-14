import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Spin, message } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { getFlashCardByIdLessionService } from '#/api/services/flashcard.service';
import { useAppDispatch } from '#/src/redux/store/store';
import { updateLessonProgress } from '#/src/redux/slice/lesson.slice';
import { updateLessonProgress as updateLessonProgressService } from '#/api/services/lesson-progress.service';
import './LessonFlashCard.scss';
import MatchingCard from '../../flashcard-game/matching/MatchingCard';
import BattleCard from '../../flashcard-game/battle/BattleCard';
import SurvivalMode from '../../flashcard-game/survival/SurvivalMode';

interface FlashCardItem {
  id: string;
  front: string;
  back: string;
  lessonId: string;
  isLearned: boolean;
  reading: string;
}

interface FlashCardResponse {
  statusCode: number;
  data: {
    items: FlashCardItem[];
    meta: {
      limit: number;
      offset: number;
      total: number;
      totalPages: number;
    };
  };
}

const LessonFlashCard = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const dispatch = useAppDispatch();
  const hasUpdatedProgressRef = useRef(false);
  const [flashCards, setFlashCards] = useState<FlashCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showMatchingGame, setShowMatchingGame] = useState(false);
  const [showBattleGame, setShowBattleGame] = useState(false);
  const [showSurvivalGame, setShowSurvivalGame] = useState(false);

  useEffect(() => {
    if (lessonId) {
      fetchFlashCards();
    }
  }, [lessonId]);

  const updateProgress = async () => {
    if (!lessonId || hasUpdatedProgressRef.current) {
      return;
    }

    try {
      // Call API to update progress
      await updateLessonProgressService({
        lessonId: lessonId,
        progress: 100, // Completed = 100%
      });

      // Update Redux state
      dispatch(updateLessonProgress({ lessonId, progress: 100 }));
      hasUpdatedProgressRef.current = true;
    } catch (error) {
      console.error('Error updating lesson progress:', error);
      message.error('Lỗi khi cập nhật tiến trình bài học');
    }
  };

  // Cleanup audio when changing card or unmounting
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentCard]);

  // Update progress when reaching the last card
  useEffect(() => {
    if (
      flashCards.length > 0 &&
      currentCard === flashCards.length - 1 &&
      !hasUpdatedProgressRef.current &&
      lessonId
    ) {
      updateProgress();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCard, flashCards.length, lessonId]);

  const fetchFlashCards = async () => {
    if (!lessonId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Gọi API với limit lớn để lấy tất cả flashcard
      const response = await getFlashCardByIdLessionService(lessonId, 1000, 0);
      const apiData = response.data as FlashCardResponse;

      if (apiData.statusCode === 200 && apiData.data?.items) {
        setFlashCards(apiData.data.items);
      }
    } catch (error) {
      console.error('Error fetching flash cards:', error);
      message.error('Lỗi khi tải flashcard');
    } finally {
      setLoading(false);
    }
  };

  // Convert flash cards to matching card format
  const matchingCardData = flashCards.map(card => ({
    id: card.id,
    front: card.front,
    back: card.back,
    fileErrorUrl: '',
    lessonId: card.lessonId,
    reading: card.reading || '',
  }));

  // Convert flash cards to battle card format (same format)
  const battleCardData = matchingCardData;
  const survivalCardData = matchingCardData;

  const totalCards = flashCards.length;
  const currentFlashCard =
    flashCards.length > 0
      ? flashCards[currentCard % flashCards.length]
      : { front: '', back: '', reading: '' };

  const handleNext = () => {
    if (totalCards > 0) {
      const nextCard = (currentCard + 1) % totalCards;
      setCurrentCard(nextCard);
      setIsFlipped(false); // Reset flip when changing card
    }
  };

  const handlePrev = () => {
    if (totalCards > 0) {
    setCurrentCard(prev => (prev - 1 + totalCards) % totalCards);
      setIsFlipped(false); // Reset flip when changing card
    }
  };

  const handleCardClick = () => {
    setIsFlipped(prev => !prev);
  };

  const progress = totalCards > 0 ? ((currentCard + 1) / totalCards) * 100 : 0;

  const handleMatchingGameClick = () => {
    setShowMatchingGame(true);
  };

  const handleExitMatchingGame = () => {
    setShowMatchingGame(false);
  };

  const handleBattleGameClick = () => {
    setShowBattleGame(true);
  };

  const handleExitBattleGame = () => {
    setShowBattleGame(false);
  };

  const handleSurvivalGameClick = () => {
    setShowSurvivalGame(true);
  };

  const handleExitSurvivalGame = () => {
    setShowSurvivalGame(false);
  };

  const handlePlayAudio = () => {
    if (!currentFlashCard || !currentFlashCard.front) return;

    // Use Web Speech API SpeechSynthesis for text-to-speech
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      // Phát âm text hiện tại (front nếu chưa flip, back nếu đã flip)
      const textToSpeak = isFlipped
        ? currentFlashCard.back || currentFlashCard.reading
        : currentFlashCard.front;

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.8;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    } else {
      message.error('Trình duyệt của bạn không hỗ trợ phát âm');
    }
  };

  if (loading) {
    return (
      <div className="lesson-flashcard-container">
        <div className="lesson-flashcard-loading">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (flashCards.length === 0) {
    return (
      <div className="lesson-flashcard-container">
        <div className="lesson-flashcard-empty">
          <p>Chưa có flashcard</p>
        </div>
      </div>
    );
  }

  // Nếu đang chơi survival game, hiển thị SurvivalMode
  if (showSurvivalGame) {
    return (
      <SurvivalMode cards={survivalCardData} onExit={handleExitSurvivalGame} />
    );
  }

  // Nếu đang chơi battle game, hiển thị BattleCard
  if (showBattleGame) {
    return <BattleCard cards={battleCardData} onExit={handleExitBattleGame} />;
  }

  // Nếu đang chơi matching game, hiển thị MatchingCard
  if (showMatchingGame) {
    return (
      <MatchingCard cards={matchingCardData} onExit={handleExitMatchingGame} />
    );
  }

  return (
    <div className="lesson-flashcard-container">
      <div className="flashcard-section">
        <div className="flashcard-wrapper">
          <div className="flashcard-wrapper-layer">
            <div
              className={`flashcard-screen ${isFlipped ? 'flipped' : ''}`}
              onClick={handleCardClick}
            >
              <div className="flashcard-front">
                <div className="flashcard-content">
                  {currentFlashCard.front}
                </div>
              </div>
              <div className="flashcard-back">
                <div className="flashcard-content">{currentFlashCard.back}</div>
                {currentFlashCard.reading && (
                  <div className="flashcard-reading">
                    {currentFlashCard.reading}
                  </div>
                )}
              </div>
              <div
                className="audio-icon"
                onClick={e => {
                  e.stopPropagation();
                  handlePlayAudio();
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M1.33331 6.66783V9.3345C1.33331 10.6678 1.99998 11.3345 3.33331 11.3345H4.28665C4.53331 11.3345 4.77998 11.4078 4.99331 11.5345L6.93998 12.7545C8.61998 13.8078 9.99998 13.0412 9.99998 11.0612V4.94116C9.99998 2.95449 8.61998 2.19449 6.93998 3.24783L4.99331 4.46783C4.77998 4.59449 4.53331 4.66783 4.28665 4.66783H3.33331C1.99998 4.66783 1.33331 5.33449 1.33331 6.66783Z"
                    stroke="#0BA5EC"
                    stroke-width="1.2"
                  />
                  <path
                    d="M12 5.33203C13.1867 6.91203 13.1867 9.08536 12 10.6654"
                    stroke="#0BA5EC"
                    stroke-width="1.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M13.22 3.66797C15.1466 6.23464 15.1466 9.76797 13.22 12.3346"
                    stroke="#0BA5EC"
                    stroke-width="1.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="flashcard-controls">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            <div className="card-navigation">
              <button className="nav-btn" onClick={handlePrev}>
                <LeftOutlined />
              </button>
              <span className="card-counter">
                {currentCard + 1}/{totalCards}
              </span>
              <button className="nav-btn" onClick={handleNext}>
                <RightOutlined />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="review-games-section">
        <div className="review-games-wrapper">
          <div className="section-title">
            <span>Trò chơi ôn tập</span>
          </div>

          <div className="games-grid">
            <div className="game-card" onClick={handleBattleGameClick}>
              <div className="game-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="34"
                  height="28"
                  viewBox="0 0 34 28"
                  fill="none"
                >
                  <rect
                    x="0.5"
                    y="3.76562"
                    width="32.7158"
                    height="22.7848"
                    rx="2.5"
                    fill="#F3A41D"
                    stroke="#DD951A"
                  />
                  <path
                    d="M4.91211 0.501953C6.24655 0.490145 7.9484 0.535564 9.72949 0.738281C11.6878 0.961169 13.554 1.48082 14.9355 1.94824C15.6247 2.1814 16.19 2.40033 16.582 2.56055C16.7042 2.61048 16.8096 2.65528 16.8965 2.69238V24.5869C16.86 24.5746 16.8222 24.5619 16.7832 24.5488C16.2981 24.3858 15.6198 24.1641 14.8486 23.9268C13.3132 23.4541 11.3827 22.9134 9.86523 22.6699C8.51086 22.4527 6.83405 22.4046 5.40332 22.416C3.91574 22.4279 2.67586 21.2535 2.67578 19.8047V2.85254C2.67579 1.55462 3.65826 0.513056 4.91211 0.501953Z"
                    fill="#FBE3B9"
                    stroke="#DD951A"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M28.7969 0.501953C27.4624 0.490145 25.7606 0.535564 23.9795 0.738281C22.0212 0.961169 20.155 1.48082 18.7734 1.94824C18.0843 2.1814 17.519 2.40033 17.127 2.56055C17.0048 2.61048 16.8994 2.65528 16.8125 2.69238V24.5869C16.8489 24.5746 16.8868 24.5619 16.9258 24.5488C17.4109 24.3858 18.0892 24.1641 18.8604 23.9268C20.3958 23.4541 22.3263 22.9134 23.8438 22.6699C25.1981 22.4527 26.8749 22.4046 28.3057 22.416C29.7932 22.4279 31.0331 21.2535 31.0332 19.8047V2.85254C31.0332 1.55462 30.0507 0.513056 28.7969 0.501953Z"
                    fill="#FBE3B9"
                    stroke="#DD951A"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M21.0195 8.42974C21.0195 8.42974 21.897 8.00624 23.1244 7.68952C24.3517 7.37279 25.381 7.29297 25.381 7.29297"
                    stroke="#DD951A"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M12.0215 8.42974C12.0215 8.42974 11.144 8.00624 9.91666 7.68952C8.68934 7.37279 7.65999 7.29297 7.65999 7.29297"
                    stroke="#DD951A"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M21.0195 13.5879C21.0195 13.5879 21.897 13.1644 23.1244 12.8477C24.3517 12.531 25.381 12.4512 25.381 12.4512"
                    stroke="#DD951A"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M12.0215 13.5879C12.0215 13.5879 11.144 13.1644 9.91666 12.8477C8.68934 12.531 7.65999 12.4512 7.65999 12.4512"
                    stroke="#DD951A"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <div className="game-title">Đấu thẻ</div>
            </div>

            <div className="game-card" onClick={handleMatchingGameClick}>
              <div className="game-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="25"
                  height="35"
                  viewBox="0 0 25 35"
                  fill="none"
                >
                  <rect
                    x="0.5"
                    y="0.5"
                    width="24"
                    height="34"
                    rx="3.5"
                    fill="#F7C268"
                  />
                  <rect
                    x="0.5"
                    y="0.5"
                    width="24"
                    height="34"
                    rx="3.5"
                    stroke="#DD951A"
                  />
                  <path
                    d="M11.3076 11.925C11.6787 11.1978 12.7179 11.1978 13.089 11.925L14.0226 13.7545C14.1679 14.0392 14.4406 14.2373 14.7563 14.2875L16.7847 14.6101C17.591 14.7383 17.9121 15.7266 17.3352 16.3043L15.8838 17.7576C15.6579 17.9838 15.5538 18.3043 15.6036 18.6201L15.9236 20.6489C16.0508 21.4554 15.2101 22.0662 14.4824 21.696L12.6517 20.7647C12.3668 20.6198 12.0298 20.6198 11.7449 20.7647L9.91426 21.696C9.18653 22.0662 8.34584 21.4554 8.47305 20.6489L8.79305 18.6201C8.84285 18.3043 8.7387 17.9838 8.51282 17.7576L7.06143 16.3043C6.48446 15.7266 6.80558 14.7383 7.61192 14.6101L9.64032 14.2875C9.95601 14.2373 10.2287 14.0392 10.374 13.7545L11.3076 11.925Z"
                    fill="#FEF8EE"
                  />
                </svg>
              </div>
              <div className="game-title">Trò chơi ghép thẻ</div>
            </div>

            <div className="game-card" onClick={handleSurvivalGameClick}>
              <div className="game-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="55"
                  height="38"
                  viewBox="0 0 55 38"
                  fill="none"
                >
                  <rect
                    x="3.54553"
                    y="0.5"
                    width="47.2827"
                    height="36.8402"
                    rx="4"
                    fill="#F7C268"
                  />
                  <path
                    d="M3.48571 12.5204C3.54174 18.587 3.54865 28.0162 3.54747 33.3356C3.54698 35.547 5.33902 37.3403 7.55038 37.3403H46.8274C49.0365 37.3403 50.8274 35.5495 50.8274 33.3403V4.5C50.8274 2.29086 49.0365 0.5 46.8274 0.5H7.48189C5.29743 0.5 3.51696 2.25251 3.48239 4.4367L3.42777 7.88731H45.1401"
                    stroke="#DD951A"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M22.3672 14.2344H37.2012"
                    stroke="#FEF8EE"
                    stroke-linecap="round"
                  />
                  <path
                    d="M22.3672 23.8301H37.2012"
                    stroke="#FEF8EE"
                    stroke-linecap="round"
                  />
                  <path
                    d="M22.3672 33.3652H37.2012"
                    stroke="#FEF8EE"
                    stroke-linecap="round"
                  />
                  <path
                    d="M22.3672 17.5938H29.1924"
                    stroke="#FEF8EE"
                    stroke-linecap="round"
                  />
                  <path
                    d="M22.3672 27.1895H29.1924"
                    stroke="#FEF8EE"
                    stroke-linecap="round"
                  />
                  <path
                    d="M13.4098 14.2367L15.5442 16.3717L18.7753 12.8789"
                    stroke="#FEF8EE"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <circle
                    cx="15.2185"
                    cy="24.2282"
                    r="2.5837"
                    stroke="#FEF8EE"
                  />
                  <path
                    d="M17.8022 33.6716C17.8022 32.2447 16.6454 31.0879 15.2185 31.0879C13.7915 31.0879 12.6348 32.2447 12.6348 33.6716"
                    stroke="#FEF8EE"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <div className="game-title">Sinh tồn</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonFlashCard;
