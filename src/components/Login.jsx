import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

const Login = () => {
  const { users, login } = useAppContext();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !password.trim()) {
      setError('이름과 비밀번호를 모두 입력해주세요.');
      return;
    }

    const foundUser = users.find(u => u.name === name.trim());

    if (!foundUser) {
      setError('이름을 찾을 수 없습니다.');
      return;
    }

    const userPassword = foundUser.password || '1234'; // DB에 비밀번호가 없으면 초기값 1234
    if (userPassword !== password) {
      setError('비밀번호가 틀렸습니다.');
      return;
    }

    login(foundUser.id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-black text-indigo-900 mb-2">우리 반 나라</h1>
          <p className="text-indigo-500 font-bold">학급 경영 시스템에 오신 것을 환영합니다!</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-8 border border-indigo-100 space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">이름</label>
            <input
              type="text"
              placeholder="이름을 입력하세요"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all text-lg"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">비밀번호</label>
            <input
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all text-lg"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm font-bold text-center bg-red-50 p-3 rounded-xl">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-4 bg-indigo-600 text-white font-bold text-lg rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-[0.98]"
          >
            로그인
          </button>
        </form>

        <p className="text-center text-xs text-gray-400">
          초기 비밀번호는 <strong>1234</strong> 입니다.
        </p>
      </div>
    </div>
  );
};

export default Login;
