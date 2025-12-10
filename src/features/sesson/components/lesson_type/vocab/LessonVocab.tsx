import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Spin, message } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { getAllVocabularyByIdLessionService } from '#/api/services/vocabulary.service';
import VoiceRecognitionModal from './components/VoiceRecognitionModal';
import './LessonVocab.scss';

// Speech Recognition Types
interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onstart?: () => void;
  onresult?: (event: SpeechRecognitionEvent) => void;
  onerror?: (event: SpeechRecognitionErrorEvent) => void;
  onend?: () => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
    };
  }
}

interface VocabularyItem {
  id: string;
  originText: string;
  mean: string;
  imageUrl: string;
  sinoVietNamese: string;
  kanji: string;
  example: string;
  pos: number;
}

interface VocabularyResponse {
  statusCode: number;
  data: {
    items: VocabularyItem[];
    meta: {
      limit: number;
      offset: number;
      total: number;
      totalPages: number;
    };
  };
}

const LessonVocab = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [vocabularies, setVocabularies] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceResult, setVoiceResult] = useState<{
    recognizedText: string;
    score: number;
    feedback: string;
  } | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const fetchVocabularies = async () => {
    if (!lessonId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Gọi API với limit lớn để lấy tất cả từ vựng
      const response = await getAllVocabularyByIdLessionService(
        lessonId,
        1000,
        0,
      );
      const apiData = response.data as VocabularyResponse;

      if (apiData.statusCode === 200 && apiData.data?.items) {
        // Sắp xếp theo pos để đảm bảo thứ tự đúng
        const sortedItems = [...apiData.data.items].sort(
          (a, b) => a.pos - b.pos,
        );
        setVocabularies(sortedItems);
      }
    } catch (error) {
      console.error('Error fetching vocabularies:', error);
      message.error('Lỗi khi tải từ vựng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (lessonId) {
      fetchVocabularies();
    }
  }, [lessonId]);

  // Close modal and reset when changing vocabulary
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current.abort();
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsVoiceModalOpen(false);
    setIsListening(false);
    setVoiceResult(null);
  }, [currentIndex]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="lesson-vocab">
        <div className="lesson-vocab-loading">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (vocabularies.length === 0) {
    return (
      <div className="lesson-vocab">
        <div className="lesson-vocab-empty">
          <p>Chưa có từ vựng</p>
        </div>
      </div>
    );
  }

  const currentVocab = vocabularies[currentIndex];

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < vocabularies.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const calculateScore = (
    recognizedText: string,
    correctText: string,
  ): number => {
    const normalizedRecognized = recognizedText.trim();
    const normalizedCorrect = correctText.trim();

    if (normalizedRecognized === normalizedCorrect) {
      return 5;
    }

    // Simple similarity check for Japanese text
    let matches = 0;
    const minLength = Math.min(
      normalizedRecognized.length,
      normalizedCorrect.length,
    );
    for (let i = 0; i < minLength; i++) {
      if (normalizedRecognized[i] === normalizedCorrect[i]) {
        matches++;
      }
    }

    const similarity =
      matches / Math.max(normalizedRecognized.length, normalizedCorrect.length);

    if (similarity >= 0.9) return 5;
    if (similarity >= 0.8) return 4;
    if (similarity >= 0.6) return 3;
    if (similarity >= 0.4) return 2;
    return 1;
  };

  const getFeedback = (score: number): string => {
    if (score >= 5) return 'Tuyệt vời!';
    if (score >= 4) return 'Tốt!';
    if (score >= 3) return 'Khá tốt!';
    if (score >= 2) return 'Cần cải thiện';
    return 'Hãy thử lại';
  };

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      message.error('Trình duyệt của bạn không hỗ trợ nhận diện giọng nói');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ja-JP';
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.resultIndex];
      if (result && result[0]) {
        const transcript = result[0].transcript;
        const score = calculateScore(transcript, currentVocab.originText);
        const feedback = getFeedback(score);

        setVoiceResult({
          recognizedText: transcript,
          score,
          feedback,
        });
        setIsListening(false);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'no-speech') {
        message.error('Không nghe được. Vui lòng thử lại.');
      } else {
        message.error('Lỗi nhận diện giọng nói');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleRecordAudio = () => {
    if (!currentVocab) return;
    setIsVoiceModalOpen(true);
    setVoiceResult(null);
    startListening();
  };

  const handlePlayAudio = () => {
    if (!currentVocab) return;

    // Use Web Speech API SpeechSynthesis for text-to-speech
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(currentVocab.originText);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.8;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    } else {
      message.error('Trình duyệt của bạn không hỗ trợ phát âm');
    }
  };

  const handleVoiceModalClose = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current.abort();
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsVoiceModalOpen(false);
    setIsListening(false);
    setVoiceResult(null);
  };

  return (
    <div className="lesson-vocab">
      <div className="lesson-vocab-container">
        <div className="lesson-vocab-illustration">
          <img
            src={currentVocab.imageUrl}
            alt={currentVocab.originText}
            onError={e => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>

        <div className="lesson-vocab-details">
          <div className="lesson-vocab-details-header">
            <div className="vocabulary-section">
              <div className="vocabulary-label">Từ vựng:</div>
              <div className="vocabulary-word">{currentVocab.originText}</div>
            </div>
            <div className="audio-controls">
              <button
                className="audio-button mic-button"
                onClick={handleRecordAudio}
                aria-label="Record audio"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M7.99998 10.332C9.47331 10.332 10.6666 9.1387 10.6666 7.66536V3.9987C10.6666 2.52536 9.47331 1.33203 7.99998 1.33203C6.52665 1.33203 5.33331 2.52536 5.33331 3.9987V7.66536C5.33331 9.1387 6.52665 10.332 7.99998 10.332Z"
                    stroke="#F37142"
                    stroke-width="1.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M2.90002 6.43359V7.56693C2.90002 10.3803 5.18669 12.6669 8.00002 12.6669C10.8134 12.6669 13.1 10.3803 13.1 7.56693V6.43359"
                    stroke="#F37142"
                    stroke-width="1.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M7.0733 4.28609C7.6733 4.06609 8.32664 4.06609 8.92664 4.28609"
                    stroke="#F37142"
                    stroke-width="1.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M7.46667 5.69891C7.82001 5.60557 8.18667 5.60557 8.54001 5.69891"
                    stroke="#F37142"
                    stroke-width="1.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M8 12.668V14.668"
                    stroke="#F37142"
                    stroke-width="1.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>{' '}
              </button>
              <button
                className="audio-button speaker-button"
                onClick={handlePlayAudio}
                aria-label="Play audio"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M1.33331 6.66783V9.3345C1.33331 10.6678 1.99998 11.3345 3.33331 11.3345H4.28665C4.53331 11.3345 4.77998 11.4078 4.99331 11.5345L6.93998 12.7545C8.61998 13.8078 9.99998 13.0412 9.99998 11.0612V4.94116C9.99998 2.95449 8.61998 2.19449 6.93998 3.24783L4.99331 4.46783C4.77998 4.59449 4.53331 4.66783 4.28665 4.66783H3.33331C1.99998 4.66783 1.33331 5.33449 1.33331 6.66783Z"
                    stroke="#0BA5EC"
                    stroke-width="1.2"
                  />
                  <path
                    d="M12 5.33203C13.1867 6.91203 13.1867 9.08536 12 10.6654"
                    stroke="#0BA5EC"
                    stroke-width="1.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M13.22 3.66797C15.1466 6.23464 15.1466 9.76797 13.22 12.3346"
                    stroke="#0BA5EC"
                    stroke-width="1.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="information-cards">
            <div className="info-card">
              <div className="info-label">Nghĩa</div>
              <div className="info-value">{currentVocab.mean}</div>
            </div>
            <div className="info-card">
              <div className="info-label">Kanji</div>
              <div className="info-value">{currentVocab.kanji}</div>
            </div>
            <div className="info-card">
              <div className="info-label">Âm Hán</div>
              <div className="info-value">{currentVocab.sinoVietNamese}</div>
            </div>
            <div className="info-card">
              <div className="info-label">Ví dụ</div>
              <div className="info-value">{currentVocab.example}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="lesson-vocab-navigation">
        <button
          className="nav-button"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          aria-label="Previous"
        >
          <ArrowLeftOutlined />
        </button>
        <div className="nav-info">
          Câu {currentIndex + 1}/{vocabularies.length}
        </div>
        <button
          className="nav-button"
          onClick={handleNext}
          disabled={currentIndex === vocabularies.length - 1}
          aria-label="Next"
        >
          <ArrowRightOutlined />
        </button>
      </div>

      {/* Voice Recognition Modal */}
      <VoiceRecognitionModal
        open={isVoiceModalOpen}
        onClose={handleVoiceModalClose}
        isListening={isListening}
        voiceResult={voiceResult}
      />
    </div>
  );
};

export default LessonVocab;
