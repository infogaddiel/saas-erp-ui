import React, { useState, useRef } from 'react';
import { IonButton, IonIcon, IonProgressBar, useIonAlert, IonText } from '@ionic/react';
import { cloudUploadOutline, documentOutline } from 'ionicons/icons';
import * as XLSX from 'xlsx';
import { formatDateToDMY } from '../utility/commonUtils';
import ErrorModal from './ErrorModal';

interface BulkUploadProps {
  title: string;
  // This prop accepts the specific service function
  onUpload: (data: any[]) => Promise<any>;
  onSuccess: () => void;
}

const BulkUploadContainer: React.FC<BulkUploadProps> = ({ title, onUpload, onSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [presentAlert] = useIonAlert();
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorList, setErrorList] = useState<string[]>([]);
  const processExcel = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        setUploading(true);
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const json = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {
          raw: false, // This forces values to be parsed as strings based on display format
          defval: ""
        });
        const sanitizedData = json.map((row: any) => {
          const newRow = { ...row };

          // Only format if the column 'start_date' exists in this Excel row
          if (Object.prototype.hasOwnProperty.call(newRow, 'start_date') && newRow.start_date) {
            newRow.start_date = formatDateToDMY(newRow.start_date);
          }

          // Only format if the column 'end_date' exists in this Excel row
          if (Object.prototype.hasOwnProperty.call(newRow, 'end_date') && newRow.end_date) {
            newRow.end_date = formatDateToDMY(newRow.end_date);
          }

          return newRow;
        });
        // Call the passed-in service function
        await onUpload(sanitizedData);

        presentAlert({
          header: 'Success',
          message: 'Bulk data imported successfully.',
          buttons: ['OK']
        });
        onSuccess();
      } catch (error: any) {
        let errorMsg = "";
        if (error.response?.data?.errors && Array.isArray(error.response.data.errors) && error.response?.data?.errors.length > 0) {
          // Trigger the Modal for detailed errors
          setErrorList(error.response?.data?.errors);
          setShowErrorModal(true);
        } else {
          errorMsg = error.response?.data?.message || error.message || 'Import failed.';
          presentAlert({
            header: 'Error',
            subHeader: `${error.response?.data?.errors?.length || 0} issues found`,
            message: errorMsg,
            buttons: ['OK']
          });
        }

      } finally {
        setUploading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <>
      <IonButton size="small" fill="outline" disabled={uploading} className="bulk-btn">
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
      {/* Render the Error Modal */}
      <ErrorModal
        isOpen={showErrorModal}
        errors={errorList}
        onDismiss={() => setShowErrorModal(false)}
      />
    </>
  );
};

export default BulkUploadContainer;