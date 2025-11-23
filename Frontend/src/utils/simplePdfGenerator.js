import jsPDF from 'jspdf';
import dsceLogoUrl from '../dscelogo.png';

// Define roles that are allowed to see remarks in PDF
const ROLES_WITH_REMARKS = ["HOD", "Principal", "ExternalEvaluator", "Admin"];

export const generateSimpleFPMIPDF = (formData, userRole) => {
  try {
    console.log("=== PDF GENERATION STARTED ===");
    console.log("User role:", userRole);
    console.log("Full formData:", JSON.stringify(formData, null, 2));
    
    // Check if current user role should see remarks
    const shouldIncludeRemarks = ROLES_WITH_REMARKS.includes(userRole);
    console.log(`Include remarks: ${shouldIncludeRemarks}`);
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    let yPosition = 20;
    
    // Helper function to check if we need a new page
    const checkNewPage = (spaceNeeded = 20) => {
      if (yPosition + spaceNeeded > pageHeight - margin) {
        doc.addPage();
        addPageHeader();
        yPosition = 55;
        return true;
      }
      return false;
    };
    
    // Helper function to add professional header with logo
    const addPageHeader = () => {
      const img = new Image();
      img.src = dsceLogoUrl;
      const logoWidth = 100;
      const logoHeight = 30;
      doc.addImage(img, 'PNG', (pageWidth - logoWidth) / 2, 8, logoWidth, logoHeight);
      
      doc.setDrawColor(0, 51, 102);
      doc.setLineWidth(0.5);
      doc.line(margin, 42, pageWidth - margin, 42);
      
      const pageNumber = doc.internal.getCurrentPageInfo().pageNumber;
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      doc.setTextColor(0, 0, 0);
    };
    
    // Helper function to add section header with styling
    const addSectionHeader = (title, fontSize = 12) => {
      checkNewPage(25);
      doc.setFillColor(240, 248, 255);
      doc.rect(margin - 2, yPosition - 6, pageWidth - 2 * margin + 4, 10, 'F');
      doc.setFontSize(fontSize);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 51, 102);
      doc.text(title, pageWidth / 2, yPosition, { align: 'center' });
      doc.setTextColor(0, 0, 0);
      yPosition += 15;
    };
    
    // Helper function to add section-specific remarks - FIXED VERSION
    const addSectionRemarks = (sectionKey, sectionTitle) => {
      if (!shouldIncludeRemarks) {
        console.log(`Skipping remarks for ${sectionKey} - user role not authorized`);
        return;
      }
      
      let remarkText = null;
      
      // Check all possible locations for the remark
      const possibleKeys = [
        `Remarks${sectionKey}`,      // e.g., RemarksTLP11
        `remarks${sectionKey}`,       // e.g., remarksTLP11
        sectionKey,                   // e.g., TLP11
      ];
      
      console.log(`Searching for remarks with key: ${sectionKey}`);
      console.log(`Checking keys:`, possibleKeys);
      
      // First check direct formData properties
      for (const key of possibleKeys) {
        if (formData[key]) {
          console.log(`Found remark at formData.${key}:`, formData[key]);
          if (typeof formData[key] === 'string' && formData[key].trim()) {
            remarkText = formData[key];
            break;
          }
        }
      }
      
      // Check if remarks is stored as an object
      if (!remarkText && formData.remarks) {
        console.log(`Checking formData.remarks object:`, formData.remarks);
        if (typeof formData.remarks === 'object') {
          // Try different key variations in the remarks object
          for (const key of possibleKeys) {
            if (formData.remarks[key]) {
              console.log(`Found remark at formData.remarks.${key}:`, formData.remarks[key]);
              remarkText = formData.remarks[key];
              break;
            }
          }
        }
      }
      
      console.log(`Final remark text for ${sectionKey}:`, remarkText);
      
      if (remarkText && remarkText.trim()) {
        console.log(`✅ Adding remark section for ${sectionKey}`);
        checkNewPage(35);
        
        // Remark header
        doc.setFontSize(9);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(139, 69, 19);
        doc.text(`📝 Remarks - ${sectionTitle}`, margin, yPosition);
        yPosition += 6;
        
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.text('(HOD, Principal and External Evaluator)', margin, yPosition);
        yPosition += 8;
        
        // Remark box
        doc.setFont(undefined, 'normal');
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        
        doc.setFillColor(255, 255, 240);
        doc.setDrawColor(200, 200, 150);
        doc.setLineWidth(0.3);
        
        const remarksLines = doc.splitTextToSize(remarkText, pageWidth - 2 * margin - 10);
        const remarksHeight = Math.max(15, remarksLines.length * 5 + 8);
        
        doc.rect(margin, yPosition - 3, pageWidth - 2 * margin, remarksHeight, 'FD');
        yPosition += 2;
        
        remarksLines.forEach(line => {
          checkNewPage(8);
          doc.text(line, margin + 5, yPosition);
          yPosition += 5;
        });
        
        yPosition += 10;
        doc.setTextColor(0, 0, 0);
      } else {
        console.log(`❌ No remark found for ${sectionKey}`);
      }
    };
    
    // Add header to first page
    addPageHeader();
    yPosition = 48;
    
    // College Header with styling
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 51, 102);
    doc.text('Dayananda Sagar College of Engineering', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text('Shavige Malleshwara Hills, Kumaraswamy Layout, Bengaluru - 560078', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;
    
    // Title with decorative border
    doc.setFillColor(0, 51, 102);
    doc.rect(margin, yPosition - 8, pageWidth - 2 * margin, 12, 'F');
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Faculty Performance Measuring Index (FPMI)', pageWidth / 2, yPosition, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    yPosition += 20;
    
    // Faculty Information Box
    doc.setFillColor(250, 250, 250);
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    const infoBoxHeight = 70;
    doc.rect(margin, yPosition, pageWidth - 2 * margin, infoBoxHeight, 'FD');
    
    yPosition += 8;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 51, 102);
    doc.text('Faculty Information', margin + 5, yPosition);
    yPosition += 8;
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    
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
    
    // FPMI Detailed Breakdown Section
    addSectionHeader('FPMI Detailed Breakdown', 14);
    yPosition += 5;
    
    // 1. Teaching Learning Process (TLP) Details
    addSectionHeader('1. Teaching Learning Process (TLP) - Detailed Evaluation');
    
    const tlpItems = [
      { key: 'TLP111', title: '1.1.1 Lectures taken as percentage of lectures allocated' },
      { key: 'TLP112', title: '1.1.2 Tutorials taken as percentage of tutorials allocated' },
      { key: 'TLP113', title: '1.1.3 Lab sessions taken as percentage of lab sessions allocated' },
      { key: 'TLP114', title: '1.1.4 Additional academic activities and innovative teaching methods' }
    ];
    
    // Add TLP table
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
    let rowIndex = 0;
    tlpItems.forEach(item => {
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
    
    // Add TLP Section Remarks
    addSectionRemarks('TLP11', 'Section 1.1 - Teaching Related Activities');
    
    // 2. Professional Development and Research Contribution (PDRC)
    addSectionHeader('2. Professional Development and Research Contribution (PDRC) - Detailed Evaluation');
    
    const pdrcItems = [
      { key: 'PDRC211', title: '2.1.1 Acquiring higher qualifications during the appraisal period' },
      { key: 'PDRC212', title: '2.1.2 Acquiring status of Certified trainer for skill development courses' },
      { key: 'PDRC213', title: '2.1.3 FDP / Training / Workshop / Seminar / Conference attended' },
      { key: 'PDRC214', title: '2.1.4 Invited talks / Keynote / Expert lectures delivered' },
      { key: 'PDRC221', title: '2.2.1 Research Publication (journals)' },
      { key: 'PDRC222', title: '2.2.2 Research Publication (Conference proceedings)' }
    ];
    
    // Add PDRC table
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
    
    // Add PDRC Section Remarks
    addSectionRemarks('PDRC21', 'Section 2.1 - Professional Development');
    addSectionRemarks('PDRC22', 'Section 2.2 - Research Contribution');
    
    // 3. Contribution at Departmental Level (CDL)
    addSectionHeader('3. Contribution at Departmental Level (CDL) - Detailed Evaluation');
    
    const cdlItems = [
      { key: 'CDL31', title: '3.1 Contribution at Departmental Level - Item 1' },
      { key: 'CDL32', title: '3.2 Contribution at Departmental Level - Item 2' },
      { key: 'CDL33', title: '3.3 Contribution at Departmental Level - Item 3' },
      { key: 'CDL34', title: '3.4 Contribution at Departmental Level - Item 4' },
      { key: 'CDL35', title: '3.5 Contribution at Departmental Level - Item 5' }
    ];
    
    // Add CDL table
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
    
    // Add CDL Section Remarks
    addSectionRemarks('CDL3', 'Section 3 - Contribution at Departmental Level');
    
    // 4. Contribution at Institutional Level (CIL)
    addSectionHeader('4. Contribution at Institutional Level (CIL) - Detailed Evaluation');
    
    const cilItems = [
      { key: 'CIL4', title: '4.1 Institutional committee membership and activities' }
    ];
    
    // Add CIL table
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
    
    // Add CIL Section Remarks
    addSectionRemarks('CIL4', 'Section 4 - Contribution at Institutional Level');
    
    // 5. Interaction with Outside World (IOW)
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
    
    // Add IOW table
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
    
    yPosition += 10;
    
    // Add IOW Section Remarks
    addSectionRemarks('IOW51', 'Section 5.1 - Industry and Academic Interface');
    addSectionRemarks('IOW52', 'Section 5.2 - Professional and Social Engagement');
    
    yPosition += 15;
    
    // Assessment Summary Section
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
    
    // Average Score
    checkNewPage(30);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 51, 102);
    doc.text('Average Score Evaluation:', margin, yPosition);
    yPosition += 10;
    
    const selfScore = parseFloat(formData.totalSelf) || 0;
    const hodScore = parseFloat(formData.totalHoD) || 0;
    const externalScore = parseFloat(formData.totalExternal) || 0;
    const averageScore = ((selfScore + hodScore + externalScore) / 3).toFixed(2);
    
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
    doc.text('Note: The evaluation is based on average of Self, HoD, and External evaluations', margin + 5, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 20;
    
    // Overall Remarks (only for authorized roles)
    if (shouldIncludeRemarks) {
      console.log("Adding overall remarks section");
      
      addSectionHeader('Overall Remarks', 12);
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      
      // Remarks by HoD
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
      
      // Remarks by External
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
      
      // Remarks by Principal
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
    }
    
    // Signatures
    addSectionHeader('Signatures', 12);
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    
    checkNewPage(50);
    
    const signatureBoxWidth = (pageWidth - 2 * margin - 10) / 2;
    const signatureBoxHeight = 25;
    
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.rect(margin, yPosition, signatureBoxWidth, signatureBoxHeight);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 51, 102);
    doc.text('Faculty Member', margin + 5, yPosition + 8);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(formData.name || '_________________', margin + 5, yPosition + 20);
    
    doc.rect(margin + signatureBoxWidth + 10, yPosition, signatureBoxWidth, signatureBoxHeight);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 51, 102);
    doc.text('Head of Department', margin + signatureBoxWidth + 15, yPosition + 8);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(formData.HODName || '_________________', margin + signatureBoxWidth + 15, yPosition + 20);
    
    yPosition += signatureBoxHeight + 10;
    
    doc.rect(margin, yPosition, signatureBoxWidth, signatureBoxHeight);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 51, 102);
    doc.text('External Evaluator', margin + 5, yPosition + 8);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(formData.externalEvaluatorName || '_________________', margin + 5, yPosition + 20);
    
    doc.rect(margin + signatureBoxWidth + 10, yPosition, signatureBoxWidth, signatureBoxHeight);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 51, 102);
    doc.text('Principal', margin + signatureBoxWidth + 15, yPosition + 8);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(formData.principleName || '_________________', margin + signatureBoxWidth + 15, yPosition + 20);
    
    yPosition += signatureBoxHeight + 10;
    
    // Footer
    const currentPageNumber = doc.internal.getCurrentPageInfo().pageNumber;
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`Page ${currentPageNumber}`, pageWidth / 2, pageHeight - 15, { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    
    // Save PDF
    const currentDate = new Date().toISOString().split('T')[0];
    const employeeName = formData.name ? formData.name.replace(/\s+/g, '_').toLowerCase() : 'employee';
    const filename = `${employeeName}_fpmi_${currentDate}.pdf`;
    
    doc.save(filename);
    
    console.log(`=== PDF GENERATED SUCCESSFULLY ===`);
    console.log(`Filename: ${filename}`);
    console.log(`Remarks included: ${shouldIncludeRemarks}`);
    return filename;
  } catch (error) {
    console.error('=== PDF GENERATION ERROR ===');
    console.error('Error:', error);
    console.error('Stack:', error.stack);
    throw new Error('Failed to generate PDF: ' + error.message);
  }
};