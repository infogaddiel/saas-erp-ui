import React, { useEffect, useState } from 'react';
import {
  IonButton, IonIcon, IonModal, IonContent, IonInput, IonToggle,
  useIonAlert, useIonLoading, IonSearchbar,
} from '@ionic/react';
import {
  addOutline, trashOutline, closeOutline, saveOutline,
  shieldOutline, pencilOutline,
} from 'ionicons/icons';
import { roleService } from '../../../api/roleService';
import { Role } from '../../../interfaces/Role';
import { getAuthData } from '../../../utility/authUtils';
import '../Question/Question.css';

const PROTECTED_LEVEL = 1;

const RoleContainer: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [filtered, setFiltered] = useState<Role[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<Role>({ type: '', level: 2, is_active: true });

  const [presentAlert] = useIonAlert();
  const [presentLoading, dismissLoading] = useIonLoading();

  const { role: userRole } = getAuthData();
  const isSuperAdmin = userRole === 'Super Admin';

  const load = async () => {
    try {
      const res = await roleService.getRoles();
      const data: Role[] = res?.data || [];
      setRoles(data);
      setFiltered(data);
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(q ? roles.filter(r => r.type.toLowerCase().includes(q)) : roles);
  }, [search, roles]);

  const openCreate = () => {
    setIsEditMode(false);
    setFormData({ type: '', level: 2, is_active: true });
    setShowModal(true);
  };

  const openEdit = (role: Role) => {
    setIsEditMode(true);
    setFormData({ ...role });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.type.trim()) {
      presentAlert({ header: 'Error', message: 'Role name is required.', buttons: ['OK'] });
      return;
    }
    if (!formData.level || formData.level < 2) {
      presentAlert({ header: 'Error', message: 'Level must be 2 or higher (1 is reserved for Super Admin).', buttons: ['OK'] });
      return;
    }

    await presentLoading(isEditMode ? 'Updating...' : 'Creating...');
    try {
      if (isEditMode && formData.id) {
        await roleService.updateRole(formData.id, { type: formData.type, level: formData.level, is_active: formData.is_active });
      } else {
        await roleService.createRole({ type: formData.type, level: formData.level, is_active: formData.is_active });
      }
      setShowModal(false);
      load();
    } catch (err: any) {
      presentAlert({
        header: 'Error',
        message: err?.response?.data?.message || 'Failed to save role.',
        buttons: ['OK'],
      });
    } finally {
      dismissLoading();
    }
  };

  const handleDelete = (role: Role) => {
    presentAlert({
      header: 'Delete Role',
      message: `Delete "${role.type}"? Users assigned this role will be unassigned.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete', role: 'destructive',
          handler: async () => {
            await presentLoading('Deleting...');
            try {
              await roleService.deleteRole(role.id!);
              load();
            } catch (err: any) {
              presentAlert({
                header: 'Error',
                message: err?.response?.data?.message || 'Failed to delete role.',
                buttons: ['OK'],
              });
            } finally {
              dismissLoading();
            }
          },
        },
      ],
    });
  };

  const levelBadgeColor = (level: number) => {
    if (level === 1) return '#ef4444';
    if (level === 2) return '#f97316';
    return '#6366f1';
  };

  return (
    <div className="invoice-container">
      <div className="page-header-section">
        <div className="search-wrapper">
          <IonSearchbar
            placeholder="Search roles..."
            className="erp-searchbar"
            value={search}
            onIonInput={(e) => setSearch(e.detail.value!)}
          />
        </div>
        {isSuperAdmin && (
          <div className="page-action-bar">
            <IonButton size="small" className="btn-primary" onClick={openCreate}>
              <IonIcon icon={addOutline} slot="start" /> New Role
            </IonButton>
          </div>
        )}
      </div>

      <div className="table-wrapper">
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: '45%' }}>Role Name</th>
              <th style={{ width: '20%' }}>Level</th>
              <th style={{ width: '15%' }}>Status</th>
              {isSuperAdmin && <th className="ion-text-center" style={{ width: '20%' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((role) => (
                <tr key={role.id}>
                  <td className="bold-text" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <IonIcon icon={shieldOutline} style={{ color: levelBadgeColor(role.level), fontSize: 16 }} />
                    {role.type}
                  </td>
                  <td>
                    <span
                      className="status-badge"
                      style={{
                        backgroundColor: levelBadgeColor(role.level) + '22',
                        color: levelBadgeColor(role.level),
                        fontWeight: 600,
                        padding: '2px 10px',
                        borderRadius: 12,
                      }}
                    >
                      Level {role.level}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${role.is_active ? 'general' : 'feedback'}`}>
                      {role.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  {isSuperAdmin && (
                    <td className="ion-text-center">
                      <IonButton
                        fill="clear"
                        disabled={role.level === PROTECTED_LEVEL}
                        onClick={() => openEdit(role)}
                      >
                        <IonIcon icon={pencilOutline} color="primary" />
                      </IonButton>
                      <IonButton
                        fill="clear"
                        disabled={role.level === PROTECTED_LEVEL}
                        onClick={() => handleDelete(role)}
                      >
                        <IonIcon icon={trashOutline} color="danger" />
                      </IonButton>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isSuperAdmin ? 4 : 3} className="ion-text-center" style={{ padding: 20 }}>
                  No roles found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)} className="compact-question-modal">
        <div className="modal-header-custom">
          <div className="header-title-box">
            <IonIcon icon={shieldOutline} className="header-icon" />
            <h3>{isEditMode ? 'Edit Role' : 'New Role'}</h3>
          </div>
          <IonIcon icon={closeOutline} className="close-icon" onClick={() => setShowModal(false)} />
        </div>

        <IonContent className="ion-padding" style={{ '--background': '#ffffff' }}>
          <div className="form-container">
            <div className="form-group">
              <label className="field-label">Role Name</label>
              <IonInput
                className="styled-input"
                placeholder="e.g., Manager"
                value={formData.type}
                onIonInput={(e) => setFormData({ ...formData, type: e.detail.value! })}
              />
            </div>

            <div className="form-group">
              <label className="field-label">
                Level <span style={{ color: '#94a3b8', fontWeight: 400 }}>(higher number = lower privilege, min 2)</span>
              </label>
              <IonInput
                className="styled-input"
                type="number"
                min={2}
                placeholder="e.g., 2 for Admin, 3 for Staff"
                value={formData.level}
                onIonInput={(e) => setFormData({ ...formData, level: parseInt(e.detail.value! || '2') })}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label className="field-label" style={{ margin: 0 }}>Active</label>
              <IonToggle
                checked={formData.is_active}
                onIonChange={(e) => setFormData({ ...formData, is_active: e.detail.checked })}
              />
            </div>
          </div>
        </IonContent>

        <div className="modal-footer-erp">
          <IonButton fill="clear" color="medium" onClick={() => setShowModal(false)}>Cancel</IonButton>
          <IonButton className="btn-save" onClick={handleSubmit}>
            <IonIcon icon={saveOutline} slot="start" />
            {isEditMode ? 'Update Role' : 'Create Role'}
          </IonButton>
        </div>
      </IonModal>
    </div>
  );
};

export default RoleContainer;
