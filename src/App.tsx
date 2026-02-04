import React, { Suspense, lazy } from 'react'
import { IonApp, IonRouterOutlet, IonPage } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import { Switch, Route, Redirect } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import ModuleSwitcher from './components/ModuleSwitcher'

const DashboardModule = lazy(() => import('./modules/Dashboard'))
const SalesModule = lazy(() => import('./modules/Sales'))
const InventoryModule = lazy(() => import('./modules/Inventory'))

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <IonApp>
        <IonReactRouter>
          <ModuleSwitcher />
          <IonRouterOutlet>
            <Suspense fallback={<IonPage />}>
              <Switch>
                <Route exact path="/" render={() => <Redirect to="/dashboard" />} />
                <Route path="/dashboard" component={DashboardModule} />
                <Route path="/sales" component={SalesModule} />
                <Route path="/inventory" component={InventoryModule} />
              </Switch>
            </Suspense>
          </IonRouterOutlet>
        </IonReactRouter>
      </IonApp>
    </Provider>
  )
}

export default App
