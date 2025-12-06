"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  Mail,
  FileText,
  Send,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";
import { emailHistoryService } from "@/services/email-history";
import { formatDistanceToNow } from "date-fns";

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

  const handleViewDetails = (id: string) => {
    // You can create a detail page later if needed
    console.log("View details:", id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Messages</h1>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/dashboard/messages/templates">
              <FileText className="h-4 w-4 mr-2" />
              Templates
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/messages/compose">
              <Send className="h-4 w-4 mr-2" />
              Compose
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
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

          <Card className="p-4">
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

          <Card className="p-4">
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

          <Card className="p-4">
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
          <CardTitle>Email History</CardTitle>
          <p className="text-sm text-muted-foreground">
            View all sent emails and their delivery status
          </p>
        </div>

        <Separator />

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !data || data.history.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No emails sent yet</h3>
            <p className="text-muted-foreground mb-6">
              Start by composing your first email to users
            </p>
            <Button asChild>
              <Link href="/dashboard/messages/compose">
                <Send className="h-4 w-4 mr-2" />
                Compose Email
              </Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Success</TableHead>
                  <TableHead>Failed</TableHead>
                  <TableHead>Sent By</TableHead>
                  <TableHead>Sent At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.history.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>
                      <div className="font-medium">{item.templateName}</div>
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>{item.successCount}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span>{item.failureCount}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {item.sentBy.first_name} {item.sentBy.last_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(item.sentAt), {
                          addSuffix: true,
                        })}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

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
