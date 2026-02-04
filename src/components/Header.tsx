import React from 'react';
import { 
  IonHeader, IonToolbar, IonButtons, IonMenuButton, 
  IonTitle, IonIcon, IonBadge, IonAvatar, IonLabel 
} from '@ionic/react';
import { notificationsOutline, searchOutline } from 'ionicons/icons';
import './Header.css';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <IonHeader className="ion-no-border main-header">
      <IonToolbar>
        {/* Toggle Sidebar for Mobile/Tablet */}
        <IonButtons slot="start">
          <IonMenuButton color="dark" />
        </IonButtons>

        <IonTitle className="header-title">{title}</IonTitle>

        {/* Right Side Icons & Profile */}
        <IonButtons slot="end" className="header-actions">
          <div className="search-box">
            <IonIcon icon={searchOutline} />
          </div>
          
          <div className="notification-wrapper">
            <IonIcon icon={notificationsOutline} />
            <span className="badge-dot">3</span>
          </div>

          <div className="user-profile">
            <div className="user-info">
              <span className="user-email">Admin@gaddiel.io</span>
              <span className="user-role">AD</span>
            </div>
            <IonAvatar className="header-avatar">
              <img src="https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff" alt="avatar" />
            </IonAvatar>
          </div>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  );
};

export default Header;