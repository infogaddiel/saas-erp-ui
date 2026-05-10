import React, { useState, useEffect } from 'react';
import { IonSelect, IonSelectOption, IonItem, IonLabel, IonList, IonPage, IonHeader, IonToolbar, IonButtons, IonContent } from '@ionic/react';
import DashboardPage from './DashboardPage';
import FinanceDashboard from './FinanceDashboard'; // Import your new finance component
import './Dashboard.css';
import Header from '../../components/Header';

const DashboardContainer: React.FC = () => {
  const [userData] = useState({
    name: 'Admin',
    email: 'admin@gaddiel.io'
  });
  const [notifCount] = useState(3);

  // View state: 'main' or 'finance'
  const [activeView, setActiveView] = useState<'main' | 'finance'>('main');

  return (
    <IonPage>
      {/* Static Main Header */}
      <Header title="Dashboard" details="System Overview & Analytics" />

      {/* Sub-Header for the Switcher - This ensures visibility */}
      <IonHeader className="ion-no-border">
        <IonToolbar className="sub-header-toolbar">
          <IonButtons slot="end">
            <IonItem lines="none" className="view-select-item">
              <IonLabel className="hide-mobile">View Mode:</IonLabel>
              <IonSelect
                value={activeView}
                interface="popover"
                onIonChange={e => setActiveView(e.detail.value)}
                className="custom-select"
              >
                <IonSelectOption value="main">General Overview</IonSelectOption>
                <IonSelectOption value="finance">Financial Dashboard</IonSelectOption>
              </IonSelect>
            </IonItem>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="gray-bg">
        {/* Conditional Rendering inside the scrollable content area */}
        <div className="view-content-wrapper">
          {activeView === 'main' ? (
            <DashboardPage
              user={userData}
              notificationCount={notifCount}
            />
          ) : (
            <FinanceDashboard />
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default DashboardContainer;