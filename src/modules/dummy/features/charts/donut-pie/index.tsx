import DonutPieChart1 from "./DonutPieChart1";
import DonutPieChart2 from "./DonutPieChart2";
import DonutPieChart3 from "./DonutPieChart3";
import DonutPieChart4 from "./DonutPieChart4";
import DonutPieChart5 from "./DonutPieChart5";
import DonutPieChart6 from "./DonutPieChart6";

const DonutPie = () => {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3 [&>div]:max-h-[300px] [&>div]:rounded-md [&>div]:border [&>div]:p-5 [&>div]:shadow">
      <DonutPieChart1 />
      <DonutPieChart2 />
      <DonutPieChart3 />
      <DonutPieChart4 />
      <DonutPieChart5 />
      <DonutPieChart6 />
    </div>
  );
};

export default DonutPie;
