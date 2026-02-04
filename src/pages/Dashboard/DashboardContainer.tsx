import React, { useState, useEffect } from 'react';
import DashboardPage from './DashboardPage';
import './Dashboard.css';

const DashboardContainer: React.FC = () => {
  // Senior Dev Note: These states will be populated via API calls later
  const [userData, setUserData] = useState({
    name: 'Admin',
    email: 'admin@gaddiel.io'
  });
  const [notifCount, setNotifCount] = useState(3);

  useEffect(() => {
    // This is where you'd call: 
    // const data = await api.getDashboardStats();
  }, []);

  return (
    <DashboardPage 
      user={userData} 
      notificationCount={notifCount} 
    />
  );
};

export default DashboardContainer;