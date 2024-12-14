import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/Homepage';
import MovieDataAnalysis from './components/MovieDataAnalysis';
import './App.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/movie/:movieTitle" element={<MovieDataAnalysis />} />
      </Routes>
    </Router>
  );
};

export default App;
