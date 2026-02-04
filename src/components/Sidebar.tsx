import React, { useState } from 'react';
import { 
  IonContent, IonList, IonItem, IonIcon, IonLabel, IonMenu, 
  IonAccordion, IonAccordionGroup 
} from '@ionic/react';
import { 
  LayoutDashboard, ShoppingCart, Users, Ticket, 
  Package, Calculator, Briefcase, Settings, LogOut, ChevronDown 
} from 'lucide-react';
import './Sidebar.css';

interface SidebarProps {
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  return (
    <IonMenu contentId="main-content" type="overlay" className="custom-sidebar">
      <IonContent className="ion-no-padding">
        <div className="sidebar-header">
          <div className="logo-box">S</div>
          <div className="brand-text">
            <h3>SEMAK ERP</h3>
            <p>Ticketing & Support</p>
          </div>
        </div>

        <IonList id="nav-list" lines="none">
          {/* Dashboard Link */}
          <IonItem routerLink="/dashboard" className="nav-item active" detail={false}>
            <LayoutDashboard size={18} slot="start" />
            <IonLabel>Dashboard</IonLabel>
          </IonItem>

          {/* Sales Accordion for Sub-navigation */}
          <IonAccordionGroup>
            <IonAccordion value="sales" className="sidebar-accordion">
              <IonItem slot="header" className="nav-item">
                <ShoppingCart size={18} slot="start" />
                <IonLabel>Sales</IonLabel>
              </IonItem>
              <div slot="content" className="sub-menu">
                <IonItem routerLink="/dashboard/sales/customers" className="sub-nav-item">
                  <IonLabel>Customers</IonLabel>
                </IonItem>
                <IonItem routerLink="/dashboard/sales/leads" className="sub-nav-item">
                  <IonLabel>Leads</IonLabel>
                </IonItem>
              </div>
            </IonAccordion>
          </IonAccordionGroup>

          {/* Regular Items */}
          <IonItem routerLink="/dashboard/staff" className="nav-item" detail={false}>
            <Users size={18} slot="start" />
            <IonLabel>Staff & Technicians</IonLabel>
          </IonItem>
          
          <IonItem routerLink="/dashboard/tickets" className="nav-item" detail={false}>
            <Ticket size={18} slot="start" />
            <IonLabel>Ticketing</IonLabel>
          </IonItem>

         
        </IonList>

        <div className="sidebar-footer">
          <IonItem button lines="none" className="logout-item" onClick={onLogout}>
            <LogOut size={18} slot="start" color="danger" />
            <IonLabel color="danger">Logout</IonLabel>
          </IonItem>
        </div>
      </IonContent>
    </IonMenu>
  );
};

export default Sidebar;