import React from "react";
import { Users, AlertTriangle, Clipboard, CheckCircle, Clock } from "lucide-react";
import { Student, PointHistory } from "../types";

interface HomeOverviewProps {
  students: Student[];
  history: PointHistory[];
  onNavigate: (tab: string) => void;
}

export default function HomeOverview({ students, history, onNavigate }: HomeOverviewProps) {
  // Calculate statistics
  const totalStudents = students.length;
  
  // High risk students (points >= 50)
  const highRiskCount = students.filter(s => s.points >= 50).length;
  
  // Total events today/recent
  const totalCases = history.length;

  const averagePoint = totalStudents > 0 
    ? Math.round(students.reduce((acc, s) => acc + s.points, 0) / totalStudents) 
    : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight font-sans">
            Membimbing dengan Hati, Membangun Generasi Mandiri
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Sistem Informasi Manajemen Bimbingan Konseling (SIM-BK) — SMP AL MAHRUSIYAH Kediri
          </p>
        </div>
        <div className="bg-blue-600 text-white font-bold py-2 px-4 rounded-xl text-xs uppercase tracking-wider self-start shadow-md shadow-blue-100">
          Tahun Ajaran 2026/2027
        </div>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          onClick={() => onNavigate("students")} 
          className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <Users size={24} />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Siswa</p>
          <h3 className="text-3xl font-extrabold text-slate-800 mt-2">{totalStudents} <span className="text-xs font-medium text-slate-400">Siswa</span></h3>
          <p className="text-xs text-blue-600 font-semibold mt-2 group-hover:underline">Kelola Data Siswa →</p>
        </div>

        <div 
          onClick={() => onNavigate("points")} 
          className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <AlertTriangle size={24} />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Siswa Perlu Perhatian</p>
          <h3 className="text-3xl font-extrabold text-slate-800 mt-2">{highRiskCount} <span className="text-xs font-medium text-slate-400">Kasus &ge; 50 Poin</span></h3>
          <p className="text-xs text-amber-600 font-semibold mt-2 group-hover:underline">Periksa Poin Siswa →</p>
        </div>

        <div 
          onClick={() => onNavigate("assessments")} 
          className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <Clipboard size={24} />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rata-rata Poin Sikap</p>
          <h3 className="text-3xl font-extrabold text-slate-800 mt-2">{averagePoint} <span className="text-xs font-medium text-slate-400">Per Siswa</span></h3>
          <p className="text-xs text-teal-600 font-semibold mt-2 group-hover:underline">Lihat Asesmen →</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center mb-4">
            <CheckCircle size={24} />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Riwayat Catatan</p>
          <h3 className="text-3xl font-extrabold text-slate-800 mt-2">{totalCases} <span className="text-xs font-medium text-slate-400">Entri</span></h3>
          <p className="text-xs text-slate-400 font-medium mt-2">Terintegrasi dalam Sistem Keamanan BK</p>
        </div>
      </div>

      {/* Grid: Instructions & Quick Actions, and Riwayat Kasus */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Quick Instructions info panel */}
        <div className="lg:col-span-4 bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-3">ℹ️ Informasi Akses Guru</h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <span className="text-lg">🧑‍🏫</span>
              <div>
                <h4 className="text-sm font-semibold text-slate-800">Khusus Guru BK</h4>
                <p className="text-xs text-slate-500 mt-0.5">Sesuai permintaan kebijakan sekolah, SIM-BK ini ditutup untuk akses siswa ataupun orang tua mandiri.</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <span className="text-lg">📊</span>
              <div>
                <h4 className="text-sm font-semibold text-slate-800">Poin Pelanggaran & Reward</h4>
                <p className="text-xs text-slate-500 mt-0.5">Anda bisa menambahkan pelanggaran baru untuk menambah poin atau mengurangkan poin karena prestasi/perbaikan sikap.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="text-lg">📄</span>
              <div>
                <h4 className="text-sm font-semibold text-slate-800">Cetak Hasil Rekapitulasi</h4>
                <p className="text-xs text-slate-500 mt-0.5">Setiap riwayat pelanggaran anak dapat di-rekapitulasi dan di-cetak resmi menggunakan tombol cetak di halaman Poin.</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex flex-col items-center">
            <p className="text-xs text-blue-800 font-extrabold text-center uppercase tracking-wider">SMP AL MAHRUSIYAH KEDIRI</p>
            <p className="text-[10px] text-slate-500 text-center mt-1 font-medium leading-relaxed">
              Jln. Ngampel Raya Rt 004 Rw 001 Kel. Ngampel Kec. Mojoroto Kota Kediri Jawa Timur
            </p>
            <p className="text-[10px] text-blue-600 font-bold text-center mt-0.5">
              Telp SMP: 0354-770301
            </p>
            <div className="mt-2.5 pt-2 border-t border-blue-100/60 w-full text-center">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Managed by Tim BK SMP Al Mahrusiyah</span>
            </div>
          </div>
        </div>

        {/* Recent logs */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-lg text-slate-800">Riwayat Penilaian Poin Terkini</h3>
            <button 
              onClick={() => onNavigate("points")} 
              className="text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest"
            >
              Kelola Poin →
            </button>
          </div>
          <div className="divide-y divide-slate-100 overflow-y-auto max-h-[360px]">
            {history.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">Belum ada riwayat tercatat.</div>
            ) : (
              history.map((h) => {
                const student = students.find(s => s.id === h.studentId);
                const isViolation = h.type === "VIOLATION";
                const isReward = h.type === "REWARD";
                
                return (
                  <div key={h.id} className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                        isViolation ? "bg-rose-50 text-rose-600" : isReward ? "bg-teal-50 text-teal-600" : "bg-blue-50 text-blue-600"
                      }`}>
                        {isViolation ? "+" : ""}
                        {h.pointsChanged}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 leading-snug">
                          {student ? student.name : "Siswa Tidak Dikenal"}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                          <span className="font-semibold text-slate-600">{student?.studentClass}</span>
                          <span>&bull;</span>
                          <span>{h.description}</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-700">{h.date}</p>
                      <span className={`inline-block py-0.5 px-2 rounded text-[9px] font-bold mt-1 tracking-wider uppercase ${
                        isViolation 
                          ? "bg-rose-50 text-rose-600 border border-rose-100" 
                          : isReward 
                          ? "bg-teal-50 text-teal-600 border border-teal-100" 
                          : "bg-blue-50 text-blue-600 border border-blue-100"
                      }`}>
                        {h.type}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
export {};
