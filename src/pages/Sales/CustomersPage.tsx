import React, { useState } from 'react';
import { 
  IonContent, IonPage, IonButton, IonIcon, 
  IonModal, IonInput, IonItem, IonLabel, IonList 
} from '@ionic/react';
import { addOutline, personAddOutline, mailOutline, callOutline } from 'ionicons/icons';
import Header from '../../components/Header';
import './Customers.css';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive';
}

const CustomersPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([
    { id: 1, name: 'John Doe HVAC', email: 'john@example.com', phone: '555-0199', status: 'Active' },
    { id: 2, name: 'Smith Properties', email: 'info@smith.com', phone: '555-0120', status: 'Active' },
  ]);

  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '' });

  const handleAddCustomer = () => {
    const customer: Customer = {
      id: Date.now(),
      ...newCustomer,
      status: 'Active'
    };
    setCustomers([...customers, customer]);
    setShowModal(false);
    setNewCustomer({ name: '', email: '', phone: '' });
  };

  return (
    <IonPage>
      <Header title="Customers" />
      
      <IonContent className="ion-padding gray-bg">
        <div className="page-action-bar">
         
          <IonButton onClick={() => setShowModal(true)} className="add-btn">
            <IonIcon slot="start" icon={addOutline} />
            Add Customer
          </IonButton>
        </div>

        {/* Tabular Format */}
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td className="bold-text">{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone}</td>
                  <td><span className={`badge ${c.status.toLowerCase()}`}>{c.status}</span></td>
                  <td>
                    <button className="action-link">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Customer Modal */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)} className="custom-modal">
          <div className="modal-header">
            <h3>Add New Customer</h3>
          </div>
          <div className="modal-body">
            <IonItem lines="outline" className="modal-input">
              <IonLabel position="stacked">Full Name / Company</IonLabel>
              <IonInput 
                value={newCustomer.name} 
                onIonInput={e => setNewCustomer({...newCustomer, name: e.detail.value!})} 
                placeholder="Enter name"
              />
            </IonItem>
            <IonItem lines="outline" className="modal-input">
              <IonLabel position="stacked">Email Address</IonLabel>
              <IonInput 
                type="email"
                value={newCustomer.email} 
                onIonInput={e => setNewCustomer({...newCustomer, email: e.detail.value!})} 
                placeholder="email@gaddiel.io"
              />
            </IonItem>
            <IonItem lines="outline" className="modal-input">
              <IonLabel position="stacked">Phone Number</IonLabel>
              <IonInput 
                type="tel"
                value={newCustomer.phone} 
                onIonInput={e => setNewCustomer({...newCustomer, phone: e.detail.value!})} 
                placeholder="555-000-0000"
              />
            </IonItem>
            
            <div className="modal-footer">
              <IonButton fill="clear" color="medium" onClick={() => setShowModal(false)}>Cancel</IonButton>
              <IonButton onClick={handleAddCustomer} className="save-btn">Save Customer</IonButton>
            </div>
          </div>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default CustomersPage;