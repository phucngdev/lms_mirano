import { useEffect, useState } from 'react';
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import './LessonKanji.scss';
import KanjiSVG from '#/shared/components/KanjiSVG/KanjiSVG';

const LessonKanji = () => {
  const data = {
    items: [
      {
        id: '1',
        character: '七',
        sinoVietnamese: 'Nhật',
        mean: 'Mặt trời, ngày',
        description:
          'Chữ 日 tượng trưng cho mặt trời hoặc ngày trong chu kỳ thời gian.',
        example: '日本（にほん）: Nhật Bản',
        pos: 1,
        onyomi: 'ニチ (nichi)',
        kunyomi: 'ひ (hi)',
        descriptionImageUrl: 'https://example.com/images/nichi.png',
      },
      {
        id: '2',
        character: '一',
        sinoVietnamese: 'Nhất',
        mean: 'Một',
        description: 'Chữ 一 biểu thị con số 1, khởi đầu của mọi thứ.',
        example: '一人（ひとり）: một người',
        pos: 2,
        onyomi: 'イチ (ichi)',
        kunyomi: 'ひと (hito)',
        descriptionImageUrl: 'https://example.com/images/ichi.png',
      },
      {
        id: '3',
        character: '国',
        sinoVietnamese: 'Quốc',
        mean: 'Đất nước',
        description: 'Chữ 国 biểu thị ranh giới có vua cai trị — một quốc gia.',
        example: '外国（がいこく）: nước ngoài',
        pos: 3,
        onyomi: 'コク (koku)',
        kunyomi: 'くに (kuni)',
        descriptionImageUrl: 'https://example.com/images/koku.png',
      },
      {
        id: '4',
        character: '人',
        sinoVietnamese: 'Nhân',
        mean: 'Con người',
        description:
          'Chữ 人 là hình ảnh người đang đứng, biểu trưng cho con người.',
        example: '日本人（にほんじん）: người Nhật',
        pos: 4,
        onyomi: 'ジン (jin)',
        kunyomi: 'ひと (hito)',
        descriptionImageUrl: 'https://example.com/images/jin.png',
      },
      {
        id: '5',
        character: '年',
        sinoVietnamese: 'Niên',
        mean: 'Năm, tuổi',
        description: 'Chữ 年 biểu thị chu kỳ thời gian – một năm.',
        example: '来年（らいねん）: năm sau',
        pos: 5,
        onyomi: 'ネン (nen)',
        kunyomi: 'とし (toshi)',
        descriptionImageUrl: 'https://example.com/images/nen.png',
      },
      {
        id: '6',
        character: '大',
        sinoVietnamese: 'Đại',
        mean: 'To, lớn',
        description:
          'Chữ 大 tượng trưng cho hình dáng người dang rộng tay — nghĩa là lớn.',
        example: '大学（だいがく）: đại học',
        pos: 6,
        onyomi: 'ダイ (dai)',
        kunyomi: 'おお (oo)',
        descriptionImageUrl: 'https://example.com/images/dai.png',
      },
      {
        id: '7',
        character: '十',
        sinoVietnamese: 'Thập',
        mean: 'Mười',
        description:
          'Chữ 十 biểu thị con số mười, tượng trưng cho sự hoàn thiện.',
        example: '十人（じゅうにん）: mười người',
        pos: 7,
        onyomi: 'ジュウ (juu)',
        kunyomi: 'とお (too)',
        descriptionImageUrl: 'https://example.com/images/juu.png',
      },
      {
        id: '8',
        character: '二',
        sinoVietnamese: 'Nhị',
        mean: 'Hai',
        description:
          'Chữ 二 biểu thị con số hai, tượng trưng cho sự song song.',
        example: '二月（にがつ）: tháng Hai',
        pos: 8,
        onyomi: 'ニ (ni)',
        kunyomi: 'ふた (futa)',
        descriptionImageUrl: 'https://example.com/images/ni.png',
      },
      {
        id: '9',
        character: '本',
        sinoVietnamese: 'Bản',
        mean: 'Sách, gốc rễ',
        description:
          "Chữ 本 vừa nghĩa là 'sách' vừa là 'gốc' hoặc 'nguồn gốc'.",
        example: '日本（にほん）: Nhật Bản',
        pos: 9,
        onyomi: 'ホン (hon)',
        kunyomi: 'もと (moto)',
        descriptionImageUrl: 'https://example.com/images/hon.png',
      },
      {
        id: '10',
        character: '中',
        sinoVietnamese: 'Trung',
        mean: 'Giữa, trong',
        description: 'Chữ 中 biểu thị vị trí ở giữa hoặc bên trong.',
        example: '中国（ちゅうごく）: Trung Quốc',
        pos: 10,
        onyomi: 'チュウ (chuu)',
        kunyomi: 'なか (naka)',
        descriptionImageUrl: 'https://example.com/images/chuu.png',
      },
      {
        id: '11',
        character: '長',
        sinoVietnamese: 'Trường / Trưởng',
        mean: 'Dài, người đứng đầu',
        description: 'Chữ 長 có nghĩa là dài hoặc lãnh đạo.',
        example: '社長（しゃちょう）: giám đốc',
        pos: 11,
        onyomi: 'チョウ (chou)',
        kunyomi: 'なが (naga)',
        descriptionImageUrl: 'https://example.com/images/chou.png',
      },
      {
        id: '12',
        character: '出',
        sinoVietnamese: 'Xuất',
        mean: 'Ra ngoài',
        description: 'Chữ 出 thể hiện hành động đi ra khỏi một nơi nào đó.',
        example: '出口（でぐち）: lối ra',
        pos: 12,
        onyomi: 'シュツ (shutsu)',
        kunyomi: 'で (de)',
        descriptionImageUrl: 'https://example.com/images/shutsu.png',
      },
      {
        id: '13',
        character: '三',
        sinoVietnamese: 'Tam',
        mean: 'Ba',
        description: 'Chữ 三 biểu thị con số ba, biểu tượng cho sự cân bằng.',
        example: '三月（さんがつ）: tháng Ba',
        pos: 13,
        onyomi: 'サン (san)',
        kunyomi: 'みっ (mittsu)',
        descriptionImageUrl: 'https://example.com/images/san.png',
      },
      {
        id: '14',
        character: '時',
        sinoVietnamese: 'Thời',
        mean: 'Thời gian, giờ',
        description: 'Chữ 時 biểu thị thời gian hoặc khoảnh khắc.',
        example: '時間（じかん）: thời gian',
        pos: 14,
        onyomi: 'ジ (ji)',
        kunyomi: 'とき (toki)',
        descriptionImageUrl: 'https://example.com/images/ji.png',
      },
      {
        id: '15',
        character: '行',
        sinoVietnamese: 'Hành / Hàng',
        mean: 'Đi, thực hiện',
        description: 'Chữ 行 biểu thị hành động di chuyển hoặc thực thi.',
        example: '銀行（ぎんこう）: ngân hàng',
        pos: 15,
        onyomi: 'コウ (kou)',
        kunyomi: 'い (i)',
        descriptionImageUrl: 'https://example.com/images/kou.png',
      },
      {
        id: '16',
        character: '見',
        sinoVietnamese: 'Kiến',
        mean: 'Nhìn, thấy',
        description:
          'Chữ 見 biểu thị hành động quan sát hoặc nhận thức bằng mắt.',
        example: '見る（みる）: nhìn, xem',
        pos: 16,
        onyomi: 'ケン (ken)',
        kunyomi: 'み (mi)',
        descriptionImageUrl: 'https://example.com/images/ken.png',
      },
      {
        id: '17',
        character: '月',
        sinoVietnamese: 'Nguyệt',
        mean: 'Mặt trăng, tháng',
        description: 'Chữ 月 biểu thị mặt trăng hoặc tháng trong lịch.',
        example: '一月（いちがつ）: tháng Một',
        pos: 17,
        onyomi: 'ゲツ (getsu)',
        kunyomi: 'つき (tsuki)',
        descriptionImageUrl: 'https://example.com/images/getsu.png',
      },
      {
        id: '18',
        character: '後',
        sinoVietnamese: 'Hậu',
        mean: 'Sau, phía sau',
        description: 'Chữ 後 thể hiện ý nghĩa về sau hoặc theo sau.',
        example: '午後（ごご）: buổi chiều',
        pos: 18,
        onyomi: 'ゴ (go)',
        kunyomi: 'あと (ato)',
        descriptionImageUrl: 'https://example.com/images/go.png',
      },
      {
        id: '19',
        character: '前',
        sinoVietnamese: 'Tiền',
        mean: 'Trước, phía trước',
        description: 'Chữ 前 biểu thị vị trí ở phía trước hoặc trước đây.',
        example: '午前（ごぜん）: buổi sáng',
        pos: 19,
        onyomi: 'ゼン (zen)',
        kunyomi: 'まえ (mae)',
        descriptionImageUrl: 'https://example.com/images/zen.png',
      },
      {
        id: '20',
        character: '生',
        sinoVietnamese: 'Sinh',
        mean: 'Sinh ra, sống',
        description: 'Chữ 生 biểu thị sự sống, sinh sản hoặc cuộc đời.',
        example: '学生（がくせい）: học sinh',
        pos: 20,
        onyomi: 'セイ (sei)',
        kunyomi: 'い (i)',
        descriptionImageUrl: 'https://example.com/images/sei.png',
      },
    ],
    meta: {
      limit: 20,
      offset: 0,
      total: 20,
      totalPages: 1,
    },
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentKanji = data.items[currentIndex];

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

  const [responseData, setResponseData] = useState<any | null>(null);

  const fetchData = async () => {
    if (!currentKanji) return;

    if (!currentKanji.character) {
      return;
    }

    const payload = {
      data: [currentKanji.character],
      lang: 'ja',
    };

    try {
      const response = await fetch('/api/samples/_php/fetchData.php', {
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        method: 'POST',
      });
      console.log('🚀 ~ fetchData ~ response:', response);
      const data = await response.json();

      setResponseData(null);
      if (data && data.length > 0) {
        setResponseData(data[0]);
      }
    } catch (error) {
      console.error('Error fetching Kanji SVG:', error);
      setResponseData(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentKanji]);

  return (
    <div className="lesson-kanji">
      <div className="lesson-kanji-container">
        <div className="lesson-kanji-display">
          <div className="kanji-character">
            <KanjiSVG character={currentKanji.character} />
            {/* {responseData?.svg ? (
              <div
                dangerouslySetInnerHTML={{ __html: responseData.svg }}
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  maxWidth: '500px',
                  width: '100%',
                }}
              />
            ) : (
              <p>Không có dữ liệu SVG cho {currentKanji.character}</p>
            )} */}
          </div>
        </div>

        <div className="lesson-kanji-details">
          <div className="vocabulary-section">
            <div className="vocabulary-label">Từ vựng:</div>
            <div className="vocabulary-content">
              <div className="vocabulary-illustration">
                <svg
                  width="60"
                  height="40"
                  viewBox="0 0 60 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 15 L15 10 L18 12 L20 15 L18 18 L15 16 L10 15 Z"
                    fill="black"
                    stroke="black"
                    strokeWidth="1"
                  />
                  <path
                    d="M20 15 L35 15"
                    stroke="black"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="10"
                      refX="9"
                      refY="3"
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3, 0 6" fill="black" />
                    </marker>
                  </defs>
                  <line
                    x1="35"
                    y1="15"
                    x2="50"
                    y2="15"
                    stroke="black"
                    strokeWidth="3"
                  />
                </svg>
              </div>
              <div className="vocabulary-description">
                {currentKanji.description}
              </div>
            </div>
          </div>

          <div className="information-cards">
            <div className="info-card">
              <div className="info-label">Âm Hán</div>
              <div className="info-value">{currentKanji.sinoVietnamese}</div>
            </div>
            <div className="info-card">
              <div className="info-label">Nghĩa</div>
              <div className="info-value">{currentKanji.mean}</div>
            </div>
            <div className="info-card">
              <div className="info-label">Onyomi</div>
              <div className="info-value">{currentKanji.onyomi}</div>
            </div>
            <div className="info-card">
              <div className="info-label">Kunyomi</div>
              <div className="info-value">{currentKanji.kunyomi}</div>
            </div>
            <div className="info-card">
              <div className="info-label">Ví dụ</div>
              <div className="info-value">{currentKanji.example}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="lesson-kanji-navigation">
        <button
          className="nav-button"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
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
        >
          <ArrowRightOutlined />
        </button>
      </div>
    </div>
  );
};

export default LessonKanji;
