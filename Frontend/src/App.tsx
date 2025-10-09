import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import UserProfileFormClass from './components/forms/UserProfileForm';

function App() {
  return (
    <Router>
      <>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={<UserProfileFormClass />}
          />
        </Routes>
      </>
    </Router>
  );
}

export default App;
