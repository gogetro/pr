import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  DocumentMagnifyingGlassIcon,
  MicrophoneIcon,
  FolderIcon,
  DocumentTextIcon,
  MapIcon,
  ChartBarIcon,
  CogIcon,
  UserGroupIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { AuthUtils } from '../../utils/auth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavigationItem {
  name: string;
  nameEn: string;
  href: string;
  icon: React.ComponentType<any>;
  permission?: string;
  role?: string;
  badge?: string;
}

const navigation: NavigationItem[] = [
  {
    name: 'แดชบอร์ด',
    nameEn: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
    permission: 'dashboard:read',
  },
  {
    name: 'วิเคราะห์ข้อมูล',
    nameEn: 'Data Analysis',
    href: '/analysis',
    icon: DocumentMagnifyingGlassIcon,
    permission: 'evidence:analyze',
  },
  {
    name: 'สนับสนุนการสอบสวน',
    nameEn: 'Interrogation Support',
    href: '/interrogation',
    icon: MicrophoneIcon,
    permission: 'interrogation:create',
  },
  {
    name: 'จัดการคดี',
    nameEn: 'Case Management',
    href: '/cases',
    icon: FolderIcon,
    permission: 'cases:read',
  },
  {
    name: 'รายงาน',
    nameEn: 'Reports',
    href: '/reports',
    icon: DocumentTextIcon,
    permission: 'reports:read',
  },
  {
    name: 'การตำรวจเชิงพยากรณ์',
    nameEn: 'Predictive Policing',
    href: '/predictive',
    icon: MapIcon,
    permission: 'predictive:read',
  },
  {
    name: 'การวิเคราะห์',
    nameEn: 'Analytics',
    href: '/analytics',
    icon: ChartBarIcon,
    permission: 'analytics:read',
    role: 'supervisor',
  },
  {
    name: 'จัดการผู้ใช้',
    nameEn: 'User Management',
    href: '/users',
    icon: UserGroupIcon,
    permission: 'users:read',
    role: 'admin',
  },
  {
    name: 'ตั้งค่าระบบ',
    nameEn: 'System Settings',
    href: '/settings',
    icon: CogIcon,
    permission: 'system:read',
    role: 'admin',
  },
  {
    name: 'บันทึกการตรวจสอบ',
    nameEn: 'Audit Logs',
    href: '/audit',
    icon: ShieldCheckIcon,
    permission: 'audit:read',
    role: 'admin',
  },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const filteredNavigation = navigation.filter(item => {
    if (item.role && !AuthUtils.hasRole(item.role as any)) {
      return false;
    }
    if (item.permission && !AuthUtils.hasPermission(item.permission)) {
      return false;
    }
    return true;
  });

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo and Title */}
          <div className="flex items-center justify-center h-16 px-4 bg-police-600 text-white">
            <ShieldCheckIcon className="h-8 w-8 mr-2" />
            <div className="text-center">
              <h1 className="text-lg font-bold">AI Investigation</h1>
              <p className="text-xs text-police-200">Royal Thai Police</p>
            </div>
          </div>

          {/* User Info */}
          {user && (
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-police-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-police-600">
                      {AuthUtils.getUserInitials(user)}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                  <p className="text-xs text-gray-500">
                    {AuthUtils.getRoleDisplayName(user.role)} • {user.badgeNumber}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {filteredNavigation.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={`sidebar-item ${
                  isActive(item.href) ? 'sidebar-item-active' : 'sidebar-item-inactive'
                }`}
                onClick={() => {
                  // Close mobile sidebar when item is clicked
                  if (window.innerWidth < 1024) {
                    onClose();
                  }
                }}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{item.name}</div>
                  <div className="text-xs opacity-75">{item.nameEn}</div>
                </div>
                {item.badge && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              <p>AI Investigation Assistant</p>
              <p>Version 1.0.0</p>
              <p className="mt-1">© 2024 Royal Thai Police</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;