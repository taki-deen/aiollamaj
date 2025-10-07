import React from 'react';
import { useNavigate } from 'react-router-dom';
import Register from '../components/Register';

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

interface RegisterPageProps {
  onRegister: (user: User) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister }) => {
  const navigate = useNavigate();

  const handleRegister = (userData: User) => {
    onRegister(userData);
    navigate('/create');
  };

  return (
    <Register
      onRegister={handleRegister}
      onSwitchToLogin={() => navigate('/login')}
      onBack={() => navigate('/')}
    />
  );
};

export default RegisterPage;

