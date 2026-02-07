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
      const data: any = await authService.login(email, password);
      localStorage.setItem('temp_token', data.token);
      // 2. Store User Details (Name, Email, Role)
      localStorage.setItem('user', JSON.stringify(data.user));
      const flattenedPermissions = data.user.permissions.map((p: any) => p.menu.name);
      // 3. Store Permissions Array
      localStorage.setItem('permissions', JSON.stringify(flattenedPermissions));
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