import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Spin } from 'antd';
import {
  MessageOutlined,
  ShoppingOutlined,
  HomeOutlined,
  CarOutlined,
  HeartOutlined,
  CoffeeOutlined,
  BookOutlined,
  LaptopOutlined,
  TeamOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import './KaiwaAIPage.scss';

interface ConversationTopic {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
}

// Mock data cứng - các chủ đề giao tiếp
const conversationTopics: ConversationTopic[] = [
  {
    id: '1',
    title: 'Chào hỏi cơ bản',
    description: 'Học cách chào hỏi và giới thiệu bản thân',
    icon: <MessageOutlined />,
    category: 'Cơ bản',
  },
  {
    id: '2',
    title: 'Mua sắm',
    description: 'Luyện tập hội thoại khi đi mua sắm',
    icon: <ShoppingOutlined />,
    category: 'Giao tiếp',
  },
  {
    id: '3',
    title: 'Gia đình',
    description: 'Nói về gia đình và các mối quan hệ',
    icon: <HomeOutlined />,
    category: 'Gia đình',
  },
  {
    id: '4',
    title: 'Du lịch',
    description: 'Hội thoại về du lịch và phương tiện đi lại',
    icon: <CarOutlined />,
    category: 'Du lịch',
  },
  {
    id: '5',
    title: 'Tình yêu',
    description: 'Chủ đề về tình yêu và mối quan hệ',
    icon: <HeartOutlined />,
    category: 'Cá nhân',
  },
  {
    id: '6',
    title: 'Nhà hàng',
    description: 'Đặt món và giao tiếp tại nhà hàng',
    icon: <CoffeeOutlined />,
    category: 'Ẩm thực',
  },
  {
    id: '7',
    title: 'Học tập',
    description: 'Nói về việc học và giáo dục',
    icon: <BookOutlined />,
    category: 'Giáo dục',
  },
  {
    id: '8',
    title: 'Công việc',
    description: 'Hội thoại về công việc và nghề nghiệp',
    icon: <LaptopOutlined />,
    category: 'Công việc',
  },
  {
    id: '9',
    title: 'Bạn bè',
    description: 'Trò chuyện với bạn bè',
    icon: <TeamOutlined />,
    category: 'Xã hội',
  },
  {
    id: '10',
    title: 'Văn hóa',
    description: 'Thảo luận về văn hóa và truyền thống',
    icon: <GlobalOutlined />,
    category: 'Văn hóa',
  },
];

const KaiwaAIPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleTopicClick = (topicId: string) => {
    navigate(`/kaiwa-ai/conversation/${topicId}`);
  };

  return (
    <div className="kaiwa-ai-page">
      <div className="kaiwa-ai-container">
        {/* Header */}
        <div className="kaiwa-ai-header">
          <h1 className="kaiwa-ai-title">Kaiwa AI</h1>
          <p className="kaiwa-ai-subtitle">
            Luyện tập hội thoại Tiếng Nhật mọi lúc mọi nơi với AI. Chọn chủ đề
            bạn muốn thực hành và bắt đầu cuộc trò chuyện!
          </p>
        </div>

        {/* Topics Grid */}
        {loading ? (
          <div className="kaiwa-ai-loading">
            <Spin size="large" />
          </div>
        ) : (
          <div className="kaiwa-ai-topics-grid">
            {conversationTopics.map(topic => (
              <Card
                key={topic.id}
                className="kaiwa-ai-topic-card"
                hoverable
                onClick={() => handleTopicClick(topic.id)}
              >
                <div className="topic-card-content">
                  <div className="topic-card-icon">{topic.icon}</div>
                  <div className="topic-card-info">
                    <span className="topic-card-category">{topic.category}</span>
                    <h3 className="topic-card-title">{topic.title}</h3>
                    <p className="topic-card-description">
                      {topic.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KaiwaAIPage;

