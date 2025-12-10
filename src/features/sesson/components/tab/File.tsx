import React from 'react';
import './index.scss';
import { DocumentEntityType } from '#/api/requests';

interface FileProps {
  documents: DocumentEntityType[];
}

const File = ({ documents }: FileProps) => {
  return (
    <>
      <div className="file-content">
        <div className="file-list">
          {documents.map(document => (
            <div className="file-item" key={document.id}>
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
                    <span>{document.name}</span>
                  </div>
                  <div className="file-item-size">
                    <span>100 KB</span>
                  </div>
                </div>
              </div>
              <div className="file-item-action">
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
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                  ></path>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default File;
