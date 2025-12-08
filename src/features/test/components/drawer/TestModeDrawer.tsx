import { Drawer } from 'antd';
import './TestModeDrawer.scss';

interface TestModeDrawerProps {
  open: boolean;
  onClose: () => void;
  timeRemaining: number;
  currentPartQuestions: Array<{
    id: number;
    partId: number;
    groupId: number;
  }>;
  selectedAnswers: Record<string, string>;
  selectedQuestionId: number;
  selectedPartId: number;
  selectedQuestionGroupId: number;
  onQuestionClick: (questionId: number) => void;
  onNextPart: () => void;
  formatTime: (seconds: number) => string;
}

const TestModeDrawer = ({
  open,
  onClose,
  timeRemaining,
  currentPartQuestions,
  selectedAnswers,
  selectedQuestionId,
  selectedPartId,
  selectedQuestionGroupId,
  onQuestionClick,
  onNextPart,
  formatTime,
}: TestModeDrawerProps) => {
  const handleQuestionClick = (questionId: number) => {
    onQuestionClick(questionId);
    onClose();
  };

  const handleNextPart = () => {
    onNextPart();
    onClose();
  };

  return (
    <Drawer
      title={null}
      placement="bottom"
      onClose={onClose}
      open={open}
      className="test-mode-mobile-drawer"
      closeIcon={null}
      styles={{
        body: {
          padding: 0,
        },
      }}
    >
      <div className="test-mode-mobile-drawer-content">
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
                  onClick={() => handleQuestionClick(question.id)}
                >
                  {questionNum}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="test-mode-actions">
          <button
            className="test-mode-action-btn test-mode-action-btn-exit"
            onClick={onClose}
          >
            Thoát
          </button>
          <button
            onClick={handleNextPart}
            className="test-mode-action-btn test-mode-action-btn-primary"
          >
            Chuyển phần
          </button>
        </div>
      </div>
    </Drawer>
  );
};

export default TestModeDrawer;
