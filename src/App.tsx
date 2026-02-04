import React, { useState } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, IonSplitPane, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
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

setupIonicReact();

const App: React.FC = () => {
  // Senior Dev Note: This state will eventually be handled by 
  // your Context API or Redux (JWT check)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const handleLogout = () => {
    localStorage.removeItem('app_token'); // Clear your JWT
    setIsAuthenticated(false);
    window.location.href = '/login';
  };
  return (
    <IonApp>
      <IonReactRouter>
        {!isAuthenticated ? (
          /* WORLD 1: Authentication (No Sidebar) */
          <IonRouterOutlet id="auth">
            <Route exact path="/login">
              <LoginContainer onLoginSuccess={() => setIsAuthenticated(true)} />
            </Route>
            <Route exact path="/">
              <Redirect to="/login" />
            </Route>
          </IonRouterOutlet>
        ) : (
          /* WORLD 2: Dashboard (With Sidebar) */
          <IonSplitPane contentId="main-content">
            <Sidebar onLogout={handleLogout} />
            <IonRouterOutlet id="main-content">
              <Route exact path="/dashboard" component={DashboardContainer} />
              {/* Redirect any stray paths to dashboard */}
              <Route exact path="/">
                <Redirect to="/dashboard" />
              </Route>
              <Route exact path="/login">
                <Redirect to="/dashboard" />
              </Route>
            </IonRouterOutlet>
          </IonSplitPane>
        )}
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
