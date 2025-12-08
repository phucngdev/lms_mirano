import { IconMic, IconListen } from '#/assets/svg/externalIcon';
import { Modal } from 'antd';
import './VoiceRecognitionModal.scss';

interface VocabItem {
  id: string;
  originText: string;
  vietnamesePronounce: string;
  japanesePronounce: string;
}

interface VoiceRecognitionModalProps {
  open: boolean;
  onClose: () => void;
  vocab: VocabItem | null;
  isListening: boolean;
  voiceResult: {
    score: number;
    feedback: string;
  } | null;
  onMicClick: () => void;
  onSpeakerClick: () => void;
}

const VoiceRecognitionModal = ({
  open,
  onClose,
  vocab,
  isListening,
  voiceResult,
  onMicClick,
  onSpeakerClick,
}: VoiceRecognitionModalProps) => {
  if (!vocab) return null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      className="voice-recognition-modal"
      closable={true}
    >
      <div className="voice-modal-content">
        {/* Listening Indicator */}
        {isListening && !voiceResult && (
          <div className="voice-listening-indicator">Đang nghe bạn nói...</div>
        )}

        {/* Voice Result */}
        {voiceResult && !isListening && (
          <div className="voice-result-box">
            <div className="voice-result-label">Kết quả giọng nói:</div>
            <div className="voice-result-word">{vocab.originText}</div>
            <div className="voice-result-stars">
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  className={`star ${star <= voiceResult.score ? 'filled' : ''}`}
                >
                  ★
                </span>
              ))}
            </div>
            <div className="voice-result-feedback">{voiceResult.feedback}</div>
          </div>
        )}

        {/* Vocabulary Display */}
        <div className="voice-vocab-section">
          <div className="voice-vocab-label">Từ vựng:</div>
          <div className="voice-vocab-header">
            <div className="voice-vocab-word">{vocab.originText}</div>
            <div className="voice-vocab-icons">
              <button
                className="voice-icon-button voice-icon-mic"
                onClick={onMicClick}
                aria-label="Record audio"
              >
                <IconMic color="#F37142" />
              </button>
              <button
                className="voice-icon-button voice-icon-speaker"
                onClick={onSpeakerClick}
                aria-label="Play audio"
              >
                <IconListen color="#0BA5EC" />
              </button>
            </div>
          </div>
        </div>

        {/* Pronunciation and Translation */}
        <div className="voice-info-boxes">
          <div className="voice-info-box">{vocab.japanesePronounce}</div>
          <div className="voice-info-box">{vocab.vietnamesePronounce}</div>
        </div>
      </div>
    </Modal>
  );
};

export default VoiceRecognitionModal;
