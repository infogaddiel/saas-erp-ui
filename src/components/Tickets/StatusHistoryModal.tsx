import { IonButton, IonButtons, IonContent, IonHeader, IonModal, IonSpinner, IonTitle, IonToolbar } from "@ionic/react";
import { useEffect, useState } from "react";
import { ticketService } from "../../api/ticketService";
import { getStatusLabel } from "../../utility/commonUtils";

const StatusHistoryModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  ticketId: number | null;
}> = ({ isOpen, onClose, ticketId }) => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && ticketId) {
      setLoading(true);
      fetchStatusHistory(ticketId);
    }
  }, [isOpen, ticketId]);

  const fetchStatusHistory = async (id: number) => {
  try {
    setLoading(true);
    // Use the 'id' passed into the function, not the 'ticketId' from props
    const res = await ticketService.getTicketStatusHistory(id);
    
    // Safety check: ensure the data path matches your API response interface
    const historyData = Array.isArray(res) ? res : res.data;
    setHistory(historyData);
  } catch (err) {
    console.error("Error fetching history", err);
    setHistory([]);
  } finally {
    setLoading(false);
  }
};

  return (
    <IonModal 
      isOpen={isOpen} 
      onDidDismiss={onClose}
      breakpoints={[0, 0.5, 0.8]} 
      initialBreakpoint={0.5} // Opens halfway for a sleek popup feel
    >
      <IonHeader>
        <IonToolbar>
          <IonTitle>Status Audit Log</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>Close</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {loading ? (
          <IonSpinner name="crescent" />
        ) : (
          <div className="audit-timeline">
            {history.map((log) => (
              <div key={log.id} className="audit-item">
                <div className={`audit-dot status-bg-${log.status_id}`} />
                <div className="audit-content">
                  <div className="audit-status-name">
                    Moved to <strong>{getStatusLabel(log.status_id)}</strong>
                  </div>
                  <div className="audit-meta">
                    Updated by {log.user?.name || `User #${log.changed_by}`}
                  </div>
                  <div className="audit-time">
                    {new Date(log.changed_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </IonContent>
    </IonModal>
  );
};

export default StatusHistoryModal;