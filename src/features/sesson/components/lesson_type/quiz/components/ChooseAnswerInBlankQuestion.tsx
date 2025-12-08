import React from 'react';
import { Select } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { QuestionEntity } from '#/api/requests/models/QuestionEntity';
import './ChooseAnswerInBlankQuestion.scss';

interface ChooseAnswerInBlankQuestionProps {
  question: QuestionEntity;
  answers: Record<number, string>; // blankIndex -> selected answer
  showResults: boolean;
  onAnswerChange: (blankIndex: number, value: string) => void;
}

const ChooseAnswerInBlankQuestion: React.FC<
  ChooseAnswerInBlankQuestionProps
> = ({ question, answers, showResults, onAnswerChange }) => {
  // Parse content to find {blank} placeholders
  const parseContent = () => {
    const content = question.content || '';
    const parts: Array<{
      type: 'text' | 'blank';
      index?: number;
      content?: string;
    }> = [];

    // Split by {blank} (case insensitive)
    const blankRegex = /__/gi;
    const segments = content.split(blankRegex);

    // If no blanks found, return the whole content as text
    if (segments.length === 1) {
      return [{ type: 'text' as const, content: segments[0] }];
    }

    // Process segments and blanks
    segments.forEach((segment, index) => {
      // Add text segment
      if (segment) {
        parts.push({
          type: 'text',
          content: segment,
        });
      }

      // Add blank after each segment (except the last one)
      if (index < segments.length - 1) {
        parts.push({
          type: 'blank',
          index: index,
        });
      }
    });

    return parts;
  };

  const getBlankState = (blankIndex: number) => {
    if (!showResults || !question.chooseAnswerInBlank) return null;

    const blankAnswer = question.chooseAnswerInBlank.find(
      b => b.index === blankIndex,
    );
    if (!blankAnswer) return null;

    const userAnswer = answers[blankIndex]?.trim().toLowerCase();
    const correctAnswer = blankAnswer.correctAnswer?.trim().toLowerCase();

    if (!userAnswer) return null;

    return userAnswer === correctAnswer ? 'correct' : 'incorrect';
  };

  // Get all available options from chooseAnswerInBlank
  const getAllOptions = React.useMemo(() => {
    const optionsSet = new Set<string>();
    question.chooseAnswerInBlank?.forEach(blank => {
      if (blank.correctAnswer) {
        optionsSet.add(blank.correctAnswer);
      }
    });
    // Also add any user-selected answers that might not be in correct answers
    Object.values(answers).forEach(answer => {
      if (answer) {
        optionsSet.add(answer);
      }
    });
    return Array.from(optionsSet);
  }, [question.chooseAnswerInBlank, answers]);

  const parts = parseContent();

  return (
    <div className="choose-answer-in-blank-question">
      <div className="choose-answer-in-blank-content">
        {parts.map((part, partIndex) => {
          if (part.type === 'text') {
            // Render HTML content from CKEditor
            return (
              <span
                key={partIndex}
                className="choose-answer-in-blank-text"
                dangerouslySetInnerHTML={{ __html: part.content || '' }}
              />
            );
          } else {
            // Render select dropdown for blank
            const blankIndex = part.index!;
            const state = getBlankState(blankIndex);
            const isCorrect = state === 'correct';
            const isIncorrect = state === 'incorrect';
            const selectedValue = answers[blankIndex] || '';

            return (
              <span
                key={partIndex}
                className="choose-answer-in-blank-select-wrapper"
              >
                <Select
                  className={`choose-answer-in-blank-select ${isCorrect ? 'correct' : ''} ${
                    isIncorrect ? 'incorrect' : ''
                  }`}
                  value={selectedValue || undefined}
                  onChange={value => onAnswerChange(blankIndex, value)}
                  // disabled={showResults}
                  placeholder="Chọn đáp án..."
                  style={{ minWidth: 150 }}
                  suffixIcon={
                    showResults && isCorrect ? (
                      <CheckOutlined className="choose-answer-in-blank-icon-check" />
                    ) : showResults && isIncorrect ? (
                      <CloseOutlined className="choose-answer-in-blank-icon-close" />
                    ) : undefined
                  }
                  options={getAllOptions.map(option => ({
                    label: option,
                    value: option,
                  }))}
                />
              </span>
            );
          }
        })}
      </div>
    </div>
  );
};

export default ChooseAnswerInBlankQuestion;
