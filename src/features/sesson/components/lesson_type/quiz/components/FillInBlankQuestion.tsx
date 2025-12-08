import React from 'react';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { QuestionEntity } from '#/api/requests/models/QuestionEntity';
import './FillInBlankQuestion.scss';

interface FillInBlankQuestionProps {
  question: QuestionEntity;
  answers: Record<number, string>;
  showResults: boolean;
  onAnswerChange: (blankIndex: number, value: string) => void;
}

const FillInBlankQuestion: React.FC<FillInBlankQuestionProps> = ({
  question,
  answers,
  showResults,
  onAnswerChange,
}) => {
  // Parse content to find {blank} placeholders
  // Content from CKEditor may contain HTML, so we need to handle both plain text and HTML
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

    // Get fillInBlank answers sorted by index to match with blanks in order
    const fillInBlankAnswers = question.fillInBlank || [];
    const sortedBlanks = [...fillInBlankAnswers].sort(
      (a, b) => a.index - b.index,
    );

    // Process segments and blanks
    let blankCounter = 0;
    segments.forEach((segment, segmentIndex) => {
      // Add text segment
      if (segment) {
        parts.push({
          type: 'text',
          content: segment,
        });
      }

      // Add blank after each segment (except the last one)
      if (segmentIndex < segments.length - 1) {
        // Use the index from question.fillInBlank if available
        // If sortedBlanks has an element at blankCounter, use its index
        // Otherwise, use blankCounter as fallback (shouldn't happen if data is correct)
        const blankIndex =
          blankCounter < sortedBlanks.length
            ? sortedBlanks[blankCounter].index
            : blankCounter;
        parts.push({
          type: 'blank',
          index: blankIndex,
        });
        blankCounter++;
      }
    });

    return parts;
  };

  const getBlankState = (blankIndex: number) => {
    if (!showResults || !question.fillInBlank) return null;

    const blankAnswer = question.fillInBlank.find(b => b.index === blankIndex);
    if (!blankAnswer) return null;

    const userAnswer = answers[blankIndex]?.trim().toLowerCase();
    const correctAnswer = blankAnswer.correctAnswer?.trim().toLowerCase();

    if (!userAnswer) return null;

    return userAnswer === correctAnswer ? 'correct' : 'incorrect';
  };

  const parts = parseContent();

  return (
    <div className="fill-in-blank-question">
      <div className="fill-in-blank-content">
        {parts.map((part, partIndex) => {
          if (part.type === 'text') {
            // Render HTML content from CKEditor
            return (
              <span
                key={partIndex}
                className="fill-in-blank-text"
                dangerouslySetInnerHTML={{ __html: part.content || '' }}
              />
            );
          } else {
            // Render input for blank
            const blankIndex = part.index!;
            const state = getBlankState(blankIndex);
            const isCorrect = state === 'correct';
            const isIncorrect = state === 'incorrect';

            return (
              <span key={partIndex} className="fill-in-blank-input-wrapper">
                <input
                  type="text"
                  className={`fill-in-blank-input ${isCorrect ? 'correct' : ''} ${
                    isIncorrect ? 'incorrect' : ''
                  }`}
                  value={answers[blankIndex] || ''}
                  onChange={e => onAnswerChange(blankIndex, e.target.value)}
                  disabled={showResults}
                  placeholder="..."
                />
                {isCorrect && (
                  <CheckOutlined className="fill-in-blank-icon fill-in-blank-icon-check" />
                )}
                {isIncorrect && (
                  <CloseOutlined className="fill-in-blank-icon fill-in-blank-icon-close" />
                )}
              </span>
            );
          }
        })}
      </div>

      {/* Show expected output if available */}
      {/* {showResults && question.explain && (
        <div className="fill-in-blank-output">
          <div className="fill-in-blank-output-label">
            The output of the above code is:
          </div>
          <div className="fill-in-blank-output-value">{question.explain}</div>
        </div>
      )} */}
    </div>
  );
};

export default FillInBlankQuestion;
