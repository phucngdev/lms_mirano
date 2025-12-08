import './Highligh.scss';

const Highligh = () => {
  return (
    <section className="highlight">
      <div className="highlight-container">
        <div className="highlight-content">
          <div className="highlight-left">
            <div className="highlight-slogan">
              <h2 className="slogan-line">Chinh phục kỳ thi,</h2>
              <h2 className="slogan-line">mở khóa tri thức</h2>
              <h2 className="slogan-line">
                cùng <span className="slogan-brand">Mirano Academy</span>
              </h2>
            </div>
          </div>
          <div className="highlight-right">
            <div className="highlight-description">
              <p className="description-text">
                Trải nghiệm học tập sinh động, luyện thi hiệu quả và đánh giá
                năng lực toàn diện chỉ với Mirano Academy. Giúp bạn tự tin chinh
                phục mọi kỳ thi và nâng cao kỹ năng học tập.
              </p>
            </div>
            <div className="highlight-stats">
              <div className="stat-block">
                <div className="stat-number">5.000+</div>
                <div className="stat-line"></div>
                <div className="stat-text">bài học & đề thi trực tuyến</div>
              </div>
              <div className="stat-block">
                <div className="stat-number">98%</div>
                <div className="stat-line"></div>
                <div className="stat-text">
                  học viên tự tin hơn sau khi ôn luyện
                </div>
              </div>
              <div className="stat-block">
                <div className="stat-number">1.000+</div>
                <div className="stat-line"></div>
                <div className="stat-text">
                  học viên đã đạt kết quả cao trong các kỳ thi
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Highligh;
