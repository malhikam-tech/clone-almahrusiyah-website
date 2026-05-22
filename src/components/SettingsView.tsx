import React, { useState } from "react";
import { Shield, User, Plus, Trash2, Check, Save, UserCheck, Settings, Edit2, X, AlertTriangle } from "lucide-react";
import { ViolationType } from "../types";

interface SettingsViewProps {
  counselors: string[];
  principalName: string;
  wakaKesiswaanName: string;
  violationTypes: ViolationType[];
  onUpdateCounselors: (counselors: string[]) => void;
  onUpdatePrincipal: (name: string) => void;
  onUpdateWaka: (name: string) => void;
  onUpdateViolationTypes: (types: ViolationType[]) => void;
}

export default function SettingsView({
  counselors,
  principalName,
  wakaKesiswaanName,
  violationTypes,
  onUpdateCounselors,
  onUpdatePrincipal,
  onUpdateWaka,
  onUpdateViolationTypes
}: SettingsViewProps) {
  const [newPrincipal, setNewPrincipal] = useState(principalName);
  const [newWaka, setNewWaka] = useState(wakaKesiswaanName);
  const [newCounselor, setNewCounselor] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  // States for dynamic violation types
  const [newViolationName, setNewViolationName] = useState("");
  const [newViolationPoints, setNewViolationPoints] = useState(5);
  const [editingViolationId, setEditingViolationId] = useState<string | null>(null);
  const [editingViolationName, setEditingViolationName] = useState("");
  const [editingViolationPoints, setEditingViolationPoints] = useState(5);

  const handleSaveOfficials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrincipal.trim() || !newWaka.trim()) {
      alert("Nama Kepala Sekolah dan Waka Kesiswaan tidak boleh kosong!");
      return;
    }
    onUpdatePrincipal(newPrincipal.trim());
    onUpdateWaka(newWaka.trim());
    
    setStatusMessage("Pejabat sekolah berhasil diperbarui!");
    setTimeout(() => setStatusMessage(""), 3000);
  };

  const handleAddCounselor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCounselor.trim()) {
      alert("Nama Guru BK tidak boleh kosong!");
      return;
    }
    if (counselors.includes(newCounselor.trim())) {
      alert("Nama Guru BK sudah terdaftar!");
      return;
    }
    const updated = [...counselors, newCounselor.trim()];
    onUpdateCounselors(updated);
    setNewCounselor("");
    setStatusMessage("Guru BK baru berhasil ditambahkan!");
    setTimeout(() => setStatusMessage(""), 3000);
  };

  const handleDeleteCounselor = (name: string) => {
    if (counselors.length <= 1) {
      alert("Minimal harus ada 1 Guru BK di sistem!");
      return;
    }
    if (confirm(`Apakah Anda yakin ingin menghapus Guru BK "${name}"?`)) {
      const updated = counselors.filter(c => c !== name);
      onUpdateCounselors(updated);
      setStatusMessage("Guru BK berhasil dihapus!");
      setTimeout(() => setStatusMessage(""), 3000);
    }
  };

  // Handlers for Violation Types management
  const handleAddViolationType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newViolationName.trim()) {
      alert("Deskripsi perilaku pelanggaran tidak boleh kosong!");
      return;
    }
    if (newViolationPoints <= 0) {
      alert("Poin pelanggaran harus bernilai positif!");
      return;
    }
    const isDuplicate = violationTypes.some(
      v => v.name.toLowerCase() === newViolationName.trim().toLowerCase()
    );
    if (isDuplicate) {
      alert("Perilaku pelanggaran ini sudah terdaftar!");
      return;
    }

    const newType: ViolationType = {
      id: `v-custom-${Date.now()}`,
      name: newViolationName.trim(),
      points: newViolationPoints
    };

    onUpdateViolationTypes([...violationTypes, newType]);
    setNewViolationName("");
    setNewViolationPoints(5);
    setStatusMessage("Aturan & poin perilaku pelanggaran berhasil ditambahkan!");
    setTimeout(() => setStatusMessage(""), 3000);
  };

  const handleDeleteViolationType = (id: string, name: string) => {
    if (violationTypes.length <= 1) {
      alert("Minimal harus ada 1 jenis aturan pelanggaran di dalam sistem!");
      return;
    }
    if (confirm(`Apakah Anda yakin ingin menghapus aturan: "${name}"?`)) {
      const updated = violationTypes.filter(v => v.id !== id);
      onUpdateViolationTypes(updated);
      setStatusMessage("Aturan perilaku pelanggaran berhasil dihapus!");
      setTimeout(() => setStatusMessage(""), 3000);
    }
  };

  const handleStartEditViolationType = (v: ViolationType) => {
    setEditingViolationId(v.id);
    setEditingViolationName(v.name);
    setEditingViolationPoints(v.points);
  };

  const handleCancelEditViolationType = () => {
    setEditingViolationId(null);
    setEditingViolationName("");
    setEditingViolationPoints(5);
  };

  const handleSaveEditViolationType = (id: string) => {
    if (!editingViolationName.trim()) {
      alert("Nama atau deskripsi perilaku tidak boleh kosong!");
      return;
    }
    if (editingViolationPoints <= 0) {
      alert("Poin pelanggaran harus bernilai positif!");
      return;
    }

    const updated = violationTypes.map(v => {
      if (v.id === id) {
        return {
          ...v,
          name: editingViolationName.trim(),
          points: editingViolationPoints
        };
      }
      return v;
    });

    onUpdateViolationTypes(updated);
    setEditingViolationId(null);
    setStatusMessage("Aturan perilaku pelanggaran berhasil diperbarui!");
    setTimeout(() => setStatusMessage(""), 3000);
  };

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
          Pengaturan Pejabat & Guru BK
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Kelola nama Kepala Sekolah, Waka Kesiswaan, dan list Guru BK (Konselor) pengampu laporan resmi SIM-BK.
        </p>
      </div>

      {statusMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 animate-pulse shadow-sm shadow-emerald-100">
          <Check size={16} />
          {statusMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Card: Edit Principal & Waka Info */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <Shield className="text-blue-600" size={20} />
            <h2 className="text-lg font-bold text-slate-800">Manajemen Pejabat Sekolah</h2>
          </div>

          <form onSubmit={handleSaveOfficials} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Kepala Sekolah (Principal)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={newPrincipal}
                  onChange={(e) => setNewPrincipal(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                  placeholder="Ketik nama Kepala Sekolah beserta gelar..."
                />
                <User className="absolute left-3 top-3.5 text-slate-400" size={16} />
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Beban penanggung jawab penutupan kasus bimbingan & lapor cetak.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Waka Kesiswaan
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={newWaka}
                  onChange={(e) => setNewWaka(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                  placeholder="Ketik nama Waka Kesiswaan..."
                />
                <UserCheck className="absolute left-3 top-3.5 text-slate-400" size={16} />
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Melakukan koordinasi kedisiplinan dan persetujuan SP (Surat Peringatan).</p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md cursor-pointer transition-all"
              >
                <Save size={14} />
                Simpan Pejabat Sekolah
              </button>
            </div>
          </form>
        </div>

        {/* Right Card: Manage Counselors (Guru BK) */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <Settings className="text-blue-600" size={20} />
            <h2 className="text-lg font-bold text-slate-800">Daftar Guru / Konselor BK</h2>
          </div>

          {/* Add Counselor Form */}
          <form onSubmit={handleAddCounselor} className="flex gap-2.5">
            <input
              type="text"
              value={newCounselor}
              onChange={(e) => setNewCounselor(e.target.value)}
              placeholder="Contoh: INDAH LESTARI, S.Psi."
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
            />
            <button
              type="submit"
              className="flex items-center gap-1 px-4 py-3 bg-slate-800 hover:bg-slate-900 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus size={14} />
              Tambah BK
            </button>
          </form>

          {/* Counselor list */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Guru BK Terdaftar Saat Ini ({counselors.length}):</label>
            <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-72 overflow-y-auto">
              {counselors.map((name, index) => (
                <div key={name} className="flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-350 bg-slate-100 px-2 py-1 rounded font-mono">{index + 1}</span>
                    <span className="text-xs font-semibold text-slate-800">{name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteCounselor(name)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Hapus Konselor"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Master Aturan & Poin Pelanggaran Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-amber-500" size={24} />
            <div>
              <h2 className="text-lg font-bold text-slate-800">Master Aturan Perilaku & Poin Pelanggaran</h2>
              <p className="text-xs text-slate-500 mt-0.5">Kelola tipe, deskripsi perilaku, dan nominal angka poin bawaan sistem SIM-BK.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* New Rule Form */}
          <div className="lg:col-span-4 bg-slate-50 p-5 rounded-2xl border border-slate-200/60 h-fit space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Tambah Aturan Baru</h3>
            <form onSubmit={handleAddViolationType} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Deskripsi Perilaku Pelanggaran</label>
                <textarea
                  value={newViolationName}
                  onChange={(e) => setNewViolationName(e.target.value)}
                  placeholder="Contoh: Terlambat mengikuti shalat jamaah"
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Bobot Poin (Nominal Angka)</label>
                <input
                  type="number"
                  value={newViolationPoints}
                  onChange={(e) => setNewViolationPoints(parseInt(e.target.value) || 0)}
                  min="1"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 px-4 py-3 bg-slate-850 hover:bg-slate-905 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm"
              >
                <Plus size={14} />
                Tambah Aturan
              </button>
            </form>
          </div>

          {/* Rules List Table */}
          <div className="lg:col-span-8 space-y-3">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
              <span>Aturan Pelanggaran Aktif ({violationTypes.length} Aturan)</span>
              <span className="text-[10px] text-slate-400 capitalize font-medium font-sans">Ubah bobot poin dengan mengklik tombol edit</span>
            </h3>

            <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-[480px] overflow-y-auto">
              {violationTypes.map((item, index) => {
                const isEditing = editingViolationId === item.id;

                return (
                  <div key={item.id} className={`p-4 transition-colors ${isEditing ? "bg-blue-50/40" : "hover:bg-slate-50/70"}`}>
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                          <div className="md:col-span-9 space-y-1">
                            <label className="text-[9px] font-bold text-blue-600 uppercase">Deskripsi Perilaku</label>
                            <input
                              type="text"
                              value={editingViolationName}
                              onChange={(e) => setEditingViolationName(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs font-bold focus:outline-none text-slate-800"
                            />
                          </div>
                          <div className="md:col-span-3 space-y-1">
                            <label className="text-[9px] font-bold text-blue-600 uppercase">Poin</label>
                            <input
                              type="number"
                              value={editingViolationPoints}
                              onChange={(e) => setEditingViolationPoints(parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs font-black focus:outline-none text-slate-800"
                              min="1"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={handleCancelEditViolationType}
                            className="flex items-center gap-1 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-lg text-[10px] font-bold uppercase text-slate-600 transition-colors cursor-pointer"
                          >
                            <X size={12} />
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEditViolationType(item.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-[10px] font-bold uppercase text-white transition-colors cursor-pointer"
                          >
                            <Check size={12} />
                            Simpan Perubahan
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded font-mono mt-0.5">{index + 1}</span>
                          <div>
                            <p className="text-xs font-bold text-slate-800 leading-relaxed">{item.name}</p>
                            <span className="inline-block mt-1 text-[10px] font-black tracking-wider text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full font-mono uppercase">
                              +{item.points} POIN
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleStartEditViolationType(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Edit Perilaku / Poin"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteViolationType(item.id, item.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Hapus Aturan"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
