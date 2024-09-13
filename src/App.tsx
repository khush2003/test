// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/login';
import DashboardPage from './pages/dashboard';
import ProfilePage from './pages/profile';
import GamePage from './pages/game';
import HelpPage from './pages/help';
import RegisterPage from './pages/register';

// Import your page components
// import Dashboard from './pages/Dashboard/Dashboard';
// import Profile from './pages/Profile/Profile';
// import LearningResources from './pages/LearningResources/LearningResources';
// import Game from './pages/Game/Game';
// import Help from './pages/Help/Help';
// import NavBar from './components/NavBar/NavBar'; // Common navigation bar

const App: React.FC = () => {
  return (
    <Router>
      {/* <NavBar /> Common navigation bar */}
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="*" element={<div>Not Found</div>} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </Router>
  );
};

export default App;
