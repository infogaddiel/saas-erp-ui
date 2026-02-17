import React, { useEffect, useRef, useState } from 'react';
import {
    IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonInput,
    IonSelect, IonSelectOption, IonTextarea, IonButton,
    IonIcon, IonDatetime, IonDatetimeButton, IonModal,
    IonSpinner,
    IonList,
    IonItem,
    IonLabel,
    useIonToast,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons
} from '@ionic/react';
import { cameraOutline, videocamOutline, pencilOutline, closeOutline, trashOutline, checkmarkOutline } from 'ionicons/icons';
import SignatureCanvas from 'react-signature-canvas';
import { customerService } from '../../api/customerService';
import { userService } from '../../api/userService';
import { ticketService } from '../../api/ticketService';
import { formatDateToDMY } from '../../utility/commonUtils';
import { useParams } from 'react-router-dom';
const ServiceReportContainer: React.FC = () => {
    const [formData, setFormData] = useState<any>({
        customer_name: '',
        customer_id: null,
        email: '',
        phone: '',
        service_address: '',
        service_type: 'Repair',
        user_id: '',
        technician_name: '',
        equipment_type: '',
        equipment_model: '',
        work_performed: '',
        parts_used: '',
        labor_hours: 0,
        photos: [] as string[],
        video: null as string | null,
        customer_signature: null as string | null,
        report_status: 'Draft',
        service_date: new Date().toISOString().split('T')[0]
    });

    const [customerSuggestions, setCustomerSuggestions] = useState<any[]>([]);
    const [ticketSuggestions, setTicketSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showTicketSuggestions, setShowTicketSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [technicians, setTechnicians] = useState<any[]>([]);
    const [photoFiles, setPhotoFiles] = useState<File[]>([]);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const { ticketId, serviceId } = useParams<{ ticketId: string; serviceId: string }>();
    const [previews, setPreviews] = useState<{ photos: string[], video: string | null }>({
        photos: [],
        video: null
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [present] = useIonToast();
    const isEditMode = Boolean(serviceId);
    const sigCanvas = useRef<SignatureCanvas>(null);

    useEffect(() => {
        fetchTechnicians();
        if (isEditMode && serviceId) {
            loadExistingReport();
        }
    }, [serviceId]);

    useEffect(() => {
        const canvas = (sigCanvas.current as any)?._canvas;
        if (!canvas) return;

        // The ResizeObserver detects the EXACT pixel size of the container
        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                if (width > 0 && height > 0) {
                    // Sync the internal drawing resolution to the physical size
                    canvas.width = width;
                    canvas.height = height;

                    // Re-enable the engine and clear to prevent distortion
                    (sigCanvas.current as any)?.on();
                    (sigCanvas.current as any)?.clear();
                    console.log("Canvas Engine Started:", width, "x", height);
                }
            }
        });

        observer.observe(canvas.parentElement);
        return () => observer.disconnect();
    }, []);
    const handleCustomerSearch = async (query: string) => {
        setFormData({ ...formData, customer_name: query });

        if (query.length > 2) {
            setIsSearching(true);
            try {
                const res = await customerService.getCustomersDropDown(query);
                setCustomerSuggestions(res.data);
                setShowSuggestions(res.data.length > 0);
            } catch (err) {
                console.error("Search error", err);
            } finally {
                setIsSearching(false);
            }
        } else {
            setShowSuggestions(false);
        }
    };

    // Handle Ticket Search (Filtered by Customer)
    const handleTicketSearch = async (query: string) => {
        setFormData({ ...formData, ticket_id: 0 }); // Reset ID while typing
        if (formData.customer_id && query.length > 0) {
            try {
                const res = await ticketService.getTicketsDropDown(query, formData.customer_id);
                setTicketSuggestions(res.data);
                setShowTicketSuggestions(res.data.length > 0);
            } catch (err) { console.error(err); }
        }
    };

    const fetchTechnicians = async () => {
        try {
            const response = await userService.getUsersByRole(4);
            setTechnicians(response.data || []);
        } catch (err) {
            console.error("Could not load technicians", err);
        }
    };

    const selectCustomer = (customer: any) => {
        setFormData({
            ...formData,
            customer_name: customer.name,
            customer_id: customer.id,
            email: customer.email || '',
            phone: customer.mobile || '',
            service_address: customer.address || '',
        });
        setShowSuggestions(false);
    };

    // Handle Multiple Photo Selection
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setPhotoFiles(prev => [...prev, ...filesArray]);

            // Create local URLs for UI preview
            const newPreviews = filesArray.map(file => URL.createObjectURL(file));
            setPreviews(prev => ({ ...prev, photos: [...prev.photos, ...newPreviews] }));
        }
    };

    // Handle Single Video Selection
    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const maxSize = 20 * 1024 * 1024; // 20MB in bytes
            if (file.size > maxSize) {
                present({
                    header: 'File Too Large',
                    message: `The video is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Please record a shorter video (under 10 seconds) or lower your camera resolution.`,
                    buttons: ['OK'],
                    color: 'danger'
                });
                return;
            } else {
                setVideoFile(file);
                setPreviews(prev => ({ ...prev, video: URL.createObjectURL(file) }));
            }
        }
    };

    // Function to remove a specific photo by index
    const removePhoto = (index: number) => {
        // Remove from the actual File array (for API upload)
        setPhotoFiles(prev => prev.filter((_, i) => i !== index));

        // Remove from the Preview array (for UI display)
        setPreviews(prev => ({
            ...prev,
            photos: prev.photos.filter((_, i) => i !== index)
        }));
    };

    const saveSignatureToState = async () => {
        if (sigCanvas.current?.isEmpty()) {
            present({ message: "Please provide a signature", color: "warning" });
            return;
        }


        try {
            setLoading(true);

            // Access the raw canvas element directly
            const canvas = (sigCanvas.current as any)?._canvas;

            if (!canvas) {
                throw new Error("Canvas element not found");
            }

            // Use the raw canvas to get the data URL (Bypassing the broken trim function)
            const dataUrl = canvas.toDataURL('image/png');

            // Convert to File
            const blob = await (await fetch(dataUrl)).blob();
            const file = new File([blob], "signature.png", { type: "image/png" });
            // 3. Use your existing upload service
            const uploadedUrl = await ticketService.upload(file);
            setFormData({ ...formData, customer_signature: uploadedUrl });
            present({ message: "Signature confirmed!", color: "success", duration: 1000 });
        } catch (error) {
            present({ message: "Failed to upload signature", color: "danger" });
        } finally {
            setLoading(false);
        }
    };
    const handleSave = async () => {
        setLoading(true);
        try {
            // 1. Upload All Photos
            const photoUrls = await Promise.all(
                photoFiles.map(file => ticketService.upload(file))
            );

            // 2. Upload Video (if exists)
            let videoUrl = null;
            if (videoFile) {
                videoUrl = await ticketService.upload(videoFile);
            }
            // Prepare payload: Exclude readonly fields and ensure numeric types
            const payload = {
                ...formData,
                labor_hours: Number(formData.labor_hours),
                service_date: formatDateToDMY(formData.service_date),
                photos: photoUrls, // Array of strings from API
                video: videoUrl,   // Single string from API
            };
            if (isEditMode) {
                await ticketService.updateServiceReport(Number(ticketId), Number(serviceId), payload);
                present({ message: 'Report updated successfully!', color: 'success' });
            } else {
                await ticketService.createServiceReport(Number(formData.ticket_id), payload);
                present({ message: 'Report created successfully!', color: 'success' });
            }

            window.history.back();
        } catch (error) {
            present({ message: 'Media upload failed', color: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    const loadExistingReport = async () => {
        setLoading(true);
        try {
            // Note: You'll need this API method in ticketService
            const response = await ticketService.getServiceReportById(Number(ticketId), Number(serviceId));
            const data = response.data;
            if (!data) {
                present({ message: "Report not found", color: 'danger' });
                return;
            }

            // TypeScript now knows 'data' is NOT undefined here
            setFormData({
                ...data,
                service_date: data.service_date ? new Date(data.service_date).toISOString() : new Date().toISOString()
            });
            // Set previews for existing media
            setPreviews({
                photos: data.photos || [],
                video: data.video || null
            });
        } catch (err) {
            present({ message: "Error loading report data", color: 'danger' });
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="report-form-wrapper">
            {/* Customer Information Card */}
            <IonCard className="erp-card">
                <IonCardContent>
                    <h3 className="card-section-title">{isEditMode ? `Edit Report #${serviceId}` : 'Customer Information'}</h3>
                    <IonGrid className="ion-no-padding">
                        <IonRow>
                            <IonCol size="12" sizeMd="6" className="ion-padding-end-md">
                                <label className="input-label">Customer Name *</label>
                                <IonInput
                                    fill="outline"
                                    className="custom-input"
                                    value={formData.customer_name}
                                    placeholder="Start typing customer name..."
                                    onIonInput={(e: any) => handleCustomerSearch(e.detail.value!)}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay to allow click
                                />

                                {isSearching && <IonSpinner name="crescent" className="input-spinner" />}

                                {/* Suggestions Dropdown */}
                                {showSuggestions && (
                                    <IonList className="autocomplete-list">
                                        {customerSuggestions.map((customer) => (
                                            <IonItem
                                                button
                                                key={customer.id}
                                                onClick={() => selectCustomer(customer)}
                                                detail={false}
                                            >
                                                <IonLabel>
                                                    <h2>{customer.name}</h2>
                                                    <p>{customer.mobile}</p>
                                                </IonLabel>
                                            </IonItem>
                                        ))}
                                    </IonList>
                                )}
                            </IonCol>
                            <IonCol size="12" sizeMd="6">
                                <label className="input-label">Email</label>
                                <IonInput
                                    fill="outline"
                                    className="custom-input"
                                    value={formData.email}
                                    onIonInput={(e) => setFormData({ ...formData, email: e.detail.value })}
                                />
                            </IonCol>
                        </IonRow>
                        <IonRow className="ion-margin-top">
                            <IonCol size="12" sizeMd="6" className="ion-padding-end-md">
                                <label className="input-label">Phone</label>
                                <IonInput
                                    fill="outline"
                                    className="custom-input"
                                    placeholder="9990008888"
                                    value={formData.phone} // Binds the state
                                    onIonInput={(e) => setFormData({ ...formData, phone: e.detail.value! })}
                                />
                            </IonCol>
                            <IonCol size="12" sizeMd="6">
                                <label className="input-label">Service Date</label>
                                <div className="date-input-container">
                                    <IonDatetimeButton datetime="service-date" />
                                    <IonModal keepContentsMounted={true}>
                                        <IonDatetime id="service-date" presentation="date"
                                            value={formData.service_date}
                                            onIonChange={e => {
                                                const selectedDate = e.detail.value;
                                                setFormData({
                                                    ...formData,
                                                    service_date: selectedDate
                                                });
                                            }}
                                        />
                                    </IonModal>
                                </div>
                            </IonCol>
                        </IonRow>
                        <IonRow className="ion-margin-top">
                            <IonCol size="12">
                                <label className="input-label">Service Address *</label>
                                <IonInput
                                    fill="outline"
                                    className="custom-input"
                                    placeholder="Enter full job site address"
                                    value={formData.service_address}
                                    onIonInput={(e) => setFormData({ ...formData, service_address: e.detail.value! })}
                                />
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                </IonCardContent>
            </IonCard>

            {/* Service Details Card */}
            <IonCard className="erp-card ion-margin-top">
                <IonCardContent>
                    <h3 className="card-section-title">Service Details</h3>
                    <IonGrid className="ion-no-padding">
                        <IonRow>
                            <IonCol size="12" sizeMd="6" style={{ position: 'relative' }}>
                                <label className="input-label">Reference Ticket ID *</label>
                                <IonInput
                                    fill="outline"
                                    className="custom-input"
                                    value={formData.ticket_number}
                                    placeholder={formData.customer_id ? "Search tickets..." : "Select customer first"}
                                    disabled={!formData.customer_id}
                                    onIonInput={(e: any) => handleTicketSearch(e.detail.value!)}
                                />
                                {showTicketSuggestions && (
                                    <IonList className="autocomplete-list">
                                        {ticketSuggestions.map((t: any) => (
                                            <IonItem button key={t.id} onClick={() => {
                                                setFormData({ ...formData, ticket_id: t.id, ticket_number: t.ticket_number });
                                                setShowTicketSuggestions(false);
                                            }}>
                                                <IonLabel>{t.ticket_number}</IonLabel>
                                            </IonItem>
                                        ))}
                                    </IonList>
                                )}
                            </IonCol>
                            <IonCol size="12" sizeMd="6" className="ion-padding-end-md">
                                <label className="input-label">Service Type</label>
                                <IonSelect fill="outline" className="custom-input" value="Repair">
                                    <IonSelectOption value="Repair">Repair</IonSelectOption>
                                    <IonSelectOption value="Maintenance">Maintenance</IonSelectOption>
                                    <IonSelectOption value="Installation">Installation</IonSelectOption>
                                </IonSelect>
                            </IonCol>
                            <IonCol size="12" sizeMd="6">
                                <label className="input-label">Technician</label>
                                <IonSelect fill="outline" className="custom-input" value={formData.user_id} onIonChange={e => setFormData({ ...formData, user_id: e.detail.value })}>
                                    {technicians.map(tech => (
                                        <IonSelectOption key={tech.id} value={tech.id}>{tech.name}</IonSelectOption>
                                    ))}
                                </IonSelect>
                            </IonCol>
                        </IonRow>

                    </IonGrid>
                </IonCardContent>
            </IonCard>

            <IonCard className="erp-card">
                <IonCardContent>
                    <h3 className="card-section-title">Equipment & Work Details</h3>
                    <IonGrid className="ion-no-padding">
                        <IonRow>
                            <IonCol size="12" sizeMd="6" className="ion-padding-end-md">
                                <label className="input-label">Equipment Type</label>
                                <IonInput fill="outline" className="custom-input"
                                value={formData.equipment_type}
                                    onIonInput={e => setFormData({ ...formData, equipment_type: e.detail.value! })} />
                            </IonCol>
                            <IonCol size="12" sizeMd="6">
                                <label className="input-label">Equipment Model</label>
                                <IonInput fill="outline" className="custom-input"
                                 value={formData.equipment_model}
                                    onIonInput={e => setFormData({ ...formData, equipment_model: e.detail.value! })} />
                            </IonCol>
                        </IonRow>
                        <IonRow className="ion-margin-top">
                            <IonCol size="12">
                                <label className="input-label">Work Performed</label>
                                <IonTextarea fill="outline" rows={4} className="custom-input"
                                 value={formData.work_performed}
                                    onIonInput={e => setFormData({ ...formData, work_performed: e.detail.value! })} />
                            </IonCol>
                        </IonRow>
                        <IonRow className="ion-margin-top">
                            <IonCol size="12" sizeMd="8" className="ion-padding-end-md">
                                <label className="input-label">Parts Used</label>
                                <IonInput fill="outline" className="custom-input"
                                value={formData.parts_used}
                                    onIonInput={e => setFormData({ ...formData, parts_used: e.detail.value! })} />
                            </IonCol>
                            <IonCol size="12" sizeMd="4">
                                <label className="input-label">Labor Hours</label>
                                <IonInput type="number" fill="outline" className="custom-input"
                                 value={formData.labor_hours}
                                    onIonInput={e => setFormData({ ...formData, labor_hours: Number(e.detail.value!) })} />
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                </IonCardContent>
            </IonCard>

            <IonCard className="erp-card ion-margin-top">
                <IonCardContent>
                    <h3 className="card-section-title">Media Attachments</h3>

                    {/* Photo Grid */}
                    <div className="photo-preview-grid">
                        {previews.photos.map((src, index) => (
                            <div key={index} className="preview-item">
                                <img src={src} alt={`preview-${index}`} />
                                <button
                                    type="button"
                                    className="remove-photo-badge"
                                    onClick={() => removePhoto(index)}
                                >
                                    <IonIcon icon={closeOutline} />
                                </button>
                            </div>
                        ))}
                        <label className="upload-box">
                            <IonIcon icon={cameraOutline} />
                            <span>Add Photo</span>
                            <input type="file" multiple accept="image/*" hidden onChange={handlePhotoChange} />
                        </label>
                    </div>

                    <div className="video-upload-container">
                        <label className="input-label">Video Report</label>

                        {previews.video ? (
                            <div className="video-preview-wrapper">
                                <video src={previews.video} controls className="video-player" />
                                <IonButton
                                    fill="clear"
                                    color="danger"
                                    className="remove-video-btn"
                                    onClick={() => {
                                        setVideoFile(null);
                                        setPreviews(prev => ({ ...prev, video: null }));
                                    }}
                                >
                                    Remove Video
                                </IonButton>
                            </div>
                        ) : (
                            <label className="video-dropzone">
                                <div className="dropzone-content">
                                    <IonIcon icon={videocamOutline} className="dropzone-icon" />
                                    <div className="dropzone-text">
                                        <span className="main-text">Upload Video Report</span>
                                        <span className="sub-text">MP4, MOV or AVI (Max 50MB)</span>
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    accept="video/*"
                                    hidden
                                    onChange={handleVideoChange}
                                />
                            </label>
                        )}
                    </div>
                </IonCardContent>
            </IonCard>
            {/* Media & Status Selection */}
            <IonCard className="erp-card ion-margin-top">
                <IonCardContent>
                    <h3 className="card-section-title ion-margin-top">Report Status</h3>
                    <IonSelect fill="outline" className="custom-input" value="Draft">
                        <IonSelectOption value="Draft">Draft</IonSelectOption>
                        <IonSelectOption value="Pending Approval">Pending Approval</IonSelectOption>
                        <IonSelectOption value="Completed">Completed</IonSelectOption>
                    </IonSelect>
                </IonCardContent>
            </IonCard>

            <IonCard className="erp-card ion-margin-top">
                <IonCardContent>
                    <h3 className="card-section-title">Customer Acknowledgement</h3>
                    <p className="input-label">Please sign below to authorize work completion *</p>

                    <div className="sig-wrapper">
                        {isEditMode && formData.customer_signature && !sigCanvas.current?.isEmpty() === false ? (
                            <div style={{ textAlign: 'center', background: '#f9f9f9' }}>
                                <img
                                    src={formData.customer_signature}
                                    alt="Customer Signature"
                                    style={{ maxHeight: '180px', objectFit: 'contain' }}
                                />
                                <p style={{ fontSize: '12px', color: '#666' }}>Existing Signature Loaded</p>
                            </div>
                        ) : (
                            /* THE CANVAS: Shows for new reports OR if user clears the existing one */
                            <SignatureCanvas
                                ref={sigCanvas}
                                penColor="black"
                                canvasProps={{
                                    className: 'sigCanvas',
                                    style: { width: '100%', height: '200px' }
                                }}
                            />
                        )}
                    </div>

                    <div className="sig-buttons-row">
                        <IonButton fill="clear" color="medium" size="small"
                            onClick={() => {
                                sigCanvas.current?.clear();
                                setFormData({ ...formData, customer_signature: null });
                            }
                            }>
                            <IonIcon slot="start" icon={trashOutline} /> Clear Signature
                        </IonButton>

                        <IonButton fill="outline" color="primary" size="small" onClick={saveSignatureToState}>
                            Confirm Signature
                        </IonButton>
                    </div>
                </IonCardContent>
            </IonCard>

            {/* Footer Actions */}
            <div className="form-actions-footer">
                <IonButton fill="clear" color="medium">Cancel</IonButton>
                <IonButton color="primary" className="submit-btn" onClick={handleSave}>{loading ? <IonSpinner name="dots" /> : (isEditMode ? 'Update Report' : 'Create Report')}</IonButton>
            </div>


        </div>
    );
};

export default ServiceReportContainer;