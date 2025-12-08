import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { Spin, message, Button } from 'antd';
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  DownloadOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { getSlideByIdLessionService } from '#/api/services/slide.service';
import { updateLessonProgress as updateLessonProgressService } from '#/api/services/lesson-progress.service';
import { useAppDispatch } from '#/src/redux/store/store';
import { updateLessonProgress } from '#/src/redux/slice/lesson.slice';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import './LessonSlide.scss';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

interface DocumentItem {
  id: string;
  name: string;
  url: string;
}

interface SlideData {
  id: string;
  slideUrl: string;
  lessonId: string;
  description: string;
  documents: DocumentItem[];
  lockRightClickAndCopy: boolean;
  allowContentDownloads: boolean;
  allowDiscussion: boolean;
}

const LessonSlide = () => {
  const { lessonId } = useParams();
  const dispatch = useAppDispatch();
  const [slideData, setSlideData] = useState<SlideData | null>(null);
  console.log('🚀 ~ LessonSlide ~ slideData:', slideData);
  const [loading, setLoading] = useState(true);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'description' | 'file'>(
    'description',
  );
  const hasSavedProgressRef = useRef<boolean>(false);

  useEffect(() => {
    fetchSlideData();
  }, [lessonId]);

  useEffect(() => {
    // Set initial PDF URL
    if (slideData) {
      if (slideData.slideUrl) {
        const clearSlideUrl = slideData.slideUrl.replace(' ', '%20');
        setCurrentPdfUrl(clearSlideUrl);
      } else if (slideData.documents && slideData.documents.length > 0) {
        console.log(
          'Setting PDF URL from documents:',
          slideData.documents[0].url,
        );
        setCurrentPdfUrl(slideData.documents[0].url);
      } else {
        console.warn('No PDF URL found in slide data');
      }
    }
  }, [slideData]);

  const fetchSlideData = async () => {
    try {
      setLoading(true);
      const response = await getSlideByIdLessionService(lessonId || '');
      const apiResponse = response.data.data.items[0];
      setSlideData(apiResponse);
    } catch (error) {
      console.error('Error fetching slide:', error);
      message.error('Lỗi khi tải slide');
    } finally {
      setLoading(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log('PDF loaded successfully, pages:', numPages);
    setNumPages(numPages);
    // Only reset to page 1 if we're starting fresh, not when switching documents
    if (pageNumber === 0 || pageNumber > numPages) {
      setPageNumber(1);
    }
    // Reset saved progress flag when new document loads
    hasSavedProgressRef.current = false;
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    console.error('PDF URL:', currentPdfUrl);
    message.error(`Lỗi khi tải PDF: ${error.message || 'Unknown error'}`);
  };

  const goToPrevPage = () => {
    setPageNumber(prev => {
      const newPage = Math.max(1, prev - 1);
      console.log('Going to previous page:', newPage);
      return newPage;
    });
  };

  const saveProgress = async (progress: number) => {
    if (!lessonId || hasSavedProgressRef.current) {
      return;
    }

    try {
      await updateLessonProgressService({
        lessonId: lessonId,
        progress: progress,
      });

      // Update Redux state
      dispatch(updateLessonProgress({ lessonId, progress }));
      hasSavedProgressRef.current = true;
      console.log('Progress saved:', progress);
    } catch (error) {
      console.error('Error saving progress:', error);
      message.error('Lỗi khi lưu tiến trình');
    }
  };

  const goToNextPage = () => {
    setPageNumber(prev => {
      if (numPages === 0) {
        console.warn('numPages is 0, cannot navigate');
        return prev;
      }
      const newPage = prev < numPages ? prev + 1 : prev;
      console.log(
        'Going to next page:',
        newPage,
        'Total pages:',
        numPages,
        'Previous:',
        prev,
      );

      // If reached the last page, save progress as 100%
      if (newPage === numPages && numPages > 0) {
        saveProgress(100);
      }

      return newPage;
    });
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3.0));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleDownload = () => {
    if (currentPdfUrl && slideData?.allowContentDownloads) {
      const link = document.createElement('a');
      link.href = currentPdfUrl;
      link.download = slideData.documents?.[0]?.name || 'slide.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      message.warning('Tải xuống không được phép');
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (slideData?.lockRightClickAndCopy) {
      e.preventDefault();
      message.warning('Không được phép sao chép');
    }
  };

  const handleDocumentClick = (doc: DocumentItem) => {
    setCurrentPdfUrl(doc.url);
    setPageNumber(1);
    setNumPages(0); // Reset numPages when switching documents
    hasSavedProgressRef.current = false; // Reset saved progress flag
  };

  if (loading) {
    return (
      <div className="lesson-slide-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!slideData) {
    return (
      <div className="lesson-slide-error">
        <p>Không tìm thấy slide</p>
      </div>
    );
  }

  return (
    <div
      className="lesson-slide-container"
      onContextMenu={handleContextMenu}
      onMouseDown={e => {
        if (slideData?.lockRightClickAndCopy && e.button === 0) {
          // Prevent text selection on left click
          e.preventDefault();
        }
      }}
      style={{
        userSelect: slideData?.lockRightClickAndCopy ? 'none' : 'auto',
        WebkitUserSelect: slideData?.lockRightClickAndCopy ? 'none' : 'auto',
      }}
    >
      <div className="lesson-slide-viewer">
        <div className="lesson-slide-controls">
          <div className="lesson-slide-controls-left">
            <Button
              icon={<LeftOutlined />}
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
            >
              Trước
            </Button>
            <span className="page-info">
              Trang {pageNumber} / {numPages || '...'}
            </span>
            <Button
              icon={<RightOutlined />}
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
            >
              Sau
            </Button>
          </div>

          <div className="lesson-slide-controls-center">
            <Button icon={<ZoomOutOutlined />} onClick={handleZoomOut}>
              Thu nhỏ
            </Button>
            <span className="zoom-info">{Math.round(scale * 100)}%</span>
            <Button icon={<ZoomInOutlined />} onClick={handleZoomIn}>
              Phóng to
            </Button>
          </div>

          <div className="lesson-slide-controls-right">
            {/* {slideData.allowContentDownloads && ( */}
            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownload}
              type="link"
            >
              Tải xuống
            </Button>
            {/* )} */}
          </div>
        </div>

        <div className="lesson-slide-pdf-container">
          {currentPdfUrl ? (
            <Document
              file={currentPdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="lesson-slide-pdf-loading">
                  <Spin size="large" />
                  <p>Đang tải PDF...</p>
                </div>
              }
              error={
                <div className="lesson-slide-pdf-error">
                  <p>Không thể tải PDF. Vui lòng thử lại.</p>
                  <p className="error-url">URL: {currentPdfUrl}</p>
                </div>
              }
              options={{
                cMapUrl:
                  'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/cmaps/',
                cMapPacked: true,
                standardFontDataUrl:
                  'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/standard_fonts/',
              }}
            >
              <Page
                key={`page-${pageNumber}-${currentPdfUrl}`}
                pageNumber={pageNumber}
                scale={scale}
                renderTextLayer={!slideData.lockRightClickAndCopy}
                renderAnnotationLayer={true}
                className="lesson-slide-pdf-page"
                loading={
                  <div className="lesson-slide-page-loading">
                    <Spin />
                  </div>
                }
              />
            </Document>
          ) : (
            <div className="lesson-slide-no-pdf">
              <p>Không có PDF để hiển thị</p>
              {slideData && (
                <p className="debug-info">
                  slideUrl: {slideData.slideUrl || 'null'}, documents:{' '}
                  {slideData.documents?.length || 0}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      {(slideData.description ||
        (slideData.documents && slideData.documents.length > 0)) && (
        <>
          <div className="lesson-content-tabs">
            {slideData.description && (
              <div
                className={`tab ${activeTab === 'description' ? 'active' : ''}`}
                onClick={() => setActiveTab('description')}
              >
                <span>Mô tả</span>
              </div>
            )}
            {slideData.documents && slideData.documents.length > 0 && (
              <div
                className={`tab ${activeTab === 'file' ? 'active' : ''}`}
                onClick={() => setActiveTab('file')}
              >
                <span>Tài liệu</span>
                <span className="tab-count">{slideData.documents.length}</span>
              </div>
            )}
          </div>
          <div className="lesson-content-tabs-content">
            {activeTab === 'description' && slideData.description && (
              <div className="description-content">
                <div
                  dangerouslySetInnerHTML={{ __html: slideData.description }}
                ></div>
              </div>
            )}
            {activeTab === 'file' &&
              slideData.documents &&
              slideData.documents.length > 0 && (
                <div className="file-content">
                  <div className="file-list">
                    {slideData.documents.map(doc => (
                      <div key={doc.id} className="file-item">
                        <div className="file-item-content">
                          <div className="file-item-icon">
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
                          </div>
                          <div className="file-item-info">
                            <div className="file-item-name">
                              <span>{doc.name}</span>
                            </div>
                          </div>
                        </div>
                        <div
                          className="file-item-action"
                          onClick={() => handleDocumentClick(doc)}
                          style={{ cursor: 'pointer' }}
                        >
                          <svg
                            fill="none"
                            height="25"
                            viewBox="0 0 24 25"
                            width="24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M21 15.4478V19.4478C21 19.9782 20.7893 20.4869 20.4142 20.862C20.0391 21.237 19.5304 21.4478 19 21.4478H5C4.46957 21.4478 3.96086 21.237 3.58579 20.862C3.21071 20.4869 3 19.9782 3 19.4478V15.4478M7 10.4478L12 15.4478M12 15.4478L17 10.4478M12 15.4478V3.44775"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                            ></path>
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </>
      )}
    </div>
  );
};

export default LessonSlide;
