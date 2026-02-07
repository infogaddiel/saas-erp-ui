import React from 'react';
import { IonButton, IonIcon, IonText } from '@ionic/react';
import { chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, totalPages, onPageChange, totalItems, itemsPerPage 
}) => {
  const startRange = (currentPage - 1) * itemsPerPage + 1;
  const endRange = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        Showing <IonText color="dark"><b>{startRange}-{endRange}</b></IonText> of <b>{totalItems}</b> entries
      </div>
      <div className="pagination-controls">
        <IonButton 
          fill="clear" 
          size="small" 
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <IonIcon icon={chevronBackOutline} />
        </IonButton>
        
        <span className="current-page-indicator">
          Page {currentPage} of {totalPages}
        </span>

        <IonButton 
          fill="clear" 
          size="small" 
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <IonIcon icon={chevronForwardOutline} />
        </IonButton>
      </div>
    </div>
  );
};

export default Pagination;