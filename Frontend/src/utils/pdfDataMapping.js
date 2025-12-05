// Complete mapping of all evaluation criteria from the forms
export const evaluationCriteria = {
  TLP: {
    title: "Teaching Learning Process (TLP)",
    maxPoints: 80,
    items: [
      {
        key: "TLP111",
        code: "1.1.1",
        title: "Lectures taken as percentage of lectures allocated",
        description: "Lectures taken as percentage of lectures allocated as per academic calendar (100% compliance = 10 points)",
        maxPoints: 10
      },
      {
        key: "TLP112",
        code: "1.1.2",
        title: "Tutorials/Practical hours undertaken",
        description: "Tutorials, practical, contact hours undertaken as percentage of those allocated (100% compliance = 10 points)",
        maxPoints: 10
      },
      {
        key: "TLP113",
        code: "1.1.3",
        title: "Lab sessions conducted",
        description: "Lab sessions taken as percentage of lab sessions allocated (100% compliance = 10 points)",
        maxPoints: 10
      },
      {
        key: "TLP114",
        code: "1.1.4",
        title: "Additional academic activities",
        description: "Additional academic activities like remedial classes, doubt clearing sessions, innovative teaching methods",
        maxPoints: 10
      },
      {
        key: "TLP115",
        code: "1.1.5",
        title: "Course material preparation",
        description: "Preparation of course material, notes, presentations, and learning resources",
        maxPoints: 10
      },
      {
        key: "TLP116",
        code: "1.1.6",
        title: "Student mentoring and guidance",
        description: "Student mentoring, career guidance, and academic counseling activities",
        maxPoints: 10
      }
    ]
  },
  PDRC: {
    title: "Professional Development and Research Contribution (PDRC)",
    maxPoints: 90,
    subsections: [
      {
        title: "2.1 Professional Development",
        items: [
          {
            key: "PDRC211",
            code: "2.1.1",
            title: "Higher qualifications acquired",
            description: "Acquiring higher qualifications (Ph.D., M.Tech, certifications) during the appraisal period",
            maxPoints: 10
          },
          {
            key: "PDRC212",
            code: "2.1.2",
            title: "Certified trainer status",
            description: "Acquiring status of Certified trainer for skill development courses",
            maxPoints: 10
          },
          {
            key: "PDRC213",
            code: "2.1.3",
            title: "FDP/Training/Workshop attended",
            description: "Faculty Development Programs, Training sessions, Workshops, Seminars, Conferences attended",
            maxPoints: 10
          },
          {
            key: "PDRC214",
            code: "2.1.4",
            title: "Expert lectures delivered",
            description: "Invited talks, Keynote addresses, Expert lectures delivered at other institutions",
            maxPoints: 10
          }
        ]
      },
      {
        title: "2.2 Research Achievements",
        items: [
          {
            key: "PDRC221",
            code: "2.2.1",
            title: "Journal publications",
            description: "Research publications in peer-reviewed journals (SCI, Scopus, UGC-CARE listed)",
            maxPoints: 10
          },
          {
            key: "PDRC222",
            code: "2.2.2",
            title: "Conference publications",
            description: "Research papers published in conference proceedings (International/National)",
            maxPoints: 10
          },
          {
            key: "PDRC223",
            code: "2.2.3",
            title: "Patents filed/granted",
            description: "Patents filed or granted during the appraisal period",
            maxPoints: 10
          },
          {
            key: "PDRC224",
            code: "2.2.4",
            title: "Research projects",
            description: "Research projects undertaken as PI/Co-PI (funded by government/industry)",
            maxPoints: 10
          },
          {
            key: "PDRC225",
            code: "2.2.5",
            title: "Book/Chapter authorship",
            description: "Books or book chapters authored/edited (ISBN registered)",
            maxPoints: 10
          },
          {
            key: "PDRC226",
            code: "2.2.6",
            title: "PhD/Master's guidance",
            description: "Ph.D. or Master's students guided/co-guided",
            maxPoints: 10
          },
          {
            key: "PDRC227",
            code: "2.2.7",
            title: "Awards and recognitions",
            description: "Awards, honors, and recognitions received for research/academic contributions",
            maxPoints: 10
          },
          {
            key: "PDRC228",
            code: "2.2.8",
            title: "Research lab development",
            description: "Establishment/enhancement of research laboratories and facilities",
            maxPoints: 10
          }
        ]
      }
    ]
  },
  CDL: {
    title: "Contribution at Departmental Level (CDL)",
    maxPoints: 50,
    items: [
      {
        key: "CDL31",
        code: "3.1",
        title: "Departmental committee activities",
        description: "Participation in departmental committees, academic planning, curriculum development",
        maxPoints: 10
      },
      {
        key: "CDL32",
        code: "3.2",
        title: "Student activities coordination",
        description: "Coordination of student clubs, technical societies, and extracurricular activities",
        maxPoints: 10
      },
      {
        key: "CDL33",
        code: "3.3",
        title: "Department events organization",
        description: "Organization of technical events, workshops, guest lectures at department level",
        maxPoints: 10
      },
      {
        key: "CDL34",
        code: "3.4",
        title: "Infrastructure development",
        description: "Contribution to department infrastructure, lab setup, equipment procurement",
        maxPoints: 10
      },
      {
        key: "CDL35",
        code: "3.5",
        title: "Academic administration",
        description: "Administrative responsibilities like timetable coordination, exam duties, result processing",
        maxPoints: 10
      }
    ]
  },
  CIL: {
    title: "Contribution at Institutional Level (CIL)",
    maxPoints: 30,
    items: [
      {
        key: "CIL4",
        code: "4.1",
        title: "Institutional governance",
        description: "Member of statutory bodies: NBA/NAAC/NIRF Coordinator/Member, IQAC Coordinator/Member, Member of BoS/Faculty/Academic council, and various college/university level committees. Activities such as Internship and Placement Support.",
        maxPoints: 30
      }
    ]
  },
  IOW: {
    title: "Interaction with Outside World (IOW) / External Interface (EI)",
    maxPoints: 50,
    subsections: [
      {
        title: "5.1 Industry and Academic Interface (A = 10 points per activity)",
        items: [
          {
            key: "IOW511",
            code: "5.1.1",
            title: "Invited as speaker",
            description: "Invited as speaker/resource person at external institutions/industry",
            maxPoints: 10
          },
          {
            key: "IOW512",
            code: "5.1.2",
            title: "Live industrial projects",
            description: "Live industrial projects executed with students",
            maxPoints: 10
          },
          {
            key: "IOW513",
            code: "5.1.3",
            title: "MoU facilitation",
            description: "Facilitation of MoU with industries/institutions for collaborative activities",
            maxPoints: 10
          },
          {
            key: "IOW514",
            code: "5.1.4",
            title: "Consultancy projects",
            description: "Consultancy projects undertaken for industry/government organizations",
            maxPoints: 10
          },
          {
            key: "IOW515",
            code: "5.1.5",
            title: "Internship coordination",
            description: "Coordination of student internships with industry partners",
            maxPoints: 10
          },
          {
            key: "IOW516",
            code: "5.1.6",
            title: "Industry visits organized",
            description: "Organization of industrial visits and field trips for students",
            maxPoints: 10
          }
        ]
      },
      {
        title: "5.2 Professional and Social Engagement (B = 4 points per activity)",
        items: [
          {
            key: "IOW521",
            code: "5.2.1",
            title: "Subject expert on panels",
            description: "Subject expert for interview panels, selection committees",
            maxPoints: 4
          },
          {
            key: "IOW522",
            code: "5.2.2",
            title: "External examiner",
            description: "External examiner for universities, question paper setting, valuation",
            maxPoints: 4
          },
          {
            key: "IOW523",
            code: "5.2.3",
            title: "Journal reviewer",
            description: "Reviewer for International/National journals and conferences",
            maxPoints: 4
          },
          {
            key: "IOW524",
            code: "5.2.4",
            title: "Professional society membership",
            description: "Membership and active participation in professional societies (IEEE, ACM, CSI, etc.)",
            maxPoints: 4
          },
          {
            key: "IOW525",
            code: "5.2.5",
            title: "Community outreach",
            description: "Community outreach programs, social service activities, extension programs",
            maxPoints: 4
          }
        ]
      }
    ]
  }
};

