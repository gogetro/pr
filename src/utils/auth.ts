import { jwtDecode } from 'jwt-decode';
import { User, UserRole } from '../types';

interface JWTPayload {
  sub: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  department: string;
  badgeNumber: string;
  exp: number;
  iat: number;
}

export class AuthUtils {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly USER_KEY = 'user';

  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  static setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  static getUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  static isTokenValid(token?: string): boolean {
    const authToken = token || this.getToken();
    if (!authToken) return false;

    try {
      const decoded = jwtDecode<JWTPayload>(authToken);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch {
      return false;
    }
  }

  static decodeToken(token?: string): JWTPayload | null {
    const authToken = token || this.getToken();
    if (!authToken) return null;

    try {
      return jwtDecode<JWTPayload>(authToken);
    } catch {
      return null;
    }
  }

  static getUserFromToken(token?: string): User | null {
    const decoded = this.decodeToken(token);
    if (!decoded) return null;

    return {
      id: decoded.sub,
      username: decoded.username,
      email: decoded.email,
      fullName: decoded.fullName,
      role: decoded.role,
      department: decoded.department,
      badgeNumber: decoded.badgeNumber,
      createdAt: new Date(decoded.iat * 1000).toISOString(),
      isActive: true,
    };
  }

  static hasRole(requiredRole: UserRole, userRole?: UserRole): boolean {
    const user = this.getUser();
    const currentRole = userRole || user?.role;
    
    if (!currentRole) return false;

    const roleHierarchy: Record<UserRole, number> = {
      investigator: 1,
      supervisor: 2,
      admin: 3,
    };

    return roleHierarchy[currentRole] >= roleHierarchy[requiredRole];
  }

  static hasPermission(permission: string, userRole?: UserRole): boolean {
    const user = this.getUser();
    const role = userRole || user?.role;
    
    if (!role) return false;

    const permissions: Record<UserRole, string[]> = {
      investigator: [
        'cases:read',
        'cases:create',
        'cases:update_own',
        'evidence:read',
        'evidence:upload',
        'evidence:analyze',
        'interrogation:create',
        'interrogation:manage_own',
        'reports:read',
        'reports:create',
        'dashboard:read',
      ],
      supervisor: [
        'cases:read',
        'cases:create',
        'cases:update',
        'cases:assign',
        'evidence:read',
        'evidence:upload',
        'evidence:analyze',
        'evidence:delete',
        'interrogation:create',
        'interrogation:manage',
        'reports:read',
        'reports:create',
        'reports:approve',
        'dashboard:read',
        'analytics:read',
        'predictive:read',
      ],
      admin: [
        'cases:*',
        'evidence:*',
        'interrogation:*',
        'reports:*',
        'dashboard:*',
        'analytics:*',
        'predictive:*',
        'users:*',
        'system:*',
        'audit:*',
      ],
    };

    const userPermissions = permissions[role] || [];
    
    // Check for wildcard permissions
    const hasWildcard = userPermissions.some(p => 
      p.endsWith(':*') && permission.startsWith(p.replace(':*', ':'))
    );
    
    return hasWildcard || userPermissions.includes(permission);
  }

  static canAccessCase(caseData: any, userId?: string): boolean {
    const user = this.getUser();
    const currentUserId = userId || user?.id;
    const userRole = user?.role;
    
    if (!currentUserId || !userRole) return false;

    // Admins and supervisors can access all cases
    if (userRole === 'admin' || userRole === 'supervisor') {
      return true;
    }

    // Investigators can only access their assigned cases
    return caseData.assignedOfficer === currentUserId;
  }

  static formatUserName(user: User): string {
    return `${user.fullName} (${user.badgeNumber})`;
  }

  static getUserInitials(user: User): string {
    return user.fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  static getRoleDisplayName(role: UserRole): string {
    const roleNames: Record<UserRole, string> = {
      investigator: 'นักสืบ',
      supervisor: 'หัวหน้างาน',
      admin: 'ผู้ดูแลระบบ',
    };
    
    return roleNames[role] || role;
  }

  static isSessionExpiringSoon(token?: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded) return true;

    const currentTime = Date.now() / 1000;
    const timeUntilExpiry = decoded.exp - currentTime;
    
    // Consider session expiring soon if less than 5 minutes remaining
    return timeUntilExpiry < 300;
  }

  static getSessionTimeRemaining(token?: string): number {
    const decoded = this.decodeToken(token);
    if (!decoded) return 0;

    const currentTime = Date.now() / 1000;
    return Math.max(0, decoded.exp - currentTime);
  }

  static logout(): void {
    this.removeToken();
    // Clear any other stored data
    localStorage.removeItem('dashboard_preferences');
    localStorage.removeItem('case_filters');
    // Redirect to login
    window.location.href = '/login';
  }

  static async refreshTokenIfNeeded(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;

    if (this.isSessionExpiringSoon(token)) {
      try {
        // This would typically call your refresh token endpoint
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          this.setToken(data.token);
          const user = this.getUserFromToken(data.token);
          if (user) {
            this.setUser(user);
          }
          return true;
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
      
      // If refresh fails, logout
      this.logout();
      return false;
    }

    return true;
  }
}

// Utility functions for role-based rendering
export const withRole = (requiredRole: UserRole, component: React.ReactNode): React.ReactNode => {
  const user = AuthUtils.getUser();
  if (!user || !AuthUtils.hasRole(requiredRole, user.role)) {
    return null;
  }
  return component;
};

export const withPermission = (permission: string, component: React.ReactNode): React.ReactNode => {
  const user = AuthUtils.getUser();
  if (!user || !AuthUtils.hasPermission(permission, user.role)) {
    return null;
  }
  return component;
};

// Hook for checking authentication status
export const useAuth = () => {
  const token = AuthUtils.getToken();
  const user = AuthUtils.getUser();
  const isAuthenticated = token && AuthUtils.isTokenValid(token) && user;

  return {
    isAuthenticated: !!isAuthenticated,
    user,
    token,
    hasRole: (role: UserRole) => AuthUtils.hasRole(role),
    hasPermission: (permission: string) => AuthUtils.hasPermission(permission),
    logout: AuthUtils.logout,
  };
};

export default AuthUtils;