import React from 'react';
import { 
  IonContent, IonHeader, IonPage, IonToolbar, IonButtons, 
  IonMenuButton, IonAvatar, IonBadge, IonGrid, IonRow, IonCol 
} from '@ionic/react';
import { Bell } from 'lucide-react';
import Header from '../../components/Header';

interface DashboardPageProps {
  user: { name: string; email: string };
  notificationCount: number;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ user, notificationCount }) => {
  return (
    <IonPage>
      <Header title="Dashboard" />

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