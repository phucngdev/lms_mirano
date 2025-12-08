import React, { useState, useEffect, useCallback } from 'react';
import './BattleCard.scss';

interface CardData {
  id: string;
  front: string;
  back: string;
  fileErrorUrl: string;
  lessonId: string;
  reading: string;
}

interface BattleCardProps {
  cards?: CardData[];
  onExit?: () => void;
}

interface Question {
  card: CardData;
  showFront: boolean;
  correctAnswer: string;
  options: string[];
  correctIndex: number;
}

const BattleCard: React.FC<BattleCardProps> = ({ cards, onExit }) => {
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

  // Tạo câu hỏi từ cards
  const createQuestion = useCallback(
    (card: CardData, availableCards: CardData[]): Question => {
      // Random hiển thị front hoặc back
      const showFront = Math.random() > 0.5;
      const correctAnswer = showFront ? card.back : card.front;

      // Tạo 4 options: 1 đúng, 3 sai
      const wrongCards = availableCards.filter(c => c.id !== card.id);
      const wrongAnswers = wrongCards
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(c => (showFront ? c.back : c.front));

      // Tạo mảng options và shuffle
      const options = [correctAnswer, ...wrongAnswers].sort(
        () => Math.random() - 0.5,
      );
      const correctIndex = options.indexOf(correctAnswer);

      return {
        card,
        showFront,
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

  const [questions, setQuestions] = useState<Question[]>(() =>
    initializeQuestions(),
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isGameComplete, setIsGameComplete] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  const moveToNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeLeft(5);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      // Hết câu hỏi
      setIsGameComplete(true);
    }
  }, [currentQuestionIndex, questions.length]);

  const handleTimeOut = useCallback(() => {
    setIsAnswered(true);
    // Sau 1 giây chuyển câu tiếp theo
    setTimeout(() => {
      moveToNextQuestion();
    }, 1000);
  }, [moveToNextQuestion]);

  // Timer đếm ngược
  useEffect(() => {
    if (isGameComplete || isAnswered || !currentQuestion) return;

    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      // Hết thời gian
      handleTimeOut();
    }
  }, [timeLeft, isGameComplete, isAnswered, currentQuestion, handleTimeOut]);

  const handleAnswerSelect = (index: number) => {
    if (isAnswered || timeLeft === 0) return;

    setSelectedAnswer(index);
    setIsAnswered(true);

    if (index === currentQuestion.correctIndex) {
      setScore(prev => prev + 1);
    }

    // Sau 1 giây chuyển câu tiếp theo
    setTimeout(() => {
      moveToNextQuestion();
    }, 1000);
  };

  const handleRetry = () => {
    const newQuestions = initializeQuestions();
    setQuestions(newQuestions);
    setCurrentQuestionIndex(0);
    setTimeLeft(5);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setIsGameComplete(false);
  };

  const handleContinue = () => {
    if (onExit) {
      onExit();
    }
  };

  // Calculate progress
  const progress =
    questions.length > 0
      ? ((currentQuestionIndex + 1) / questions.length) * 100
      : 0;

  return (
    <div className="battle-card-container">
      <div className="battle-card-content">
        {/* Header */}
        <div className="battle-card-header">
          <div className="timer-section">
            <div className="timer-label">Thời gian</div>
            <div
              className={`timer-value ${timeLeft <= 2 ? 'timer-warning' : ''}`}
            >
              {timeLeft} giây
            </div>
          </div>
          <div className="score-section">
            <div className="score-label">Điểm</div>
            <div className="score-value">{score}</div>
          </div>
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

        {/* Progress Bar */}
        <div className="progress-section">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="progress-text">
            Câu {currentQuestionIndex + 1}/{questions.length}
          </div>
        </div>

        {/* Question Card */}
        {currentQuestion && !isGameComplete && (
          <div className="question-section">
            <div className="question-card">
              <div className="question-text">
                {currentQuestion.showFront
                  ? currentQuestion.card.front
                  : currentQuestion.card.back}
              </div>
            </div>

            {/* Answer Options */}
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
                    disabled={isAnswered || timeLeft === 0}
                  >
                    <span className="option-text">{option}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Game Complete Modal */}
        {isGameComplete && (
          <div className="game-complete-message">
            <div className="complete-content">
              <h2>Chúc mừng!</h2>
              <p>
                Bạn đã hoàn thành với {score}/{questions.length} điểm
              </p>

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

export default BattleCard;
