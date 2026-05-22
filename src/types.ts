export type StudentClass =
  | "VII-A" | "VII-B" | "VII-C" | "VII-D" | "VII-E" | "VII-F" | "VII-G" | "VII-H" | "VII-I" | "VII-J" | "VII-K" | "VII-L"
  | "VIII-A" | "VIII-B" | "VIII-C" | "VIII-D" | "VIII-E" | "VIII-F" | "VIII-G" | "VIII-H" | "VIII-I" | "VIII-J" | "VIII-K" | "VIII-L"
  | "IX-A" | "IX-B" | "IX-C" | "IX-D" | "IX-E" | "IX-F" | "IX-G" | "IX-H" | "IX-I" | "IX-J" | "IX-K" | "IX-L";

export interface Student {
  id: string; // NISN or UUID
  nisn: string;
  name: string;
  gender: "L" | "P";
  studentClass: StudentClass;
  phone: string;
  parentPhone: string;
  points: number; // Current violation points
}

export interface ViolationType {
  id: string;
  name: string;
  points: number;
}

export interface PointHistory {
  id: string;
  studentId: string;
  type: "VIOLATION" | "REWARD" | "ADJUSTMENT";
  description: string;
  pointsChanged: number; // Positive for violation, negative for reward/reduction
  date: string;
}

export interface NeedAssessment {
  id: string;
  studentId: string;
  date: string;
  personalScore: number; // 0-100 indicating intensity of need
  socialScore: number;
  academicScore: number;
  careerScore: number;
  notes: string;
  category: "Ringan" | "Sedang" | "Sangat Butuh Bantuan";
}

export interface CounselingLog {
  id: string;
  studentId: string;
  date: string;
  counselorName: string; // Dropdown input
  type: "Individu" | "Kelompok" | "Klasikal" | "Lainnya";
  issue: string; // Masalah/Keluhan
  solution: string; // Solusi/Tindak Lanjut
  evaluation: string; // Evaluasi hasil bimbingan
  status: "Selesai" | "Dalam Pemantauan" | "Perlu Rujukan";
}

