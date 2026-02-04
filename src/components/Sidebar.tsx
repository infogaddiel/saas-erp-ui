import React from 'react';
import { 
  IonContent, IonList, IonItem, IonIcon, IonLabel, IonMenu, IonNote 
} from '@ionic/react';
import { useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingCart, Users, FileText, 
  Ticket, Package, Calculator, Briefcase, Settings, LogOut 
} from 'lucide-react';

import { useIonAlert } from '@ionic/react';
import './Sidebar.css';

interface SidebarProps {
  onLogout: () => void;
}
const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const location = useLocation();
    const [presentAlert] = useIonAlert();

  const confirmLogout = () => {
    presentAlert({
      header: 'Logout',
      message: 'Are you sure you want to sign out of Gaddiel HVAC?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Logout', role: 'destructive', handler: onLogout },
      ],
    });
  };
  const menuItems = [
    { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { title: 'Sales', path: '/dashboard/sales', icon: ShoppingCart },
    { title: 'Staff & Technicians', path: '/dashboard/staff', icon: Users },
    { title: 'Ticketing', path: '/dashboard/tickets', icon: Ticket },
    { title: 'Inventory', path: '/dashboard/inventory', icon: Package },
    { title: 'Accounting', path: '/dashboard/accounts', icon: Calculator },
    { title: 'Projects', path: '/dashboard/projects', icon: Briefcase },
    { title: 'Setup', path: '/dashboard/setup', icon: Settings },
  ];

  return (
    <IonMenu contentId="main-content" type="overlay" className="custom-sidebar">
      <IonContent className="ion-no-padding">
        <div className="sidebar-header">
          <div className="logo-box">G</div>
          <div className="brand-text">
            <h3>Gaddiel HVAC</h3>
            <p>Contractor Portal</p>
          </div>
        </div>

        <IonList id="nav-list" lines="none">
          {menuItems.map((item, index) => (
            <IonItem 
              key={index}
              routerLink={item.path}
              className={location.pathname === item.path ? 'nav-item active' : 'nav-item'}
              detail={false}
            >
              <item.icon size={20} slot="start" />
              <IonLabel>{item.title}</IonLabel>
            </IonItem>
          ))}
        </IonList>

        <div className="sidebar-footer">
          <IonItem button lines="none" className="logout-item" onClick={confirmLogout}>
           <LogOut size={20} slot="start" color="danger" />
            <IonLabel color="danger">Logout</IonLabel>
          </IonItem>
        </div>
      </IonContent>
    </IonMenu>
  );
};

export default Sidebar;