import React from 'react';
import { useAppContext } from './context/AppContext';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import PublicHome from './components/PublicHome';

function AppContent() {
  const { currentUser } = useAppContext();

  if (currentUser) {
    if (currentUser.type === 'admin') {
      return (
        <div className="min-h-screen w-full bg-gray-50">
          <AdminDashboard />
        </div>
      );
    }

    return (
      <div className="min-h-screen w-full bg-gray-50">
        <PublicHome />
      </div>
    );
  }

  return <Login />;
}

function App() {
  return <AppContent />;
}

export default App;
