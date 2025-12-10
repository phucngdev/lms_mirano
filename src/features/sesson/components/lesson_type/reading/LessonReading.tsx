import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Spin, message, Button } from 'antd';
import {
  ArrowLeftOutlined,
  SoundOutlined,
  PauseOutlined,
} from '@ant-design/icons';
import { getExamByIdLessionService } from '#/api/services/exam.service';
import { updateLessonProgress as updateLessonProgressService } from '#/api/services/lesson-progress.service';
import {
  ExamLessonWithMappingEntity,
  QuestionGroupEntity,
  QuestionEntity,
  MultipleChoiceAnswerDto,
} from '#/api/requests';
import { RootState, useAppDispatch } from '#/src/redux/store/store';
import { updateLessonProgress } from '#/src/redux/slice/lesson.slice';
import LessonReadingResultModal from './components/LessonReadingResultModal';
import './LessonReading.scss';

declare const CryptoJS: any;

interface AnswerState {
  questionId: string;
  selectedOptionIndex: number | null;
}

// Mapping để lưu vị trí gốc của đáp án sau khi random
interface AnswerMapping {
  originalIndex: number; // Vị trí gốc trong mảng
  shuffledIndex: number; // Vị trí sau khi shuffle
}

const LessonReading = () => {
  const { lessonId, sessonId } = useParams<{
    lessonId: string;
    sessonId: string;
  }>();
  const [loading, setLoading] = useState(true);
  const [examData, setExamData] = useState<ExamLessonWithMappingEntity | null>(
    null,
  );
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [showResults, setShowResults] = useState(false);
  const [showExplanations, setShowExplanations] = useState<
    Record<string, boolean>
  >({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const hasUpdatedProgressRef = useRef(false);
  const { data: lessons } = useSelector((state: RootState) => state.lesson);

  // State để lưu question groups đã được shuffle
  const [shuffledQuestionGroups, setShuffledQuestionGroups] = useState<
    QuestionGroupEntity[]
  >([]);

  // State để lưu mapping của answers đã được shuffle cho mỗi question
  const [answerMappings, setAnswerMappings] = useState<
    Record<string, AnswerMapping[]>
  >({});

  // State để lưu shuffled answers cho mỗi question (để hiển thị)
  const [shuffledAnswers, setShuffledAnswers] = useState<
    Record<string, MultipleChoiceAnswerDto[]>
  >({});

  useEffect(() => {
    if (lessonId) {
      fetchReadingData();
    }
  }, [lessonId]);

  const fetchReadingData = async () => {
    if (!lessonId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getExamByIdLessionService(lessonId);

      // Giải mã dữ liệu giống như LessonQuiz
      if (response.data.data.encrypted) {
        const bytes = CryptoJS.AES.decrypt(
          response.data.data.data.toString(),
          import.meta.env.VITE_SECRET_KEY_EXAM,
        );
        const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
        const parsedData = JSON.parse(decryptedString);
        setExamData(parsedData);
      } else {
        // Nếu không encrypted, sử dụng trực tiếp
        setExamData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching reading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Hàm shuffle array
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Lấy chỉ questionGroups từ exam và shuffle nếu cần
  const getQuestionGroups = (): QuestionGroupEntity[] => {
    if (!examData?.exam?.questionMapping) {
      return [];
    }

    const questionGroups: QuestionGroupEntity[] = [];

    examData.exam.questionMapping.forEach(item => {
      if ('questions' in item && Array.isArray(item.questions)) {
        // Đây là QuestionGroupEntity
        questionGroups.push(item as QuestionGroupEntity);
      }
    });

    // Shuffle question groups nếu randomQuestion là true
    if (examData.randomQuestion) {
      return shuffleArray(questionGroups);
    }

    return questionGroups;
  };

  // Khởi tạo question groups và answer mappings khi examData thay đổi
  useEffect(() => {
    if (examData) {
      const groups = getQuestionGroups();
      setShuffledQuestionGroups(groups);

      // Tạo answer mappings và shuffled answers cho mỗi question nếu randomAnswer là true
      const mappings: Record<string, AnswerMapping[]> = {};
      const shuffled: Record<string, MultipleChoiceAnswerDto[]> = {};

      groups.forEach(group => {
        group.questions?.forEach(question => {
          if (question.multipleChoiceAnswers && examData.randomAnswer) {
            const originalAnswers = [...question.multipleChoiceAnswers];
            // Shuffle answers
            const shuffledAnswersArray = shuffleArray(originalAnswers);

            // Tạo mapping từ shuffled index về original index
            const mapping: AnswerMapping[] = shuffledAnswersArray.map(
              (shuffledAnswer, shuffledIndex) => {
                const originalIndex = originalAnswers.findIndex(
                  orig =>
                    orig.content === shuffledAnswer.content &&
                    orig.isCorrect === shuffledAnswer.isCorrect,
                );
                return {
                  originalIndex,
                  shuffledIndex,
                };
              },
            );

            mappings[question.id] = mapping;
            shuffled[question.id] = shuffledAnswersArray;
          } else if (question.multipleChoiceAnswers) {
            // Nếu không random, giữ nguyên thứ tự
            shuffled[question.id] = question.multipleChoiceAnswers;
          }
        });
      });

      setAnswerMappings(mappings);
      setShuffledAnswers(shuffled);
    }
  }, [examData]);

  const questionGroups =
    shuffledQuestionGroups.length > 0
      ? shuffledQuestionGroups
      : examData
        ? getQuestionGroups()
        : [];
  const currentGroup = questionGroups[currentGroupIndex];

  const handleOptionSelect = (questionId: string, optionIndex: number) => {
    if (showResults) return; // Prevent changes after results are shown

    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        questionId,
        selectedOptionIndex: optionIndex,
      },
    }));
  };

  const handlePreviousGroup = () => {
    if (currentGroupIndex > 0) {
      setCurrentGroupIndex(currentGroupIndex - 1);
    }
  };

  const handleCheck = () => {
    setShowResults(true);
  };

  const handleContinue = () => {
    if (currentGroupIndex < questionGroups.length - 1) {
      // Dừng audio nếu đang phát
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
      }
      setCurrentGroupIndex(currentGroupIndex + 1);
      setShowResults(false);
      setShowExplanations({});
    } else {
      // Đã hoàn thành tất cả nhóm, hiển thị modal kết quả
      showResultModalHandler();
    }
  };

  // Tính tổng số câu đúng và tổng số câu
  const calculateResults = () => {
    let totalCorrect = 0;
    let totalQuestions = 0;

    questionGroups.forEach(group => {
      group.questions?.forEach(question => {
        totalQuestions++;
        const answerState = answers[question.id];
        if (
          answerState?.selectedOptionIndex !== null &&
          question.multipleChoiceAnswers
        ) {
          // Nếu có random answer, cần map về vị trí gốc để check
          if (examData?.randomAnswer && answerMappings[question.id]) {
            const mapping = answerMappings[question.id].find(
              m => m.shuffledIndex === answerState.selectedOptionIndex,
            );
            if (mapping) {
              const originalOption =
                question.multipleChoiceAnswers[mapping.originalIndex];
              if (originalOption?.isCorrect) {
                totalCorrect++;
              }
            }
          } else {
            const selectedOption =
              question.multipleChoiceAnswers[
                answerState?.selectedOptionIndex ?? 0
              ];
            if (selectedOption?.isCorrect) {
              totalCorrect++;
            }
          }
        }
      });
    });

    return { totalCorrect, totalQuestions };
  };

  const showResultModalHandler = async () => {
    setShowResultModal(true);

    // Cập nhật progress khi hoàn thành bài làm
    if (lessonId && !hasUpdatedProgressRef.current) {
      try {
        // Call API để cập nhật progress
        await updateLessonProgressService({
          lessonId: lessonId,
          progress: 100, // Hoàn thành = 100%
        });

        // Cập nhật Redux state
        dispatch(updateLessonProgress({ lessonId, progress: 100 }));
        hasUpdatedProgressRef.current = true;
      } catch (error) {
        console.error('Error updating lesson progress:', error);
        message.error('Lỗi khi cập nhật tiến trình bài học');
      }
    }
  };

  const handleCloseModal = () => {
    setShowResultModal(false);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleContinueLearning = () => {
    setShowResultModal(false);

    // Tìm lesson hiện tại
    const currentLesson = lessons.find(lesson => lesson.id === lessonId);

    if (currentLesson) {
      // Sắp xếp lessons theo pos để tìm lesson tiếp theo
      const sortedLessons = [...lessons].sort((a, b) => a.pos - b.pos);
      const currentIndex = sortedLessons.findIndex(
        lesson => lesson.id === lessonId,
      );

      // Tìm lesson tiếp theo
      if (currentIndex >= 0 && currentIndex < sortedLessons.length - 1) {
        const nextLesson = sortedLessons[currentIndex + 1];
        navigate(`/sesson/${sessonId}/lesson/${nextLesson.id}`);
      } else {
        // Không có lesson tiếp theo, quay lại trang trước
        navigate(-1);
      }
    } else {
      // Không tìm thấy lesson hiện tại, quay lại trang trước
      navigate(-1);
    }
  };

  const handleAudioToggle = () => {
    if (!currentGroup?.audioUrl) return;

    // Tạo audio mới nếu chưa có hoặc URL đã thay đổi
    if (!audioRef.current || audioRef.current.src !== currentGroup.audioUrl) {
      // Cleanup audio cũ
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }

      // Tạo audio mới
      audioRef.current = new Audio(currentGroup.audioUrl);
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
      });
      audioRef.current.addEventListener('pause', () => {
        setIsPlaying(false);
      });
      audioRef.current.addEventListener('play', () => {
        setIsPlaying(true);
      });
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
        message.error('Không thể phát audio');
      });
    }
  };

  // Cleanup audio khi unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  // Reset audio khi chuyển nhóm
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      // Reset audio để tạo lại với URL mới nếu cần
      if (
        currentGroup?.audioUrl &&
        audioRef.current.src !== currentGroup.audioUrl
      ) {
        audioRef.current.src = '';
        audioRef.current = null;
      }
    }
  }, [currentGroupIndex, currentGroup?.audioUrl]);

  const toggleExplanation = (questionId: string) => {
    setShowExplanations(prev => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const isOptionCorrect = (
    question: QuestionEntity,
    optionIndex: number,
  ): boolean => {
    if (!question.multipleChoiceAnswers || !showResults) return false;

    // Nếu có random answer, cần map về vị trí gốc
    if (examData?.randomAnswer && answerMappings[question.id]) {
      const mapping = answerMappings[question.id].find(
        m => m.shuffledIndex === optionIndex,
      );
      if (mapping) {
        const originalOption =
          question.multipleChoiceAnswers[mapping.originalIndex];
        return originalOption?.isCorrect || false;
      }
      return false;
    }

    // Nếu không random, sử dụng trực tiếp
    const option = question.multipleChoiceAnswers[optionIndex];
    return option?.isCorrect || false;
  };

  const isOptionSelected = (
    questionId: string,
    optionIndex: number,
  ): boolean => {
    return answers[questionId]?.selectedOptionIndex === optionIndex;
  };

  const getOptionState = (
    question: QuestionEntity,
    optionIndex: number,
  ): 'correct' | 'incorrect' | 'neutral' => {
    if (!showResults) return 'neutral';
    const isSelected = isOptionSelected(question.id, optionIndex);
    const isCorrect = isOptionCorrect(question, optionIndex);
    if (isSelected && isCorrect) return 'correct';
    if (isSelected && !isCorrect) return 'incorrect';
    return 'neutral';
  };

  if (loading) {
    return (
      <div className="lesson-reading">
        <div className="lesson-reading-loading">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (!examData || questionGroups.length === 0) {
    return (
      <div className="lesson-reading">
        <div className="lesson-reading-empty">
          <p>Không có dữ liệu bài đọc</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lesson-reading">
      <div className="lesson-reading-container">
        {/* Left Panel - Question Group Content */}
        <div className="lesson-reading-left">
          <div className="lesson-reading-content-card">
            <div className="lesson-reading-content-header">
              <h3 className="lesson-reading-content-title">
                Nội dung nhóm câu hỏi
              </h3>
              {currentGroup?.audioUrl && (
                <button
                  className="lesson-reading-audio-btn"
                  onClick={handleAudioToggle}
                  aria-label={isPlaying ? 'Dừng audio' : 'Phát audio'}
                >
                  {isPlaying ? (
                    <PauseOutlined className="lesson-reading-audio-icon" />
                  ) : (
                    <SoundOutlined className="lesson-reading-audio-icon" />
                  )}
                </button>
              )}
            </div>
            <div className="lesson-reading-content-body">
              {currentGroup?.content && (
                <div
                  className="lesson-reading-text"
                  dangerouslySetInnerHTML={{ __html: currentGroup.content }}
                />
              )}
            </div>
            <div className="lesson-reading-group-info">
              Nhóm câu {currentGroupIndex + 1}/{questionGroups.length}
            </div>
          </div>
        </div>

        {/* Right Panel - Questions */}
        <div className="lesson-reading-right">
          <div className="lesson-reading-questions-card">
            <div className="lesson-reading-questions-scroll">
              {currentGroup?.questions?.map((question, questionIndex) => {
                const isMultipleChoice =
                  question.type === QuestionEntity.type.MULTIPLE_CHOICE;

                return (
                  <div
                    key={question.id}
                    className="lesson-reading-question-item"
                  >
                    {/* Question Number and Content */}
                    <div className="lesson-reading-question-header">
                      <span className="lesson-reading-question-number">
                        {questionIndex + 1}.
                      </span>
                      <div
                        className="lesson-reading-question-content"
                        dangerouslySetInnerHTML={{ __html: question.content }}
                      />
                    </div>

                    {/* Multiple Choice Options */}
                    {isMultipleChoice && question.multipleChoiceAnswers && (
                      <div className="lesson-reading-options">
                        {(
                          shuffledAnswers[question.id] ||
                          question.multipleChoiceAnswers
                        ).map(
                          (
                            option: MultipleChoiceAnswerDto,
                            displayIndex: number,
                          ) => {
                            // displayIndex là vị trí hiển thị (shuffled nếu có random)
                            const optionLabel = String.fromCharCode(
                              65 + displayIndex,
                            ); // A, B, C, D
                            const state = getOptionState(
                              question,
                              displayIndex,
                            );
                            const isSelected = isOptionSelected(
                              question.id,
                              displayIndex,
                            );

                            return (
                              <button
                                key={`${question.id}-${displayIndex}`}
                                className={`lesson-reading-option ${
                                  isSelected ? 'selected' : ''
                                } ${state === 'correct' ? 'correct' : ''} ${
                                  state === 'incorrect' ? 'incorrect' : ''
                                }`}
                                onClick={() =>
                                  handleOptionSelect(question.id, displayIndex)
                                }
                                disabled={showResults}
                              >
                                <span className="lesson-reading-option-label">
                                  {optionLabel}
                                </span>
                                <span
                                  className="lesson-reading-option-text"
                                  dangerouslySetInnerHTML={{
                                    __html: option.content,
                                  }}
                                />
                              </button>
                            );
                          },
                        )}
                      </div>
                    )}

                    {/* Explanation Button and Content */}
                    {showResults &&
                      question.explain &&
                      !examData?.showSolution && (
                        <div className="lesson-reading-explanation-section">
                          <Button
                            className="lesson-reading-explanation-btn"
                            onClick={() => toggleExplanation(question.id)}
                            type="default"
                          >
                            {showExplanations[question.id]
                              ? 'Ẩn giải thích'
                              : 'Xem giải thích'}
                          </Button>
                          {showExplanations[question.id] && (
                            <div className="lesson-reading-explanation-content">
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: question.explain,
                                }}
                              />
                            </div>
                          )}
                        </div>
                      )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="lesson-reading-navigation">
        {/* Chỉ hiển thị nút quay lại nếu showAnswer là false */}
        {!examData?.showAnswer && (
          <Button
            className="lesson-reading-nav-btn prev"
            onClick={handlePreviousGroup}
            disabled={currentGroupIndex === 0}
            icon={<ArrowLeftOutlined />}
          >
            Câu trước
          </Button>
        )}

        {/* Nếu showAnswer là false, không có nút kiểm tra, chỉ có tiếp tục */}
        {!examData?.showAnswer ? (
          <Button
            className="lesson-reading-nav-btn continue"
            onClick={handleContinue}
          >
            {currentGroupIndex === questionGroups.length - 1
              ? 'Hoàn thành'
              : 'Tiếp tục'}
          </Button>
        ) : (
          <>
            {/* Nếu showAnswer là true, có nút kiểm tra */}
            {!showResults ? (
              <Button
                className="lesson-reading-nav-btn check"
                onClick={handleCheck}
              >
                Kiểm tra
              </Button>
            ) : (
              <Button
                className="lesson-reading-nav-btn continue"
                onClick={handleContinue}
              >
                {currentGroupIndex === questionGroups.length - 1
                  ? 'Hoàn thành'
                  : 'Tiếp tục'}
              </Button>
            )}
          </>
        )}
      </div>

      {/* Result Modal */}
      <LessonReadingResultModal
        open={showResultModal}
        totalCorrect={calculateResults().totalCorrect}
        totalQuestions={calculateResults().totalQuestions}
        onClose={handleCloseModal}
        onGoBack={handleGoBack}
        onContinue={handleContinueLearning}
      />
    </div>
  );
};

export default LessonReading;
