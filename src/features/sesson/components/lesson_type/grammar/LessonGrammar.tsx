import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Spin, Card } from 'antd';
import { getAllGrammarByIdLessionService } from '#/api/services/grammar.service';
import './LessonGrammar.scss';
import { GrammarEntity } from '#/api/requests';

interface GrammarResponse {
  statusCode: number;
  data: {
    items: GrammarEntity[];
    meta: {
      limit: number;
      offset: number;
      total: number;
      totalPages: number;
    };
  };
}

const LessonGrammar = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [grammars, setGrammars] = useState<GrammarEntity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (lessonId) {
      fetchGrammars();
    }
  }, [lessonId]);

  const fetchGrammars = async () => {
    if (!lessonId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getAllGrammarByIdLessionService(lessonId, 1, 0);
      const apiData = response.data as GrammarResponse;

      if (apiData.statusCode === 200 && apiData.data?.items) {
        setGrammars(apiData.data.items);
      }
    } catch (error) {
      console.error('Error fetching grammars:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="lesson-grammar">
        <div className="lesson-grammar-loading">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (grammars.length === 0) {
    return (
      <div className="lesson-grammar">
        <div className="lesson-grammar-empty">
          <p>Chưa có nội dung ngữ pháp</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lesson-grammar">
      <div className="lesson-grammar-container">
        {grammars.map((grammar, index) => (
          <Card
            key={grammar.id}
            className="lesson-grammar-card"
            title={
              <div className="lesson-grammar-card-title">
                Ngữ pháp {grammar.pos || index + 1}
              </div>
            }
          >
            <div
              className="lesson-grammar-content"
              dangerouslySetInnerHTML={{ __html: grammar.content }}
            />
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LessonGrammar;
