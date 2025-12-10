import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Spin, message } from 'antd';
import { getTextByIdLessionService } from '#/api/services/text.service';
import './LessonText.scss';
import { DocumentEntityType, TextEntity } from '#/api/requests';

interface LessonTextProps {
  setDescription: (description: string) => void;
  setDocuments: (documents: DocumentEntityType[]) => void;
}
const LessonText = ({ setDescription, setDocuments }: LessonTextProps) => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [textData, setTextData] = useState<TextEntity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (lessonId) {
      fetchTextData();
    }
  }, [lessonId]);

  const fetchTextData = async () => {
    if (!lessonId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getTextByIdLessionService(lessonId, 1, 0);
      const apiData = response.data;

      if (apiData.statusCode === 200 && apiData.data) {
        setTextData(apiData.data.items[0]);
        setDescription(apiData.data.items[0].description);
        setDocuments(apiData.data.items[0].documents);
      }
    } catch (error) {
      console.error('Error fetching text data:', error);
      // message.error('Lỗi khi tải nội dung bài học');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="lesson-text">
        <div className="lesson-text-loading">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (!textData) {
    return (
      <div className="lesson-text">
        <div className="lesson-text-empty">
          <p>Chưa có nội dung bài học</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lesson-text">
      <div
        className="lesson-text-content"
        dangerouslySetInnerHTML={{ __html: textData.content || '' }}
      />
    </div>
  );
};

export default LessonText;
