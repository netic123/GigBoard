import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Pages
import HomePage from './pages/HomePage';
import GigDetailPage from './pages/GigDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyGigsPage from './pages/MyGigsPage';
import CreateGigPage from './pages/CreateGigPage';
import GigApplicationsPage from './pages/GigApplicationsPage';
import MyApplicationsPage from './pages/MyApplicationsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/gig/:id" element={<GigDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/linkedin/callback" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Candidate routes */}
          <Route path="/my-applications" element={<MyApplicationsPage />} />
          
          {/* Employer routes */}
          <Route path="/my-gigs" element={<MyGigsPage />} />
          <Route path="/create-gig" element={<CreateGigPage />} />
          <Route path="/gig/:id/applications" element={<GigApplicationsPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
