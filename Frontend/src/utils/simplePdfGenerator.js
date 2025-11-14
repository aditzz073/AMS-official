import jsPDF from 'jspdf';
import dsceLogoUrl from '../dscelogo.png';

export const generateSimpleFPMIPDF = (formData) => {
  try {
    console.log("Starting comprehensive PDF generation with all evaluation details...");
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    let yPosition = 20;
    
    // Helper function to check if we need a new page
    const checkNewPage = (spaceNeeded = 20) => {
      if (yPosition + spaceNeeded > pageHeight - margin) {
        doc.addPage();
        addPageHeader(); // Add header to new page
        yPosition = 55; // Start after header
        return true;
      }
      return false;
    };
    
    // Helper function to add professional header with logo
    const addPageHeader = () => {
      // Add logo (centered at top)
      const img = new Image();
      img.src = dsceLogoUrl;
      const logoWidth = 100;
      const logoHeight = 30;
      doc.addImage(img, 'PNG', (pageWidth - logoWidth) / 2, 8, logoWidth, logoHeight);
      
      // Add top border line
      doc.setDrawColor(0, 51, 102); // Dark blue color
      doc.setLineWidth(0.5);
      doc.line(margin, 42, pageWidth - margin, 42);
      
      // Add page number at bottom
      const pageNumber = doc.internal.getCurrentPageInfo().pageNumber;
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      doc.setTextColor(0, 0, 0);
    };
    
    // Helper function to add section header with styling
    const addSectionHeader = (title, fontSize = 12) => {
      checkNewPage(25);
      doc.setFillColor(240, 248, 255); // Light blue background
      doc.rect(margin - 2, yPosition - 6, pageWidth - 2 * margin + 4, 10, 'F');
      doc.setFontSize(fontSize);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 51, 102); // Dark blue text
      doc.text(title, pageWidth / 2, yPosition, { align: 'center' });
      doc.setTextColor(0, 0, 0); // Reset to black
      yPosition += 15;
    };
    
    // Add header to first page
    addPageHeader();
    yPosition = 48;
    
    // College Header with styling
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 51, 102); // Dark blue
    doc.text('Dayananda Sagar College of Engineering', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;
    
    // Subtitle
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(80, 80, 80); // Gray
    doc.text('Shavige Malleshwara Hills, Kumaraswamy Layout, Bengaluru - 560078', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;
    
    // Title with decorative border
    doc.setFillColor(0, 51, 102); // Dark blue background
    doc.rect(margin, yPosition - 8, pageWidth - 2 * margin, 12, 'F');
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(255, 255, 255); // White text
    doc.text('Faculty Performance Measuring Index (FPMI)', pageWidth / 2, yPosition, { align: 'center' });
    doc.setTextColor(0, 0, 0); // Reset to black
    yPosition += 20;
    
    
    // Faculty Information Box with professional styling
    doc.setFillColor(250, 250, 250); // Light gray background
    doc.setDrawColor(200, 200, 200); // Gray border
    doc.setLineWidth(0.3);
    const infoBoxHeight = 70;
    doc.rect(margin, yPosition, pageWidth - 2 * margin, infoBoxHeight, 'FD');
    
    yPosition += 8;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 51, 102); // Dark blue
    doc.text('Faculty Information', margin + 5, yPosition);
    yPosition += 8;
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0); // Black
    
    const facultyInfo = [
      { label: 'Employee Code:', value: formData.employeeCode || 'N/A' },
      { label: 'Name:', value: formData.name || 'N/A' },
      { label: 'Designation:', value: formData.designation || 'N/A' },
      { label: 'Department:', value: formData.department || 'N/A' },
      { label: 'College:', value: formData.college || 'N/A' },
      { label: 'Campus:', value: formData.campus || 'N/A' },
      { label: 'Joining Date:', value: formData.joiningDate || 'N/A' },
      { label: 'Period of Assessment:', value: formData.periodOfAssessment || 'N/A' }
    ];
    
    const columnWidth = (pageWidth - 2 * margin - 10) / 2;
    let column = 0;
    let rowYPosition = yPosition;
    
    facultyInfo.forEach((info, index) => {
      if (index % 2 === 0 && index > 0) {
        rowYPosition += 7;
        column = 0;
      }
      
      const xPos = margin + 5 + (column * columnWidth);
      doc.setFont(undefined, 'bold');
      doc.text(info.label, xPos, rowYPosition);
      doc.setFont(undefined, 'normal');
      doc.text(info.value, xPos + 35, rowYPosition);
      
      column++;
    });
    
    yPosition += infoBoxHeight + 5;
    
    // FPMI Detailed Breakdown Section (moved to position 2)
    addSectionHeader('FPMI Detailed Breakdown', 14);
    yPosition += 5;
    
    // 1. Teaching Learning Process (TLP) Details
    addSectionHeader('1. Teaching Learning Process (TLP) - Detailed Evaluation');
    
    const tlpItems = [
      { key: 'TLP111', title: '1.1.1 Lectures taken as percentage of lectures allocated as per academic calendar' },
      { key: 'TLP112', title: '1.1.2 Tutorials taken as percentage of tutorials allocated as per timetable' },
      { key: 'TLP113', title: '1.1.3 Lab sessions taken as percentage of lab sessions allocated as per timetable' },
      { key: 'TLP114', title: '1.1.4 Additional academic activities and innovative teaching methods' }
    ];
    
    // Add TLP evaluation table with enhanced styling
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    checkNewPage(30);
    
    // Table header with background
    doc.setFillColor(0, 51, 102); // Dark blue
    doc.setTextColor(255, 255, 255); // White text
    doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 8, 'F');
    doc.text('Item', margin + 2, yPosition);
    doc.text('Self', margin + 122, yPosition);
    doc.text('HoD', margin + 142, yPosition);
    doc.text('External', margin + 162, yPosition);
    doc.setTextColor(0, 0, 0); // Reset to black
    yPosition += 8;
    
    doc.setFont(undefined, 'normal');
    let rowIndex = 0;
    tlpItems.forEach(item => {
      checkNewPage(10);
      
      // Alternating row colors for better readability
      if (rowIndex % 2 === 0) {
        doc.setFillColor(248, 248, 248);
        doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 8, 'F');
      }
      
      const wrappedTitle = doc.splitTextToSize(item.title, 115);
      doc.text(wrappedTitle, margin + 2, yPosition);
      doc.text((formData[`${item.key}Self`] || "0").toString(), margin + 122, yPosition);
      doc.text((formData[`${item.key}HoD`] || "0").toString(), margin + 142, yPosition);
      doc.text((formData[`${item.key}External`] || "0").toString(), margin + 162, yPosition);
      yPosition += Math.max(8, wrappedTitle.length * 4);
      rowIndex++;
    });
    
    yPosition += 10;
    
    // 2. Professional Development and Research Contribution (PDRC) Details
    addSectionHeader('2. Professional Development and Research Contribution (PDRC) - Detailed Evaluation');
    
    const pdrcItems = [
      { key: 'PDRC211', title: '2.1.1 Acquiring higher qualifications during the appraisal period' },
      { key: 'PDRC212', title: '2.1.2 Acquiring status of Certified trainer for skill development courses' },
      { key: 'PDRC213', title: '2.1.3 FDP / Training / Workshop / Seminar / Conference attended' },
      { key: 'PDRC214', title: '2.1.4 Invited talks / Keynote / Expert lectures delivered' },
      { key: 'PDRC221', title: '2.2.1 Research Publication (journals)' },
      { key: 'PDRC222', title: '2.2.2 Research Publication (Conference proceedings)' }
    ];
    
    // Add PDRC evaluation table with enhanced styling
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    checkNewPage(30);
    
    doc.setFillColor(0, 51, 102);
    doc.setTextColor(255, 255, 255);
    doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 8, 'F');
    doc.text('Item', margin + 2, yPosition);
    doc.text('Self', margin + 122, yPosition);
    doc.text('HoD', margin + 142, yPosition);
    doc.text('External', margin + 162, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 8;
    
    doc.setFont(undefined, 'normal');
    rowIndex = 0;
    pdrcItems.forEach(item => {
      checkNewPage(10);
      if (rowIndex % 2 === 0) {
        doc.setFillColor(248, 248, 248);
        doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 8, 'F');
      }
      const wrappedTitle = doc.splitTextToSize(item.title, 115);
      doc.text(wrappedTitle, margin + 2, yPosition);
      doc.text((formData[`${item.key}Self`] || "0").toString(), margin + 122, yPosition);
      doc.text((formData[`${item.key}HoD`] || "0").toString(), margin + 142, yPosition);
      doc.text((formData[`${item.key}External`] || "0").toString(), margin + 162, yPosition);
      yPosition += Math.max(8, wrappedTitle.length * 4);
      rowIndex++;
    });
    
    yPosition += 10;
    
    // 3. Contribution at Departmental Level (CDL) Details
    addSectionHeader('3. Contribution at Departmental Level (CDL) - Detailed Evaluation');
    
    const cdlItems = [
      { key: 'CDL1', title: '3.1 Academic committee membership/coordination' },
      { key: 'CDL2', title: '3.2 Student mentoring and counseling activities' },
      { key: 'CDL3', title: '3.3 Curriculum development and syllabus design' },
      { key: 'CDL4', title: '3.4 Department events organization and participation' }
    ];
    
    // Add CDL evaluation table with enhanced styling
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    checkNewPage(30);
    
    doc.setFillColor(0, 51, 102);
    doc.setTextColor(255, 255, 255);
    doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 8, 'F');
    doc.text('Item', margin + 2, yPosition);
    doc.text('Self', margin + 122, yPosition);
    doc.text('HoD', margin + 142, yPosition);
    doc.text('External', margin + 162, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 8;
    
    doc.setFont(undefined, 'normal');
    rowIndex = 0;
    cdlItems.forEach(item => {
      checkNewPage(10);
      if (rowIndex % 2 === 0) {
        doc.setFillColor(248, 248, 248);
        doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 8, 'F');
      }
      const wrappedTitle = doc.splitTextToSize(item.title, 115);
      doc.text(wrappedTitle, margin + 2, yPosition);
      doc.text((formData[`${item.key}Self`] || "0").toString(), margin + 122, yPosition);
      doc.text((formData[`${item.key}HoD`] || "0").toString(), margin + 142, yPosition);
      doc.text((formData[`${item.key}External`] || "0").toString(), margin + 162, yPosition);
      yPosition += Math.max(8, wrappedTitle.length * 4);
      rowIndex++;
    });
    
    yPosition += 10;
    
    // 4. Contribution at Institutional Level (CIL) Details  
    addSectionHeader('4. Contribution at Institutional Level (CIL) - Detailed Evaluation');
    
    const cilItems = [
      { key: 'CIL1', title: '4.1 Institutional committee membership/coordination' },
      { key: 'CIL2', title: '4.2 Administrative responsibilities and leadership roles' },
      { key: 'CIL3', title: '4.3 Inter-departmental collaboration and activities' },
      { key: 'CIL4', title: '4.4 Institution-wide events and initiatives' }
    ];
    
    // Add CIL evaluation table with enhanced styling
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    checkNewPage(30);
    
    doc.setFillColor(0, 51, 102);
    doc.setTextColor(255, 255, 255);
    doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 8, 'F');
    doc.text('Item', margin + 2, yPosition);
    doc.text('Self', margin + 122, yPosition);
    doc.text('HoD', margin + 142, yPosition);
    doc.text('External', margin + 162, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 8;
    
    doc.setFont(undefined, 'normal');
    rowIndex = 0;
    cilItems.forEach(item => {
      checkNewPage(10);
      if (rowIndex % 2 === 0) {
        doc.setFillColor(248, 248, 248);
        doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 8, 'F');
      }
      const wrappedTitle = doc.splitTextToSize(item.title, 115);
      doc.text(wrappedTitle, margin + 2, yPosition);
      doc.text((formData[`${item.key}Self`] || "0").toString(), margin + 122, yPosition);
      doc.text((formData[`${item.key}HoD`] || "0").toString(), margin + 142, yPosition);
      doc.text((formData[`${item.key}External`] || "0").toString(), margin + 162, yPosition);
      yPosition += Math.max(8, wrappedTitle.length * 4);
      rowIndex++;
    });
    
    yPosition += 10;
    
    // 5. Interaction with Outside World (IOW) / External Interface (EI) Details
    addSectionHeader('5. Interaction with Outside World (IOW) / External Interface (EI) - Detailed Evaluation');
    
    const iowItems = [
      { key: 'IOW511', title: '5.1.1 Industry collaboration and projects' },
      { key: 'IOW512', title: '5.1.2 Live industrial projects' },
      { key: 'IOW513', title: '5.1.3 Internship coordination and facilitation' },
      { key: 'IOW521', title: '5.2.1 Subject expert for interview panel' },
      { key: 'IOW522', title: '5.2.2 External examiner for universities' },
      { key: 'IOW523', title: '5.2.3 Reviewer - International/National Journal' },
      { key: 'IOW524', title: '5.2.4 Professional society membership and activities' },
      { key: 'IOW525', title: '5.2.5 Community outreach and social service' }
    ];
    
    // Add IOW evaluation table with enhanced styling
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    checkNewPage(30);
    
    doc.setFillColor(0, 51, 102);
    doc.setTextColor(255, 255, 255);
    doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 8, 'F');
    doc.text('Item', margin + 2, yPosition);
    doc.text('Self', margin + 122, yPosition);
    doc.text('HoD', margin + 142, yPosition);
    doc.text('External', margin + 162, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 8;
    
    doc.setFont(undefined, 'normal');
    rowIndex = 0;
    iowItems.forEach(item => {
      checkNewPage(10);
      if (rowIndex % 2 === 0) {
        doc.setFillColor(248, 248, 248);
        doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 8, 'F');
      }
      const wrappedTitle = doc.splitTextToSize(item.title, 115);
      doc.text(wrappedTitle, margin + 2, yPosition);
      doc.text((formData[`${item.key}Self`] || "0").toString(), margin + 122, yPosition);
      doc.text((formData[`${item.key}HoD`] || "0").toString(), margin + 142, yPosition);
      doc.text((formData[`${item.key}External`] || "0").toString(), margin + 162, yPosition);
      yPosition += Math.max(8, wrappedTitle.length * 4);
      rowIndex++;
    });
    
    yPosition += 15;
    
    // Assessment Summary Section (moved to position 3)
    addSectionHeader('Assessment Summary', 12);
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    
    const categories = [
      { key: "TLP", title: "Teaching Learning Process (TLP)", max: 80 },
      { key: "PDRC", title: "Professional Development and Research Contribution (PDRC)", max: 90 },
      { key: "CDL", title: "Contribution at Departmental level (CDL)", max: 50 },
      { key: "CIL", title: "Contribution at Institutional level (CIL)", max: 30 },
      { key: "IOW", title: "Interaction with the Outside World (IOW) / External Interface (EI)", max: 50 },
    ];
    
    // Table headers with professional styling
    checkNewPage(50);
    doc.setFont(undefined, 'bold');
    doc.setFillColor(0, 51, 102);
    doc.setTextColor(255, 255, 255);
    doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 8, 'F');
    doc.text('Assessment Head', margin + 2, yPosition);
    doc.text('Max', margin + 122, yPosition);
    doc.text('Self', margin + 142, yPosition);
    doc.text('HoD', margin + 162, yPosition);
    doc.text('External', margin + 182, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 8;
    
    // Table rows with alternating colors
    doc.setFont(undefined, 'normal');
    rowIndex = 0;
    categories.forEach(category => {
      checkNewPage(10);
      if (rowIndex % 2 === 0) {
        doc.setFillColor(248, 248, 248);
        doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 8, 'F');
      }
      doc.text(category.title, margin + 2, yPosition);
      doc.text(category.max.toString(), margin + 122, yPosition);
      doc.text((formData.categoriesTotal?.[`${category.key}Self`] || "0").toString(), margin + 142, yPosition);
      doc.text((formData.categoriesTotal?.[`${category.key}HoD`] || "0").toString(), margin + 162, yPosition);
      doc.text((formData.categoriesTotal?.[`${category.key}External`] || "0").toString(), margin + 182, yPosition);
      yPosition += 8;
      rowIndex++;
    });
    
    // Total row with bold styling and background
    yPosition += 5;
    doc.setDrawColor(0, 51, 102);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2);
    yPosition += 5;
    
    doc.setFillColor(230, 240, 255);
    doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 8, 'F');
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 51, 102);
    doc.text('Total', margin + 2, yPosition);
    doc.text('300', margin + 122, yPosition);
    doc.text((formData.totalSelf || "0").toString(), margin + 142, yPosition);
    doc.text((formData.totalHoD || "0").toString(), margin + 162, yPosition);
    doc.text((formData.totalExternal || "0").toString(), margin + 182, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 20;
    
    // Average Score Evaluation with box styling
    checkNewPage(30);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 51, 102);
    doc.text('Average Score Evaluation:', margin, yPosition);
    yPosition += 10;
    
    const selfScore = formData.totalSelf || 0;
    const hodScore = formData.totalHoD || 0;
    const externalScore = formData.totalExternal || 0;
    const averageScore = ((selfScore + hodScore + externalScore) / 3).toFixed(2);
    
    // Score box
    doc.setFillColor(245, 252, 255);
    doc.setDrawColor(0, 51, 102);
    doc.setLineWidth(0.3);
    doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 18, 'FD');
    
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    yPosition += 2;
    doc.text(`Average Score: ${averageScore} / 300`, margin + 5, yPosition);
    yPosition += 7;
    doc.text(`(Self: ${selfScore} | HoD: ${hodScore} | External: ${externalScore})`, margin + 5, yPosition);
    yPosition += 10;
    
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text('Note: The evaluation of score is based on taking average of three (Self, HoD, External Audit Member)', margin + 5, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 20;
    
    // Remarks Section (moved to position 5)
    addSectionHeader('Remarks', 12);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    
    // Remarks by HoD with box
    checkNewPage(35);
    doc.setTextColor(0, 51, 102);
    doc.text('Remarks by HoD:', margin, yPosition);
    yPosition += 8;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    const hodRemarksBoxStart = yPosition - 3;
    
    if (formData.RemarksHoD) {
      const hodRemarksLines = doc.splitTextToSize(formData.RemarksHoD, pageWidth - 2 * margin - 10);
      const remarksHeight = Math.max(15, hodRemarksLines.length * 6 + 5);
      doc.rect(margin, hodRemarksBoxStart, pageWidth - 2 * margin, remarksHeight, 'FD');
      yPosition += 2;
      hodRemarksLines.forEach(line => {
        checkNewPage(8);
        doc.text(line, margin + 5, yPosition);
        yPosition += 6;
      });
      yPosition += 5;
    } else {
      doc.rect(margin, hodRemarksBoxStart, pageWidth - 2 * margin, 12, 'FD');
      yPosition += 2;
      doc.text('—', margin + 5, yPosition);
      yPosition += 10;
    }
    yPosition += 10;
    
    // Remarks by External Auditor with box
    checkNewPage(35);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 51, 102);
    doc.text('Remarks by External Auditor:', margin, yPosition);
    yPosition += 8;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    
    doc.setFillColor(255, 255, 255);
    const externalRemarksBoxStart = yPosition - 3;
    
    if (formData.RemarksExternal) {
      const externalRemarksLines = doc.splitTextToSize(formData.RemarksExternal, pageWidth - 2 * margin - 10);
      const remarksHeight = Math.max(15, externalRemarksLines.length * 6 + 5);
      doc.rect(margin, externalRemarksBoxStart, pageWidth - 2 * margin, remarksHeight, 'FD');
      yPosition += 2;
      externalRemarksLines.forEach(line => {
        checkNewPage(8);
        doc.text(line, margin + 5, yPosition);
        yPosition += 6;
      });
      yPosition += 5;
    } else {
      doc.rect(margin, externalRemarksBoxStart, pageWidth - 2 * margin, 12, 'FD');
      yPosition += 2;
      doc.text('—', margin + 5, yPosition);
      yPosition += 10;
    }
    yPosition += 10;
    
    // Remarks by Principal with box
    checkNewPage(35);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 51, 102);
    doc.text('Remarks by Principal:', margin, yPosition);
    yPosition += 8;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    
    doc.setFillColor(255, 255, 255);
    const principalRemarksBoxStart = yPosition - 3;
    
    if (formData.RemarksPrincipal) {
      const principalRemarksLines = doc.splitTextToSize(formData.RemarksPrincipal, pageWidth - 2 * margin - 10);
      const remarksHeight = Math.max(15, principalRemarksLines.length * 6 + 5);
      doc.rect(margin, principalRemarksBoxStart, pageWidth - 2 * margin, remarksHeight, 'FD');
      yPosition += 2;
      principalRemarksLines.forEach(line => {
        checkNewPage(8);
        doc.text(line, margin + 5, yPosition);
        yPosition += 6;
      });
      yPosition += 5;
    } else {
      doc.rect(margin, principalRemarksBoxStart, pageWidth - 2 * margin, 12, 'FD');
      yPosition += 2;
      doc.text('—', margin + 5, yPosition);
      yPosition += 10;
    }
    yPosition += 20;
    
    // Signatures Section (moved to position 6)
    addSectionHeader('Signatures', 12);
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    
    checkNewPage(50);
    
    // Signature boxes
    const signatureBoxWidth = (pageWidth - 2 * margin - 10) / 2;
    const signatureBoxHeight = 25;
    
    // Faculty Member box
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.rect(margin, yPosition, signatureBoxWidth, signatureBoxHeight);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 51, 102);
    doc.text('Faculty Member', margin + 5, yPosition + 8);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(formData.name || '_________________', margin + 5, yPosition + 20);
    
    // HoD box
    doc.rect(margin + signatureBoxWidth + 10, yPosition, signatureBoxWidth, signatureBoxHeight);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 51, 102);
    doc.text('Head of Department', margin + signatureBoxWidth + 15, yPosition + 8);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(formData.HODName || '_________________', margin + signatureBoxWidth + 15, yPosition + 20);
    
    yPosition += signatureBoxHeight + 10;
    
    // External Evaluator box
    doc.rect(margin, yPosition, signatureBoxWidth, signatureBoxHeight);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 51, 102);
    doc.text('External Evaluator', margin + 5, yPosition + 8);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(formData.externalEvaluatorName || '_________________', margin + 5, yPosition + 20);
    
    // Principal box
    doc.rect(margin + signatureBoxWidth + 10, yPosition, signatureBoxWidth, signatureBoxHeight);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 51, 102);
    doc.text('Principal', margin + signatureBoxWidth + 15, yPosition + 8);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(formData.principleName || '_________________', margin + signatureBoxWidth + 15, yPosition + 20);
    
    yPosition += signatureBoxHeight + 10;
    
    // Add page number for the last page
    const pageNumber = doc.internal.getCurrentPageInfo().pageNumber;
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - 15, { align: 'center' });
    
    // Footer with generation date
    doc.text(`Document generated on: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    
    // Generate filename in format: employee_name_generated_date
    const currentDate = new Date().toISOString().split('T')[0];
    const employeeName = formData.name ? formData.name.replace(/\s+/g, '_').toLowerCase() : 'employee';
    const filename = `${employeeName}_fpmi_detailed_${currentDate}.pdf`;
    
    // Save the PDF
    doc.save(filename);
    
    return filename;
  } catch (error) {
    console.error('Error generating comprehensive PDF:', error);
    throw new Error('Failed to generate comprehensive PDF: ' + error.message);
  }
};