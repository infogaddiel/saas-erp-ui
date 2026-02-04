import React from 'react';
import { IonContent, IonPage, IonButton, IonInput, IonText } from '@ionic/react';
import './Otp.css';

interface OtpPageProps {
  onVerify: (otp: string) => void;
  otp: string;
  setOtp: (val: string) => void;
}

const OtpPage: React.FC<OtpPageProps> = ({ onVerify, otp, setOtp }) => {
  return (
    <IonPage>
      <IonContent className="login-background">
        <div className="login-overlay">
          <div className="login-card">
            <div className="login-header">
              <h1>Verify OTP</h1>
              <p>Enter the 6-digit code sent to your email.</p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); onVerify(otp); }}>
              <div className="input-group">
                <IonInput
                  className="custom-input"
                  type="number"
                  placeholder="000000"
                  value={otp}
                  onIonInput={(e) => setOtp(e.detail.value!)}
                  maxlength={6}
                  required
                />
              </div>

              <IonButton expand="block" type="submit" className="login-btn">
                Verify & Continue
              </IonButton>
            </form>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default OtpPage;