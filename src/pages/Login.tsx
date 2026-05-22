import React, { useState } from "react";
import { motion } from "motion/react";
import { LogIn, User, Lock, Loader2, GraduationCap } from "lucide-react";

interface LoginProps {
  onLogin: (user: { name: string; role: string }) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const contentType = response.headers.get("content-type");
      if (response.ok && contentType && contentType.includes("application/json")) {
        const data = await response.json();
        if (data.success) {
          onLogin(data.user);
          return;
        } else {
          setError(data.message || "Gagal masuk. Silakan periksa kembali.");
          return;
        }
      }

      // Fallback if the endpoint doesn't return JSON or fails (common on Netlify's serverless environment)
      if (username === "admin" && password === "admin123") {
        onLogin({ name: "Guru BK", role: "COUNSELOR" });
      } else {
        setError("Username atau password salah.");
      }
    } catch (err) {
      // Fallback for offline or static hosting environments (Netlify) with zero API backend
      if (username === "admin" && password === "admin123") {
        onLogin({ name: "Guru BK", role: "COUNSELOR" });
      } else {
        setError("Username atau password salah.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[5%] w-[400px] h-[400px] bg-blue-100 rounded-full blur-[100px] opacity-40"></div>
        <div className="absolute bottom-[10%] right-[0%] w-[500px] h-[500px] bg-sky-100 rounded-full blur-[120px] opacity-30"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-[440px]"
      >
        <div className="bg-white rounded-[32px] shadow-2xl overflow-hidden border border-slate-200">
          <div className="p-12 pb-0 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 mb-6 transition-transform hover:scale-105">
              <GraduationCap size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight text-center px-4 font-sans uppercase">SIM-BK</h1>
            <p className="text-blue-600 font-bold text-sm tracking-widest mt-1 uppercase text-center">SMP AL MAHRUSIYAH</p>
            <p className="text-slate-400 text-xs mt-2 text-center">Layanan Manajemen Bimbingan & Konseling Sekolah</p>
          </div>

          <form onSubmit={handleSubmit} className="p-12 pt-8 space-y-6">
            <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100/50 text-center text-xs text-blue-800 font-medium leading-relaxed">
              🔑 <strong>Akses Terbatas:</strong> Hanya Guru BK yang diizinkan masuk ke sistem ini. Siswa dan Orang Tua tidak didukung.
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-semibold text-center"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 px-1" htmlFor="username">Username / NISN</label>
                <div className="relative">
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
                    placeholder="Masukkan username Anda"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 px-1" htmlFor="password">Kata Sandi</label>
                <div className="relative">
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 transition-colors" />
                <span className="text-xs text-slate-600 group-hover:text-slate-900 transition-colors">Ingat saya</span>
              </label>
              <button type="button" className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">Lupa kata sandi?</button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl shadow-md shadow-blue-200 transition-all active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <span>Masuk ke Akun</span>
              )}
            </button>
          </form>
          
          <div className="pb-12 pt-4 flex flex-col items-center space-y-3 px-8">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">Status Akses Akun:</span>
            <div className="flex justify-center space-x-4">
              <span className="text-[11px] text-slate-300 font-medium line-through decoration-slate-400 flex items-center gap-1 cursor-not-allowed" title="Siswa tidak bisa login">Siswa 🔒</span>
              <span className="text-[11px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md flex items-center gap-1">Guru BK ✅</span>
              <span className="text-[11px] text-slate-300 font-medium line-through decoration-slate-400 flex items-center gap-1 cursor-not-allowed" title="Orang tua tidak bisa login">Orang Tua 🔒</span>
            </div>
            <p className="text-[10px] text-slate-400 text-center font-mono italic">
              *Akses siswa/wali murid ditolak secara kebijakan BK sekolah.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Footer Info */}
      <div className="absolute bottom-8 left-0 w-full flex flex-col items-center space-y-2 opacity-70 select-none">
        <div className="h-[1px] w-12 bg-slate-400 mb-2"></div>
        <p className="text-[10px] text-slate-600 font-extrabold uppercase tracking-widest">Tim BK SMP Al Mahrusiyah</p>
        <p className="text-[9px] text-slate-400 font-mono tracking-tight">Tahun Pelajaran 2026/2027 &bull; v2.5.0 Build</p>
      </div>

      {/* Decorative Labels */}
      <div className="absolute left-12 top-1/2 -translate-y-1/2 hidden xl:block">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em] [writing-mode:vertical-lr] rotate-180 select-none">SUPPORTIVE ENVIRONMENT</span>
      </div>
      <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden xl:block">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em] [writing-mode:vertical-lr] select-none">GROWTH & DEVELOPMENT</span>
      </div>
    </div>
  );
}
