import React from 'react';
import { useNavigate } from 'react-router-dom';
import Login from '../components/Login';

interface User {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
  lastLogin?: string;
  avatarUrl?: string;
}

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const navigate = useNavigate();

  const handleLogin = (userData: User) => {
    onLogin(userData);
    navigate('/create');
  };

  return (
    <Login
      onLogin={handleLogin}
      onSwitchToRegister={() => navigate('/register')}
      onBack={() => navigate('/')}
    />
  );
};

export default LoginPage;

