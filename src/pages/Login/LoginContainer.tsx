import React, { useState } from 'react';
import { useIonRouter } from '@ionic/react';
import LoginPage from './LoginPage';
import './Login.css';
import { authService } from '../../api/authService';

interface LoginContainerProps {
  onLoginSuccess: (otpRequired: boolean) => void;
}
const LoginContainer: React.FC<LoginContainerProps> = ({ onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const router = useIonRouter();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // 1. Determine if input is Email or Mobile
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const isMobile = /^\d+$/.test(identifier); // Simple check if it's all digits

    // 2. Prepare dynamic payload
    const loginPayload: any = { password };

    if (isEmail) {
      loginPayload.email = identifier;
    } else if (isMobile) {
      loginPayload.mobile = identifier;
    } else {
      // Fallback or validation error
      alert("Please enter a valid email or mobile number");
      return;
    }
    try {

      const data: any = await authService.login(loginPayload);
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
      setEmail={setIdentifier}
      setPassword={setPassword}
    />
  );
};

export default LoginContainer;