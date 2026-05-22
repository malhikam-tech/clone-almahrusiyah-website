import React, { useState } from "react";
import { ClipboardList, Plus, Search, Calendar, GraduationCap, CheckCircle, Brain, HeartHandshake, Smile, Briefcase } from "lucide-react";
import { Student, NeedAssessment } from "../types";
import { DEFAULT_ASSESSMENTS } from "../data/mockData";

interface AssessmentNeedsViewProps {
  students: Student[];
  assessments: NeedAssessment[];
  onAddAssessment: (item: NeedAssessment) => void;
  onDeleteAssessment: (id: string) => void;
}

export default function AssessmentNeedsView({
  students,
  assessments,
  onAddAssessment,
  onDeleteAssessment
}: AssessmentNeedsViewProps) {
  const [showFormModal, setShowFormModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // New Assessment Form State
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || "");
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [personalScore, setPersonalScore] = useState<number>(50);
  const [socialScore, setSocialScore] = useState<number>(50);
  const [academicScore, setAcademicScore] = useState<number>(50);
  const [careerScore, setCareerScore] = useState<number>(50);
  const [notes, setNotes] = useState("");

  const handleCreateAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    // Calculate intensity of need
    // Higher scores mean higher urgency of counseling intervention
    const average = (personalScore + socialScore + academicScore + careerScore) / 4;
    let category: "Ringan" | "Sedang" | "Sangat Butuh Bantuan" = "Sedang";
    if (average < 35) {
      category = "Ringan";
    } else if (average >= 70) {
      category = "Sangat Butuh Bantuan";
    }

    const newAssessment: NeedAssessment = {
      id: `assessment-${Date.now()}`,
      studentId: selectedStudentId,
      date,
      personalScore,
      socialScore,
      academicScore,
      careerScore,
      notes: notes || "Telah dilakukan wawancara diagnostic awal.",
      category
    };

    onAddAssessment(newAssessment);
    
    // Reset Form
    setNotes("");
    setPersonalScore(50);
    setSocialScore(50);
    setAcademicScore(50);
    setCareerScore(50);
    setShowFormModal(false);
    alert("Survei Asesmen Kebutuhan dan Pemetaan Kebutuhan Layanan BK berhasil disimpan!");
  };

  const filteredAssessments = assessments.filter(ass => {
    const student = students.find(s => s.id === ass.studentId);
    if (!student) return false;
    return student.name.toLowerCase().includes(searchQuery.toLowerCase()) || student.nisn.includes(searchQuery);
  });

  // Calculate aggregated stats for progress bars
  const totalAssessments = assessments.length || 1;
  const avgPersonal = Math.round(assessments.reduce((acc, a) => acc + a.personalScore, 0) / totalAssessments);
  const avgSocial = Math.round(assessments.reduce((acc, a) => acc + a.socialScore, 0) / totalAssessments);
  const avgAcademic = Math.round(assessments.reduce((acc, a) => acc + a.academicScore, 0) / totalAssessments);
  const avgCareer = Math.round(assessments.reduce((acc, a) => acc + a.careerScore, 0) / totalAssessments);

  return (
    <div className="space-y-8">
      {/* Introduction banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-8 rounded-[32px] shadow-lg shadow-blue-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-[10px] bg-blue-500 text-white font-bold px-3 py-1 rounded-md uppercase tracking-wider">
            AKPD (Angket Kebutuhan Peserta Didik)
          </span>
          <h2 className="text-2xl font-bold tracking-tight">Katalog Layanan Asesmen Kebutuhan Siswa</h2>
          <p className="text-slate-100/90 text-xs max-w-xl leading-relaxed">
            Asesmen Kebutuhan digunakan untuk merancang kegiatan Bimbingan Konseling yang relevan berdasarkan bauran domain Pribadi, Sosial, Belajar, dan Karir setiap peserta didik.
          </p>
        </div>

        <button
          onClick={() => setShowFormModal(true)}
          className="flex items-center gap-2 px-5 py-3 bg-white text-blue-800 font-bold rounded-xl text-xs uppercase tracking-wider transition-all hover:bg-slate-50 shadow-md shadow-slate-200 self-start md:self-auto flex-shrink-0"
        >
          <Plus size={16} />
          Input Asesmen Baru
        </button>
      </div>

      {/* Aggregate Need Map (Pemetaan Global Masalah Sekolah) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pribadi (Self)</span>
            <Smile className="text-pink-500" size={20} />
          </div>
          <h4 className="text-2xl font-bold text-slate-800">{avgPersonal}%</h4>
          <div className="w-full h-2 bg-slate-100 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-pink-500" style={{ width: `${avgPersonal}%` }}></div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-medium">Urgensi Bimbingan Karakter Diri</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sosial (Social)</span>
            <HeartHandshake className="text-violet-500" size={20} />
          </div>
          <h4 className="text-2xl font-bold text-slate-800">{avgSocial}%</h4>
          <div className="w-full h-2 bg-slate-100 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-violet-500" style={{ width: `${avgSocial}%` }}></div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-medium">Urgensi Bimbingan Penyesuaian Sosial</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Belajar (Academic)</span>
            <Brain className="text-emerald-500" size={20} />
          </div>
          <h4 className="text-2xl font-bold text-slate-800">{avgAcademic}%</h4>
          <div className="w-full h-2 bg-slate-100 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${avgAcademic}%` }}></div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-medium">Urgensi Bimbingan Metode Pembelajaran</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Karir (Career)</span>
            <Briefcase className="text-amber-500" size={20} />
          </div>
          <h4 className="text-2xl font-bold text-slate-800">{avgCareer}%</h4>
          <div className="w-full h-2 bg-slate-100 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-amber-50" style={{ width: `${avgCareer}%` }}></div>
            <div className="h-full bg-amber-500 -mt-2" style={{ width: `${avgCareer}%` }}></div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-medium">Urgensi Perencanaan Karir Lanjutan</p>
        </div>
      </div>

      {/* Main Grid: Search & Tables of individual surveys */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <span className="material-symbols-outlined text-[18px]">search</span>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari asesi berdasarkan nama..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
            />
          </div>
          <span className="text-slate-400 text-xs font-bold font-sans uppercase">
            Data Terarsip Sejak 2026/05
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                <th className="py-4 px-6">Nama Siswa</th>
                <th className="py-4 px-6 text-center">Pribadi</th>
                <th className="py-4 px-6 text-center">Sosial</th>
                <th className="py-4 px-6 text-center">Belajar</th>
                <th className="py-4 px-6 text-center">Karir</th>
                <th className="py-4 px-6">Hasil Rekomendasi Kasus / Catatan</th>
                <th className="py-4 px-6 text-center">Kategori</th>
                <th className="py-4 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredAssessments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">Belum ada asesmen kebutuhan diinputkan.</td>
                </tr>
              ) : (
                filteredAssessments.map(ass => {
                  const student = students.find(s => s.id === ass.studentId);
                  return (
                    <tr key={ass.id} className="hover:bg-slate-50/50">
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-900">{student?.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {student?.nisn} &bull; <span className="font-semibold text-slate-500">{student?.studentClass}</span>
                        </p>
                      </td>
                      <td className="py-4 px-6 text-center font-bold font-mono text-pink-600">{ass.personalScore}%</td>
                      <td className="py-4 px-6 text-center font-bold font-mono text-violet-600">{ass.socialScore}%</td>
                      <td className="py-4 px-6 text-center font-bold font-mono text-emerald-600">{ass.academicScore}%</td>
                      <td className="py-4 px-6 text-center font-bold font-mono text-amber-600">{ass.careerScore}%</td>
                      <td className="py-4 px-6 text-slate-650 max-w-xs truncate" title={ass.notes}>
                        💡 {ass.notes}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-block py-1 px-2.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase ${
                          ass.category === "Sangat Butuh Bantuan" 
                            ? "bg-rose-100 text-rose-800" 
                            : ass.category === "Sedang" 
                            ? "bg-amber-100 text-amber-800" 
                            : "bg-teal-100 text-teal-800"
                        }`}>
                          {ass.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => onDeleteAssessment(ass.id)}
                          className="text-slate-400 hover:text-rose-600 p-2 hover:bg-rose-50 rounded-lg transition-transform"
                          title="Hapus Asesmen"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Input New Assessment Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden">
            <form onSubmit={handleCreateAssessment}>
              <div className="px-8 py-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ClipboardList className="text-blue-600" size={24} />
                  <h3 className="font-bold text-slate-800 text-lg">Input Baru Pemetaan Asesmen Kebutuhan Siswa</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="text-slate-400 hover:bg-slate-100 p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 font-sans">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Pilih Nama Anak Didik</label>
                    <select
                      value={selectedStudentId}
                      onChange={(e) => setSelectedStudentId(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-semibold"
                      required
                    >
                      <option value="">-- Pilih Siswa --</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.studentClass})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Tanggal Asesmen / Pelaksanaan</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2"
                      required
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4">Nilai Intensitas Kerincian Masalah / Kecondongan Kebutuhan (0% - 100%):</h4>
                  <p className="text-[10px] text-slate-400 italic mb-4">*Makin tinggi persen, makin urgent butuh intervensi program BK.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>PRIBADI (Kesejahteraan Emosi)</span>
                        <span className="text-pink-600">{personalScore}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" max="100" 
                        value={personalScore} 
                        onChange={(e) => setPersonalScore(parseInt(e.target.value))}
                        className="w-full accent-pink-500" 
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>SOSIAL (Interaksi & Aturan)</span>
                        <span className="text-violet-600">{socialScore}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" max="100" 
                        value={socialScore} 
                        onChange={(e) => setSocialScore(parseInt(e.target.value))}
                        className="w-full accent-violet-500" 
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>BELAJAR (Metode & Motivasi)</span>
                        <span className="text-emerald-600">{academicScore}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" max="100" 
                        value={academicScore} 
                        onChange={(e) => setAcademicScore(parseInt(e.target.value))}
                        className="w-full accent-emerald-500" 
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>KARIR (Pemilihan Studi & Masa Depan)</span>
                        <span className="text-amber-600">{careerScore}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" max="100" 
                        value={careerScore} 
                        onChange={(e) => setCareerScore(parseInt(e.target.value))}
                        className="w-full accent-amber-500" 
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Catatan Pendukung Layanan/Diagnosa Khusus</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Sangat pemalu di asrama, kurang bugar pada jam pagi belajar..."
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs text-slate-600 font-medium"
                  />
                </div>
              </div>

              <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-5 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl text-xs uppercase tracking-wider transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-100"
                >
                  Simpan Laporan AKPD
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export {};
