import { PageContent } from "@/core/components/ui/structure";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { useSubscription } from "../../hooks/useSubscription";
import { useCreditHistory } from "../../hooks/useCreditHistory";
import { useState } from "react";
import { formatDate } from "@/core/utils/date";
import { Zap, TrendingUp, TrendingDown, Gift, RefreshCw, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { SubscriptionStatus } from "../../components/subscription";

const CreditHistory = () => {
  const { subscription, creditsRemaining, refresh, error: subscriptionError } = useSubscription();
  const [page, setPage] = useState(1);
  const limit = 20;
  const { history, loading: historyLoading } = useCreditHistory(page, limit);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "credit":
        return <ArrowUp className="h-5 w-5 text-green-500" />;
      case "debit":
        return <ArrowDown className="h-5 w-5 text-red-500" />;
      case "bonus":
        return <Gift className="h-5 w-5 text-purple-500" />;
      case "reset":
        return <RefreshCw className="h-5 w-5 text-blue-500" />;
      case "refund":
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      default:
        return <Zap className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "credit":
      case "bonus":
      case "refund":
        return "text-green-600";
      case "debit":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case "credit":
        return "Credit Added";
      case "debit":
        return "Credit Used";
      case "bonus":
        return "Bonus Credit";
      case "reset":
        return "Credit Reset";
      case "refund":
        return "Credit Refund";
      default:
        return type;
    }
  };

  // Calculate statistics
  // Priority: 1) API-provided totals, 2) Subscription data, 3) Calculate from transactions
  const stats = (() => {
    // First, try to use API-provided totals (if backend includes them in response)
    if (history?.totalCredited !== undefined && history?.totalDebited !== undefined) {
      return {
        totalCredited: history.totalCredited,
        totalDebited: history.totalDebited,
      };
    }

    // Second, use subscription data if available (most accurate)
    if (subscription) {
      // Use creditsUsed directly from subscription (most accurate)
      const totalDebited = subscription.creditsUsed || 0;
      
      // Calculate total credited from subscription
      // Total credited = credits allocated + bonus credits
      const totalCredited = (subscription.creditsAllocated || 0) + (subscription.bonusCredits || 0);
      
      return {
        totalCredited,
        totalDebited,
      };
    }

    // Fallback: calculate from current page transactions only
    // Note: This will only show totals for the current page, not all transactions
    return history?.transactions.reduce(
      (acc, transaction) => {
        if (transaction.transactionType === "credit" || transaction.transactionType === "bonus" || transaction.transactionType === "refund") {
          acc.totalCredited += transaction.amount;
        } else if (transaction.transactionType === "debit") {
          acc.totalDebited += transaction.amount;
        }
        return acc;
      },
      { totalCredited: 0, totalDebited: 0 }
    ) || { totalCredited: 0, totalDebited: 0 };
  })();

  const totalPages = history ? Math.ceil(history.total / limit) : 0;

  return (
    <PageContent
      header={{
        title: "Credit Management",
        description: "View your credit balance, transaction history, and usage statistics",
        actions: (
          <Button variant="outlined" onClick={refresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        ),
      }}
    >
      <div className="space-y-6">
        {/* Subscription Status Card */}
        {subscriptionError && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <div className="text-yellow-800 font-medium mb-1">Note</div>
            <div className="text-sm text-yellow-700">
              Unable to load subscription details, but you can still view your transaction history below.
            </div>
          </div>
        )}
        <SubscriptionStatus />

        {/* Credit Balance Overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Current Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Zap className="h-6 w-6 text-yellow-500" />
                <div>
                  <div className="text-3xl font-bold">{creditsRemaining.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Credits Available</div>
                </div>
              </div>
              {subscription && subscription.bonusCredits > 0 && (
                <div className="mt-2 text-sm text-green-600">
                  +{subscription.bonusCredits.toLocaleString()} bonus credits
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Credited
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-green-500" />
                <div>
                  <div className="text-3xl font-bold text-green-600">
                    {stats.totalCredited.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Credits Added</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Used
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-6 w-6 text-red-500" />
                <div>
                  <div className="text-3xl font-bold text-red-600">
                    {stats.totalDebited.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Credits Spent</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="py-8 text-center text-gray-500">Loading transactions...</div>
            ) : !history || history.transactions.length === 0 ? (
              <div className="py-8 text-center text-gray-500">No transaction history found</div>
            ) : (
              <>
                <div className="space-y-3">
                  {history.transactions.map((transaction) => (
                    <div
                      key={transaction._id}
                      className="flex items-center justify-between rounded-lg border bg-white p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                          {getTransactionIcon(transaction.transactionType)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {transaction.description}
                          </div>
                          {transaction.feature && (
                            <div className="text-sm text-gray-500">
                              Feature: {transaction.feature}
                            </div>
                          )}
                          <div className="text-xs text-gray-400">
                            {formatDate(transaction.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-lg font-semibold ${getTransactionColor(
                            transaction.transactionType
                          )}`}
                        >
                          {transaction.transactionType === "debit" ? "-" : "+"}
                          {transaction.amount.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          Balance: {transaction.balanceAfter.toLocaleString()}
                        </div>
                        <div className="mt-1 text-xs text-gray-400">
                          {getTransactionLabel(transaction.transactionType)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between border-t pt-4">
                    <div className="text-sm text-gray-600">
                      Page {page} of {totalPages} ({history.total} total transactions)
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outlined"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outlined"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContent>
  );
};

export default CreditHistory;

