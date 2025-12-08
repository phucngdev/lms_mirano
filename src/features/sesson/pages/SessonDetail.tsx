import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import {
  CheckCircleOutlined,
  ArrowLeftOutlined,
  TrophyOutlined,
  MenuOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import './SessonDetail.scss';
import { LessonStudentEntity } from '#/api/requests/models/LessonStudentEntity';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '#/src/redux/store/store';
import { getAllLessonBySessonId } from '#/src/redux/thunk/lesson.thunk';

const SessonDetail = () => {
  const { id, lessonId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { data: lessons } = useSelector((state: RootState) => state.lesson);
  const sessonName = sessionStorage.getItem('sessonName') || '';
  const courseId = sessionStorage.getItem('courseId') || '';

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const fetchLessons = async () => {
    await dispatch(getAllLessonBySessonId(id || ''));
  };

  useEffect(() => {
    fetchLessons();
  }, [id]);

  const handleLessonClick = (lessonId: string) => {
    navigate(`/sesson/${id}/lesson/${lessonId}`);
    setIsMenuOpen(false);
  };

  return (
    <div className="sesson-detail">
      <div className="sesson-detail-header">
        <ArrowLeftOutlined
          className="back-button"
          onClick={() => navigate(`/course/${courseId}`)}
        />
        <span className="sesson-title">{sessonName}</span>
        <div className="header-actions">
          <MenuOutlined
            className="menu-button mobile-only"
            onClick={() => setIsMenuOpen(true)}
          />
          <div className="avatar-placeholder">
            <TrophyOutlined className="trophy-icon" />
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="menu-overlay" onClick={() => setIsMenuOpen(false)} />
      )}

      <div className="sesson-detail-content">
        {/* Left Sidebar */}
        <div className={`lesson-sidebar ${isMenuOpen ? 'menu-open' : ''}`}>
          <div className="lesson-sidebar-header-mobile">
            <div>
              <h3>Danh sách bài</h3>
              <p className="mobile-header-stats">
                {0} videos • {0} phút • {0} bài Test
              </p>
            </div>
            <CloseOutlined
              className="close-menu-button"
              onClick={() => setIsMenuOpen(false)}
            />
          </div>
          <div className="lesson-list-header">
            <h3>Danh sách bài</h3>
            <p>
              {0} videos • {0} phút • {0} bài Test
            </p>
          </div>

          <div className="lesson-list">
            {lessons.map((lesson: LessonStudentEntity) => (
              <div
                key={lesson.id}
                className={`lesson-item ${lessonId === lesson.id ? 'active' : ''} ${lesson.progress === 100 ? 'completed' : ''}`}
                onClick={() => handleLessonClick(lesson.id)}
              >
                <div className="lesson-item-content">
                  <span className="lesson-item-title">{lesson.title}</span>
                </div>
                {lesson.progress === 100 && (
                  <CheckCircleOutlined className="lesson-check-icon" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="lesson-content">
          {lessonId ? (
            <>
              <Outlet />
            </>
          ) : (
            <div className="no-lesson-selected">Vui lòng chọn một bài học</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessonDetail;
