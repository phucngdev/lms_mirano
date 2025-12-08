import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Breadcrumb, Modal } from 'antd';
import {
  IconPeople,
  IconClock,
  ArrowRight,
  DotIcon,
} from '#/assets/svg/externalIcon';
import './TestDetail.scss';

interface TestPart {
  id: number;
  name: string;
  time: number; // in minutes
  questionCount: number;
}

interface TestExam {
  id: number;
  title: string;
  participantCount: number;
  duration: number; // in minutes
  parts: TestPart[];
}

const TestDetail = () => {
  // This would typically come from useParams or props
  const testSeriesName = 'Cùng Manten N3';
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<TestExam | null>(null);

  const testExams: TestExam[] = [
    {
      id: 1,
      title: 'Đề thi thử N3 (Trận 5)',
      participantCount: 23,
      duration: 139,
      parts: [
        { id: 1, name: 'CHỮ HÁN', time: 7, questionCount: 14 },
        { id: 2, name: 'TỪ VỰNG', time: 15, questionCount: 21 },
        { id: 3, name: 'NGỮ PHÁP', time: 10, questionCount: 13 },
        { id: 4, name: 'NGỮ PHÁP (BÀI SAO)', time: 5, questionCount: 5 },
        { id: 5, name: 'NGỮ PHÁP (BÀI ĐỤC LỖ)', time: 3, questionCount: 0 },
        { id: 6, name: 'ĐỌC ĐOẢN VĂN', time: 0, questionCount: 0 },
      ],
    },
    {
      id: 2,
      title: 'Đề thi thử N3 (Trận 4)',
      participantCount: 14,
      duration: 131,
      parts: [
        { id: 1, name: 'CHỮ HÁN', time: 7, questionCount: 14 },
        { id: 2, name: 'TỪ VỰNG', time: 15, questionCount: 21 },
        { id: 3, name: 'NGỮ PHÁP', time: 10, questionCount: 13 },
      ],
    },
    {
      id: 3,
      title: 'Đề thi thử N3 (Trận 3)',
      participantCount: 17,
      duration: 40,
      parts: [
        { id: 1, name: 'CHỮ HÁN', time: 7, questionCount: 14 },
        { id: 2, name: 'TỪ VỰNG', time: 15, questionCount: 21 },
      ],
    },
    {
      id: 4,
      title: 'Đề thi thử N3 (Trận 2)',
      participantCount: 22,
      duration: 53,
      parts: [
        { id: 1, name: 'CHỮ HÁN', time: 7, questionCount: 14 },
        { id: 2, name: 'TỪ VỰNG', time: 15, questionCount: 21 },
        { id: 3, name: 'NGỮ PHÁP', time: 10, questionCount: 13 },
      ],
    },
    {
      id: 5,
      title: 'Đề thi thử N3 (Trận 1)',
      participantCount: 57,
      duration: 58,
      parts: [
        { id: 1, name: 'CHỮ HÁN', time: 7, questionCount: 14 },
        { id: 2, name: 'TỪ VỰNG', time: 15, questionCount: 21 },
      ],
    },
    {
      id: 6,
      title: 'Đề thi thử N3 - Lần 1',
      participantCount: 66,
      duration: 119,
      parts: [
        { id: 1, name: 'CHỮ HÁN', time: 7, questionCount: 14 },
        { id: 2, name: 'TỪ VỰNG', time: 15, questionCount: 21 },
        { id: 3, name: 'NGỮ PHÁP', time: 10, questionCount: 13 },
      ],
    },
  ];

  const handleOpenModal = (exam: TestExam) => {
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
      navigate(`/test-mode/${selectedExam.id}`);
    }
  };

  const breadcrumbItems = [
    {
      title: <Link to="/">Trang chủ</Link>,
    },
    {
      title: <Link to="/test-page">Thi thử cùng Mirano</Link>,
    },
    {
      title: `${testSeriesName}❤❤❤`,
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
        <h1 className="test-detail-title">Đề thi "{testSeriesName}❤❤❤"</h1>

        {/* Test Cards Grid */}
        <div className="test-detail-grid">
          {testExams.map(exam => (
            <div key={exam.id} className="test-detail-card">
              {/* Content */}
              <div className="test-detail-card-content">
                <div className="test-detail-category">{testSeriesName}❤❤</div>
                <h3 className="test-detail-card-title">{exam.title}</h3>
                <div className="test-detail-card-stats">
                  <div className="test-detail-stat-item">
                    <IconPeople color="#676767" width={16} height={16} />
                    <span>{exam.participantCount} người tham gia</span>
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
                  {testSeriesName} 😍😍
                </div>
                <h2 className="test-info-modal-title">{selectedExam.title}</h2>
              </div>
              <div className="test-info-modal-stats">
                <div className="test-info-stat-item">
                  <IconPeople color="#676767" width={16} height={16} />
                  <span>{selectedExam.participantCount} người tham gia</span>
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
                {selectedExam.parts.map((part, index) => (
                  <div key={part.id} className="test-info-part-item">
                    <div className="test-info-part-name">{part.name}</div>
                    <div className="test-info-part-details">
                      {part.time > 0 && (
                        <>
                          <span>Thời gian: {part.time} phút</span>
                          <DotIcon />
                        </>
                      )}
                      <span>Số câu hỏi: {part.questionCount} câu</span>
                    </div>
                    {index < selectedExam.parts.length - 1 && (
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
