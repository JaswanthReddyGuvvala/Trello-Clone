import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await login();
      navigate('/');
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  if (user) navigate('/');

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center bg-white p-12 rounded-2xl shadow-xl border border-gray-200 text-center max-w-sm w-full">
        
        <h1 className="text-4xl font-black text-blue-700 mb-4 tracking-tight">
          Trello Clone
        </h1>
        
        <p className="text-gray-500 mb-10 text-lg">
          Manage your projects efficiently.
        </p>

        <button 
          onClick={handleLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition duration-200 transform active:scale-95 shadow-md"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default Login;