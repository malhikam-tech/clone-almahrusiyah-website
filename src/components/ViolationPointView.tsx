import React, { useState, useRef } from "react";
import { AlertTriangle, Clock, Printer, ChevronRight, PlusCircle, MinusCircle, UserCheck, ShieldAlert, FileText, Upload, Trash2, CheckCircle2, RefreshCw } from "lucide-react";
import { Student, PointHistory, ViolationType } from "../types";
import { DEFAULT_VIOLATION_TYPES, CLASSES_LIST } from "../data/mockData";

interface ViolationPointViewProps {
  students: Student[];
  history: PointHistory[];
  onAddHistory: (item: PointHistory) => void;
  onUpdateStudentPoints: (studentId: string, newPoints: number) => void;
  onBulkUpdatePointsAndHistory?: (updates: { studentId: string; pointsChanged: number; description: string; date: string }[]) => void;
  violationTypes: ViolationType[];
}


export default function ViolationPointView({
  students,
  history,
  onAddHistory,
  onUpdateStudentPoints,
  onBulkUpdatePointsAndHistory,
  violationTypes
}: ViolationPointViewProps) {
  const activeViolationTypes = violationTypes || DEFAULT_VIOLATION_TYPES;

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Point actions
  const [actionType, setActionType] = useState<"VIOLATION" | "REWARD" | "ADJUSTMENT">("VIOLATION");
  const [selectedViolationId, setSelectedViolationId] = useState<string>(() => activeViolationTypes[0]?.id || "v1");
  const [customDescription, setCustomDescription] = useState("");
  const [customPoints, setCustomPoints] = useState<number>(5);
  const [actionDate, setActionDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Printable layout state
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Excel Points Import state
  const [showExcelImportModal, setShowExcelImportModal] = useState(false);
  const [excelInputText, setExcelInputText] = useState("");
  const [excelPreview, setExcelPreview] = useState<{
    studentId: string;
    studentName: string;
    studentClass: string;
    oldPoints: number;
    pointsChanged: number;
    description: string;
    date: string;
    isValid: boolean;
    errorReason?: string;
  }[]>([]);

  // Parser function for TSV / copy-paste from Excel
  const handleParseExcel = () => {
    if (!excelInputText.trim()) {
      alert("Harap tempel (paste) data dari Excel terlebih dahulu!");
      return;
    }

    const rows = excelInputText.split(/\r?\n/);
    const parsed: typeof excelPreview = [];

    rows.forEach((row, i) => {
      const line = row.trim();
      if (!line) return; // ignore blank lines

      // Split by tab (Excel/Sheets standard)
      let cols = line.split("\t");
      if (cols.length < 2) {
        // Fallback to CSV
        cols = line.split(/[;,]/);
        if (cols.length < 2) {
          parsed.push({
            studentId: "",
            studentName: `Baris ${i + 1}`,
            studentClass: "",
            oldPoints: 0,
            pointsChanged: 0,
            description: line,
            date: new Date().toISOString().split("T")[0],
            isValid: false,
            errorReason: "Data kolom minimal berisi NISN dan Perubahan Poin diteduh TAB/Koma"
          });
          return;
        }
      }

      const nisn = cols[0]?.trim() || "";
      const pointStr = cols[1]?.trim() || "";
      const comment = cols[2]?.trim() || "Update poin via Excel";
      const dateStr = cols[3]?.trim() || new Date().toISOString().split("T")[0];

      const pointsChanged = parseInt(pointStr, 10);

      if (!nisn) {
        parsed.push({
          studentId: "",
          studentName: `Baris ${i + 1}`,
          studentClass: "",
          oldPoints: 0,
          pointsChanged: 0,
          description: comment,
          date: dateStr,
          isValid: false,
          errorReason: "NISN kosong"
        });
        return;
      }

      if (isNaN(pointsChanged)) {
        parsed.push({
          studentId: "",
          studentName: `Baris ${i + 1} (NISN: ${nisn})`,
          studentClass: "",
          oldPoints: 0,
          pointsChanged: 0,
          description: comment,
          date: dateStr,
          isValid: false,
          errorReason: `Format angka poin tidak dikenali: "${pointStr}"`
        });
        return;
      }

      // Search student
      const student = students.find(s => s.nisn === nisn);
      if (!student) {
        parsed.push({
          studentId: "",
          studentName: `NISN: ${nisn}`,
          studentClass: "",
          oldPoints: 0,
          pointsChanged,
          description: comment,
          date: dateStr,
          isValid: false,
          errorReason: `NISN ini tidak terdaftar di SIM-BK`
        });
      } else {
        parsed.push({
          studentId: student.id,
          studentName: student.name,
          studentClass: student.studentClass,
          oldPoints: student.points,
          pointsChanged,
          description: comment,
          date: dateStr,
          isValid: true
        });
      }
    });

    setExcelPreview(parsed);
  };

  const handleApplyExcelPoints = () => {
    const validItems = excelPreview.filter(p => p.isValid);
    if (validItems.length === 0) {
      alert("Tidak ada baris data valid yang siap diajukan!");
      return;
    }

    if (onBulkUpdatePointsAndHistory) {
      onBulkUpdatePointsAndHistory(
        validItems.map(v => ({
          studentId: v.studentId,
          pointsChanged: v.pointsChanged,
          description: v.description,
          date: v.date
        }))
      );
      alert(`Sukses mengupdate poin ${validItems.length} siswa sesuai data Excel!`);
      setShowExcelImportModal(false);
      setExcelInputText("");
      setExcelPreview([]);
    } else {
      // Fallback
      validItems.forEach(v => {
        onUpdateStudentPoints(v.studentId, Math.max(0, v.oldPoints + v.pointsChanged));
        onAddHistory({
          id: `h-fall-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          studentId: v.studentId,
          type: v.pointsChanged >= 0 ? "VIOLATION" : "REWARD",
          description: v.description,
          pointsChanged: v.pointsChanged,
          date: v.date
        });
      });
      alert(`Sukses mengupdate poin ${validItems.length} siswa secara sekuensial!`);
      setShowExcelImportModal(false);
      setExcelInputText("");
      setExcelPreview([]);
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesClass = selectedClass === "ALL" || s.studentClass === selectedClass;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.nisn.includes(searchQuery);
    return matchesClass && matchesSearch;
  });

  const handleApplyPointChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    let pointsChanged = 0;
    let description = "";

    if (actionType === "VIOLATION") {
      const violation = activeViolationTypes.find(v => v.id === selectedViolationId);
      pointsChanged = violation ? violation.points : customPoints;
      description = violation ? `${violation.name} (${violation.points} Poin)` : `${customDescription} (${customPoints} Poin)`;
    } else if (actionType === "REWARD") {
      // Reward reduces points
      pointsChanged = -Math.abs(customPoints);
      description = `Penghargaan/Apresiasi: ${customDescription} (-${customPoints} Poin)`;
    } else {
      // Manual adjustment
      pointsChanged = customPoints; // can be negative or positive depending on input
      description = `Penyesuaian Manual: ${customDescription} (${customPoints > 0 ? "+" : ""}${customPoints} Poin)`;
    }

    const newHistory: PointHistory = {
      id: `history-${Date.now()}`,
      studentId: selectedStudent.id,
      type: actionType,
      description,
      pointsChanged,
      date: actionDate
    };

    // Calculate new total points for student (cannot be lower than 0)
    const currentTotal = selectedStudent.points;
    const newTotal = Math.max(0, currentTotal + pointsChanged);

    onAddHistory(newHistory);
    onUpdateStudentPoints(selectedStudent.id, newTotal);

    // Update active student view
    setSelectedStudent(prev => prev ? { ...prev, points: newTotal } : null);

    // Reset inputs
    setCustomDescription("");
    setCustomPoints(5);
    alert("Perubahan nilai poin sikap perilaku berhasil disimpan.");
  };

  const handlePrint = () => {
    const printContent = printAreaRef.current?.innerHTML;
    const originalContent = document.body.innerHTML;

    if (!printContent) return;

    // Open clean window with print content
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Cetak Rekapitulasi Poin - ${selectedStudent?.name}</title>
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
      // Fallback
      window.print();
    }
  };

  const studentHistory = history.filter(h => h.studentId === selectedStudent?.id);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* Sidebar: Student list select */}
      <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-14rem)] min-h-[500px]">
        <div className="p-6 border-b border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-slate-800">Cari Kartu Poin</h3>
            <button
              onClick={() => setShowExcelImportModal(true)}
              className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 border border-indigo-200/40 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all"
              title="Perbarui poin siswa sekaligus dari salinan data tabel excel (Copypaste)"
              type="button"
            >
              <Upload size={12} />
              Impor Poin Excel
            </button>
          </div>
          
          <div className="space-y-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Masukkan nama / NISN..."
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />

            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-semibold focus:outline-none"
            >
              <option value="ALL">Semua Kelas</option>
              {CLASSES_LIST.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Scrollable list of students */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredStudents.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">Tidak ada siswa ditemukan.</div>
          ) : (
            filteredStudents.map(student => (
              <div
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                className={`p-4 flex items-center justify-between cursor-pointer transition-all ${
                  selectedStudent?.id === student.id ? "bg-blue-50/60 border-l-4 border-blue-600" : "hover:bg-slate-50/50"
                }`}
              >
                <div>
                  <h4 className="font-bold text-slate-800 text-sm leading-tight">{student.name}</h4>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    NISN {student.nisn} &bull; <span className="font-semibold text-slate-500 uppercase">{student.studentClass}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-block text-xs font-extrabold px-2.5 py-1 rounded-full ${
                    student.points >= 50 
                      ? "bg-rose-100 text-rose-800" 
                      : student.points >= 20 
                      ? "bg-amber-100 text-amber-800" 
                      : "bg-slate-100 text-slate-600"
                  }`}>
                    {student.points} Pts
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Panel: Student card and management actions */}
      <div className="lg:col-span-7 space-y-8 h-[calc(100vh-14rem)] overflow-y-auto pr-2">
        {selectedStudent ? (
          <>
            {/* Student statistics summary card */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <span className="text-[10px] bg-slate-150 text-slate-500 font-extrabold px-3 py-1 rounded-md uppercase tracking-wider">
                  Siswa: {selectedStudent.studentClass}
                </span>
                <h2 className="text-2xl font-bold text-slate-900 mt-2 tracking-tight">{selectedStudent.name}</h2>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  NISN {selectedStudent.nisn} &bull; Gender: {selectedStudent.gender === "L" ? "Laki-laki" : "Perempuan"}
                </p>
                <div className="flex gap-4 mt-3 text-xs text-slate-500 font-medium">
                  <span>📱 Siswa: {selectedStudent.phone}</span>
                  <span>👨‍👩‍👦 Wali: {selectedStudent.parentPhone}</span>
                </div>
              </div>

              <div className="text-center sm:text-right border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Akumulasi Poin Pelanggaran</p>
                <div className="flex items-baseline justify-center sm:justify-end gap-2 mt-1">
                  <span className={`text-5xl font-extrabold tracking-tight ${
                    selectedStudent.points >= 50 
                      ? "text-rose-600" 
                      : selectedStudent.points >= 20 
                      ? "text-amber-500" 
                      : "text-slate-700"
                  }`}>
                    {selectedStudent.points}
                  </span>
                  <span className="text-slate-400 text-sm font-semibold">Poin</span>
                </div>
                
                {/* Print Recap Button */}
                <button
                  onClick={() => setShowPrintPreview(true)}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                >
                  <Printer size={14} />
                  Cetak Surat Rekap
                </button>
              </div>
            </div>

            {/* Panel: Increase/Decrease Points (Tambah & Kurangi Poin) */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm">
              <h3 className="font-bold text-slate-800 text-lg border-b border-slate-100 pb-4 mb-6">
                📝 Transaksi & Penyesuaian Nilai Sikap Siswa
              </h3>

              <form onSubmit={handleApplyPointChange} className="space-y-6">
                {/* Type selection: Violation (Tambah), Reward (Kurang), Adjustment */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Kategori Aksi</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => { setActionType("VIOLATION"); setCustomPoints(5); }}
                      className={`py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all flex flex-col items-center gap-1 ${
                        actionType === "VIOLATION" 
                          ? "bg-rose-50 border-rose-300 text-rose-700 shadow-sm" 
                          : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      <PlusCircle size={18} />
                      Tambah Poin (Pelanggaran)
                    </button>

                    <button
                      type="button"
                      onClick={() => { setActionType("REWARD"); setCustomPoints(10); }}
                      className={`py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all flex flex-col items-center gap-1 ${
                        actionType === "REWARD" 
                          ? "bg-teal-50 border-teal-300 text-teal-700 shadow-sm" 
                          : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      <MinusCircle size={18} />
                      Kurangi Poin (Apresiasi/Fasilitasi)
                    </button>

                    <button
                      type="button"
                      onClick={() => { setActionType("ADJUSTMENT"); setCustomPoints(0); }}
                      className={`py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all flex flex-col items-center gap-1 ${
                        actionType === "ADJUSTMENT" 
                          ? "bg-blue-50 border-blue-300 text-blue-700 shadow-sm" 
                          : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      <UserCheck size={18} />
                      Koreksi Manual Poin
                    </button>
                  </div>
                </div>

                {/* Conditional Dropdown for violations */}
                {actionType === "VIOLATION" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Pilih Aturan Pelanggaran</label>
                      <select
                        value={selectedViolationId}
                        onChange={(e) => {
                          setSelectedViolationId(e.target.value);
                          const v = activeViolationTypes.find(item => item.id === e.target.value);
                          if (v) setCustomPoints(v.points);
                        }}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-semibold"
                      >
                        {activeViolationTypes.map(v => (
                          <option key={v.id} value={v.id}>
                            {v.name} (+{v.points} Poin)
                          </option>
                        ))}
                        <option value="custom">-- Pelanggaran Kustom Lainnya --</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Nilai Pelanggaran Poin</label>
                      <input
                        type="number"
                        disabled={selectedViolationId !== "custom"}
                        value={customPoints}
                        onChange={(e) => setCustomPoints(parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
                        min="1"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Uraian Alasan / Kasus Penyesuaian</label>
                      <input
                        type="text"
                        value={customDescription}
                        onChange={(e) => setCustomDescription(e.target.value)}
                        placeholder={actionType === "REWARD" ? "Contoh: Juara umum pidato bahasa Arab atau Menunjukkan niat taubat baik" : "Alasan koreksi selisih hitung..."}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-semibold"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                          {actionType === "REWARD" ? "Jumlah Poin Pengurangan" : "Jumlah Koreksi Poin"}
                        </label>
                        <input
                          type="number"
                          value={customPoints}
                          onChange={(e) => setCustomPoints(parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Tanggal Eksekusi</label>
                        <input
                          type="date"
                          value={actionDate}
                          onChange={(e) => setActionDate(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-semibold"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Conditional Custom Description for custom violations */}
                {actionType === "VIOLATION" && selectedViolationId === "custom" && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Deskripsi Kasus Kustom</label>
                    <input
                      type="text"
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      placeholder="Masukkan jenis pelanggaran tidak terdaftar..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                      required
                    />
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-4 text-white font-bold bg-blue-600 hover:bg-blue-700 rounded-xl text-xs uppercase tracking-wider shadow-md shadow-blue-100 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    🚀 Terapkan Perubahan Poin Sikap Siswa
                  </button>
                </div>
              </form>
            </div>

            {/* History Table for current selected student */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Clock size={18} className="text-blue-500" />
                  <span>Log Riwayat Siswa</span>
                </h3>
              </div>
              <div className="divide-y divide-slate-100">
                {studentHistory.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">Belum ada riwayat sikap tercatat untuk anak ini.</div>
                ) : (
                  studentHistory.map(h => (
                    <div key={h.id} className="p-5 flex items-center justify-between text-sm hover:bg-slate-50/50">
                      <div>
                        <p className="font-bold text-slate-800">{h.description}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">{h.date} &bull; ID: {h.id}</p>
                      </div>
                      <span className={`font-extrabold text-sm ${h.pointsChanged >= 0 ? "text-rose-600" : "text-teal-600"}`}>
                        {h.pointsChanged >= 0 ? "+" : ""}{h.pointsChanged}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-3xl border-2 border-dashed border-slate-300/80 p-16 text-center text-slate-400 flex flex-col items-center justify-center h-[calc(100vh-14rem)] min-h-[500px]">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mb-4 border shadow-sm">
              <AlertTriangle size={32} />
            </div>
            <h3 className="font-bold text-lg text-slate-850">Layanan Analis Poin Konseling</h3>
            <p className="text-slate-500 text-sm max-w-sm mt-2">
              Silakan pilih salah satu data peserta didik di panel sebelah kiri untuk menganalisis, mengkoreksi nilai pelanggaran, ataupun mencetak laporan rekapitulasi poin.
            </p>
          </div>
        )}
      </div>

      {/* Show Printable Recap Sheet Modal Preview */}
      {showPrintPreview && selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-8">
            <div className="px-8 py-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between no-print">
              <div className="flex items-center gap-3">
                <FileText className="text-blue-600" size={24} />
                <h2 className="text-lg font-bold text-slate-800">Pratinjau Surat Rekapitulasi Kasus Siswa</h2>
              </div>
              <button 
                onClick={() => setShowPrintPreview(false)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400"
              >
                ✕
              </button>
            </div>

            {/* The Print Area */}
            <div className="p-12 overflow-y-auto max-h-[500px]" ref={printAreaRef}>
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
                <h3 className="text-sm font-bold uppercase underline font-serif tracking-widest text-black">BERITA ACARA REKAPITULASI PELANGGARAN & SIKAP</h3>
                <p className="text-xs font-serif text-black mt-1">Nomor: SIMBK-AM/${new Date().getFullYear()}/${selectedStudent.nisn}</p>
              </div>

              {/* Student Profile Data */}
              <div className="space-y-2 mb-6 text-sm font-serif text-black">
                <p className="text-xs italic text-black mb-2 select-none font-semibold">Yang bertanda tangan di bawah ini menerangkan riwayat sanksi peserta didik:</p>
                <div className="grid grid-cols-12 gap-1 py-1">
                  <div className="col-span-4 font-bold">Nama Lengkap</div>
                  <div className="col-span-1 border-none">:</div>
                  <div className="col-span-7 font-bold uppercase">{selectedStudent.name}</div>
                </div>
                <div className="grid grid-cols-12 gap-1 py-1">
                  <div className="col-span-4">NISN / No. Induk</div>
                  <div className="col-span-1">:</div>
                  <div className="col-span-7 font-mono">{selectedStudent.nisn}</div>
                </div>
                <div className="grid grid-cols-12 gap-1 py-1">
                  <div className="col-span-4">Kelas / Tingkat</div>
                  <div className="col-span-1">:</div>
                  <div className="col-span-7 font-bold">{selectedStudent.studentClass}</div>
                </div>
                <div className="grid grid-cols-12 gap-1 py-1">
                  <div className="col-span-4">Jenis Kelamin</div>
                  <div className="col-span-1">:</div>
                  <div className="col-span-7">{selectedStudent.gender === "L" ? "Laki-laki" : "Perempuan"}</div>
                </div>
                <div className="grid grid-cols-12 gap-1 py-1">
                  <div className="col-span-4">Akumulasi Kredit Kasus</div>
                  <div className="col-span-1">:</div>
                  <div className="col-span-7 font-bold text-red-700">{selectedStudent.points} POIN</div>
                </div>
              </div>

              {/* List of histories inside sheet */}
              <div className="space-y-4 mb-8">
                <p className="text-xs font-bold uppercase border-b pb-1 font-serif text-black select-none tracking-wider">Tabel Rincian Riwayat Sikap & Kasus (Kronologis):</p>
                <div className="border border-black overflow-hidden rounded-md">
                  <table className="w-full text-left text-xs font-serif text-black">
                    <thead>
                      <tr className="bg-slate-100 border-b border-black font-bold">
                        <th className="p-2 border-r border-black">No.</th>
                        <th className="p-2 border-r border-black">Tanggal</th>
                        <th className="p-2 border-r border-black">Uraian / Deskripsi Kasus</th>
                        <th className="p-2 text-right">Poin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black">
                      {studentHistory.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-slate-500 italic">Peserta Didik ini bersih dari pelanggaran dan hukuman.</td>
                        </tr>
                      ) : (
                        studentHistory.map((h, index) => (
                          <tr key={h.id}>
                            <td className="p-2 border-r border-black text-center">{index + 1}</td>
                            <td className="p-2 border-r border-black font-mono">{h.date}</td>
                            <td className="p-2 border-r border-black">{h.description}</td>
                            <td className="p-2 text-right font-bold">{h.pointsChanged}</td>
                          </tr>
                        ))
                      )}
                      {/* Overall points Row */}
                      <tr className="font-bold bg-slate-50 border-t border-black">
                        <td colSpan={3} className="p-2 text-right border-r border-black">TOTAL AKUMULASI POIN PELANGGARAN SISWA:</td>
                        <td className="p-2 text-right text-red-600 font-bold">{selectedStudent.points} Poin</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Signature Sections */}
              <div className="grid grid-cols-2 gap-8 text-center text-sm font-serif text-black mt-12 pr-4 pl-4 select-none">
                <div>
                  <p>Orang Tua / Wali Murid,</p>
                  <div className="h-20"></div>
                  <p className="font-bold underline text-black">( ______________________ )</p>
                  <p className="text-xs text-slate-500 mt-1">Tanda Tangan & Nama Terang</p>
                </div>
                <div>
                  <p>Kediri, {new Date().toLocaleDateString("id-ID", { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p>Kepala / Guru Bimbingan Konseling,</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline text-black">Ustadz / Ustadzah BK</p>
                  <p className="text-xs text-slate-500 mt-1">NIP. SMP AL MAHRUSIYAH KP</p>
                </div>
              </div>
            </div>

            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 no-print">
              <button
                type="button"
                onClick={() => setShowPrintPreview(false)}
                className="px-5 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl text-xs uppercase tracking-wider transition-all"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-100 flex items-center gap-2"
              >
                <Printer size={16} />
                Cetak Cetak Fisik / Simpan PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Excel Point Import copy-paste */}
      {showExcelImportModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-8 py-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="text-blue-600" size={20} />
                <h2 className="text-xl font-bold text-slate-800">Impor Update Poin via Excel / Tabular</h2>
              </div>
              <button
                type="button"
                onClick={() => { setShowExcelImportModal(false); setExcelInputText(""); setExcelPreview([]); }}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-8 overflow-y-auto space-y-6 flex-1">
              <div className="p-4 bg-blue-50 border border-blue-100/60 rounded-2xl text-xs space-y-2 text-slate-600 leading-relaxed">
                <p className="font-extrabold text-blue-800">Petunjuk Format Salinan Data Excel:</p>
                <p>
                  Salin (Copy) tabel Excel berisi data poin siswa, dan tempelkan (Paste) pada kolom masukan di bawah ini. Pastikan format tabel memiliki kolom berurutan sebagai berikut:
                </p>
                <div className="font-mono bg-white p-2.5 rounded-xl border border-blue-200 mt-1 space-y-1">
                  <div>Kolom 1: <span className="font-bold">NISN</span> (Wajib, Contoh: <span className="text-slate-500">23456783</span>)</div>
                  <div>Kolom 2: <span className="font-bold">Perubahan Poin</span> (Wajib, Angka positif untuk pelanggaran, angka negatif untuk pengurangan / reward. Contoh: <span className="text-rose-600">15</span> atau <span className="text-emerald-600">-10</span>)</div>
                  <div>Kolom 3: <span className="font-bold">Deskripsi Kasus/Alasan</span> (Keterangan kasus, Contoh: <span className="text-slate-500">Melompati Pagar</span>)</div>
                  <div>Kolom 4: <span className="font-bold">Tanggal</span> (Opsional, format YYYY-MM-DD. Kosongkan untuk tanggal hari ini)</div>
                </div>
                <p className="text-[10px] italic mt-1 text-slate-400">
                  Tip: Anda bisa langsung menyalin 4 kolom tersebut dari Microsoft Excel maupun Google Sheets lalu menempelkannya ke kotak masukan di bawah.
                </p>
              </div>

              {/* Textarea Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Tempel Data Tabel Excel Anda Di Sini:</label>
                <textarea
                  rows={6}
                  value={excelInputText}
                  onChange={(e) => setExcelInputText(e.target.value)}
                  placeholder="Contoh:&#10;23456783&#9;15&#9;Mengabaikan piket kelas&#9;2026-05-20&#10;23456781&#9;-10&#9;Membantu melipat sajadah musholla&#9;2026-05-20"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700"
                />
              </div>

              {/* Action trigger parsing */}
              <div className="flex justify-start">
                <button
                  type="button"
                  onClick={handleParseExcel}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md"
                >
                  <RefreshCw size={14} />
                  Proses & Validasi Data
                </button>
              </div>

              {/* Parsed Preview Section */}
              {excelPreview.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Pratinjau Hasil Pembacaan Data:</h4>
                  <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100 font-sans max-h-60 overflow-y-auto">
                    {excelPreview.map((item, idx) => (
                      <div 
                        key={idx} 
                        className={`p-3 text-xs flex flex-col sm:flex-row justify-between sm:items-center gap-2 ${
                          item.isValid ? "bg-emerald-50/40" : "bg-rose-50/40"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">{item.studentName}</span>
                            {item.studentClass && (
                              <span className="bg-slate-200/60 text-slate-600 font-extrabold px-1.5 py-0.5 rounded text-[9px] uppercase">
                                {item.studentClass}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-500 font-medium">
                            Aksi: {item.pointsChanged > 0 ? "Pelanggaran (" : "Pemberian Penghargaan ("}
                            <span className={item.pointsChanged > 0 ? "text-rose-600 font-extrabold" : "text-emerald-600 font-extrabold"}>
                              {item.pointsChanged > 0 ? `+${item.pointsChanged}` : item.pointsChanged} Poin
                            </span>
                            ) &bull; <span className="font-serif italic text-slate-600">"{item.description}"</span>
                          </p>
                        </div>

                        <div className="text-right">
                          {item.isValid ? (
                            <div className="flex flex-col items-end">
                              <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1">
                                <CheckCircle2 size={10} /> Valid
                              </span>
                              <span className="text-[10px] text-slate-400 mt-1 font-mono">
                                Poin Akhir: {item.oldPoints} &rarr; {Math.max(0, item.oldPoints + item.pointsChanged)} Pts
                              </span>
                            </div>
                          ) : (
                            <span className="text-rose-700 font-extrabold bg-rose-100 px-2.5 py-0.5 rounded-full text-[10px]">
                              Error: {item.errorReason}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => { setShowExcelImportModal(false); setExcelInputText(""); setExcelPreview([]); }}
                className="px-5 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl text-xs uppercase tracking-wider transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleApplyExcelPoints}
                disabled={excelPreview.filter(p => p.isValid).length === 0}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-100"
              >
                Terapkan Update Poin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export {};
