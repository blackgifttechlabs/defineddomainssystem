
export type Role = 'SUPER_ADMIN' | 'SPECIALIST' | 'PARENT' | 'ADMIN_SUPPORT' | 'STUDENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  password?: string;
}

export const GENDER_OPTIONS = ['Male', 'Female', 'Other / Not specified'] as const;
export const AUTISM_TYPE_OPTIONS = [
  'Autism Spectrum Disorder (ASD)',
  'Level 1 (requiring support)',
  'Level 2 (requiring substantial support)',
  'Level 3 (requiring very substantial support)',
  "Asperger's Syndrome",
  'PDD-NOS',
  'Rett Syndrome',
  'Childhood Disintegrative Disorder',
  'Other / Not specified',
] as const;

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other / Not specified';
  autismType?: string;
  enrollmentDate: string;
  termEntry?: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  parentPassword?: string;
  homeAddress: string;
  diagnosis: string;
  diagnosisPdf?: string; // Base64 or URL for the PDF file
  medicalRecords: string;
  socialHistory: string;
  targetBehaviors: string;
  uniformSizes: string;
  assignedStaffId: string;
  assignedClass: string;
  imageUrl?: string;
  firebaseUid?: string;
  totalPaid?: number;
  email?: string;
  password?: string;
  idCardIssuedAt?: string;
  idCardExpiresAt?: string;
  idCardImageUrl?: string;
  idCardAcademicYear?: string;
  medicalAlerts?: MedicalAlerts;
  guardians?: Guardian[];
  authorisedPickups?: AuthorisedPickup[];
}

export interface StudentApplication {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: 'Male' | 'Female';
  address: string;
  guardianPhone: string;
  guardianEmail: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  adminReply?: string;
  timestamp: string;
}

export interface NoticeReply {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
}

export interface NoticeView {
  userId: string;
  userName: string;
  timestamp: string;
}

export type NoticeTarget = 'PARENT' | 'SPECIALIST' | 'ADMIN_SUPPORT' | 'ALL';
export type NoticeType = 'General' | 'Fees' | 'Meeting' | 'Record';

export interface Notice {
  id: string;
  title: string;
  content: string;
  type: NoticeType;
  target: NoticeTarget;
  authorId: string;
  authorName: string;
  timestamp: string;
  replies: NoticeReply[];
  views: NoticeView[];
  recipientUserId?: string;
  studentId?: string;
  recordType?: 'Lesson' | 'Assessment';
}

export interface PaymentRecord {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  method: string;
  timestamp: string;
  isMock: boolean;
  reference?: string;
  verificationHash: string;
  qrCodeUrl: string;
}

export interface MilestoneItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface MilestoneRecord {
  id: string;
  studentId: string;
  ageCategory: string;
  sections: {
    title: string;
    items: MilestoneItem[];
  }[];
  redFlags: MilestoneItem[];
  overallPercentage: number;
  timestamp: string;
  staffId: string;
}

export interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  studentId: string;
  studentFullName: string;
  firebaseUid: string;
  password?: string;
}

export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dob: string;
  nationalId?: string;
  passportNumber?: string;
  nationality: string;
  gender: 'Male' | 'Female';
  address: string;
  position: string; 
  email: string;
  phone: string;
  password?: string;
  role: Role;
  assignedClasses: string[];
  imageUrl?: string;
  firebaseUid?: string;
}

export interface Application {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  position: string;
  coverLetter: string;
  cvBase64?: string;
  cvName?: string;
  status: 'Pending' | 'Reviewed' | 'Shortlisted' | 'Rejected';
  timestamp: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  studentId: string;
  studentName: string;
  items: OrderItem[];
  total: number;
  paymentMethod: 'Visa-Mastercard' | 'Ecocash' | 'Omari';
  status: 'Uncollected' | 'Collected';
  timestamp: string;
}

export interface PositionEntry {
  name: string;
  active: boolean;
}

export interface SystemSettings {
  positions: PositionEntry[];
  classes: string[];
  feesAmount: number;
  currentTerm: string;
  nextTermStartDate?: string; // New: When the next term starts
  defaultTaskSteps?: string[]; // New: Template steps for task analysis
}

export type PromptLevel = '+' | 'FP' | 'PP' | 'DV' | 'IDV' | 'GP' | 'VP' | '-';

