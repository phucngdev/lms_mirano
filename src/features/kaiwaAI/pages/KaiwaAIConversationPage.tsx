import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Spin, message } from 'antd';
import {
  ArrowLeftOutlined,
  RobotOutlined,
  UserOutlined,
  AudioOutlined,
} from '@ant-design/icons';
import './KaiwaAIConversationPage.scss';

// Extend Window interface for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

// Mock data - mapping topic ID to topic info
const topicMap: Record<
  string,
  { title: string; description: string; initialMessage: string }
> = {
  '1': {
    title: 'Chào hỏi cơ bản',
    description: 'Học cách chào hỏi và giới thiệu bản thân',
    initialMessage:
      'こんにちは！私はAIアシスタントです。今日は何を話しましょうか？(Xin chào! Tôi là trợ lý AI. Hôm nay chúng ta sẽ nói về điều gì?)',
  },
  '2': {
    title: 'Mua sắm',
    description: 'Luyện tập hội thoại khi đi mua sắm',
    initialMessage:
      'いらっしゃいませ！何かお探しですか？(Chào mừng bạn! Bạn đang tìm gì?)',
  },
  '3': {
    title: 'Gia đình',
    description: 'Nói về gia đình và các mối quan hệ',
    initialMessage:
      '家族について話しましょう。あなたの家族は何人ですか？(Hãy nói về gia đình. Gia đình bạn có bao nhiêu người?)',
  },
  '4': {
    title: 'Du lịch',
    description: 'Hội thoại về du lịch và phương tiện đi lại',
    initialMessage:
      '旅行が好きですか？どこに行きたいですか？(Bạn có thích du lịch không? Bạn muốn đi đâu?)',
  },
  '5': {
    title: 'Tình yêu',
    description: 'Chủ đề về tình yêu và mối quan hệ',
    initialMessage:
      '恋愛について話しましょう。あなたは恋をしたことがありますか？(Hãy nói về tình yêu. Bạn đã từng yêu chưa?)',
  },
  '6': {
    title: 'Nhà hàng',
    description: 'Đặt món và giao tiếp tại nhà hàng',
    initialMessage:
      'いらっしゃいませ！ご注文は何にしますか？(Chào mừng! Bạn muốn gọi món gì?)',
  },
  '7': {
    title: 'Học tập',
    description: 'Nói về việc học và giáo dục',
    initialMessage:
      '勉強について話しましょう。あなたは何を勉強していますか？(Hãy nói về việc học. Bạn đang học gì?)',
  },
  '8': {
    title: 'Công việc',
    description: 'Hội thoại về công việc và nghề nghiệp',
    initialMessage:
      '仕事について話しましょう。あなたの職業は何ですか？(Hãy nói về công việc. Nghề nghiệp của bạn là gì?)',
  },
  '9': {
    title: 'Bạn bè',
    description: 'Trò chuyện với bạn bè',
    initialMessage:
      '友達について話しましょう。あなたには何人友達がいますか？(Hãy nói về bạn bè. Bạn có bao nhiêu người bạn?)',
  },
  '10': {
    title: 'Văn hóa',
    description: 'Thảo luận về văn hóa và truyền thống',
    initialMessage:
      '文化について話しましょう。日本の文化に興味がありますか？(Hãy nói về văn hóa. Bạn có quan tâm đến văn hóa Nhật Bản không?)',
  },
};

