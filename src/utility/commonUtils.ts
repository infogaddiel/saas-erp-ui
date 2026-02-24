export const formatDateToDMY = (dateStr: string) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export const formatDateToDMY24 = (dateStr: string) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}-${month}-${year} ${hours}:${minutes}`;
};

export const getStatusLabel = (id: string | number | undefined) => {
  if (!id) return "N/A";

  const statusMap: { [key: string]: string } = {
    "1": "Open",
    "2": "In Progress",
    "3": "Closed",
    "4": "Re-Open",
    "5": "Cancelled"
  };

  return statusMap[id.toString()] || "Unknown";
};

export const formatDateToIST = (dateStr: string) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);

  if (isNaN(date.getTime())) return '';

  // Use Intl.DateTimeFormat to force IST regardless of the user's local system settings
  const istString = date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false // Set to false if you prefer 24-hour format
  });

  // The output of en-IN toLocaleString is usually "DD/MM/YYYY, HH:MM AM/PM"
  // If you need specifically DD-MM-YYYY, we can format it:
  const day = date.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit' });
  const month = date.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: '2-digit' });
  const year = date.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', year: 'numeric' });
  const time = date.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  return `${day}-${month}-${year} ${time}`;
};

export const toLocalISO = (dateStr: string) => {
  const date = new Date(dateStr);
  // This creates a string like "2026-02-22T14:36:00" (IST) without the 'Z'
  const tzOffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
  const localISOTime = (new Date(date.getTime() - tzOffset)).toISOString().slice(0, -1);
  return localISOTime;
};

export const toDateWithZolu = (dateStr: string | Date ) => {
 const d = new Date(dateStr);
  if (isNaN(d.getTime())) return new Date().toISOString(); // Fallback to now
  return d.toISOString();
};

export const toDateAMPM = (dateStr: string | Date) => {
  return new Date(dateStr).toLocaleString('en-GB', {
    hour12: true,
    timeZone: 'UTC' 
  })
}