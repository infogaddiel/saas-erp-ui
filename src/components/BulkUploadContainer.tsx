import React, { useState, useRef } from 'react';
import { IonButton, IonIcon, IonProgressBar, useIonAlert, IonText } from '@ionic/react';
import { cloudUploadOutline, documentOutline } from 'ionicons/icons';
import * as XLSX from 'xlsx';

interface BulkUploadProps {
  title: string;
  // This prop accepts the specific service function
  onUpload: (data: any[]) => Promise<any>; 
  onSuccess: () => void;
}

const BulkUploadContainer: React.FC<BulkUploadProps> = ({ title, onUpload, onSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [presentAlert] = useIonAlert();

  const processExcel = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        setUploading(true);
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const json = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

        // Call the passed-in service function
        await onUpload(json);

        presentAlert({
          header: 'Success',
          message: 'Bulk data imported successfully.',
          buttons: ['OK']
        });
        onSuccess();
      } catch (error) {
        presentAlert({ header: 'Error', message: 'Import failed.', buttons: ['OK'] });
      } finally {
        setUploading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <IonButton fill="outline" disabled={uploading} className="bulk-btn">
      <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
        <IonIcon slot="start" icon={cloudUploadOutline} />
        <span style={{ marginLeft: '8px' }}>{title}</span>
        <input 
          type="file" 
          hidden 
          onChange={(e) => e.target.files?.[0] && processExcel(e.target.files[0])} 
        />
      </label>
    </IonButton>
  );
};

export default BulkUploadContainer;