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
import semakLogo from '../assets/logo.png';
interface SidebarProps {
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  return (
    <IonMenu contentId="main-content" type="overlay" className="custom-sidebar">
      <IonContent className="ion-no-padding">
        <div className="sidebar-header">
          <div className="sidebar-branding">
            <div className="logo-wrapper">
              <img src={semakLogo} alt="Semak ERP" className="erp-logo" />
              <p className="logo-subtitle">Ticketing & Support</p>
            </div>
          </div>
        </div>

        <IonList id="nav-list" lines="none">
          {/* Dashboard Link */}
          <IonItem routerLink="/dashboard" className="nav-item active" detail={false}>
            <span slot="start">
              <LayoutDashboard size={18} />
            </span>
            <IonLabel>Dashboard</IonLabel>
          </IonItem>

          {/* Sales Accordion for Sub-navigation */}
          <IonAccordionGroup>
            <IonAccordion value="sales" className="sidebar-accordion">
              <IonItem slot="header" className="nav-item">
                <span slot="start">
                  <ShoppingCart size={18} />
                </span>
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
          {/* Inventory Items*/}
          <IonAccordionGroup>
            <IonAccordion value="staff" className="sidebar-accordion">
              <IonItem slot="header" className="nav-item">
                <span slot="start">
                  <Briefcase size={18} />
                </span>
                <IonLabel>Inventory</IonLabel>
              </IonItem>
              <div slot="content" className="sub-menu">
                <IonItem routerLink="/dashboard/items" className="sub-nav-item">
                  <IonLabel>Items</IonLabel>
                </IonItem>
              </div>
            </IonAccordion>
          </IonAccordionGroup>
          {/* Staff Items*/}
          <IonAccordionGroup>
            <IonAccordion value="staff" className="sidebar-accordion">
              <IonItem slot="header" className="nav-item">
                <span slot="start">
                  <Users size={18} />
                </span>
                <IonLabel>Staff & Technicians</IonLabel>
              </IonItem>
              <div slot="content" className="sub-menu">
                <IonItem routerLink="/dashboard/staff" className="sub-nav-item">
                  <IonLabel>Staff</IonLabel>
                </IonItem>
              </div>
            </IonAccordion>
          </IonAccordionGroup>
        <IonAccordionGroup>
            <IonAccordion value="ticket" className="sidebar-accordion">
              <IonItem slot="header" className="nav-item">
                <span slot="start">
                  <Ticket size={18} />
                </span>
                <IonLabel>Ticketing</IonLabel>
              </IonItem>
              <div slot="content" className="sub-menu">
                <IonItem routerLink="/dashboard/tickets" className="sub-nav-item">
                  <IonLabel>Tickets</IonLabel>
                </IonItem>
              </div>
            </IonAccordion>
          </IonAccordionGroup>

          {/* Regular Items */}

          {/* <IonItem routerLink="/dashboard/tickets" className="nav-item" detail={false}>
            <span slot="start">
              <Ticket size={18} />
            </span>
            <IonLabel>Ticketing</IonLabel>
          </IonItem> */}


        </IonList>

        <div className="sidebar-footer">
          <IonItem button lines="none" className="logout-item" onClick={onLogout}>
            <span slot="start">
              <LogOut size={18} />
            </span>
            <IonLabel color="danger">Logout</IonLabel>
          </IonItem>
        </div>
      </IonContent>
    </IonMenu>
  );
};

export default Sidebar;