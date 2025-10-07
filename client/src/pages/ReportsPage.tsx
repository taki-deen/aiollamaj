import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserReports from '../components/UserReports';

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

interface ReportsPageProps {
  user: User;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ user }) => {
  const navigate = useNavigate();

  const handleUploadNew = () => {
    navigate('/create');
  };

  return <UserReports user={user} onUploadNew={handleUploadNew} />;
};

export default ReportsPage;

