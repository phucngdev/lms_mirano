import { LessonStudentEntity } from '#/api/requests/models/LessonStudentEntity';
import { FileTextOutlined } from '@ant-design/icons';
import LessonVideo from './video/LessonVideo';
import LessonGrammar from './grammar/LessonGrammar';
import LessonKanji from './kanji/LessonKanji';
import LessonVocab from './vocab/LessonVocab';
import LessonText from './text/LessonText';
import LessonFlashCard from './flashcard/LessonFlashCard';
import LessonQuiz from './quiz/LessonQuiz';
import LessonSlide from './slide/LessonSlide';

interface RenderLessonProps {
  lesson: LessonStudentEntity | null;
}

const RenderLesson = ({ lesson }: RenderLessonProps) => {
  switch (lesson?.type) {
    case 'VIDEO':
      return <LessonVideo />;
    case 'GRAMMAR':
      return <LessonGrammar />;
    case 'KANJI':
      return <LessonKanji />;
    case 'VOCAB':
      return <LessonVocab />;
    case 'TEXT':
      return <LessonText />;
    case 'FLASH_CARD':
      return <LessonFlashCard />;
    case 'FILE':
      return <FileLesson />;
    case 'SLIDE':
      return <LessonSlide />;
    case 'QUIZ':
      return <LessonQuiz lesson={lesson} />;
    default:
      return <DefaultLesson lesson={lesson} />;
  }
};

const FileLesson = () => (
  <div className="file-lesson">
    <div className="file-viewer-placeholder">
      <FileTextOutlined style={{ fontSize: 48, color: '#f37142' }} />
      <p>File Viewer sẽ được render ở đây</p>
    </div>
  </div>
);

const DefaultLesson = ({ lesson }: { lesson: LessonStudentEntity | null }) => (
  <div className="default-lesson">
    <p>Loại bài học: {lesson?.type}</p>
  </div>
);

export default RenderLesson;
