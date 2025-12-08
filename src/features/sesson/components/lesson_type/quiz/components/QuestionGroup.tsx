import React from 'react';
import { QuestionGroupEntity } from '#/api/requests/models/QuestionGroupEntity';
import './QuestionGroup.scss';

interface QuestionGroupProps {
  questionGroup: QuestionGroupEntity;
  children: React.ReactNode; // Questions will be rendered as children
}

const QuestionGroup: React.FC<QuestionGroupProps> = ({
  questionGroup,
  children,
}) => {
  return (
    <div className="question-group">
      {/* Group Content */}
      {questionGroup.content && (
        <div className="question-group-content">
          <div
            className="question-group-text"
            dangerouslySetInnerHTML={{ __html: questionGroup.content }}
          />
        </div>
      )}

      {/* Group Image */}
      {questionGroup.imageUrl && (
        <div className="question-group-image">
          <img src={questionGroup.imageUrl} alt="Question group" />
        </div>
      )}

      {/* Group Audio */}
      {questionGroup.audioUrl && (
        <div className="question-group-audio">
          <audio controls src={questionGroup.audioUrl}>
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      {/* Questions List */}
      <div className="question-group-questions">{children}</div>
    </div>
  );
};

export default QuestionGroup;
