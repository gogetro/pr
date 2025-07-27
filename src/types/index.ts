// User and Authentication Types
export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  department: string;
  badgeNumber: string;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export type UserRole = 'investigator' | 'supervisor' | 'admin';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// Case Management Types
export interface Case {
  id: string;
  caseNumber: string;
  title: string;
  description: string;
  status: CaseStatus;
  priority: CasePriority;
  assignedOfficer: string;
  assignedOfficerName: string;
  createdAt: string;
  updatedAt: string;
  deadline?: string;
  location?: string;
  suspects?: Suspect[];
  evidence?: Evidence[];
  reports?: Report[];
  tags: string[];
}

export type CaseStatus = 'under_investigation' | 'report_submitted' | 'closed' | 'archived';
export type CasePriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Suspect {
  id: string;
  name: string;
  alias?: string;
  age?: number;
  description?: string;
  photo?: string;
  lastKnownAddress?: string;
  phoneNumbers?: string[];
  associatedCases: string[];
}

// Evidence Types
export interface Evidence {
  id: string;
  caseId: string;
  type: EvidenceType;
  title: string;
  description?: string;
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  uploadedBy: string;
  uploadedAt: string;
  analysisResults?: AnalysisResult[];
  tags: string[];
  chainOfCustody: ChainOfCustodyEntry[];
}

export type EvidenceType = 'image' | 'video' | 'audio' | 'document' | 'cdr' | 'financial' | 'social_media' | 'other';

export interface ChainOfCustodyEntry {
  id: string;
  officerId: string;
  officerName: string;
  action: string;
  timestamp: string;
  notes?: string;
}

// Analysis Types
export interface AnalysisResult {
  id: string;
  evidenceId: string;
  analysisType: AnalysisType;
  status: AnalysisStatus;
  results: any; // JSON data specific to analysis type
  confidence?: number;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export type AnalysisType = 'vision' | 'ner' | 'sentiment' | 'network' | 'timeline' | 'pattern_matching';
export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed';

// Vision Analysis Results
export interface VisionAnalysisResult {
  objects: DetectedObject[];
  faces: DetectedFace[];
  text: DetectedText[];
  licensePlates: DetectedLicensePlate[];
}

export interface DetectedObject {
  name: string;
  confidence: number;
  boundingBox: BoundingBox;
}

export interface DetectedFace {
  confidence: number;
  boundingBox: BoundingBox;
  emotions?: Emotion[];
}

export interface DetectedText {
  text: string;
  confidence: number;
  boundingBox: BoundingBox;
}

export interface DetectedLicensePlate {
  text: string;
  confidence: number;
  boundingBox: BoundingBox;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Emotion {
  type: string;
  confidence: number;
}

// NER Results
export interface NERResult {
  entities: NamedEntity[];
  relationships: EntityRelationship[];
}

export interface NamedEntity {
  text: string;
  label: string;
  start: number;
  end: number;
  confidence: number;
}

export interface EntityRelationship {
  source: string;
  target: string;
  relationship: string;
  confidence: number;
}

// CDR Analysis
export interface CDRRecord {
  id: string;
  phoneNumber: string;
  contactNumber: string;
  callType: 'incoming' | 'outgoing' | 'missed';
  duration: number;
  timestamp: string;
  location?: string;
  cellTower?: string;
}

export interface NetworkNode {
  id: string;
  label: string;
  type: 'phone' | 'person' | 'location';
  size: number;
  color: string;
}

export interface NetworkEdge {
  from: string;
  to: string;
  weight: number;
  label?: string;
}

// Interrogation Types
export interface InterrogationSession {
  id: string;
  caseId: string;
  suspectId?: string;
  officerId: string;
  startTime: string;
  endTime?: string;
  status: 'active' | 'paused' | 'completed';
  audioFile?: string;
  transcript?: string;
  formattedTranscript?: string;
  questions: Question[];
  notes?: string;
}

export interface Question {
  id: string;
  text: string;
  timestamp: string;
  suggestedBy: 'officer' | 'ai';
  category: string;
  confidence?: number;
}

export interface TranscriptSegment {
  speaker: string;
  text: string;
  timestamp: string;
  confidence: number;
}

// Report Types
export interface Report {
  id: string;
  caseId: string;
  type: ReportType;
  title: string;
  content: string;
  template: string;
  generatedBy: string;
  generatedAt: string;
  status: 'draft' | 'review' | 'approved' | 'published';
  reviewedBy?: string;
  reviewedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  digitalSignature?: string;
}

export type ReportType = 'initial_investigation' | 'evidence_summary' | 'final_report' | 'progress_update';

// Predictive Policing Types
export interface CrimeData {
  id: string;
  crimeType: string;
  latitude: number;
  longitude: number;
  date: string;
  time: string;
  severity: 'low' | 'medium' | 'high';
  description?: string;
  location: string;
}

export interface Hotspot {
  id: string;
  latitude: number;
  longitude: number;
  radius: number;
  intensity: number;
  crimeTypes: string[];
  riskLevel: 'low' | 'medium' | 'high';
  predictedCrimes: number;
  timePattern: string[];
}

// Knowledge Graph Types
export interface KnowledgeGraphNode {
  id: string;
  label: string;
  type: 'person' | 'organization' | 'location' | 'event' | 'object' | 'case';
  properties: Record<string, any>;
  caseIds: string[];
}

export interface KnowledgeGraphEdge {
  id: string;
  from: string;
  to: string;
  relationship: string;
  weight: number;
  properties: Record<string, any>;
  caseIds: string[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// File Upload Types
export interface FileUploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

// Dashboard Types
export interface DashboardStats {
  totalCases: number;
  activeCases: number;
  overdueCases: number;
  completedCases: number;
  totalEvidence: number;
  pendingAnalysis: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'case_created' | 'evidence_uploaded' | 'analysis_completed' | 'report_generated';
  description: string;
  timestamp: string;
  userId: string;
  userName: string;
  caseId?: string;
}

// Search and Filter Types
export interface SearchFilters {
  query?: string;
  caseStatus?: CaseStatus[];
  priority?: CasePriority[];
  assignedOfficer?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  tags?: string[];
  evidenceType?: EvidenceType[];
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

// System Configuration Types
export interface SystemConfig {
  maxFileSize: number;
  supportedFileTypes: string[];
  apiKeys: {
    googleCloud?: string;
    gemini?: string;
    googleSheets?: string;
  };
  features: {
    visionAnalysis: boolean;
    speechToText: boolean;
    predictivePolicing: boolean;
    knowledgeGraph: boolean;
  };
}

// Audit Log Types
export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}