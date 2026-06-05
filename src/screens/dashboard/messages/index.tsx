"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Table, Column } from "@/components/ui/table";
import {
  Mail,
  FileText,
  Send,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { emailHistoryService } from "@/services/email-history";
import { formatDistanceToNow } from "date-fns";

type EmailHistoryItem = {
  _id: string;
  templateName: string;
  recipients: { name: string }[];
  totalRecipients: number;
  successCount: number;
  failureCount: number;
  sentBy: { first_name: string; last_name: string };
  sentAt: string;
};

const columns: Column<EmailHistoryItem>[] = [
  {
    key: "templateName",
    header: "Template",
    render: (item) => <div className="font-medium">{item.templateName}</div>,
  },
  {
    key: "recipients",
    header: "Recipients",
    render: (item) => (
      <div className="flex flex-col gap-1">
        <div className="text-sm">
          {item.recipients.slice(0, 2).map((recipient, idx) => (
            <span key={idx}>
              {recipient.name}
              {idx < Math.min(item.recipients.length - 1, 1) && ", "}
            </span>
          ))}
          {item.totalRecipients > 2 && (
            <span className="text-muted-foreground">
              {" "}+{item.totalRecipients - 2} more
            </span>
          )}
        </div>
      </div>
    ),
  },
  {
    key: "successCount",
    header: "Success",
    render: (item) => (
      <div className="flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <span>{item.successCount}</span>
      </div>
    ),
  },
  {
    key: "failureCount",
    header: "Failed",
    render: (item) => (
      <div className="flex items-center gap-2">
        <XCircle className="h-4 w-4 text-red-600" />
        <span>{item.failureCount}</span>
      </div>
    ),
  },
  {
    key: "sentBy",
    header: "Sent By",
    render: (item) => (
      <div className="text-sm">
        {item.sentBy.first_name} {item.sentBy.last_name}
      </div>
    ),
  },
  {
    key: "sentAt",
    header: "Sent At",
    render: (item) => (
      <div className="text-sm text-muted-foreground">
        {formatDistanceToNow(new Date(item.sentAt), {
          addSuffix: true,
        })}
      </div>
    ),
  },
];

export function Messages() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["email-history", currentPage],
    queryFn: () =>
      emailHistoryService.getAllHistory({
        page: currentPage,
        limit: pageSize,
      }),
  });

  const { data: stats } = useQuery({
    queryKey: ["email-statistics"],
    queryFn: () => emailHistoryService.getStatistics(),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Messages</h1>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" href="/dashboard/messages/templates">
            <FileText className="h-4 w-4 mr-2" />
            Templates
          </Button>
          <Button href="/dashboard/messages/compose">
            <Send className="h-4 w-4 mr-2" />
            Compose
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid lg:grid-cols-4 grid-cols-2 lg:gap-4 gap-2">
          <Card className="lg:p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-100  rounded-lg">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Emails</p>
                <p className="text-2xl font-bold">{stats.totalEmailsSent}</p>
              </div>
            </div>
          </Card>

          <Card className="lg:p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-100  rounded-lg">
                <Send className="h-5 w-5 " />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Recipients</p>
                <p className="text-2xl font-bold">{stats.totalRecipients}</p>
              </div>
            </div>
          </Card>

          <Card className="lg:p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-100 rounded-lg">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Successful</p>
                <p className="text-2xl font-bold">{stats.totalSuccess}</p>
              </div>
            </div>
          </Card>

          <Card className="lg:p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-100  rounded-lg">
                <XCircle className="h-5 w-5 " />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold">{stats.totalFailures}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Email History Table */}
      <Card className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-semibold">Email History</h3>
          <p className="text-sm text-muted-foreground">
            View all sent emails and their delivery status
          </p>
        </div>

        <Separator />

        <Table<EmailHistoryItem>
          data={data?.history ?? []}
          columns={columns}
          keyExtractor={(item) => item._id}
          isLoading={isLoading}
          emptyMessage="No emails sent yet"
          emptyComponent={
            <div className="text-center py-12">
              <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No emails sent yet</h3>
              <p className="text-muted-foreground mb-6">
                Start by composing your first email to users
              </p>
              <Button href="/dashboard/messages/compose">
                <Send className="h-4 w-4 mr-2" />
                Compose Email
              </Button>
            </div>
          }
        />

        {/* Pagination */}
        {data && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-muted-foreground">
              Page {data.pagination.page} of {data.pagination.totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={!data.pagination.hasPrevPage}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={!data.pagination.hasNextPage}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
