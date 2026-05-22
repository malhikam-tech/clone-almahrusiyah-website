import React, { useState, useEffect } from "react";
import { 
  LogOut, 
  LayoutDashboard, 
  Users, 
  AlertTriangle, 
  Settings, 
  Search, 
  Bell, 
  GraduationCap, 
  ClipboardCheck, 
  NotebookPen,
  MessageSquare,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Student, PointHistory, NeedAssessment, StudentClass, CounselingLog, ViolationType } from "../types";
import { 
  DEFAULT_STUDENTS, 
  DEFAULT_POINT_HISTORY, 
  DEFAULT_ASSESSMENTS,
  DEFAULT_COUNSELING_LOGS,
  DEFAULT_VIOLATION_TYPES
} from "../data/mockData";
import { 
  fetchCollectionData, 
  saveDocumentData, 
  deleteDocumentData,
  initializeAnonymousSession
} from "../lib/firebase";

// Modular Subviews
import HomeOverview from "../components/HomeOverview";
import StudentDataView from "../components/StudentDataView";
import ViolationPointView from "../components/ViolationPointView";
import AssessmentNeedsView from "../components/AssessmentNeedsView";
import CounselingLogsView from "../components/CounselingLogsView";
import EvaluationReportView from "../components/EvaluationReportView";
import SettingsView from "../components/SettingsView";

interface DashboardProps {
  user: { name: string; role: string };
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<string>("home");

  // State
  const [students, setStudents] = useState<Student[]>([]);
  const [history, setHistory] = useState<PointHistory[]>([]);
  const [assessments, setAssessments] = useState<NeedAssessment[]>([]);
  const [counselingLogs, setCounselingLogs] = useState<CounselingLog[]>([]);
  const [counselors, setCounselors] = useState<string[]>([]);
  const [principalName, setPrincipalName] = useState<string>("Abdul Latif, M.Pd.");
  const [wakaKesiswaanName, setWakaKesiswaanName] = useState<string>("Ahmad Shidiq, S.Pd.");
  const [violationTypes, setViolationTypes] = useState<ViolationType[]>([]);
  const [loadingFirebase, setLoadingFirebase] = useState<boolean>(true);

  // Load from local storage for instantaneous initial paint
  useEffect(() => {
    const savedStudents = localStorage.getItem("bk_students");
    const savedHistory = localStorage.getItem("bk_history");
    const savedAssessments = localStorage.getItem("bk_assessments");
    const savedLogs = localStorage.getItem("bk_counseling_logs");
    const savedCounselors = localStorage.getItem("bk_counselors");
    const savedPrincipal = localStorage.getItem("bk_principal_name");
    const savedWaka = localStorage.getItem("bk_waka_kesiswaan_name");
    const savedViolationTypes = localStorage.getItem("bk_violation_types");

    if (savedStudents) setStudents(JSON.parse(savedStudents));
    else setStudents(DEFAULT_STUDENTS);

    if (savedHistory) setHistory(JSON.parse(savedHistory));
    else setHistory(DEFAULT_POINT_HISTORY);

    if (savedAssessments) setAssessments(JSON.parse(savedAssessments));
    else setAssessments(DEFAULT_ASSESSMENTS);

    if (savedLogs) setCounselingLogs(JSON.parse(savedLogs));
    else setCounselingLogs(DEFAULT_COUNSELING_LOGS);

    if (savedCounselors) setCounselors(JSON.parse(savedCounselors));
    else setCounselors(["ARIEF AZIZY, S.Psi.", "ELI SETYOWATI, S.Pd.", "Annisatul Qusna, S.Psi.", "Yessi Ermawati, S.Sos.", "WILDAN MUBAROK, S.Psi."]);

    if (savedPrincipal) setPrincipalName(savedPrincipal);
    if (savedWaka) setWakaKesiswaanName(savedWaka);

    if (savedViolationTypes) setViolationTypes(JSON.parse(savedViolationTypes));
    else setViolationTypes(DEFAULT_VIOLATION_TYPES);
  }, []);

