/**
 * 基於角色的訪問控制 (RBAC) 系統
 * 用於LINYA Admin Console的權限管理
 */

export interface User {
  id: string;
  email: string;
  role: Role;
  permissions: Permission[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  level: number; // 權限等級，數字越大權限越高
}

export interface Permission {
  id: string;
  name: string;
  resource: string; // 資源類型：users, spirits, chats, analytics, settings
  action: string; // 操作類型：read, write, delete, manage
  description: string;
}

export interface ResourceAccess {
  resource: string;
  actions: string[];
}

// 預定義權限
export const PERMISSIONS = {
  // 用戶管理權限
  USERS_READ: { id: 'users:read', name: '查看用戶', resource: 'users', action: 'read', description: '查看用戶列表和詳情' },
  USERS_WRITE: { id: 'users:write', name: '編輯用戶', resource: 'users', action: 'write', description: '編輯用戶信息' },
  USERS_DELETE: { id: 'users:delete', name: '刪除用戶', resource: 'users', action: 'delete', description: '刪除用戶賬戶' },
  USERS_MANAGE: { id: 'users:manage', name: '管理用戶', resource: 'users', action: 'manage', description: '完整用戶管理權限' },

  // 精靈管理權限
  SPIRITS_READ: { id: 'spirits:read', name: '查看精靈', resource: 'spirits', action: 'read', description: '查看精靈列表和詳情' },
  SPIRITS_WRITE: { id: 'spirits:write', name: '編輯精靈', resource: 'spirits', action: 'write', description: '編輯精靈屬性' },
  SPIRITS_DELETE: { id: 'spirits:delete', name: '刪除精靈', resource: 'spirits', action: 'delete', description: '刪除精靈' },
  SPIRITS_MANAGE: { id: 'spirits:manage', name: '管理精靈', resource: 'spirits', action: 'manage', description: '完整精靈管理權限' },

  // 聊天管理權限
  CHATS_READ: { id: 'chats:read', name: '查看聊天', resource: 'chats', action: 'read', description: '查看聊天記錄' },
  CHATS_WRITE: { id: 'chats:write', name: '編輯聊天', resource: 'chats', action: 'write', description: '編輯聊天內容' },
  CHATS_DELETE: { id: 'chats:delete', name: '刪除聊天', resource: 'chats', action: 'delete', description: '刪除聊天記錄' },
  CHATS_MANAGE: { id: 'chats:manage', name: '管理聊天', resource: 'chats', action: 'manage', description: '完整聊天管理權限' },

  // 分析數據權限
  ANALYTICS_READ: { id: 'analytics:read', name: '查看分析', resource: 'analytics', action: 'read', description: '查看分析報告' },
  ANALYTICS_EXPORT: { id: 'analytics:export', name: '導出分析', resource: 'analytics', action: 'export', description: '導出分析數據' },

  // 系統設置權限
  SETTINGS_READ: { id: 'settings:read', name: '查看設置', resource: 'settings', action: 'read', description: '查看系統設置' },
  SETTINGS_WRITE: { id: 'settings:write', name: '編輯設置', resource: 'settings', action: 'write', description: '編輯系統設置' },
  SETTINGS_MANAGE: { id: 'settings:manage', name: '管理設置', resource: 'settings', action: 'manage', description: '完整系統設置管理權限' },

  // 角色管理權限
  ROLES_READ: { id: 'roles:read', name: '查看角色', resource: 'roles', action: 'read', description: '查看角色列表' },
  ROLES_WRITE: { id: 'roles:write', name: '編輯角色', resource: 'roles', action: 'write', description: '編輯角色權限' },
  ROLES_MANAGE: { id: 'roles:manage', name: '管理角色', resource: 'roles', action: 'manage', description: '完整角色管理權限' }
} as const;

// 預定義角色
export const ROLES = {
  SUPER_ADMIN: {
    id: 'super_admin',
    name: '超級管理員',
    description: '擁有所有權限的系統管理員',
    permissions: Object.values(PERMISSIONS),
    level: 100
  },
  ADMIN: {
    id: 'admin',
    name: '管理員',
    description: '擁有大部分管理權限',
    permissions: [
      PERMISSIONS.USERS_READ,
      PERMISSIONS.USERS_WRITE,
      PERMISSIONS.SPIRITS_READ,
      PERMISSIONS.SPIRITS_WRITE,
      PERMISSIONS.CHATS_READ,
      PERMISSIONS.CHATS_WRITE,
      PERMISSIONS.ANALYTICS_READ,
      PERMISSIONS.ANALYTICS_EXPORT,
      PERMISSIONS.SETTINGS_READ
    ],
    level: 80
  },
  MODERATOR: {
    id: 'moderator',
    name: '版主',
    description: '擁有內容審核權限',
    permissions: [
      PERMISSIONS.USERS_READ,
      PERMISSIONS.SPIRITS_READ,
      PERMISSIONS.CHATS_READ,
      PERMISSIONS.CHATS_WRITE,
      PERMISSIONS.CHATS_DELETE,
      PERMISSIONS.ANALYTICS_READ
    ],
    level: 60
  },
  ANALYST: {
    id: 'analyst',
    name: '分析師',
    description: '擁有數據分析權限',
    permissions: [
      PERMISSIONS.USERS_READ,
      PERMISSIONS.SPIRITS_READ,
      PERMISSIONS.CHATS_READ,
      PERMISSIONS.ANALYTICS_READ,
      PERMISSIONS.ANALYTICS_EXPORT
    ],
    level: 40
  },
  VIEWER: {
    id: 'viewer',
    name: '查看者',
    description: '只有查看權限',
    permissions: [
      PERMISSIONS.USERS_READ,
      PERMISSIONS.SPIRITS_READ,
      PERMISSIONS.CHATS_READ,
      PERMISSIONS.ANALYTICS_READ
    ],
    level: 20
  }
} as const;

/**
 * RBAC權限控制類
 */
export class RBACService {
  private currentUser: User | null = null;

