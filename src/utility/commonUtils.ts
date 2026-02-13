export const formatDateToDMY = (dateStr: string) => {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('-');
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