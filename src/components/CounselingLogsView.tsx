import React, { useState, useRef } from "react";
import { BookOpen, Plus, Search, Calendar, ChevronRight, UserCheck, ShieldCheck, Printer, Trash2, Edit, FileText, Clipboard } from "lucide-react";
import { Student, CounselingLog, StudentClass } from "../types";
import { CLASSES_LIST } from "../data/mockData";

interface CounselingLogsViewProps {
  students: Student[];
  logs: CounselingLog[];
  onAddLog: (log: CounselingLog) => void;
  onDeleteLog: (id: string) => void;
  onEditLog: (log: CounselingLog) => void;
  counselors: string[];
}

export default function CounselingLogsView({
  students,
  logs,
  onAddLog,
  onDeleteLog,
  onEditLog,
  counselors
}: CounselingLogsViewProps) {
  const [showLogModal, setShowLogModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCounselorFilter, setSelectedCounselorFilter] = useState<string>("ALL");
  const [isEditing, setIsEditing] = useState<string | null>(null);

  // Form states
  const [studentId, setStudentId] = useState(students[0]?.id || "");
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [counselorName, setCounselorName] = useState<string>(counselors[0] || "ARIEF AZIZY, S.Psi.");
  const [type, setType] = useState<"Individu" | "Kelompok" | "Klasikal" | "Lainnya">("Individu");
  const [issue, setIssue] = useState("");
  const [solution, setSolution] = useState("");
  const [evaluation, setEvaluation] = useState("");
  const [status, setStatus] = useState<"Selesai" | "Dalam Pemantauan" | "Perlu Rujukan">("Selesai");

  // Printable layout state
  const [selectedPrintLog, setSelectedPrintLog] = useState<CounselingLog | null>(null);
  const printAreaRef = useRef<HTMLDivElement>(null);

  const resetForm = () => {
    setStudentId(students[0]?.id || "");
    setDate(new Date().toISOString().split('T')[0]);
    setCounselorName(counselors[0] || "ARIEF AZIZY, S.Psi.");
    setType("Individu");
    setIssue("");
    setSolution("");
    setEvaluation("");
    setStatus("Selesai");
    setIsEditing(null);
  };

  const handleEditClick = (log: CounselingLog) => {
    setIsEditing(log.id);
    setStudentId(log.studentId);
    setDate(log.date);
    setCounselorName(log.counselorName);
    setType(log.type);
    setIssue(log.issue);
    setSolution(log.solution);
    setEvaluation(log.evaluation);
    setStatus(log.status);
    setShowLogModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !issue || !solution) {
      alert("Harap semua kolom wajib diisi!");
      return;
    }

    if (isEditing) {
      onEditLog({
        id: isEditing,
        studentId,
        date,
        counselorName,
        type,
        issue,
        solution,
        evaluation: evaluation || "Telah dievaluasi oleh pendamping.",
        status
      });
      alert("Laporan konseling berhasil diperbarui!");
    } else {
      const newLog: CounselingLog = {
        id: `counsel-log-${Date.now()}`,
        studentId,
        date,
        counselorName,
        type,
        issue,
        solution,
        evaluation: evaluation || "Telah dievaluasi oleh pendamping.",
        status
      };
      onAddLog(newLog);
      alert("Laporan konseling siswa baru berhasil disimpan!");
    }

    setShowLogModal(false);
    resetForm();
  };

  const handlePrintCounselSession = () => {
    const printContent = printAreaRef.current?.innerHTML;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Laporan Konseling Resmi - SMP Al Mahrusiyah</title>
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
            <style>
              body { font-family: 'Times New Roman', serif; padding: 40px; background-color: #ffffff; color: #000000; }
              @media print {
                body { padding: 0; }
                .no-print { display: none; }
              }
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

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const student = students.find(s => s.id === log.studentId);
    if (!student) return false;

    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          student.nisn.includes(searchQuery) ||
                          log.issue.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCounselor = selectedCounselorFilter === "ALL" || log.counselorName === selectedCounselorFilter;

    return matchesSearch && matchesCounselor;
  });

  // Aggregated Stats
  const countSelesai = logs.filter(l => l.status === "Selesai").length;
  const countMonitoring = logs.filter(l => l.status === "Dalam Pemantauan").length;
  const countRujukan = logs.filter(l => l.status === "Perlu Rujukan").length;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight font-sans">
            Laporan dan Evaluasi Konseling Siswa
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Riwayat log bimbingan intensif serta tindak lanjut evaluasi bersama Guru BK Pengampu.
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowLogModal(true); }}
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-blue-100 self-start sm:self-auto"
        >
          <Plus size={16} />
          Catat Konseling Baru
        </button>
      </div>

      {/* Counseling Statistics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Sesi Bimbingan</p>
          <h3 className="text-3xl font-black text-slate-800 mt-2">{logs.length} <span className="text-xs font-medium text-slate-400">Kasus</span></h3>
          <p className="text-[10px] text-slate-400 mt-2 font-medium">Terarsip secara konfidensial</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm border-l-4 border-l-teal-500">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Selesai (Ditangani)</p>
          <h3 className="text-3xl font-black text-teal-600 mt-2">{countSelesai} <span className="text-xs font-medium text-slate-400">Kasus</span></h3>
          <p className="text-[10px] text-teal-600 font-semibold mt-2">Selesai penuh tuntas</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm border-l-4 border-l-amber-500">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Dalam Pemantauan</p>
          <h3 className="text-3xl font-black text-amber-500 mt-2">{countMonitoring} <span className="text-xs font-medium text-slate-400">Kasus</span></h3>
          <p className="text-[10px] text-amber-600 font-semibold mt-2">Butuh bimbingan susulan</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm border-l-4 border-l-rose-500">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Perlu Alih Tangan Kasus</p>
          <h3 className="text-3xl font-black text-rose-500 mt-2">{countRujukan} <span className="text-xs font-medium text-slate-400">Kasus</span></h3>
          <p className="text-[10px] text-rose-600 font-semibold mt-2">Masuk rujukan psikolog/khusus</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <span className="material-symbols-outlined text-[18px]">search</span>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              placeholder="Cari berdasarkan nama anak, NISN, atau masalah konseling..."
            />
          </div>

          {/* Counselor filter dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Guru Pengampu:</span>
            <select
              value={selectedCounselorFilter}
              onChange={(e) => setSelectedCounselorFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2"
            >
              <option value="ALL">Semua Guru BK</option>
              {counselors.map(item => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Logs Card Layout List */}
      <div className="space-y-6">
        {filteredLogs.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed p-16 text-center text-slate-400">
            <BookOpen className="mx-auto text-slate-300 mb-4" size={40} />
            <h3 className="font-bold text-slate-700">Tidak ada log konseling</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Cobalah sesuaikan kata kunci atau pilih guru bimbingan pengampu lainnya.
            </p>
          </div>
        ) : (
          filteredLogs.map(log => {
            const student = students.find(s => s.id === log.studentId);
            return (
              <div 
                key={log.id} 
                className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden hover:shadow-md transition-all flex flex-col md:flex-row"
              >
                {/* Left info column */}
                <div className="p-6 md:p-8 md:w-80 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] bg-blue-50 text-blue-800 font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider">
                        Sesi {log.type}
                      </span>
                      <span className="text-xs font-bold text-slate-400 font-mono flex items-center gap-1">
                        <Calendar size={12} />
                        {log.date}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-950 text-base mt-4 leading-snug">
                      {student ? student.name : "Siswa Tidak Dikenal"}
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold font-mono mt-1">
                      NISN {student?.nisn} &bull; Kelas {student?.studentClass}
                    </p>

                    {/* Counselor Assignment info */}
                    <div className="mt-4 p-3 bg-white border border-slate-200/60 rounded-xl">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">BK Pengampu:</span>
                      <span className="text-xs font-extrabold text-slate-800 tracking-tight block mt-0.5">
                        👤 {log.counselorName}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      log.status === "Selesai" 
                        ? "bg-teal-50 border border-teal-200 text-teal-700" 
                        : log.status === "Dalam Pemantauan"
                        ? "bg-amber-50 border border-amber-200 text-amber-700"
                        : "bg-rose-50 border border-rose-200 text-rose-700"
                    }`}>
                      {log.status}
                    </span>
                  </div>
                </div>

                {/* Right content column */}
                <div className="p-6 md:p-8 flex-1 flex flex-col justify-between space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">1. Diagnosa & Masalah:</span>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {log.issue}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">2. Solusi / Tindak Lanjut:</span>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {log.solution}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">3. Hasil Evaluasi Akhir:</span>
                      <p className="text-xs text-slate-700 leading-relaxed font-semibold italic bg-blue-50/40 p-3 rounded-xl border border-blue-100/40">
                        ⭐ {log.evaluation}
                      </p>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                      onClick={() => { setSelectedPrintLog(log); }}
                      className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                    >
                      <Printer size={13} />
                      Cetak Berita Acara
                    </button>
                    <button
                      onClick={() => handleEditClick(log)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                      title="Edit Catatan"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Hapus catatan bimbingan konseling dan evaluasinya? Data ini bersifat rahasia dan permanen.")) {
                          onDeleteLog(log.id);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                      title="Hapus Catatan"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Insert Counseling Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="px-8 py-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">
                  {isEditing ? "Edit Berita Acara Konseling" : "Catat Layanan Konseling & Evaluasi BK"}
                </h2>
                <button
                  type="button"
                  onClick={() => { setShowLogModal(false); resetForm(); }}
                  className="p-1 rounded-lg hover:bg-slate-200 text-slate-400"
                >
                  ✕
                </button>
              </div>

              <div className="p-8 space-y-5 max-h-[500px] overflow-y-auto">
                {/* School Guidance Counselor Assignment Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">1. Guru Pendamping / BK Pengampu</label>
                  <select
                    value={counselorName}
                    onChange={(e) => setCounselorName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                    required
                  >
                    {counselors.map(item => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Student dropdown selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">2. Siswa Yang Dibimbing</label>
                    <select
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                      required
                    >
                      <option value="">-- Pilih Siswa --</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.studentClass})</option>
                      ))}
                    </select>
                  </div>

                  {/* Date selective */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">3. Tanggal Layanan</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Counseling Type */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">4. Jenis Bimbingan</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                    >
                      <option value="Individu">Individu (Pribadi)</option>
                      <option value="Kelompok">Kelompok (Asrama/Kelas)</option>
                      <option value="Klasikal">Klasikal (Massal)</option>
                      <option value="Lainnya">Lainnya / Berkelanjutan</option>
                    </select>
                  </div>

                  {/* Status of counseling session */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">5. Status Penanganan</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                    >
                      <option value="Selesai">Tuntas Selesai</option>
                      <option value="Dalam Pemantauan">Dalam Pemantauan Berkelanjutan</option>
                      <option value="Perlu Rujukan">Rujukan Kasus Terbuka (Spesialis)</option>
                    </select>
                  </div>
                </div>

                {/* Elaborative Textareas */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">6. Uraian Masalah / Diagnosa</label>
                  <textarea
                    rows={3}
                    value={issue}
                    onChange={(e) => setIssue(e.target.value)}
                    placeholder="Tulis keluhan, diagnosa tingkah laku siswa, atau pelanggaran berat..."
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none font-medium"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">7. Solusi / Pembinaan / Tindak Lanjut</label>
                  <textarea
                    rows={3}
                    value={solution}
                    onChange={(e) => setSolution(e.target.value)}
                    placeholder="Strategi pemecahan masalah, penandatanganan surat perjanjian siswa, dll..."
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none font-medium"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">8. Hasil Laporan & Evaluasi Bimbingan (Opsional)</label>
                  <textarea
                    rows={2}
                    value={evaluation}
                    onChange={(e) => setEvaluation(e.target.value)}
                    placeholder="Siswa menyatakan sanggup taubat nasuha, ketaatan ibadah terpantau mambaik..."
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setShowLogModal(false); resetForm(); }}
                  className="px-5 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl text-xs uppercase tracking-wider transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-100"
                >
                  {isEditing ? "Perbarui Log Konseling" : "Simpan Berkas Konseling"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Berita Acara preview sheet */}
      {selectedPrintLog && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-8">
            <div className="px-8 py-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between no-print">
              <div className="flex items-center gap-3">
                <FileText className="text-blue-600" size={24} />
                <h2 className="text-lg font-bold text-slate-800">Pratinjau Lembar Konseling Siswa</h2>
              </div>
              <button 
                onClick={() => setSelectedPrintLog(null)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400"
              >
                ✕
              </button>
            </div>

            {/* Printable Content Frame */}
            <div className="p-12" ref={printAreaRef}>
              {/* Kop Surat Sekolah SMP Al Mahrusiyah */}
              <div className="text-center border-b-4 border-double border-black pb-4 mb-6">
                <h1 className="text-lg font-bold uppercase select-none font-serif text-black tracking-wider leading-none">YAYASAN AL MAHRUSIYAH KEDIRI</h1>
                <h2 className="text-xl font-extrabold uppercase font-serif text-black tracking-widest mt-1">SMP AL MAHRUSIYAH KEDIRI</h2>
                <p className="text-xs text-black italic font-serif leading-relaxed mt-1">
                  Jln. Ngampel Raya Rt 004 Rw 001 Kel. Ngampel Kec. Mojoroto Kota Kediri Jawa Timur
                  <br />
                  Telp SMP: 0354-770301 &bull; Email: info@smp-almahrusiyah.sch.id
                </p>
              </div>

              {/* Title Surat */}
              <div className="text-center mb-8">
                <h3 className="text-sm font-bold uppercase underline font-serif tracking-widest text-black">BERITA ACARA LAYANAN KONSELING & HASIL EVALUASI</h3>
                <p className="text-xs font-serif text-black mt-1">Nomor: SIMBK-LBH/${new Date().getFullYear()}/${students.find(s => s.id === selectedPrintLog.studentId)?.nisn || "SMPAM"}</p>
              </div>

              {/* Counseling log sheet details */}
              <div className="space-y-4 font-serif text-sm text-black mb-8 leading-relaxed">
                <p className="text-xs italic text-black select-none font-semibold mb-3">Telah dilaksanakan bimbingan konseling dan evaluasi terfokus pada:</p>
                
                <table className="w-full text-left border border-black text-xs font-serif text-black border-collapse">
                  <tbody>
                    <tr className="border-b border-black">
                      <td className="p-3 font-bold bg-slate-50 w-1/3">Nama Lengkap Siswa</td>
                      <td className="p-3 font-bold uppercase">{students.find(s => s.id === selectedPrintLog.studentId)?.name}</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="p-3 bg-slate-50">NISN / Nomor Induk</td>
                      <td className="p-3 font-mono">{students.find(s => s.id === selectedPrintLog.studentId)?.nisn}</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="p-3 bg-slate-50">Kelas / Tingkat</td>
                      <td className="p-3 font-bold">{students.find(s => s.id === selectedPrintLog.studentId)?.studentClass}</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="p-3 bg-slate-50">Hari / Tanggal Layanan</td>
                      <td className="p-3">{selectedPrintLog.date}</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="p-3 bg-slate-50">Layanan Jenis Bimbingan</td>
                      <td className="p-3">Konseling {selectedPrintLog.type}</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="p-3 bg-slate-50">Guru BK Pendamping</td>
                      <td className="p-3 font-bold">{selectedPrintLog.counselorName}</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="p-3 bg-slate-50">Status Penanganan Akhir</td>
                      <td className="p-3 font-bold">{selectedPrintLog.status}</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="p-3 bg-slate-50 valign-top align-top font-bold">1. Diagnosa & Masalah</td>
                      <td className="p-3 text-justify leading-relaxed">{selectedPrintLog.issue}</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="p-3 bg-slate-50 valign-top align-top font-bold">2. Solusi & Tindak Lanjut</td>
                      <td className="p-3 text-justify leading-relaxed">{selectedPrintLog.solution}</td>
                    </tr>
                    <tr>
                      <td className="p-3 bg-slate-50 valign-top align-top font-bold">3. Hasil Evaluasi Konseling</td>
                      <td className="p-3 text-justify italic leading-relaxed font-semibold">{selectedPrintLog.evaluation}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Signature Blocks */}
              <div className="grid grid-cols-3 gap-4 text-center text-xs font-serif text-black mt-12 select-none">
                <div>
                  <p>Orang Tua / Wali Murid,</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline">( ______________________ )</p>
                </div>
                <div>
                  <p>Siswa Bersangkutan,</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline font-mono uppercase">{students.find(s => s.id === selectedPrintLog.studentId)?.name.substring(0, 15)}...</p>
                </div>
                <div>
                  <p>Kediri, {selectedPrintLog.date}</p>
                  <p>Konselor Pengampu Layanan,</p>
                  <div className="h-14"></div>
                  <p className="font-bold underline text-black">{selectedPrintLog.counselorName}</p>
                  <p className="text-[10px] text-slate-500 mt-1">Staf Konseling SMP AL MAHRUSIYAH XP</p>
                </div>
              </div>
            </div>

            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 no-print">
              <button
                type="button"
                onClick={() => setSelectedPrintLog(null)}
                className="px-5 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl text-xs uppercase tracking-wider transition-all"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handlePrintCounselSession}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-100 flex items-center gap-2"
              >
                <Printer size={16} />
                Cetak Lembaran Fisik
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export {};
