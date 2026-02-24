import React, { useEffect, useState } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, IonSplitPane, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { store } from './store/store';
/* Pages: Modular Containers */
import LoginContainer from './pages/Login/LoginContainer';
import DashboardContainer from './pages/Dashboard/DashboardContainer';

/* Global Components */
import Sidebar from './components/Sidebar';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import OtpContainer from './pages/Auth/OtpContainer';
import CustomersPage from './pages/Sales/CustomersPage';
import LeadsPage from './pages/Sales/SalesPage';
import StaffPage from './pages/Staff/StaffPage';
import ItemsPage from './pages/Items/ItemsPage';
import TicketsPage from './pages/Tickets/TicketsPage';
import CompanySettings from './pages/Company/CompanySettings';
import { logout } from './utility/authUtils';
import ServiceReportPage from './pages/Tickets/ServiceReportPage';
import ServiceReportListPage from './pages/Tickets/ServiceReportListPage';
import ServiceReportViewPage from './pages/Tickets/ServiceReportViewPage';
import { Provider } from 'react-redux';

setupIonicReact();

const App: React.FC = () => {
  // Senior Dev Note: This state will eventually be handled by 
  // your Context API or Redux (JWT check)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkSession = () => {
      const token = localStorage.getItem('auth_token');

      if (token) {
        // Optional: Decode token to check expiration (JWT)
        // If expired: localStorage.removeItem('auth_token'); setIsAuthenticated(false);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    checkSession();
  }, []);
  const handleLoginSuccess = (otpRequired: boolean) => {
    if (otpRequired) {
      setIsVerifying(true);
    } else {
      setIsVerifying(false);
      setIsAuthenticated(true);
    }
  };

  const handleOtpSuccess = () => {
    setIsVerifying(false);
    setIsAuthenticated(true); // Finally move to Dashboard
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsVerifying(false);
    logout();
  };
  if (loading) return <p>Loading session...</p>;
  return (
    <Provider store={store}>
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet id="main-app">
          {/* LOGIN ROUTE */}
          <Route exact path="/login">
            {!isAuthenticated && !isVerifying ? (
              <LoginContainer onLoginSuccess={handleLoginSuccess} />
            ) : (
              <Redirect to={isAuthenticated ? "/dashboard" : "/verify-otp"} />
            )}
          </Route>

          {/* OTP ROUTE */}
          <Route exact path="/verify-otp">
            {isVerifying ? (
              <OtpContainer onOtpSuccess={handleOtpSuccess} />
            ) : (
              <Redirect to="/login" />
            )}
          </Route>
          {/* DASHBOARD ROUTE (SplitPane must be wrapped in a Route) */}
          <Route path="/dashboard">
            {isAuthenticated ? (
              <IonSplitPane contentId="main-content">
                <Sidebar onLogout={handleLogout} />
                <IonRouterOutlet id="main-content">
                  <Route exact path="/dashboard" component={DashboardContainer} />
                  <Route exact path="/dashboard/sales/customers" component={CustomersPage} />
                  <Route exact path="/dashboard/sales/leads" component={LeadsPage} />
                  <Route exact path="/dashboard/staff" component={StaffPage} />
                  <Route exact path="/dashboard/items" component={ItemsPage} />
                  <Route exact path="/dashboard/tickets" component={TicketsPage} />
                  <Route exact path="/dashboard/tickets/service-report" component={ServiceReportListPage} />
                  <Route exact path="/dashboard/tickets/service-report/new" component={ServiceReportPage} />
                  <Route exact path="/dashboard/tickets/:ticketId/services/:serviceId" component={ServiceReportViewPage} />
                  <Route
                    path="/dashboard/tickets/:ticketId/services/:serviceId/edit"
                    component={ServiceReportPage}
                    exact={true}
                  />
                  <Route exact path="/dashboard/settings" component={CompanySettings} />
                </IonRouterOutlet>
              </IonSplitPane>
            ) : (
              <Redirect to="/login" />
            )}
          </Route>

          {/* ROOT REDIRECT */}
          <Route exact path="/">
            <Redirect to="/login" />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
    </Provider>
  );
};

export default App;
