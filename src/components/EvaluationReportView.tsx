import React, { useState, useRef } from "react";
import { 
  FileText, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  Printer, 
  Award, 
  HelpCircle, 
  ChevronRight, 
  CheckCircle, 
  UserCheck, 
  BookOpen, 
  Activity, 
  PieChart, 
  MessageSquare,
  Edit2
} from "lucide-react";
import { Student, PointHistory, NeedAssessment, CounselingLog } from "../types";
import { CLASSES_LIST } from "../data/mockData";

interface EvaluationReportViewProps {
  students: Student[];
  history: PointHistory[];
  assessments: NeedAssessment[];
  logs: CounselingLog[];
  counselors: string[];
  principalName: string;
  wakaKesiswaanName: string;
}

export default function EvaluationReportView({
  students,
  history,
  assessments,
  logs,
  counselors,
  principalName,
  wakaKesiswaanName
}: EvaluationReportViewProps) {
  const [selectedClass, setSelectedClass] = useState<string>("ALL");
  const [selectedCounselorSigner, setSelectedCounselorSigner] = useState<string>(counselors[0] || "ARIEF AZIZY, S.Psi.");
  const [evaluationTitle, setEvaluationTitle] = useState("Evaluasi Kepatuhan Siswa & Efektivitas Layanan Bimbingan");
  const [reportPeriod, setReportPeriod] = useState("Mei 2026 (Semester Genap)");
  
  // Custom evaluator comments
  const [academicAdvice, setAcademicAdvice] = useState(
    "Mayoritas kendala bersumber dari kurangnya disiplin waktu istirahat malam di asrama (begadang main HP/game). Disarankan penertiban berkala oleh pengasuh asrama tepat jam 22.00 WIB."
  );
  const [counselingAdvice, setCounselingAdvice] = useState(
    "Hasil tindak lanjut dengan layanan konseling individu menunjukkan progress kepatuhan 85%. Namun, 2 siswa butuh alih kasus (rujukan eksternal) karena indikasi cemas klinis."
  );

  const printAreaRef = useRef<HTMLDivElement>(null);

  // Filter basic metrics based on class
  const classStudents = students.filter(s => selectedClass === "ALL" || s.studentClass === selectedClass);
  const classStudentIds = classStudents.map(s => s.id);

  const classHistory = history.filter(h => classStudentIds.includes(h.studentId));
  const classAssessments = assessments.filter(a => classStudentIds.includes(a.studentId));
  const classLogs = logs.filter(l => classStudentIds.includes(l.studentId));

  // Calculating stats
  const totalStudents = classStudents.length;
  const totalViolations = classHistory.filter(h => h.type === "VIOLATION").length;
  const totalPoints = classStudents.reduce((sum, s) => sum + s.points, 0);
  const avgPoints = totalStudents > 0 ? Math.round(totalPoints / totalStudents) : 0;
  
  // High risk students status
  const highRiskStudents = classStudents.filter(s => s.points >= 50);
  const warningStudents = classStudents.filter(s => s.points >= 30 && s.points < 50);

  // Counseling log statistics
  const counselIndividu = classLogs.filter(l => l.type === "Individu").length;
  const counselKelompok = classLogs.filter(l => l.type === "Kelompok").length;
  const counselKlasikal = classLogs.filter(l => l.type === "Klasikal").length;
  const counselLainnya = classLogs.filter(l => l.type === "Lainnya").length;

  const counselSelesai = classLogs.filter(l => l.status === "Selesai").length;
  const counselPemantauan = classLogs.filter(l => l.status === "Dalam Pemantauan").length;
  const counselRujukan = classLogs.filter(l => l.status === "Perlu Rujukan").length;

  // Need Assessment Distribution
  const needTinggi = classAssessments.filter(a => a.category === "Sangat Butuh Bantuan").length;
  const needSedang = classAssessments.filter(a => a.category === "Sedang").length;
  const needRendah = classAssessments.filter(a => a.category === "Ringan").length;

  // Group violations by description to find most common issues
  const violationCounts: { [key: string]: number } = {};
  classHistory.forEach(h => {
    if (h.type === "VIOLATION") {
      violationCounts[h.description] = (violationCounts[h.description] || 0) + 1;
    }
  });

  const sortedCommonViolations = Object.entries(violationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  // Counselor Stats for counseling logs
  const counselorCounts: { [key: string]: number } = {};
  counselors.forEach(name => {
    counselorCounts[name] = classLogs.filter(l => l.counselorName === name).length;
  });

  // Handle professional browser-native printing
  const handlePrintFullReport = () => {
    const printContent = printAreaRef.current?.innerHTML;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Laporan Evaluasi BK - SMP Al Mahrusiyah</title>
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
            <style>
              body { 
                font-family: 'Times New Roman', serif; 
                padding: 40px; 
                background-color: #ffffff; 
                color: #000000; 
                line-height: 1.5;
              }
              @media print {
                body { padding: 0; }
                .no-print { display: none; }
                tr { page-break-inside: avoid; }
              }
              table { border-collapse: collapse; width: 100%; }
              th, td { border: 1px solid #000000 !important; padding: 6px 10px; text-align: left; }
              th { background-color: #f3f4f6 !important; -webkit-print-color-adjust: exact; }
            </style>
          </head>
          <body onload="window.print(); window.close();">
            ${printContent}
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight font-sans">
            Laporan Analisis dan Evaluasi Layanan BK
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Dashboard komparatif, evaluasi kasus kedisiplinan, asesmen pemetaan siswa, serta rekap tuntas konseling BK.
          </p>
        </div>
        
        <button
          onClick={handlePrintFullReport}
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-blue-100 self-start sm:self-auto"
        >
          <Printer size={16} />
          Cetak Dokumen Laporan Resmi
        </button>
      </div>

      {/* Class and Config Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">1. Fokus Kelas Evaluasi</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="ALL">Semua Kelas ({students.length} Siswa)</option>
            {CLASSES_LIST.map(cls => (
              <option key={cls} value={cls}>Kelas {cls}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">2. Judul Dokumen Evaluasi</label>
          <input
            type="text"
            value={evaluationTitle}
            onChange={(e) => setEvaluationTitle(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="Ketik judul evaluasi..."
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">3. Guru BK Pengaju Laporan</label>
          <select
            value={selectedCounselorSigner}
            onChange={(e) => setSelectedCounselorSigner(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
          >
            {counselors.map(item => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Aggregated Infographics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900 text-white p-6 rounded-3xl relative overflow-hidden shadow-md">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Akumulasi Point</p>
          <h3 className="text-4xl font-extrabold mt-2 font-mono">{totalPoints}</h3>
          <p className="text-xs text-slate-400 mt-2 font-medium">Beban pelanggaran akumulatif</p>
          <span className="absolute -bottom-6 -right-6 text-slate-800 pointer-events-none select-none font-bold text-7xl opacity-20">Pts</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rata-rata Poin Per Siswa</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-slate-800 font-mono">{avgPoints}</h3>
            <span className="text-xs font-semibold text-slate-500">Pts/anak</span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium mt-2">Batas aman sekolah: &lt; 20 Poin</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm border-l-4 border-l-amber-500">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Siswa dlm Pengawasan</p>
          <h3 className="text-3xl font-black text-amber-600 mt-2">{highRiskStudents.length} <span className="text-xs font-medium text-slate-400">Anak (&ge; 50 pts)</span></h3>
          <p className="text-[10px] text-slate-500 mt-2 text-justify">Membutuhkan tindakan darurat SP1, konseling khusus wali siswa.</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm border-l-4 border-l-teal-500">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Keberhasilan Konseling</p>
          <h3 className="text-3xl font-black text-teal-600 mt-2">
            {classLogs.length > 0 ? Math.round((counselSelesai / classLogs.length) * 100) : 100}%
          </h3>
          <p className="text-[10px] text-teal-600/90 font-semibold mt-2">{counselSelesai} dari {classLogs.length} kasus tertangani tuntas</p>
        </div>
      </div>

      {/* Analytics & Insight Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Analytical Charts & Diagnostic */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section: Diagnostics */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Activity className="text-indigo-600" size={18} />
              Evaluasi Kasus Pelanggaran Terbanyak
            </h3>
            
            {sortedCommonViolations.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Belum ada riwayat pelanggaran tercatat untuk kelas ini.</p>
            ) : (
              <div className="space-y-3.5">
                {sortedCommonViolations.map(([name, count]) => {
                  const percentage = Math.round((count / totalViolations) * 100) || 5;
                  return (
                    <div key={name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-700 truncate max-w-[80%]">🛑 {name}</span>
                        <span className="text-slate-500 font-mono">{count} Kejadian ({percentage}%)</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-rose-500/80 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section: Counseling Status Integration */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <MessageSquare className="text-teal-600" size={18} />
              Status Tindak Lanjut Layanan Konseling
            </h3>

            <div className="grid grid-cols-3 gap-4 text-center mt-2">
              <div className="p-3 bg-teal-50 border border-teal-100 rounded-2xl">
                <span className="text-[9px] text-teal-600 font-bold uppercase tracking-wider block">1. Selesai</span>
                <span className="text-2xl font-black text-teal-700 font-mono mt-1 block">{counselSelesai}</span>
                <span className="text-[9px] text-slate-400 block mt-1">Sikap membaik</span>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-2xl">
                <span className="text-[9px] text-amber-600 font-bold uppercase tracking-wider block">2. Monitoring</span>
                <span className="text-2xl font-black text-amber-700 font-mono mt-1 block">{counselPemantauan}</span>
                <span className="text-[9px] text-slate-400 block mt-1">Pantau asrama</span>
              </div>
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl">
                <span className="text-[9px] text-rose-600 font-bold uppercase tracking-wider block">3. Rujukan</span>
                <span className="text-2xl font-black text-rose-700 font-mono mt-1 block">{counselRujukan}</span>
                <span className="text-[9px] text-slate-400 block mt-1">Butuh Psikolog</span>
              </div>
            </div>

            {/* Need Assessment Mapping */}
            <div className="pt-4 border-t border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Pemetaan Hasil Angket Kebutuhan (AKPD):</span>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                <div className="flex-1 flex items-center justify-between p-2 bg-rose-50 rounded-lg text-rose-800">
                  <span>Sangat Butuh: <strong>{needTinggi} Siswa</strong></span>
                </div>
                <div className="flex-1 flex items-center justify-between p-2 bg-amber-50 rounded-lg text-amber-800">
                  <span>Butuh Sedang: <strong>{needSedang} Siswa</strong></span>
                </div>
                <div className="flex-1 flex items-center justify-between p-2 bg-emerald-50 rounded-lg text-emerald-800">
                  <span>Ringan/Aman: <strong>{needRendah} Siswa</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Remarks Form */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Edit2 size={16} className="text-blue-600" />
              Saran & Ulasan Evaluator Laporan
            </h3>
            <p className="text-slate-400 text-[10px] mt-0.5">Pendapat profesional Anda akan langsung tampil di dokumen evaluasi cetak resmi di bawah ini.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 block">Evaluasi Perilaku & Sikap Siswa:</label>
              <textarea
                rows={3}
                value={academicAdvice}
                onChange={(e) => setAcademicAdvice(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Tulis ulasan kedisiplinan..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 block">Evaluasi Tindak Lanjut Layanan BK:</label>
              <textarea
                rows={3}
                value={counselingAdvice}
                onChange={(e) => setCounselingAdvice(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Tulis ulasan tindakan bimbingan..."
              />
            </div>

            <div className="p-4 bg-teal-50 border border-teal-100/60 rounded-2xl flex items-start gap-2.5">
              <Award className="text-teal-600 flex-shrink-0" size={16} />
              <p className="text-[10px] text-teal-800 leading-relaxed font-semibold">
                Laporan ini ditandatangani secara digital oleh pengampu bimbingan <span className="underline">{selectedCounselorSigner}</span> untuk diajukan langsung ke Kepala Sekolah SMP Al Mahrusiyah Kediri.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Live Preview of the Document Printable Block */}
      <div className="bg-slate-50/50 p-6 sm:p-10 rounded-[32px] border-2 border-dashed border-slate-200 space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-widest pl-1 select-none">
          <span>Pratinjau Lembar Fisik Laporan Evaluasi</span>
          <span className="text-blue-600 flex items-center gap-1">📱 Sesuai Format Kertas A4</span>
        </div>

        {/* Printable Section Frame */}
        <div 
          className="bg-white border rounded-2xl p-8 sm:p-12 shadow-md max-w-4xl mx-auto space-y-6"
          ref={printAreaRef}
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          {/* Header KB Kop Surat */}
          <div className="text-center border-b-4 border-double border-black pb-4 text-black">
            <h1 className="text-base font-bold uppercase tracking-widest leading-none">YAYASAN AL MAHRUSIYAH KEDIRI</h1>
            <h2 className="text-lg font-black uppercase tracking-wider mt-1.5">SMP AL MAHRUSIYAH KEDIRI</h2>
            <p className="text-[10px] italic leading-relaxed mt-1 font-sans font-medium text-slate-800">
              Jln. Ngampel Raya Rt 004 Rw 001 Kel. Ngampel Kec. Mojoroto Kota Kediri Jawa Timur
              <br />
              Telp SMP: 0354-770301 &bull; Email: info@smp-almahrusiyah.sch.id
            </p>
          </div>

          {/* Title Document */}
          <div className="text-center text-black space-y-1">
            <h3 className="text-sm font-bold uppercase underline tracking-wider">{evaluationTitle}</h3>
            <p className="text-xs font-sans">Periode Analisis: {reportPeriod} &bull; Kelas: {selectedClass === "ALL" ? "Semua Kelas" : selectedClass}</p>
          </div>

          <p className="text-xs text-black leading-relaxed font-sans select-none">
            Sehubungan dengan rekapitulasi poin pelanggaran, hasil angket kebutuhan peserta didik (AKPD), serta jalannya penanganan layanan Bimbingan Konseling (BK), bersama ini dilaporkan data hasil evaluasi resmi sebagai berikut:
          </p>

          {/* Table 1: General Stats */}
          <div className="space-y-1.5 text-black">
            <h4 className="text-xs font-bold font-sans uppercase">I. Statistik Umum Sikap & Kedisiplinan</h4>
            <table className="w-full text-xs text-black border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black p-2 bg-gray-50 font-bold font-sans">Parameter Evaluasi</th>
                  <th className="border border-black p-2 bg-gray-50 font-bold font-sans text-center">Jumlah Riwayat / Hasil</th>
                  <th className="border border-black p-2 bg-gray-50 font-bold font-sans">Indeks Keterangan</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-2 font-sans">Total Sampel Siswa</td>
                  <td className="border border-black p-2 text-center font-bold font-sans">{totalStudents} Siswa</td>
                  <td className="border border-black p-2 font-sans text-gray-600">Siswa aktif terdaftar di kelas</td>
                </tr>
                <tr>
                  <td className="border border-black p-2 font-sans">Akumulasi Skor Pelanggaran</td>
                  <td className="border border-black p-2 text-center font-bold font-sans text-red-600">{totalPoints} Poin</td>
                  <td className="border border-black p-2 font-sans text-gray-600">Total poin dari seluruh pelanggaran terkumpul</td>
                </tr>
                <tr>
                  <td className="border border-black p-2 font-sans">Rata-rata Skor per Siswa</td>
                  <td className="border border-black p-2 text-center font-bold font-sans">{avgPoints} Poin</td>
                  <td className="border border-black p-2 font-sans text-gray-600">Skor rata-rata. Standar ideal maksimal &lt;20 Pts</td>
                </tr>
                <tr>
                  <td className="border border-black p-2 font-sans">Siswa dlm Pengawasan Darurat (&ge; 50 pts)</td>
                  <td className="border border-black p-2 text-center font-bold font-sans text-red-600">{highRiskStudents.length} Siswa</td>
                  <td className="border border-black p-2 font-sans text-gray-600">Sudah memasuki limit pemanggilan Orang Tua (SP1-SP3)</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Table 2: High Point Students */}
          <div className="space-y-1.5 text-black">
            <h4 className="text-xs font-bold font-sans uppercase">II. Daftar Siswa Butuh Penanganan Intensif (Skor &ge; 30)</h4>
            {warningStudents.length === 0 && highRiskStudents.length === 0 ? (
              <p className="text-xs text-center border p-2 italic bg-gray-50 font-sans">Sangat Baik. Tidak ada siswa yang melampaui ambang batas pengawasan (&ge; 30 poin).</p>
            ) : (
              <table className="w-full text-[11px] text-black border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-black p-2 font-bold font-sans">No</th>
                    <th className="border border-black p-2 font-bold font-sans">Nama Lengkap</th>
                    <th className="border border-black p-2 font-bold font-sans text-center">Kelas</th>
                    <th className="border border-black p-2 font-bold font-sans text-center">NISN</th>
                    <th className="border border-black p-2 font-bold font-sans text-center">Skor Poin</th>
                    <th className="border border-black p-2 font-bold font-sans">Status Terakhir Layanan Konseling BK</th>
                  </tr>
                </thead>
                <tbody>
                  {[...highRiskStudents, ...warningStudents].map((s, idx) => {
                    const studentLog = classLogs.find(l => l.studentId === s.id);
                    return (
                      <tr key={s.id} className={s.points >= 50 ? "bg-red-50" : ""}>
                        <td className="border border-black p-2 text-center font-sans">{idx + 1}</td>
                        <td className="border border-black p-2 font-bold font-sans">{s.name}</td>
                        <td className="border border-black p-2 text-center font-sans">{s.studentClass}</td>
                        <td className="border border-black p-2 text-center font-sans font-mono">{s.nisn}</td>
                        <td className="border border-black p-2 text-center font-bold font-sans text-red-600">{s.points} Pts</td>
                        <td className="border border-black p-2 font-sans italic">
                          {studentLog ? `Telah dikonseling: ${studentLog.status} (${studentLog.counselorName})` : "Belum terakomodir bimbingan formal"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Table 3: BK Counseling performance */}
          <div className="space-y-1.5 text-black">
            <h4 className="text-xs font-bold font-sans uppercase">III. Statistik Pelayanan Bimbingan BK</h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="font-sans leading-relaxed">
                <span className="font-bold underline block">Status Penanganan Kasus Bimbingan:</span>
                &bull; Layanan Individu (Pribadi): <strong>{counselIndividu} Sesi</strong> <br />
                &bull; Layanan Kelompok: <strong>{counselKelompok} Sesi</strong> <br />
                &bull; Layanan Klasikal / Kelas: <strong>{counselKlasikal} Sesi</strong> <br />
                &bull; Selesai Tuntas Pelatihan: <strong>{counselSelesai} Kasus</strong> <br />
                &bull; Masih dalam Pemantauan: <strong>{counselPemantauan} Kasus</strong> <br />
                &bull; Alih Kasus (Rujukan): <strong>{counselRujukan} Kasus</strong>
              </div>
              <div className="font-sans leading-relaxed">
                <span className="font-bold underline block">Jumlah Konseling Formal BK Pengampu:</span>
                {counselors.map(name => (
                  <div key={name}>
                    &bull; {name}: <strong>{counselorCounts[name] || 0} Sesi Layanan</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Expert recommendations */}
          <div className="border-t border-black pt-4 text-black space-y-4">
            <div className="text-xs space-y-2">
              <span className="font-bold uppercase tracking-wider block font-sans">IV. Catatan Evaluasi & Rekomendasi Tindak Lanjut:</span>
              
              <div className="space-y-1 font-sans pl-2">
                <p className="font-bold underline text-blue-900 leading-none">A. Bidang Perilaku & Kedisiplinan Siswa:</p>
                <p className="text-justify italic leading-relaxed text-slate-800">"{academicAdvice}"</p>
              </div>

              <div className="space-y-1 font-sans pl-2 mt-2">
                <p className="font-bold underline text-blue-900 leading-none">B. Efektivitas Intervensi Bimbingan:</p>
                <p className="text-justify italic leading-relaxed text-slate-800">"{counselingAdvice}"</p>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-4 text-center text-xs text-black mt-12 select-none">
            <div className="font-sans">
              <p>Mengetahui,</p>
              <p>Kepala Sekolah SMP Al Mahrusiyah,</p>
              <div className="h-20"></div>
              <p className="font-bold underline">{principalName}</p>
              <p className="text-[10px] text-gray-500">NIP/NIY. Kepala Sekolah</p>
            </div>
            
            <div className="font-sans">
              <p>Menyetujui,</p>
              <p>Waka Kesiswaan,</p>
              <div className="h-20"></div>
              <p className="font-bold underline">{wakaKesiswaanName}</p>
              <p className="text-[10px] text-gray-500">Staf Kesiswaan SMP Al Mahrusiyah</p>
            </div>

            <div className="font-sans">
              <p>Kediri, {new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
              <p>Penyusun Laporan Bimbingan,</p>
              <div className="h-20"></div>
              <p className="font-bold underline">{selectedCounselorSigner}</p>
              <p className="text-[10px] text-gray-500">Konselor BK / Pengampu</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export {};
