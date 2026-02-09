import React, { useState, useEffect } from 'react';
import {
    IonButton, IonIcon, IonModal, IonContent, IonItem, IonLabel,
    IonInput, IonSelect, IonSelectOption, IonTextarea, IonGrid,
    IonRow, IonCol, useIonAlert,
    IonSearchbar
} from '@ionic/react';
import { addOutline, pencilOutline, archiveOutline } from 'ionicons/icons';
import { Item } from '../../interfaces/Item';
import { itemService } from '../../api/itemService';
import Pagination from '../../components/Pagination';
import BulkUploadContainer from '../../components/BulkUploadContainer';

const ItemsContainer: React.FC = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [presentAlert] = useIonAlert();
    const [paginationData, setPaginationData] = useState({
        total: 0,
        totalPages: 1,
        limit: 20
    });

    const initialForm: Item = {
        item_code: '', item_name: '', description: '', type: 'Product',
        category: 'Equipments', unit_price: 0, gst_percentage: 18, unit: 'Pcs',
        stock_quantity: 0, notes: '', status: true
    };

    const [formData, setFormData] = useState<Item>(initialForm);
    const [searchText, setSearchText] = useState('');
    // Filter logic: Checks both Name and Code
    const filteredItems = items.filter(item => {
        const searchLower = searchText.toLowerCase();
        return (
            item.item_name.toLowerCase().includes(searchLower) ||
            item.item_code.toLowerCase().includes(searchLower)
        );
    });
    useEffect(() => {
        fetchItems(currentPage);
    }, []);

    const fetchItems = async (page: number) => {
        try {
            const response = await itemService.getItems(page, 50);
            if (response && response.success && response.data.items) {
                setItems(response.data.items);
            } else {
                setItems([]);
            }
            setPaginationData({
                total: response.data.pagination.total,
                totalPages: response.data.pagination.totalPages,
                limit: response.data.pagination.limit
            });

        } catch (err) {
            console.error("Fetch items error", err);
        }
    };

    const handleOpenModal = (item?: Item) => {
        if (item) {
            setFormData(item);
            setIsEditMode(true);
        } else {
            setFormData(initialForm);
            setIsEditMode(false);
        }
        setShowModal(true);
    };

    const handleSave = async () => {
        try {
            await itemService.saveItem(formData);
            setShowModal(false);
            fetchItems(currentPage);
            presentAlert({ header: 'Success', message: 'Item updated', buttons: ['OK'] });
        } catch (err) {
            presentAlert({ header: 'Error', message: 'Save failed', buttons: ['OK'] });
        }
    };

    return (
        <div className="items-container">
            <div className="page-header-section">
                <div className="search-wrapper">
                    <IonSearchbar
                        value={searchText}
                        onIonInput={(e) => setSearchText(e.detail.value!)}
                        placeholder="Search by name or item code..."
                        className="custom-searchbar"
                        debounce={300} // Prevents lag while typing
                    />
                </div>
                 <div className="page-action-bar">
                <IonButton onClick={() => handleOpenModal()}>
                    <IonIcon icon={addOutline} slot="start" /> New Item
                </IonButton>
                <BulkUploadContainer
                    title="Import Items"
                    onUpload={itemService.bulkCreate}
                    onSuccess={() => fetchItems(currentPage)}
                />
                </div>
            </div>

            <div className="table-wrapper">
                <div className="table-responsive">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Category</th>
                                <th>Unit Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.length > 0 ?
                                (filteredItems?.map((item) => (
                                    <tr key={item.id}>
                                        <td><strong>{item.item_code}</strong></td>
                                        <td>{item.item_name}</td>
                                        <td>
                                            <span className={`type-${item.type.toLowerCase()}`}>
                                                {item.type}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="category-tag">{item.category}</span>
                                        </td>
                                        <td>{item.unit_price}</td>
                                        <td className={item.stock_quantity < 10 ? 'low-stock' : ''}>
                                            {item.stock_quantity} {item.unit}
                                        </td>
                                        <td>
                                            <span className={`status-badge ${item.status ? 'active' : 'inactive'}`}>
                                                {item.status ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <IonButton fill="clear" onClick={() => handleOpenModal(item)}>
                                                <IonIcon icon={pencilOutline} slot="icon-only" />
                                            </IonButton>
                                        </td>
                                    </tr>
                                ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="ion-text-center">
                                            <div className="no-data-msg">No items found matching "{searchText}"</div>
                                        </td>
                                    </tr>
                                )}
                        </tbody>
                    </table>
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalPages={paginationData.totalPages}
                    totalItems={paginationData.total}
                    itemsPerPage={paginationData.limit}
                    onPageChange={(newPage) => setCurrentPage(newPage)}
                />
            </div>
            {/* Item Modal */}
            <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)} className="staff-modal">
                <div className="modal-header">
                    <h3>{isEditMode ? 'Edit Item Details' : 'Register New Item'}</h3>
                </div>
                <IonContent className="modal-scroll-content">
                    <IonGrid>
                        <IonRow>
                            <IonCol size="6">
                                <IonItem lines="none" className="modal-input">
                                    <IonLabel position="stacked">Item Code</IonLabel>
                                    <IonInput value={formData.item_code} onIonInput={e => setFormData({ ...formData, item_code: e.detail.value! })} />
                                </IonItem>
                            </IonCol>
                            <IonCol size="6">
                                <IonItem lines="none" className="modal-input">
                                    <IonLabel position="stacked">Item Name</IonLabel>
                                    <IonInput value={formData.item_name} onIonInput={e => setFormData({ ...formData, item_name: e.detail.value! })} />
                                </IonItem>
                            </IonCol>
                        </IonRow>
                        <IonRow>
                            {/* Item Type Dropdown */}
                            <IonCol size="6">
                                <IonItem lines="none" className="modal-input">
                                    <IonLabel position="stacked">Item Type</IonLabel>
                                    <IonSelect
                                        value={formData.type}
                                        placeholder="Select Type"
                                        onIonChange={e => setFormData({ ...formData, type: e.detail.value })}
                                    >
                                        <IonSelectOption value="Product">Product</IonSelectOption>
                                        <IonSelectOption value="Service">Service</IonSelectOption>
                                        <IonSelectOption value="Part">Part</IonSelectOption>
                                    </IonSelect>
                                </IonItem>
                            </IonCol>

                            {/* Item Category Dropdown */}
                            <IonCol size="6">
                                <IonItem lines="none" className="modal-input">
                                    <IonLabel position="stacked">Category</IonLabel>
                                    <IonSelect
                                        value={formData.category}
                                        placeholder="Select Category"
                                        onIonChange={e => setFormData({ ...formData, category: e.detail.value })}
                                    >
                                        <IonSelectOption value="Equipments">Equipments</IonSelectOption>
                                        <IonSelectOption value="Parts">Parts</IonSelectOption>
                                        <IonSelectOption value="Labor">Labor</IonSelectOption>
                                        <IonSelectOption value="Materials">Materials</IonSelectOption>
                                    </IonSelect>
                                </IonItem>
                            </IonCol>
                        </IonRow>
                        <IonRow>
                            <IonCol size="4">
                                <IonItem lines="none" className="modal-input">
                                    <IonLabel position="stacked">Price</IonLabel>
                                    <IonInput type="number" value={formData.unit_price} onIonInput={e => setFormData({ ...formData, unit_price: +e.detail.value! })} />
                                </IonItem>
                            </IonCol>
                            <IonCol size="4">
                                <IonItem lines="none" className="modal-input">
                                    <IonLabel position="stacked">Unit</IonLabel>
                                    <IonInput value={formData.unit} placeholder="e.g. Pcs" onIonInput={e => setFormData({ ...formData, unit: e.detail.value! })} />
                                </IonItem>
                            </IonCol>
                            {formData.type !== 'Service' && (
                                <IonCol size="4">
                                    <IonItem lines="none" className="modal-input">
                                        <IonLabel position="stacked">Stock Quantity</IonLabel>
                                        <IonInput
                                            type="number"
                                            value={formData.stock_quantity}
                                            onIonInput={e => setFormData({ ...formData, stock_quantity: +e.detail.value! })}
                                        />
                                    </IonItem>
                                </IonCol>
                            )}
                            <IonCol size="4">
                                <IonItem lines="none" className="modal-input">
                                    <IonLabel position="stacked">Status</IonLabel>
                                    <IonSelect value={formData.status} onIonChange={e => setFormData({ ...formData, status: e.detail.value })}>
                                        <IonSelectOption value={true}>Active</IonSelectOption>
                                        <IonSelectOption value={false}>Inactive</IonSelectOption>
                                    </IonSelect>
                                </IonItem>
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                </IonContent>
                <div className="modal-footer">
                    <IonButton fill="clear" color="medium" onClick={() => setShowModal(false)}>Cancel</IonButton>
                    <IonButton onClick={handleSave}>Save Item</IonButton>
                </div>
            </IonModal>
        </div>
    );
};

export default ItemsContainer;