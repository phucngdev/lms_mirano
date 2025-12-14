import React, { useState, useEffect, useRef } from 'react';
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import { Upload, Button, Spin, message } from 'antd';
import { useParams } from 'react-router-dom';
import { QuestionEntity } from '#/api/requests/models/QuestionEntity';
import {
  getEssayByUserService,
  postEssayService,
  updateEssayService,
} from '#/api/services/essay.service';
import { uploadMultipleFileToS3 } from '#/api/services/uploadS3..service';
import { updateLessonProgress as updateLessonProgressService } from '#/api/services/lesson-progress.service';
import { useAppDispatch } from '#/src/redux/store/store';
import { updateLessonProgress } from '#/src/redux/slice/lesson.slice';
import Cookies from 'js-cookie';
import './EssayQuestion.scss';

interface EssayQuestionProps {
  question: QuestionEntity;
  examId?: string;
}

const EssayQuestion: React.FC<EssayQuestionProps> = ({ question, examId }) => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const dispatch = useAppDispatch();
  const hasUpdatedProgressRef = useRef(false);
  const [submittedFiles, setSubmittedFiles] = useState<string[]>([]);
  const [loadingSubmitted, setLoadingSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [essayId, setEssayId] = useState<string | null>(null);
  const pendingFilesRef = useRef<File[]>([]);
  const uploadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get userId from cookies
  const user = Cookies.get('user')
    ? JSON.parse(Cookies.get('user') as string)
    : null;
  const userId = user?.id || '';

  // Fetch submitted files
  useEffect(() => {
    if (examId && userId) {
      fetchSubmittedFiles();
    }
  }, [examId, userId]);

  const fetchSubmittedFiles = async () => {
    if (!examId || !userId) return;

    try {
      setLoadingSubmitted(true);
      const response = await getEssayByUserService(userId, examId);
      const apiData = response.data;

      if (apiData.statusCode === 200 && apiData.data) {
        // Lưu essayId để biết đã từng nộp hay chưa
        if (apiData.data.id) {
          setEssayId(apiData.data.id);
        }
        if (apiData.data.submittedExamUrls) {
          setSubmittedFiles(apiData.data.submittedExamUrls);
        }
      }
    } catch (error) {
      console.error('Error fetching submitted files:', error);
      // Don't show error message to avoid interrupting user experience
    } finally {
      setLoadingSubmitted(false);
    }
  };

  const getFileNameFromUrl = (url: string): string => {
    try {
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      // Remove query parameters if any
      return fileName.split('?')[0] || 'File';
    } catch {
      return 'File';
    }
  };

  const handleDownloadFile = (url: string) => {
    window.open(url, '_blank');
  };

  const beforeUpload = (file: File) => {
    // Thêm file vào danh sách chờ upload
    pendingFilesRef.current.push(file);

    // Giới hạn tối đa 5 file
    if (pendingFilesRef.current.length > 5) {
      pendingFilesRef.current = pendingFilesRef.current.slice(-5);
    }

    // Clear timeout cũ nếu có
    if (uploadTimeoutRef.current) {
      clearTimeout(uploadTimeoutRef.current);
    }

    // Đợi một chút để có thể nhận thêm file nếu chọn nhiều file cùng lúc
    uploadTimeoutRef.current = setTimeout(async () => {
      if (pendingFilesRef.current.length > 0 && !uploading) {
        const filesToUpload = [...pendingFilesRef.current];
        pendingFilesRef.current = []; // Clear sau khi lấy
        await handleUploadAndSubmit(filesToUpload);
      }
    }, 300); // Đợi 300ms để có thể nhận thêm file

    // Return false để không thêm file vào fileList
    return false;
  };

  const handleChange = () => {
    // Không cần xử lý gì ở đây vì beforeUpload đã xử lý
  };

  // Cleanup timeout khi unmount
  useEffect(() => {
    return () => {
      if (uploadTimeoutRef.current) {
        clearTimeout(uploadTimeoutRef.current);
      }
    };
  }, []);

  const handleUploadAndSubmit = async (files: File[]) => {
    if (!examId || !userId || files.length === 0) return;

    try {
      setUploading(true);

      // Get courseId and classId from sessionStorage
      const courseId = sessionStorage.getItem('courseId') || '';
      const classId = sessionStorage.getItem('classId') || '';

      if (!courseId || !classId) {
        message.error('Không tìm thấy thông tin khóa học');
        return;
      }

      // Upload files to S3
      const uploadResults = await uploadMultipleFileToS3(files);
      const submittedExamUrls = uploadResults.map(result => result.publicUrl);

      // Submit essay
      if (essayId) {
        // Đã từng nộp, gọi update API
        await updateEssayService(essayId, {
          submittedExamUrls: submittedExamUrls,
        });
        message.success('Cập nhật bài nộp thành công');
      } else {
        // Lần đầu nộp, gọi create API
        const response = await postEssayService({
          userId: userId,
          examId: examId,
          courseId: courseId,
          classId: classId,
          submittedExamUrls: submittedExamUrls,
          status: true,
        });

        // Lưu essayId từ response
        if (response.data?.data?.id) {
          setEssayId(response.data.data.id);
        }
        message.success('Nộp bài thành công');

        // Cập nhật progress khi nộp bài lần đầu
        if (lessonId && !hasUpdatedProgressRef.current) {
          try {
            // Call API để cập nhật progress
            await updateLessonProgressService({
              lessonId: lessonId,
              progress: 100, // Hoàn thành = 100%
            });

            // Cập nhật Redux state
            dispatch(updateLessonProgress({ lessonId, progress: 100 }));
            hasUpdatedProgressRef.current = true;
          } catch (error) {
            console.error('Error updating lesson progress:', error);
            // Không hiển thị error để không làm gián đoạn trải nghiệm
          }
        }
      }

      // Refresh danh sách file đã nộp
      await fetchSubmittedFiles();
    } catch (error: any) {
      console.error('Error uploading and submitting files:', error);
      message.error(
        error.response?.data?.message || 'Lỗi khi nộp bài. Vui lòng thử lại',
      );
    } finally {
      setUploading(false);
    }
  };

  const props = {
    beforeUpload: beforeUpload, // Trigger upload ngay khi chọn file
    multiple: true,
    maxCount: 5,
    fileList: [], // Không hiển thị file list
    onChange: handleChange,
    accept:
      '.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.bmp,.webp,.svg,.heic,.heif',
  };

  // Get examUrl from essayAnswers
  const examUrl = question.essayAnswers?.[0]?.examUrl;

  return (
    <div className="essay-question">
      <div className="essay-question-content">
        <div
          className="essay-question-text"
          dangerouslySetInnerHTML={{ __html: question.content || '' }}
        />
        {examUrl && (
          <div className="essay-question-exam-file">
            <Button
              type="default"
              icon={
                <svg
                  fill="none"
                  height="25"
                  viewBox="0 0 24 25"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14.17 3.44775H5C3.9 3.44775 3 4.34775 3 5.44775V19.4478C3 20.5478 3.9 21.4478 5 21.4478H19C20.1 21.4478 21 20.5478 21 19.4478V10.2778C21 9.74775 20.79 9.23775 20.41 8.86775L15.58 4.03775C15.21 3.65775 14.7 3.44775 14.17 3.44775ZM8 15.4478H16C16.55 15.4478 17 15.8978 17 16.4478C17 16.9978 16.55 17.4478 16 17.4478H8C7.45 17.4478 7 16.9978 7 16.4478C7 15.8978 7.45 15.4478 8 15.4478ZM8 11.4478H16C16.55 11.4478 17 11.8978 17 12.4478C17 12.9978 16.55 13.4478 16 13.4478H8C7.45 13.4478 7 12.9978 7 12.4478C7 11.8978 7.45 11.4478 8 11.4478ZM8 7.44775H13C13.55 7.44775 14 7.89775 14 8.44775C14 8.99775 13.55 9.44775 13 9.44775H8C7.45 9.44775 7 8.99775 7 8.44775C7 7.89775 7.45 7.44775 8 7.44775Z"
                    fill="#21C16B"
                  ></path>
                </svg>
              }
              onClick={() => handleDownloadFile(examUrl)}
              className="essay-question-exam-download-btn"
            >
              Tải xuống file đề bài
            </Button>
          </div>
        )}
      </div>

      <div className="essay-question-upload">
        {/* <div className="essay-question-upload-label">
          <svg
            fill="none"
            height="25"
            viewBox="0 0 24 25"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14.17 3.44775H5C3.9 3.44775 3 4.34775 3 5.44775V19.4478C3 20.5478 3.9 21.4478 5 21.4478H19C20.1 21.4478 21 20.5478 21 19.4478V10.2778C21 9.74775 20.79 9.23775 20.41 8.86775L15.58 4.03775C15.21 3.65775 14.7 3.44775 14.17 3.44775ZM8 15.4478H16C16.55 15.4478 17 15.8978 17 16.4478C17 16.9978 16.55 17.4478 16 17.4478H8C7.45 17.4478 7 16.9978 7 16.4478C7 15.8978 7.45 15.4478 8 15.4478ZM8 11.4478H16C16.55 11.4478 17 11.8978 17 12.4478C17 12.9978 16.55 13.4478 16 13.4478H8C7.45 13.4478 7 12.9978 7 12.4478C7 11.8978 7.45 11.4478 8 11.4478ZM8 7.44775H13C13.55 7.44775 14 7.89775 14 8.44775C14 8.99775 13.55 9.44775 13 9.44775H8C7.45 9.44775 7 8.99775 7 8.44775C7 7.89775 7.45 7.44775 8 7.44775Z"
              fill="#21C16B"
            ></path>
          </svg>
          <span>Nộp bài làm (PDF, DOC, DOCX, TXT, JPG, PNG, ...)</span>
          <span className="essay-question-upload-limit">Tối đa 5 file</span>
        </div> */}

        <Upload {...props}>
          <Button
            icon={<UploadOutlined />}
            className="essay-question-upload-button"
            loading={uploading}
            disabled={uploading}
          >
            {uploading ? 'Đang nộp bài...' : 'Nộp bài'}
          </Button>
        </Upload>

        {/* Submitted Files Section */}
        {loadingSubmitted ? (
          <div className="essay-question-loading">
            <Spin size="small" />
            <span>Đang tải danh sách file đã nộp...</span>
          </div>
        ) : submittedFiles.length > 0 ? (
          <div className="essay-question-submitted-section">
            <div className="essay-question-submitted-title">
              {/* <svg
                fill="none"
                height="25"
                viewBox="0 0 24 25"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14.17 3.44775H5C3.9 3.44775 3 4.34775 3 5.44775V19.4478C3 20.5478 3.9 21.4478 5 21.4478H19C20.1 21.4478 21 20.5478 21 19.4478V10.2778C21 9.74775 20.79 9.23775 20.41 8.86775L15.58 4.03775C15.21 3.65775 14.7 3.44775 14.17 3.44775ZM8 15.4478H16C16.55 15.4478 17 15.8978 17 16.4478C17 16.9978 16.55 17.4478 16 17.4478H8C7.45 17.4478 7 16.9978 7 16.4478C7 15.8978 7.45 15.4478 8 15.4478ZM8 11.4478H16C16.55 11.4478 17 11.8978 17 12.4478C17 12.9978 16.55 13.4478 16 13.4478H8C7.45 13.4478 7 12.9978 7 12.4478C7 11.8978 7.45 11.4478 8 11.4478ZM8 7.44775H13C13.55 7.44775 14 7.89775 14 8.44775C14 8.99775 13.55 9.44775 13 9.44775H8C7.45 9.44775 7 8.99775 7 8.44775C7 7.89775 7.45 7.44775 8 7.44775Z"
                  fill="#21C16B"
                ></path>
              </svg> */}
              <span>File đã nộp</span>
            </div>
            <div className="essay-question-submitted-list">
              {submittedFiles.map((url, index) => (
                <div
                  key={index}
                  onClick={() => handleDownloadFile(url)}
                  className="essay-question-submitted-item"
                >
                  <svg
                    fill="none"
                    height="25"
                    viewBox="0 0 24 25"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14.17 3.44775H5C3.9 3.44775 3 4.34775 3 5.44775V19.4478C3 20.5478 3.9 21.4478 5 21.4478H19C20.1 21.4478 21 20.5478 21 19.4478V10.2778C21 9.74775 20.79 9.23775 20.41 8.86775L15.58 4.03775C15.21 3.65775 14.7 3.44775 14.17 3.44775ZM8 15.4478H16C16.55 15.4478 17 15.8978 17 16.4478C17 16.9978 16.55 17.4478 16 17.4478H8C7.45 17.4478 7 16.9978 7 16.4478C7 15.8978 7.45 15.4478 8 15.4478ZM8 11.4478H16C16.55 11.4478 17 11.8978 17 12.4478C17 12.9978 16.55 13.4478 16 13.4478H8C7.45 13.4478 7 12.9978 7 12.4478C7 11.8978 7.45 11.4478 8 11.4478ZM8 7.44775H13C13.55 7.44775 14 7.89775 14 8.44775C14 8.99775 13.55 9.44775 13 9.44775H8C7.45 9.44775 7 8.99775 7 8.44775C7 7.89775 7.45 7.44775 8 7.44775Z"
                      fill="#21C16B"
                    ></path>
                  </svg>
                  <div className="essay-question-file-info">
                    <span className="essay-question-file-name">
                      {getFileNameFromUrl(url)}
                    </span>
                  </div>
                  <Button
                    type="text"
                    icon={<DownloadOutlined />}
                    onClick={() => handleDownloadFile(url)}
                    className="essay-question-file-download"
                  >
                    Tải xuống
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default EssayQuestion;
