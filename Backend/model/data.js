import mongoose from "mongoose" 

const evaluationSchema = new mongoose.Schema({
  name: { type: String },
  employeeCode: { type: String },
  designation: { type: String },
  department: { type: String },
  college: { type: String },
  campus: { type: String },
  joiningDate: { type: Date },
  periodOfAssessment: { type: Date },
  externalEvaluatorName: { type: String },
  principleName: { type: String },
  HODName: { type: String },

  categoriesTotal: {
    CDLExternal: Number,
    CDLHoD: Number,
    CDLSelf: Number,
    CILExternal: Number,
    CILHoD: Number,
    CILSelf: Number,
    IOWExternal: Number,
    IOWHoD: Number,
    IOWSelf: Number,
    PDRCExternal: Number,
    PDRCHoD: Number,
    PDRCSelf: Number,
    TLPExternal: Number,
    TLPHoD: Number,
    TLPSelf: Number,
  },

  totalExternal: { type: Number },
  totalHoD: { type: Number },
  totalSelf: { type: Number },

  RemarksExternal: { type: String },
  RemarksHoD: { type: String },
  RemarksPrincipal: { type: String },
  
  CDL31External: { type: String },
  CDL31HoD: { type: String },
  CDL31Self: { type: String },
  CDL31SelfImage: { type: String },
  
  CDL32External: { type: String },
  CDL32HoD: { type: String },
  CDL32Self: { type: String },
  CDL32SelfImage: { type: String },
  
  CDL33External: { type: String },
  CDL33HoD: { type: String },
  CDL33Self: { type: String },
  CDL33SelfImage: { type: String },
  
  CDL34External: { type: String },
  CDL34HoD: { type: String },
  CDL34Self: { type: String },
  CDL34SelfImage: { type: String },
  
  CDL35External: { type: String },
  CDL35HoD: { type: String },
  CDL35Self: { type: String },
  CDL35SelfImage: { type: String },
  
  CIL4External: { type: String },
  CIL4HoD: { type: String },
  CIL4Self: { type: String },
  CIL4SelfImage: { type: String },
  
  IOW511External: { type: String },
  IOW511HoD: { type: String },
  IOW511Self: { type: String },
  IOW511SelfImage: { type: String },
  
  IOW512External: { type: String },
  IOW512HoD: { type: String },
  IOW512Self: { type: String },
  IOW512SelfImage: { type: String },
  
  IOW513External: { type: String },
  IOW513HoD: { type: String },
  IOW513Self: { type: String },
  IOW513SelfImage: { type: String },
  
  IOW521External: { type: String },
  IOW521HoD: { type: String },
  IOW521Self: { type: String },
  IOW521SelfImage: { type: String },
  
  IOW522External: { type: String },
  IOW522HoD: { type: String },
  IOW522Self: { type: String },
  IOW522SelfImage: { type: String },
  
  IOW523External: { type: String },
  IOW523HoD: { type: String },
  IOW523Self: { type: String },
  IOW523SelfImage: { type: String },
  
  IOW524External: { type: String },
  IOW524HoD: { type: String },
  IOW524Self: { type: String },
  IOW524SelfImage: { type: String },
  
  IOW525External: { type: String },
  IOW525HoD: { type: String },
  IOW525Self: { type: String },
  IOW525SelfImage: { type: String },
  
  PDRC211External: { type: String },
  PDRC211HoD: { type: String },
  PDRC211Self: { type: String },
  PDRC211SelfImage: { type: String },
  
  PDRC212External: { type: String },
  PDRC212HoD: { type: String },
  PDRC212Self: { type: String },
  PDRC212SelfImage: { type: String },
  
  PDRC213External: { type: String },
  PDRC213HoD: { type: String },
  PDRC213Self: { type: String },
  PDRC213SelfImage: { type: String },
  
  PDRC214External: { type: String },
  PDRC214HoD: { type: String },
  PDRC214Self: { type: String },
  PDRC214SelfImage: { type: String },
  
  PDRC221External: { type: String },
  PDRC221HoD: { type: String },
  PDRC221Self: { type: String },
  PDRC221SelfImage: { type: String },
  
  PDRC222External: { type: String },
  PDRC222HoD: { type: String },
  PDRC222Self: { type: String },
  PDRC222SelfImage: { type: String },
  
  TLP111External: { type: String },
  TLP111HoD: { type: String },
  TLP111Self: { type: String },
  TLP111SelfImage: { type: String },
  
  TLP112External: { type: String },
  TLP112HoD: { type: String },
  TLP112Self: { type: String },
  TLP112SelfImage: { type: String },
  
  TLP113External: { type: String },
  TLP113HoD: { type: String },
  TLP113Self: { type: String },
  TLP113SelfImage: { type: String },
  
  TLP114External: { type: String },
  TLP114HoD: { type: String },
  TLP114Self: { type: String },
  TLP114SelfImage: { type: String }

}, { timestamps: true });

export default mongoose.model('Evaluation', evaluationSchema);