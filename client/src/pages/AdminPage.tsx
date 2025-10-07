import React from 'react';
import { Navigate } from 'react-router-dom';
import AdminDashboard from '../components/AdminDashboard';

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

interface AdminPageProps {
  user: User | null;
}

const AdminPage: React.FC<AdminPageProps> = ({ user }) => {
  if (!user || user.role !== 'admin') {
    return <Navigate to="/create" replace />;
  }

  return <AdminDashboard user={user} onBack={() => {}} />;
};

export default AdminPage;

