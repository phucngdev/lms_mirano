import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Breadcrumb, Spin, Pagination } from 'antd';
import { getAllTopicService } from '#/api/services/topic.service';
import './TopicsPage.scss';

interface TopicItem {
  id: string;
  name: string;
  image: string;
  count: number;
}

interface ApiMeta {
  limit: number;
  offset: number;
  total: number;
  totalPages: number;
}

interface ApiResponse {
  statusCode: number;
  data: {
    items: TopicItem[];
    meta: ApiMeta;
  };
}

const TopicsPage = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState<ApiMeta | null>(null);
  const pageSize = 16;

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * pageSize;
      const response = await getAllTopicService(pageSize, offset);
      const apiData: ApiResponse = response.data;

      if (apiData.statusCode === 200 && apiData.data) {
        setTopics(apiData.data.items);
        setMeta(apiData.data.meta);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const breadcrumbItems = [
    {
      title: <Link to="/">Trang chủ</Link>,
    },

    {
      title: 'Tiếng Nhật theo chủ đề',
    },
  ];

  return (
    <div className="topics-page">
      <div className="topics-page-container">
        {/* Breadcrumb */}
        <div className="topics-page-breadcrumb">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* Title */}
        <h1 className="topics-page-title">Tiếng Nhật theo chủ đề</h1>

        {/* Topics Grid */}
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
            <div className="topics-page-grid">
              {topics.map(topic => (
                <div
                  key={topic.id}
                  className="topic-card"
                  onClick={() => navigate(`/topics/${topic.id}`)}
                >
                  {/* Image */}
                  <div className="topic-card-image-container">
                    <img
                      src={topic.image}
                      alt={topic.name}
                      className="topic-card-image"
                      onError={e => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const placeholder =
                          target.nextElementSibling as HTMLElement;
                        if (placeholder) {
                          placeholder.style.display = 'flex';
                        }
                      }}
                    />
                    <div className="topic-card-image-placeholder">
                      <div className="topic-card-icon-placeholder" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="topic-card-content">
                    <div className="topic-card-label">Chủ đề</div>
                    <h3 className="topic-card-name">{topic.name}</h3>
                    <div className="topic-card-count">
                      {topic.count} từ vựng
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {meta && meta.total > pageSize && (
              <div className="topics-page-pagination">
                <Pagination
                  current={currentPage}
                  total={meta.total}
                  pageSize={pageSize}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TopicsPage;
