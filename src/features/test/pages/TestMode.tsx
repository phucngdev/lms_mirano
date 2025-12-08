import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Breadcrumb, FloatButton } from 'antd';
import './TestMode.scss';
import { LeftOutlined, MenuOutlined, RightOutlined } from '@ant-design/icons';
import TestModeDrawer from '../components/drawer/TestModeDrawer';
import TestResultModal from '../components/modal/TestResultModal';

interface AnswerOption {
  id: string;
  text: string;
}

interface Question {
  id: number;
  questionText: string;
  options: AnswerOption[];
}

interface QuestionGroup {
  id: number;
  title: string;
  questions: Question[];
}

interface TestPart {
  id: number;
  name: string;
  questionGroups: QuestionGroup[];
}

interface Test {
  id: number;
  title: string;
  parts: TestPart[];
}

const TestMode = () => {
  const { id: _id } = useParams();
  const [selectedPartId, setSelectedPartId] = useState<number>(1);
  const [selectedQuestionGroupId, setSelectedQuestionGroupId] =
    useState<number>(1);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number>(1);
  const [timeRemaining, setTimeRemaining] = useState(337); // 5:37 in seconds
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const tabsWrapperRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  const test: Test = {
    id: 1,
    title: 'Đề thi thử N3 (Trận 5)',
    parts: [
      {
        id: 1,
        name: 'CHỮ HÁN',
        questionGroups: [
          {
            id: 1,
            title: 'Nội dung nhóm câu hỏi 1',
            questions: [
              {
                id: 1,
                questionText: '息子は来年「卒業」します。',
                options: [
                  { id: 'A', text: 'さつきょう' },
                  { id: 'B', text: 'そつぎょう' },
                  { id: 'C', text: 'そつきょう' },
                  { id: 'D', text: 'さつぎょう' },
                ],
              },
              {
                id: 2,
                questionText: '彼は「大学」で勉強しています。',
                options: [
                  { id: 'A', text: 'だいがく' },
                  { id: 'B', text: 'たいがく' },
                  { id: 'C', text: 'だいがっ' },
                  { id: 'D', text: 'たいがっ' },
                ],
              },
              {
                id: 3,
                questionText: '彼は「大学」で勉強しています。',
                options: [
                  { id: 'A', text: 'だいがく' },
                  { id: 'B', text: 'たいがく' },
                  { id: 'C', text: 'だいがっ' },
                  { id: 'D', text: 'たいがっ' },
                ],
              },
              {
                id: 8,
                questionText: '彼は「大学」で勉強しています。',
                options: [
                  { id: 'A', text: 'だいがく' },
                  { id: 'B', text: 'たいがく' },
                  { id: 'C', text: 'だいがっ' },
                  { id: 'D', text: 'たいがっ' },
                ],
              },
            ],
          },
          {
            id: 222,
            title: 'Nội dung nhóm câu hỏi 2',
            questions: [
              {
                id: 332,
                questionText: 'この本はとても「面白い」です。',
                options: [
                  { id: 'A', text: 'おもしろい' },
                  { id: 'B', text: 'おもしい' },
                  { id: 'C', text: 'めんしろい' },
                  { id: 'D', text: 'めんしい' },
                ],
              },
            ],
          },
          {
            id: 321,
            title: 'Nội dung nhóm câu hỏi 3',
            questions: [
              {
                id: 42,
                questionText: '私は毎日「勉強」します。',
                options: [
                  { id: 'A', text: 'べんきょう' },
                  { id: 'B', text: 'べんきょ' },
                  { id: 'C', text: 'へんきょう' },
                  { id: 'D', text: 'へんきょ' },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 2,
        name: 'TỪ VỰNG',
        questionGroups: [
          {
            id: 2,
            title: 'Nội dung nhóm câu hỏi 2',
            questions: [
              {
                id: 3,
                questionText: 'この本はとても「面白い」です。',
                options: [
                  { id: 'A', text: 'おもしろい' },
                  { id: 'B', text: 'おもしい' },
                  { id: 'C', text: 'めんしろい' },
                  { id: 'D', text: 'めんしい' },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 3,
        name: 'NGỮ PHÁP',
        questionGroups: [
          {
            id: 3,
            title: 'Nội dung nhóm câu hỏi 3',
            questions: [
              {
                id: 4,
                questionText: '私は毎日「勉強」します。',
                options: [
                  { id: 'A', text: 'べんきょう' },
                  { id: 'B', text: 'べんきょ' },
                  { id: 'C', text: 'へんきょう' },
                  { id: 'D', text: 'へんきょ' },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 4,
        name: 'NGỮ PHÁP (BÀI SAO)',
        questionGroups: [],
      },
      {
        id: 5,
        name: 'NGỮ PHÁP (BÀI ĐỤC LỖ)',
        questionGroups: [],
      },
      {
        id: 6,
        name: 'ĐỌC ĐOẢN VĂN',
        questionGroups: [],
      },
      {
        id: 7,
        name: 'ĐỌC TRUNG',
        questionGroups: [],
      },
      {
        id: 8,
        name: 'ĐỌC TRUNG',
        questionGroups: [],
      },
      {
        id: 9,
        name: 'ĐỌC TRUNG',
        questionGroups: [],
      },
      {
        id: 10,
        name: 'ĐỌC TRUNG',
        questionGroups: [],
      },
      {
        id: 11,
        name: 'ĐỌC TRUNG',
        questionGroups: [],
      },
      {
        id: 12,
        name: 'ĐỌC TRUNG',
        questionGroups: [],
      },
    ],
  };

  const currentPart = test.parts.find(p => p.id === selectedPartId);

  const getCurrentPartQuestions = () => {
    const questions: Array<{ id: number; partId: number; groupId: number }> =
      [];
    const currentPart = test.parts.find(p => p.id === selectedPartId);
    if (currentPart) {
      currentPart.questionGroups.forEach(group => {
        group.questions.forEach(q => {
          questions.push({
            id: q.id,
            partId: currentPart.id,
            groupId: group.id,
          });
        });
      });
    }
    return questions;
  };

  const currentPartQuestions = getCurrentPartQuestions();

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Scroll to question when selectedQuestionId changes
  useEffect(() => {
    const questionKey = `${selectedPartId}-${selectedQuestionGroupId}-${selectedQuestionId}`;
    const questionElement = questionRefs.current[questionKey];
    if (questionElement) {
      requestAnimationFrame(() => {
        questionElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest',
        });
      });
    }
  }, [selectedQuestionId, selectedPartId, selectedQuestionGroupId]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId: number, optionId: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [`${selectedPartId}-${selectedQuestionGroupId}-${questionId}`]: optionId,
    });
  };

  const handleQuestionNavigation = (questionId: number) => {
    const question = currentPartQuestions.find(
      (q: { id: number; partId: number; groupId: number }) =>
        q.id === questionId,
    );
    if (question) {
      setSelectedPartId(question.partId);
      setSelectedQuestionGroupId(question.groupId);
      setSelectedQuestionId(question.id);

      // Scroll to question after state update
      requestAnimationFrame(() => {
        const questionKey = `${question.partId}-${question.groupId}-${question.id}`;
        const questionElement = questionRefs.current[questionKey];
        if (questionElement) {
          questionElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest',
          });
        }
      });
    }
  };

  const handleTabChange = (partId: number) => {
    setSelectedPartId(partId);
    const part = test.parts.find(p => p.id === partId);
    if (part && part.questionGroups.length > 0) {
      setSelectedQuestionGroupId(part.questionGroups[0].id);
      if (part.questionGroups[0].questions.length > 0) {
        setSelectedQuestionId(part.questionGroups[0].questions[0].id);
      }
    }

    // Scroll to selected tab
    requestAnimationFrame(() => {
      const tabElement = tabRefs.current[partId];
      const wrapperElement = tabsWrapperRef.current;
      if (tabElement && wrapperElement) {
        const tabLeft = tabElement.offsetLeft;
        const tabWidth = tabElement.offsetWidth;
        const wrapperWidth = wrapperElement.offsetWidth;

        // Calculate scroll position to center the tab
        const targetScrollLeft = tabLeft - wrapperWidth / 2 + tabWidth / 2;

        wrapperElement.scrollTo({
          left: targetScrollLeft,
          behavior: 'smooth',
        });
      }
    });
  };

  const handleNextPart = () => {
    const currentIndex = test.parts.findIndex(p => p.id === selectedPartId);
    if (currentIndex < test.parts.length - 1) {
      handleTabChange(test.parts[currentIndex + 1].id);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const breadcrumbItems = [
    {
      title: <Link to="/">Trang chủ</Link>,
    },
    {
      title: <Link to="/test-page">Thi thử cùng Mirano</Link>,
    },
    {
      title: test.title,
    },
  ];

  const getQuestionNumber = (questionId: number) => {
    return currentPartQuestions.findIndex(q => q.id === questionId) + 1;
  };

  // Check if a part is completed (all questions answered)
  const isPartCompleted = (partId: number) => {
    const part = test.parts.find(p => p.id === partId);
    if (!part) return false;

    let totalQuestions = 0;
    let answeredQuestions = 0;

    part.questionGroups.forEach(group => {
      group.questions.forEach(q => {
        totalQuestions++;
        const answerKey = `${partId}-${group.id}-${q.id}`;
        if (selectedAnswers[answerKey]) {
          answeredQuestions++;
        }
      });
    });

    return totalQuestions > 0 && answeredQuestions === totalQuestions;
  };

  // Check if current part is the last part
  const isLastPart = () => {
    const currentIndex = test.parts.findIndex(p => p.id === selectedPartId);
    return currentIndex === test.parts.length - 1;
  };

  // Calculate scores for each part
  const getPartScores = () => {
    return test.parts.map(part => {
      let totalQuestions = 0;
      let correctAnswers = 0;

      part.questionGroups.forEach(group => {
        group.questions.forEach(q => {
          totalQuestions++;
          const answerKey = `${part.id}-${group.id}-${q.id}`;
          const selectedAnswer = selectedAnswers[answerKey];
          // TODO: Replace with actual correct answer check from API
          // For now, assume all selected answers are correct
          if (selectedAnswer) {
            correctAnswers++;
          }
        });
      });

      return {
        partId: part.id,
        partName: part.name,
        score: correctAnswers,
        total: totalQuestions,
      };
    });
  };

  // Calculate total score
  const getTotalScore = () => {
    const scores = getPartScores();
    return scores.reduce((sum, part) => sum + part.score, 0);
  };

  const handleSubmitTest = () => {
    setIsResultModalOpen(true);
  };

  return (
    <div className="test-mode-page">
      <div className="test-mode-container">
        {/* Breadcrumb */}
        <div className="test-mode-breadcrumb">
          <div className="breadcrumb-navigation">
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>

        {/* Title */}
        <h1 className="test-mode-title">{test.title}</h1>

        {/* Tabs */}
        <div className="test-mode-tabs">
          <button
            className="test-mode-tab-nav test-mode-tab-nav-left"
            onClick={() => {
              const currentIndex = test.parts.findIndex(
                p => p.id === selectedPartId,
              );
              if (currentIndex > 0) {
                handleTabChange(test.parts[currentIndex - 1].id);
              }
            }}
          >
            <LeftOutlined className="test-mode-tab-nav-icon icon-left" />
          </button>
          <div className="test-mode-tabs-wrapper" ref={tabsWrapperRef}>
            <div className="test-mode-tabs-list">
              {test.parts.map(part => (
                <button
                  key={part.id}
                  ref={el => {
                    tabRefs.current[part.id] = el;
                  }}
                  className={`test-mode-tab ${
                    selectedPartId === part.id ? 'active' : ''
                  } ${isPartCompleted(part.id) ? 'completed' : ''}`}
                  onClick={() => handleTabChange(part.id)}
                >
                  {part.name}
                </button>
              ))}
            </div>
          </div>
          <button
            className="test-mode-tab-nav test-mode-tab-nav-right"
            onClick={() => {
              const currentIndex = test.parts.findIndex(
                p => p.id === selectedPartId,
              );
              if (currentIndex < test.parts.length - 1) {
                handleTabChange(test.parts[currentIndex + 1].id);
              }
            }}
          >
            <RightOutlined className="test-mode-tab-nav-icon icon-right" />
          </button>
        </div>

        {/* Main Content */}
        <div className="test-mode-content">
          {/* Left Panel - Question */}
          <div className="test-mode-question-panel">
            {currentPart?.questionGroups.map(group => (
              <div key={group.id} className="test-mode-question-card">
                <div className="test-mode-question-header">
                  <h3 className="test-mode-question-group-title">
                    {group.title}
                  </h3>
                </div>
                <div className="test-mode-questions-list">
                  {group.questions.map(question => {
                    const answerKey = `${selectedPartId}-${group.id}-${question.id}`;
                    const isCurrent =
                      question.id === selectedQuestionId &&
                      group.id === selectedQuestionGroupId;

                    const questionKey = `${selectedPartId}-${group.id}-${question.id}`;
                    return (
                      <div
                        key={question.id}
                        ref={el => {
                          questionRefs.current[questionKey] = el;
                        }}
                        className={`test-mode-question-item ${
                          isCurrent ? 'current' : ''
                        }`}
                      >
                        <div className="test-mode-question-text-wrapper">
                          <span className="test-mode-question-number">
                            {getQuestionNumber(question.id)}.
                          </span>
                          <span className="test-mode-question-text">
                            {question.questionText}
                          </span>
                        </div>
                        <div className="test-mode-options">
                          {question.options.map(option => {
                            const isOptionSelected =
                              selectedAnswers[answerKey] === option.id;
                            return (
                              <button
                                key={option.id}
                                className={`test-mode-option ${
                                  isOptionSelected ? 'selected' : ''
                                }`}
                                onClick={() =>
                                  handleAnswerSelect(question.id, option.id)
                                }
                              >
                                <span className="test-mode-option-label">
                                  {option.id}
                                </span>
                                <span className="test-mode-option-text">
                                  {option.text}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Right Sidebar */}
          <div className="test-mode-sidebar">
            <div className="test-mode-sidebar-card">
              {/* Timer */}
              <div className="test-mode-timer">
                <div className="test-mode-timer-label">Thời gian còn lại:</div>
                <div className="test-mode-timer-value">
                  {formatTime(timeRemaining)}
                </div>
              </div>

              {/* Question List */}
              <div className="test-mode-question-list">
                <div className="test-mode-question-list-header">
                  Danh sách câu hỏi
                </div>
                <div className="test-mode-question-grid">
                  {currentPartQuestions.map((question, index) => {
                    const questionNum = index + 1;
                    const answerKey = `${question.partId}-${question.groupId}-${question.id}`;
                    const isAnswered = selectedAnswers[answerKey];
                    const isCurrent =
                      question.id === selectedQuestionId &&
                      question.partId === selectedPartId &&
                      question.groupId === selectedQuestionGroupId;

                    return (
                      <button
                        key={question.id}
                        className={`test-mode-question-number-btn ${
                          isCurrent ? 'current' : ''
                        } ${isAnswered ? 'answered' : ''}`}
                        onClick={() => handleQuestionNavigation(question.id)}
                      >
                        {questionNum}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="test-mode-actions">
                <button className="test-mode-action-btn test-mode-action-btn-exit">
                  Thoát
                </button>
                {isLastPart() ? (
                  <button
                    onClick={handleSubmitTest}
                    className="test-mode-action-btn test-mode-action-btn-primary"
                  >
                    Nộp bài
                  </button>
                ) : (
                  <button
                    onClick={handleNextPart}
                    className="test-mode-action-btn test-mode-action-btn-primary"
                  >
                    Chuyển phần
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <FloatButton
        className="test-mode-mobile-float-btn"
        icon={<MenuOutlined />}
        onClick={() => setIsMobileDrawerOpen(true)}
        // tooltip="Danh sách câu hỏi"
      />

      <TestModeDrawer
        open={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        timeRemaining={timeRemaining}
        currentPartQuestions={currentPartQuestions}
        selectedAnswers={selectedAnswers}
        selectedQuestionId={selectedQuestionId}
        selectedPartId={selectedPartId}
        selectedQuestionGroupId={selectedQuestionGroupId}
        onQuestionClick={handleQuestionNavigation}
        onNextPart={handleNextPart}
        formatTime={formatTime}
      />

      {/* Result Modal */}
      <TestResultModal
        open={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        totalScore={getTotalScore()}
        partScores={getPartScores()}
        onGoHome={() => {
          // TODO: Navigate to home page
          console.log('Go home');
        }}
        onReview={() => {
          // TODO: Navigate to review page
          console.log('Review');
        }}
        onContinue={() => {
          // TODO: Continue test logic
          console.log('Continue');
        }}
      />
    </div>
  );
};

export default TestMode;
