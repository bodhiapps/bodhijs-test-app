import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage';
import CallbackPage from '@/pages/CallbackPage';
import ApiTestPage from '@/pages/ApiTestPage';

function App() {
  // Get the base name from the environment - matches the vite base config
  const basename = import.meta.env.MODE === 'production' ? '/bodhijs-test-app' : '';
  
  return (
    <Router basename={basename}>
      <div className="App" style={{ padding: '2rem', textAlign: 'center' }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/callback" element={<CallbackPage />} />
          <Route path="/api-test" element={<ApiTestPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
