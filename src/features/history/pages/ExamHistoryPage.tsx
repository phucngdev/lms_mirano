import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Breadcrumb, Spin, Pagination } from 'antd';
import {
  CalendarOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  UserOutlined,
  RightOutlined,
} from '@ant-design/icons';
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
          <div className="exam-history-loading">
            <Spin size="large" />
          </div>
        ) : testResults.length > 0 ? (
          <>
            {/* Table Header */}
            <div className="exam-history-table-header">
              <div className="exam-history-header-cell exam-history-header-test">
                Tên bài thi
              </div>
              <div className="exam-history-header-cell exam-history-header-date">
                Ngày thi
              </div>
              <div className="exam-history-header-cell exam-history-header-duration">
                Thời gian
              </div>
              <div className="exam-history-header-cell exam-history-header-participants">
                Người tham gia
              </div>
              <div className="exam-history-header-cell exam-history-header-score">
                Điểm số
              </div>
              <div className="exam-history-header-cell exam-history-header-action">
                Thao tác
              </div>
            </div>

            {/* Table Body */}
            <div className="exam-history-list">
              {testResults.map(result => (
                <div
                  key={result.id}
                  className="exam-history-row"
                  onClick={() => {
                    navigate(`/exam-history/${result.id}`, {
                      state: { testResult: result },
                    });
                  }}
                >
                  <div className="exam-history-cell exam-history-cell-test">
                    <span className="exam-history-cell-label">Tên bài thi</span>
                    <h3 className="exam-history-test-name">
                      {result.testId?.name || 'Không có tên'}
                    </h3>
                  </div>
                  <div className="exam-history-cell exam-history-cell-date">
                    <span className="exam-history-cell-label">Ngày thi</span>
                    <div className="exam-history-meta-item">
                      <CalendarOutlined className="exam-history-meta-icon" />
                      <span>{formatDate(result.createdAt)}</span>
                    </div>
                  </div>
                  <div className="exam-history-cell exam-history-cell-duration">
                    <span className="exam-history-cell-label">Thời gian</span>
                    {result.testId?.duration ? (
                      <div className="exam-history-meta-item">
                        <ClockCircleOutlined className="exam-history-meta-icon" />
                        <span>{formatDuration(result.testId.duration)}</span>
                      </div>
                    ) : (
                      <span className="exam-history-empty-value">-</span>
                    )}
                  </div>
                  <div className="exam-history-cell exam-history-cell-participants">
                    <span className="exam-history-cell-label">
                      Người tham gia
                    </span>
                    {result.testId?.numberOfParticipants !== undefined ? (
                      <div className="exam-history-meta-item">
                        <UserOutlined className="exam-history-meta-icon" />
                        <span>{result.testId.numberOfParticipants}</span>
                      </div>
                    ) : (
                      <span className="exam-history-empty-value">-</span>
                    )}
                  </div>
                  <div className="exam-history-cell exam-history-cell-score">
                    <span className="exam-history-cell-label">Điểm số</span>
                    <div className="exam-history-score-badge">
                      <TrophyOutlined className="exam-history-score-icon" />
                      <span className="exam-history-score-value">
                        {result.score}
                      </span>
                    </div>
                  </div>
                  <div className="exam-history-cell exam-history-cell-action">
                    <RightOutlined className="exam-history-action-icon" />
                  </div>
                </div>
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
            <div className="exam-history-empty-icon">
              <TrophyOutlined />
            </div>
            <p className="exam-history-empty-text">
              Chưa có lịch sử thi thử nào
            </p>
            <p className="exam-history-empty-subtext">
              Hãy bắt đầu làm bài thi để xem lịch sử tại đây
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamHistoryPage;
