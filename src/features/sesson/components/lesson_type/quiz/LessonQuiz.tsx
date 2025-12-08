import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  CheckOutlined,
  CloseOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import {
  ExamLessonWithMappingEntity,
  LessonStudentEntity,
  SortingAnswerDto,
} from '#/api/requests';
import { QuestionEntity } from '#/api/requests/models/QuestionEntity';
import { QuestionGroupEntity } from '#/api/requests/models/QuestionGroupEntity';
import { ExamWithMappingEntity } from '#/api/requests/models/ExamWithMappingEntity';
import FillInBlankQuestion from './components/FillInBlankQuestion';
import MatchingQuestion from './components/MatchingQuestion';
import SortingQuestion from './components/SortingQuestion';
import ChooseAnswerInBlankQuestion from './components/ChooseAnswerInBlankQuestion';
import EssayQuestion from './components/EssayQuestion';
import QuestionGroup from './components/QuestionGroup';
import { message, Spin, type UploadFile } from 'antd';
import './LessonQuiz.scss';
import { getExamLessionByLessonIdService } from '#/api/services/examLesson.service';
import { useParams } from 'react-router-dom';

interface LessonQuizProps {
  lesson?: LessonStudentEntity;
  questions?: QuestionEntity[];
  questionGroups?: QuestionGroupEntity[];
  examWithMapping?: ExamWithMappingEntity; // New prop for unified question mapping
}

interface AnswerState {
  questionId: string;
  selectedOptionIndex: number | null;
  fillInBlankAnswers: Record<number, string>; // blankIndex -> answer
  matchingAnswers: Record<string, string>; // leftIndex -> rightIndex
  sortingAnswers: Record<number, string>; // position -> step content
  essayFiles: UploadFile[]; // uploaded files for essay
  isCorrect: boolean | null; // null = not checked yet, true = correct, false = incorrect
}

