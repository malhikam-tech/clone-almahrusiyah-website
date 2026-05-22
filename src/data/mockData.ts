import { Student, ViolationType, PointHistory, NeedAssessment, CounselingLog } from "../types";

export const CLASSES_LIST = [
  "VII-A", "VII-B", "VII-C", "VII-D", "VII-E", "VII-F", "VII-G", "VII-H", "VII-I", "VII-J", "VII-K", "VII-L",
  "VIII-A", "VIII-B", "VIII-C", "VIII-D", "VIII-E", "VIII-F", "VIII-G", "VIII-H", "VIII-I", "VIII-J", "VIII-K", "VIII-L",
  "IX-A", "IX-B", "IX-C", "IX-D", "IX-E", "IX-F", "IX-G", "IX-H", "IX-I", "IX-J", "IX-K", "IX-L"
] as const;

export const DEFAULT_STUDENTS: Student[] = [
  { id: "1", nisn: "23456781", name: "Ahmad Syafi'i", gender: "L", studentClass: "VII-A", phone: "081234567801", parentPhone: "081234567802", points: 15 },
  { id: "2", nisn: "23456782", name: "Siti Rahmawati", gender: "P", studentClass: "VII-B", phone: "081234567803", parentPhone: "081234567804", points: 5 },
  { id: "3", nisn: "23456783", name: "Muhammad Zaki", gender: "L", studentClass: "VIII-A", phone: "081234567805", parentPhone: "081234567806", points: 45 },
  { id: "4", nisn: "23456784", name: "Fatimah Az-Zahra", gender: "P", studentClass: "VIII-B", phone: "081234567807", parentPhone: "081234567808", points: 0 },
  { id: "5", nisn: "23456785", name: "Andika Pratama", gender: "L", studentClass: "IX-A", phone: "081234567809", parentPhone: "081234567810", points: 80 },
  { id: "6", nisn: "23456786", name: "Nabila Aurelia", gender: "P", studentClass: "IX-A", phone: "081234567811", parentPhone: "081234567812", points: 10 },
  { id: "7", nisn: "23456787", name: "Rizky Ramadhan", gender: "L", studentClass: "IX-B", phone: "081234567813", parentPhone: "081234567814", points: 25 },
  { id: "8", nisn: "23456788", name: "Alya Putri", gender: "P", studentClass: "IX-C", phone: "081234567815", parentPhone: "081234567816", points: 0 }
];

export const DEFAULT_VIOLATION_TYPES: ViolationType[] = [
  { id: "v1", name: "Terlambat Masuk Sekolah", points: 5 },
  { id: "v2", name: "Tidak Memakai Seragam Lengkap/Atribut", points: 5 },
  { id: "v3", name: "Membawa HP Tanpa Izin Guru/Sistem", points: 15 },
  { id: "v4", name: "Mengobrol/Mengganggu Saat BM Berlangsung", points: 5 },
  { id: "v5", name: "Keluar Kelas Tanpa Izin Saat Jam Pelajaran", points: 10 },
  { id: "v6", name: "Model Rambut Tidak Sesuai Aturan (Putra)", points: 10 },
  { id: "v7", name: "Berkelahi / Melakukan Intimidasi (Bullying)", points: 50 },
  { id: "v8", name: "Mengecat Rambut / Kuku / Make Up Berlebih", points: 15 },
  { id: "v9", name: "Membawa/Mengonsumsi Rokok di Sekolah", points: 50 },
  { id: "v10", name: "Melompati Pagar / Membolos Sekolah", points: 25 },
  { id: "v11", name: "Merusak Fasilitas / Sarana Prasarana Sekolah", points: 30 }
];

export const DEFAULT_POINT_HISTORY: PointHistory[] = [
  { id: "h1", studentId: "3", type: "VIOLATION", description: "Terlambat Masuk Sekolah (v1)", pointsChanged: 5, date: "2026-05-15" },
  { id: "h2", studentId: "3", type: "VIOLATION", description: "Membawa HP Tanpa Izin Guru/Sistem (v3)", pointsChanged: 15, date: "2026-05-16" },
  { id: "h3", studentId: "3", type: "VIOLATION", description: "Melompati Pagar / Membolos Sekolah (v10)", pointsChanged: 25, date: "2026-05-18" },
  { id: "h4", studentId: "5", type: "VIOLATION", description: "Berkelahi / Melakukan Intimidasi (Bullying) (v7)", pointsChanged: 50, date: "2024-05-12" },
  { id: "h5", studentId: "5", type: "VIOLATION", description: "Membawa/Mengonsumsi Rokok di Sekolah (v9)", pointsChanged: 50, date: "2024-05-14" },
  { id: "h6", studentId: "5", type: "REWARD", description: "Penurunan Poin: Juara Lomba Kebersihan & Membantu Gotong Royong", pointsChanged: -20, date: "2024-05-17" },
  { id: "h7", studentId: "1", type: "VIOLATION", description: "Mengecat Rambut / Kuku / Make Up Berlebih (v8)", pointsChanged: 15, date: "2024-05-19" }
];

export const DEFAULT_ASSESSMENTS: NeedAssessment[] = [
  {
    id: "a1",
    studentId: "1",
    date: "2026-05-10",
    personalScore: 40,
    socialScore: 65,
    academicScore: 50,
    careerScore: 60,
    notes: "Siswa membutuhkan bimbingan tentang pengembangan relasi pertemanan di kelas baru.",
    category: "Sedang"
  },
  {
    id: "a2",
    studentId: "3",
    date: "2026-05-12",
    personalScore: 75,
    socialScore: 40,
    academicScore: 80,
    careerScore: 55,
    notes: "Sangat membutuhkan bimbingan motivasi belajar karir serta regulasi emosi diri.",
    category: "Sangat Butuh Bantuan"
  },
  {
    id: "a3",
    studentId: "6",
    date: "2026-05-14",
    personalScore: 20,
    socialScore: 25,
    academicScore: 30,
    careerScore: 35,
    notes: "Siswa stabil dan menunjukkan pemahaman sikap mandiri yang sangat baik.",
    category: "Ringan"
  }
];

export const COUNSELORS_LIST = [
  "ARIEF AZIZY, S.Psi.",
  "ELI SETYOWATI, S.Pd.",
  "Annisatul Qusna, S.Psi.",
  "Yessi Ermawati, S.Sos.",
  "WILDAN MUBAROK, S.Psi."
] as const;

export const DEFAULT_COUNSELING_LOGS: CounselingLog[] = [
  {
    id: "cl-1",
    studentId: "1",
    date: "2026-05-18",
    counselorName: "ARIEF AZIZY, S.Psi.",
    type: "Individu",
    issue: "Siswa sering mengantuk di kelas karena begadang bermain game online di asrama.",
    solution: "Memberikan pembinaan kedisiplinan dan membuat kesepakatan jadwal tidur malam bersama pendamping asrama.",
    evaluation: "Ada kemajuan, siswa berjanji mengumpulkan HP ke pengurus asrama tepat pukul 21:30.",
    status: "Dalam Pemantauan"
  },
  {
    id: "cl-2",
    studentId: "3",
    date: "2026-05-19",
    counselorName: "ELI SETYOWATI, S.Pd.",
    type: "Individu",
    issue: "Siswa merasa cemas dan kurang percaya diri menjelang ujian tengah semester.",
    solution: "Mengajarkan teknik relaksasi pernapasan dan menyusun strategi belajar efektif.",
    evaluation: "Kecemasan menurun, siswa merasa lebih siap secara emosional dan mental.",
    status: "Selesai"
  }
];

