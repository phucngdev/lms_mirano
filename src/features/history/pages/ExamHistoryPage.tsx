import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Breadcrumb, Spin, Pagination, Card } from 'antd';
import { CalendarOutlined, TrophyOutlined } from '@ant-design/icons';
import { getTestResultUserService } from '#/api/services/mockTest.service';
import Cookies from 'js-cookie';
import './ExamHistoryPage.scss';
import { IMeta, TestResultUserDetailEntity } from '#/api/requests';

const ExamHistoryPage = () => {
  const navigate = useNavigate();
  const [testResults, setTestResults] = useState<TestResultUserDetailEntity[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState<IMeta | null>(null);
  const pageSize = 10;

  const user = Cookies.get('user')
    ? JSON.parse(Cookies.get('user') as string)
    : null;
  const userId = user?.id || '';

  useEffect(() => {
    if (userId) {
      fetchTestResults();
    }
  }, [currentPage, userId]);

  const fetchTestResults = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const offset = (currentPage - 1) * pageSize;
      const response = await getTestResultUserService(userId, pageSize, offset);
      const apiData = response.data;

      if (apiData.statusCode === 200 && apiData.data) {
        setTestResults(apiData.data.items);
        setMeta(apiData.data.meta);
      }
    } catch (error) {
      console.error('Error fetching test results:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} phút`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} giờ ${mins} phút` : `${hours} giờ`;
  };

  const breadcrumbItems = [
    {
      title: <Link to="/">Trang chủ</Link>,
    },
    {
      title: 'Lịch sử thi thử',
    },
  ];

  return (
    <div className="exam-history-page">
      <div className="exam-history-page-container">
        {/* Breadcrumb */}
        <div className="exam-history-page-breadcrumb">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* Title */}
        <h1 className="exam-history-page-title">Lịch sử thi thử</h1>

        {/* Test Results List */}
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
        ) : testResults.length > 0 ? (
          <>
            <div className="exam-history-list">
              {testResults.map(result => (
                <Card
                  key={result.id}
                  className="exam-history-card"
                  hoverable
                  onClick={() => {
                    navigate(`/exam-history/${result.id}`, {
                      state: { testResult: result },
                    });
                  }}
                >
                  <div className="exam-history-card-content">
                    <div className="exam-history-card-header">
                      <h3 className="exam-history-test-name">
                        {result.testId?.name || 'Không có tên'}
                      </h3>
                      <div className="exam-history-score">
                        <TrophyOutlined className="exam-history-score-icon" />
                        <span className="exam-history-score-value">
                          {result.score} điểm
                        </span>
                      </div>
                    </div>

                    {/* {result.testId?.description && (
                      <p className="exam-history-description">
                        {result.testId.description}
                      </p>
                    )} */}

                    <div className="exam-history-meta">
                      <div className="exam-history-meta-item">
                        <CalendarOutlined className="exam-history-meta-icon" />
                        <span>{formatDate(result.createdAt)}</span>
                      </div>
                      {result.testId?.duration && (
                        <div className="exam-history-meta-item">
                          <span>
                            Thời gian: {formatDuration(result.testId.duration)}
                          </span>
                        </div>
                      )}
                      {result.testId?.numberOfParticipants !== undefined && (
                        <div className="exam-history-meta-item">
                          <span>
                            {result.testId.numberOfParticipants} người tham gia
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {meta && meta.totalPages && meta.totalPages > 1 && (
              <div className="exam-history-pagination">
                <Pagination
                  current={currentPage}
                  total={meta.total}
                  pageSize={pageSize}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  showQuickJumper
                />
              </div>
            )}
          </>
        ) : (
          <div className="exam-history-empty">
            <p>Chưa có lịch sử thi thử nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamHistoryPage;
