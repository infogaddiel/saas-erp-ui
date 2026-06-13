import React from 'react';
import { IonContent, IonPage, IonButton, IonInput, IonText } from '@ionic/react';
import { Building2, Hash, User, Phone, Mail, Lock } from 'lucide-react';
import logo from '../../assets/logo.png';
import { Link } from 'react-router-dom';

interface RegisterPageProps {
  onRegister: (e: React.FormEvent) => void;
  onChange: (field: string, val: string) => void;
  loading: boolean;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister, onChange, loading }) => {
  return (
    <IonPage>
      <IonContent scrollY={true} className="register-background">
        <div className="register-overlay">
          <div className="register-card">
            <div className="register-logo-container">
              <img src={logo} alt="Logo" className="register-logo" />
            </div>

            <div className="register-header">
              <h1>Register Your Company</h1>
              <p>Create your account to get started</p>
            </div>

            <form onSubmit={onRegister}>
              <p className="register-section-label">Company Details</p>

              <div className="input-group">
                <IonInput
                  placeholder="Company Name"
                  type="text"
                  onIonInput={(e) => onChange('company_name', e.detail.value!)}
                  className="custom-input"
                >
                  <span slot="start">
                    <Building2 size={18} className="input-icon" />
                  </span>
                </IonInput>
              </div>

              <div className="input-group">
                <IonInput
                  placeholder="Company Code (3 characters, e.g. ABC)"
                  type="text"
                  maxlength={3}
                  onIonInput={(e) => onChange('company_code', e.detail.value!)}
                  className="custom-input"
                >
                  <span slot="start">
                    <Hash size={18} className="input-icon" />
                  </span>
                </IonInput>
              </div>
              <p className="company-code-hint">Unique 3-letter identifier for your company</p>

              <p className="register-section-label">Admin Details</p>

              <div className="input-group">
                <IonInput
                  placeholder="Your Full Name"
                  type="text"
                  onIonInput={(e) => onChange('name', e.detail.value!)}
                  className="custom-input"
                >
                  <span slot="start">
                    <User size={18} className="input-icon" />
                  </span>
                </IonInput>
              </div>

              <div className="input-group">
                <IonInput
                  placeholder="Mobile Number"
                  type="tel"
                  onIonInput={(e) => onChange('mobile', e.detail.value!)}
                  className="custom-input"
                >
                  <span slot="start">
                    <Phone size={18} className="input-icon" />
                  </span>
                </IonInput>
              </div>

              <div className="input-group">
                <IonInput
                  placeholder="Email (optional)"
                  type="email"
                  onIonInput={(e) => onChange('email', e.detail.value!)}
                  className="custom-input"
                >
                  <span slot="start">
                    <Mail size={18} className="input-icon" />
                  </span>
                </IonInput>
              </div>

              <div className="input-group">
                <IonInput
                  placeholder="Password"
                  type="password"
                  onIonInput={(e) => onChange('password', e.detail.value!)}
                  className="custom-input"
                >
                  <span slot="start">
                    <Lock size={18} className="input-icon" />
                  </span>
                </IonInput>
              </div>

              <div className="input-group">
                <IonInput
                  placeholder="Confirm Password"
                  type="password"
                  onIonInput={(e) => onChange('confirm_password', e.detail.value!)}
                  className="custom-input"
                >
                  <span slot="start">
                    <Lock size={18} className="input-icon" />
                  </span>
                </IonInput>
              </div>

              <IonButton expand="block" type="submit" className="register-btn" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
              </IonButton>
            </form>

            <div className="register-footer">
              <IonText color="medium">
                Already have an account?{' '}
              </IonText>
              <IonText color="primary">
                <Link to="/login">Sign in</Link>
              </IonText>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default RegisterPage;