  /**
   * 設置當前用戶
   */
  setCurrentUser(user: User): void {
    this.currentUser = user;
  }

  /**
   * 獲取當前用戶
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * 檢查用戶是否有特定權限
   */
  hasPermission(permission: Permission): boolean {
    if (!this.currentUser) return false;
    
    // 超級管理員擁有所有權限
    if (this.currentUser.role.id === ROLES.SUPER_ADMIN.id) {
      return true;
    }
    
    // 檢查用戶角色權限
    const roleHasPermission = this.currentUser.role.permissions.some(
      p => p.id === permission.id
    );
    
    if (roleHasPermission) return true;
    
    // 檢查用戶個人權限
    return this.currentUser.permissions.some(p => p.id === permission.id);
  }

  /**
   * 檢查用戶是否有特定資源的操作權限
   */
  hasResourcePermission(resource: string, action: string): boolean {
    if (!this.currentUser) return false;
    
    // 超級管理員擁有所有權限
    if (this.currentUser.role.id === ROLES.SUPER_ADMIN.id) {
      return true;
    }
    
    // 檢查角色權限
    const roleHasPermission = this.currentUser.role.permissions.some(
      p => p.resource === resource && p.action === action
    );
    
    if (roleHasPermission) return true;
    
    // 檢查個人權限
    return this.currentUser.permissions.some(
      p => p.resource === resource && p.action === action
    );
  }

  /**
   * 檢查用戶是否有管理特定資源的權限
   */
  hasManagePermission(resource: string): boolean {
    return this.hasResourcePermission(resource, 'manage');
  }

  /**
   * 獲取用戶可訪問的資源列表
   */
  getAccessibleResources(): ResourceAccess[] {
    if (!this.currentUser) return [];
    
    const resourceMap = new Map<string, Set<string>>();
    
    // 收集角色權限
    this.currentUser.role.permissions.forEach(permission => {
      if (!resourceMap.has(permission.resource)) {
        resourceMap.set(permission.resource, new Set());
      }
      resourceMap.get(permission.resource)!.add(permission.action);
    });
    
    // 收集個人權限
    this.currentUser.permissions.forEach(permission => {
      if (!resourceMap.has(permission.resource)) {
        resourceMap.set(permission.resource, new Set());
      }
      resourceMap.get(permission.resource)!.add(permission.action);
    });
    
    // 轉換為數組格式
    return Array.from(resourceMap.entries()).map(([resource, actions]) => ({
      resource,
      actions: Array.from(actions)
    }));
  }

  /**
   * 檢查用戶是否可以訪問特定頁面
   */
  canAccessPage(page: string): boolean {
    const pagePermissions: Record<string, Permission> = {
      'users': PERMISSIONS.USERS_READ,
      'spirits': PERMISSIONS.SPIRITS_READ,
      'chats': PERMISSIONS.CHATS_READ,
      'analytics': PERMISSIONS.ANALYTICS_READ,
      'settings': PERMISSIONS.SETTINGS_READ,
      'roles': PERMISSIONS.ROLES_READ
    };
    
    const requiredPermission = pagePermissions[page];
    if (!requiredPermission) return false;
    
    return this.hasPermission(requiredPermission);
  }

  /**
   * 獲取用戶的權限等級
   */
  getUserLevel(): number {
    if (!this.currentUser) return 0;
    return this.currentUser.role.level;
  }

  /**
   * 檢查用戶是否可以管理其他用戶
   */
  canManageUser(targetUser: User): boolean {
    if (!this.currentUser) return false;
    
    // 超級管理員可以管理所有用戶
    if (this.currentUser.role.id === ROLES.SUPER_ADMIN.id) {
      return true;
    }
    
    // 不能管理比自己權限等級高的用戶
    return this.getUserLevel() > targetUser.role.level;
  }

  /**
   * 檢查用戶是否可以編輯特定資源
   */
  canEdit(resource: string): boolean {
    return this.hasResourcePermission(resource, 'write') || 
           this.hasResourcePermission(resource, 'manage');
  }

  /**
   * 檢查用戶是否可以刪除特定資源
   */
  canDelete(resource: string): boolean {
    return this.hasResourcePermission(resource, 'delete') || 
           this.hasResourcePermission(resource, 'manage');
  }
}

// 全局RBAC服務實例
export const rbacService = new RBACService();

// React Hook for permission checking
export function usePermission(permission: Permission): boolean {
  const [hasPermission, setHasPermission] = React.useState(false);
  
  React.useEffect(() => {
    setHasPermission(rbacService.hasPermission(permission));
  }, [permission]);
  
  return hasPermission;
}

// React Hook for resource permission checking
export function useResourcePermission(resource: string, action: string): boolean {
  const [hasPermission, setHasPermission] = React.useState(false);
  
  React.useEffect(() => {
    setHasPermission(rbacService.hasResourcePermission(resource, action));
  }, [resource, action]);
  
  return hasPermission;
}

// React Hook for page access checking
export function usePageAccess(page: string): boolean {
  const [canAccess, setCanAccess] = React.useState(false);
  
  React.useEffect(() => {
    setCanAccess(rbacService.canAccessPage(page));
  }, [page]);
  
  return canAccess;
}




