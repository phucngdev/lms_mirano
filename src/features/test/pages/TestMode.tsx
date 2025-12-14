import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Breadcrumb, FloatButton, Spin, message } from 'antd';
import './TestMode.scss';
import { LeftOutlined, MenuOutlined, RightOutlined } from '@ant-design/icons';
import {
  getTestDetailByIdTestService,
  postTestService,
} from '#/api/services/mockTest.service';
import {
  GroupedTestDetailEntity,
  CreateTestResultDto,
  MultipleChoiceUserAnswerDto,
  MultipleChoiceAnswerDto,
} from '#/api/requests';
import Cookies from 'js-cookie';
import TestModeDrawer from '../components/drawer/TestModeDrawer';
import TestResultModal from '../components/modal/TestResultModal';

interface AnswerOption {
  id: string;
  text: string;
}

interface Question {
  id: string;
  questionText: string;
  options: AnswerOption[];
  type?: string; // Lưu type từ API để phân biệt MULTIPLE_CHOICE và MULTIPLE_CHOICE_HORIZONTAL
  originalOptions?: Array<{
    // Lưu original options từ API để check isCorrect
    isCorrect: boolean;
    content: string;
  }>;
  optionMapping?: Array<number>; // Mapping từ shuffled index về original index
}

interface QuestionGroup {
  id: string;
  title: string;
  questions: Question[];
}

interface TestPart {
  id: string;
  name: string;
  point: number; // Điểm của mỗi câu hỏi trong part này
  questionGroups: QuestionGroup[];
}

interface Test {
  id: string;
  title: string;
  randomAnswer: boolean; // Có random vị trí đáp án hay không
  parts: TestPart[];
}

