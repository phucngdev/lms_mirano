import { NotFound } from '#/shared/components/notfound/NotFound';
import Login from '#/features/authentication/pages/Login';
import Register from '#/features/authentication/pages/Register';
import PublicLayout from './PublicRouter';
import Home from '#/features/home/pages/Home';
import CourseDetail from '#/features/course/pages/CourseDetail';
import SessonDetail from '#/features/sesson/pages/SessonDetail';
import TestPage from '#/features/test/pages/TestPage';
import TestDetail from '#/features/test/pages/TestDetail';
import TestMode from '#/features/test/pages/TestMode';
import StudyPage from '#/features/study/pages/StudyPage';
import MyClass from '#/features/class/pages/MyClass';
import LessonDetail from '#/features/sesson/pages/LessonDetail';
import TopicsPage from '#/features/topics/pages/TopicsPage';
import TopicVocabPage from '#/features/topics/pages/TopicVocabPage';
import ProfilePage from '#/features/profile/pages/ProfilePage';
import ExamHistoryPage from '#/features/history/pages/ExamHistoryPage';

const routesConfig = [
  {
    path: '/auth',
    children: [
      {
        element: <Login />,
        path: 'login',
      },
      {
        element: <Register />,
        path: 'register',
      },
    ],
  },
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        element: <Home />,
        path: '/',
      },
      {
        element: <StudyPage />,
        path: '/study-page',
      },
      {
        element: <CourseDetail />,
        path: '/course/:id',
      },
      {
        element: <TestPage />,
        path: '/test-page',
      },
      {
        element: <TestDetail />,
        path: '/test-detail/:id',
      },
      {
        element: <TestMode />,
        path: '/test-mode/:id',
      },
      {
        element: <MyClass />,
        path: '/my-class',
      },
      {
        element: <TopicsPage />,
        path: '/topics',
      },
      {
        element: <TopicVocabPage />,
        path: '/topics/:id',
      },
      {
        element: <ProfilePage />,
        path: '/profile',
      },
      {
        element: <ExamHistoryPage />,
        path: '/exam-history',
      },
    ],
  },
  {
    element: <SessonDetail />,
    path: '/sesson/:id',
    children: [
      {
        element: <LessonDetail />,
        path: 'lesson/:lessonId',
      },
    ],
  },
  {
    element: <NotFound />,
    path: '*',
  },
];
export default routesConfig;