  // Firebase Auto Sync & Backfill Empty DB on Launch
  useEffect(() => {
    const syncFirestore = async () => {
      try {
        await initializeAnonymousSession();

        // 1. Students Sync
        const cloudStudents = (await fetchCollectionData("students")) as Student[];
        if (cloudStudents.length > 0) {
          setStudents(cloudStudents);
          localStorage.setItem("bk_students", JSON.stringify(cloudStudents));
        } else {
          const currentStudents = students.length > 0 ? students : DEFAULT_STUDENTS;
          for (const s of currentStudents) {
            await saveDocumentData("students", s);
          }
        }

        // 2. Point History Sync
        const cloudHistory = (await fetchCollectionData("pointHistory")) as PointHistory[];
        if (cloudHistory.length > 0) {
          setHistory(cloudHistory);
          localStorage.setItem("bk_history", JSON.stringify(cloudHistory));
        } else {
          const currentHistory = history.length > 0 ? history : DEFAULT_POINT_HISTORY;
          for (const h of currentHistory) {
            await saveDocumentData("pointHistory", h);
          }
        }

        // 3. Need Assessments Sync
        const cloudAssessments = (await fetchCollectionData("needAssessments")) as NeedAssessment[];
        if (cloudAssessments.length > 0) {
          setAssessments(cloudAssessments);
          localStorage.setItem("bk_assessments", JSON.stringify(cloudAssessments));
        } else {
          const currentAssessments = assessments.length > 0 ? assessments : DEFAULT_ASSESSMENTS;
          for (const a of currentAssessments) {
            await saveDocumentData("needAssessments", a);
          }
        }

        // 4. Counseling Logs Sync
        const cloudLogs = (await fetchCollectionData("counselingLogs")) as CounselingLog[];
        if (cloudLogs.length > 0) {
          setCounselingLogs(cloudLogs);
          localStorage.setItem("bk_counseling_logs", JSON.stringify(cloudLogs));
        } else {
          const currentLogs = counselingLogs.length > 0 ? counselingLogs : DEFAULT_COUNSELING_LOGS;
          for (const l of currentLogs) {
            await saveDocumentData("counselingLogs", l);
          }
        }

        // 5. Violation Types Sync
        const cloudViolationTypes = (await fetchCollectionData("violationTypes")) as ViolationType[];
        if (cloudViolationTypes.length > 0) {
          setViolationTypes(cloudViolationTypes);
          localStorage.setItem("bk_violation_types", JSON.stringify(cloudViolationTypes));
        } else {
          const currentViolationTypes = violationTypes.length > 0 ? violationTypes : DEFAULT_VIOLATION_TYPES;
          for (const v of currentViolationTypes) {
            await saveDocumentData("violationTypes", v);
          }
        }

        // 6. Config Settings Sync
        const cloudSettings = (await fetchCollectionData("systemSettings")) as any[];
        const configDoc = cloudSettings.find((s: any) => s.id === "config");
        if (configDoc) {
          setCounselors(configDoc.counselors);
          localStorage.setItem("bk_counselors", JSON.stringify(configDoc.counselors));
          setPrincipalName(configDoc.principalName);
          localStorage.setItem("bk_principal_name", configDoc.principalName);
          setWakaKesiswaanName(configDoc.wakaKesiswaanName);
          localStorage.setItem("bk_waka_kesiswaan_name", configDoc.wakaKesiswaanName);
        } else {
          const counselorsList = counselors.length > 0 ? counselors : ["ARIEF AZIZY, S.Psi.", "ELI SETYOWATI, S.Pd.", "Annisatul Qusna, S.Psi.", "Yessi Ermawati, S.Sos.", "WILDAN MUBAROK, S.Psi."];
          const syncConfig = {
            id: "config",
            counselors: counselorsList,
            principalName: principalName,
            wakaKesiswaanName: wakaKesiswaanName
          };
          await saveDocumentData("systemSettings", syncConfig);
        }
      } catch (err) {
        console.error("Firebase Sync Error on mount:", err);
      } finally {
        setLoadingFirebase(false);
      }
    };

    syncFirestore();
  }, []);;

