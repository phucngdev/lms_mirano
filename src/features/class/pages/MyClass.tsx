import { useState, useEffect } from 'react';
import { Spin, Pagination } from 'antd';
import {
  CalendarOutlined,
  RightOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import {
  getAllClassService,
  getClassByIdService,
} from '#/api/services/class.service';
import { getSessonSchedulesService } from '#/api/services/sessonschedules.service';
import './MyClass.scss';
import { useNavigate } from 'react-router-dom';

interface ClassItem {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

interface CourseItem {
  id: string;
  title: string;
  price: number;
  status: string;
  description: string;
  thumbnailUrl: string;
  type: string;
  progress?: number;
  remainingLessons?: number;
}

interface LessonItem {
  id: string;
  title: string;
}

interface SessionItem {
  id: string;
  title: string;
  lessons: LessonItem[];
  isLated: boolean;
  isCompleted: boolean;
}

interface ScheduleItem {
  dueDate: string;
  sessons: SessionItem[];
}

interface ScheduleData {
  items: ScheduleItem[];
  meta?: {
    limit: number;
    offset: number;
    total: number;
    totalPages: number;
  };
}

interface ApiScheduleResponse {
  statusCode: number;
  data: {
    items: ScheduleItem[];
    meta: {
      limit: number;
      offset: number;
      total: number;
      totalPages: number;
    };
  };
}

interface ApiClassResponse {
  statusCode: number;
  data: ClassItem[];
}

interface ApiClassDetailResponse {
  statusCode: number;
  data: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    courses: CourseItem[];
    teachers: Array<{
      id: string;
      email: string;
      fullName: string;
      phoneNumber: string;
      isActive: boolean;
      userCode: number;
      q: string;
      userType: string;
      userProfiles: string[];
    }>;
  };
}

const MyClass = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [schedulePage, setSchedulePage] = useState(1);
  const [scheduleMeta, setScheduleMeta] = useState<
    Record<string, { total: number; totalPages: number }>
  >({});
  const [coursesByClass, setCoursesByClass] = useState<
    Record<string, CourseItem[]>
  >({});
  const [scheduleByCourse, setScheduleByCourse] = useState<
    Record<string, ScheduleData>
  >({});
  const pageSize = 10;

  // Fetch classes on component mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoadingClasses(true);
        const response = await getAllClassService();
        const apiData: ApiClassResponse = response.data;

        if (apiData.statusCode === 200 && apiData.data) {
          setClasses(apiData.data);
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClasses();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const handleClassClick = async (classId: string) => {
    if (selectedClassId === classId) {
      return;
    }

    setSelectedClassId(classId);
    setSelectedCourseId(null); // Reset selected course when changing class

    // If courses already loaded, don't reload
    if (coursesByClass[classId]) {
      return;
    }

    setLoadingCourses(true);

    try {
      const response = await getClassByIdService(classId);
      const apiData: ApiClassDetailResponse = response.data;

      if (apiData.statusCode === 200 && apiData.data) {
        const courses = apiData.data.courses || [];
        setCoursesByClass(prev => ({ ...prev, [classId]: courses }));
      }
    } catch (error) {
      console.error('Error fetching class details:', error);
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchSchedule = async (
    courseId: string,
    page: number,
    append: boolean = false,
  ) => {
    if (!selectedClassId) {
      return;
    }

    setLoadingSchedule(true);

    try {
      const offset = (page - 1) * pageSize;
      const response = await getSessonSchedulesService(
        selectedClassId,
        courseId,
        pageSize,
        offset,
      );
      const apiData: ApiScheduleResponse = response.data;

      if (apiData.statusCode === 200 && apiData.data) {
        if (append && scheduleByCourse[courseId]) {
          // Append new items to existing schedule
          setScheduleByCourse(prev => ({
            ...prev,
            [courseId]: {
              items: [
                ...(prev[courseId]?.items || []),
                ...(apiData.data.items || []),
              ],
              meta: apiData.data.meta,
            },
          }));
        } else {
          // Replace schedule with new data
          setScheduleByCourse(prev => ({
            ...prev,
            [courseId]: {
              items: apiData.data.items || [],
              meta: apiData.data.meta,
            },
          }));
        }

        // Update meta for pagination
        setScheduleMeta(prev => ({
          ...prev,
          [courseId]: {
            total: apiData.data.meta.total,
            totalPages: apiData.data.meta.totalPages,
          },
        }));
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setLoadingSchedule(false);
    }
  };

  const handleCourseClick = async (courseId: string) => {
    if (selectedCourseId === courseId) {
      return;
    }

    if (!selectedClassId) {
      return;
    }

    setSelectedCourseId(courseId);
    setSchedulePage(1); // Reset to first page

    // Load first page
    await fetchSchedule(courseId, 1, false);
  };

  const handleSchedulePageChange = async (page: number) => {
    if (!selectedCourseId) {
      return;
    }

    setSchedulePage(page);
    await fetchSchedule(selectedCourseId, page, false);
  };

  const selectedClass = classes.find(c => c.id === selectedClassId);
  const classCourses = selectedClassId
    ? coursesByClass[selectedClassId] || []
    : [];
  const selectedCourse = classCourses.find(c => c.id === selectedCourseId);
  const courseSchedule = selectedCourseId
    ? scheduleByCourse[selectedCourseId]
    : null;

  return (
    <div className="my-class">
      <div className="my-class-container">
        <div className="my-class-header">
          <div className="my-class-title-wrapper">
            <h1 className="my-class-title">Lớp học của tôi</h1>
            <div className="my-class-count">{classes.length}</div>
          </div>
        </div>

        {/* Top Section: Classes and Courses */}
        <div className="my-class-top-section">
          {/* Left: Classes List */}
          <div className="classes-panel">
            <h2 className="panel-title">Danh sách lớp học</h2>
            <Spin spinning={loadingClasses}>
              {classes.length > 0 ? (
                <div className="classes-list">
                  {classes.map(classItem => {
                    const isSelected = selectedClassId === classItem.id;
                    return (
                      <div
                        key={classItem.id}
                        className={`class-item ${isSelected ? 'active' : ''}`}
                        onClick={() => handleClassClick(classItem.id)}
                      >
                        <div className="class-item-content">
                          <h3 className="class-item-name">{classItem.name}</h3>
                          <div className="class-item-dates">
                            <div className="class-date-item">
                              <CalendarOutlined className="class-date-icon" />
                              <span>{formatDate(classItem.startDate)}</span>
                              <span className="date-separator">-</span>
                              <span>{formatDate(classItem.endDate)}</span>
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <RightOutlined className="class-check-icon" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                !loadingClasses && (
                  <div className="empty-state">
                    <p>Chưa có lớp học nào</p>
                  </div>
                )
              )}
            </Spin>
          </div>

          {/* Right: Courses List */}
          <div className="courses-panel">
            <h2 className="panel-title">
              {selectedClass
                ? `Khóa học - ${selectedClass.name}`
                : 'Chọn lớp học'}
            </h2>
            <Spin spinning={loadingCourses}>
              {selectedClassId ? (
                classCourses.length > 0 ? (
                  <div className="courses-list">
                    {classCourses.map(course => {
                      const isSelected = selectedCourseId === course.id;
                      return (
                        <div
                          key={course.id}
                          className={`course-item ${isSelected ? 'active' : ''}`}
                          onClick={() => handleCourseClick(course.id)}
                        >
                          <div className="course-item-content">
                            <h4 className="course-item-title">
                              {course.title}
                            </h4>
                            {course.description && (
                              <p className="course-item-description">
                                {course.description}
                              </p>
                            )}
                            {course.progress !== undefined && (
                              <div className="course-item-progress">
                                <div className="course-progress-bar">
                                  <div
                                    className="course-progress-fill"
                                    style={{ width: `${course.progress}%` }}
                                  />
                                </div>
                                <div className="course-progress-info">
                                  <span className="course-progress-percent">
                                    {course.progress}%
                                  </span>
                                  {course.remainingLessons !== undefined && (
                                    <span className="course-progress-remaining">
                                      Còn {course.remainingLessons} bài
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          {isSelected && (
                            <RightOutlined className="course-check-icon" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>Chưa có khóa học nào trong lớp này</p>
                  </div>
                )
              ) : (
                <div className="empty-state">
                  <p>Vui lòng chọn một lớp học để xem khóa học</p>
                </div>
              )}
            </Spin>
          </div>
        </div>

        {/* Bottom Section: Schedule */}
        <div className="schedule-section">
          <div className="schedule-header">
            <h2 className="schedule-title">
              {selectedCourse
                ? `Lịch học - ${selectedCourse.title}`
                : 'Chọn khóa học để xem lịch học'}
            </h2>
          </div>
          <Spin spinning={loadingSchedule}>
            {selectedCourseId && courseSchedule ? (
              courseSchedule.items.length > 0 ? (
                <div className="schedule-list">
                  {courseSchedule.items.map((scheduleItem, idx) => (
                    <div key={idx} className="schedule-item">
                      <div className="schedule-date-header">
                        <CalendarOutlined className="schedule-date-icon" />
                        <span className="schedule-date">
                          {formatDate(scheduleItem.dueDate)}
                        </span>
                      </div>
                      <div className="sessions-list">
                        {scheduleItem.sessons.map(session => (
                          <div
                            key={session.id}
                            className={`session-item ${session.isCompleted ? 'completed' : ''} ${session.isLated ? 'lated' : ''}`}
                          >
                            <div className="session-header">
                              <div className="session-title-wrapper">
                                {session.isCompleted ? (
                                  <CheckCircleOutlined className="session-status-icon completed" />
                                ) : (
                                  <ClockCircleOutlined className="session-status-icon pending" />
                                )}
                                <h5 className="session-title">
                                  {session.title}
                                </h5>
                              </div>
                              <div className="session-badges">
                                {session.isLated && (
                                  <span className="session-late-badge">
                                    Trễ
                                  </span>
                                )}
                                {session.isCompleted && (
                                  <span className="session-completed-badge">
                                    Hoàn thành
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="lessons-list">
                              {session.lessons.map(lesson => (
                                <div
                                  onClick={() => {
                                    sessionStorage.setItem(
                                      'classId',
                                      selectedClassId || '',
                                    );
                                    sessionStorage.setItem(
                                      'courseId',
                                      selectedCourseId || '',
                                    );
                                    navigate(
                                      `/sesson/${session.id}/lesson/${lesson.id}`,
                                    );
                                  }}
                                  key={lesson.id}
                                  className="lesson-item"
                                >
                                  <span className="lesson-title">
                                    {lesson.title}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>Chưa có lịch học nào cho khóa học này</p>
                </div>
              )
            ) : (
              <div className="empty-state">
                <p>Vui lòng chọn một khóa học để xem lịch học</p>
              </div>
            )}
          </Spin>

          {/* Pagination for Schedule */}
          {selectedCourseId &&
            courseSchedule &&
            scheduleMeta[selectedCourseId] &&
            scheduleMeta[selectedCourseId].totalPages > 1 && (
              <div className="schedule-pagination">
                <Pagination
                  current={schedulePage}
                  total={scheduleMeta[selectedCourseId].total}
                  pageSize={pageSize}
                  onChange={handleSchedulePageChange}
                  showSizeChanger={false}
                  showQuickJumper
                />
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default MyClass;
