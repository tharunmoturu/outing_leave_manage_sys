import PDFDocument from 'pdfkit';

/**
 * Generates a styled PDF report and streams it directly to the response object.
 * @param {Response} res - Express response object
 * @param {String} title - Report title
 * @param {Array} headers - Table columns e.g. ['ID', 'Name', 'Date']
 * @param {Array} rows - Array of arrays matching headers
 * @param {Object} summaryData - Optional key-value metrics to display at the top
 */
export const generatePDFReport = (res, title, headers, rows, summaryData = {}) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  // Stream the PDF directly to the response
  doc.pipe(res);

  // Colors
  const primaryColor = '#1e293b'; // Slate 800
  const secondaryColor = '#4f46e5'; // Indigo 600
  const borderColor = '#cbd5e1'; // Slate 300
  const alternatingRowColor = '#f8fafc'; // Slate 50
  
  // Header
  doc.fillColor(primaryColor)
     .font('Helvetica-Bold')
     .fontSize(20)
     .text('HOSTEL OUTING SYSTEM', { align: 'center' });
     
  doc.fontSize(14)
     .fillColor(secondaryColor)
     .text(title.toUpperCase(), { align: 'center' })
     .moveDown(0.5);

  doc.strokeColor(secondaryColor)
     .lineWidth(2)
     .moveTo(40, doc.y)
     .lineTo(555, doc.y)
     .stroke()
     .moveDown(1);

  // Metadata
  doc.font('Helvetica')
     .fontSize(10)
     .fillColor('#64748b')
     .text(`Generated Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 40, doc.y);
  doc.text(`Total Records: ${rows.length}`, 350, doc.y - 12);
  doc.moveDown(1.5);

  // Summary Metrics boxes
  const keys = Object.keys(summaryData);
  if (keys.length > 0) {
    const startY = doc.y;
    const boxWidth = 515 / keys.length;
    
    keys.forEach((key, idx) => {
      const startX = 40 + idx * boxWidth;
      doc.rect(startX, startY, boxWidth - 10, 50)
         .fillColor('#f1f5f9')
         .fill()
         .strokeColor('#e2e8f0')
         .stroke();
         
      doc.fillColor('#475569')
         .font('Helvetica-Bold')
         .fontSize(9)
         .text(key.toUpperCase(), startX + 5, startY + 10, { width: boxWidth - 20, align: 'center' });

      doc.fillColor(secondaryColor)
         .font('Helvetica-Bold')
         .fontSize(14)
         .text(summaryData[key].toString(), startX + 5, startY + 28, { width: boxWidth - 20, align: 'center' });
    });
    
    doc.y = startY + 65; // Adjust vertical space
  }

  // Draw Table
  const tableTop = doc.y;
  const colWidth = 515 / headers.length;

  // Draw headers
  doc.font('Helvetica-Bold')
     .fontSize(9)
     .fillColor('#ffffff');

  // Header background
  doc.rect(40, tableTop, 515, 20)
     .fill(primaryColor);

  headers.forEach((header, i) => {
    doc.text(header, 45 + (i * colWidth), tableTop + 6, {
      width: colWidth - 10,
      align: 'left'
    });
  });

  let currentY = tableTop + 20;

  // Draw rows
  doc.font('Helvetica')
     .fontSize(8)
     .fillColor(primaryColor);

  rows.forEach((row, rowIndex) => {
    // Check page overflow (leave space for footer)
    if (currentY > 750) {
      doc.addPage();
      currentY = 40;

      // Redraw table headers on new page
      doc.rect(40, currentY, 515, 20).fill(primaryColor);
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#ffffff');
      headers.forEach((header, i) => {
        doc.text(header, 45 + (i * colWidth), currentY + 6, {
          width: colWidth - 10,
          align: 'left'
        });
      });
      currentY += 20;
      doc.font('Helvetica').fontSize(8).fillColor(primaryColor);
    }

    // Alternating rows shading
    if (rowIndex % 2 === 0) {
      doc.rect(40, currentY, 515, 18)
         .fill(alternatingRowColor);
    }

    // Row borders
    doc.rect(40, currentY, 515, 18)
       .strokeColor('#e2e8f0')
       .stroke();

    row.forEach((cell, cellIndex) => {
      doc.fillColor(primaryColor);
      doc.text(cell ? cell.toString() : '', 45 + (cellIndex * colWidth), currentY + 5, {
        width: colWidth - 10,
        align: 'left',
        ellipsis: true
      });
    });

    currentY += 18;
  });

  // Footer: Add Page Numbers
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc.font('Helvetica')
       .fontSize(8)
       .fillColor('#94a3b8')
       .text(
         `Page ${i + 1} of ${range.count}`,
         40,
         doc.page.height - 30,
         { align: 'center', width: doc.page.width - 80 }
       );
  }

  doc.end();
};
