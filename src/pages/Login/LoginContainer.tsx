import React, { useState } from 'react';
import { useIonRouter } from '@ionic/react';
import LoginPage from './LoginPage';
import './Login.css';
import { authService } from '../../api/authService';

interface LoginContainerProps {
  onLoginSuccess: () => void;
}
const LoginContainer: React.FC<LoginContainerProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await authService.login(email, password);
      localStorage.setItem('temp_token', data.token);
      onLoginSuccess();
    } catch (err: any) {
      alert("Login failed");
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