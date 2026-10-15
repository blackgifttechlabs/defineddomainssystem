// Renumbers every student to DD001, DD002, ... in alphabetical order (last name, then first name).
// Also updates the student's email (ddNNN@defineddomain.org) and every record that references the old ID.
//
// Dry run (default):  node scripts/renumberStudentIds.mjs
// Apply:              ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/renumberStudentIds.mjs --apply
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAJleJuSyL7GvqpcvTsZNnVYRCMmqJNR8o",
  authDomain: "defineddomnain.firebaseapp.com",
  projectId: "defineddomnain",
  storageBucket: "defineddomnain.firebasestorage.app",
  messagingSenderId: "546744382707",
  appId: "1:546744382707:web:9d6f21fc8bf3f7b2a27386"
};

const apply = process.argv.includes('--apply');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Collections whose documents carry a `studentId` field pointing at students.id
const REFERENCING = ['parents', 'payments', 'orders', 'clinical_logs', 'milestone_records', 'notices'];

if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
  await signInWithEmailAndPassword(getAuth(app), process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
}

const key = (s) => {
  const last = (s.lastName || s.fullName?.split(' ').slice(-1)[0] || '').trim().toLowerCase();
  const first = (s.firstName || s.fullName?.split(' ')[0] || '').trim().toLowerCase();
  return [last, first];
};

const studentSnap = await getDocs(collection(db, 'students'));
const students = studentSnap.docs.map(d => ({ ref: d.ref, uid: d.id, data: d.data() }));
students.sort((a, b) => {
  const [al, af] = key(a.data), [bl, bf] = key(b.data);
  return al.localeCompare(bl) || af.localeCompare(bf) || a.uid.localeCompare(b.uid);
});

const idMap = new Map(); // oldId -> newId
const dupes = new Set();
students.forEach((s, i) => {
  s.newId = `DD${String(i + 1).padStart(3, '0')}`;
  s.newEmail = `${s.newId.toLowerCase()}@defineddomain.org`;
  if (idMap.has(s.data.id)) dupes.add(s.data.id);
  idMap.set(s.data.id, s.newId);
});
// An old ID shared by two students cannot be mapped safely: leave its references alone and report them
dupes.forEach(id => { idMap.delete(id); console.warn(`WARNING: old ID ${id} is used by more than one student; records referencing it are NOT updated.`); });

console.log(`${students.length} students:`);
students.forEach(s => console.log(`  ${s.data.id}  ->  ${s.newId}   ${s.data.fullName}`));

const updates = []; // { ref, patch }
for (const s of students) {
  updates.push({ ref: s.ref, patch: { id: s.newId, email: s.newEmail } });
  // users/{uid} mirrors the student's login email
  updates.push({ ref: doc(db, 'users', s.uid), patch: { email: s.newEmail }, optional: true });
}
for (const name of REFERENCING) {
  const snap = await getDocs(collection(db, name));
  let n = 0;
  snap.forEach(d => {
    const nid = idMap.get(d.data().studentId);
    if (nid && nid !== d.data().studentId) { updates.push({ ref: d.ref, patch: { studentId: nid } }); n++; }
  });
  console.log(`${name}: ${n} records reference a student`);
}

if (!apply) { console.log('\nDry run only. Re-run with --apply to write changes.'); process.exit(0); }

// Skip users/{uid} docs that do not exist
const existingUsers = new Set((await getDocs(collection(db, 'users'))).docs.map(d => d.id));
const toWrite = updates.filter(u => !u.optional || existingUsers.has(u.ref.id));
for (let i = 0; i < toWrite.length; i += 400) {
  const batch = writeBatch(db);
  toWrite.slice(i, i + 400).forEach(u => batch.update(u.ref, u.patch));
  await batch.commit();
}
console.log(`Done. ${toWrite.length} documents updated.`);
process.exit(0);
