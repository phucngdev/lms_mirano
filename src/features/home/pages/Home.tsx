import Banner from '../components/banner/Banner';
import Highligh from '../components/highlight/Highligh';
import Rank from '../components/rank/Rank';
import Courses from '../components/courses/Courses';
import Application from '../components/application/Application';

const Home = () => {
  return (
    <>
      <Banner />
      <Courses />
      <Application />
      <Highligh />
      <Rank />
    </>
  );
};

export default Home;