  // Sync helpers
  const saveStudentsToLocal = (newStudents: Student[]) => {
    setStudents(newStudents);
    localStorage.setItem("bk_students", JSON.stringify(newStudents));
  };

  const saveHistoryToLocal = (newHistory: PointHistory[]) => {
    setHistory(newHistory);
    localStorage.setItem("bk_history", JSON.stringify(newHistory));
  };

  const saveAssessmentsToLocal = (newAssessments: NeedAssessment[]) => {
    setAssessments(newAssessments);
    localStorage.setItem("bk_assessments", JSON.stringify(newAssessments));
  };

  const saveCounselingLogsToLocal = (newLogs: CounselingLog[]) => {
    setCounselingLogs(newLogs);
    localStorage.setItem("bk_counseling_logs", JSON.stringify(newLogs));
  };

  const saveCounselorsToLocal = (newCounselors: string[]) => {
    setCounselors(newCounselors);
    localStorage.setItem("bk_counselors", JSON.stringify(newCounselors));
    saveDocumentData("systemSettings", {
      id: "config",
      counselors: newCounselors,
      principalName,
      wakaKesiswaanName
    });
  };

  const savePrincipalToLocal = (newName: string) => {
    setPrincipalName(newName);
    localStorage.setItem("bk_principal_name", newName);
    saveDocumentData("systemSettings", {
      id: "config",
      counselors,
      principalName: newName,
      wakaKesiswaanName
    });
  };

  const saveWakaToLocal = (newName: string) => {
    setWakaKesiswaanName(newName);
    localStorage.setItem("bk_waka_kesiswaan_name", newName);
    saveDocumentData("systemSettings", {
      id: "config",
      counselors,
      principalName,
      wakaKesiswaanName: newName
    });
  };

  const saveViolationTypesToLocal = async (newViolationTypes: ViolationType[]) => {
    // Find deleted ones and remove from Cloud
    const removed = violationTypes.filter(v => !newViolationTypes.some(nv => nv.id === v.id));
    for (const r of removed) {
      await deleteDocumentData("violationTypes", r.id);
    }
    setViolationTypes(newViolationTypes);
    localStorage.setItem("bk_violation_types", JSON.stringify(newViolationTypes));
    for (const vt of newViolationTypes) {
      await saveDocumentData("violationTypes", vt);
    }
  };

  // Student CRUD operations
  const handleAddStudent = (student: Student) => {
    const updated = [student, ...students];
    saveStudentsToLocal(updated);
    saveDocumentData("students", student);
  };

  const handleBulkAddStudents = (newStudents: Student[]) => {
    const updated = [...newStudents, ...students];
    saveStudentsToLocal(updated);
    for (const s of newStudents) {
      saveDocumentData("students", s);
    }
  };

  const handleDeleteStudent = (id: string) => {
    const updated = students.filter(s => s.id !== id);
    saveStudentsToLocal(updated);
    deleteDocumentData("students", id);

    // Cascade local history
    const updatedHistory = history.filter(h => h.studentId !== id);
    saveHistoryToLocal(updatedHistory);
    const itemsToDeleteHist = history.filter(h => h.studentId === id);
    for (const h of itemsToDeleteHist) {
      deleteDocumentData("pointHistory", h.id);
    }

    // Cascade local assessments
    const updatedAssessments = assessments.filter(a => a.studentId !== id);
    saveAssessmentsToLocal(updatedAssessments);
    const itemsToDeleteAssess = assessments.filter(a => a.studentId === id);
    for (const a of itemsToDeleteAssess) {
      deleteDocumentData("needAssessments", a.id);
    }

    // Cascade local logs
    const updatedLogs = counselingLogs.filter(l => l.studentId !== id);
    saveCounselingLogsToLocal(updatedLogs);
    const itemsToDeleteLogs = counselingLogs.filter(l => l.studentId === id);
    for (const l of itemsToDeleteLogs) {
      deleteDocumentData("counselingLogs", l.id);
    }
  };

