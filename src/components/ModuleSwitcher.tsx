import React from 'react'
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonSegment, IonSegmentButton, IonLabel } from '@ionic/react'
import { useHistory } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks'
import { setCurrent } from '../store/moduleSwitcherSlice'

const ModuleSwitcher: React.FC = () => {
  const history = useHistory()
  const dispatch = useAppDispatch()
  const current = useAppSelector((s) => s.moduleSwitcher.current)

  const switchTo = (key: 'dashboard' | 'sales' | 'inventory') => {
    dispatch(setCurrent(key))
    history.push(`/${key}`)
  }

  return (
    <IonHeader>
      <IonToolbar>
        <IonTitle>Semak ERP</IonTitle>
        <IonButtons slot="end">
          <IonSegment value={current} onIonChange={(e) => switchTo((e.detail.value as any) || 'dashboard')}>
            <IonSegmentButton value="dashboard">
              <IonLabel>Dashboard</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="sales">
              <IonLabel>Sales</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="inventory">
              <IonLabel>Inventory</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  )
}

export default ModuleSwitcher
