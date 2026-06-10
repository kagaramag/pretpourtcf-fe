"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Icon } from "@/icons";
import {
  loginActivityService,
  SuspiciousAccount,
} from "@/services/login-activity";
import { toast } from "sonner";

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function Suspicious() {
  const [suspiciousAccounts, setSuspiciousAccounts] = useState<
    SuspiciousAccount[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 0,
  });

  const loadSuspicious = useCallback(async () => {
    try {
      setLoading(true);
      const data = await loginActivityService.getSuspiciousAccounts({
        page: pagination.page,
        limit: pagination.limit,
      });
      setSuspiciousAccounts(data.flaggedAccounts);
      setPagination((prev) => ({ ...prev, ...data.pagination }));
    } catch {
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  useEffect(() => {
    loadSuspicious();
  }, [loadSuspicious]);

  return (
    <div className="p-4">
      <h3 className="font-semibold text-lg mb-4">
        Comptes suspects de partage
      </h3>
      {loading ? (
        <div className="text-center py-8 text-gray-600">Chargement...</div>
      ) : suspiciousAccounts.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          Aucun compte suspect detecte
        </div>
      ) : (
        <div className="space-y-4">
          {suspiciousAccounts.map((account, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Icon name="info" size={20} className="text-orange-500" />
                  <div>
                    <span className="font-medium">
                      {account.user
                        ? `${account.user.first_name} ${account.user.last_name}`
                        : "Utilisateur inconnu"}
                    </span>
                    {account.user && (
                      <div className="text-xs text-gray-600">
                        {account.user.email}
                      </div>
                    )}
                  </div>
                </div>
                <Badge variant="destructive">
                  {account.flagCount} alerte
                  {account.flagCount > 1 ? "s" : ""}
                </Badge>
              </div>
              <Separator className="my-2" />
              <div className="space-y-2">
                {account.recentEvents.map((event, eIdx) => (
                  <div
                    key={eIdx}
                    className="text-xs grid grid-cols-4 gap-2 text-gray-600"
                  >
                    <span>
                      IP: {event.previous_ip} → {event.current_ip}
                    </span>
                    <span>
                      {event.previous_device} → {event.current_device}
                    </span>
                    <span>{event.minutes_since_last_activity} min entre</span>
                    <span>{formatDate(event.timestamp)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-600">
            Page {pagination.page} sur {pagination.totalPages} (
            {pagination.total} total)
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
              }
            >
              <Icon name="arrowLeft" size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
              }
            >
              <Icon name="arrowRight" size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
