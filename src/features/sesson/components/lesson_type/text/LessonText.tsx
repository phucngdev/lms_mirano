import './LessonText.scss';

const LessonText = () => {
  return (
    <>
      <div className="lesson-text">
        <div
          className="lesson-text-content"
          dangerouslySetInnerHTML={{ __html: '' }}
        ></div>
      </div>
    </>
  );
};

export default LessonText;
