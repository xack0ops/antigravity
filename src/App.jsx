import React from 'react';
import { useAppContext } from './context/AppContext';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import PublicHome from './components/PublicHome';

const AppContent = () => {
  const { currentUser, loading } = useAppContext();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-bold animate-pulse">데이터를 불러오는 중입니다...</p>
      </div>
    );
  }

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
