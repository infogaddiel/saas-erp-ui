import React, { useEffect, useState } from 'react';
import {
    IonButton, IonIcon, IonSearchbar, IonModal,
    useIonAlert, useIonLoading, IonContent, IonTextarea, IonSelect, IonSelectOption
} from '@ionic/react';
import {
    addOutline, trashOutline, closeOutline, saveOutline, documentTextOutline, pencilOutline
} from 'ionicons/icons';
import { questionService } from '../../../api/questionService';
import { Question } from '../../../interfaces/Question';
import './question.css';

const QuestionContainer: React.FC = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modal & Mode state
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    const [presentAlert] = useIonAlert();
    const [presentLoading, dismissLoading] = useIonLoading();

    const initialFormState: Question = {
        question: '',
        type: 'General',
        is_deleted: false
    };

    const [formData, setFormData] = useState<Question>(initialFormState);

    const loadData = async () => {
        try {
            const response = await questionService.getQuestions();
            const items = response?.data || response || [];
            const activeItems = items.filter((q: Question) => !q.is_deleted);
            setQuestions(activeItems);
            setFilteredQuestions(activeItems);
        } catch (err) {
            console.error('Error fetching questions:', err);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredQuestions(questions);
        } else {
            const lowerCaseQuery = searchQuery.toLowerCase();
            setFilteredQuestions(
                questions.filter(q =>
                    q.question.toLowerCase().includes(lowerCaseQuery) ||
                    (q.type && q.type.toLowerCase().includes(lowerCaseQuery))
                )
            );
        }
    }, [searchQuery, questions]);

    const handleEdit = (q: Question) => {
        setIsEditMode(true);
        setFormData({ ...q });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        presentAlert({
            header: 'Delete Question',
            message: 'Are you sure you want to delete this question?',
            buttons: [
                { text: 'Cancel', role: 'cancel' },
                {
                    text: 'Delete',
                    role: 'destructive',
                    handler: async () => {
                        await presentLoading('Deleting...');
                        try {
                            await questionService.deleteQuestion(id);
                            loadData();
                        } finally {
                            dismissLoading();
                        }
                    }
                }
            ]
        });
    };

    const handleSubmit = async () => {
        if (!formData.question.trim()) {
            presentAlert({ header: 'Error', message: 'Question text is required.', buttons: ['OK'] });
            return;
        }

        await presentLoading(isEditMode ? 'Updating Question...' : 'Saving Question...');
        try {
            if (isEditMode && formData.id) {
                await questionService.updateQuestion(formData.id, formData);
            } else {
                await questionService.addQuestion(formData);
            }
            setShowModal(false);
            setFormData(initialFormState);
            loadData();
        } catch (err: any) {
            console.error(err);
            presentAlert({
                header: 'Save Failed',
                message: err.response?.data?.message || 'Failed to save question.',
                buttons: ['OK']
            });
        } finally {
            dismissLoading();
        }
    };

    return (
        <div className="invoice-container">
            <div className="page-header-section">
                <div className="search-wrapper">
                    <IonSearchbar 
                        placeholder="Search questions..." 
                        className="erp-searchbar"
                        value={searchQuery}
                        onIonInput={(e) => setSearchQuery(e.detail.value!)}
                    />
                </div>
                <div className="page-action-bar">
                    <IonButton size="small" className="btn-primary" onClick={() => { setIsEditMode(false); setFormData(initialFormState); setShowModal(true); }}>
                        <IonIcon icon={addOutline} slot="start" /> New Question
                    </IonButton>
                </div>
            </div>

            <div className="table-wrapper">
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th style={{ width: '60%' }}>Question</th>
                            <th style={{ width: '20%' }}>Type</th>
                            <th className="ion-text-center" style={{ width: '20%' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredQuestions.length > 0 ? (
                            filteredQuestions.map((q) => (
                                <tr key={q.id}>
                                    <td className="bold-text">{q.question}</td>
                                    <td>
                                        <span className={`status-badge ${q.type ? q.type.toLowerCase() : 'general'}`}>
                                            {q.type || 'General'}
                                        </span>
                                    </td>
                                    <td className="ion-text-center">
                                        <IonButton fill="clear" onClick={() => handleEdit(q)}>
                                            <IonIcon icon={pencilOutline} color="primary" />
                                        </IonButton>
                                        <IonButton fill="clear" onClick={() => handleDelete(q.id!)}>
                                            <IonIcon icon={trashOutline} color="danger" />
                                        </IonButton>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} className="ion-text-center" style={{ padding: '20px' }}>
                                    No questions found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Centered Modal Popup for Add & Edit */}
            <IonModal 
                isOpen={showModal} 
                onDidDismiss={() => setShowModal(false)}
                className="compact-question-modal"
            >
                <div className="modal-header-custom">
                    <div className="header-title-box">
                        <IonIcon icon={documentTextOutline} className="header-icon" />
                        <h3>{isEditMode ? 'Edit Question' : 'Add New Question'}</h3>
                    </div>
                    <IonIcon icon={closeOutline} className="close-icon" onClick={() => setShowModal(false)} />
                </div>

                <IonContent className="ion-padding" style={{ '--background': '#ffffff' }}>
                    <div className="form-container">
                        <div className="form-group">
                            <label className="field-label">Question Text</label>
                            <IonTextarea
                                className="styled-input"
                                rows={3}
                                placeholder="e.g., What is the return policy for damaged items?"
                                value={formData.question}
                                onIonInput={e => setFormData({ ...formData, question: e.detail.value! })}
                            />
                        </div>

                        <div className="form-group">
                            <label className="field-label">Question Type</label>
                            <IonSelect
                                className="styled-input"
                                interface="popover"
                                value={formData.type}
                                onIonChange={e => setFormData({ ...formData, type: e.detail.value! })}
                            >
                                <IonSelectOption value="General">General</IonSelectOption>
                                <IonSelectOption value="Technical">Technical</IonSelectOption>
                                <IonSelectOption value="Feedback">Feedback</IonSelectOption>
                                <IonSelectOption value="Onboarding">Onboarding</IonSelectOption>
                            </IonSelect>
                        </div>
                    </div>
                </IonContent>

                <div className="modal-footer-erp">
                    <IonButton fill="clear" color="medium" onClick={() => setShowModal(false)}>
                        Cancel
                    </IonButton>
                    <IonButton className="btn-save" onClick={handleSubmit}>
                        <IonIcon icon={saveOutline} slot="start" /> {isEditMode ? 'Update Question' : 'Create Question'}
                    </IonButton>
                </div>
            </IonModal>
        </div>
    );
};

export default QuestionContainer;