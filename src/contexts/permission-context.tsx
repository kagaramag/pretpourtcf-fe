"use client";

import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { Permission, ROLE_PERMISSIONS } from "@/config/permissions";
import { useAuth } from "./auth-context";

interface PermissionContextProps {
  userPermissions: Permission[];
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
}

const PermissionContext = createContext<PermissionContextProps | undefined>(
  undefined
);

export const PermissionProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);

  useEffect(() => {
    if (user?.role) {
      const rolePermissions =
        ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS] || [];
      setUserPermissions(rolePermissions as Permission[]);
    } else {
      setUserPermissions([]);
    }
  }, [user]);

  const hasPermission = (permission: Permission): boolean => {
    return userPermissions.includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some((permission) =>
      userPermissions.includes(permission)
    );
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every((permission) =>
      userPermissions.includes(permission)
    );
  };

  return (
    <PermissionContext.Provider
      value={{
        userPermissions,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error("usePermissions must be used within a PermissionProvider");
  }
  return context;
};
