import React, { useState } from 'react';
import { useIonRouter } from '@ionic/react';
import LoginPage from './LoginPage';
import './Login.css';
import { authService } from '../../api/authService';

interface LoginContainerProps {
  onLoginSuccess: (otpRequired: boolean) => void;
}
const LoginContainer: React.FC<LoginContainerProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
 const router = useIonRouter();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data: any = await authService.login(email, password);
      // 2. Store User Details (Name, Email, Role)
      localStorage.setItem('user', JSON.stringify(data.user));
      const flattenedPermissions = data.user.permissions.map((p: any) => p.menu.name);
      // 3. Store Permissions Array
      localStorage.setItem('permissions', JSON.stringify(flattenedPermissions));
      if (!data.user.is_otp_auth_required) {
        // CASE: OTP NOT REQUIRED
        localStorage.setItem('auth_token', data.token!);
        localStorage.removeItem('temp_token');
        onLoginSuccess(false); // Signal that OTP is skipped
        router.push('/dashboard', 'root', 'replace');
      } else {
        // CASE: OTP REQUIRED
        localStorage.setItem('temp_token', data.token);
        onLoginSuccess(true); // Signal that OTP is required
      }
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