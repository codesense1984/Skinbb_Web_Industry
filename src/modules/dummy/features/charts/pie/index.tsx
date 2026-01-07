import PieChart1 from "./PieChart1";
import PieChart2 from "./PieChart2";
import PieChart3 from "./PieChart3";
import PieChart4 from "./PieChart4";
import PieChart5 from "./PieChart5";
import PieChart6 from "./PieChart6";

const PieChart = () => {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3 [&>div]:max-h-[300px] [&>div]:rounded-md [&>div]:border [&>div]:p-5 [&>div]:shadow">
      <PieChart1 />
      <PieChart2 />
      <PieChart3 />
      <PieChart4 />
      <PieChart5 />
      <PieChart6 />
    </div>
  );
};

export default PieChart;
