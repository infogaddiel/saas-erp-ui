import * as XLSX from 'xlsx';

export const downloadTemplate = (templateSample: any,templateName:string) => {
    // 1. Define the headers exactly as your backend expects them
    const templateData = [
        templateSample
    ];

    // 2. Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

    // 3. Force the mobile column to be treated as text to avoid scientific notation
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:E2');
    for (let R = range.s.r; R <= range.e.r; ++R) {
        const cell_address = { c: 1, r: R }; // Column 1 is 'mobile'
        const cell_ref = XLSX.utils.encode_cell(cell_address);
        if (worksheet[cell_ref]) {
            worksheet[cell_ref].z = '@'; // Set cell format to 'Text'
        }
    }

    // 4. Download the file
    XLSX.writeFile(workbook, templateName+"_Upload_Template.xlsx");
};