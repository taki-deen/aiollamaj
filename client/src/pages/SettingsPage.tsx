import React from 'react';
import UserSettings from '../components/UserSettings';

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

interface SettingsPageProps {
  user: User;
  onUserUpdate: (user: User) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ user, onUserUpdate }) => {
  return <UserSettings user={user} onBack={() => {}} onUserUpdate={onUserUpdate} />;
};

export default SettingsPage;

