"use client";

import { useState, useEffect, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import { Icon, type IconName } from "@/icons";
import { Button } from "@/components/ui/button";
import apiClient from "@/lib/api-client";
import { API_ENDPOINTS, config } from "@/config";

interface ActivityLog {
  _id: string;
  user_id?: {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  };
  action: string;
  category: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

interface ActivityResponse {
  status: string;
  data: {
    logs: ActivityLog[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      total_pages: number;
    };
  };
}

const actionIcons: Record<string, IconName> = {
  page_viewed: "open",
  button_clicked: "arrowRight",
  link_clicked: "arrowRight",
  form_submitted: "file",
  login_success: "sign",
  logout: "logout",
  practice_started: "play",
  practice_completed: "done",
};

const actionLabels: Record<string, string> = {
  page_viewed: "Page viewed",
  button_clicked: "Button clicked",
  link_clicked: "Link clicked",
  form_submitted: "Form submitted",
  login_success: "Logged in",
  logout: "Logged out",
  practice_started: "Practice started",
  practice_completed: "Practice completed",
};

const practiceTypeLabels: Record<string, string> = {
  listening: "CO",
  reading: "CE",
  writing: "EE",
  speaking: "EO",
};

function getPracticeLabel(metadata: Record<string, any>): string {
  const type =
    practiceTypeLabels[metadata.practice_type] || metadata.practice_type;
  const title = metadata.practice_title || "";
  const prefix = metadata.is_freemium ? "Trial" : "Paid";
  return `${prefix}: ${type} — ${title}`;
}

function getPageLabel(path: string): string {
  const segments: Record<string, string> = {
    "/compte": "Account Home",
    "/compte/plans": "Plans",
    "/compte/series": "Series",
    "/compte/historique": "History",
    "/compte/profile": "Profile",
    "/compte/pratique/co": "Paid Practice — CO",
    "/compte/pratique/ce": "Paid Practice — CE",
    "/compte/pratique/eo": "Paid Practice — EO",
    "/compte/pratique/ee": "Paid Practice — EE",
    "/compte/essai-gratuit": "Free Trial",
    "/compte/essai-gratuit/co": "Free Practice — CO",
    "/compte/essai-gratuit/ce": "Free Practice — CE",
    "/compte/essai-gratuit/eo": "Free Practice — EO",
    "/compte/essai-gratuit/ee": "Free Practice — EE",
    "/compte/parrainages": "Referrals",
    "/compte/abonner": "Subscription",
    "/trainer": "Trainer Dashboard",
    "/trainer/apprenants": "Learners",
    "/trainer/pratiques/co": "Practices CO",
    "/trainer/pratiques/eo": "Practices EO",
    "/trainer/profile": "Trainer Profile",
  };

  // Exact match first
  if (segments[path]) return segments[path];

  // Prefix match for dynamic routes
  for (const [prefix, label] of Object.entries(segments)) {
    if (path.startsWith(prefix + "/")) return label;
  }

  return path;
}

export function LiveTracker() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchActivities = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        limit: "15",
        ...(isLive ? { live: "true" } : {}),
      });

      const response = await apiClient.get<ActivityResponse>(
        `${API_ENDPOINTS.ANALYTICS_USER_ACTIVITY}?${params}`
      );

      setActivities(response.data.logs);
      setLastRefresh(new Date());
    } catch (error) {
      // Silently fail - dashboard shouldn't break if analytics is down
      console.error("Failed to fetch live activity:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLive]);

  // Initial fetch + auto-refresh every 5s when live
  useEffect(() => {
    fetchActivities();

    if (isLive) {
      const interval = setInterval(fetchActivities, 5000);
      return () => clearInterval(interval);
    }
  }, [fetchActivities, isLive]);

  return (
    <div className="divide-y divide-gray-100">
      {/* Header controls */}
      <div className="flex items-center gap-2 pb-2">
        <h4 className="flex-1">Live tracker</h4>
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              <Icon name="play" className="h-3 w-3 animate-pulse" />
              Live
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant={isLive ? "default" : "outline"}
            size="sm"
            onClick={() => setIsLive(!isLive)}
          >
            {isLive ? "Live" : "All"}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchActivities}
            icon="refresh"
            iconOnly
          />
        </div>
      </div>

      {/* Activity feed */}
      <div className="space-y-1 max-h-[560px] overflow-y-auto">
        {isLoading && activities.length === 0 ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-start gap-2 animate-pulse">
                <div className="h-7 w-7 rounded-full bg-gray-100" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-24 bg-gray-100 rounded" />
                  <div className="h-3 w-36 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-6">
            <Icon name="open" className="h-8 w-8 mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-600">
              {isLive
                ? `No activity in the last ${config.liveTrackerDays} day${config.liveTrackerDays > 1 ? "s" : ""}`
                : "No recorded activity"}
            </p>
          </div>
        ) : (
          activities.map((activity) => {
            const iconName: IconName = actionIcons[activity.action] || "open";
            const isPageView = activity.action === "page_viewed";
            const isPracticeEvent =
              activity.action === "practice_started" ||
              activity.action === "practice_completed";
            const userName = activity.user_id
              ? `${activity.user_id.first_name} ${activity.user_id.last_name}`
              : "Anonymous";
            const userRole = activity.user_id?.role || "";
            const pagePath = activity.metadata?.page_path || "";
            const label = activity.metadata?.label || "";

            return (
              <div
                key={activity._id}
                className="flex-1 flex flex-col items-start gap-2 py-2 border-b border-gray-50 last:border-0 text-xs"
              >
                <div className="w-full flex gap-2">
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                      isPageView
                        ? "bg-blue-50 text-blue-500"
                        : activity.action === "login_success"
                          ? "bg-green-50 text-green-500"
                          : activity.action === "logout"
                            ? "bg-gray-100 text-gray-500"
                            : isPracticeEvent
                              ? "bg-purple-50 text-purple-500"
                              : "bg-orange-50 text-orange-500"
                    }`}
                  >
                    <Icon name={iconName} className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex gap-1">
                        <div className="truncate">{userName}</div>
                        {userRole && (
                          <span
                            className={` px-1 py-0 rounded ${
                              userRole === "trainer"
                                ? "bg-purple-50 text-purple-600"
                                : "bg-blue-50 text-blue-600"
                            }`}
                          >
                            {userRole === "trainer" ? "Trainer" : "Learner"}
                          </span>
                        )}
                      </div>
                      <span className="text-gray-400 whitespace-nowrap mt-0.5">
                        {formatDistanceToNow(new Date(activity.timestamp), {
                          addSuffix: true,
                          locale: enUS,
                        })}
                      </span>
                    </div>
                    <div className=" text-gray-500">
                      {isPageView ? (
                        <>
                          visited{" "}
                          <span className="text-gray-700">
                            {getPageLabel(pagePath)}
                          </span>
                        </>
                      ) : isPracticeEvent && activity.metadata ? (
                        <>
                          {actionLabels[activity.action]} &mdash;{" "}
                          <span className="text-gray-700">
                            {getPracticeLabel(activity.metadata)}
                          </span>
                        </>
                      ) : (
                        <>
                          {actionLabels[activity.action] || activity.action}
                          {label && (
                            <>
                              {" "}
                              &mdash;{" "}
                              <span className="text-gray-700">{label}</span>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {activities.length > 0 && (
        <div className="mt-1 pt-1">
          <p className="text-[10px] text-gray-600 text-center">
            {isLive ? `Last ${config.liveTrackerDays} day${config.liveTrackerDays > 1 ? "s" : ""} · Auto-refresh 5s` : "Recent activity"}{" "}
            &middot; {activities.length} event
            {activities.length > 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
}
