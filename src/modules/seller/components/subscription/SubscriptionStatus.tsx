import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { StatusBadge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { useSubscription } from "../../hooks/useSubscription";
import { RefreshCw, Zap, Calendar } from "lucide-react";
import { formatDate } from "@/core/utils/date";
import { UpgradeModal } from "./UpgradeModal";
import { useState } from "react";

export function SubscriptionStatus() {
  const { subscription, loading, error, refresh, creditsRemaining, isActive } =
    useSubscription();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-gray-500">Loading subscription...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    // Check if error is about no subscription found (404 or similar)
    const isNoSubscriptionError = 
      error.toLowerCase().includes("no active subscription") ||
      error.toLowerCase().includes("not found") ||
      error.toLowerCase().includes("404");

    if (isNoSubscriptionError) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>No Active Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600">
              You don't have an active subscription. Purchase a plan to get started with promotions and other features.
            </p>
            <Button color="primary" onClick={() => setUpgradeModalOpen(true)}>
              View Plans
            </Button>
            <UpgradeModal
              isOpen={upgradeModalOpen}
              onClose={() => setUpgradeModalOpen(false)}
              message="Choose a plan to get started"
            />
          </CardContent>
        </Card>
      );
    }

    // Other errors
    return (
      <Card>
        <CardContent className="py-8">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
            <div className="text-red-800 font-medium mb-2">Error loading subscription</div>
            <div className="text-sm text-red-600 mb-4">{error}</div>
            <Button variant="outlined" size="sm" onClick={refresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Active Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-gray-600">
            You don't have an active subscription. Purchase a plan to get started with promotions and other features.
          </p>
          <Button color="primary" onClick={() => setUpgradeModalOpen(true)}>
            View Plans
          </Button>
          <UpgradeModal
            isOpen={upgradeModalOpen}
            onClose={() => setUpgradeModalOpen(false)}
            message="Choose a plan to get started"
          />
        </CardContent>
      </Card>
    );
  }

  const plan =
    typeof subscription.planId === "string" ? null : subscription.planId;
  const endDate = new Date(subscription.endDate);
  const isExpiringSoon =
    endDate.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000; // 7 days

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Subscription Status</CardTitle>
          <Button variant="outlined" size="sm" onClick={refresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold">{plan?.name || "Unknown Plan"}</h3>
          <p className="text-sm text-gray-500">
            {plan?.planType || "Unknown"} Plan
          </p>
          {subscription.isAutoAssigned && (
            <StatusBadge module="subscription" status="active" variant="badge">
              Auto-Assigned
            </StatusBadge>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Credits Remaining:</span>
            <span className="font-semibold flex items-center gap-1">
              <Zap className="h-4 w-4" />
              {creditsRemaining.toLocaleString()}
            </span>
          </div>
          {subscription.bonusCredits > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Bonus Credits:</span>
              <span className="font-semibold text-green-600">
                +{subscription.bonusCredits.toLocaleString()}
              </span>
            </div>
          )}
          {creditsRemaining < 100 && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-2 text-sm text-yellow-800">
              ⚠️ Low credits! Consider upgrading your plan.
            </div>
          )}
        </div>

        <div className="space-y-2 border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Status:</span>
            <StatusBadge
              module="subscription"
              status={isActive ? "active" : "inactive"}
              variant="badge"
            >
              {subscription.status}
            </StatusBadge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Expires:
            </span>
            <span
              className={`text-sm ${
                isExpiringSoon ? "font-semibold text-orange-600" : ""
              }`}
            >
              {formatDate(subscription.endDate)}
            </span>
          </div>
        </div>

        {plan && (
          <div className="space-y-2 border-t pt-4">
            <h4 className="text-sm font-semibold">Module Access:</h4>
            {plan.modules?.length > 0 ? (
              <ul className="list-disc list-inside text-sm text-gray-600">
                {plan.modules.map((module, idx) => (
                  <li key={idx}>{module.page}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No module access</p>
            )}

            <h4 className="text-sm font-semibold mt-2">Feature Access:</h4>
            {plan.features?.length > 0 ? (
              <ul className="list-disc list-inside text-sm text-gray-600">
                {plan.features.slice(0, 5).map((feature, idx) => (
                  <li key={idx}>
                    {feature.page}.{feature.action}
                    {feature.creditCost > 0 && (
                      <span className="text-xs">
                        {" "}
                        ({feature.creditCost} credits)
                      </span>
                    )}
                  </li>
                ))}
                {plan.features.length > 5 && (
                  <li className="text-xs text-gray-500">
                    +{plan.features.length - 5} more
                  </li>
                )}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No feature access</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