const LessonQuiz: React.FC<LessonQuizProps> = ({
  questions = [],
  questionGroups = [],
  examWithMapping,
}) => {
  const { lessonId } = useParams();
  const [loading, setLoading] = useState(false);
  const [exam, setExam] = useState<ExamLessonWithMappingEntity | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [showResults, setShowResults] = useState(false);
  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const shouldScrollRef = useRef(false);

  const fetchExam = async () => {
    try {
      setLoading(true);
      const response = await getExamLessionByLessonIdService(lessonId || '');
      const bytes = CryptoJS.AES.decrypt(
        response.data.data.data.toString(),
        import.meta.env.VITE_SECRET_KEY_EXAM,
      );
      const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
      const parsedData = JSON.parse(decryptedString);
      setExam(parsedData);
      setShowResults(false);
      setCurrentQuestionIndex(0);
      setAnswers({});
    } catch (error) {
      console.error(error);
      message.error('Lỗi khi tải bài học');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExam();
  }, [lessonId]);

  // Initialize answers state - only when questions change
  const questionIds = useMemo(
    () => questions.map(q => q.id).join(','),
    [questions],
  );

  useEffect(() => {
    if (questions.length === 0) return;

    setAnswers(prev => {
      // Check if answers already exist for all questions
      const existingIds = Object.keys(prev);
      const newIds = questions.map(q => q.id);
      const idsMatch =
        existingIds.length === newIds.length &&
        existingIds.every(id => newIds.includes(id));

      // Only update if questions actually changed
      if (idsMatch) {
        return prev;
      }

      const initialAnswers: Record<string, AnswerState> = {};
      questions.forEach(q => {
        initialAnswers[q.id] = prev[q.id] || {
          questionId: q.id,
          selectedOptionIndex: null,
          fillInBlankAnswers: {},
          matchingAnswers: {},
          sortingAnswers: {},
          isCorrect: null,
        };
      });
      return initialAnswers;
    });
  }, [questionIds, questions.length]);

  const handleOptionSelect = (questionId: string, optionIndex: number) => {
    if (showResults) return; // Prevent changes after results are shown

    setAnswers(prev => {
      const currentAnswer = prev[questionId] || {
        questionId,
        selectedOptionIndex: null,
        fillInBlankAnswers: {},
        matchingAnswers: {},
        sortingAnswers: {},
        isCorrect: null,
      };

      return {
        ...prev,
        [questionId]: {
          ...currentAnswer,
          selectedOptionIndex: optionIndex,
        },
      };
    });

    // Auto-check answer if results are shown
    if (showResults) {
      checkAnswer(questionId, optionIndex);
    }
  };

  const handleFillInBlankChange = (
    questionId: string,
    blankIndex: number,
    value: string,
  ) => {
    if (showResults) return; // Prevent changes after results are shown

    setAnswers(prev => {
      const currentAnswer = prev[questionId] || {
        questionId,
        selectedOptionIndex: null,
        fillInBlankAnswers: {},
        matchingAnswers: {},
        sortingAnswers: {},
        isCorrect: null,
      };

      return {
        ...prev,
        [questionId]: {
          ...currentAnswer,
          fillInBlankAnswers: {
            ...currentAnswer.fillInBlankAnswers,
            [blankIndex]: value,
          },
        },
      };
    });
  };

  const handleChooseAnswerInBlankChange = (
    questionId: string,
    blankIndex: number,
    value: string,
  ) => {
    if (showResults) return; // Prevent changes after results are shown

    setAnswers(prev => {
      const currentAnswer = prev[questionId] || {
        questionId,
        selectedOptionIndex: null,
        fillInBlankAnswers: {},
        matchingAnswers: {},
        sortingAnswers: {},
        isCorrect: null,
      };

      return {
        ...prev,
        [questionId]: {
          ...currentAnswer,
          fillInBlankAnswers: {
            ...currentAnswer.fillInBlankAnswers,
            [blankIndex]: value,
          },
        },
      };
    });
  };

  const handleMatchingSelect = (
    questionId: string,
    leftIndex: number,
    rightIndex: number,
  ) => {
    if (showResults) return; // Prevent changes after results are shown

    setAnswers(prev => {
      const currentAnswer = prev[questionId] || {
        questionId,
        selectedOptionIndex: null,
        fillInBlankAnswers: {},
        matchingAnswers: {},
        sortingAnswers: {},
        isCorrect: null,
      };

      const newMatchingAnswers = { ...currentAnswer.matchingAnswers };

      if (rightIndex === -1) {
        // Deselect
        delete newMatchingAnswers[leftIndex.toString()];
      } else {
        // Remove any existing match for this left or right
        // Remove old match for this left
        delete newMatchingAnswers[leftIndex.toString()];

        // Remove old match for this right
        Object.keys(newMatchingAnswers).forEach(key => {
          if (newMatchingAnswers[key] === rightIndex.toString()) {
            delete newMatchingAnswers[key];
          }
        });

        // Add new match
        newMatchingAnswers[leftIndex.toString()] = rightIndex.toString();
      }

      return {
        ...prev,
        [questionId]: {
          ...currentAnswer,
          matchingAnswers: newMatchingAnswers,
        },
      };
    });
  };

  const handleSortingSelect = (
    questionId: string,
    position: number,
    stepContent: string | null,
  ) => {
    if (showResults) return; // Prevent changes after results are shown

    setAnswers(prev => {
      const currentAnswer = prev[questionId] || {
        questionId,
        selectedOptionIndex: null,
        fillInBlankAnswers: {},
        matchingAnswers: {},
        sortingAnswers: {},
        essayFiles: [],
        isCorrect: null,
      };

      const newSortingAnswers = { ...currentAnswer.sortingAnswers };

      if (stepContent === null) {
        // Remove step from position
        delete newSortingAnswers[position];
      } else {
        // Remove step from any existing position first
        Object.keys(newSortingAnswers).forEach(key => {
          if (newSortingAnswers[parseInt(key)] === stepContent) {
            delete newSortingAnswers[parseInt(key)];
          }
        });
        // Add step to new position
        newSortingAnswers[position] = stepContent;
      }

      return {
        ...prev,
        [questionId]: {
          ...currentAnswer,
          sortingAnswers: newSortingAnswers,
        },
      };
    });
  };

  const handleEssayFileChange = (questionId: string, files: UploadFile[]) => {
    setAnswers(prev => {
      const currentAnswer = prev[questionId] || {
        questionId,
        selectedOptionIndex: null,
        fillInBlankAnswers: {},
        matchingAnswers: {},
        sortingAnswers: {},
        essayFiles: [],
        isCorrect: null,
      };

      return {
        ...prev,
        [questionId]: {
          ...currentAnswer,
          essayFiles: files,
        },
      };
    });
  };

  // Seed-based shuffle function to ensure consistent shuffling
  const seededShuffle = <T,>(array: T[], seed: number): T[] => {
    const shuffled = [...array];
    // Simple seeded random number generator
    let random = seed;
    const next = () => {
      random = (random * 9301 + 49297) % 233280;
      return random / 233280;
    };
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(next() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Helper function to find a question by ID from questionMapping (including groups)
  const findQuestionById = (questionId: string): QuestionEntity | null => {
    if (!exam?.exam.questionMapping) return null;

    // First, try to find directly in questionMapping
    const directMatch = exam.exam.questionMapping.find(
      q => 'id' in q && q.id === questionId && 'type' in q,
    ) as QuestionEntity | undefined;

    if (directMatch) return directMatch;

    // If not found, search in question groups
    for (const item of exam.exam.questionMapping) {
      if ('questions' in item && Array.isArray(item.questions)) {
        const questionInGroup = item.questions.find(q => q.id === questionId);
        if (questionInGroup) return questionInGroup;
      }
    }

    return null;
  };

  const checkAnswer = (questionId: string, optionIndex?: number) => {
    const question = findQuestionById(questionId);
    if (!question) return;

    // Check multiple choice horizontal
    if (
      'type' in question &&
      question.type === QuestionEntity.type.MULTIPLE_CHOICE_HORIZONTAL &&
      optionIndex !== undefined
    ) {
      const selectedAnswer = question.multipleChoiceHorizontal?.[optionIndex];
      const isCorrect = selectedAnswer?.isCorrect || false;

      setAnswers(prev => {
        const currentAnswer = prev[questionId] || {
          questionId,
          selectedOptionIndex: null,
          fillInBlankAnswers: {},
          matchingAnswers: {},
          sortingAnswers: {},
          isCorrect: null,
        };

        return {
          ...prev,
          [questionId]: {
            ...currentAnswer,
            selectedOptionIndex: optionIndex,
            isCorrect,
          },
        };
      });
      return;
    }

    // Check multiple choice
    if (
      'type' in question &&
      question.type === QuestionEntity.type.MULTIPLE_CHOICE &&
      optionIndex !== undefined
    ) {
      const selectedAnswer = question.multipleChoiceAnswers?.[optionIndex];
      const isCorrect = selectedAnswer?.isCorrect || false;

      setAnswers(prev => {
        const currentAnswer = prev[questionId] || {
          questionId,
          selectedOptionIndex: null,
          fillInBlankAnswers: {},
          matchingAnswers: {},
          sortingAnswers: {},
          isCorrect: null,
        };

        return {
          ...prev,
          [questionId]: {
            ...currentAnswer,
            selectedOptionIndex: optionIndex,
            isCorrect,
          },
        };
      });
      return;
    }

    // Check fill in blank
    if (
      'type' in question &&
      question.type === QuestionEntity.type.FILL_IN_BLANK
    ) {
      setAnswers(prev => {
        const answer = prev[questionId] || {
          questionId,
          selectedOptionIndex: null,
          fillInBlankAnswers: {},
          matchingAnswers: {},
          sortingAnswers: {},
          isCorrect: null,
        };

        const fillInBlankAnswers = question.fillInBlank || [];
        let allCorrect = true;

        fillInBlankAnswers.forEach(blankAnswer => {
          const userAnswer = answer.fillInBlankAnswers[blankAnswer.index]
            ?.trim()
            .toLowerCase();
          const correctAnswer = blankAnswer.correctAnswer?.trim().toLowerCase();

          if (userAnswer !== correctAnswer) {
            allCorrect = false;
          }
        });

        return {
          ...prev,
          [questionId]: {
            ...answer,
            isCorrect: allCorrect,
          },
        };
      });
      return;
    }

    // Check choose answer in blank
    if (
      'type' in question &&
      question.type === QuestionEntity.type.CHOOSE_ANSWER_IN_BLANK
    ) {
      setAnswers(prev => {
        const answer = prev[questionId] || {
          questionId,
          selectedOptionIndex: null,
          fillInBlankAnswers: {},
          matchingAnswers: {},
          sortingAnswers: {},
          isCorrect: null,
        };

        const chooseAnswerInBlank = question.chooseAnswerInBlank || [];
        let allCorrect = true;

        chooseAnswerInBlank.forEach(blankAnswer => {
          const userAnswer = answer.fillInBlankAnswers[blankAnswer.index]
            ?.trim()
            .toLowerCase();
          const correctAnswer = blankAnswer.correctAnswer?.trim().toLowerCase();

          if (userAnswer !== correctAnswer) {
            allCorrect = false;
          }
        });

        return {
          ...prev,
          [questionId]: {
            ...answer,
            isCorrect: allCorrect,
          },
        };
      });
      return;
    }

    // Check matching
    if ('type' in question && question.type === QuestionEntity.type.MATCHING) {
      setAnswers(prev => {
        const answer = prev[questionId] || {
          questionId,
          selectedOptionIndex: null,
          fillInBlankAnswers: {},
          matchingAnswers: {},
          sortingAnswers: {},
          isCorrect: null,
        };

        const matchingAnswers = question.matchingAnswers || [];

        // Get left options from matchingAnswers (unique left values) - same as MatchingQuestion.tsx
        const leftOptionsSet = new Set<string>();
        matchingAnswers.forEach(match => {
          if (match.left) leftOptionsSet.add(match.left);
        });
        const leftOptionsArray = Array.from(leftOptionsSet);

        // Get right options from matchingAnswers (unique right values) - same as MatchingQuestion.tsx
        const rightOptionsSet = new Set<string>();
        matchingAnswers.forEach(match => {
          if (match.right) rightOptionsSet.add(match.right);
        });
        const rightOptionsArray = Array.from(rightOptionsSet);

        // Shuffle with seed based on questionId to match MatchingQuestion's shuffle
        // Use a simple hash of questionId as seed
        const seed = questionId
          .split('')
          .reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const leftOptions = seededShuffle(leftOptionsArray, seed);
        const rightOptions = seededShuffle(rightOptionsArray, seed + 1);

        let allCorrect = true;
        let hasMatches = false;

        // Check if user has any matches
        if (Object.keys(answer.matchingAnswers).length === 0) {
          return {
            ...prev,
            [questionId]: {
              ...answer,
              isCorrect: null,
            },
          };
        }

        // Check each user match
        Object.keys(answer.matchingAnswers).forEach(leftKey => {
          const leftIndex = parseInt(leftKey);
          const userRightIndex = parseInt(answer.matchingAnswers[leftKey]);

          // Get the left value at this index (in shuffled array)
          const leftValue = leftOptions[leftIndex];
          if (!leftValue) {
            allCorrect = false;
            return;
          }

          // Find the correct right value for this left value
          const correctMatch = matchingAnswers.find(
            match => match.left === leftValue,
          );

          if (correctMatch) {
            hasMatches = true;
            // Find the index of the correct right value in shuffled rightOptions
            const correctRightIndex = rightOptions.findIndex(
              opt => opt === correctMatch.right,
            );

            // Compare user's right index with correct right index
            if (userRightIndex !== correctRightIndex) {
              allCorrect = false;
            }
          } else {
            // Left value doesn't have a correct match
            allCorrect = false;
          }
        });

        // Check if all correct matches are present
        matchingAnswers.forEach(correctMatch => {
          const leftIndex = leftOptions.findIndex(
            opt => opt === correctMatch.left,
          );
          const rightIndex = rightOptions.findIndex(
            opt => opt === correctMatch.right,
          );

          if (leftIndex !== -1 && rightIndex !== -1) {
            const userMatch = answer.matchingAnswers[leftIndex.toString()];
            if (userMatch !== rightIndex.toString()) {
              allCorrect = false;
            }
          }
        });

        return {
          ...prev,
          [questionId]: {
            ...answer,
            isCorrect: hasMatches ? allCorrect : false,
          },
        };
      });
      return;
    }

    // Check sorting
    if ('type' in question && question.type === QuestionEntity.type.SORTING) {
      setAnswers(prev => {
        const answer = prev[questionId] || {
          questionId,
          selectedOptionIndex: null,
          fillInBlankAnswers: {},
          matchingAnswers: {},
          sortingAnswers: {},
          isCorrect: null,
        };

        const sortingAnswers = question.sortingAnswers || [];
        let allCorrect = true;
        let hasAnswers = false;

        // Check if user has answered all positions
        if (Object.keys(answer.sortingAnswers).length === 0) {
          return {
            ...prev,
            [questionId]: {
              ...answer,
              isCorrect: null,
            },
          };
        }

        // Validate each position
        // Note: sortedAnswers uses 1-based positions, sortingAnswers uses 0-based index
        sortingAnswers.forEach((correctAnswer: SortingAnswerDto) => {
          const correctIndex = correctAnswer.index; // 0-based
          const position = correctIndex + 1; // Convert to 1-based position
          const userAnswer = answer.sortingAnswers[position];
          const correctContent = correctAnswer.content?.trim().toLowerCase();

          if (userAnswer) {
            hasAnswers = true;
            const userContent = userAnswer.trim().toLowerCase();
            if (userContent !== correctContent) {
              allCorrect = false;
            }
          } else {
            allCorrect = false;
          }
        });

        // Check if all positions are filled
        if (
          Object.keys(answer.sortingAnswers).length !== sortingAnswers.length
        ) {
          allCorrect = false;
        }

        return {
          ...prev,
          [questionId]: {
            ...answer,
            isCorrect: hasAnswers ? allCorrect : null,
          },
        };
      });
      return;
    }
  };

  const handleQuestionClick = (index: number) => {
    shouldScrollRef.current = true; // Enable scrolling when user clicks
    setCurrentQuestionIndex(index);
  };

  const handleSubmit = () => {
    // Check all answers
    Object.keys(answers).forEach(questionId => {
      const answer = answers[questionId];
      const question = findQuestionById(questionId);
      if (!question) return;

      if (
        'type' in question &&
        question.type === QuestionEntity.type.MULTIPLE_CHOICE_HORIZONTAL
      ) {
        if (answer.selectedOptionIndex !== null) {
          checkAnswer(questionId, answer.selectedOptionIndex);
        }
      } else if (
        'type' in question &&
        question.type === QuestionEntity.type.MULTIPLE_CHOICE
      ) {
        if (answer.selectedOptionIndex !== null) {
          checkAnswer(questionId, answer.selectedOptionIndex);
        }
      } else if (
        'type' in question &&
        question.type === QuestionEntity.type.FILL_IN_BLANK
      ) {
        checkAnswer(questionId);
      } else if (
        'type' in question &&
        question.type === QuestionEntity.type.CHOOSE_ANSWER_IN_BLANK
      ) {
        checkAnswer(questionId);
      } else if (
        'type' in question &&
        question.type === QuestionEntity.type.MATCHING
      ) {
        checkAnswer(questionId);
      } else if (
        'type' in question &&
        question.type === QuestionEntity.type.SORTING
      ) {
        checkAnswer(questionId);
      }
    });
    setShowResults(true);
  };

  const getCorrectCount = () => {
    return Object.values(answers).filter(a => a.isCorrect === true).length;
  };

  const getIncorrectCount = () => {
    return Object.values(answers).filter(a => a.isCorrect === false).length;
  };

  const isQuestionAnswered = (question: QuestionEntity) => {
    const answer = answers[question.id];
    if (!answer) return false;

    if (question.type === QuestionEntity.type.MULTIPLE_CHOICE) {
      return answer.selectedOptionIndex !== null;
    } else if (question.type === 'FILL_IN_BLANK') {
      const fillInBlankAnswers = question.fillInBlank || [];
      return fillInBlankAnswers.some(
        blank => answer.fillInBlankAnswers[blank.index],
      );
    } else if (question.type === 'CHOOSE_ANSWER_IN_BLANK') {
      const chooseAnswerInBlank = question.chooseAnswerInBlank || [];
      return chooseAnswerInBlank.some(
        blank => answer.fillInBlankAnswers[blank.index],
      );
    } else if (question.type === 'MATCHING') {
      return Object.keys(answer.matchingAnswers).length > 0;
    } else if (question.type === 'SORTING') {
      return Object.keys(answer.sortingAnswers).length > 0;
    }

    return false;
  };

  const renderQuestion = (question: QuestionEntity, index: number) => {
    const answerState = answers[question.id];
    const isCurrent = index === currentQuestionIndex;

    return (
      <div
        key={question.id}
        ref={el => {
          questionRefs.current[question.id] = el;
        }}
        className={`lesson-quiz-question ${isCurrent ? 'current' : ''}`}
      >
        <div className="lesson-quiz-question-header">
          <span className="lesson-quiz-question-number">
            Câu hỏi {index + 1}
          </span>
        </div>

        {/* Multiple Choice Horizontal Question */}
        {question.type === QuestionEntity.type.MULTIPLE_CHOICE_HORIZONTAL && (
          <>
            <div
              className="lesson-quiz-question-text"
              dangerouslySetInnerHTML={{ __html: question.content }}
            />
            <div className="lesson-quiz-options">
              {(question.multipleChoiceHorizontal || []).map(
                (option, optionIndex) => {
                  const state = getAnswerState(question.id, optionIndex);
                  const isSelected =
                    answerState?.selectedOptionIndex === optionIndex;
                  const isCorrect = state === 'correct';
                  const isIncorrect = state === 'incorrect';

                  return (
                    <div
                      key={optionIndex}
                      className={`lesson-quiz-option ${
                        isSelected ? 'selected' : ''
                      } ${isCorrect ? 'correct' : ''} ${
                        isIncorrect ? 'incorrect' : ''
                      }`}
                      onClick={() =>
                        handleOptionSelect(question.id, optionIndex)
                      }
                    >
                      <div className="lesson-quiz-option-radio">
                        {isCorrect && (
                          <CheckOutlined className="lesson-quiz-icon-check" />
                        )}
                        {isIncorrect && (
                          <CloseOutlined className="lesson-quiz-icon-close" />
                        )}
                      </div>
                      <span className="lesson-quiz-option-text">
                        {option.content}
                      </span>
                    </div>
                  );
                },
              )}
            </div>
          </>
        )}

        {/* Multiple Choice Question */}
        {question.type === QuestionEntity.type.MULTIPLE_CHOICE && (
          <>
            <div
              className="lesson-quiz-question-text"
              dangerouslySetInnerHTML={{ __html: question.content }}
            />
            <div className="lesson-quiz-options">
              {(question.multipleChoiceAnswers || []).map(
                (option, optionIndex) => {
                  const state = getAnswerState(question.id, optionIndex);
                  const isSelected =
                    answerState?.selectedOptionIndex === optionIndex;
                  const isCorrect = state === 'correct';
                  const isIncorrect = state === 'incorrect';

                  return (
                    <div
                      key={optionIndex}
                      className={`lesson-quiz-option ${
                        isSelected ? 'selected' : ''
                      } ${isCorrect ? 'correct' : ''} ${
                        isIncorrect ? 'incorrect' : ''
                      }`}
                      onClick={() =>
                        handleOptionSelect(question.id, optionIndex)
                      }
                    >
                      <div className="lesson-quiz-option-radio">
                        {isCorrect && (
                          <CheckOutlined className="lesson-quiz-icon-check" />
                        )}
                        {isIncorrect && (
                          <CloseOutlined className="lesson-quiz-icon-close" />
                        )}
                      </div>
                      <span className="lesson-quiz-option-text">
                        {option.content}
                      </span>
                    </div>
                  );
                },
              )}
            </div>
          </>
        )}

        {/* Fill in Blank Question */}
        {question.type === 'FILL_IN_BLANK' && (
          <FillInBlankQuestion
            question={question}
            answers={answerState?.fillInBlankAnswers || {}}
            showResults={showResults}
            onAnswerChange={(blankIndex, value) =>
              handleFillInBlankChange(question.id, blankIndex, value)
            }
          />
        )}

        {/* Choose Answer in Blank Question */}
        {question.type === 'CHOOSE_ANSWER_IN_BLANK' && (
          <ChooseAnswerInBlankQuestion
            question={question}
            answers={answerState?.fillInBlankAnswers || {}}
            showResults={showResults}
            onAnswerChange={(blankIndex, value) =>
              handleChooseAnswerInBlankChange(question.id, blankIndex, value)
            }
          />
        )}

        {/* Matching Question */}
        {question.type === 'MATCHING' && (
          <MatchingQuestion
            question={question}
            matches={answerState?.matchingAnswers || {}}
            showResults={showResults}
            onMatchSelect={(leftIndex, rightIndex) =>
              handleMatchingSelect(question.id, leftIndex, rightIndex)
            }
          />
        )}

        {/* Sorting Question */}
        {question.type === 'SORTING' && (
          <SortingQuestion
            question={question}
            sortedAnswers={answerState?.sortingAnswers || {}}
            showResults={showResults}
            onStepSelect={(position, stepContent) =>
              handleSortingSelect(question.id, position, stepContent)
            }
          />
        )}

        {/* Essay Question */}
        {question.type === 'ESSAY' && (
          <EssayQuestion
            question={question}
            uploadedFiles={answerState?.essayFiles || []}
            onFileChange={files => handleEssayFileChange(question.id, files)}
          />
        )}
      </div>
    );
  };

  const getAnswerState = (questionId: string, optionIndex: number) => {
    const answer = answers[questionId];
    if (!answer || answer.selectedOptionIndex !== optionIndex) {
      return null;
    }

    if (!showResults) {
      return 'selected';
    }

    return answer.isCorrect ? 'correct' : 'incorrect';
  };

  // Process questionMapping from examWithMapping if provided
  const processedQuestionMapping = useMemo(() => {
    if (examWithMapping?.questionMapping) {
      return examWithMapping.questionMapping;
    }
    return [];
  }, [examWithMapping]);

  // Process questionMapping: separate groups and questions
  // If item has 'questions' key → it's a QuestionGroupEntity
  // Otherwise → it's a QuestionEntity
  const { finalQuestionGroups, finalQuestions } = useMemo(() => {
    // If examWithMapping is provided, use questionMapping
    if (processedQuestionMapping.length > 0) {
      const groups: QuestionGroupEntity[] = [];
      const standaloneQuestions: QuestionEntity[] = [];

      processedQuestionMapping.forEach(
        (item: QuestionGroupEntity | QuestionEntity) => {
          // Check if it's a QuestionGroupEntity (has 'questions' property)
          if ('questions' in item && Array.isArray(item.questions)) {
            groups.push(item as QuestionGroupEntity);
          } else {
            // It's a QuestionEntity
            standaloneQuestions.push(item as QuestionEntity);
          }
        },
      );

      return {
        finalQuestionGroups: groups,
        finalQuestions: standaloneQuestions,
      };
    }

    // Otherwise, process questionGroups and questions from props, or use mock data
    if (questionGroups.length > 0 || questions.length > 0) {
      return {
        finalQuestionGroups: questionGroups,
        finalQuestions: questions,
      };
    }

    // Use mock data - separate groups and questions
    const mockGroups: QuestionGroupEntity[] = [];
    const mockStandaloneQuestions: QuestionEntity[] = [];

    exam?.exam.questionMapping.forEach(item => {
      if ('questions' in item && Array.isArray(item.questions)) {
        mockGroups.push(item as QuestionGroupEntity);
      } else {
        mockStandaloneQuestions.push(item as QuestionEntity);
      }
    });

    return {
      finalQuestionGroups: mockGroups,
      finalQuestions: mockStandaloneQuestions,
    };
  }, [processedQuestionMapping, questionGroups, questions, exam]);

  // Create a unified array containing both question groups and standalone questions
  // All items are at the same level in one array
  type QuizItem = {
    type: 'group' | 'question';
    group?: QuestionGroupEntity;
    question?: QuestionEntity;
    questionIndex?: number; // Global index for the question
  };

  const allQuizItems = useMemo<QuizItem[]>(() => {
    const items: QuizItem[] = [];
    let globalQuestionIndex = 0;

    // Process questionGroups - all questions in groups are MULTIPLE_CHOICE
    if (finalQuestionGroups.length > 0) {
      finalQuestionGroups.forEach(group => {
        // All questions in group are MULTIPLE_CHOICE, no need to filter
        if (group.questions && group.questions.length > 0) {
          items.push({
            type: 'group',
            group,
          });
          // Update global index for questions in this group
          globalQuestionIndex += group.questions.length;
        }
      });
    }

    // Add all standalone questions
    finalQuestions.forEach(question => {
      // Check if this question is already in a group
      const isInGroup = finalQuestionGroups.some(group =>
        group.questions?.some(q => q.id === question.id),
      );
      if (!isInGroup) {
        items.push({
          type: 'question',
          question,
          questionIndex: globalQuestionIndex++,
        });
      }
    });

    return items;
  }, [finalQuestions, finalQuestionGroups]);

  // Flatten all questions for navigation and answer tracking
  const allQuestions = useMemo(() => {
    const questionsList: QuestionEntity[] = [];

    allQuizItems.forEach(item => {
      if (item.type === 'group' && item.group) {
        // Add all questions from the group
        item.group.questions?.forEach(q => questionsList.push(q));
      } else if (item.type === 'question' && item.question) {
        questionsList.push(item.question);
      }
    });

    return questionsList;
  }, [allQuizItems]);

  const totalQuestions = allQuestions.length;

  // Scroll to current question only when user clicks on question number
  useEffect(() => {
    if (
      shouldScrollRef.current &&
      allQuestions.length > 0 &&
      currentQuestionIndex >= 0 &&
      currentQuestionIndex < allQuestions.length
    ) {
      const currentQuestion = allQuestions[currentQuestionIndex];
      const questionElement = questionRefs.current[currentQuestion.id];
      if (questionElement) {
        requestAnimationFrame(() => {
          questionElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest',
          });
        });
      }
      // Reset the flag after scrolling
      shouldScrollRef.current = false;
    }
  }, [currentQuestionIndex, allQuestions]);

  // Check if there's an essay question
  const hasEssayQuestion = exam?.exam.questionMapping.some(
    q => 'type' in q && q.type === QuestionEntity.type.ESSAY,
  );

  if (loading) {
    return <Spin fullscreen size="large" spinning={loading} />;
  }

  return (
    <div className="lesson-quiz">
      <div className="lesson-quiz-container">
        {/* Main Content Area */}
        <div className="lesson-quiz-content">
          {allQuizItems.map(item => {
            if (item.type === 'group' && item.group) {
              // Render question group
              const group = item.group;
              const groupQuestions = group.questions || [];

              // Find indices for questions in this group
              const groupQuestionIndices = groupQuestions.map(q => {
                const index = allQuestions.findIndex(aq => aq.id === q.id);
                return index;
              });

              return (
                <QuestionGroup key={`group-${group.id}`} questionGroup={group}>
                  {groupQuestions.map((groupQuestion, groupIndex) => {
                    const globalIndex = groupQuestionIndices[groupIndex];
                    return (
                      <React.Fragment key={groupQuestion.id}>
                        {renderQuestion(groupQuestion, globalIndex)}
                      </React.Fragment>
                    );
                  })}
                </QuestionGroup>
              );
            } else if (item.type === 'question' && item.question) {
              // Render standalone question
              const question = item.question;
              const questionIndex =
                item.questionIndex ??
                allQuestions.findIndex(aq => aq.id === question.id);
              return (
                <React.Fragment key={question.id}>
                  {renderQuestion(question, questionIndex)}
                </React.Fragment>
              );
            }
            return null;
          })}
        </div>

        {/* Sidebar - Hide for essay questions */}
        {!hasEssayQuestion && (
          <div className="lesson-quiz-sidebar">
            <div className="lesson-quiz-sidebar-card">
              <div className="lesson-quiz-sidebar-title">Danh sách câu hỏi</div>

              {/* Summary */}
              <div className="lesson-quiz-summary">
                <div className="lesson-quiz-summary-item">
                  <CheckOutlined className="lesson-quiz-summary-icon correct" />
                  <span>
                    {getCorrectCount()}/{totalQuestions} câu đúng
                  </span>
                </div>
                <div className="lesson-quiz-summary-item">
                  <CloseOutlined className="lesson-quiz-summary-icon incorrect" />
                  <span>
                    {getIncorrectCount()}/{totalQuestions} câu sai
                  </span>
                </div>
              </div>

              {/* Question Grid */}
              <div className="lesson-quiz-question-grid">
                {allQuestions.map((question, index) => {
                  const answer = answers[question.id];
                  const isAnswered = isQuestionAnswered(question);
                  const isCorrect = answer?.isCorrect === true;
                  const isIncorrect = answer?.isCorrect === false;
                  const isCurrent = index === currentQuestionIndex;

                  return (
                    <button
                      key={question.id}
                      className={`lesson-quiz-question-number-btn ${
                        isCurrent ? 'current' : ''
                      } ${isCorrect ? 'correct' : ''} ${
                        isIncorrect ? 'incorrect' : ''
                      } ${isAnswered ? 'answered' : ''}`}
                      onClick={() => handleQuestionClick(index)}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              {/* Submit Button */}
              <button
                className="lesson-quiz-submit-btn"
                onClick={handleSubmit}
                disabled={showResults}
              >
                Nộp bài
                <ArrowRightOutlined className="lesson-quiz-submit-icon" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonQuiz;
