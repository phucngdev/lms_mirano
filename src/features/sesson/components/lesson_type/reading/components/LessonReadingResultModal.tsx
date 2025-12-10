import { Modal, Button } from 'antd';
import medalImage from '#/assets/images/GlobalVocabulary/medal.png';
import './LessonReadingResultModal.scss';

interface LessonReadingResultModalProps {
  open: boolean;
  totalCorrect: number;
  totalQuestions: number;
  onClose: () => void;
  onGoBack: () => void;
  onContinue: () => void;
}

const LessonReadingResultModal = ({
  open,
  totalCorrect,
  totalQuestions,
  onClose,
  onGoBack,
  onContinue,
}: LessonReadingResultModalProps) => {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      centered
      width={500}
      className="lesson-reading-result-modal"
    >
      <div className="lesson-reading-result-content">
        {/* Medal Image */}
        <div className="lesson-reading-result-medal">
          <img src={medalImage} alt="Medal" />
        </div>

        {/* Title */}
        <h2 className="lesson-reading-result-title">Hoàn thành bài học!</h2>

        {/* Score Cards */}
        <div className="lesson-reading-result-scores">
          <div className="lesson-reading-result-score-card correct">
            <div className="lesson-reading-result-score-label">
              Điểm của bạn
            </div>
            <div className="lesson-reading-result-score-value">
              {totalCorrect}/{totalQuestions}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="lesson-reading-result-actions">
          <Button className="lesson-reading-result-btn back" onClick={onGoBack}>
            Quay lại
          </Button>
          <Button
            className="lesson-reading-result-btn continue"
            onClick={onContinue}
          >
            Học tiếp
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default LessonReadingResultModal;
