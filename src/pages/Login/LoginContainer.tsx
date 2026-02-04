import React, { useState } from 'react';
import { useIonRouter } from '@ionic/react';
import LoginPage from './LoginPage';
import './Login.css';

interface LoginContainerProps {
  onLoginSuccess: () => void;
}
const LoginContainer: React.FC<LoginContainerProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (email && password) {
      console.log("Login state changing...");
      // This triggers the App.tsx state change
      onLoginSuccess();
    }
  };

  return (
    <LoginPage 
      onLogin={handleLogin} 
      setEmail={setEmail} 
      setPassword={setPassword} 
    />
  );
};

export default LoginContainer;