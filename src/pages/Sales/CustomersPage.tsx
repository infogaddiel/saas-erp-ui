import React, { useEffect, useState } from 'react';
import {
  IonContent, IonPage, IonButton, IonIcon,
  IonModal, IonInput, IonItem, IonLabel,
  IonTextarea, IonSelect, IonSelectOption,
  useIonAlert,
  IonSearchbar,
  useIonLoading
} from '@ionic/react';
import { addOutline, pencilOutline, trashOutline, downloadOutline, documentTextOutline, closeOutline, personAddOutline } from 'ionicons/icons';
import Header from '../../components/Header';
import './Customers.css';
import { customerService } from '../../api/customerService';
import { ContactPerson, Customer } from '../../interfaces/Customer';
import Pagination from '../../components/Pagination';
import BulkUploadContainer from '../../components/BulkUploadContainer';
import { downloadTemplate } from '../../utility/downloaTemplate';



const CustomersPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerType, setCustomerType] = useState<any[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [presentAlert] = useIonAlert(); // Hook for confirmation popups
  const [presentLoading, dismissLoading] = useIonLoading();
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
    ship_address: '',
    customer_type_id: 2,
    type:'Company',
    customerDetails: [] // Initialize with empty array
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

  const fetchCustomerTypes = async () => {
    try {
      const response = await customerService.getCustomersType();
      setCustomerType(response.data || []);
    } catch (err) {
      console.error("Could not load technicians", err);
    }
  };

  useEffect(() => {
    fetchCustomerTypes();
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
    setFormData({ ...customer,customerDetails: customer.customerDetails || []}); // Populate form with existing data
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
      const { customerDetails, ...customerData } = formData;
      let customerId = formData.id;
      if (isEditMode && customerId) {
        // Update existing customer
        await customerService.updateCustomer(customerId, customerData);
        if (customerDetails && customerDetails.length > 0) {
          const contactPromises = customerDetails.map(contact => {
            if (contact.id) {
              return customerService.updateContactDetail(customerId, contact.id, contact);
            } else {
              return customerService.addContactDetail(customerId, contact);
            }
          });
          await Promise.all(contactPromises);
        }
        alert('Customer updated successfully!');
      } else {
        // Add new customer
        const newCustomer = await customerService.addCustomer(customerData);
        const newId = newCustomer.data.id;
        if (newId && customerDetails && customerDetails.length > 0) {
          const contactPromises = customerDetails.map(contact =>
            customerService.addContactDetail(newId, contact)
          );
          await Promise.all(contactPromises);
        }
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

  const handleExport = async () => {
    await presentLoading('Preparing Excel file...');
    try {
      const data = await customerService.exportToExcel();

      // 1. Create a Blob from the response data
      const blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      // 2. Create a temporary URL for the Blob
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // 3. Set the filename
      // Note: We use a timestamp to ensure uniqueness
      const filename = `Customer_Report_${new Date().toLocaleDateString()}.xlsx`;
      link.setAttribute('download', filename);

      // 4. Trigger download
      document.body.appendChild(link);
      link.click();

      // 5. Cleanup
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error("Export Error:", err);
      presentAlert({
        header: 'Export Failed',
        message: 'Could not generate report. Please try again.',
        buttons: ['OK']
      });
    } finally {
      dismissLoading();
    }
  };
  const addContactRow = () => {
    const newContact = { name: '', mobile: '', email: '', address: '' };
    setFormData({
      ...formData,
      customerDetails: [...(formData.customerDetails || []), newContact]
    });
  };

  // Helper to remove a contact row
  const removeContactRow = async (index: number) => {
  const contact = formData.customerDetails?.[index];

  // SCENARIO 1: Contact exists in DB (has an ID)
  if (contact && contact.id && formData.id) {
    presentAlert({
      header: 'Confirm Delete',
      message: `Are you sure you want to permanently delete ${contact.name || 'this contact'}?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            try {
              await customerService.deleteContactDetail(formData.id!, contact.id!);
              
              // Remove from UI after successful API call
              const updatedContacts = [...(formData.customerDetails || [])];
              updatedContacts.splice(index, 1);
              setFormData({ ...formData, customerDetails: updatedContacts });
            } catch (err) {
              alert("Failed to delete contact from server.");
            }
          },
        },
      ],
    });
  } 
  // SCENARIO 2: Contact is new (UI only)
  else {
    const updatedContacts = [...(formData.customerDetails || [])];
    updatedContacts.splice(index, 1);
    setFormData({ ...formData, customerDetails: updatedContacts });
  }
};

  // Helper to update specific contact field
  const updateContactField = (index: number, field: keyof ContactPerson, value: string) => {
    const updatedContacts = [...(formData.customerDetails || [])];
    updatedContacts[index] = { ...updatedContacts[index], [field]: value };
    setFormData({ ...formData, customerDetails: updatedContacts });
  };
  const sampleData = {
    name: "Full Name",
    mobile: "9990007890", // Sample data helps users understand the format
    email: "example@gmail.com",
    customer_type: "Commercial", // Mention valid types: Individual or Corporate
    address: "123 Street Name, City"
  }
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
            <IonButton size="small" onClick={openAddModal} className="add-btn">
              <IonIcon slot="start" icon={addOutline} />
              Add
            </IonButton>
            <IonButton size="small" color="success" onClick={handleExport} className="export-btn">
              <IonIcon slot="start" icon={downloadOutline} />
              Export
            </IonButton>
            <IonButton size="small"
              fill="outline"
              color="medium"
              onClick={() => downloadTemplate(sampleData, 'Customers')}
            >
              <IonIcon slot="start" icon={documentTextOutline} />
              Template
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
                  <td><span className={`type-badge ${c.type?.toLowerCase()}`}>
                    {c.customerType?.name}
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
              <IonItem lines="full" className="modal-input">
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

              <IonItem lines="full" className="modal-input">
                <IonLabel position="stacked">Billing Address</IonLabel>
                <IonTextarea
                  value={formData.address}
                  onIonInput={e => setFormData({ ...formData, address: e.detail.value! })}
                  placeholder="Enter billing address"
                />
              </IonItem>
              <IonItem lines="full" className="modal-input">
                <IonLabel position="stacked">Shipping Address</IonLabel>
                <IonTextarea
                  value={formData.ship_address}
                  onIonInput={e => setFormData({ ...formData, ship_address: e.detail.value! })}
                  placeholder="Enter shiping address"
                />
              </IonItem>

              <IonItem lines="full" className="modal-input">
                <IonLabel position="stacked">Customer Type</IonLabel>
                <IonSelect value={formData.customer_type_id} onIonChange={e => setFormData({ ...formData, customer_type_id: e.detail.value })}>
                  {customerType.map(ct => (
                    <IonSelectOption key={ct.id} value={ct.id}>{ct.name}</IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
              {/* --- CONTACT PERSONS SECTION --- */}
              <div className="full-width contact-section">
                <div className="section-title-bar">
                  <h4>Contact Persons</h4>
                  <IonButton size="small" fill="outline" onClick={addContactRow}>
                    <IonIcon slot="start" icon={personAddOutline} />
                    Add
                  </IonButton>
                </div>

                <div className="contact-scroll-area">
                  {formData.customerDetails?.map((contact, index) => (
                    <div key={index} className="contact-compact-row">
                      <div className="contact-inputs-grid">
                        <IonItem lines="none">
                          <IonLabel position="stacked">Name</IonLabel>
                          <IonInput value={contact.name} onIonInput={e => updateContactField(index, 'name', e.detail.value!)} />
                        </IonItem>
                        <IonItem lines="none">
                          <IonLabel position="stacked">Mobile</IonLabel>
                          <IonInput value={contact.mobile} onIonInput={e => updateContactField(index, 'mobile', e.detail.value!)} />
                        </IonItem>
                        <IonItem lines="none">
                          <IonLabel position="stacked">Email</IonLabel>
                          <IonInput value={contact.email} onIonInput={e => updateContactField(index, 'email', e.detail.value!)} />
                        </IonItem>
                        <IonItem lines="none">
                          <IonLabel position="stacked">Address</IonLabel>
                          <IonInput value={contact.address} onIonInput={e => updateContactField(index, 'address', e.detail.value!)} />
                        </IonItem>
                      </div>
                      <IonButton fill="clear" color="danger" className="remove-contact-btn" onClick={() => removeContactRow(index)}>
                        <IonIcon icon={trashOutline} slot="icon-only" />
                      </IonButton>
                    </div>
                  ))}
                  {(!formData.customerDetails || formData.customerDetails.length === 0) && (
                    <div className="no-contacts-text">Click "Add" to include contact person details.</div>
                  )}
                </div>
              </div>

              <div className="modal-footer full-width">
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