// Helper function to get all items flattened
export const getAllItems = () => {
  const allItems = [];
  
  // TLP items
  evaluationCriteria.TLP.items.forEach(item => {
    allItems.push({ ...item, section: "TLP", sectionTitle: evaluationCriteria.TLP.title });
  });
  
  // PDRC items
  evaluationCriteria.PDRC.subsections.forEach(subsection => {
    subsection.items.forEach(item => {
      allItems.push({ ...item, section: "PDRC", sectionTitle: evaluationCriteria.PDRC.title, subsectionTitle: subsection.title });
    });
  });
  
  // CDL items
  evaluationCriteria.CDL.items.forEach(item => {
    allItems.push({ ...item, section: "CDL", sectionTitle: evaluationCriteria.CDL.title });
  });
  
  // CIL items
  evaluationCriteria.CIL.items.forEach(item => {
    allItems.push({ ...item, section: "CIL", sectionTitle: evaluationCriteria.CIL.title });
  });
  
  // IOW items
  evaluationCriteria.IOW.subsections.forEach(subsection => {
    subsection.items.forEach(item => {
      allItems.push({ ...item, section: "IOW", sectionTitle: evaluationCriteria.IOW.title, subsectionTitle: subsection.title });
    });
  });
  
  return allItems;
};

// Helper function to get items by section
export const getItemsBySection = (section) => {
  const criteria = evaluationCriteria[section];
  if (!criteria) return [];
  
  if (criteria.subsections) {
    return criteria.subsections.flatMap(subsection => subsection.items);
  }
  
  return criteria.items || [];
};
