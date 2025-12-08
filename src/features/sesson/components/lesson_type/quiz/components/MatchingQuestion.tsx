import React from 'react';
import { QuestionEntity } from '#/api/requests/models/QuestionEntity';
import './MatchingQuestion.scss';

interface MatchingQuestionProps {
  question: QuestionEntity;
  matches: Record<string, string>; // leftIndex -> rightIndex
  showResults: boolean;
  onMatchSelect: (leftIndex: number, rightIndex: number) => void;
}

const MatchingQuestion: React.FC<MatchingQuestionProps> = ({
  question,
  matches,
  showResults,
  onMatchSelect,
}) => {
  const matchingAnswers = question.matchingAnswers || [];

  // Seed-based shuffle function to ensure consistent shuffling
  const seededShuffle = React.useCallback(
    <T,>(array: T[], seed: number): T[] => {
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
    },
    [],
  );

  // Get left options from matchingAnswers (unique left values) and shuffle
  // Use useMemo with question.id as dependency to ensure shuffle only happens once per question
  // Use seeded shuffle to ensure consistent order for answer checking
  const leftOptions = React.useMemo(() => {
    const lefts = new Set<string>();
    matchingAnswers.forEach(answer => {
      if (answer.left) {
        lefts.add(answer.left);
      }
    });
    // Use question.id to generate seed for consistent shuffling
    const seed = question.id
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return seededShuffle(Array.from(lefts), seed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id, seededShuffle]);

  // Get right options from matchingAnswers (unique right values) and shuffle
  // Use useMemo with question.id as dependency to ensure shuffle only happens once per question
  // Use seeded shuffle to ensure consistent order for answer checking
  const rightOptions = React.useMemo(() => {
    const rights = new Set<string>();
    matchingAnswers.forEach(answer => {
      if (answer.right) {
        rights.add(answer.right);
      }
    });
    // Use question.id + 1 to generate different seed for right options
    const seed =
      question.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) +
      1;
    return seededShuffle(Array.from(rights), seed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id, seededShuffle]);

  // Get correct matches - map left index to right index
  const correctMatches = React.useMemo(() => {
    const correct: Record<string, string> = {};
    matchingAnswers.forEach(answer => {
      const leftIndex = leftOptions.findIndex(opt => opt === answer.left);
      const rightIndex = rightOptions.findIndex(opt => opt === answer.right);
      if (leftIndex !== -1 && rightIndex !== -1) {
        correct[leftIndex.toString()] = rightIndex.toString();
      }
    });
    return correct;
  }, [matchingAnswers, leftOptions, rightOptions]);

  // Check if a match is correct
  const isMatchCorrect = (leftIndex: number, rightIndex: number) => {
    if (!showResults) return false;
    return correctMatches[leftIndex.toString()] === rightIndex.toString();
  };

  // Check if a match is incorrect
  const isMatchIncorrect = (leftIndex: number, rightIndex: number) => {
    if (!showResults) return false;
    const userMatch = matches[leftIndex.toString()];
    if (userMatch !== rightIndex.toString()) return false;
    return !isMatchCorrect(leftIndex, rightIndex);
  };

  // Check if left item is selected
  const isLeftSelected = (leftIndex: number) => {
    return matches[leftIndex.toString()] !== undefined;
  };

  // Check if right item is selected
  const isRightSelected = (rightIndex: number) => {
    return Object.values(matches).includes(rightIndex.toString());
  };

  // Get match state for left item
  const getLeftState = (leftIndex: number) => {
    if (!showResults) {
      return isLeftSelected(leftIndex) ? 'selected' : '';
    }

    const matchedRight = matches[leftIndex.toString()];
    if (matchedRight === undefined) return '';

    const rightIndex = parseInt(matchedRight);
    if (isMatchCorrect(leftIndex, rightIndex)) return 'correct';
    if (isMatchIncorrect(leftIndex, rightIndex)) return 'incorrect';
    return '';
  };

  // Get match state for right item
  const getRightState = (rightIndex: number) => {
    if (!showResults) {
      return isRightSelected(rightIndex) ? 'selected' : '';
    }

    // Find which left item is matched to this right item
    const matchedLeft = Object.keys(matches).find(
      left => matches[left] === rightIndex.toString(),
    );

    if (matchedLeft === undefined) return '';

    const leftIndex = parseInt(matchedLeft);
    if (isMatchCorrect(leftIndex, rightIndex)) return 'correct';
    if (isMatchIncorrect(leftIndex, rightIndex)) return 'incorrect';
    return '';
  };

  const [selectedLeft, setSelectedLeft] = React.useState<number | null>(null);

  // Color palette for matched pairs
  const matchColors = [
    { border: '#3b82f6', background: '#dbeafe', text: '#1e40af' }, // Blue
    { border: '#8b5cf6', background: '#ede9fe', text: '#6d28d9' }, // Purple
    { border: '#ec4899', background: '#fce7f3', text: '#be185d' }, // Pink
    { border: '#f59e0b', background: '#fef3c7', text: '#92400e' }, // Amber
    { border: '#10b981', background: '#d1fae5', text: '#065f46' }, // Green
    { border: '#06b6d4', background: '#cffafe', text: '#0e7490' }, // Cyan
    { border: '#f97316', background: '#ffedd5', text: '#9a3412' }, // Orange
    { border: '#6366f1', background: '#e0e7ff', text: '#4338ca' }, // Indigo
  ];

  // Get color for a matched pair
  const getMatchColor = (leftIndex: number) => {
    const matchedRight = matches[leftIndex.toString()];
    if (matchedRight === undefined) return null;

    // Use leftIndex to determine color (so same left always gets same color)
    const colorIndex = leftIndex % matchColors.length;
    return matchColors[colorIndex];
  };

  // Get color for right item based on which left it's matched to
  const getRightMatchColor = (rightIndex: number) => {
    const matchedLeft = Object.keys(matches).find(
      left => matches[left] === rightIndex.toString(),
    );
    if (matchedLeft === undefined) return null;

    const leftIndex = parseInt(matchedLeft);
    return getMatchColor(leftIndex);
  };

  const handleLeftClick = (leftIndex: number) => {
    if (showResults) return;

    // If clicking the same left item, deselect it
    if (selectedLeft === leftIndex) {
      setSelectedLeft(null);
      return;
    }

    // If this left is already matched, remove the match first
    if (matches[leftIndex.toString()]) {
      onMatchSelect(leftIndex, -1);
    }

    // Select this left item
    setSelectedLeft(leftIndex);
  };

  const handleRightClick = (rightIndex: number) => {
    if (showResults) return;

    // If a left item is selected, create a match
    if (selectedLeft !== null) {
      // Remove any existing match for this right
      const existingLeft = Object.keys(matches).find(
        left => matches[left] === rightIndex.toString(),
      );
      if (existingLeft) {
        onMatchSelect(parseInt(existingLeft), -1);
      }

      // Create new match
      onMatchSelect(selectedLeft, rightIndex);
      setSelectedLeft(null);
      return;
    }

    // If no left is selected, find and remove match for this right
    const matchedLeft = Object.keys(matches).find(
      left => matches[left] === rightIndex.toString(),
    );

    if (matchedLeft !== undefined) {
      onMatchSelect(parseInt(matchedLeft), -1);
    }
  };

  return (
    <div className="matching-question">
      <div className="matching-question-content">
        {question.content && (
          <div
            className="matching-question-text"
            dangerouslySetInnerHTML={{ __html: question.content }}
          />
        )}
      </div>

      <div className="matching-container">
        {/* Left Column */}
        <div className="matching-column matching-column-left">
          {leftOptions.map((option, index) => {
            const state = getLeftState(index);
            const isSelected = isLeftSelected(index);
            const matchColor = getMatchColor(index);

            return (
              <div
                key={index}
                className={`matching-item matching-item-left ${state} ${
                  isSelected ? 'selected' : ''
                } ${selectedLeft === index ? 'selecting' : ''} ${
                  matchColor ? 'matched' : ''
                }`}
                onClick={() => handleLeftClick(index)}
                style={
                  matchColor && !showResults
                    ? {
                        borderColor: matchColor.border,
                        backgroundColor: matchColor.background,
                      }
                    : undefined
                }
              >
                <span className="matching-item-number">{index + 1}.</span>
                <span
                  className="matching-item-text"
                  dangerouslySetInnerHTML={{ __html: option }}
                  style={
                    matchColor && !showResults
                      ? { color: matchColor.text }
                      : undefined
                  }
                />
              </div>
            );
          })}
        </div>

        {/* Right Column */}
        <div className="matching-column matching-column-right">
          {rightOptions.map((option, index) => {
            const state = getRightState(index);
            const isSelected = isRightSelected(index);
            const letter = String.fromCharCode(65 + index); // A, B, C, D, E
            const matchColor = getRightMatchColor(index);

            return (
              <div
                key={index}
                className={`matching-item matching-item-right ${state} ${
                  isSelected ? 'selected' : ''
                } ${matchColor ? 'matched' : ''}`}
                onClick={() => handleRightClick(index)}
                style={
                  matchColor && !showResults
                    ? {
                        borderColor: matchColor.border,
                        backgroundColor: matchColor.background,
                      }
                    : undefined
                }
              >
                <span className="matching-item-letter">{letter}.</span>
                <span
                  className="matching-item-text"
                  dangerouslySetInnerHTML={{ __html: option }}
                  style={
                    matchColor && !showResults
                      ? { color: matchColor.text }
                      : undefined
                  }
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MatchingQuestion;
