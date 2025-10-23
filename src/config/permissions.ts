type Action = "read" | "create" | "update" | "delete";

const actions: Action[] = ["read", "create", "update", "delete"];

enum Features {
  USERS = "Users",
  FOLLOWUPS = "Followups",
  ANALYTICS = "Analytics",
  PRACTICES = "Practices",
}

type PermissionsMap = {
  [key: string]: string;
};

const generatePermissions = (features: typeof Features): PermissionsMap => {
  return Object.keys(features).reduce((acc, feature) => {
    actions.forEach((action) => {
      const key =
        `${feature.toUpperCase()}_${action.toUpperCase()}` as keyof PermissionsMap;
      (acc as Partial<PermissionsMap>)[key] = `${
        features[feature as keyof typeof Features]
      }:${action}`;
    });
    return acc;
  }, {} as Partial<PermissionsMap>) as PermissionsMap;
};

export const PERMISSIONS: PermissionsMap = generatePermissions(Features);

export const CUSTOM_PERMISSIONS = {
  DASHBOARD_READ: "dashboard:read",
  PROFILE_READ: "profile:read",
} as const;

export type Permission =
  | (typeof PERMISSIONS)[keyof typeof PERMISSIONS]
  | (typeof CUSTOM_PERMISSIONS)[keyof typeof CUSTOM_PERMISSIONS];

// Role-based permissions
export const ROLE_PERMISSIONS = {
  super_admin: Object.values(PERMISSIONS).concat(
    Object.values(CUSTOM_PERMISSIONS)
  ),
  admin: [
    // Users management
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_UPDATE,
    // Followups management
    PERMISSIONS.FOLLOWUPS_READ,
    PERMISSIONS.FOLLOWUPS_CREATE,
    PERMISSIONS.FOLLOWUPS_UPDATE,
    PERMISSIONS.FOLLOWUPS_DELETE,
    // Practices management
    PERMISSIONS.PRACTICES_READ,
    PERMISSIONS.PRACTICES_CREATE,
    PERMISSIONS.PRACTICES_UPDATE,
    PERMISSIONS.PRACTICES_DELETE,
    // Analytics
    PERMISSIONS.ANALYTICS_READ,
    // Dashboard & Profile
    CUSTOM_PERMISSIONS.DASHBOARD_READ,
    CUSTOM_PERMISSIONS.PROFILE_READ,
  ],
  agent: [
    // Followups
    PERMISSIONS.FOLLOWUPS_READ,
    PERMISSIONS.FOLLOWUPS_CREATE,
    PERMISSIONS.FOLLOWUPS_UPDATE,
    // Practices (read-only for agents)
    PERMISSIONS.PRACTICES_READ,
    // Dashboard & Profile
    CUSTOM_PERMISSIONS.DASHBOARD_READ,
    CUSTOM_PERMISSIONS.PROFILE_READ,
  ],
} as const;
