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

  const handleRegister = (userData: any) => {
    // بعد التسجيل، نحول للـ OTP page بدلاً من تسجيل الدخول مباشرة
    if (userData.userId && userData.email) {
      // هذا من الـ response الجديد (userId + email)
      navigate('/verify-otp', { 
        state: { 
          userId: userData.userId, 
          email: userData.email 
        } 
      });
    } else {
      // للتوافق مع الكود القديم
      onRegister(userData);
      navigate('/create');
    }
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

