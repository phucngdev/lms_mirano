import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Breadcrumb,
  Spin,
  Card,
  Tag,
  Divider,
  Progress,
  Collapse,
  Typography,
  Radio,
  Space,
  Tabs,
} from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import {
  TestResultUserDetailEntity,
  MultipleChoiceAnswerDto,
} from '#/api/requests';
import './ExamResultDetailPage.scss';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const ExamResultDetailPage = () => {
  const location = useLocation();
  const [testResult, setTestResult] =
    useState<TestResultUserDetailEntity | null>(null);
  console.log('🚀 ~ ExamResultDetailPage ~ testResult:', testResult);
  const [loading, setLoading] = useState(true);
  const [activePartKey, setActivePartKey] = useState<string>('');
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>('');

  useEffect(() => {
    // Lấy data từ location.state (được pass từ ExamHistoryPage)
    const stateData = location.state as {
      testResult?: TestResultUserDetailEntity;
    };
    if (stateData?.testResult) {
      setTestResult(stateData.testResult);
      // Set active tab là phần thi đầu tiên
      if (stateData.testResult.details.length > 0) {
        const firstDetail = stateData.testResult.details[0];
        setActivePartKey(firstDetail.id);
        // Set first question as selected
        if (
          firstDetail.questionGroups &&
          firstDetail.questionGroups.length > 0
        ) {
          const firstGroup = firstDetail.questionGroups[0];
          if (firstGroup.questions && firstGroup.questions.length > 0) {
            setSelectedQuestionId(firstGroup.questions[0].id);
          }
        }
      }
      // Debug: Log dữ liệu để kiểm tra
      console.log('Test Result Data:', stateData.testResult);
      console.log('Details:', stateData.testResult.details);
      if (stateData.testResult.details.length > 0) {
        console.log('First Detail:', stateData.testResult.details[0]);
        console.log(
          'First Detail Question Groups:',
          stateData.testResult.details[0].questionGroups,
        );
      }
      setLoading(false);
    } else {
      // Nếu không có data trong state, quay lại trang danh sách
      setLoading(false);
    }
  }, [location.state]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} phút`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} giờ ${mins} phút` : `${hours} giờ`;
  };

  const calculateAccuracy = (correct: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((correct / total) * 100);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#52c41a';
    if (score >= 60) return '#faad14';
    return '#ff4d4f';
  };

  const breadcrumbItems = [
    {
      title: <Link to="/">Trang chủ</Link>,
    },
    {
      title: <Link to="/exam-history">Lịch sử thi thử</Link>,
    },
    {
      title: 'Chi tiết kết quả',
    },
  ];

  if (loading) {
    return (
      <div className="exam-result-detail-page">
        <div className="exam-result-detail-page-container">
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '80px 20px',
            }}
          >
            <Spin size="large" />
          </div>
        </div>
      </div>
    );
  }

  if (!testResult) {
    return (
      <div className="exam-result-detail-page">
        <div className="exam-result-detail-page-container">
          <div className="exam-result-detail-empty">
            <p>Không tìm thấy kết quả thi</p>
            <Link to="/exam-history">Quay lại lịch sử thi thử</Link>
          </div>
        </div>
      </div>
    );
  }

  // Tính toán trực tiếp từ questions thực tế
  let totalQuestions = 0;
  let totalCorrect = 0;
  let totalIncorrect = 0;
  let totalUnanswered = 0;
  let totalPossibleScore = 0; // Tổng điểm có thể đạt được
  let achievedScore = testResult.score || 0; // Điểm đạt được

  if (testResult.details) {
    testResult.details.forEach(detail => {
      let detailQuestionCount = 0;

      if (detail.questionGroups) {
        detail.questionGroups.forEach(group => {
          if (group.questions) {
            group.questions.forEach(question => {
              totalQuestions++;
              detailQuestionCount++;

              const allOptions =
                question.correctAnswers as MultipleChoiceAnswerDto[];
              const correctAnswer = allOptions.find(option => option.isCorrect);
              const userAnswer = question.userAnswers?.[0] as
                | MultipleChoiceAnswerDto
                | undefined;

              if (userAnswer) {
                const isCorrect =
                  correctAnswer &&
                  userAnswer &&
                  correctAnswer.content === userAnswer.content;
                if (isCorrect) {
                  totalCorrect++;
                } else {
                  totalIncorrect++;
                }
              } else {
                totalUnanswered++;
              }
            });
          }
        });
      }

      // Tính tổng điểm có thể đạt được: detail.point * số câu hỏi trong detail
      if (detail.point && detailQuestionCount > 0) {
        totalPossibleScore += detail.point * detailQuestionCount;
      }
    });
  }

  // Nếu không có point trong details, tính tổng điểm = số câu hỏi (mỗi câu 1 điểm)
  if (totalPossibleScore === 0) {
    totalPossibleScore = totalQuestions;
  }

  return (
    <div className="exam-result-detail-page">
      <div className="exam-result-detail-page-container">
        {/* Breadcrumb */}
        <div className="exam-result-detail-page-breadcrumb">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* Back Button */}
        <div className="exam-result-detail-back">
          <Link to="/exam-history" className="exam-result-detail-back-link">
            <ArrowLeftOutlined /> Quay lại
          </Link>
        </div>

        {/* Header Card */}
        <Card className="exam-result-detail-header-card">
          <div className="exam-result-detail-header">
            <div className="exam-result-detail-header-info">
              <Title level={2} className="exam-result-detail-test-name">
                {testResult.testId?.name || 'Không có tên'}
              </Title>
              {testResult.testId?.description && (
                <Paragraph className="exam-result-detail-description">
                  {testResult.testId.description}
                </Paragraph>
              )}
              <div className="exam-result-detail-meta">
                <div className="exam-result-detail-meta-item">
                  <CalendarOutlined className="exam-result-detail-meta-icon" />
                  <Text>{formatDate(testResult.createdAt)}</Text>
                </div>
                {testResult.testId?.duration && (
                  <div className="exam-result-detail-meta-item">
                    <ClockCircleOutlined className="exam-result-detail-meta-icon" />
                    <Text>
                      Thời gian: {formatDuration(testResult.testId.duration)}
                    </Text>
                  </div>
                )}
              </div>
            </div>
            <div className="exam-result-detail-score-section">
              <div className="exam-result-detail-score-circle">
                <Progress
                  type="circle"
                  percent={
                    totalPossibleScore > 0
                      ? Math.round((achievedScore / totalPossibleScore) * 100)
                      : 0
                  }
                  strokeColor={getScoreColor(
                    totalPossibleScore > 0
                      ? Math.round((achievedScore / totalPossibleScore) * 100)
                      : 0,
                  )}
                  format={() => (
                    <div className="exam-result-detail-score-content">
                      <span className="exam-result-detail-score-value">
                        {achievedScore}/{totalPossibleScore}
                      </span>
                      <span className="exam-result-detail-score-label">
                        {' '}
                        điểm
                      </span>
                    </div>
                  )}
                  size={120}
                />
              </div>
              <div className="exam-result-detail-accuracy">
                <Text className="exam-result-detail-accuracy-label">
                  Độ chính xác
                </Text>
                <Text className="exam-result-detail-accuracy-value">
                  {Math.round((totalCorrect / totalQuestions) * 100)}% -{' '}
                  {totalCorrect}/{totalQuestions}
                </Text>
              </div>
            </div>
          </div>
        </Card>

        {/* Summary Stats */}
        <Card className="exam-result-detail-stats-card">
          <div className="exam-result-detail-stats">
            <div className="exam-result-detail-stat-item">
              <div className="exam-result-detail-stat-value">
                {totalQuestions}
              </div>
              <div className="exam-result-detail-stat-label">
                Tổng số câu hỏi
              </div>
            </div>
            <div className="exam-result-detail-stat-item">
              <div className="exam-result-detail-stat-value correct">
                {totalCorrect}
              </div>
              <div className="exam-result-detail-stat-label">Câu đúng</div>
            </div>
            <div className="exam-result-detail-stat-item">
              <div className="exam-result-detail-stat-value incorrect">
                {totalIncorrect}
              </div>
              <div className="exam-result-detail-stat-label">Câu sai</div>
            </div>
            <div className="exam-result-detail-stat-item">
              <div className="exam-result-detail-stat-value unanswered">
                {totalUnanswered}
              </div>
              <div className="exam-result-detail-stat-label">
                Số câu chưa làm
              </div>
            </div>
          </div>
        </Card>

        {/* Parts Navigation Tabs */}
        <div className="exam-result-detail-parts-nav">
          <div className="exam-result-detail-parts-nav-wrapper">
            {testResult.details.map((detail, index) => {
              return (
                <button
                  key={detail.id}
                  className={`exam-result-detail-part-nav-tab ${
                    activePartKey === detail.id ? 'active' : ''
                  }`}
                  onClick={() => {
                    setActivePartKey(detail.id);
                    // Set first question as selected when switching parts
                    if (detail.questionGroups.length > 0) {
                      const firstGroup = detail.questionGroups[0];
                      if (firstGroup.questions.length > 0) {
                        setSelectedQuestionId(firstGroup.questions[0].id);
                      }
                    }
                  }}
                >
                  {detail.name || `Phần ${index + 1}`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content - 2 Columns Layout */}
        <div className="exam-result-detail-content">
          {/* Left Panel - Questions */}
          <div className="exam-result-detail-questions-panel">
            {testResult.details
              .find(d => d.id === activePartKey)
              ?.questionGroups.map((questionGroup, groupIndex) => {
                const currentPart = testResult.details.find(
                  d => d.id === activePartKey,
                );
                if (!currentPart) return null;

                // Calculate starting index for this group
                let questionStartIndex = 0;
                for (let i = 0; i < groupIndex; i++) {
                  questionStartIndex +=
                    currentPart.questionGroups[i].questions.length;
                }

                return (
                  <div
                    key={questionGroup.id}
                    className="exam-result-detail-question-group"
                  >
                    {/* Group Header - Only show if there are multiple groups */}
                    {currentPart.questionGroups.length > 1 && (
                      <div className="exam-result-detail-question-group-header">
                        <h3 className="exam-result-detail-question-group-title">
                          {questionGroup.content
                            ? `Nhóm ${groupIndex + 1}: ${questionGroup.content}`
                            : `Nhóm ${groupIndex + 1}`}
                        </h3>
                      </div>
                    )}

                    {questionGroup.questions.map((question, qIndex) => {
                      const questionNumber = questionStartIndex + qIndex + 1;

                      const allOptions =
                        question.correctAnswers as MultipleChoiceAnswerDto[];
                      const correctAnswer = allOptions.find(
                        option => option.isCorrect,
                      );
                      const userAnswer = question.userAnswers[0] as
                        | MultipleChoiceAnswerDto
                        | undefined;

                      const isCorrect =
                        correctAnswer &&
                        userAnswer &&
                        correctAnswer.content === userAnswer.content;

                      return (
                        <div
                          key={question.id}
                          data-question-id={question.id}
                          className={`exam-result-detail-question-item ${
                            selectedQuestionId === question.id ? 'active' : ''
                          }`}
                          onClick={() => setSelectedQuestionId(question.id)}
                        >
                          <div className="exam-result-detail-question-header">
                            <div className="exam-result-detail-question-number">
                              {questionNumber}.
                            </div>
                          </div>
                          <div className="exam-result-detail-question-content">
                            <div
                              className="exam-result-detail-question-text"
                              dangerouslySetInnerHTML={{
                                __html: question.content,
                              }}
                            />

                            {/* Options */}
                            {/* {allOptions.length > 0 && (
                              <div className="exam-result-detail-question-options">
                                <Radio.Group
                                  value={userAnswer?.content || undefined}
                                  disabled
                                >
                                  <Space direction="vertical" size="middle">
                                    {allOptions.map((option, optIndex) => {
                                      const isUserAnswer =
                                        userAnswer?.content === option.content;
                                      const isCorrectOption =
                                        correctAnswer?.content ===
                                        option.content;
                                      return (
                                        <Radio
                                          key={optIndex}
                                          value={option.content}
                                          className={`exam-result-detail-option ${
                                            isCorrectOption
                                              ? 'correct-answer'
                                              : ''
                                          } ${
                                            isUserAnswer && !isCorrectOption
                                              ? 'wrong-answer'
                                              : ''
                                          }`}
                                        >
                                          <span
                                            dangerouslySetInnerHTML={{
                                              __html: option.content,
                                            }}
                                          />
                                        </Radio>
                                      );
                                    })}
                                  </Space>
                                </Radio.Group>
                              </div>
                            )} */}

                            {/* Answer Summary */}
                            <div className="exam-result-detail-answer-summary">
                              {correctAnswer && (
                                <div className="exam-result-detail-answer-item correct-answer-item">
                                  <CheckCircleOutlined className="exam-result-detail-answer-icon" />
                                  <div className="exam-result-detail-answer-content">
                                    <span className="exam-result-detail-answer-label">
                                      Đáp án đúng:
                                    </span>
                                    <span
                                      className="exam-result-detail-answer-text"
                                      dangerouslySetInnerHTML={{
                                        __html: correctAnswer.content,
                                      }}
                                    />
                                  </div>
                                </div>
                              )}
                              {userAnswer && (
                                <div
                                  className={`exam-result-detail-answer-item ${
                                    isCorrect
                                      ? 'correct-answer-item'
                                      : 'wrong-answer-item'
                                  }`}
                                >
                                  {isCorrect ? (
                                    <CheckCircleOutlined className="exam-result-detail-answer-icon" />
                                  ) : (
                                    <CloseCircleOutlined className="exam-result-detail-answer-icon" />
                                  )}
                                  <div className="exam-result-detail-answer-content">
                                    <span className="exam-result-detail-answer-label">
                                      Đáp án của bạn:
                                    </span>
                                    <span
                                      className="exam-result-detail-answer-text"
                                      dangerouslySetInnerHTML={{
                                        __html: userAnswer.content,
                                      }}
                                    />
                                  </div>
                                </div>
                              )}
                              {!userAnswer && (
                                <div className="exam-result-detail-answer-item no-answer-item">
                                  <CloseCircleOutlined className="exam-result-detail-answer-icon" />
                                  <div className="exam-result-detail-answer-content">
                                    <span className="exam-result-detail-answer-label">
                                      Bạn chưa chọn đáp án
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>

                            {question.explain && (
                              <div className="exam-result-detail-question-explain">
                                <Text type="secondary">
                                  <strong>Giải thích: </strong>
                                  <span
                                    dangerouslySetInnerHTML={{
                                      __html: question.explain,
                                    }}
                                  />
                                </Text>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
          </div>

          {/* Right Sidebar */}
          <div className="exam-result-detail-sidebar">
            {/* Question List */}
            <div className="exam-result-detail-question-list">
              <div className="exam-result-detail-question-list-header">
                Danh sách câu hỏi
              </div>
              <div className="exam-result-detail-question-grid">
                {testResult.details
                  .find(d => d.id === activePartKey)
                  ?.questionGroups.map((questionGroup, groupIndex) => {
                    const currentPart = testResult.details.find(
                      d => d.id === activePartKey,
                    );
                    if (!currentPart) return null;

                    // Calculate starting index for this group
                    let questionStartIndex = 0;
                    for (let i = 0; i < groupIndex; i++) {
                      questionStartIndex +=
                        currentPart.questionGroups[i].questions.length;
                    }

                    return questionGroup.questions.map((question, qIndex) => {
                      const questionNum = questionStartIndex + qIndex + 1;

                      const allOptions =
                        question.correctAnswers as MultipleChoiceAnswerDto[];
                      const correctAnswer = allOptions.find(
                        option => option.isCorrect,
                      );
                      const userAnswer = question.userAnswers[0] as
                        | MultipleChoiceAnswerDto
                        | undefined;

                      // Check if answer is correct (only if user selected an answer)
                      const isCorrect =
                        userAnswer &&
                        correctAnswer &&
                        correctAnswer.content === userAnswer.content;

                      // If no answer selected, show as incorrect (red)
                      const showAsCorrect = isCorrect === true;
                      const showAsIncorrect = !userAnswer || !isCorrect;

                      return (
                        <button
                          key={question.id}
                          className={`exam-result-detail-question-number-btn ${
                            selectedQuestionId === question.id ? 'current' : ''
                          } ${
                            showAsCorrect
                              ? 'correct'
                              : showAsIncorrect
                                ? 'incorrect'
                                : ''
                          }`}
                          onClick={() => {
                            setSelectedQuestionId(question.id);
                            // Scroll to question
                            const questionElement = document.querySelector(
                              `[data-question-id="${question.id}"]`,
                            );
                            if (questionElement) {
                              questionElement.scrollIntoView({
                                behavior: 'smooth',
                                block: 'center',
                              });
                            }
                          }}
                        >
                          {questionNum}
                        </button>
                      );
                    });
                  }) || []}
              </div>
            </div>
          </div>
        </div>

        {/* Old Parts Tabs - Hidden */}
        <div className="exam-result-detail-parts" style={{ display: 'none' }}>
          <Title level={3} className="exam-result-detail-parts-title">
            Chi tiết các phần thi
          </Title>
          <Tabs
            activeKey={activePartKey}
            onChange={setActivePartKey}
            type="card"
            className="exam-result-detail-parts-tabs"
            items={testResult.details.map((detail, index) => {
              // Tính từ questionGroups thay vì từ detail
              const detailCorrect = detail.questionGroups
                ? detail.questionGroups.reduce(
                    (sum, group) =>
                      sum + (Number(group.correctCountQuestionGroup) || 0),
                    0,
                  )
                : Number(detail.correctCount) || 0;
              const detailTotal = detail.questionGroups
                ? detail.questionGroups.reduce(
                    (sum, group) =>
                      sum + (Number(group.numberOfQuestions) || 0),
                    0,
                  )
                : Number(detail.totalQuestions) || 0;
              const groupAccuracy = calculateAccuracy(
                detailCorrect,
                detailTotal,
              );
              return {
                key: detail.id,
                label: (
                  <div className="exam-result-detail-tab-label">
                    <Text strong>{detail.name || `Phần ${index + 1}`}</Text>
                    <Tag
                      color={
                        groupAccuracy >= 80
                          ? 'success'
                          : groupAccuracy >= 60
                            ? 'warning'
                            : 'error'
                      }
                      className="exam-result-detail-tab-accuracy"
                    >
                      {groupAccuracy}% ({detailCorrect}/{detailTotal})
                    </Tag>
                  </div>
                ),
                children: (
                  <div className="exam-result-detail-part-content">
                    {/* Part Info */}
                    <Card className="exam-result-detail-part-info-card">
                      <div className="exam-result-detail-part-info">
                        <div className="exam-result-detail-part-info-item">
                          <Text strong>Tên phần thi: </Text>
                          <Text>{detail.name || `Phần ${index + 1}`}</Text>
                        </div>
                        {detail.point && (
                          <div className="exam-result-detail-part-info-item">
                            <Text strong>Điểm: </Text>{' '}
                            <Tag color="blue">
                              {detail.point *
                                detail.questionGroups.reduce(
                                  (sum, group) =>
                                    sum + Number(group.questions.length),
                                  0,
                                )}{' '}
                              điểm
                            </Tag>
                          </div>
                        )}
                        {detail.timeLimit && (
                          <div className="exam-result-detail-part-info-item">
                            <Text strong>Thời gian: </Text>
                            <Tag color="default">
                              <ClockCircleOutlined /> {detail.timeLimit} phút
                            </Tag>
                          </div>
                        )}
                        <div className="exam-result-detail-part-info-item">
                          <Text strong>Độ chính xác: </Text>
                          <Tag
                            color={
                              groupAccuracy >= 80
                                ? 'success'
                                : groupAccuracy >= 60
                                  ? 'warning'
                                  : 'error'
                            }
                          >
                            {groupAccuracy}% ({detailCorrect}/{detailTotal})
                          </Tag>
                        </div>
                      </div>
                    </Card>

                    {/* Question Groups */}
                    <div className="exam-result-detail-question-groups">
                      {detail.questionGroups.map((questionGroup, qgIndex) => {
                        const qgAccuracy = calculateAccuracy(
                          questionGroup.correctCountQuestionGroup,
                          questionGroup.numberOfQuestions,
                        );
                        return (
                          <Collapse
                            key={questionGroup.id}
                            className="exam-result-detail-question-group-collapse"
                            defaultActiveKey={[]}
                          >
                            <Panel
                              header={
                                <div className="exam-result-detail-question-group-header">
                                  <Text strong>
                                    Nhóm câu hỏi {qgIndex + 1}
                                    {questionGroup.content && (
                                      <span
                                        dangerouslySetInnerHTML={{
                                          __html: `: ${questionGroup.content}`,
                                        }}
                                      />
                                    )}
                                  </Text>
                                  <Tag
                                    color={
                                      qgAccuracy === 100
                                        ? 'success'
                                        : qgAccuracy >= 50
                                          ? 'warning'
                                          : 'error'
                                    }
                                  >
                                    {qgAccuracy}% (
                                    {questionGroup.correctCountQuestionGroup}/
                                    {questionGroup.numberOfQuestions})
                                  </Tag>
                                </div>
                              }
                              key={questionGroup.id}
                            >
                              {questionGroup.questions.map(
                                (question, qIndex) => {
                                  // Vì tất cả questions đều là MULTIPLE_CHOICE
                                  // Tìm đáp án đúng (có isCorrect = true)
                                  const allOptions =
                                    question.correctAnswers as MultipleChoiceAnswerDto[];
                                  const correctAnswer = allOptions.find(
                                    option => option.isCorrect,
                                  );
                                  const userAnswer = question.userAnswers[0] as
                                    | MultipleChoiceAnswerDto
                                    | undefined;

                                  // So sánh đáp án cho MULTIPLE_CHOICE
                                  const isCorrect =
                                    correctAnswer &&
                                    userAnswer &&
                                    correctAnswer.content ===
                                      userAnswer.content;

                                  return (
                                    <div
                                      key={question.id}
                                      className="exam-result-detail-question-item"
                                    >
                                      <div className="exam-result-detail-question-header">
                                        <div className="exam-result-detail-question-number">
                                          Câu {qIndex + 1}
                                        </div>
                                        {isCorrect ? (
                                          <Tag
                                            icon={<CheckCircleOutlined />}
                                            color="success"
                                          >
                                            Đúng
                                          </Tag>
                                        ) : (
                                          <Tag
                                            icon={<CloseCircleOutlined />}
                                            color="error"
                                          >
                                            Sai
                                          </Tag>
                                        )}
                                      </div>
                                      <div className="exam-result-detail-question-content">
                                        <div
                                          className="exam-result-detail-question-text"
                                          dangerouslySetInnerHTML={{
                                            __html: question.content,
                                          }}
                                        />

                                        {/* Hiển thị các lựa chọn */}
                                        {allOptions.length > 0 && (
                                          <div className="exam-result-detail-question-options">
                                            <Radio.Group
                                              value={
                                                userAnswer?.content || undefined
                                              }
                                              disabled
                                            >
                                              <Space
                                                direction="vertical"
                                                size="middle"
                                              >
                                                {allOptions.map(
                                                  (option, optIndex) => {
                                                    const isUserAnswer =
                                                      userAnswer?.content ===
                                                      option.content;
                                                    const isCorrectOption =
                                                      correctAnswer?.content ===
                                                      option.content;
                                                    return (
                                                      <Radio
                                                        key={optIndex}
                                                        value={option.content}
                                                        className={`exam-result-detail-option ${
                                                          isCorrectOption
                                                            ? 'correct-answer'
                                                            : ''
                                                        } ${
                                                          isUserAnswer &&
                                                          !isCorrectOption
                                                            ? 'wrong-answer'
                                                            : ''
                                                        }`}
                                                      >
                                                        <span
                                                          dangerouslySetInnerHTML={{
                                                            __html:
                                                              option.content,
                                                          }}
                                                        />
                                                        {/* {isCorrectOption && (
                                                          <CheckCircleOutlined className="correct-icon" />
                                                        )} */}
                                                        {isUserAnswer &&
                                                          !isCorrectOption && (
                                                            <CloseCircleOutlined className="wrong-icon" />
                                                          )}
                                                      </Radio>
                                                    );
                                                  },
                                                )}
                                              </Space>
                                            </Radio.Group>
                                          </div>
                                        )}

                                        {/* Hiển thị đáp án đúng và đáp án người dùng chọn */}
                                        <div className="exam-result-detail-answer-info">
                                          {correctAnswer && (
                                            <div className="exam-result-detail-correct-answer">
                                              <Text strong>Đáp án đúng: </Text>
                                              <span
                                                style={{
                                                  color: '#52c41a',
                                                  fontWeight: 600,
                                                }}
                                                dangerouslySetInnerHTML={{
                                                  __html: correctAnswer.content,
                                                }}
                                              />
                                            </div>
                                          )}
                                          {userAnswer && !isCorrect && (
                                            <div className="exam-result-detail-user-answer">
                                              <Text strong>
                                                Đáp án của bạn:{' '}
                                              </Text>
                                              <span
                                                style={{
                                                  color: '#ff4d4f',
                                                  fontWeight: 600,
                                                }}
                                                dangerouslySetInnerHTML={{
                                                  __html: userAnswer.content,
                                                }}
                                              />
                                            </div>
                                          )}
                                        </div>

                                        {question.explain && (
                                          <div className="exam-result-detail-question-explain">
                                            <Text type="secondary">
                                              <strong>Giải thích: </strong>
                                              <span
                                                dangerouslySetInnerHTML={{
                                                  __html: question.explain,
                                                }}
                                              />
                                            </Text>
                                          </div>
                                        )}
                                      </div>
                                      <Divider style={{ margin: '12px 0' }} />
                                    </div>
                                  );
                                },
                              )}
                            </Panel>
                          </Collapse>
                        );
                      })}
                    </div>
                  </div>
                ),
              };
            })}
          />
        </div>
      </div>
    </div>
  );
};

export default ExamResultDetailPage;
