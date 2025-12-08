import { useState } from 'react';
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { IconMic, IconListen } from '#/assets/svg/externalIcon';
import { VoiceJapan } from '#/shared/redux/thunk/VoiceJapan';
import './LessonVocab.scss';

const LessonVocab = () => {
  const data = {
    items: [
      {
        id: '1',
        originText: 'ねこ',
        mean: 'Con mèo',
        imageUrl: 'https://example.com/images/neko.png',
        sinoVietNamese: 'Miêu',
        kanji: '猫',
        example: '猫が好きです。 (Tôi thích mèo.)',
        pos: 1,
      },
      {
        id: '2',
        originText: 'みず',
        mean: 'Nước',
        imageUrl: 'https://example.com/images/mizu.png',
        sinoVietNamese: 'Thủy',
        kanji: '水',
        example: '水を飲みます。 (Tôi uống nước.)',
        pos: 2,
      },
      {
        id: '3',
        originText: 'やま',
        mean: 'Núi',
        imageUrl: 'https://example.com/images/yama.png',
        sinoVietNamese: 'Sơn',
        kanji: '山',
        example: '山に登ります。 (Tôi leo núi.)',
        pos: 3,
      },
      {
        id: '4',
        originText: 'くるま',
        mean: 'Xe hơi',
        imageUrl: 'https://example.com/images/kuruma.png',
        sinoVietNamese: 'Xa',
        kanji: '車',
        example: '車を運転します。 (Tôi lái xe.)',
        pos: 4,
      },
      {
        id: '5',
        originText: 'はな',
        mean: 'Hoa',
        imageUrl: 'https://example.com/images/hana.png',
        sinoVietNamese: 'Hoa',
        kanji: '花',
        example: '花がきれいです。 (Hoa đẹp quá.)',
        pos: 5,
      },
      {
        id: '6',
        originText: 'ともだち',
        mean: 'Bạn bè',
        imageUrl: 'https://example.com/images/tomodachi.png',
        sinoVietNamese: 'Hữu đạt',
        kanji: '友達',
        example: '友達と遊びます。 (Tôi chơi với bạn.)',
        pos: 6,
      },
      {
        id: '7',
        originText: 'ほん',
        mean: 'Sách',
        imageUrl: 'https://example.com/images/hon.png',
        sinoVietNamese: 'Bản',
        kanji: '本',
        example: '本を読みます。 (Tôi đọc sách.)',
        pos: 7,
      },
      {
        id: '8',
        originText: 'そら',
        mean: 'Bầu trời',
        imageUrl: 'https://example.com/images/sora.png',
        sinoVietNamese: 'Không',
        kanji: '空',
        example: '空が青いです。 (Bầu trời thật xanh.)',
        pos: 8,
      },
      {
        id: '9',
        originText: 'あめ',
        mean: 'Mưa',
        imageUrl: 'https://example.com/images/ame.png',
        sinoVietNamese: 'Vũ',
        kanji: '雨',
        example: '雨が降っています。 (Trời đang mưa.)',
        pos: 9,
      },
      {
        id: '10',
        originText: 'ひと',
        mean: 'Người',
        imageUrl: 'https://example.com/images/hito.png',
        sinoVietNamese: 'Nhân',
        kanji: '人',
        example: 'あの人は先生です。 (Người kia là thầy giáo.)',
        pos: 10,
      },
    ],
    meta: {
      limit: 10,
      offset: 0,
      total: 10,
      totalPages: 1,
    },
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentVocab = data.items[currentIndex];

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < data.items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleRecordAudio = () => {};

  return (
    <div className="lesson-vocab">
      <div className="lesson-vocab-container">
        <div className="lesson-vocab-illustration">
          <img
            src={currentVocab.imageUrl}
            alt={currentVocab.originText}
            onError={e => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>

        <div className="lesson-vocab-details">
          <div className="lesson-vocab-details-header">
            <div className="vocabulary-section">
              <div className="vocabulary-label">Từ vựng:</div>
              <div className="vocabulary-word">{currentVocab.originText}</div>
            </div>
            <div className="audio-controls">
              <button
                className="audio-button mic-button"
                onClick={handleRecordAudio}
                aria-label="Record audio"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M7.99998 10.332C9.47331 10.332 10.6666 9.1387 10.6666 7.66536V3.9987C10.6666 2.52536 9.47331 1.33203 7.99998 1.33203C6.52665 1.33203 5.33331 2.52536 5.33331 3.9987V7.66536C5.33331 9.1387 6.52665 10.332 7.99998 10.332Z"
                    stroke="#F37142"
                    stroke-width="1.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M2.90002 6.43359V7.56693C2.90002 10.3803 5.18669 12.6669 8.00002 12.6669C10.8134 12.6669 13.1 10.3803 13.1 7.56693V6.43359"
                    stroke="#F37142"
                    stroke-width="1.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M7.0733 4.28609C7.6733 4.06609 8.32664 4.06609 8.92664 4.28609"
                    stroke="#F37142"
                    stroke-width="1.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M7.46667 5.69891C7.82001 5.60557 8.18667 5.60557 8.54001 5.69891"
                    stroke="#F37142"
                    stroke-width="1.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M8 12.668V14.668"
                    stroke="#F37142"
                    stroke-width="1.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>{' '}
              </button>
              <button
                className="audio-button speaker-button"
                aria-label="Play audio"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M1.33331 6.66783V9.3345C1.33331 10.6678 1.99998 11.3345 3.33331 11.3345H4.28665C4.53331 11.3345 4.77998 11.4078 4.99331 11.5345L6.93998 12.7545C8.61998 13.8078 9.99998 13.0412 9.99998 11.0612V4.94116C9.99998 2.95449 8.61998 2.19449 6.93998 3.24783L4.99331 4.46783C4.77998 4.59449 4.53331 4.66783 4.28665 4.66783H3.33331C1.99998 4.66783 1.33331 5.33449 1.33331 6.66783Z"
                    stroke="#0BA5EC"
                    stroke-width="1.2"
                  />
                  <path
                    d="M12 5.33203C13.1867 6.91203 13.1867 9.08536 12 10.6654"
                    stroke="#0BA5EC"
                    stroke-width="1.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M13.22 3.66797C15.1466 6.23464 15.1466 9.76797 13.22 12.3346"
                    stroke="#0BA5EC"
                    stroke-width="1.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="information-cards">
            <div className="info-card">
              <div className="info-label">Nghĩa</div>
              <div className="info-value">{currentVocab.mean}</div>
            </div>
            <div className="info-card">
              <div className="info-label">Kanji</div>
              <div className="info-value">{currentVocab.kanji}</div>
            </div>
            <div className="info-card">
              <div className="info-label">Âm Hán</div>
              <div className="info-value">{currentVocab.sinoVietNamese}</div>
            </div>
            <div className="info-card">
              <div className="info-label">Ví dụ</div>
              <div className="info-value">{currentVocab.example}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="lesson-vocab-navigation">
        <button
          className="nav-button"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          aria-label="Previous"
        >
          <ArrowLeftOutlined />
        </button>
        <div className="nav-info">
          Câu {currentIndex + 1}/{data.items.length}
        </div>
        <button
          className="nav-button"
          onClick={handleNext}
          disabled={currentIndex === data.items.length - 1}
          aria-label="Next"
        >
          <ArrowRightOutlined />
        </button>
      </div>
    </div>
  );
};

export default LessonVocab;