export interface TaskStep {
  id: string;
  description: string;
  trials: PromptLevel[];
  promptLevel?: PromptLevel;
}

export interface ProgramRequest {
  id: string;
  activity: string;
  echoicTempted: number;
  noVerbalTempted: number;
  noEchoicNoTempting: number;
}

export interface SessionLog {
  id: string;
  studentId: string;
  staffId: string;
  date: string;
  targetBehavior: string;
  method: 'Forward Chaining' | 'Backward Chaining' | 'Total Task';
  steps: TaskStep[];
  programRequests?: ProgramRequest[];
  independenceScore: number;
  goalPerHour?: number;
  actualHour?: number;
}

export interface ShopItem {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: 'Required' | 'Optional';
  imageUrl: string;
}

export interface SystemLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}

// ---- Daily-use features: attendance, medical alerts, pickup, incidents, medication ----
export interface MedicalAlerts {
  allergies?: string;
  seizures?: string;
  mobilityNeeds?: string;
  medication?: string;
  other?: string;
}

export interface Guardian {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isPrimary?: boolean;
}

export interface AuthorisedPickup {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  idNumber?: string;
  pickupCode?: string; // one-time code, cleared once used
  codeIssuedAt?: string;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Late';

export interface AttendanceRegister {
  id: string; // `${date}_${className}`
  date: string; // YYYY-MM-DD
  className: string;
  records: Record<string, AttendanceStatus>; // studentId -> status
  takenById: string;
  takenByName: string;
  timestamp: string;
}

export interface PickupLogEntry {
  id: string;
  studentId: string;
  studentName: string;
  pickupName: string;
  relationship: string;
  codeVerified: boolean;
  releasedById: string;
  releasedByName: string;
  timestamp: string;
}

export interface IncidentReport {
  id: string;
  studentId: string;
  studentName: string;
  kind: 'Incident' | 'Injury';
  severity: 'Minor' | 'Moderate' | 'Serious';
  description: string;
  actionTaken: string;
  parentNotified: boolean;
  reportedById: string;
  reportedByName: string;
  timestamp: string;
}

export interface MedicationLogEntry {
  id: string;
  studentId: string;
  studentName: string;
  medication: string;
  dose: string;
  notes?: string;
  givenById: string;
  givenByName: string;
  timestamp: string;
}

// ---- Planning & Reports (IEP, therapy scheduling, timetable) ----
export type IepGoalStatus = 'Not Started' | 'In Progress' | 'Achieved' | 'Discontinued';

export interface IepGoal {
  id: string;
  area: string;
  goal: string;
  strategies: string;
  reviewDate: string;
  status: IepGoalStatus;
}

export interface IepSignOff {
  name: string;
  role: 'PARENT' | 'THERAPIST' | 'TEACHER';
  signedAt: string;
}

export interface IepPlan {
  id: string;
  studentId: string;
  studentName: string;
  term: string;
  startDate: string;
  reviewDate: string;
  goals: IepGoal[];
  signOffs: IepSignOff[];
  createdBy: string;
  updatedAt: string;
}

export type TherapyType = 'Speech' | 'Occupational' | 'Physio' | 'Other';

export interface TherapySession {
  id: string;
  studentId: string;
  studentName: string;
  therapyType: TherapyType;
  therapistId: string;
  therapistName: string;
  date: string;
  time: string;
  durationMins: number;
  notes?: string;
  status: 'Booked' | 'Completed' | 'Cancelled';
  reminderSent?: boolean;
}

export interface TimetableSlot {
  id: string;
  className: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  startTime: string;
  endTime: string;
  subject: string;
  staffName?: string;
}

// ---- Communication & Operations ----
export interface ThreadMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
}

// Firestore: message_threads
export interface MessageThread {
  id: string;
  subject: string;
  studentId: string;
  studentName: string;
  parentUserId: string;
  parentName: string;
  staffUserId: string;
  staffName: string;
  messages: ThreadMessage[];
  lastMessageAt: string;
  readBy: string[]; // user ids that have seen the latest message
}

export interface TransportStop {
  id: string;
  name: string;
  time: string;
}

export interface TransportAssignment {
  studentId: string;
  stopId: string;
}

// Firestore: transport_routes
export interface TransportRoute {
  id: string;
  name: string;
  driverName: string;
  driverPhone: string;
  vehicleReg: string;
  capacity: number;
  stops: TransportStop[];
  assignments: TransportAssignment[];
}
