import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { Breadcrumb, Modal, Spin } from 'antd';
import {
  IconPeople,
  IconClock,
  ArrowRight,
  DotIcon,
} from '#/assets/svg/externalIcon';
import { getTestByIdMockTestService } from '#/api/services/mockTest.service';
import { TestEntity } from '#/api/requests';
import './TestDetail.scss';

const TestDetail = () => {
  const { id: categoryId } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<TestEntity | null>(null);
  const [testExams, setTestExams] = useState<TestEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [testSeriesName, setTestSeriesName] = useState('');

  // Get category name from location state (passed from TestPage)
  useEffect(() => {
    if (location.state?.categoryName) {
      setTestSeriesName(location.state.categoryName);
    }
  }, [location.state]);

  useEffect(() => {
    if (categoryId) {
      fetchTestExams();
    }
  }, [categoryId]);

  const fetchTestExams = async () => {
    if (!categoryId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getTestByIdMockTestService(categoryId, 100, 0);
      const apiData = response.data;

      if (apiData.statusCode === 200 && apiData.data?.items) {
        setTestExams(apiData.data.items);
        // Set category name from first test if not set from location state
        if (!testSeriesName && apiData.data.items.length > 0) {
          // You might need to fetch category separately or get it from location state
        }
      }
    } catch (error) {
      console.error('Error fetching test exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (exam: TestEntity) => {
    setSelectedExam(exam);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedExam(null);
  };

  const handleStartTest = () => {
    if (selectedExam) {
      handleCloseModal();
      navigate(`/test-mode/${categoryId}/${selectedExam.id}`);
    }
  };

  // Extract emoji from name (if exists)
  const extractEmoji = (name: string): { name: string; emoji: string } => {
    const emojiRegex =
      /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    const emojis = name.match(emojiRegex);
    const emoji = emojis ? emojis.join('') : '';
    const cleanName = name.replace(emojiRegex, '').trim();
    return { name: cleanName, emoji };
  };

  const displayName = testSeriesName || 'Thi thử cùng Mirano';
  const { name: cleanCategoryName, emoji: categoryEmoji } =
    extractEmoji(displayName);

  const breadcrumbItems = [
    {
      title: <Link to="/">Trang chủ</Link>,
    },
    {
      title: <Link to="/test-page">Thi thử cùng Mirano</Link>,
    },
    {
      title: `${cleanCategoryName}${categoryEmoji}`,
    },
  ];

  return (
    <div className="test-detail-page">
      <div className="test-detail-container">
        {/* Breadcrumb */}
        <div className="test-detail-breadcrumb">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* Title */}
        <h1 className="test-detail-title">
          Đề thi "{cleanCategoryName}
          {categoryEmoji}"
        </h1>

        {/* Test Cards Grid */}
        {loading ? (
          <div className="test-detail-loading">
            <Spin size="large" />
          </div>
        ) : testExams.length > 0 ? (
          <div className="test-detail-grid">
            {testExams.map(exam => (
              <div key={exam.id} className="test-detail-card">
                {/* Content */}
                <div className="test-detail-card-content">
                  <div className="test-detail-category">
                    {cleanCategoryName}
                    {categoryEmoji}
                  </div>
                  <h3 className="test-detail-card-title">{exam.name}</h3>
                  <div className="test-detail-card-stats">
                    <div className="test-detail-stat-item">
                      <IconPeople color="#676767" width={16} height={16} />
                      <span>{exam.numberOfParticipants} người tham gia</span>
                    </div>
                    <div className="test-detail-stat-item">
                      <IconClock color="#676767" width={16} height={16} />
                      <span>{exam.duration} phút</span>
                    </div>
                  </div>
                  <button
                    className="test-detail-card-button"
                    onClick={() => handleOpenModal(exam)}
                  >
                    Vào thi ngay
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="test-detail-empty">
            <p>Chưa có đề thi nào</p>
          </div>
        )}
      </div>

      <Modal
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        width={500}
        className="test-info-modal"
        closeIcon={null}
        style={{
          top: 50,
        }}
      >
        {selectedExam && (
          <div className="test-info-modal-content">
            {/* Header */}
            <div className="test-info-modal-header">
              <div className="test-info-modal-title-section">
                <div className="test-info-modal-category">
                  {cleanCategoryName} {categoryEmoji}
                </div>
                <h2 className="test-info-modal-title">{selectedExam.name}</h2>
              </div>
              <div className="test-info-modal-stats">
                <div className="test-info-stat-item">
                  <IconPeople color="#676767" width={16} height={16} />
                  <span>
                    {selectedExam.numberOfParticipants} người tham gia
                  </span>
                </div>
                <div className="test-info-stat-item">
                  <IconClock color="#676767" width={16} height={16} />
                  <span>{selectedExam.duration} phút</span>
                </div>
              </div>
            </div>

            {/* Content - Test Structure */}
            <div className="test-info-modal-body">
              <h3 className="test-info-section-title">Cấu trúc bài thi</h3>
              <div className="test-info-parts-list">
                {selectedExam.testDetails &&
                  selectedExam.testDetails.length > 0 &&
                  selectedExam.testDetails
                    .sort((a, b) => a.pos - b.pos)
                    .map((part, index) => (
                      <div key={part.id} className="test-info-part-item">
                        <div className="test-info-part-name">{part.name}</div>
                        <div className="test-info-part-details">
                          {part.timeLimit > 0 && (
                            <>
                              <span>Thời gian: {part.timeLimit} phút</span>
                              <DotIcon />
                            </>
                          )}
                          <span>Số câu hỏi: {part.numberOfQuestions} câu</span>
                        </div>
                        {index < selectedExam.testDetails.length - 1 && (
                          <div className="test-info-part-divider" />
                        )}
                      </div>
                    ))}
              </div>
            </div>

            {/* Footer */}
            <div className="test-info-modal-footer">
              <button
                className="test-info-modal-button test-info-modal-button-cancel"
                onClick={handleCloseModal}
              >
                Quay lại
              </button>
              <button
                className="test-info-modal-button test-info-modal-button-primary"
                onClick={handleStartTest}
              >
                Vào bài thi
                <ArrowRight color="white" width={20} height={20} />
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TestDetail;
