import React from 'react';
import {
  IonHeader, IonToolbar, IonButtons, IonMenuButton,
  IonTitle, IonIcon, IonBadge, IonAvatar, IonLabel
} from '@ionic/react';
import { notificationsOutline, searchOutline } from 'ionicons/icons';
import './Header.css';
import { getAuthData } from '../utility/authUtils';
const { user } = getAuthData();
interface HeaderProps {
  title: string;
  details?: string;
}

const Header: React.FC<HeaderProps> = ({ title, details }) => {
  return (
    <IonHeader className="ion-no-border main-header">
      <IonToolbar>
        <IonButtons slot="start">
          <IonMenuButton color="dark" />
        </IonButtons>

        <div className="header-title-container">
          <IonTitle className="header-title">{title}</IonTitle>
          {details && <p className="header-details">{details}</p>}
        </div>

        <IonButtons slot="end" className="header-actions">
          {/* Search and Notification always visible */}
          <div className="action-icon search-box">
            <IonIcon icon={searchOutline} />
          </div>

          <div className="action-icon notification-wrapper">
            <IonIcon icon={notificationsOutline} />
            <span className="badge-dot">3</span>
          </div>

          {/* User Profile - Text hidden on mobile */}
          <div className="user-profile">
            <div className="user-info hide-mobile">
              <span className="user-email">{user?.email}</span>
              <span className="user-role">AD</span>
            </div>
            <IonAvatar className="header-avatar">
              <img src={`https://ui-avatars.com/api/?name=${user?.email || 'Admin'}&background=0D8ABC&color=fff`} alt="avatar" />
            </IonAvatar>
          </div>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  );
};

export default Header;