  const handleEditStudent = (updatedStudent: Student) => {
    const updated = students.map(s => s.id === updatedStudent.id ? updatedStudent : s);
    saveStudentsToLocal(updated);
    saveDocumentData("students", updatedStudent);
  };

  const handleUpdateStudentPoints = (studentId: string, newPoints: number) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      const updatedStudent = { ...student, points: newPoints };
      const updated = students.map(s => s.id === studentId ? updatedStudent : s);
      saveStudentsToLocal(updated);
      saveDocumentData("students", updatedStudent);
    }
  };

  const handleBulkUpdatePointsAndHistory = (updates: { studentId: string; pointsChanged: number; description: string; date: string }[]) => {
    let updatedStudents = [...students];
    let updatedHistory = [...history];

    updates.forEach(up => {
      const studentIdx = updatedStudents.findIndex(s => s.id === up.studentId);
      if (studentIdx !== -1) {
        const oldPoints = updatedStudents[studentIdx].points;
        const newPoints = Math.max(0, oldPoints + up.pointsChanged);
        const updatedStudent = {
          ...updatedStudents[studentIdx],
          points: newPoints
        };
        updatedStudents[studentIdx] = updatedStudent;
        saveDocumentData("students", updatedStudent);

        const newHistoryId = `h-excel-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        const historyEntry = {
          id: newHistoryId,
          studentId: up.studentId,
          type: (up.pointsChanged >= 0 ? "VIOLATION" : "REWARD") as any,
          description: up.description,
          pointsChanged: up.pointsChanged,
          date: up.date
        };
        updatedHistory.unshift(historyEntry);
        saveDocumentData("pointHistory", historyEntry);
      }
    });

    saveStudentsToLocal(updatedStudents);
    saveHistoryToLocal(updatedHistory);
  };

  // History operations
  const handleAddHistory = (item: PointHistory) => {
    const updated = [item, ...history];
    saveHistoryToLocal(updated);
    saveDocumentData("pointHistory", item);

    const student = students.find(s => s.id === item.studentId);
    if (student) {
      const updatedPoints = Math.max(0, student.points + item.pointsChanged);
      handleUpdateStudentPoints(item.studentId, updatedPoints);
    }
  };

  // Assessment operations
  const handleAddAssessment = (item: NeedAssessment) => {
    const updated = [item, ...assessments];
    saveAssessmentsToLocal(updated);
    saveDocumentData("needAssessments", item);
  };

  // Counseling Log operations
  const handleAddCounselingLog = (item: CounselingLog) => {
    const updated = [item, ...counselingLogs];
    saveCounselingLogsToLocal(updated);
    saveDocumentData("counselingLogs", item);
  };

  const handleEditCounselingLog = (updatedLog: CounselingLog) => {
    const updated = counselingLogs.map(l => l.id === updatedLog.id ? updatedLog : l);
    saveCounselingLogsToLocal(updated);
    saveDocumentData("counselingLogs", updatedLog);
  };

  const handleDeleteCounselingLog = (id: string) => {
    const updated = counselingLogs.filter(l => l.id !== id);
    saveCounselingLogsToLocal(updated);
    deleteDocumentData("counselingLogs", id);
  };

  const handleDeleteAssessment = (id: string) => {
    const updated = assessments.filter(a => a.id !== id);
    saveAssessmentsToLocal(updated);
    deleteDocumentData("needAssessments", id);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 relative overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-72 bg-gradient-to-b from-blue-900 via-indigo-950 to-slate-950 text-white flex flex-col hidden md:flex z-10 select-none shadow-xl border-r border-blue-950">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shadow-lg transition-transform hover:scale-105">
              <GraduationCap size={24} className="text-blue-300" />
            </div>
            <div>
              <h1 className="text-base font-black font-sans tracking-tight text-white leading-none">SIM-BK</h1>
              <p className="text-[9px] text-blue-300 font-extrabold tracking-wider mt-1 uppercase">SMP AL MAHRUSIYAH</p>
            </div>
          </div>

          <nav className="space-y-2 font-sans text-slate-100">
            <button 
              onClick={() => setActiveTab("home")}
              className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all duration-200 text-left border cursor-pointer ${
                activeTab === "home" 
                  ? "bg-blue-600/90 hover:bg-blue-600 font-bold border-blue-400 text-white shadow-xl shadow-blue-900/40 translate-x-1" 
                  : "border-transparent text-slate-300/90 hover:bg-white/10 hover:text-white"
              }`}
            >
              <LayoutDashboard size={20} className={activeTab === "home" ? "text-white" : "text-slate-400"} />
              <span className="text-sm">Beranda</span>
            </button>

            <button 
              onClick={() => setActiveTab("students")}
              className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all duration-200 text-left border cursor-pointer ${
                activeTab === "students" 
                  ? "bg-blue-600/90 hover:bg-blue-600 font-bold border-blue-400 text-white shadow-xl shadow-blue-900/40 translate-x-1" 
                  : "border-transparent text-slate-300/90 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Users size={20} className={activeTab === "students" ? "text-white" : "text-slate-400"} />
              <span className="text-sm">Data Siswa</span>
            </button>

            <button 
              onClick={() => setActiveTab("points")}
              className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all duration-200 text-left border cursor-pointer ${
                activeTab === "points" 
                  ? "bg-blue-600/90 hover:bg-blue-600 font-bold border-blue-400 text-white shadow-xl shadow-blue-900/40 translate-x-1" 
                  : "border-transparent text-slate-300/90 hover:bg-white/10 hover:text-white"
              }`}
            >
              <AlertTriangle size={20} className={activeTab === "points" ? "text-white" : "text-slate-400"} />
              <span className="text-sm">Poin Pelanggaran</span>
            </button>

            <button 
              onClick={() => setActiveTab("assessments")}
              className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all duration-200 text-left border cursor-pointer ${
                activeTab === "assessments" 
                  ? "bg-blue-600/90 hover:bg-blue-600 font-bold border-blue-400 text-white shadow-xl shadow-blue-900/40 translate-x-1" 
                  : "border-transparent text-slate-300/90 hover:bg-white/10 hover:text-white"
              }`}
            >
              <ClipboardCheck size={20} className={activeTab === "assessments" ? "text-white" : "text-slate-400"} />
              <span className="text-sm">Asesmen Kebutuhan</span>
            </button>

            <button 
              onClick={() => setActiveTab("counseling")}
              className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all duration-200 text-left border cursor-pointer ${
                activeTab === "counseling" 
                  ? "bg-blue-600/90 hover:bg-blue-600 font-bold border-blue-400 text-white shadow-xl shadow-blue-900/40 translate-x-1" 
                  : "border-transparent text-slate-300/90 hover:bg-white/10 hover:text-white"
              }`}
            >
              <MessageSquare size={20} className={activeTab === "counseling" ? "text-white" : "text-slate-400"} />
              <span className="text-sm">Layanan Konseling</span>
            </button>

            <button 
              onClick={() => setActiveTab("reports")}
              className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all duration-200 text-left border cursor-pointer ${
                activeTab === "reports" 
                  ? "bg-blue-600/90 hover:bg-blue-600 font-bold border-blue-400 text-white shadow-xl shadow-blue-900/40 translate-x-1" 
                  : "border-transparent text-slate-300/90 hover:bg-white/10 hover:text-white"
              }`}
            >
              <FileText size={20} className={activeTab === "reports" ? "text-white" : "text-slate-400"} />
              <span className="text-sm">Laporan & Evaluasi</span>
            </button>

            <button 
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all duration-200 text-left border cursor-pointer ${
                activeTab === "settings" 
                  ? "bg-blue-600/90 hover:bg-blue-600 font-bold border-blue-400 text-white shadow-xl shadow-blue-900/40 translate-x-1" 
                  : "border-transparent text-slate-300/90 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Settings size={20} className={activeTab === "settings" ? "text-white" : "text-slate-400"} />
              <span className="text-sm">Pengaturan SIM-BK</span>
            </button>
          </nav>
        </div>

        <div className="mt-auto p-8 pt-0">
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 text-slate-400 hover:text-white transition-all w-full p-3.5 rounded-xl hover:bg-white/10 group border border-dashed border-transparent hover:border-white/30 cursor-pointer text-left"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform text-slate-400 group-hover:text-white" />
            <span className="font-semibold text-sm">Kelur Sistem BK</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 z-10 h-screen overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 select-none flex-shrink-0">
          <div>
            <span className="text-[10px] text-blue-600 font-extrabold tracking-widest uppercase">Admin Panel Bimbingan</span>
            <h2 className="text-base font-extrabold text-slate-800 leading-tight">SIM-BK SMP AL MAHRUSIYAH LIRBOYO KEDIRI</h2>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3.5 pl-6">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-950">{user.name}</p>
                <span className="text-[9px] bg-blue-50 text-blue-700 font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                  {user.role}
                </span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-100 overflow-hidden select-none">
                BK
              </div>
            </div>
            
            <button 
              onClick={onLogout}
              className="p-2 border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors md:hidden"
              title="Keluar"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8 overflow-y-auto flex-1 bg-slate-50/50">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto pb-12"
            >
              {activeTab === "home" && (
                <HomeOverview 
                  students={students} 
                  history={history} 
                  onNavigate={setActiveTab} 
                />
              )}

              {activeTab === "students" && (
                <StudentDataView
                  students={students}
                  onAddStudent={handleAddStudent}
                  onBulkAddStudents={handleBulkAddStudents}
                  onDeleteStudent={handleDeleteStudent}
                  onEditStudent={handleEditStudent}
                />
              )}

              {activeTab === "points" && (
                <ViolationPointView
                  students={students}
                  history={history}
                  onAddHistory={handleAddHistory}
                  onUpdateStudentPoints={handleUpdateStudentPoints}
                  onBulkUpdatePointsAndHistory={handleBulkUpdatePointsAndHistory}
                  violationTypes={violationTypes}
                />
              )}

              {activeTab === "assessments" && (
                <AssessmentNeedsView
                  students={students}
                  assessments={assessments}
                  onAddAssessment={handleAddAssessment}
                  onDeleteAssessment={handleDeleteAssessment}
                />
              )}

              {activeTab === "counseling" && (
                <CounselingLogsView
                  students={students}
                  logs={counselingLogs}
                  onAddLog={handleAddCounselingLog}
                  onDeleteLog={handleDeleteCounselingLog}
                  onEditLog={handleEditCounselingLog}
                  counselors={counselors}
                />
              )}

              {activeTab === "reports" && (
                <EvaluationReportView
                  students={students}
                  history={history}
                  assessments={assessments}
                  logs={counselingLogs}
                  counselors={counselors}
                  principalName={principalName}
                  wakaKesiswaanName={wakaKesiswaanName}
                />
              )}

              {activeTab === "settings" && (
                <SettingsView
                  counselors={counselors}
                  principalName={principalName}
                  wakaKesiswaanName={wakaKesiswaanName}
                  violationTypes={violationTypes}
                  onUpdateCounselors={saveCounselorsToLocal}
                  onUpdatePrincipal={savePrincipalToLocal}
                  onUpdateWaka={saveWakaToLocal}
                  onUpdateViolationTypes={saveViolationTypesToLocal}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none z-0 select-none">
        <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-blue-50 rounded-full blur-[120px] opacity-20"></div>
        <div className="absolute bottom-5 left-5 w-[400px] h-[400px] bg-sky-50 rounded-full blur-[100px] opacity-15"></div>
      </div>
    </div>
  );
}
