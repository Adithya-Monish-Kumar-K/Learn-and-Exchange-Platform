import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SkillExchange from './pages/LandingPage';
import Chat from './pages/Chat';
import TaskList from "./components/TaskList";
import TaskStatsChart from "./components/TaskStatsChart";

function App() {
  return (
    <Router>
      <>
        <Routes>
          <Route path="/" element={<SkillExchange />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/tasks" element={<TaskList />} />
          <Route path="/task-stats" element={<TaskStatsChart />} />
        </Routes>
      </>
    </Router>
  );
}

export default App;