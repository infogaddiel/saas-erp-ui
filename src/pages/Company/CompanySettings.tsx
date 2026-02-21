import React, { useState, useEffect, useRef } from 'react';
import {
    IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonInput,
    IonTextarea, IonButton, IonButtons, IonBackButton, IonGrid,
    IonRow, IonCol, IonCard, IonCardContent, IonNote, IonImg,
    IonIcon, useIonToast, IonSpinner
} from '@ionic/react';
import { globeOutline, mailOutline, callOutline, businessOutline, cloudUploadOutline } from 'ionicons/icons';
import { Company } from '../../interfaces/Company';
import { companyService } from '../../api/companyService';
import { getCompanyId } from '../../utility/authUtils';
import './CompanySettings.css';
import Header from '../../components/Header';

const CompanySettings: React.FC = () => {
    const [present] = useIonToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(false);
    const [initialFetch, setInitialFetch] = useState(true);
    const [formData, setFormData] = useState<Company>({
        name: '',
        address: '',
        gst_number: '',
        mobile: '',
        email: '',
        website_url: '',
        branch1_address: '',
        branch2_address: '',
        branch3_address: '',
        logo: null,
    });

    const [previewUrl, setPreviewUrl] = useState<string>('');

    useEffect(() => {
        loadCompanyData();
    }, []);

    const loadCompanyData = async () => {
        try {
            const companyId = getCompanyId();
            if (companyId) {
                const response = await companyService.getCompanyDetails(companyId);
                if (response.success) {
                    setFormData(response.data);
                    if (typeof response.data.logo === 'string') {
                        setPreviewUrl(response.data.logo);
                    }
                }
            }
        } catch (error) {
            present({ message: 'Error fetching details', duration: 2000, color: 'danger' });
        } finally {
            setInitialFetch(false);
        }
    };

    const handleInputChange = (e: CustomEvent) => {
        const name = (e.target as HTMLInputElement).name;
        const value = e.detail.value;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData(prev => ({ ...prev, logo: file }));
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        const companyId = getCompanyId();
        if (!companyId) {
            present({ message: 'Session expired. Please login again.', color: 'warning' });
            return;
        }

        setLoading(true);
        try {
            let logoUrlToSave = formData.logo;

            // 1. Handle Logo Upload if it's a new file
            if (formData.logo instanceof File) {
                try {
                    logoUrlToSave = await companyService.uploadLogo(formData.logo);
                } catch (err: any) {
                    const msg = err.response?.data?.message || 'Logo upload failed';
                    present({ message: msg, color: 'danger', duration: 3000 });
                    setLoading(false);
                    return;
                }
            }

            // 2. Update Company Details with the URL
            const finalPayload = {
                company_id: companyId, // Required by your update logic
                name: formData.name,
                address: formData.address,
                branch1_address: formData.branch1_address,
                branch2_address: formData.branch2_address,
                branch3_address: formData.branch3_address,
                gst_number: formData.gst_number,
                mobile: formData.mobile,
                email: formData.email,
                website_url: formData.website_url,
                pan_number: formData.pan_number,
                logo: logoUrlToSave // Now a string URL
            };
            const result = await companyService.updateCompany(companyId, finalPayload);

            if (result.success) {
                // Notify other components (like Sidebar) that the logo has changed
                const event = new CustomEvent('logoUpdated', { detail: logoUrlToSave });
                window.dispatchEvent(event);
                present({ message: 'Profile updated successfully', duration: 2000, color: 'success' });
                loadCompanyData();
            }
        } catch (error) {
            present({ message: 'Failed to update profile', duration: 2000, color: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    if (initialFetch) return (
        <IonPage><IonContent className="ion-text-center ion-padding"><IonSpinner name="crescent" /></IonContent></IonPage>
    );

    return (
        <IonPage>
            <Header title="Company Profile" details="Manage Company Details" />

            <IonContent className="ion-padding gray-bg">
                <div className="settings-container">
                    <IonCard className="ion-no-margin">
                        <IonCardContent className="ion-padding">

                            <h2 className="section-title">Identity & Branding</h2>
                            <p className="section-subtitle">Manage company name and corporate logo</p>

                            <IonGrid className="ion-no-padding">
                                <IonRow>
                                    <IonCol size="12">
                                        <label className="input-label">Company Legal Name</label>
                                        <IonInput
                                            fill="outline"
                                            name="name"
                                            className="custom-input"
                                            value={formData.name}
                                            onIonInput={handleInputChange}
                                        />
                                    </IonCol>
                                </IonRow>

                                <IonRow className="ion-margin-top ion-align-items-center">
                                    <IonCol size="12"><label className="input-label">Company Logo</label></IonCol>
                                    <IonCol size="auto">
                                        <div className="logo-preview-box">
                                            <IonImg src={previewUrl || 'assets/imgs/placeholder.png'} style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                                        </div>
                                    </IonCol>
                                    <IonCol className="ion-padding-start">
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <IonInput
                                                fill="outline"
                                                readonly
                                                className="custom-input"
                                                value={formData.logo instanceof File ? formData.logo.name : "Current Logo"}
                                            />
                                            <input type="file" ref={fileInputRef} hidden onChange={handleFileChange} accept="image/*" />
                                            <IonButton fill="solid" color="light" onClick={() => fileInputRef.current?.click()}>
                                                <IonIcon icon={cloudUploadOutline} slot="start" /> Browse
                                            </IonButton>
                                        </div>
                                        {/* NEW DESCRIPTIVE NOTE */}
                                        <IonNote style={{ fontSize: '0.8rem', marginTop: '8px', display: 'block', lineHeight: '1.4' }}>
                                            Upload your organization logo for the login page (PNG, JPG, SVG - Max 5MB).
                                            This will appear below the app name.
                                        </IonNote>
                                    </IonCol>
                                </IonRow>
                            </IonGrid>

                            <hr className="divider" />

                            <h2 className="section-title">Contact & Statutory Details</h2>
                            <p className="section-subtitle">Address and tax information for business transactions</p>
                            <IonGrid className="ion-no-padding">
                                <IonRow>
                                    <IonCol size="12">
                                        <label className="input-label">Registered Office Address</label>
                                        <IonTextarea fill="outline" name="address" className="custom-input" value={formData.address} onIonInput={handleInputChange} rows={3} />
                                    </IonCol>
                                </IonRow>
                                <IonRow>
                                    <IonCol size="12" sizeMd="4">
                                        <label className="input-label">Branch 1 Office Address</label>
                                        <IonTextarea fill="outline" name="branch1_address" className="custom-input" value={formData.branch1_address} onIonInput={handleInputChange} rows={3} />
                                    </IonCol>
                                     <IonCol size="12" sizeMd="4">
                                        <label className="input-label">Branch 2 Office Address</label>
                                        <IonTextarea fill="outline" name="branch2_address" className="custom-input" value={formData.branch2_address} onIonInput={handleInputChange} rows={3} />
                                    </IonCol>
                                     <IonCol size="12" sizeMd="4">
                                        <label className="input-label">Branch 3 Office Address</label>
                                        <IonTextarea fill="outline" name="branch3_address" className="custom-input" value={formData.branch3_address} onIonInput={handleInputChange} rows={3} />
                                    </IonCol>
                                </IonRow>
                                {/* GST and PAN Row */}
                                <IonRow className="ion-margin-top">
                                    <IonCol size="12" sizeMd="6" className="ion-padding-end-md">
                                        <label className="input-label">GSTIN Number</label>
                                        <IonInput
                                            fill="outline"
                                            name="gst_number"
                                            className="custom-input"
                                            value={formData.gst_number}
                                            onIonInput={handleInputChange}
                                            placeholder="e.g. 07AAAAA0000A1Z5"
                                        />
                                    </IonCol>
                                    <IonCol size="12" sizeMd="6">
                                        <label className="input-label">PAN Number</label>
                                        <IonInput
                                            fill="outline"
                                            name="pan_number"
                                            className="custom-input"
                                            value={formData.pan_number}
                                            onIonInput={handleInputChange}
                                            placeholder="e.g. ABCDE1234F"
                                        />
                                    </IonCol>
                                </IonRow>
                                <IonRow className="ion-margin-top">
                                    <IonCol size="12" sizeMd="4" className="ion-padding-end-md">
                                        <label className="input-label">Phone Number</label>
                                        <IonInput fill="outline" name="mobile" className="custom-input" value={formData.mobile} onIonInput={handleInputChange}>
                                            <IonIcon icon={callOutline} slot="start" className="ion-padding-start" color="medium" />
                                        </IonInput>
                                    </IonCol>
                                    <IonCol size="12" sizeMd="4">
                                        <label className="input-label">Business Email</label>
                                        <IonInput fill="outline" name="email" className="custom-input" value={formData.email} onIonInput={handleInputChange}>
                                            <IonIcon icon={mailOutline} slot="start" className="ion-padding-start" color="medium" />
                                        </IonInput>
                                    </IonCol>
                                    <IonCol size="12" sizeMd="4">
                                        <label className="input-label">Website</label>
                                        <IonInput fill="outline" name="website_url" className="custom-input" value={formData.website_url} onIonInput={handleInputChange}>
                                            <IonIcon icon={globeOutline} slot="start" className="ion-padding-start" color="medium" />
                                        </IonInput>
                                    </IonCol>
                                </IonRow>

                            </IonGrid>

                            <div className="ion-text-end" style={{ marginTop: '40px' }}>
                                <IonButton className="save-btn" onClick={handleSave} disabled={loading}>
                                    {loading ? <IonSpinner name="dots" /> : 'Update'}
                                </IonButton>
                            </div>

                        </IonCardContent>
                    </IonCard>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default CompanySettings;