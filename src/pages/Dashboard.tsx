import React, { useState, useEffect } from 'react';
import {
  FolderIcon,
  DocumentMagnifyingGlassIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  UserGroupIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { DashboardStats, ActivityItem, Case } from '../types';
import LoadingSpinner from '../components/Common/LoadingSpinner';

// Mock data - in real app, fetch from API
const mockStats: DashboardStats = {
  totalCases: 156,
  activeCases: 42,
  overdueCases: 8,
  completedCases: 98,
  totalEvidence: 324,
  pendingAnalysis: 15,
  recentActivity: [
    {
      id: '1',
      type: 'case_created',
      description: 'สร้างคดีใหม่ #2024-045 - คดีโจรกรรมรถยนต์',
      timestamp: new Date().toISOString(),
      userId: '1',
      userName: 'นาย สมชาย ใจดี',
      caseId: '2024-045',
    },
    {
      id: '2',
      type: 'evidence_uploaded',
      description: 'อัปโหลดหลักฐาน CCTV สำหรับคดี #2024-044',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      userId: '2',
      userName: 'นาง สุดา รักดี',
      caseId: '2024-044',
    },
    {
      id: '3',
      type: 'analysis_completed',
      description: 'การวิเคราะห์ใบหน้าเสร็จสิ้นแล้ว - พบผู้ต้องสงสัย 2 คน',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      userId: '3',
      userName: 'นาย วิชัย สมบูรณ์',
      caseId: '2024-043',
    },
    {
      id: '4',
      type: 'report_generated',
      description: 'สร้างรายงานสรุปคดี #2024-042',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      userId: '1',
      userName: 'นาย สมชาย ใจดี',
      caseId: '2024-042',
    },
  ],
};

const mockRecentCases: Case[] = [
  {
    id: '1',
    caseNumber: '2024-045',
    title: 'คดีโจรกรรมรถยนต์ BMW',
    description: 'รถยนต์ BMW สีดำ ถูกขโมยจากลานจอดรถห้างสรรพสินค้า',
    status: 'under_investigation',
    priority: 'high',
    assignedOfficer: '1',
    assignedOfficerName: 'นาย สมชาย ใจดี',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'ห้างสรรพสินค้าเซ็นทรัลเวิลด์',
    tags: ['โจรกรรม', 'รถยนต์', 'CCTV'],
  },
  {
    id: '2',
    caseNumber: '2024-044',
    title: 'คดีฉ้อโกงออนไลน์',
    description: 'การฉ้อโกงผ่านแอปพลิเคชันซื้อขายออนไลน์',
    status: 'report_submitted',
    priority: 'medium',
    assignedOfficer: '2',
    assignedOfficerName: 'นาง สุดา รักดี',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'ออนไลน์',
    tags: ['ฉ้อโกง', 'ออนไลน์', 'การเงิน'],
  },
  {
    id: '3',
    caseNumber: '2024-043',
    title: 'คดีลักทรัพย์ในบ้าน',
    description: 'บุกเข้าบ้านและขโมยทรัพย์สิน',
    status: 'closed',
    priority: 'medium',
    assignedOfficer: '3',
    assignedOfficerName: 'นาย วิชัย สมบูรณ์',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'บ้านเลขที่ 123 ถนนสุขุมวิท',
    tags: ['ลักทรัพย์', 'บุกรุก', 'ที่พักอาศัย'],
  },
];

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentCases, setRecentCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // In real app, make API calls here
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStats(mockStats);
        setRecentCases(mockRecentCases);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'under_investigation':
        return 'bg-yellow-100 text-yellow-800';
      case 'report_submitted':
        return 'bg-blue-100 text-blue-800';
      case 'closed':
        return 'bg-green-100 text-green-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'under_investigation':
        return 'กำลังสืบสวน';
      case 'report_submitted':
        return 'ส่งรายงานแล้ว';
      case 'closed':
        return 'ปิดคดี';
      case 'archived':
        return 'เก็บถาวร';
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'เมื่อสักครู่';
    if (diffInMinutes < 60) return `${diffInMinutes} นาทีที่แล้ว`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ชั่วโมงที่แล้ว`;
    return `${Math.floor(diffInMinutes / 1440)} วันที่แล้ว`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'case_created':
        return FolderIcon;
      case 'evidence_uploaded':
        return DocumentMagnifyingGlassIcon;
      case 'analysis_completed':
        return ChartBarIcon;
      case 'report_generated':
        return DocumentTextIcon;
      default:
        return FolderIcon;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="กำลังโหลดข้อมูล..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              ยินดีต้อนรับ, {user?.fullName}
            </h1>
            <p className="text-gray-600 mt-1">
              {user?.role === 'admin' && 'ผู้ดูแลระบบ'}
              {user?.role === 'supervisor' && 'หัวหน้างาน'}
              {user?.role === 'investigator' && 'นักสืบ'}
              {' • '}
              {user?.department}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">วันที่</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date().toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FolderIcon className="h-8 w-8 text-police-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">คดีทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCases}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">กำลังสืบสวน</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeCases}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">เกินกำหนด</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overdueCases}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">ปิดคดีแล้ว</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedCases}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Cases */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">คดีล่าสุด</h3>
            <a href="/cases" className="text-sm text-police-600 hover:text-police-700 font-medium">
              ดูทั้งหมด →
            </a>
          </div>
          <div className="space-y-4">
            {recentCases.map((case_) => (
              <div key={case_.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-mono text-gray-500">#{case_.caseNumber}</span>
                      <span className={`status-indicator ${getStatusColor(case_.status)}`}>
                        {getStatusText(case_.status)}
                      </span>
                      <span className={`text-xs font-medium ${getPriorityColor(case_.priority)}`}>
                        {case_.priority.toUpperCase()}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">{case_.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{case_.description}</p>
                    <div className="flex items-center text-xs text-gray-500 space-x-4">
                      <span>ผู้รับผิดชอบ: {case_.assignedOfficerName}</span>
                      <span>สถานที่: {case_.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">กิจกรรมล่าสุด</h3>
            <a href="/activity" className="text-sm text-police-600 hover:text-police-700 font-medium">
              ดูทั้งหมด →
            </a>
          </div>
          <div className="space-y-4">
            {stats?.recentActivity.map((activity) => {
              const ActivityIcon = getActivityIcon(activity.type);
              return (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <ActivityIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <div className="flex items-center text-xs text-gray-500 mt-1 space-x-2">
                      <span>{activity.userName}</span>
                      <span>•</span>
                      <span>{formatTimeAgo(activity.timestamp)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">การดำเนินการด่วน</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/cases/new"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FolderIcon className="h-6 w-6 text-police-600 mr-3" />
            <span className="font-medium text-gray-900">สร้างคดีใหม่</span>
          </a>
          
          <a
            href="/analysis"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <DocumentMagnifyingGlassIcon className="h-6 w-6 text-police-600 mr-3" />
            <span className="font-medium text-gray-900">วิเคราะห์หลักฐาน</span>
          </a>
          
          <a
            href="/interrogation"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <UserGroupIcon className="h-6 w-6 text-police-600 mr-3" />
            <span className="font-medium text-gray-900">สอบสวน</span>
          </a>
          
          <a
            href="/reports"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <DocumentTextIcon className="h-6 w-6 text-police-600 mr-3" />
            <span className="font-medium text-gray-900">สร้างรายงาน</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;