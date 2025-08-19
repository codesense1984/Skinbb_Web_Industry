import { Button } from "@/components/ui/button";
import { StatChartCard } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageContent } from "@/components/ui/structure";
import FocusIngredients from "./FocusIngredients";
import FunctionalTrends from "./FunctionalTrends";
import IngredientOvertime from "./IngredientOvertime";
import TopCategoryTrends from "./TopCategoryTrends";
import { Tooltip } from "@/components/ui/tooltip";
import { ArrowsPointingOutIcon } from "@heroicons/react/24/outline";
import { NavLink, useLocation } from "react-router";
import { ROUTES } from "@/routes/routes.constant";
import { lazy, Suspense } from "react";
const RelationshipPreview = lazy(
  () => import("@/features/relationship-preview"),
);
// import FunctionalTrends from "./FunctionalTrends";

const Ingredient = () => {
  const location = useLocation();
  const searchParams = location.search;
  console.log("🚀 ~ Ingredient ~ searchParams:", searchParams);
  return (
    <PageContent
      header={{
        title: "Ingredients",
        description: "Discover top brands from around the world.",
        actions: (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <Label>Age</Label>
              <SelectRoot defaultValue="All">
                <SelectTrigger className="bg-background w-full truncate">
                  <SelectValue placeholder="Select a age" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Age</SelectLabel>
                    {["All", "18–24", "25–32", "33–50", "51+", "Unknown"].map(
                      (item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ),
                    )}
                  </SelectGroup>
                </SelectContent>
              </SelectRoot>
            </div>
            <div className="flex items-center gap-2">
              <Label>Gender</Label>
              <SelectRoot defaultValue="All">
                <SelectTrigger className="bg-background w-full truncate">
                  <SelectValue placeholder="Select a gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Gender</SelectLabel>
                    {["All", "Male", "Female", "Unknown"].map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </SelectRoot>
            </div>
            <Button type="submit" variant={"outlined"} color={"primary"}>
              Apply
            </Button>
          </div>
        ),
      }}
    >
      <IngredientOvertime />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FocusIngredients />
        <TopCategoryTrends />
      </div>
      <FunctionalTrends />
      <StatChartCard
        name="Relationship Builder"
        className="md:max-h-full"
        actions={
          <Tooltip title="Full Screen">
            <Button size={"icon"} variant={"ghost"} asChild>
              <NavLink to={`${ROUTES.RELATIONSHIP_PREVIEW}${searchParams}`}>
                <ArrowsPointingOutIcon />
              </NavLink>
            </Button>
          </Tooltip>
        }
      >
        {/* <IngredientProductMap /> */}
        <Suspense
          fallback={
            <div className="h-[400px] animate-pulse overflow-hidden rounded-lg border inset-shadow-sm">
              <div className="bg-muted-foreground/20 text-muted-foreground flex h-full items-center justify-center rounded">
                Loading...
              </div>
            </div>
          }
        >
          <RelationshipPreview
            className="bg-muted rounded-lg border inset-shadow-sm"
            height="400px"
          />
        </Suspense>
      </StatChartCard>
    </PageContent>
  );
};

export default Ingredient;
