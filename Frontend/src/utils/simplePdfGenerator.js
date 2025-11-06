import jsPDF from 'jspdf';

export const generateSimpleFPMIPDF = (formData) => {
  try {
    console.log("Starting comprehensive PDF generation with all evaluation details...");
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    let yPosition = 25;
    
    // Helper function to check if we need a new page
    const checkNewPage = (spaceNeeded = 20) => {
      if (yPosition + spaceNeeded > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };
    
    // Helper function to add section header
    const addSectionHeader = (title, fontSize = 12) => {
      checkNewPage(25);
      doc.setFontSize(fontSize);
      doc.setFont(undefined, 'bold');
      doc.text(title, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;
    };
    
    // College Header
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Dayananda Sagar College of Engineering', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;
    
    // Title
    doc.setFontSize(14);
    doc.text('Faculty Performance Measuring Index (FPMI)', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;
    
    
    // Faculty Information
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    
    const facultyInfo = [
      `Employee Code: ${formData.employeeCode || 'N/A'}`,
      `Name: ${formData.name || 'N/A'}`,
      `Designation: ${formData.designation || 'N/A'}`,
      `Department: ${formData.department || 'N/A'}`,
      `College: ${formData.college || 'N/A'}`,
      `Campus: ${formData.campus || 'N/A'}`,
      `Joining Date: ${formData.joiningDate || 'N/A'}`,
      `Period of Assessment: ${formData.periodOfAssessment || 'N/A'}`
    ];
    
    facultyInfo.forEach(info => {
      checkNewPage(10);
      doc.text(info, margin, yPosition);
      yPosition += 8;
    });
    
    yPosition += 10;
    
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
    
    // Table headers
    checkNewPage(50);
    doc.setFont(undefined, 'bold');
    doc.text('Assessment Head', margin, yPosition);
    doc.text('Max', margin + 120, yPosition);
    doc.text('Self', margin + 140, yPosition);
    doc.text('HoD', margin + 160, yPosition);
    doc.text('External', margin + 180, yPosition);
    yPosition += 8;
    
    // Draw header line
    doc.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2);
    yPosition += 5;
    
    // Table rows
    doc.setFont(undefined, 'normal');
    categories.forEach(category => {
      checkNewPage(10);
      doc.text(category.title, margin, yPosition);
      doc.text(category.max.toString(), margin + 120, yPosition);
      doc.text((formData.categoriesTotal?.[`${category.key}Self`] || "0").toString(), margin + 140, yPosition);
      doc.text((formData.categoriesTotal?.[`${category.key}HoD`] || "0").toString(), margin + 160, yPosition);
      doc.text((formData.categoriesTotal?.[`${category.key}External`] || "0").toString(), margin + 180, yPosition);
      yPosition += 8;
    });
    
    // Total row
    yPosition += 5;
    doc.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2);
    yPosition += 5;
    
    doc.setFont(undefined, 'bold');
    doc.text('Total', margin, yPosition);
    doc.text('300', margin + 120, yPosition);
    doc.text((formData.totalSelf || "0").toString(), margin + 140, yPosition);
    doc.text((formData.totalHoD || "0").toString(), margin + 160, yPosition);
    doc.text((formData.totalExternal || "0").toString(), margin + 180, yPosition);
    yPosition += 20;

    // Now add detailed evaluation sections
    
    // 1. Teaching Learning Process (TLP) Details
    addSectionHeader('1. Teaching Learning Process (TLP) - Detailed Evaluation');
    
    const tlpItems = [
      { key: 'TLP111', title: '1.1.1 Lectures taken as percentage of lectures allocated as per academic calendar' },
      { key: 'TLP112', title: '1.1.2 Tutorials taken as percentage of tutorials allocated as per timetable' },
      { key: 'TLP113', title: '1.1.3 Lab sessions taken as percentage of lab sessions allocated as per timetable' },
      { key: 'TLP114', title: '1.1.4 Additional academic activities and innovative teaching methods' }
    ];
    
    // Add TLP evaluation table
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    checkNewPage(30);
    doc.text('Item', margin, yPosition);
    doc.text('Self', margin + 120, yPosition);
    doc.text('HoD', margin + 140, yPosition);
    doc.text('External', margin + 160, yPosition);
    yPosition += 8;
    doc.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2);
    yPosition += 5;
    
    doc.setFont(undefined, 'normal');
    tlpItems.forEach(item => {
      checkNewPage(10);
      const wrappedTitle = doc.splitTextToSize(item.title, 115);
      doc.text(wrappedTitle, margin, yPosition);
      doc.text((formData[`${item.key}Self`] || "0").toString(), margin + 120, yPosition);
      doc.text((formData[`${item.key}HoD`] || "0").toString(), margin + 140, yPosition);
      doc.text((formData[`${item.key}External`] || "0").toString(), margin + 160, yPosition);
      yPosition += Math.max(8, wrappedTitle.length * 4);
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
    
    // Add PDRC evaluation table
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    checkNewPage(30);
    doc.text('Item', margin, yPosition);
    doc.text('Self', margin + 120, yPosition);
    doc.text('HoD', margin + 140, yPosition);
    doc.text('External', margin + 160, yPosition);
    yPosition += 8;
    doc.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2);
    yPosition += 5;
    
    doc.setFont(undefined, 'normal');
    pdrcItems.forEach(item => {
      checkNewPage(10);
      const wrappedTitle = doc.splitTextToSize(item.title, 115);
      doc.text(wrappedTitle, margin, yPosition);
      doc.text((formData[`${item.key}Self`] || "0").toString(), margin + 120, yPosition);
      doc.text((formData[`${item.key}HoD`] || "0").toString(), margin + 140, yPosition);
      doc.text((formData[`${item.key}External`] || "0").toString(), margin + 160, yPosition);
      yPosition += Math.max(8, wrappedTitle.length * 4);
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
    
    // Add CDL evaluation table
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    checkNewPage(30);
    doc.text('Item', margin, yPosition);
    doc.text('Self', margin + 120, yPosition);
    doc.text('HoD', margin + 140, yPosition);
    doc.text('External', margin + 160, yPosition);
    yPosition += 8;
    doc.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2);
    yPosition += 5;
    
    doc.setFont(undefined, 'normal');
    cdlItems.forEach(item => {
      checkNewPage(10);
      const wrappedTitle = doc.splitTextToSize(item.title, 115);
      doc.text(wrappedTitle, margin, yPosition);
      doc.text((formData[`${item.key}Self`] || "0").toString(), margin + 120, yPosition);
      doc.text((formData[`${item.key}HoD`] || "0").toString(), margin + 140, yPosition);
      doc.text((formData[`${item.key}External`] || "0").toString(), margin + 160, yPosition);
      yPosition += Math.max(8, wrappedTitle.length * 4);
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
    
    // Add CIL evaluation table
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    checkNewPage(30);
    doc.text('Item', margin, yPosition);
    doc.text('Self', margin + 120, yPosition);
    doc.text('HoD', margin + 140, yPosition);
    doc.text('External', margin + 160, yPosition);
    yPosition += 8;
    doc.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2);
    yPosition += 5;
    
    doc.setFont(undefined, 'normal');
    cilItems.forEach(item => {
      checkNewPage(10);
      const wrappedTitle = doc.splitTextToSize(item.title, 115);
      doc.text(wrappedTitle, margin, yPosition);
      doc.text((formData[`${item.key}Self`] || "0").toString(), margin + 120, yPosition);
      doc.text((formData[`${item.key}HoD`] || "0").toString(), margin + 140, yPosition);
      doc.text((formData[`${item.key}External`] || "0").toString(), margin + 160, yPosition);
      yPosition += Math.max(8, wrappedTitle.length * 4);
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
    
    // Add IOW evaluation table
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    checkNewPage(30);
    doc.text('Item', margin, yPosition);
    doc.text('Self', margin + 120, yPosition);
    doc.text('HoD', margin + 140, yPosition);
    doc.text('External', margin + 160, yPosition);
    yPosition += 8;
    doc.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2);
    yPosition += 5;
    
    doc.setFont(undefined, 'normal');
    iowItems.forEach(item => {
      checkNewPage(10);
      const wrappedTitle = doc.splitTextToSize(item.title, 115);
      doc.text(wrappedTitle, margin, yPosition);
      doc.text((formData[`${item.key}Self`] || "0").toString(), margin + 120, yPosition);
      doc.text((formData[`${item.key}HoD`] || "0").toString(), margin + 140, yPosition);
      doc.text((formData[`${item.key}External`] || "0").toString(), margin + 160, yPosition);
      yPosition += Math.max(8, wrappedTitle.length * 4);
    });
    
    yPosition += 15;
    
    // Signatures Section
    addSectionHeader('Signatures', 12);
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    
    checkNewPage(40);
    doc.text('Faculty Member: ' + (formData.name || '_________________'), margin, yPosition);
    doc.text('HoD: ' + (formData.HODName || '_________________'), margin + 100, yPosition);
    yPosition += 15;
    
    doc.text('External Evaluator: ' + (formData.externalEvaluatorName || '_________________'), margin, yPosition);
    doc.text('Principal: ' + (formData.principleName || '_________________'), margin + 100, yPosition);
    
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