import React, { useState } from 'react';
import {
  FileTextOutlined,
  DeleteOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { Upload, Button } from 'antd';
import type { UploadFile } from 'antd';
import { QuestionEntity } from '#/api/requests/models/QuestionEntity';
import './EssayQuestion.scss';

interface EssayQuestionProps {
  question: QuestionEntity;
  uploadedFiles: UploadFile[];
  onFileChange: (files: UploadFile[]) => void;
}

const EssayQuestion: React.FC<EssayQuestionProps> = ({
  question,
  uploadedFiles,
  onFileChange,
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>(uploadedFiles);

  const handleChange = (info: any) => {
    let newFileList = [...info.fileList];

    // Limit to 5 files
    newFileList = newFileList.slice(-5);

    // Read from response and show file link
    newFileList = newFileList.map(file => {
      if (file.response) {
        // Component will show file.url as link
        file.url = file.response.url;
      }
      return file;
    });

    setFileList(newFileList);
    onFileChange(newFileList);
  };

  const handleRemove = (file: UploadFile) => {
    const newFileList = fileList.filter(item => item.uid !== file.uid);
    setFileList(newFileList);
    onFileChange(newFileList);
  };

  const props = {
    beforeUpload: () => false, // Prevent auto upload
    multiple: true,
    maxCount: 5,
    fileList,
    onChange: handleChange,
    onRemove: handleRemove,
    accept: '.pdf,.doc,.docx,.txt',
  };

  return (
    <div className="essay-question">
      <div className="essay-question-content">
        <div
          className="essay-question-text"
          dangerouslySetInnerHTML={{ __html: question.content || '' }}
        />
      </div>

      <div className="essay-question-upload">
        <div className="essay-question-upload-label">
          <FileTextOutlined className="essay-question-upload-icon" />
          <span>Nộp bài làm (PDF, DOC, DOCX, TXT)</span>
          <span className="essay-question-upload-limit">Tối đa 5 file</span>
        </div>

        <Upload {...props}>
          <Button
            icon={<UploadOutlined />}
            className="essay-question-upload-button"
          >
            Chọn file
          </Button>
        </Upload>

        <div className="essay-question-file-list">
          {fileList.length === 0 ? (
            <div className="essay-question-empty">
              <FileTextOutlined className="essay-question-empty-icon" />
              <span>Chưa có file nào được nộp</span>
            </div>
          ) : (
            fileList.map(file => (
              <div key={file.uid} className="essay-question-file-item">
                <FileTextOutlined className="essay-question-file-icon" />
                <div className="essay-question-file-info">
                  <span className="essay-question-file-name">{file.name}</span>
                  {file.size && (
                    <span className="essay-question-file-size">
                      {(file.size / 1024).toFixed(2)} KB
                    </span>
                  )}
                </div>
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemove(file)}
                  className="essay-question-file-remove"
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default EssayQuestion;
