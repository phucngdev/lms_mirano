import { Modal } from 'antd';
import './VoiceRecognitionModal.scss';

interface VoiceRecognitionModalProps {
  open: boolean;
  onClose: () => void;
  isListening: boolean;
  voiceResult: {
    recognizedText: string;
    score: number;
    feedback: string;
  } | null;
}

const VoiceRecognitionModal = ({
  open,
  onClose,
  isListening,
  voiceResult,
}: VoiceRecognitionModalProps) => {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={true}
      centered
      width={500}
      className="lesson-vocab-voice-modal"
    >
      <div className="lesson-vocab-voice-content">
        {/* Listening Indicator */}
        {isListening && !voiceResult && (
          <div className="lesson-vocab-voice-listening">
            Đang nghe bạn nói...
          </div>
        )}

        {/* Voice Result */}
        {voiceResult && !isListening && (
          <div className="lesson-vocab-voice-result">
            <div className="lesson-vocab-voice-result-label">
              Kết quả giọng nói:
            </div>
            <div className="lesson-vocab-voice-result-word">
              {voiceResult.recognizedText}
            </div>
            <div className="lesson-vocab-voice-result-stars">
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  className={`lesson-vocab-star ${
                    star <= voiceResult.score ? 'filled' : ''
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <div className="lesson-vocab-voice-result-feedback">
              {voiceResult.feedback}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default VoiceRecognitionModal;

