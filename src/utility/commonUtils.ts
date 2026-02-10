export const formatDateToDMY = (dateStr: string) => {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('-');
  return `${day}-${month}-${year}`;
};