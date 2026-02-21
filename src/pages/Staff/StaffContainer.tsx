import React, { useEffect, useState } from 'react';
import {
    IonButton, IonIcon, IonSearchbar, IonModal, IonItem, IonLabel,
    IonInput, IonSelect, IonSelectOption, IonCheckbox, IonGrid, IonRow, IonCol,
    useIonAlert,
    useIonLoading,
    IonContent,
    IonBadge
} from '@ionic/react';
import { addOutline, pencilOutline, trashOutline, shieldCheckmarkOutline, eyeOffOutline, eyeOutline } from 'ionicons/icons';
import { ModulesInterface, Role, Staff } from '../../interfaces/Staff';
import { userService } from '../../api/userService';
import Pagination from '../../components/Pagination';
import { getCompanyId, getModules } from '../../utility/authUtils';
import { authService } from '../../api/authService';


const StaffContainer: React.FC = () => {
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [presentAlert] = useIonAlert();
    const [presentLoading, dismissLoading] = useIonLoading();
    const [showToast, setShowToast] = useState(false);
    const [MODULES,setMODULES] = useState<any[]>([])
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedModuleIds, setSelectedModuleIds] = useState<number[]>([]);
    const [showPassword, setShowPassword] = useState(false);
    const [paginationData, setPaginationData] = useState({
        total: 0,
        totalPages: 1,
        limit: 20
    });
    const initialFormState: Staff = {
        name: '', email: '', mobile: '', address: '', role_id: 0, menu_ids: [], password: ''
    };
    const [formData, setFormData] = useState<Staff>(initialFormState);
    const [roles, setRoles] = useState<Role[]>([]);
    const loadStaff = async (page: number) => {
        try {
            const response: any = await userService.getUsers(page, 20);
            if (response && response.success && response.data.users) {
                setStaffList(response.data.users);
            } else {
                setStaffList([]);
            }
            setPaginationData({
                total: response.data.pagination.total,
                totalPages: response.data.pagination.totalPages,
                limit: response.data.pagination.limit
            });
        } catch (err) {
            console.error("Fetch error", err);
        }
    };

    useEffect(() => {
        setMODULES(getModules().modules);
        const fetchRoles = async () => {
            try {
                const data = await authService.getRoles();
                const rolesArray = Array.isArray(data.data) ? data.data : [];

                if (rolesArray) {
                    setRoles(rolesArray);
                } else {
                    console.error("API did not return an array of roles", data);
                    setRoles([]); // Fallback to empty array to prevent crash
                }
            } catch (err) {
                console.error("Could not load roles", err);
            }
        };
        fetchRoles();
    }, []);

    useEffect(() => {
       
        loadStaff(currentPage);
    }, [currentPage]);

    const handleSubmit = async () => {
        await presentLoading('Saving...');
        try {
             const companyId = getCompanyId();
            if (isEditMode && formData.id) {
                formData.menu_ids = selectedModuleIds;
                if(companyId)
                formData.company_id =  companyId;
                await userService.updateUser(formData.id, formData);
            } else {
                formData.menu_ids = selectedModuleIds;
                 if(companyId)
                 formData.company_id =  companyId;
                await userService.addUser(formData);
            }
            setShowModal(false);
            loadStaff(currentPage); // Refresh list
            setShowToast(true);
        } catch (err) {
            presentAlert({
                header: 'Error',
                subHeader: 'Action Failed', // Optional
                message: 'Failed to save staff member. Please try again.',
                buttons: ['OK'],
            });
        } finally {
            presentAlert({
                header: 'Success',
                message: 'Staff Details Updated Successfully',
                buttons: ['OK'],
            });
            dismissLoading();
        }
    };

    const handleDelete = (id: number, name: string) => {
        presentAlert({
            header: 'Confirm Delete',
            message: `Are you sure you want to delete ${name}?`,
            buttons: [
                { text: 'Cancel', role: 'cancel' },
                {
                    text: 'Delete',
                    role: 'destructive',
                    handler: async () => {
                        await userService.deleteUser(id);
                        loadStaff(currentPage);
                    }
                }
            ]
        });
    };
    const handlePermissionChange = (moduleId: number, isChecked: boolean) => {
        if (isChecked) {
            setSelectedModuleIds([...selectedModuleIds, moduleId]);
        } else {
            setSelectedModuleIds(selectedModuleIds.filter(id => id !== moduleId));
        }
    };

    const handleEdit = (user: Staff) => {
        setIsEditMode(true);
        setFormData(user);
        const existingIds = user.permissions?.map((p: any) => p.menu_id) || [];
        setSelectedModuleIds(existingIds);
        setShowModal(true);
    };
    return (
        <>
            <div className="page-header-section">
                <div className="search-wrapper">
                    <IonSearchbar placeholder="Search staff members..." className="erp-searchbar" />
                </div>
                <IonButton onClick={() => setShowModal(true)} className="add-btn">
                    <IonIcon slot="start" icon={addOutline} /> Add Staff
                </IonButton>
            </div>
            <div className="table-wrapper">
                <div className="table-container">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Staff Name</th>
                                <th>Role</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Permissions</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staffList.map((s: any) => (
                                <tr key={s.id}>
                                    <td className="bold-text">{s.name}</td>
                                    <td><span className={`role-badge ${s.role?.type?.toLowerCase()}`}>{s.role?.type}</span></td>
                                    <td>{s.email}</td>
                                    <td>{s.mobile}</td>
                                    <td>
                                        <div className="badge-container">
                                            {s.permissions?.map((p: any) => (
                                                <IonBadge
                                                    key={p.id}
                                                    className={`perm-badge badge-${p.menu?.name.toLowerCase().replace(/\s+/g, '-')}`}
                                                >
                                                    {p.menu?.name}
                                                </IonBadge>
                                            ))}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <IonButton fill="clear" onClick={() => { handleEdit(s) }}>
                                                <IonIcon icon={pencilOutline} color="primary" />
                                            </IonButton>
                                            <IonButton fill="clear" onClick={() => handleDelete(s.id!, s.name)}>
                                                <IonIcon icon={trashOutline} color="danger" />
                                            </IonButton>
                                        </div>
                                    </td>
                                </tr>
                            ))}
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
            <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)} className="staff-modal">
                <div className="modal-header"><h3>Add New Staff Member</h3></div>
                <IonContent className="modal-scroll-content">
                    <div className="modal-body compact-form">
                        <div className="form-grid">
                            <IonItem lines="none" className="modal-input full-width">
                                <IonLabel position="stacked">Full Name</IonLabel>
                                <IonInput value={formData.name}
                                    onIonInput={e => setFormData({ ...formData, name: e.detail.value! })}
                                    placeholder="Enter name" />
                            </IonItem>
                            {/* Email & Phone - Side by Side */}
                            <IonItem lines="none" className="modal-input">
                                <IonLabel position="stacked">Email</IonLabel>
                                <IonInput
                                    type="email"
                                    value={formData.email}
                                    onIonInput={e => setFormData({ ...formData, email: e.detail.value! })}
                                />
                            </IonItem>
                            <IonItem lines="none" className="modal-input">
                                <IonLabel position="stacked">Phone Number</IonLabel>
                                <IonInput
                                    type="tel"
                                    value={formData.mobile}
                                    onIonInput={e => setFormData({ ...formData, mobile: e.detail.value! })}
                                />
                            </IonItem>
                            <IonItem lines="none" className="modal-input">
                                <IonLabel position="stacked">
                                    {isEditMode ? 'Change Password (Optional)' : 'Account Password'}
                                </IonLabel>
                                <div className="password-input-wrapper">
                                    <IonInput
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        placeholder={isEditMode ? 'Leave blank to keep current' : 'Enter secure password'}
                                        onIonInput={e => setFormData({ ...formData, password: e.detail.value! })}
                                    />
                                    <IonButton fill="clear" onClick={() => setShowPassword(!showPassword)} slot="end">
                                        <IonIcon icon={showPassword ? eyeOffOutline : eyeOutline} slot="icon-only" color="medium" />
                                    </IonButton>
                                </div>
                            </IonItem>
                            <IonItem lines="none" className="modal-input">
                                <IonLabel position="stacked">Role</IonLabel>
                                <IonSelect
                                    value={formData.role_id}
                                    placeholder="Select Role"
                                    onIonChange={e => setFormData({ ...formData, role_id: e.detail.value })}
                                >
                                    {Array.isArray(roles) && roles.map((role) => (
                                        <IonSelectOption key={role.id} value={role.id}>
                                            {role.type}
                                        </IonSelectOption>
                                    ))}
                                </IonSelect>
                            </IonItem>

                        </div>

                        <div className="permissions-container">
                            <div className="permission-header">
                                <IonIcon icon={shieldCheckmarkOutline} />
                                <span>Module Access Permissions</span>
                            </div>
                            <IonGrid>
                                <IonRow>
                                    {MODULES?.map((m: ModulesInterface) => (
                                        <IonCol size="4" key={m.id}>
                                            <IonItem lines="none" className="permission-checkbox">
                                                <IonCheckbox
                                                    justify="start" labelPlacement="end"
                                                    checked={selectedModuleIds.includes(m.id)}
                                                    onIonChange={(e) => handlePermissionChange(m.id, e.detail.checked)}
                                                >{m.name}</IonCheckbox>
                                            </IonItem>
                                        </IonCol>
                                    ))}
                                </IonRow>
                            </IonGrid>
                        </div>
                    </div>
                </IonContent>
                <div className="modal-footer">
                    <IonButton fill="clear" color="medium" onClick={() => setShowModal(false)}>Cancel</IonButton>
                    <IonButton onClick={handleSubmit} className="save-btn" color="primary">Save Staff Member</IonButton>
                </div>
            </IonModal>
        </>
    );
};

export default StaffContainer;