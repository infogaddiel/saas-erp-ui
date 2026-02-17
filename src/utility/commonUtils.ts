export const formatDateToDMY = (dateStr: string) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
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