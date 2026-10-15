import { create } from 'zustand';
import { getApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, query, orderBy, limit, addDoc, setDoc, doc } from 'firebase/firestore';
import { useStore } from './useStore';
import { AttendanceRegister, AttendanceStatus, IncidentReport, MedicationLogEntry, PickupLogEntry } from '../types';

// Daily-use data (attendance, incidents, medication, pickup log). Kept separate from
// useStore.ts so parallel feature branches do not conflict. Uses the same default Firebase app.
const db = () => getFirestore(getApp());

interface DailyState {
  attendance: AttendanceRegister[];
  incidents: IncidentReport[];
  medicationLogs: MedicationLogEntry[];
  pickupLogs: PickupLogEntry[];
  started: boolean;
  start: () => void;
  saveAttendance: (date: string, className: string, records: Record<string, AttendanceStatus>) => Promise<void>;
  addIncident: (r: Omit<IncidentReport, 'id' | 'timestamp' | 'reportedById' | 'reportedByName'>) => Promise<void>;
  addMedicationLog: (r: Omit<MedicationLogEntry, 'id' | 'timestamp' | 'givenById' | 'givenByName'>) => Promise<void>;
  addPickupLog: (r: Omit<PickupLogEntry, 'id' | 'timestamp' | 'releasedById' | 'releasedByName'>) => Promise<void>;
}

const who = () => {
  const u = useStore.getState().user;
  return { id: u?.id || 'unknown', name: u?.name || 'Staff' };
};

// Parent notice via the existing `notices` collection (same shape addClinicalLog uses).
const noticeParent = async (studentId: string, title: string, content: string) => {
  const { students, parents, user } = useStore.getState();
  const student = students.find(s => s.id === studentId);
  const parent = parents.find(p => p.studentId === studentId);
  if (!student || !parent) return false;
  await addDoc(collection(db(), 'notices'), {
    title, content, type: 'Record', target: 'PARENT',
    recipientUserId: parent.firebaseUid || parent.id,
    studentId: student.id,
    authorId: user?.id || 'system', authorName: user?.name || 'School team',
    timestamp: new Date().toISOString(), replies: [], views: []
  });
  return true;
};

export const useDailyStore = create<DailyState>((set, get) => {
  const sub = (name: string, key: string, field: string, n: number) =>
    onSnapshot(query(collection(db(), name), orderBy(field, 'desc'), limit(n)),
      snap => set({ [key]: snap.docs.map(d => ({ ...d.data(), id: d.id })) } as any),
      err => console.error(name, err));
  return {
    attendance: [], incidents: [], medicationLogs: [], pickupLogs: [], started: false,
    start: () => {
      if (get().started) return;
      set({ started: true });
      sub('attendance', 'attendance', 'date', 500);
      sub('incident_reports', 'incidents', 'timestamp', 300);
      sub('medication_logs', 'medicationLogs', 'timestamp', 500);
      sub('pickup_logs', 'pickupLogs', 'timestamp', 300);
    },
    saveAttendance: async (date, className, records) => {
      const w = who();
      try {
        const id = `${date}_${className}`.replace(/[\/\s]+/g, '-');
        await setDoc(doc(db(), 'attendance', id), { date, className, records, takenById: w.id, takenByName: w.name, timestamp: new Date().toISOString() });
        useStore.getState().notify('success', 'Attendance saved.');
      } catch (e: any) { useStore.getState().notify('error', e.message); }
    },
    addIncident: async (r) => {
      const w = who();
      try {
        await addDoc(collection(db(), 'incident_reports'), { ...r, reportedById: w.id, reportedByName: w.name, timestamp: new Date().toISOString() });
        if (r.parentNotified) {
          await noticeParent(r.studentId, `${r.kind} report for ${r.studentName}`,
            `${r.severity} ${r.kind.toLowerCase()}: ${r.description}. Action taken: ${r.actionTaken || 'None recorded'}. Reported by ${w.name}.`);
        }
        useStore.getState().notify('success', 'Report saved.');
      } catch (e: any) { useStore.getState().notify('error', e.message); }
    },
    addMedicationLog: async (r) => {
      const w = who();
      try {
        await addDoc(collection(db(), 'medication_logs'), { ...r, givenById: w.id, givenByName: w.name, timestamp: new Date().toISOString() });
        await noticeParent(r.studentId, `Medication given to ${r.studentName}`,
          `${w.name} gave ${r.medication} (${r.dose}) to ${r.studentName} at ${new Date().toLocaleTimeString()}.${r.notes ? ' Note: ' + r.notes : ''}`);
        useStore.getState().notify('success', 'Medication logged.');
      } catch (e: any) { useStore.getState().notify('error', e.message); }
    },
    addPickupLog: async (r) => {
      const w = who();
      try {
        await addDoc(collection(db(), 'pickup_logs'), { ...r, releasedById: w.id, releasedByName: w.name, timestamp: new Date().toISOString() });
      } catch (e: any) { useStore.getState().notify('error', e.message); }
    },
  };
});
