import React from 'react';
import { createRoot } from 'react-dom/client';
import { exportIdentityCard } from '../utils/exportIdentityCard';
import { IdCardManagement } from '../components/admin/IdCardManagement';
import { useStore } from '../store/useStore';
import { IdentityCard } from '../components/common/IdentityCard';
import '../index.css';
const name = new URLSearchParams(location.search).get('name') || 'Anotidashe Chipendo';
const student = { idCardIssuedAt: '2026-09-01T00:00:00.000Z', idCardExpiresAt: '2028-09-01T00:00:00.000Z', idCardAcademicYear: '2026', firebaseUid: 'export-test-student', id: 'DD042', fullName: name, assignedClass: 'Class A', parentName: 'Sample Guardian With A Longer Name', parentPhone: '+263 770 000 000' } as any;
useStore.setState({ students: [student], updateStudent: async () => { throw new Error('Unexpected write during export test'); } });
createRoot(document.getElementById('root')!).render(new URLSearchParams(location.search).has('admin') ? <IdCardManagement /> : <IdentityCard student={student} showingBack={new URLSearchParams(location.search).has('back')} qrDataUrl="" forceStatic />);
(window as any).capture = async () => {
  await document.fonts.ready;
  return (await exportIdentityCard(document.querySelector('#root > div') as HTMLElement)).toDataURL('image/png');
};