const KaiwaAIConversationPage = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const finalTextRef = useRef<string>('');

  const topic = topicId ? topicMap[topicId] : null;

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      message.warning(
        'Trình duyệt của bạn không hỗ trợ nhận diện giọng nói. Vui lòng sử dụng Chrome hoặc Edge.',
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'ja-JP'; // Japanese language

    recognition.onstart = () => {
      setIsListening(true);
      setRecognizedText('');
      finalTextRef.current = '';
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        finalTextRef.current = finalTranscript.trim();
        setRecognizedText(finalTextRef.current);
      } else {
        setRecognizedText(interimTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'no-speech') {
        message.info('Không phát hiện giọng nói. Vui lòng thử lại.');
      } else if (event.error === 'not-allowed') {
        message.error('Quyền truy cập microphone bị từ chối.');
      } else {
        message.error('Lỗi nhận diện giọng nói. Vui lòng thử lại.');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      const textToSend = finalTextRef.current.trim();
      if (textToSend) {
        handleSendMessage(textToSend);
        setRecognizedText('');
        finalTextRef.current = '';
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Initialize with AI's first message
  useEffect(() => {
    if (topic && messages.length === 0) {
      setMessages([
        {
          id: '1',
          text: topic.initialMessage,
          sender: 'ai',
          timestamp: new Date(),
        },
      ]);
    }
  }, [topic, messages.length]);

  // Auto scroll to bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (text?: string) => {
    const messageText = text || recognizedText.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setRecognizedText('');
    setIsLoading(true);

    // TODO: Call AI API to get response
    // Mock AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateMockAIResponse(messageText),
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000);
  };

  const handleStartListening = () => {
    if (isListening) {
      // Stop listening
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } else {
      // Start listening
      if (recognitionRef.current) {
        setRecognizedText('');
        recognitionRef.current.start();
      }
    }
  };

  const generateMockAIResponse = (userInput: string): string => {
    // Simple mock responses based on keywords
    const lowerInput = userInput.toLowerCase();
    if (lowerInput.includes('こんにちは') || lowerInput.includes('xin chào')) {
      return 'こんにちは！元気ですか？(Xin chào! Bạn khỏe không?)';
    }
    if (lowerInput.includes('ありがとう') || lowerInput.includes('cảm ơn')) {
      return 'どういたしまして！他に何か質問がありますか？(Không có gì! Bạn còn câu hỏi nào khác không?)';
    }
    if (lowerInput.includes('さようなら') || lowerInput.includes('tạm biệt')) {
      return 'さようなら！また今度話しましょう。(Tạm biệt! Hẹn gặp lại lần sau.)';
    }
    return 'なるほど！もっと詳しく教えてください。(Hiểu rồi! Hãy cho tôi biết thêm chi tiết.)';
  };

  if (!topic) {
    return (
      <div className="kaiwa-ai-conversation-page">
        <div className="conversation-error">
          <p>Chủ đề không tồn tại</p>
          <Button onClick={() => navigate('/kaiwa-ai')}>
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="kaiwa-ai-conversation-page">
      <div className="conversation-container">
        {/* Header */}
        <div className="conversation-header">
          <div className="conversation-header-info">
            <h1 className="conversation-title">{topic.title}</h1>
            <p className="conversation-description">{topic.description}</p>
          </div>
        </div>

        {/* Messages Area */}
        <div className="conversation-messages">
          {messages.map(message => (
            <div
              key={message.id}
              className={`message-item message-${message.sender}`}
            >
              <div className="message-avatar">
                {message.sender === 'ai' ? <RobotOutlined /> : <UserOutlined />}
              </div>
              <div className="message-content">
                <div className="message-bubble">
                  <p className="message-text">{message.text}</p>
                </div>
                <span className="message-time">
                  {message.timestamp.toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message-item message-ai">
              <div className="message-avatar">
                <RobotOutlined />
              </div>
              <div className="message-content">
                <div className="message-bubble message-loading">
                  <Spin size="small" />
                  <span>AI đang suy nghĩ...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="conversation-input-area">
          {recognizedText && (
            <div className="conversation-recognized-text">
              <span className="recognized-label">Đã nhận diện:</span>
              <span className="recognized-content">{recognizedText}</span>
            </div>
          )}
          <div className="conversation-input-wrapper">
            <Button
              type="primary"
              icon={<AudioOutlined />}
              onClick={handleStartListening}
              disabled={isLoading}
              className={`conversation-mic-button ${isListening ? 'listening' : ''}`}
              size="large"
            >
              {isListening ? 'Đang nghe...' : 'Nhấn để nói'}
            </Button>
            {recognizedText && !isListening && (
              <Button
                type="default"
                onClick={() => handleSendMessage()}
                disabled={isLoading}
                className="conversation-send-button"
                size="large"
              >
                Gửi
              </Button>
            )}
          </div>
          {isListening && (
            <div className="conversation-listening-indicator">
              <div className="listening-pulse"></div>
              <span>Đang nghe bạn nói...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KaiwaAIConversationPage;
