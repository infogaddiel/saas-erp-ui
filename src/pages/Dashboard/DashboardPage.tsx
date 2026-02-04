import React from 'react';
import { 
  IonContent, IonHeader, IonPage, IonToolbar, IonButtons, 
  IonMenuButton, IonAvatar, IonBadge, IonGrid, IonRow, IonCol 
} from '@ionic/react';
import { Bell } from 'lucide-react';

interface DashboardPageProps {
  user: { name: string; email: string };
  notificationCount: number;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ user, notificationCount }) => {
  return (
    <IonPage>
      <IonHeader className="ion-no-border dashboard-header">
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton color="primary" />
          </IonButtons>
          
          <div className="header-content" slot="end">
            <div className="notification-bell">
              <Bell size={20} />
              {notificationCount > 0 && (
                <IonBadge color="danger">{notificationCount}</IonBadge>
              )}
            </div>
            
            <div className="user-profile">
              <div className="user-text">
                <span className="name">{user.name}</span>
                <span className="email">{user.email}</span>
              </div>
              <IonAvatar className="profile-avatar">
                <div className="avatar-placeholder">
                  {user.name.substring(0, 2).toUpperCase()}
                </div>
              </IonAvatar>
            </div>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding gray-bg">
        <div className="dashboard-intro">
          <h1>Tickets Summary</h1>
          <p>Welcome back, here is your overview for today.</p>
        </div>

        <IonGrid>
          <IonRow>
            {/* Example of how you will list the 30+ complex items/stats */}
            <IonCol size="12" sizeMd="4">
              <div className="stat-card">
                <h3>Open Tickets</h3>
                <p className="stat-number">12</p>
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default DashboardPage;