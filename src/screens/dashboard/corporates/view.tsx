"use client";

import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { corporateService } from "@/services/corporate";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Calendar,
  Corporate,
  Email,
  Phone,
  Subscription,
  MapPin,
} from "@/icons";
import { format } from "date-fns";
import { Tabs, TabPanel, Tab } from "@/components/molecules/Tabs";
import { useState } from "react";
import CorporateTrainersScreen from "./trainers";
import CorporateLearnersScreen from "./learners";

const tabs: Tab[] = [
  { id: "learners", label: "Learners" },
  { id: "trainers", label: "Trainers" },
  { id: "subscription", label: "Subscription" },
];

export default function CorporateDetailsScreen() {
  const router = useRouter();
  const params = useParams();
  const corporateId = params.id as string;
  const [activeTab, setActiveTab] = useState("learners");

  const {
    data: corporateData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["corporate", corporateId],
    queryFn: () => corporateService.getCorporateById(corporateId),
    enabled: !!corporateId,
  });

  const { data: subscriptionData } = useQuery({
    queryKey: ["corporate-subscription", corporateId],
    queryFn: () => corporateService.getCorporateSubscription(corporateId),
    enabled: !!corporateId && activeTab === "subscription",
  });

  const corporate = corporateData?.data?.corporate;

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !corporate) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg border border-border p-12 text-center">
            <Corporate className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {error
                ? "Error loading corporate details"
                : "Corporate not found"}
            </p>
            <Button
              onClick={() => router.push("/dashboard/corporates")}
              variant="outline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to corporates
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const activeSub = subscriptionData?.data?.activeSubscription;

  return (
    <div className="lg:px-8 relative">
      <div className="flex items-center gap-4 top-0 left-0 absolute">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/dashboard/corporates")}
          icon="arrowLeft"
        >
          Back
        </Button>
      </div>
      <div className="max-w-4xl mx-auto space-y-3">
        {/* Corporate Profile */}
        <div className="bg-white rounded-lg lg:p-6 p-2">
          <div className="flex items-start lg:gap-4 gap-2">
            <div className="h-16 w-16 rounded-full bg-tertiary flex items-center justify-center text-black lg:text-2xl text-md lg:font-bold">
              {corporate.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold">{corporate.name}</h1>
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      corporate.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }
                  >
                    {corporate.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              <div className="grid lg:grid-cols-3 grid-cols-2 lg:gap-6 gap-2">
                <div>
                  <h5 className="text-sm text-gray-500">Location</h5>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <p className="text-sm">{corporate.location}</p>
                  </div>
                </div>

                {corporate.email && (
                  <div>
                    <h5 className="text-sm text-gray-500">Email</h5>
                    <div className="flex items-center gap-2">
                      <Email className="h-4 w-4 text-gray-400" />
                      <p className="text-sm">{corporate.email}</p>
                    </div>
                  </div>
                )}

                {corporate.phone && (
                  <div>
                    <h5 className="text-sm text-gray-500">Phone</h5>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <p className="text-sm">{corporate.phone}</p>
                    </div>
                  </div>
                )}

                <div>
                  <h5 className="text-sm text-gray-500">Created</h5>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p className="text-sm">
                      {corporate.createdAt
                        ? format(new Date(corporate.createdAt), "dd MMM yyyy")
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Trainers</p>
                  <p className="text-lg font-semibold">
                    {corporate.trainerCount || 0}
                    {corporate.maxTrainers > 0 && (
                      <span className="text-sm text-gray-400 font-normal">
                        /{corporate.maxTrainers}
                      </span>
                    )}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Learners</p>
                  <p className="text-lg font-semibold">
                    {corporate.learnerCount || 0}
                    {corporate.maxLearners > 0 && (
                      <span className="text-sm text-gray-400 font-normal">
                        /{corporate.maxLearners}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          variant="underline"
        />

        <TabPanel id="learners" activeTab={activeTab}>
          <div className="">
            <CorporateLearnersScreen corporateId={corporateId} />
          </div>
        </TabPanel>

        <TabPanel id="trainers" activeTab={activeTab}>
          <div className="">
            <CorporateTrainersScreen corporateId={corporateId} />
          </div>
        </TabPanel>

        <TabPanel id="subscription" activeTab={activeTab}>
          <div className="">
            {activeSub ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Active Subscription</h3>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Plan</p>
                    <p className="font-medium">
                      {activeSub.plan_id?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Paid By</p>
                    <Badge
                      className={
                        activeSub.paid_by === "corporate"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }
                    >
                      {activeSub.paid_by === "corporate"
                        ? "Corporate"
                        : "Learner"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Price/Learner</p>
                    <p className="font-medium">
                      {activeSub.price_per_learner} {activeSub.currency}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Max Seats</p>
                    <p className="font-medium">{activeSub.max_learners}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Start</p>
                    <p className="text-sm">
                      {format(new Date(activeSub.start_date), "dd MMM yyyy")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">End</p>
                    <p className="text-sm">
                      {format(new Date(activeSub.end_date), "dd MMM yyyy")}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Subscription className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No active subscription</p>
                <p className="text-sm mt-1">
                  Create a subscription plan for this corporate
                </p>
              </div>
            )}
          </div>
        </TabPanel>
      </div>
    </div>
  );
}
