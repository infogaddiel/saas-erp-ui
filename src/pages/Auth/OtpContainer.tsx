import React, { useState } from 'react';
import { useIonRouter } from '@ionic/react';
import OtpPage from './OtpPage';

interface Props { onOtpSuccess: () => void; }

const OtpContainer: React.FC<Props> = ({ onOtpSuccess }) => {
  const [otp, setOtp] = useState('');
  const router = useIonRouter();

  const handleVerify = (code: string) => {
    // Logic: In production, call Axios to verify the OTP
    if (code === '123456') { // Mock verification
      onOtpSuccess();
      router.push('/dashboard', 'root', 'replace');
    } else {
      alert("Invalid OTP. Try 123456");
    }
  };

  return <OtpPage otp={otp} setOtp={setOtp} onVerify={handleVerify} />;
};

export default OtpContainer;