const TestMode = () => {
  const navigate = useNavigate();
  const { id: testId, test_detail_id: testDetailId } = useParams<{
    id: string;
    test_detail_id: string;
  }>();
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPartId, setSelectedPartId] = useState<string>('');
  const [selectedQuestionGroupId, setSelectedQuestionGroupId] =
    useState<string>('');
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const tabsWrapperRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Get userId from cookies
  const user = Cookies.get('user')
    ? JSON.parse(Cookies.get('user') as string)
    : null;
  const userId = user?.id || '';

  // Hàm shuffle array
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    if (testId) {
      fetchTestData();
    }
  }, [testId]);

  const fetchTestData = async () => {
    if (!testId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Tăng limit để lấy tất cả parts
      const response = await getTestDetailByIdTestService(testId, 100, 0);
      const apiData = response.data;

      if (apiData.statusCode === 200 && apiData.data?.items) {
        // Lấy item đầu tiên (test chính)
        const groupedData = apiData.data.items[0] as GroupedTestDetailEntity;
        const randomAnswer = groupedData.testId.randomAnswer;

        // Collect tất cả parts từ tất cả items (nếu có nhiều items)
        const allParts: TestPart[] = [];

        apiData.data.items.forEach((item: GroupedTestDetailEntity) => {
          item.details.forEach(detail => {
            allParts.push({
              id: detail.id,
              name: detail.name,
              point: detail.point, // Lưu point của mỗi part
              questionGroups: detail.questionGroups.map(group => ({
                id: group.id,
                title: group.content || '',
                questions: group.questions
                  .filter(
                    q =>
                      q.type === 'MULTIPLE_CHOICE' ||
                      q.type === 'MULTIPLE_CHOICE_HORIZONTAL',
                  )
                  .map(question => {
                    const originalOptions =
                      question.multipleChoiceAnswers ||
                      question.multipleChoiceHorizontal ||
                      [];

                    // Chỉ shuffle nếu randomAnswer là true
                    const finalOptions = randomAnswer
                      ? shuffleArray(originalOptions)
                      : originalOptions;

                    // Tạo mapping từ shuffled index về original index
                    // Nếu không shuffle, mapping sẽ là [0, 1, 2, 3, ...]
                    const optionMapping: number[] = finalOptions.map(
                      (
                        shuffledOpt: {
                          isCorrect: boolean;
                          content: string;
                        },
                        shuffledIndex: number,
                      ) => {
                        // Tìm index trong originalOptions
                        const originalIndex = originalOptions.findIndex(
                          origOpt =>
                            origOpt.content === shuffledOpt.content &&
                            origOpt.isCorrect === shuffledOpt.isCorrect,
                        );
                        // Nếu không tìm thấy, fallback về shuffledIndex (trường hợp không shuffle)
                        return originalIndex !== -1
                          ? originalIndex
                          : shuffledIndex;
                      },
                    );

                    return {
                      id: question.id,
                      questionText: question.content || '',
                      type: question.type, // Lưu type để phân biệt
                      originalOptions: originalOptions.map(opt => ({
                        isCorrect: opt.isCorrect,
                        content: opt.content || '',
                      })),
                      optionMapping: optionMapping, // Lưu mapping
                      options: finalOptions.map(
                        (
                          option: { isCorrect: boolean; content: string },
                          index: number,
                        ) => ({
                          id: String.fromCharCode(65 + index), // A, B, C, D
                          text: option.content || '',
                        }),
                      ),
                    };
                  }),
              })),
            });
          });
        });

        // Map data từ API vào structure
        const mappedTest: Test = {
          id: groupedData.testId.id,
          title: groupedData.testId.name,
          randomAnswer: randomAnswer, // Lưu randomAnswer
          parts: allParts,
        };

        setTest(mappedTest);

        // Set initial selected part, group, and question
        if (mappedTest.parts.length > 0) {
          const firstPart = mappedTest.parts[0];
          setSelectedPartId(firstPart.id);
          if (firstPart.questionGroups.length > 0) {
            const firstGroup = firstPart.questionGroups[0];
            setSelectedQuestionGroupId(firstGroup.id);
            if (firstGroup.questions.length > 0) {
              setSelectedQuestionId(firstGroup.questions[0].id);
            }
          }
        }

        // Set timer với duration từ testId (tính bằng phút, chuyển sang giây)
        const durationInSeconds = groupedData.testId.duration * 60;
        setTimeRemaining(durationInSeconds);
      }
    } catch (error) {
      console.error('Error fetching test data:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentPart = test?.parts.find(p => p.id === selectedPartId);

  const getCurrentPartQuestions = () => {
    const questions: Array<{ id: string; partId: string; groupId: string }> =
      [];
    const currentPart = test?.parts.find(p => p.id === selectedPartId);
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

  const handleAnswerSelect = (questionId: string, optionId: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [`${selectedPartId}-${selectedQuestionGroupId}-${questionId}`]: optionId,
    });
  };

  const handleQuestionNavigation = (questionId: string) => {
    const question = currentPartQuestions.find(
      (q: { id: string; partId: string; groupId: string }) =>
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

  const handleTabChange = (partId: string) => {
    setSelectedPartId(partId);
    const part = test?.parts.find(p => p.id === partId);
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
    if (!test) return;
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
      title: test?.title || 'Đề thi',
    },
  ];

  const getQuestionNumber = (questionId: string) => {
    return currentPartQuestions.findIndex(q => q.id === questionId) + 1;
  };

  // Check if a part is completed (all questions answered)
  const isPartCompleted = (partId: string) => {
    const part = test?.parts.find(p => p.id === partId);
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
    if (!test) return false;
    const currentIndex = test.parts.findIndex(p => p.id === selectedPartId);
    return currentIndex === test.parts.length - 1;
  };

  // Calculate scores for each part
  const getPartScores = () => {
    if (!test) return [];

    // Tạo map để tìm part của mỗi question
    const questionToPartMap = new Map<string, string>();
    test.parts.forEach(part => {
      part.questionGroups.forEach(group => {
        group.questions.forEach(question => {
          questionToPartMap.set(question.id, part.id);
        });
      });
    });

    // Convert answers để lấy isCorrect
    const userAnswers = convertAnswersToUserAnswers();

    // Tạo map từ questionId -> isCorrect và đã trả lời
    const questionCorrectMap = new Map<string, boolean>();
    const questionAnsweredMap = new Map<string, boolean>();
    userAnswers.forEach(userAnswer => {
      const answer = userAnswer.answer[0];
      if (answer) {
        const isCorrect = answer.isCorrect === true;
        questionCorrectMap.set(userAnswer.questionId, isCorrect);
        questionAnsweredMap.set(userAnswer.questionId, true);
      }
    });

    return test.parts.map(part => {
      let totalQuestions = 0;
      let correctAnswers = 0;

      part.questionGroups.forEach(group => {
        group.questions.forEach(question => {
          // Chỉ tính MULTIPLE_CHOICE
          if (question.type !== 'MULTIPLE_CHOICE') return;

          // Chỉ tính những câu đã trả lời
          const isAnswered = questionAnsweredMap.get(question.id) === true;
          if (!isAnswered) return; // Bỏ qua câu chưa trả lời

          totalQuestions++;

          // Check isCorrect từ questionCorrectMap
          // Chỉ tính câu đúng
          const isCorrect = questionCorrectMap.get(question.id) === true;
          if (isCorrect) {
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

  // Convert selectedAnswers to MultipleChoiceUserAnswerDto[]
  const convertAnswersToUserAnswers = (): MultipleChoiceUserAnswerDto[] => {
    const userAnswers: MultipleChoiceUserAnswerDto[] = [];

    if (!test) return userAnswers;

    // Duyệt qua tất cả parts, groups, và questions
    test.parts.forEach(part => {
      part.questionGroups.forEach(group => {
        group.questions.forEach(question => {
          // Chỉ lưu MULTIPLE_CHOICE (không lưu MULTIPLE_CHOICE_HORIZONTAL)
          if (question.type !== 'MULTIPLE_CHOICE') {
            return; // Bỏ qua MULTIPLE_CHOICE_HORIZONTAL và các type khác
          }

          const answerKey = `${part.id}-${group.id}-${question.id}`;
          const selectedOptionId = selectedAnswers[answerKey];

          if (selectedOptionId) {
            // Tìm option được chọn (shuffled index)
            const selectedShuffledIndex = question.options.findIndex(
              opt => opt.id === selectedOptionId,
            );

            if (selectedShuffledIndex !== -1) {
              const selectedOption = question.options[selectedShuffledIndex];

              // Map về original index để check isCorrect
              const originalIndex =
                question.optionMapping?.[selectedShuffledIndex] ?? -1;

              if (
                originalIndex !== -1 &&
                originalIndex < (question.originalOptions?.length || 0)
              ) {
                const originalOption =
                  question.originalOptions?.[originalIndex];
                const isCorrect = originalOption?.isCorrect === true;

                const answerDto: MultipleChoiceAnswerDto = {
                  isCorrect: isCorrect,
                  content: selectedOption.text,
                };

                const userAnswer: MultipleChoiceUserAnswerDto = {
                  questionId: question.id,
                  questionType:
                    MultipleChoiceUserAnswerDto.questionType.MULTIPLE_CHOICE,
                  answer: [answerDto],
                };

                userAnswers.push(userAnswer);
              }
            }
          }
        });
      });
    });

    console.log(userAnswers);

    return userAnswers;
  };

  const handleSubmitTest = async () => {
    if (!test || !testId || !userId) {
      message.error('Thiếu thông tin để nộp bài');
      return;
    }

    try {
      // Convert answers
      const userAnswers = convertAnswersToUserAnswers();

      // Calculate score dựa trên userAnswers và point của mỗi part
      // Mỗi câu đúng sẽ được cộng point của part đó
      let totalScore = 0;

      // Tạo map để tìm part của mỗi question
      const questionToPartMap = new Map<string, string>();
      test.parts.forEach(part => {
        part.questionGroups.forEach(group => {
          group.questions.forEach(question => {
            questionToPartMap.set(question.id, part.id);
          });
        });
      });

      // Duyệt qua userAnswers và tính điểm
      userAnswers.forEach(userAnswer => {
        // Chỉ tính những câu đúng
        const answer = userAnswer.answer[0];
        if (!answer) return;

        const isCorrect = answer.isCorrect === true;
        if (!isCorrect) return; // Bỏ qua câu sai

        // Tìm part của câu hỏi này
        const partId = questionToPartMap.get(userAnswer.questionId);
        if (!partId) return;

        // Tìm part để lấy point
        const part = test.parts.find(p => p.id === partId);
        if (part) {
          // Cộng point của part vào tổng điểm (chỉ khi đúng)
          totalScore += part.point;
        }
      });

      const score = totalScore;

      // Prepare data
      const testResultData: CreateTestResultDto = {
        userId: userId,
        testId: testId,
        score: score,
        userAnswers: userAnswers,
      };

      // Call API
      await postTestService(testResultData);
      message.success('Nộp bài thành công');

      // Show result modal
      setIsResultModalOpen(true);
    } catch (error: any) {
      console.error('Error submitting test:', error);
      message.error(
        error.response?.data?.message || 'Lỗi khi nộp bài. Vui lòng thử lại',
      );
    }
  };

  if (loading) {
    return (
      <div className="test-mode-page">
        <div className="test-mode-loading">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="test-mode-page">
        <div className="test-mode-empty">
          <p>Không tìm thấy đề thi</p>
        </div>
      </div>
    );
  }

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
              if (!test) return;
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
              if (!test) return;
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
                          <span
                            className="test-mode-question-text"
                            dangerouslySetInnerHTML={{
                              __html: question.questionText,
                            }}
                          ></span>
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
          navigate('/');
        }}
        onReview={() => {}}
        onContinue={() => {
          navigate(`/test-detail/${testDetailId}`);
        }}
      />
    </div>
  );
};

export default TestMode;
