import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/core/components/ui/toggle-group";
import PieChart from "./pie";
import { useState } from "react";
import BarChart from "./bar";
import DonutPie from "./donut-pie";
import LineChart from "./line";

enum CHARTTYPE {
  "pie" = "pie",
  "bar" = "bar",
  "donutPie" = "donutPie",
  "line" = "line",
}
const CHARTS: (keyof typeof CHARTTYPE)[] = [
  CHARTTYPE.bar,
  CHARTTYPE.pie,
  CHARTTYPE.donutPie,
  CHARTTYPE.line,
];

const DummyCharts = () => {
  const [activeTab, setActiveTab] = useState<CHARTTYPE>(CHARTTYPE.line);
  return (
    <div className="">
      <br />
      <div className="flex w-full justify-center">
        <ToggleGroup
          type="single"
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as CHARTTYPE)}
        >
          {CHARTS.map((url) => (
            <ToggleGroupItem
              className="border p-5 capitalize"
              key={url}
              value={url}
            >
              {url}
              {/* {routeLabel(url)} */}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <br />
      {activeTab === CHARTTYPE.pie && <PieChart />}
      {activeTab === CHARTTYPE.bar && <BarChart />}
      {activeTab === CHARTTYPE.donutPie && <DonutPie />}
      {activeTab === CHARTTYPE.line && <LineChart />}
    </div>
  );
};

export default DummyCharts;
