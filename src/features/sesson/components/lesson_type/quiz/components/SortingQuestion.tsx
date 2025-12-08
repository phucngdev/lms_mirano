import React from 'react';
import { QuestionEntity } from '#/api/requests/models/QuestionEntity';
import './SortingQuestion.scss';

interface SortingQuestionProps {
  question: QuestionEntity;
  sortedAnswers: Record<number, string>; // position -> step content
  showResults: boolean;
  onStepSelect: (position: number, stepContent: string | null) => void;
}

const SortingQuestion: React.FC<SortingQuestionProps> = ({
  question,
  sortedAnswers,
  showResults,
  onStepSelect,
}) => {
  // Get steps from options or sortingAnswers
  const availableSteps = React.useMemo(() => {
    if (question.options && question.options.length > 0) {
      return question.options;
    }
    // Fallback to sortingAnswers if options not available
    return (question.sortingAnswers || []).map(answer => answer.content);
  }, [question.options, question.sortingAnswers]);

  // Get correct order from sortingAnswers
  const correctOrder = React.useMemo(() => {
    const order: Record<number, string> = {};
    (question.sortingAnswers || []).forEach(answer => {
      order[answer.index] = answer.content;
    });
    return order;
  }, [question.sortingAnswers]);

  // Get steps that are not yet placed
  const unplacedSteps = React.useMemo(() => {
    const placed = new Set(Object.values(sortedAnswers));
    return availableSteps.filter(step => !placed.has(step));
  }, [availableSteps, sortedAnswers]);

  // Check if a position is correct
  const isPositionCorrect = (position: number) => {
    if (!showResults) return false;
    const userAnswer = sortedAnswers[position];
    const correctAnswer = correctOrder[position];
    return userAnswer === correctAnswer;
  };

  // Check if a position is incorrect
  const isPositionIncorrect = (position: number) => {
    if (!showResults) return false;
    const userAnswer = sortedAnswers[position];
    if (!userAnswer) return false;
    const correctAnswer = correctOrder[position];
    return userAnswer !== correctAnswer;
  };

  // Get state for a step in left column
  const getStepState = (step: string) => {
    const isPlaced = Object.values(sortedAnswers).includes(step);
    return isPlaced ? 'placed' : '';
  };

  // Get state for a position in right column
  const getPositionState = (position: number) => {
    if (!showResults) return '';
    if (isPositionCorrect(position)) return 'correct';
    if (isPositionIncorrect(position)) return 'incorrect';
    return '';
  };

  // Handle clicking on a step in left column
  const handleStepClick = (step: string) => {
    if (showResults) return;

    // Check if step is already placed
    const existingPosition = Object.keys(sortedAnswers).find(
      pos => sortedAnswers[parseInt(pos)] === step,
    );

    if (existingPosition) {
      // Remove from position
      onStepSelect(parseInt(existingPosition), null);
      return;
    }

    // Find first empty position
    const totalPositions = Math.max(
      availableSteps.length,
      Object.keys(correctOrder).length,
    );
    for (let i = 1; i <= totalPositions; i++) {
      if (!sortedAnswers[i]) {
        onStepSelect(i, step);
        break;
      }
    }
  };

  // Handle clicking on a position in right column
  const handlePositionClick = (position: number) => {
    if (showResults) return;
    // Remove step from this position
    onStepSelect(position, null);
  };

  // Get total number of positions
  const totalPositions = Math.max(
    availableSteps.length,
    Object.keys(correctOrder).length,
  );

  return (
    <div className="sorting-question">
      <div className="sorting-question-content">
        {question.content && (
          <div
            className="sorting-question-text"
            dangerouslySetInnerHTML={{ __html: question.content }}
          />
        )}
      </div>

      <div className="sorting-container">
        {/* Left Column - Available Steps */}
        <div className="sorting-column sorting-column-left">
          <div className="sorting-column-title">Các bước</div>
          <div className="sorting-steps-list">
            {availableSteps.map((step, index) => {
              const state = getStepState(step);
              return (
                <div
                  key={index}
                  className={`sorting-step ${state}`}
                  onClick={() => handleStepClick(step)}
                >
                  <span
                    className="sorting-step-text"
                    dangerouslySetInnerHTML={{ __html: step }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column - Ordered Positions */}
        <div className="sorting-column sorting-column-right">
          <div className="sorting-column-title">Thứ tự</div>
          <div className="sorting-positions-list">
            {Array.from({ length: totalPositions }, (_, i) => {
              const position = i + 1;
              const stepContent = sortedAnswers[position];
              const state = getPositionState(position);

              return (
                <div
                  key={position}
                  className={`sorting-position ${state} ${
                    stepContent ? 'filled' : 'empty'
                  }`}
                  onClick={() => handlePositionClick(position)}
                >
                  <span className="sorting-position-number">{position}.</span>
                  {stepContent ? (
                    <span
                      className="sorting-position-content"
                      dangerouslySetInnerHTML={{ __html: stepContent }}
                    />
                  ) : (
                    <span className="sorting-position-placeholder">
                      Kéo bước vào đây
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SortingQuestion;

