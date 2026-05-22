import React, { useState } from "react";
import { Users, FileSpreadsheet, Plus, Upload, Trash2, Edit2, CheckCircle, HelpCircle, ArrowLeft, Download } from "lucide-react";
import { Student, StudentClass } from "../types";
import { CLASSES_LIST } from "../data/mockData";

interface StudentDataViewProps {
  students: Student[];
  onAddStudent: (student: Student) => void;
  onBulkAddStudents: (students: Student[]) => void;
  onDeleteStudent: (id: string) => void;
  onEditStudent: (student: Student) => void;
}

export default function StudentDataView({
  students,
  onAddStudent,
  onBulkAddStudents,
  onDeleteStudent,
  onEditStudent
}: StudentDataViewProps) {
  const [selectedClass, setSelectedClass] = useState<StudentClass | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  
  // Single Student state
  const [nisn, setNisn] = useState("");
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"L" | "P">("L");
  const [studentClass, setStudentClass] = useState<StudentClass>("VII-A");
  const [phone, setPhone] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);

  // Excel paste/upload state
  const [rawText, setRawText] = useState("");
  const [fileName, setFileName] = useState("");
  const [importPreview, setImportPreview] = useState<Student[]>([]);
  const [importError, setImportError] = useState("");
  const [importSuccessMsg, setImportSuccessMsg] = useState("");

  const resetForm = () => {
    setNisn("");
    setName("");
    setGender("L");
    setStudentClass("VII-A");
    setPhone("");
    setParentPhone("");
    setEditingStudentId(null);
  };

  const handleEditClick = (student: Student) => {
    setEditingStudentId(student.id);
    setNisn(student.nisn);
    setName(student.name);
    setGender(student.gender);
    setStudentClass(student.studentClass);
    setPhone(student.phone);
    setParentPhone(student.parentPhone);
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nisn || !name) return;

    if (editingStudentId) {
      onEditStudent({
        id: editingStudentId,
        nisn,
        name,
        gender,
        studentClass,
        phone,
        parentPhone,
        points: students.find(s => s.id === editingStudentId)?.points || 0
      });
      setImportSuccessMsg("Siswa berhasil diperbarui.");
    } else {
      // Check duplicate NISN
      if (students.some(s => s.nisn === nisn)) {
        alert("Siswa dengan NISN tersebut sudah terdaftar!");
        return;
      }

      onAddStudent({
        id: Date.now().toString(),
        nisn,
        name,
        gender,
        studentClass,
        phone,
        parentPhone,
        points: 0
      });
      setImportSuccessMsg("Siswa baru berhasil ditambahkan.");
    }

    resetForm();
    setShowAddModal(false);
    setTimeout(() => setImportSuccessMsg(""), 3000);
  };

  // Parsing Excel/Spreadsheet Tab-Separated Values (TSV) or Comma-Separated Values (CSV)
  const handleParseExcel = (text: string) => {
    setImportError("");
    setImportPreview([]);

    const rows = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    const parsedStudents: Student[] = [];

    rows.forEach((row, i) => {
      // Split by tab (Excel copy-paste default) or semicolon/comma
      let cols = row.split("\t");
      if (cols.length < 2) {
        cols = row.split(";");
      }
      if (cols.length < 2) {
        cols = row.split(",");
      }

      // Cleanup
      const cleanedCols = cols.map(c => c.replace(/^["']|["']$/g, "").trim());

      // Try parsing: Expect indices:
      // 0: NISN/ID, 1: NAMA, 2: L/P, 3: KELAS, 4: NO HP (optional), 5: HP ORANG TUA (optional)
      const currentNisn = cleanedCols[0] || "";
      const currentName = cleanedCols[1] || "";
      let currentGender: "L" | "P" = "L";
      
      const rawGender = (cleanedCols[2] || "").toUpperCase();
      if (rawGender.startsWith("P") || rawGender === "PEREMPUAN" || rawGender === "FEMALE") {
        currentGender = "P";
      }

      let currentClass: StudentClass = "VII-A";
      let rawClass = (cleanedCols[3] || "").toUpperCase().trim().replace(/\s+/g, '-');
      // Handle cases where the hyphen is omitted (e.g. VIIA -> VII-A)
      if (/^(VII|VIII|IX)([A-L])$/.test(rawClass)) {
        rawClass = rawClass.replace(/^(VII|VIII|IX)([A-L])$/, "$1-$2");
      }
      const validClass = CLASSES_LIST.find(c => c.toUpperCase() === rawClass) as StudentClass;
      if (validClass) {
        currentClass = validClass;
      }

      const currentPhone = cleanedCols[4] || "";
      const currentParentPhone = cleanedCols[5] || "";

      if (currentNisn && currentName) {
        parsedStudents.push({
          id: `excel-${Math.random().toString(36).substr(2, 9)}`,
          nisn: currentNisn,
          name: currentName,
          gender: currentGender,
          studentClass: currentClass,
          phone: currentPhone || "081234567890",
          parentPhone: currentParentPhone || "081234567890",
          points: 0
        });
      }
    });

    if (parsedStudents.length === 0) {
      setImportError("Tidak dapat memproses data. Pastikan format penomoran dan nama benar.");
    } else {
      setImportPreview(parsedStudents);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawText(content);
      handleParseExcel(content);
    };
    reader.readAsText(file);
  };

  const handleApplyImport = () => {
    if (importPreview.length === 0) return;
    
    // Filter duplicates on NISN
    const existingNisns = new Set(students.map(s => s.nisn));
    const nonDuplicates = importPreview.filter(s => !existingNisns.has(s.nisn));
    const duplicatesCount = importPreview.length - nonDuplicates.length;

    onBulkAddStudents(nonDuplicates);
    setImportSuccessMsg(`Berhasil mengimpor ${nonDuplicates.length} siswa baru.${duplicatesCount > 0 ? ` (${duplicatesCount} siswa diabaikan karena NISN duplikat).` : ""}`);
    
    setRawText("");
    setFileName("");
    setImportPreview([]);
    setShowImportModal(false);
    setTimeout(() => setImportSuccessMsg(""), 4000);
  };

  const handleLoadSample = () => {
    const sample = `26123401\tAhmad Khoirul Anam\tL\tVII-A\t081111222333\t085555666777
26123402\tSiti Maratus Sholihah\tP\tVII-A\t081111222444\t085555666888
26123403\tZulfa Lutfiana\tP\tVIII-B\t081111222555\t085555666999
26123404\tMuhammad Fahmi\tL\tIX-C\t081111222666\t085555666000`;
    setRawText(sample);
    handleParseExcel(sample);
  };

  const filteredStudents = students.filter(s => {
    const matchesClass = selectedClass === "ALL" || s.studentClass === selectedClass;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.nisn.includes(searchQuery) ||
                          s.studentClass.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesClass && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
              placeholder="Cari berdasarkan NISN, Nama, atau Kelas..."
            />
          </div>
          
          {/* Class Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Kelas:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value as StudentClass | "ALL")}
              className="bg-slate-50 border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="ALL">Semua Kelas</option>
              {CLASSES_LIST.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setRawText("");
              setImportPreview([]);
              setFileName("");
              setShowImportModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 border border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-blue-700 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
          >
            <FileSpreadsheet size={16} />
            Impor dari Excel
          </button>
          <button
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-blue-100"
          >
            <Plus size={16} />
            Tambah Siswa
          </button>
        </div>
      </div>

      {importSuccessMsg && (
        <div className="p-4 rounded-2xl bg-teal-50 border border-teal-100 text-teal-800 text-sm font-semibold flex items-center gap-3">
          <CheckCircle className="text-teal-600 flex-shrink-0" size={20} />
          {importSuccessMsg}
        </div>
      )}

      {/* Student List Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Users size={20} className="text-blue-500" />
            <span>Base Data Siswa ({filteredStudents.length} dari {students.length})</span>
          </h3>
          <span className="text-xs bg-slate-100 text-slate-500 font-bold px-3 py-1 rounded-lg">
            SMP AL MAHRUSIYAH
          </span>
        </div>
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 text-slate-400 font-bold text-[11px] uppercase tracking-wider border-b border-slate-100">
                <th className="py-4 px-8">NISN</th>
                <th className="py-4 px-6">Nama Lengkap</th>
                <th className="py-4 px-6">L/P</th>
                <th className="py-4 px-6">Kelas</th>
                <th className="py-4 px-6">No. Telepon</th>
                <th className="py-4 px-6">Poin Pelanggaran</th>
                <th className="py-4 px-8 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <p className="font-medium text-slate-500">Tidak ada data siswa ditemukan.</p>
                    <p className="text-xs mt-1">Coba sesuaikan kelas atau kata kunci pencarian Anda.</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-8 font-mono text-xs font-bold text-slate-700">{student.nisn}</td>
                    <td className="py-4 px-6 font-bold text-slate-900">{student.name}</td>
                    <td className="py-4 px-6 font-medium text-slate-600">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-semibold ${
                        student.gender === "L" ? "bg-sky-50 text-sky-700" : "bg-rose-50 text-rose-700"
                      }`}>
                        {student.gender === "L" ? "Laki-laki" : "Perempuan"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-extrabold text-[#1e293b]">{student.studentClass}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-500 text-xs font-medium">
                      📱 {student.phone}<br/>
                      <span className="text-[10px] text-slate-400">Wali: {student.parentPhone}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center justify-center font-extrabold px-3 py-1 rounded-full text-xs ${
                        student.points >= 50 
                          ? "bg-rose-100 text-rose-800" 
                          : student.points >= 20 
                          ? "bg-amber-100 text-amber-800" 
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {student.points} Poin
                      </span>
                    </td>
                    <td className="py-4 px-8 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(student)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          title="Edit Siswa"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus data ${student.name}? Semua riwayat kecacatan perilaku siswa akan dihilangkan permanent.`)) {
                              onDeleteStudent(student.id);
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          title="Hapus Siswa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 font-sans">
                {editingStudentId ? "Edit Profil Siswa" : "Tambah Siswa Baru"}
              </h2>
              <button 
                onClick={() => { setShowAddModal(false); resetForm(); }}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block px-1">NISN / Nomor Induk</label>
                <input
                  type="text"
                  value={nisn}
                  onChange={(e) => setNisn(e.target.value.replace(/\D/g, ""))}
                  placeholder="Contoh: 26123401"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block px-1">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama lengkap siswa"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block px-1">Jenis Kelamin</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as "L" | "P")}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-semibold"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block px-1">Kelas Tingkat</label>
                  <select
                    value={studentClass}
                    onChange={(e) => setStudentClass(e.target.value as StudentClass)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold"
                  >
                    {CLASSES_LIST.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block px-1">No. HP Siswa</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 0812345..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block px-1">No. HP Wali / Orang Tua</label>
                  <input
                    type="text"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    placeholder="Wajib untuk Notifikasi Kasus"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); resetForm(); }}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs uppercase tracking-wider transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-100"
                >
                  {editingStudentId ? "Simpan Perubahan" : "Masukkan Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Paste Excel/CSV Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-8">
            <div className="px-8 py-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="text-blue-600" size={24} />
                <h2 className="text-xl font-bold text-slate-800 font-sans">
                  Impor Bulk Data Siswa via Excel / Spreadsheet
                </h2>
              </div>
              <button 
                onClick={() => { setShowImportModal(false); setRawText(""); setImportPreview([]); }}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400"
              >
                ✕
              </button>
            </div>

            <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Instructions Panel */}
              <div className="lg:col-span-5 bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4 text-xs text-slate-600">
                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <HelpCircle size={18} className="text-blue-500" />
                  Instruksi Langkah Mudah:
                </h3>
                <ol className="list-decimal list-inside space-y-2 leading-relaxed">
                  <li>Buka berkas Excel daftar siswa Anda.</li>
                  <li>Sesuaikan urutan kolom berurutan wajib:
                    <br />
                    <span className="font-mono text-[10px] bg-slate-200/80 px-1 py-0.5 rounded text-blue-800 font-bold">
                      NISN &bull; NAMA &bull; GENDER (L/P) &bull; KELAS &bull; NO HP &bull; NO HP WALI
                    </span>
                  </li>
                  <li>Seleksi baris data Anda di Excel, lalu tekan <kbd className="bg-white border rounded px-1">Ctrl+C</kbd> (Salin).</li>
                  <li>Gunakan tombol <button onClick={handleLoadSample} type="button" className="text-blue-600 font-bold underline hover:text-blue-700">Gunakan Draft Demo</button> untuk mencoba otomatis strukturnya.</li>
                  <li>Atau, unggah berkas teks (CSV) Anda di bawah ini.</li>
                </ol>

                <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                  <span className="font-bold text-slate-800 block">Pilihan 1: Unggah Berkas .CSV / .TXT</span>
                  <div className="relative">
                    <input 
                      type="file" 
                      accept=".csv,.txt"
                      onChange={handleFileUpload}
                      className="hidden" 
                      id="excel-file-uploader" 
                    />
                    <label 
                      htmlFor="excel-file-uploader"
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-500 cursor-pointer text-slate-500 font-semibold transition-all hover:bg-slate-100"
                    >
                      <Upload size={16} />
                      {fileName ? fileName : "Pilih File .CSV"}
                    </label>
                  </div>
                </div>
              </div>

              {/* Input & Preview Panel */}
              <div className="lg:col-span-7 flex flex-col space-y-4">
                <div className="space-y-1.5 flex-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block px-1">Area Paste Salinan Excel</label>
                  <textarea
                    rows={6}
                    value={rawText}
                    onChange={(e) => {
                      setRawText(e.target.value);
                      handleParseExcel(e.target.value);
                    }}
                    placeholder="Tempel (Ctrl+V) baris kolom Excel yang telah Anda salin di sini..."
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono text-xs text-slate-700 placeholder:text-slate-400"
                  />
                </div>

                {importError && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold rounded-xl text-center">
                    {importError}
                  </div>
                )}

                {/* Parsed Preview Counter */}
                {importPreview.length > 0 && (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden flex-1 max-h-[220px] flex flex-col">
                    <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700">Preview Data Terbaca ({importPreview.length} Siswa)</span>
                      <span className="text-teal-600 font-bold uppercase tracking-wider">Berhasil Terstruktur</span>
                    </div>
                    <div className="overflow-y-auto text-xs divide-y divide-slate-100 flex-1">
                      {importPreview.map((item, i) => (
                        <div key={item.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                          <div>
                            <span className="font-bold text-slate-800">{item.name}</span>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              NISN {item.nisn} &bull; Gender: {item.gender} &bull; Kelas: {item.studentClass}
                            </div>
                          </div>
                          <span className="text-[10px] bg-slate-100 font-bold px-2 py-0.5 rounded border">
                            Phone: {item.phone}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => { setShowImportModal(false); setRawText(""); setImportPreview([]); }}
                className="px-5 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl text-xs uppercase tracking-wider transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={importPreview.length === 0}
                onClick={handleApplyImport}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-100 flex items-center gap-2"
              >
                <CheckCircle size={16} />
                Konfirmasi Impor ({importPreview.length} Siswa)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export {};
