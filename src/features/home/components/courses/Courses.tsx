import './Courses.scss';
import { ArrowRight, DotIcon } from '../../../../assets/svg/externalIcon';
import { Carousel } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '#/src/redux/store/store';
import { getAllCourse } from '#/src/redux/thunk/course.thunk';
import { useEffect } from 'react';
import { EnrolledCourseEntity } from '#/api/requests';
import img_replace from '#/assets/images/course/img_replace.png';
import { Link } from 'react-router-dom';

const Courses = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { data: courses } = useSelector((state: RootState) => state.course);

  const fetchCourses = async () => {
    await dispatch(getAllCourse());
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <section className="courses">
      <div className="courses-container">
        <div className="courses-header">
          <div className="courses-title-wrapper">
            <h2 className="courses-title">Khóa học của bạn</h2>
            <div className="courses-count">{courses?.length || 0}</div>
          </div>
          <Link to="/study-page" className="courses-view-all">
            Xem tất cả
          </Link>
        </div>

        <div className="courses-slider">
          <Carousel
            dots={true}
            infinite={false}
            slidesToShow={2}
            slidesToScroll={2}
            speed={500}
            adaptiveHeight={true}
            className="courses-carousel"
            draggable={true}
            swipe={true}
            responsive={[
              {
                breakpoint: 1024,
                settings: {
                  slidesToShow: 1,
                  slidesToScroll: 1,
                },
              },
            ]}
          >
            {courses.map((course: EnrolledCourseEntity) => (
              <div key={course.id} className="courses-card-wrapper">
                <div className="courses-card">
                  <div className="courses-card-content">
                    <div className="courses-card-left">
                      <span className="courses-card-label">Khóa học</span>
                      <h3 className="courses-card-title">{course.title}</h3>
                      <div className="courses-progress">
                        <div className="courses-progress-bar">
                          <div
                            className="courses-progress-fill"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                        <div className="courses-progress-info">
                          <span className="courses-progress-percent">
                            {Math.round(course.progress)}%
                          </span>
                          <DotIcon />
                          <span className="courses-progress-remaining">
                            Còn {course.pendingSesson} bài chưa học
                          </span>
                        </div>
                      </div>
                      <div className="courses-card-actions">
                        <button
                          className="courses-btn-continue"
                          onClick={() => {
                            sessionStorage.setItem('courseName', course.title);
                            navigate(`/course/${course.id}`);
                          }}
                        >
                          Tiếp tục học{' '}
                          <ArrowRight color="#F37142" width={20} height={20} />
                        </button>
                        <a href="#" className="courses-link-next">
                          Bài tiếp theo
                        </a>
                      </div>
                    </div>
                    <div className="courses-card-right">
                      <div className="courses-course-thumbnail">
                        <img
                          src={img_replace}
                          alt={course.title}
                          className="courses-thumbnail-image"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default Courses;
