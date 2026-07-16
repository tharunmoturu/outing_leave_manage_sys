import exceljs from 'exceljs';

/**
 * Generates a styled Excel sheet and streams it directly to the response object.
 * @param {Response} res - Express response object
 * @param {String} title - Sheet title
 * @param {Array} headers - Table columns e.g. ['ID', 'Name', 'Date']
 * @param {Array} rows - Array of arrays matching headers
 * @param {String} sheetName - Name of the Excel sheet
 */
export const generateExcelReport = async (res, title, headers, rows, sheetName = 'Report') => {
  const workbook = new exceljs.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  // Set title
  const endColLetter = String.fromCharCode(65 + Math.max(0, headers.length - 1));
  worksheet.mergeCells(`A1:${endColLetter}1`);
  const titleCell = worksheet.getCell('A1');
  titleCell.value = title.toUpperCase();
  titleCell.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } }; // Slate 800
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(1).height = 40;

  // Add empty spacing row
  worksheet.addRow([]);

  // Add headers
  const headerRow = worksheet.addRow(headers);
  headerRow.height = 25;
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } }; // Indigo 600
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      bottom: { style: 'medium', color: { argb: 'FF1E293B' } },
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    };
  });

  // Add rows
  rows.forEach((row, idx) => {
    const newRow = worksheet.addRow(row);
    newRow.height = 20;

    const alternatingColor = idx % 2 === 0 ? 'FFF8FAFC' : 'FFFFFFFF'; // Light shading

    newRow.eachCell((cell) => {
      cell.font = { name: 'Segoe UI', size: 9 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: alternatingColor } };
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };
    });
  });

  // Auto fit column widths
  worksheet.columns.forEach((column) => {
    let maxLen = 0;
    column.eachCell({ includeEmpty: true }, (cell) => {
      // Avoid checking title row
      if (cell.row > 1) {
        const valStr = cell.value ? cell.value.toString() : '';
        if (valStr.length > maxLen) {
          maxLen = valStr.length;
        }
      }
    });
    column.width = Math.max(maxLen + 4, 12);
  });

  // Set response headers
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=${sheetName.toLowerCase()}_report.xlsx`
  );

  // Write and finish stream
  await workbook.xlsx.write(res);
  res.end();
};
