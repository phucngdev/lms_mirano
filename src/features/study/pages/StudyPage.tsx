import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Breadcrumb, Spin } from 'antd';
import { getAllCourseService } from '#/api/services/course.service';
import './StudyPage.scss';

interface CourseCard {
  id: string;
  type: 'chill' | 'kanji';
  title: string;
  lessonCount: number;
  level?: string;
  subtitle?: string;
  bannerImage?: string;
}

interface ApiCourse {
  id: string;
  title: string;
  thumbnailUrl: string;
  price: number;
  status: string;
  type: string;
  progress: number;
  description: string;
  sessonCount: number;
  classId: string;
  pendingSesson: number;
}

interface ApiResponse {
  statusCode: number;
  data: ApiCourse[];
}

const StudyPage = () => {
  const navigate = useNavigate();
  const [courseCards, setCourseCards] = useState<CourseCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await getAllCourseService();
        const apiData: ApiResponse = response.data;

        if (apiData.statusCode === 200 && apiData.data) {
          const mappedCourses: CourseCard[] = apiData.data.map(course => {
            // Determine type based on course title or type
            const isKanji = course.title.toLowerCase().includes('kanji');
            const type: 'chill' | 'kanji' = isKanji ? 'kanji' : 'chill';

            // Extract level from title if it's a chill class (e.g., "N1", "N2")
            const levelMatch = course.title.match(/N[1-5]/);
            const level = levelMatch ? levelMatch[0] : undefined;

            return {
              id: course.id,
              type,
              title: course.title,
              lessonCount: course.sessonCount,
              level,
              subtitle: type === 'chill' ? 'CHILL CLASS' : undefined,
              bannerImage: course.thumbnailUrl,
            };
          });

          setCourseCards(mappedCourses);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const breadcrumbItems = [
    {
      title: <Link to="/">Trang chủ</Link>,
    },
    {
      title: <Link to="/">Khóa học online</Link>,
    },
    {
      title: 'Các khóa học',
    },
  ];

  return (
    <div className="study-page">
      <div className="study-page-container">
        {/* Breadcrumb */}
        <div className="study-page-breadcrumb">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* Title */}
        <h1 className="study-page-title">Các khóa học</h1>

        {/* Course Cards Grid */}
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
          <div className="study-page-grid">
            {courseCards.map(card => (
              <div
                key={card.id}
                className={`study-course-card study-course-card-${card.type}`}
                onClick={() => navigate(`/course/${card.id}`)}
              >
                {/* Banner */}
                <div
                  className={`study-card-banner study-card-banner-${card.type}`}
                >
                  {card.bannerImage ? (
                    <img
                      src={card.bannerImage}
                      alt={card.title}
                      className="study-card-banner-image"
                    />
                  ) : (
                    <div className="study-card-banner-placeholder">
                      {card.type === 'chill'
                        ? `${card.level} ${card.subtitle}`
                        : 'KANJI NINJA 1500'}
                    </div>
                  )}
                </div>

                <div className="study-card-content">
                  <h3 className="study-card-title">{card.title}</h3>
                  <div className="study-card-lesson">
                    {card.lessonCount} bài học
                  </div>
                  <button
                    className="study-card-play-button"
                    onClick={e => {
                      e.stopPropagation();
                      navigate(`/course/${card.id}`);
                    }}
                  >
                    <svg
                      fill="none"
                      height="21"
                      viewBox="0 0 20 21"
                      width="20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M14.2747 6.89592C17.4663 8.73759 17.4663 11.7543 14.2747 13.5959L11.6997 15.0793L9.12467 16.5626C5.94134 18.4043 3.33301 16.8959 3.33301 13.2126V10.2459V7.27926C3.33301 3.59592 5.94134 2.08759 9.13301 3.92926L11.008 5.01259"
                        stroke="#fff"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-miterlimit="10"
                        stroke-width="1.5"
                      ></path>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyPage;
