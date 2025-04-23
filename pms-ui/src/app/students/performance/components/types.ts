// students/components/types.ts

// Existing types...

export interface CertificationFile {
  filename: string;
  filepath: string;
  uploadDate: string;
}

export interface Performance {
  _id: string;
  student_id: string;
  tenth_cgpa: number;
  twelfth_cgpa: number;
  degree_cgpa: number;
  mca_cgpa: number[];
  semester: number;
  skills: string[];
  certification_files: CertificationFile[];
}