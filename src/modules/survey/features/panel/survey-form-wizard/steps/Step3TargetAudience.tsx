import { useForm } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/core/components/ui/form";
import { Input } from "@/core/components/ui/input";
import { SelectRoot, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { useMetroCities, useEstimateEligibleRespondents } from "@/modules/survey/hooks";
import { formatCurrency } from "@/core/utils/number";
import { useMemo } from "react";
import type { SurveyFormData } from "../index";

interface Step3TargetAudienceProps {
  form: ReturnType<typeof useForm<SurveyFormData>>;
}

const Step3TargetAudience = ({ form }: Step3TargetAudienceProps) => {
  const locationTarget = form.watch("locationTarget");
  const reward = form.watch("reward") || 0;
  const priceMultiplier = form.watch("priceMultiplier") || 1;
  const questions = form.watch("questions") || [];

  const { data: metroCitiesData } = useMetroCities();
  const metroCities = metroCitiesData?.data?.metroCities || [];

  // Prepare params for eligible respondents estimation
  const eligibleParams = useMemo(() => {
    if (!locationTarget) return null;
    
    return {
      locationTarget,
      ...(locationTarget === "Metro" && form.watch("targetMetro") && {
        targetMetro: form.watch("targetMetro"),
      }),
      ...(locationTarget === "City" && form.watch("targetCity") && {
        targetCity: form.watch("targetCity"),
      }),
    };
  }, [locationTarget, form.watch("targetMetro"), form.watch("targetCity")]);

  // Get eligible respondents count estimation
  const { data: eligibleData, isLoading: isLoadingEligible } = useEstimateEligibleRespondents(
    eligibleParams,
    !!locationTarget && (locationTarget === "All" || (locationTarget === "Metro" && form.watch("targetMetro")) || (locationTarget === "City" && form.watch("targetCity")))
  );

  const eligibleCount = eligibleData?.data?.count || 0;

  // Calculate estimated cost
  const estimatedCost = useMemo(() => {
    const baseCost = questions.reduce((sum, q) => {
      return sum + (q.basePrice || 0);
    }, 0);
    return baseCost * priceMultiplier;
  }, [questions, priceMultiplier]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Location Target</h3>
          <FormField
            control={form.control}
            name="locationTarget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location Target</FormLabel>
                <FormControl>
                  <SelectRoot onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All</SelectItem>
                      <SelectItem value="Metro">Metro</SelectItem>
                      <SelectItem value="City">City</SelectItem>
                    </SelectContent>
                  </SelectRoot>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {locationTarget === "Metro" && (
          <FormField
            control={form.control}
            name="targetMetro"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Metro City</FormLabel>
                <FormControl>
                  <SelectRoot onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select metro city" />
                    </SelectTrigger>
                    <SelectContent>
                      {metroCities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectRoot>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {locationTarget === "City" && (
          <FormField
            control={form.control}
            name="targetCity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter city name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="reward"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reward per completed response (coins)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter reward amount"
                  {...field}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? parseFloat(e.target.value) : 0,
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="priceMultiplier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price Multiplier</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Enter price multiplier"
                  {...field}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? parseFloat(e.target.value) : 1,
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Available Responses</p>
              <p className="text-lg font-semibold">
                {isLoadingEligible ? "Loading..." : eligibleCount.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Estimated Cost</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(estimatedCost)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Reward per User</p>
              <p className="text-lg font-semibold">{reward} coins</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="text-sm font-medium">
                {locationTarget}
                {locationTarget === "Metro" &&
                  form.watch("targetMetro") &&
                  `: ${form.watch("targetMetro")}`}
                {locationTarget === "City" &&
                  form.watch("targetCity") &&
                  `: ${form.watch("targetCity")}`}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Step3TargetAudience;

