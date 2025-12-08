import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Breadcrumb, Spin, Pagination } from 'antd';
import { IconMic, IconListen } from '#/assets/svg/externalIcon';
import {
  getDetailTopicService,
  getTopicByIdService,
} from '#/api/services/topic.service';
import VoiceRecognitionModal from '../components/VoiceRecognitionModal';
import './TopicVocabPage.scss';

interface VocabItem {
  id: string;
  originText: string;
  vietnamesePronounce: string;
  japanesePronounce: string;
}

interface ApiMeta {
  limit: number;
  offset: number;
  total: number;
  totalPages: number;
}

interface VocabApiResponse {
  statusCode: number;
  data: {
    items: VocabItem[];
    meta: ApiMeta;
  };
}

interface TopicApiResponse {
  statusCode: number;
  data: {
    id: string;
    name: string;
    image: string;
    count: number;
  };
}

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
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
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

const TopicVocabPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [allVocabs, setAllVocabs] = useState<VocabItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState<ApiMeta | null>(null);
  const [topicName, setTopicName] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVocab, setSelectedVocab] = useState<VocabItem | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceResult, setVoiceResult] = useState<{
    score: number;
    feedback: string;
  } | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pageSize = 20;

  const fetchTopicInfo = async () => {
    if (!id) return;
    try {
      const response = await getTopicByIdService(id);
      const apiData: TopicApiResponse = response.data;
      if (apiData.statusCode === 200 && apiData.data) {
        setTopicName(apiData.data.name);
      }
    } catch (error) {
      console.error('Error fetching topic info:', error);
    }
  };

  const fetchVocabs = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await getDetailTopicService(id);
      const apiData: VocabApiResponse = response.data;

      if (apiData.statusCode === 200 && apiData.data) {
        setAllVocabs(apiData.data.items);
        setMeta(apiData.data.meta);
      }
    } catch (error) {
      console.error('Error fetching vocabs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopicInfo();
    fetchVocabs();
  }, [id]);

  // Calculate paginated vocabs
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const vocabs = allVocabs.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const calculateScore = (
    recognizedText: string,
    correctText: string,
  ): number => {
    const normalizedRecognized = recognizedText.toLowerCase().trim();
    const normalizedCorrect = correctText.toLowerCase().trim();

    if (normalizedRecognized === normalizedCorrect) {
      return 5;
    }

    // Simple similarity check
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

  const handleMicClick = (vocab: VocabItem) => {
    setSelectedVocab(vocab);
    setVoiceResult(null);
    setIsModalOpen(true);
    startListening(vocab);
  };

  const startListening = (vocab: VocabItem) => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Trình duyệt của bạn không hỗ trợ nhận diện giọng nói');
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
        const score = calculateScore(transcript, vocab.japanesePronounce);
        const feedback = getFeedback(score);

        setVoiceResult({ score, feedback });
        setIsListening(false);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'no-speech') {
        alert('Không nghe được. Vui lòng thử lại.');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleStopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handlePlayAudio = (vocab: VocabItem) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    // Use Web Speech API SpeechSynthesis for text-to-speech
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(vocab.japanesePronounce);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleModalClose = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsModalOpen(false);
    setSelectedVocab(null);
    setIsListening(false);
    setVoiceResult(null);
  };

  const breadcrumbItems = [
    {
      title: <Link to="/">Trang chủ</Link>,
    },
    {
      title: <Link to="/topics">Khóa học Online</Link>,
    },
    {
      title: <Link to="/topics">Tiếng Nhật theo chủ đề</Link>,
    },
    {
      title: topicName || 'Từ vựng',
    },
  ];

  return (
    <div className="topic-vocab-page">
      <div className="topic-vocab-page-container">
        {/* Breadcrumb */}
        <div className="topic-vocab-page-breadcrumb">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* Title */}
        <h1 className="topic-vocab-page-title">
          {topicName ? `Từ vựng - ${topicName}` : 'Từ vựng'}
        </h1>

        {/* Vocab Cards Grid */}
        {loading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '40px',
            }}
          >
            <Spin size="large" />
          </div>
        ) : (
          <>
            <div className="topic-vocab-page-grid">
              {vocabs.map(vocab => (
                <div key={vocab.id} className="vocab-card">
                  <div className="vocab-card-content">
                    <div className="vocab-card-header">
                      <div className="vocab-card-label">Từ vựng:</div>
                      <div className="vocab-card-icons">
                        <button
                          className="vocab-icon-button vocab-icon-mic"
                          onClick={e => {
                            e.stopPropagation();
                            handleMicClick(vocab);
                          }}
                          aria-label="Record audio"
                        >
                          <IconMic color="#F37142" />
                        </button>
                        <button
                          className="vocab-icon-button vocab-icon-speaker"
                          onClick={e => {
                            e.stopPropagation();
                            handlePlayAudio(vocab);
                          }}
                          aria-label="Play audio"
                        >
                          <IconListen color="#0BA5EC" />
                        </button>
                      </div>
                    </div>
                    <div className="vocab-card-origin">{vocab.originText}</div>
                    <div className="vocab-card-japanese">
                      {vocab.japanesePronounce}
                    </div>
                    <div className="vocab-card-vietnamese">
                      {vocab.vietnamesePronounce}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {allVocabs.length > pageSize && (
              <div className="topic-vocab-page-pagination">
                <Pagination
                  current={currentPage}
                  total={allVocabs.length}
                  pageSize={pageSize}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Voice Recognition Modal */}
      <VoiceRecognitionModal
        open={isModalOpen}
        onClose={handleModalClose}
        vocab={selectedVocab}
        isListening={isListening}
        voiceResult={voiceResult}
        onMicClick={() => {
          if (selectedVocab) {
            setVoiceResult(null);
            startListening(selectedVocab);
          }
        }}
        onSpeakerClick={() => {
          if (selectedVocab) {
            handlePlayAudio(selectedVocab);
          }
        }}
      />
    </div>
  );
};

export default TopicVocabPage;
