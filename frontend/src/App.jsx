import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PatientAlertForm from './pages/PatientAlertForm';
import ActiveEmergency from './pages/ActiveEmergency';
import ResponderDashboard from './pages/ResponderDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        {/* Simple Header */}
        <header className="bg-red-600 text-white p-4 shadow-md sticky top-0 z-50">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <span className="text-3xl">🚨</span> EmergencyConnect
            </h1>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<Navigate to="/patient/alert" replace />} />

            {/* Patient Routes */}
            <Route path="/patient/alert" element={<PatientAlertForm />} />
            <Route path="/patient/active/:id" element={<ActiveEmergency />} />

            {/* Responder Dashboard */}
            <Route path="/responder/dashboard" element={<ResponderDashboard />} />

            {/* 404 */}
            <Route path="*" element={
              <div className="text-center mt-20">
                <h2 className="text-2xl font-bold">404 - Page Not Found</h2>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
