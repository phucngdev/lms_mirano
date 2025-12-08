import { Modal } from 'antd';
import './TestResultModal.scss';
import sparkles from '#/assets/images/GlobalVocabulary/medal.png';

interface PartScore {
  partId: number;
  partName: string;
  score: number;
  total: number;
}

interface TestResultModalProps {
  open: boolean;
  onClose: () => void;
  totalScore: number;
  partScores: PartScore[];
  onGoHome?: () => void;
  onReview?: () => void;
  onContinue?: () => void;
}

const TestResultModal = ({
  open,
  onClose,
  totalScore,
  partScores,
  onGoHome,
  onReview,
  onContinue,
}: TestResultModalProps) => {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      className="test-mode-result-modal"
      centered
      closeIcon={null}
    >
      <div className="test-mode-result-content">
        <div className="test-mode-result-medal">
          <div className="test-mode-result-medal-icon">
            <img src={sparkles} alt="medal" />
          </div>
          <div className="test-mode-result-score-text">
            Số điểm bạn đạt được: {totalScore}
          </div>
        </div>

        <div className="test-mode-result-parts-grid">
          {partScores.map(part => (
            <div key={part.partId} className="test-mode-result-part-card">
              <div className="test-mode-result-part-header">
                {part.partName}
              </div>
              <div className="test-mode-result-part-score">
                {part.score}/{part.total}
              </div>
            </div>
          ))}
        </div>

        <div className="test-mode-result-actions-divider"></div>

        {/* Action Buttons */}
        <div className="test-mode-result-actions">
          <div className="test-mode-result-actions-left">
            <button
              className="test-mode-result-btn test-mode-result-btn-secondary"
              onClick={onGoHome}
            >
              Về trang chủ
            </button>
            <button
              className="test-mode-result-btn test-mode-result-btn-secondary"
              onClick={onReview}
            >
              Xem lại
            </button>
          </div>
          <button
            className="test-mode-result-btn test-mode-result-btn-primary"
            onClick={onContinue}
          >
            Tiếp tục thi
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default TestResultModal;
