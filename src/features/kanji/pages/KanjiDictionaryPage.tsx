import { useState } from 'react';
import { Input, Button } from 'antd';
import { SearchOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { KanjiDictionaryEntity } from '#/api/requests';
import bannerMankai from '/src/assets/images/banner/bannerMankai.png';
import './KanjiDictionaryPage.scss';

// Mock data cứng
const mockKanjiData: KanjiDictionaryEntity[] = [
  {
    id: '1',
    character: '導',
    image: '',
    jukugo: ['誘導', '導入'],
    kanji: '導',
    kunyomi: ['みちびく'],
    meaning: 'Lead',
    mnemonic:
      'This street is dangerous, so follow and stick to your leader like glue',
    onyomi: 'DOU',
    strokes: 15,
    url: '',
    usedIn: ['道 (street)', '寸 (glueglue)'],
    lookalikes: ['豆', '音', '人'],
    synonyms: [
      'contest, game: 試合 競争 競技 争う 勝負 うう',
      'fight: 喧嘩 戦う 闘う もみあい 殴り合い 戦闘 合戦',
      'Guts: 志 根性 意地',
      'to do your best, to try your hardest: 一生懸命 努力 必死 奮闘',
    ],
    index: 1,
  },
  {
    id: '2',
    character: '道',
    image: '',
    jukugo: ['道路', '道徳'],
    kanji: '道',
    kunyomi: ['みち'],
    meaning: 'Street',
    mnemonic: 'The way forward on the street',
    onyomi: 'DOU',
    strokes: 12,
    url: '',
    usedIn: ['首 (head)', '辶 (walk)'],
    lookalikes: ['首', '辶'],
    synonyms: ['path: 道 路 径'],
    index: 2,
  },
  {
    id: '3',
    character: '学',
    image: '',
    jukugo: ['学校', '学習'],
    kanji: '学',
    kunyomi: ['まなぶ'],
    meaning: 'Study',
    mnemonic: 'A child learns under a roof',
    onyomi: 'GAKU',
    strokes: 8,
    url: '',
    usedIn: ['子 (child)', '宀 (roof)'],
    lookalikes: ['字', '安'],
    synonyms: ['learn: 学ぶ 習う 勉強'],
    index: 3,
  },
  {
    id: '4',
    character: '生',
    image: '',
    jukugo: ['生活', '学生'],
    kanji: '生',
    kunyomi: ['いきる', 'うまれる'],
    meaning: 'Life',
    mnemonic: 'A plant growing from the ground',
    onyomi: 'SEI',
    strokes: 5,
    url: '',
    usedIn: ['牛 (cow)', '一 (one)'],
    lookalikes: ['牛', '主'],
    synonyms: ['life: 生命 生きる 生まれる'],
    index: 4,
  },
  {
    id: '5',
    character: '日',
    image: '',
    jukugo: ['日本', '今日'],
    kanji: '日',
    kunyomi: ['ひ', 'か'],
    meaning: 'Day',
    mnemonic: 'The sun in the sky',
    onyomi: 'NICHI',
    strokes: 4,
    url: '',
    usedIn: ['一 (one)', '口 (mouth)'],
    lookalikes: ['目', '白'],
    synonyms: ['day: 日 日曜日 今日'],
    index: 5,
  },
  {
    id: '6',
    character: '人',
    image: '',
    jukugo: ['人間', '人口'],
    kanji: '人',
    kunyomi: ['ひと'],
    meaning: 'Person',
    mnemonic: 'Two legs walking',
    onyomi: 'JIN',
    strokes: 2,
    url: '',
    usedIn: ['一 (one)', '一 (one)'],
    lookalikes: ['入', '八'],
    synonyms: ['person: 人 人間 人口'],
    index: 6,
  },
  {
    id: '7',
    character: '時',
    image: '',
    jukugo: ['時間', '時代'],
    kanji: '時',
    kunyomi: ['とき'],
    meaning: 'Time',
    mnemonic: 'Time is measured by the sun',
    onyomi: 'JI',
    strokes: 10,
    url: '',
    usedIn: ['日 (sun)', '寺 (temple)'],
    lookalikes: ['持', '待'],
    synonyms: ['time: 時間 時刻 時代'],
    index: 7,
  },
  {
    id: '8',
    character: '年',
    image: '',
    jukugo: ['年齢', '今年'],
    kanji: '年',
    kunyomi: ['とし'],
    meaning: 'Year',
    mnemonic: 'A year of harvest',
    onyomi: 'NEN',
    strokes: 6,
    url: '',
    usedIn: ['禾 (grain)', '千 (thousand)'],
    lookalikes: ['季', '秋'],
    synonyms: ['year: 年 年齢 今年'],
    index: 8,
  },
  {
    id: '9',
    character: '語',
    image: '',
    jukugo: ['言語', '語学'],
    kanji: '語',
    kunyomi: ['かたる'],
    meaning: 'Word',
    mnemonic: 'Words spoken with the mouth',
    onyomi: 'GO',
    strokes: 14,
    url: '',
    usedIn: ['言 (say)', '吾 (I)'],
    lookalikes: ['話', '読'],
    synonyms: ['word: 語 言語 語る'],
    index: 9,
  },
  {
    id: '10',
    character: '書',
    image: '',
    jukugo: ['書物', '書道'],
    kanji: '書',
    kunyomi: ['かく'],
    meaning: 'Write',
    mnemonic: 'Writing with a brush',
    onyomi: 'SHO',
    strokes: 10,
    url: '',
    usedIn: ['聿 (brush)', '曰 (say)'],
    lookalikes: ['画', '昼'],
    synonyms: ['write: 書く 書物 書道'],
    index: 10,
  },
  {
    id: '11',
    character: '読',
    image: '',
    jukugo: ['読書', '読者'],
    kanji: '読',
    kunyomi: ['よむ'],
    meaning: 'Read',
    mnemonic: 'Reading words with the mouth',
    onyomi: 'DOKU',
    strokes: 14,
    url: '',
    usedIn: ['言 (say)', '売 (sell)'],
    lookalikes: ['語', '説'],
    synonyms: ['read: 読む 読書 読者'],
    index: 11,
  },
  {
    id: '12',
    character: '食',
    image: '',
    jukugo: ['食事', '食べ物'],
    kanji: '食',
    kunyomi: ['たべる'],
    meaning: 'Eat',
    mnemonic: 'Food on a plate',
    onyomi: 'SHOKU',
    strokes: 9,
    url: '',
    usedIn: ['人 (person)', '良 (good)'],
    lookalikes: ['飲', '飯'],
    synonyms: ['eat: 食べる 食事 食べ物'],
    index: 12,
  },
  {
    id: '13',
    character: '水',
    image: '',
    jukugo: ['水曜日', '水泳'],
    kanji: '水',
    kunyomi: ['みず'],
    meaning: 'Water',
    mnemonic: 'Flowing water',
    onyomi: 'SUI',
    strokes: 4,
    url: '',
    usedIn: ['氵 (water)', '水 (water)'],
    lookalikes: ['氷', '永'],
    synonyms: ['water: 水 水曜日 水泳'],
    index: 13,
  },
  {
    id: '14',
    character: '火',
    image: '',
    jukugo: ['火曜日', '火事'],
    kanji: '火',
    kunyomi: ['ひ'],
    meaning: 'Fire',
    mnemonic: 'Flames rising',
    onyomi: 'KA',
    strokes: 4,
    url: '',
    usedIn: ['火 (fire)'],
    lookalikes: ['大', '太'],
    synonyms: ['fire: 火 火曜日 火事'],
    index: 14,
  },
  {
    id: '15',
    character: '木',
    image: '',
    jukugo: ['木曜日', '木造'],
    kanji: '木',
    kunyomi: ['き'],
    meaning: 'Tree',
    mnemonic: 'A tree with branches',
    onyomi: 'BOKU',
    strokes: 4,
    url: '',
    usedIn: ['木 (tree)'],
    lookalikes: ['本', '末'],
    synonyms: ['tree: 木 木曜日 木造'],
    index: 15,
  },
  {
    id: '16',
    character: '金',
    image: '',
    jukugo: ['金曜日', '金銭'],
    kanji: '金',
    kunyomi: ['かね'],
    meaning: 'Gold',
    mnemonic: 'Gold in the ground',
    onyomi: 'KIN',
    strokes: 8,
    url: '',
    usedIn: ['王 (king)', '全 (all)'],
    lookalikes: ['銀', '銅'],
    synonyms: ['gold: 金 金曜日 金銭'],
    index: 16,
  },
  {
    id: '17',
    character: '土',
    image: '',
    jukugo: ['土曜日', '土地'],
    kanji: '土',
    kunyomi: ['つち'],
    meaning: 'Earth',
    mnemonic: 'Soil on the ground',
    onyomi: 'DO',
    strokes: 3,
    url: '',
    usedIn: ['土 (earth)'],
    lookalikes: ['士', '王'],
    synonyms: ['earth: 土 土曜日 土地'],
    index: 17,
  },
  {
    id: '18',
    character: '月',
    image: '',
    jukugo: ['月曜日', '月見'],
    kanji: '月',
    kunyomi: ['つき'],
    meaning: 'Moon',
    mnemonic: 'The moon in the sky',
    onyomi: 'GETSU',
    strokes: 4,
    url: '',
    usedIn: ['月 (moon)'],
    lookalikes: ['日', '明'],
    synonyms: ['moon: 月 月曜日 月見'],
    index: 18,
  },
  {
    id: '19',
    character: '車',
    image: '',
    jukugo: ['自動車', '車両'],
    kanji: '車',
    kunyomi: ['くるま'],
    meaning: 'Car',
    mnemonic: 'A wheeled vehicle',
    onyomi: 'SHA',
    strokes: 7,
    url: '',
    usedIn: ['車 (car)'],
    lookalikes: ['東', '楽'],
    synonyms: ['car: 車 自動車 車両'],
    index: 19,
  },
  {
    id: '20',
    character: '電',
    image: '',
    jukugo: ['電気', '電車'],
    kanji: '電',
    kunyomi: [],
    meaning: 'Electricity',
    mnemonic: 'Lightning from the rain',
    onyomi: 'DEN',
    strokes: 13,
    url: '',
    usedIn: ['雨 (rain)', '田 (field)'],
    lookalikes: ['雷', '雪'],
    synonyms: ['electricity: 電 電気 電車'],
    index: 20,
  },
];

// Jukugo details (compound words với thông tin chi tiết)
const jukugoDetails: Record<
  string,
  {
    reading: string;
    composition: string;
    meaning: string;
  }
> = {
  誘導: {
    reading: 'ゆうどう',
    composition: '誘 (invite / entice) + 導 (lead) = 誘導 (lead)',
    meaning:
      'to lead or conduct: A teacher leads the class on the field trip. The policewoman conducts traffic. The nuance is, 誘導 means literally going together with the people to the place.',
  },
  導入: {
    reading: 'どうにゅう',
    composition: '導 (lead) + 入 (put / go in) = 導入 (introduce new concept)',
    meaning:
      'to lead or conduct: A teacher leads the class on the field trip. The policewoman conducts traffic. The nuance is, 誘導 means literally going together with the people to the place.',
  },
  道路: {
    reading: 'どうろ',
    composition: '道 (street) + 路 (road) = 道路 (road)',
    meaning: 'A road or street for vehicles and pedestrians to travel on.',
  },
  道徳: {
    reading: 'どうとく',
    composition: '道 (way) + 徳 (virtue) = 道徳 (morality)',
    meaning: 'Moral principles and ethics that guide human behavior.',
  },
  学校: {
    reading: 'がっこう',
    composition: '学 (study) + 校 (school) = 学校 (school)',
    meaning: 'An institution where students learn and study.',
  },
  学習: {
    reading: 'がくしゅう',
    composition: '学 (study) + 習 (learn) = 学習 (learning)',
    meaning: 'The process of acquiring knowledge or skills through study.',
  },
  生活: {
    reading: 'せいかつ',
    composition: '生 (life) + 活 (active) = 生活 (life)',
    meaning: 'Daily life and living activities.',
  },
  学生: {
    reading: 'がくせい',
    composition: '学 (study) + 生 (life) = 学生 (student)',
    meaning: 'A person who studies at a school or university.',
  },
  日本: {
    reading: 'にほん',
    composition: '日 (sun) + 本 (origin) = 日本 (Japan)',
    meaning: 'Japan, the land of the rising sun.',
  },
  今日: {
    reading: 'きょう',
    composition: '今 (now) + 日 (day) = 今日 (today)',
    meaning: 'This day, the current day.',
  },
  人間: {
    reading: 'にんげん',
    composition: '人 (person) + 間 (between) = 人間 (human)',
    meaning: 'A human being, a person.',
  },
  人口: {
    reading: 'じんこう',
    composition: '人 (person) + 口 (mouth) = 人口 (population)',
    meaning: 'The number of people living in a particular area.',
  },
  時間: {
    reading: 'じかん',
    composition: '時 (time) + 間 (interval) = 時間 (time)',
    meaning: 'A period of time, an hour.',
  },
  時代: {
    reading: 'じだい',
    composition: '時 (time) + 代 (generation) = 時代 (era)',
    meaning: 'An era or period in history.',
  },
  年齢: {
    reading: 'ねんれい',
    composition: '年 (year) + 齢 (age) = 年齢 (age)',
    meaning: 'The number of years a person has lived.',
  },
  今年: {
    reading: 'ことし',
    composition: '今 (now) + 年 (year) = 今年 (this year)',
    meaning: 'The current year.',
  },
  言語: {
    reading: 'げんご',
    composition: '言 (say) + 語 (word) = 言語 (language)',
    meaning: 'A system of communication using words.',
  },
  語学: {
    reading: 'ごがく',
    composition: '語 (word) + 学 (study) = 語学 (language study)',
    meaning: 'The study of languages.',
  },
  書物: {
    reading: 'しょもつ',
    composition: '書 (write) + 物 (thing) = 書物 (book)',
    meaning: 'A written work, a book.',
  },
  書道: {
    reading: 'しょどう',
    composition: '書 (write) + 道 (way) = 書道 (calligraphy)',
    meaning: 'The art of beautiful writing with a brush.',
  },
  読書: {
    reading: 'どくしょ',
    composition: '読 (read) + 書 (write) = 読書 (reading)',
    meaning: 'The act of reading books.',
  },
  読者: {
    reading: 'どくしゃ',
    composition: '読 (read) + 者 (person) = 読者 (reader)',
    meaning: 'A person who reads books or articles.',
  },
  食事: {
    reading: 'しょくじ',
    composition: '食 (eat) + 事 (thing) = 食事 (meal)',
    meaning: 'A meal, eating food.',
  },
  食べ物: {
    reading: 'たべもの',
    composition: '食べ (eat) + 物 (thing) = 食べ物 (food)',
    meaning: 'Food that can be eaten.',
  },
  水曜日: {
    reading: 'すいようび',
    composition: '水 (water) + 曜日 (day of week) = 水曜日 (Wednesday)',
    meaning: 'Wednesday, the third day of the week.',
  },
  水泳: {
    reading: 'すいえい',
    composition: '水 (water) + 泳 (swim) = 水泳 (swimming)',
    meaning: 'The activity of swimming in water.',
  },
  火曜日: {
    reading: 'かようび',
    composition: '火 (fire) + 曜日 (day of week) = 火曜日 (Tuesday)',
    meaning: 'Tuesday, the second day of the week.',
  },
  火事: {
    reading: 'かじ',
    composition: '火 (fire) + 事 (thing) = 火事 (fire)',
    meaning: 'A fire, a conflagration.',
  },
  木曜日: {
    reading: 'もくようび',
    composition: '木 (tree) + 曜日 (day of week) = 木曜日 (Thursday)',
    meaning: 'Thursday, the fourth day of the week.',
  },
  木造: {
    reading: 'もくぞう',
    composition: '木 (tree) + 造 (build) = 木造 (wooden)',
    meaning: 'Made of wood, wooden construction.',
  },
  金曜日: {
    reading: 'きんようび',
    composition: '金 (gold) + 曜日 (day of week) = 金曜日 (Friday)',
    meaning: 'Friday, the fifth day of the week.',
  },
  金銭: {
    reading: 'きんせん',
    composition: '金 (gold) + 銭 (coin) = 金銭 (money)',
    meaning: 'Money, currency.',
  },
  土曜日: {
    reading: 'どようび',
    composition: '土 (earth) + 曜日 (day of week) = 土曜日 (Saturday)',
    meaning: 'Saturday, the sixth day of the week.',
  },
  土地: {
    reading: 'とち',
    composition: '土 (earth) + 地 (ground) = 土地 (land)',
    meaning: 'Land, ground, territory.',
  },
  月曜日: {
    reading: 'げつようび',
    composition: '月 (moon) + 曜日 (day of week) = 月曜日 (Monday)',
    meaning: 'Monday, the first day of the week.',
  },
  月見: {
    reading: 'つきみ',
    composition: '月 (moon) + 見 (see) = 月見 (moon viewing)',
    meaning: 'Viewing the moon, especially during autumn.',
  },
  自動車: {
    reading: 'じどうしゃ',
    composition: '自 (self) + 動 (move) + 車 (car) = 自動車 (automobile)',
    meaning: 'An automobile, a car that moves by itself.',
  },
  車両: {
    reading: 'しゃりょう',
    composition: '車 (car) + 両 (both) = 車両 (vehicle)',
    meaning: 'A vehicle, a railway car.',
  },
  電気: {
    reading: 'でんき',
    composition: '電 (electricity) + 気 (spirit) = 電気 (electricity)',
    meaning: 'Electricity, electric power.',
  },
  電車: {
    reading: 'でんしゃ',
    composition: '電 (electricity) + 車 (car) = 電車 (train)',
    meaning: 'An electric train, a train powered by electricity.',
  },
};

// Lookalikes details
const lookalikesDetails: Record<
  string,
  {
    meaning: string;
    hint: string;
  }
> = {
  豆: {
    meaning: 'Struggle',
    hint: 'Beans',
  },
  音: {
    meaning: 'pitch-black darkness',
    hint: 'SOUND',
  },
  人: {
    meaning: 'clique',
    hint: 'PERSON',
  },
  字: {
    meaning: 'character',
    hint: 'WORD',
  },
  安: {
    meaning: 'cheap',
    hint: 'PEACE',
  },
  牛: {
    meaning: 'cow',
    hint: 'BULL',
  },
  主: {
    meaning: 'master',
    hint: 'OWNER',
  },
  目: {
    meaning: 'eye',
    hint: 'SEE',
  },
  白: {
    meaning: 'white',
    hint: 'CLEAR',
  },
  入: {
    meaning: 'enter',
    hint: 'IN',
  },
  八: {
    meaning: 'eight',
    hint: 'EIGHT',
  },
  持: {
    meaning: 'hold',
    hint: 'HAVE',
  },
  待: {
    meaning: 'wait',
    hint: 'WAIT',
  },
  季: {
    meaning: 'season',
    hint: 'TIME',
  },
  秋: {
    meaning: 'autumn',
    hint: 'FALL',
  },
  話: {
    meaning: 'talk',
    hint: 'SPEAK',
  },
  説: {
    meaning: 'explain',
    hint: 'THEORY',
  },
  飲: {
    meaning: 'drink',
    hint: 'LIQUID',
  },
  飯: {
    meaning: 'meal',
    hint: 'FOOD',
  },
  氷: {
    meaning: 'ice',
    hint: 'COLD',
  },
  永: {
    meaning: 'eternity',
    hint: 'FOREVER',
  },
  大: {
    meaning: 'big',
    hint: 'LARGE',
  },
  太: {
    meaning: 'fat',
    hint: 'THICK',
  },
  本: {
    meaning: 'book',
    hint: 'ORIGIN',
  },
  末: {
    meaning: 'end',
    hint: 'TIP',
  },
  銀: {
    meaning: 'silver',
    hint: 'METAL',
  },
  銅: {
    meaning: 'copper',
    hint: 'BRONZE',
  },
  士: {
    meaning: 'samurai',
    hint: 'WARRIOR',
  },
  王: {
    meaning: 'king',
    hint: 'RULER',
  },
  明: {
    meaning: 'bright',
    hint: 'CLEAR',
  },
  東: {
    meaning: 'east',
    hint: 'ORIENT',
  },
  楽: {
    meaning: 'music',
    hint: 'FUN',
  },
  雷: {
    meaning: 'thunder',
    hint: 'LIGHTNING',
  },
  雪: {
    meaning: 'snow',
    hint: 'WHITE',
  },
};

const KanjiDictionaryPage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const currentKanji = mockKanjiData[currentIndex];
  const totalKanji = mockKanjiData.length;

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalKanji - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSearch = () => {
    // Search logic sẽ được implement sau
    console.log('Search:', searchValue);
  };

  return (
    <div className="kanji-dictionary-page">
      {/* Header Section */}
      <div
        className="kanji-dictionary-header"
        style={{ backgroundImage: `url(${bannerMankai})` }}
      >
        <div className="kanji-dictionary-header-content">
          <h1 className="kanji-dictionary-title">Tra cứu Kanji</h1>
          <div className="kanji-dictionary-search">
            <Input
              placeholder="Tìm kiếm từ vựng"
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              className="kanji-search-input"
              suffix={<SearchOutlined className="search-icon" />}
            />
            <Button
              type="primary"
              className="kanji-search-button"
              onClick={handleSearch}
            >
              Tìm kiếm
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="kanji-dictionary-content">
        {/* Navigation */}
        <div className="kanji-dictionary-navigation">
          <Button
            icon={<LeftOutlined />}
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="kanji-nav-button kanji-nav-prev"
          >
            Quay lại
          </Button>
          <div className="kanji-dictionary-counter">
            Từ vựng {currentKanji.index}/{mockKanjiData.length}
          </div>
          <Button
            icon={<RightOutlined />}
            onClick={handleNext}
            disabled={currentIndex === totalKanji - 1}
            className="kanji-nav-button kanji-nav-next"
          >
            Tiếp theo
          </Button>
        </div>

        {/* Featured Kanji */}
        <div className="kanji-featured">
          <div className="kanji-character-section">
            <span className="kanji-character">{currentKanji.character}</span>
            <span className="kanji-meaning">{currentKanji.meaning}</span>
          </div>
          <div className="kanji-composition">
            {currentKanji.usedIn.join(' + ')}
          </div>
        </div>

        {/* Onyomi Section */}
        <div className="kanji-section">
          <h2 className="kanji-section-title">Onyomi</h2>
          <p className="kanji-section-content">
            {currentKanji.onyomi} • goes Homer as the inanimate carbon rod is
            picked as the leader, again.
          </p>
        </div>

        {/* Kunyomi Section */}
        <div className="kanji-section">
          <h2 className="kanji-section-title">Kunyomi</h2>
          <p className="kanji-section-content">
            {currentKanji.kunyomi.join(' • ')} • to lead or guide - in the sense
            of MORAL guidance, reforming a juvenile delinquent, to lead by
            example, etc
          </p>
        </div>

        {/* Mnemonic Section */}
        <div className="kanji-section">
          <h2 className="kanji-section-title">Mnemonic</h2>
          <p className="kanji-section-content">{currentKanji.mnemonic}</p>
        </div>

        {/* Jukugo Section */}
        <div className="kanji-section">
          <h2 className="kanji-section-title">Jukugo</h2>
          {currentKanji.jukugo.map((jukugo, index) => {
            const detail = jukugoDetails[jukugo];
            if (!detail) return null;
            return (
              <div key={index} className="jukugo-item">
                <h3 className="jukugo-character">{jukugo}</h3>
                <p className="jukugo-reading">Reading: {detail.reading}</p>
                <p className="jukugo-composition">{detail.composition}</p>
                <p className="jukugo-meaning">{detail.meaning}</p>
              </div>
            );
          })}
        </div>

        {/* Lookalikes Section */}
        <div className="kanji-section">
          <h2 className="kanji-section-title">Lookalikes</h2>
          <div className="lookalikes-table">
            <div className="lookalikes-header">
              <div className="lookalikes-header-cell">Ý nghĩa</div>
              <div className="lookalikes-header-cell">Gợi ý</div>
              <div className="lookalikes-header-cell">Kanji</div>
            </div>
            {currentKanji.lookalikes.map((lookalike, index) => {
              const detail = lookalikesDetails[lookalike];
              if (!detail) return null;
              return (
                <div key={index} className="lookalikes-row">
                  <div className="lookalikes-cell">{detail.meaning}</div>
                  <div className="lookalikes-cell">{detail.hint}</div>
                  <div className="lookalikes-cell lookalikes-kanji">
                    {lookalike}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="lookalikes-explanations">
            <p>
              BEANS make you struggle with farts, and you hear the SOUND even in
              a pitch-black room.
            </p>
            <p>Cliques are made of a PERSON or people!</p>
          </div>
        </div>

        {/* Synonyms Section */}
        <div className="kanji-section">
          <h2 className="kanji-section-title">Synonyms</h2>
          {currentKanji.synonyms.map((synonym, index) => (
            <div key={index} className="synonym-item">
              <p className="synonym-content">{synonym}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KanjiDictionaryPage;
