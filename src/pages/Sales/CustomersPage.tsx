import React, { useEffect, useState } from 'react';
import {
  IonContent, IonPage, IonButton, IonIcon,
  IonModal, IonInput, IonItem, IonLabel,
  IonTextarea, IonSelect, IonSelectOption,
  useIonAlert,
  IonSearchbar
} from '@ionic/react';
import { addOutline, pencilOutline, trashOutline } from 'ionicons/icons';
import Header from '../../components/Header';
import './Customers.css';
import { customerService } from '../../api/customerService';
import { Customer } from '../../interfaces/Customer';
import Pagination from '../../components/Pagination';
import BulkUploadContainer from '../../components/BulkUploadContainer';



const CustomersPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [presentAlert] = useIonAlert(); // Hook for confirmation popups
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState({
    total: 0,
    totalPages: 1,
    limit: 20
  });
  // Filter the customers based on search text
  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchText.toLowerCase()) ||
    c.email.toLowerCase().includes(searchText.toLowerCase()) ||
    c.mobile.includes(searchText)
  );
  // State for the form
  const initialFormState: Customer = {
    name: '',
    email: '',
    mobile: '',
    address: '',
    type: 'Individual'
  };
  const [formData, setFormData] = useState<Customer>(initialFormState);

  // Load data from DB
  const loadCustomers = async (page: number) => {
    try {
      const response: any = await customerService.getCustomers(page, 20);

      // Drill down: response -> data -> customers
      if (response && response.success && response.data.customers) {
        setCustomers(response.data.customers);
      } else {
        setCustomers([]);
      }
      setPaginationData({
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages,
        limit: response.data.pagination.limit
      });
    } catch (err) {
      console.error("Failed to load customers", err);
      setCustomers([]);
    }
  };

  useEffect(() => {
    loadCustomers(currentPage);
  }, [currentPage]);

  // Open modal for "Add"
  const openAddModal = () => {
    setIsEditMode(false);
    setFormData(initialFormState);
    setShowModal(true);
  };

  // Open modal for "Edit"
  const openEditModal = (customer: Customer) => {
    setIsEditMode(true);
    setFormData({ ...customer }); // Populate form with existing data
    setShowModal(true);
  };

  const handleDelete = async (id: number, name: string) => {
    presentAlert({
      header: 'Confirm Delete',
      message: `Are you sure you want to delete ${name}?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            try {
              await customerService.deleteCustomer(id);
              loadCustomers(currentPage); // Refresh list
            } catch (err) {
              alert("Failed to delete customer");
            }
          },
        },
      ],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode && formData.id) {
        // Update existing customer
        await customerService.updateCustomer(formData.id, formData);
        alert('Customer updated successfully!');
      } else {
        // Add new customer
        await customerService.addCustomer(formData);
        alert('Customer added successfully!');
      }

      setShowModal(false);
      setFormData(initialFormState);
      loadCustomers(currentPage);
    } catch (error) {
      console.error("Error saving customer:", error);
      alert('Failed to save customer.');
    }
  };
  return (
    <IonPage>
      <Header title="Customers" details='Manage your customer database' />

      <IonContent className="ion-padding gray-bg">
        <div className="page-header-section">
          <div className="search-wrapper">
            <IonSearchbar
              value={searchText}
              onIonInput={(e) => setSearchText(e.detail.value!)}
              placeholder="Search customers..."
              className="erp-searchbar"
            />
          </div>
          <div className="page-action-bar">
            <IonButton onClick={openAddModal} className="add-btn">
              <IonIcon slot="start" icon={addOutline} />
              Add
            </IonButton>
            <BulkUploadContainer
              title="Import"
              onUpload={customerService.bulkCreate}
              onSuccess={() => loadCustomers(currentPage)}
            />
          </div>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((c) => (
                <tr key={c.id}>
                  <td className="bold-text">{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.mobile}</td>
                  <td><span className={`type-badge ${c.type.toLowerCase()}`}>
                    {c.type}
                  </span></td>
                  <td>
                    <div className="action-buttons">
                      <IonButton fill="clear" onClick={() => openEditModal(c)}>
                        <IonIcon icon={pencilOutline} color="primary" />
                      </IonButton>
                      <IonButton fill="clear" onClick={() => handleDelete(c.id!, c.name)}>
                        <IonIcon icon={trashOutline} color="danger" />
                      </IonButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-wrapper">
          <Pagination
            currentPage={currentPage}
            totalPages={paginationData.totalPages}
            totalItems={paginationData.total}
            itemsPerPage={paginationData.limit}
            onPageChange={(newPage) => setCurrentPage(newPage)}
          />
        </div>

        {/* Unified Modal for Add/Edit */}
        <IonModal
          isOpen={showModal}
          onDidDismiss={() => setShowModal(false)}
          className="custom-modal"
        >
          <div className="modal-header">
            <h3>{isEditMode ? 'Edit Customer' : 'Add New Customer'}</h3>
          </div>
          <div className="modal-body">
            <div className="form-grid">
              <IonItem lines="full" className="modal-input full-width">
                <IonLabel position="stacked">Full Name / Company</IonLabel>
                <IonInput
                  value={formData.name}
                  onIonInput={e => setFormData({ ...formData, name: e.detail.value! })}
                  placeholder="Enter name"
                />
              </IonItem>

              <IonItem lines="full" className="modal-input">
                <IonLabel position="stacked">Email Address</IonLabel>
                <IonInput
                  type="email"
                  value={formData.email}
                  onIonInput={e => setFormData({ ...formData, email: e.detail.value! })}
                  placeholder="email@example.com"
                />
              </IonItem>

              <IonItem lines="full" className="modal-input">
                <IonLabel position="stacked">Mobile Number</IonLabel>
                <IonInput
                  type="tel"
                  value={formData.mobile}
                  onIonInput={e => setFormData({ ...formData, mobile: e.detail.value! })}
                  placeholder="785-000-0000"
                />
              </IonItem>

              <IonItem lines="full" className="modal-input full-width">
                <IonLabel position="stacked">Address</IonLabel>
                <IonTextarea
                  value={formData.address}
                  onIonInput={e => setFormData({ ...formData, address: e.detail.value! })}
                  placeholder="Enter physical address"
                />
              </IonItem>

              <IonItem lines="full" className="modal-input">
                <IonLabel position="stacked">Customer Type</IonLabel>
                <IonSelect
                  value={formData.type}
                  onIonChange={e => setFormData({ ...formData, type: e.detail.value })}
                >
                  <IonSelectOption value="Individual">Individual</IonSelectOption>
                  <IonSelectOption value="Company">Company</IonSelectOption>
                </IonSelect>
              </IonItem>

              <div className="modal-footer">
                <IonButton fill="clear" color="medium" onClick={() => setShowModal(false)}>Cancel</IonButton>
                <IonButton onClick={handleSubmit} className="save-btn">
                  {isEditMode ? 'Update' : 'Save'}
                </IonButton>
              </div>
            </div>
          </div>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default CustomersPage;