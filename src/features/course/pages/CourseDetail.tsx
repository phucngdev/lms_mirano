import { useEffect, useState } from 'react';
import { Breadcrumb, Pagination } from 'antd';
import { Link, useNavigate, useParams } from 'react-router-dom';
import './CourseDetail.scss';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '#/src/redux/store/store';
import { getAllSessonByIdCourse } from '#/src/redux/thunk/sesson.thunk';

const CourseDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;
  const dispatch = useAppDispatch();
  const { data: sessons } = useSelector((state: RootState) => state.sesson);
  const courseName = sessionStorage.getItem('courseName') || '';

  const fetchSessons = async () => {
    await dispatch(
      getAllSessonByIdCourse({
        id: id || '',
        limit: pageSize,
        offset: (currentPage - 1) * pageSize,
      }),
    );
  };

  useEffect(() => {
    fetchSessons();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchSessons();
  };

  const breadcrumbItems = [
    {
      title: <Link to="/">Trang chủ</Link>,
    },
    {
      title: <Link to="/">Khóa học online</Link>,
    },
    {
      title: 'Khóa học "N1 CHILL CLASS"',
    },
  ];

  return (
    <div className="course-detail">
      <div className="course-detail-container">
        <div className="course-detail-header">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <h1 className="course-detail-title">Khóa học "{courseName}"</h1>

        <div className="course-detail-grid">
          {sessons.items.map(module => (
            <div
              key={module.id}
              className="course-module-card"
              onClick={() => {
                sessionStorage.setItem('courseId', id || '');
                sessionStorage.setItem('sessonName', module.title);
                navigate(`/sesson/${module.id}/lesson/${module.firstLessonId}`);
              }}
            >
              <div className="course-module-header">
                <span className="course-module-label">{courseName}</span>
                <h3 className="course-module-title">{module.title}</h3>
              </div>
              <div className="course-module-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${module.progress}%` }}
                  >
                    <div className="progress-dot" />
                  </div>
                </div>
                <div className="progress-text">
                  {module.progress}% Hoàn thành
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="course-detail-pagination">
          <Pagination
            current={currentPage}
            total={sessons?.meta?.total}
            pageSize={pageSize}
            onChange={handlePageChange}
            showSizeChanger={false}
          />
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
