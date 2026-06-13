import React from 'react';
import { IonContent, IonPage, IonButton, IonInput, IonText } from '@ionic/react';
import { User, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import semakLogo from '../../assets/logo.png';

interface LoginPageProps {
  onLogin: (e: React.FormEvent) => void;
  setEmail: (val: string) => void;
  setPassword: (val: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, setEmail, setPassword }) => {
  return (
    <IonPage>
      <IonContent scrollY={false} className="login-background">
        <div className="login-overlay">
          <div className="login-card">
            <div className="login-logo-container">
          <img src={semakLogo} alt="Semak Logo" className="login-logo" />
        </div>
            <div className="login-header">
              <h1>Welcome Back!</h1>
              <p>Sign in to your account</p>
            </div>

            <form onSubmit={onLogin}>
              <div className="input-group">
                <IonInput 
                  placeholder="Email or Mobile Number" 
                  type="text" 
                  inputmode="email"
                  onIonInput={(e) => setEmail(e.detail.value!)}
                  className="custom-input"
                >
                  <span slot="start">
                  <User size={18} className="input-icon" />
                  </span>
                </IonInput>
              </div>

              <div className="input-group">
                <IonInput 
                  placeholder="Password" 
                  type="password" 
                  onIonInput={(e) => setPassword(e.detail.value!)}
                  className="custom-input"
                >
                  <span slot="start">
                  <Lock size={18}  className="input-icon" />
                  </span>
                </IonInput>
              </div>

              <IonButton expand="block" type="submit" className="login-btn">
                Login
              </IonButton>
            </form>

            <div className="login-footer">
              <IonText color="primary">
                <a href="#">Forgot Password?</a>
              </IonText>
              <div style={{ marginTop: '12px' }}>
                <IonText color="medium">New here? </IonText>
                <IonText color="primary">
                  <Link to="/register">Register your company</Link>
                </IonText>
              </div>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;