import React, { useState } from 'react';
import { useIonRouter } from '@ionic/react';
import OtpPage from './OtpPage';
import { authService } from '../../api/authService';

interface Props { onOtpSuccess: () => void; }

const OtpContainer: React.FC<Props> = ({ onOtpSuccess }) => {
  const [otp, setOtp] = useState('');
  const router = useIonRouter();

  const handleVerify = async (code: string) => {
    try {
    await authService.verifyOtp(otp);
    // Move temp token to official auth token
    const token = localStorage.getItem('temp_token');
    localStorage.setItem('auth_token', token!);
    localStorage.removeItem('temp_token');
    onOtpSuccess();
      router.push('/dashboard', 'root', 'replace');
  } catch (err: any) {
    alert("Invalid OTP");
  }
    
  };

  return <OtpPage otp={otp} setOtp={setOtp} onVerify={handleVerify} />;
};

export default OtpContainer;