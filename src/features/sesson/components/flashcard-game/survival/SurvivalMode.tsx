import React, { useState, useCallback } from 'react';
import './SurvivalMode.scss';

interface CardData {
  id: string;
  front: string;
  back: string;
  fileErrorUrl: string;
  lessonId: string;
  reading: string;
}

interface SurvivalModeProps {
  cards?: CardData[];
  onExit?: () => void;
}

interface Question {
  card: CardData;
  correctAnswer: string;
  options: string[];
  correctIndex: number;
}

const SurvivalMode: React.FC<SurvivalModeProps> = ({ cards, onExit }) => {
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
    {
      id: '7',
      front: 'おやすみ',
      back: 'Chúc ngủ ngon',
      fileErrorUrl: '',
      lessonId: 'lesson-1',
      reading: 'oyasumi',
    },
    {
      id: '8',
      front: 'いってきます',
      back: 'Tôi đi đây',
      fileErrorUrl: '',
      lessonId: 'lesson-1',
      reading: 'ittekimasu',
    },
  ];

  const cardData = cards || mockCards;

  // Tạo câu hỏi từ card
  const createQuestion = useCallback(
    (card: CardData, availableCards: CardData[]): Question => {
      const correctAnswer = card.back;

      // Tạo 4 options: 1 đúng, 3 sai
      const wrongCards = availableCards.filter(c => c.id !== card.id);
      const wrongAnswers = wrongCards
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(c => c.back);

      // Tạo mảng options và shuffle
      const options = [correctAnswer, ...wrongAnswers].sort(
        () => Math.random() - 0.5,
      );
      const correctIndex = options.indexOf(correctAnswer);

      return {
        card,
        correctAnswer,
        options,
        correctIndex,
      };
    },
    [],
  );

  // Shuffle cards và tạo câu hỏi
  const initializeQuestions = useCallback((): Question[] => {
    const shuffledCards = [...cardData].sort(() => Math.random() - 0.5);
    return shuffledCards.map(card => createQuestion(card, cardData));
  }, [cardData, createQuestion]);

  const [isGameStarted, setIsGameStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [shakeCard, setShakeCard] = useState(false);
  const [showCorrectEffect, setShowCorrectEffect] = useState(false);
  const [combo, setCombo] = useState(0);
  const [comboMessage, setComboMessage] = useState<string | null>(null);

  const currentQuestion = questions[currentQuestionIndex];

  // Play sound effects
  const playSound = (type: 'correct' | 'incorrect') => {
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();

    if (type === 'correct') {
      // Tạo âm thanh đúng (tone cao, vui vẻ)
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(
        659.25,
        audioContext.currentTime + 0.1,
      ); // E5
      oscillator.frequency.setValueAtTime(
        783.99,
        audioContext.currentTime + 0.2,
      ); // G5

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.4,
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    } else {
      // Tạo âm thanh sai (tone thấp, buồn)
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        100,
        audioContext.currentTime + 0.2,
      );

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.3,
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    }
  };

  // Handle start game
  const handleStartGame = () => {
    const newQuestions = initializeQuestions();
    setQuestions(newQuestions);
    setCurrentQuestionIndex(0);
    setLives(3);
    setScore(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsGameOver(false);
    setTotalCorrect(0);
    setCombo(0);
    setComboMessage(null);
    setIsGameStarted(true);
  };

  // Handle answer select
  const handleAnswerSelect = (index: number) => {
    if (isAnswered || isGameOver) return;

    setSelectedAnswer(index);
    setIsAnswered(true);

    if (index === currentQuestion.correctIndex) {
      // Đúng
      const newCombo = combo + 1;
      setCombo(newCombo);
      setScore(prev => prev + 1);
      setTotalCorrect(prev => prev + 1);
      setShowCorrectEffect(true);
      playSound('correct');

      // Hiển thị combo message tại các milestones
      if (newCombo === 5) {
        setComboMessage('Combo x5');
        setTimeout(() => setComboMessage(null), 2000);
      } else if (newCombo === 10) {
        setComboMessage('Perfect!');
        setTimeout(() => setComboMessage(null), 2000);
      } else if (newCombo === 20) {
        setComboMessage('Master!');
        setTimeout(() => setComboMessage(null), 2000);
      } else if (newCombo > 20 && newCombo % 10 === 0) {
        // Hiển thị lại "Master!" mỗi 10 câu sau 20
        setComboMessage('Master!');
        setTimeout(() => setComboMessage(null), 2000);
      }

      // Thêm mạng mỗi 10 câu đúng (tối đa 3 mạng)
      if (newCombo > 0 && newCombo % 10 === 0 && lives < 3) {
        setLives(prev => Math.min(prev + 1, 3));
      }

      // Sau 1.2 giây chuyển câu tiếp theo
      setTimeout(() => {
        setShowCorrectEffect(false);
        moveToNextQuestion();
      }, 1200);
    } else {
      // Sai - reset combo
      setCombo(0);
      setComboMessage(null);
      const newLives = lives - 1;
      setLives(newLives);
      setShakeCard(true);
      playSound('incorrect');

      // Dừng shake sau animation
      setTimeout(() => {
        setShakeCard(false);
      }, 600);

      if (newLives === 0) {
        // Game over
        setTimeout(() => {
          setIsGameOver(true);
        }, 1500);
      } else {
        // Còn mạng, chuyển câu tiếp theo
        setTimeout(() => {
          moveToNextQuestion();
        }, 1500);
      }
    }
  };

  const moveToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      // Hết cards, tạo lại bộ câu hỏi mới (giữ combo)
      const newQuestions = initializeQuestions();
      setQuestions(newQuestions);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setIsAnswered(false);
    }
  };

  // Handle play again
  const handlePlayAgain = () => {
    handleStartGame();
  };

  const renderLives = () => {
    return (
      <div className="lives-container">
        {Array.from({ length: 3 }).map((_, index) => (
          <svg
            key={index}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill={index < lives ? '#F04438' : '#E0E0E0'}
            className="heart-icon"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="survival-mode-container">
      <div className="survival-mode-content">
        <div className="survival-mode-header">
          <div className="score-section">
            <div className="score-label">Điểm</div>
            <div className="score-value-container">
              <div className="score-value">{score}</div>
              {combo >= 10 && (
                <div className="combo-indicator">🔥 Combo: {combo}</div>
              )}
            </div>
          </div>
          {isGameStarted && (
            <div className="lives-section">
              <div className="lives-label">Mạng</div>
              {renderLives()}
            </div>
          )}
          <button className="exit-button" onClick={onExit}>
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
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {!isGameStarted && !isGameOver && (
          <div className="start-screen">
            <div className="start-content">
              <h2 className="start-title">Chế độ sinh tồn</h2>
              <p className="start-description">
                Trả lời đúng nhiều flashcard nhất có thể trước khi hết mạng!
              </p>
              <button className="start-button" onClick={handleStartGame}>
                Start Survival Mode
              </button>
            </div>
          </div>
        )}

        {isGameStarted && !isGameOver && currentQuestion && (
          <div className="game-section">
            {comboMessage && (
              <div
                className={`combo-message ${
                  comboMessage === 'Combo x5'
                    ? 'combo-x5'
                    : comboMessage === 'Perfect!'
                      ? 'combo-perfect'
                      : 'combo-master'
                }`}
              >
                <div className="combo-text">{comboMessage}</div>
                <div className="combo-particles">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className="combo-particle" />
                  ))}
                </div>
              </div>
            )}

            <div className={`question-card ${shakeCard ? 'shake' : ''}`}>
              <div className="question-text">{currentQuestion.card.front}</div>
              {showCorrectEffect && !comboMessage && (
                <div className="correct-effect-overlay">
                  <div className="correct-icon">✓</div>
                  <div className="correct-particles">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="particle" />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="answer-options">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === currentQuestion.correctIndex;
                let optionState:
                  | 'default'
                  | 'selected'
                  | 'correct'
                  | 'incorrect' = 'default';

                if (isAnswered) {
                  if (isCorrect) {
                    optionState = 'correct';
                  } else if (isSelected && !isCorrect) {
                    optionState = 'incorrect';
                  }
                } else if (isSelected) {
                  optionState = 'selected';
                }

                return (
                  <button
                    key={index}
                    className={`answer-option answer-${optionState}`}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={isAnswered || isGameOver}
                  >
                    <span className="option-text">{option}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {isGameOver && (
          <div className="game-over-screen">
            <div className="game-over-content">
              <h2 className="game-over-title">Game Over!</h2>

              <div className="game-over-stats">
                <div className="stat-item">
                  <div className="stat-label">Tổng điểm</div>
                  <div className="stat-value">{score}</div>
                </div>

                <div className="stat-item">
                  <div className="stat-label">Câu đúng</div>
                  <div className="stat-value">{totalCorrect}</div>
                </div>
              </div>

              <button className="play-again-button" onClick={handlePlayAgain}>
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurvivalMode;
