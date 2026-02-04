import React from 'react';
import { IonContent, IonPage, IonButton, IonInput, IonText } from '@ionic/react';
import { User, Lock } from 'lucide-react';

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
            <div className="login-header">
              <h1>Welcome Back!</h1>
              <p>Sign in to your account</p>
            </div>

            <form onSubmit={onLogin}>
              <div className="input-group">
                <IonInput 
                  placeholder="Email Address" 
                  type="email" 
                  onIonInput={(e) => setEmail(e.detail.value!)}
                  className="custom-input"
                >
                  <User size={18} slot="start" className="input-icon" />
                </IonInput>
              </div>

              <div className="input-group">
                <IonInput 
                  placeholder="Password" 
                  type="password" 
                  onIonInput={(e) => setPassword(e.detail.value!)}
                  className="custom-input"
                >
                  <Lock size={18} slot="start" className="input-icon" />
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
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;