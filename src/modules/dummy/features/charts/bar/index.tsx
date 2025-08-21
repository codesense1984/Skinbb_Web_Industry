import BarChart1 from "./BarChart1";
import BarChart2 from "./BarChart2";
import BarChart3 from "./BarChart3";
import BarChart4 from "./BarChart4";
import BarChart5 from "./BarChart5";

const BarChart = () => {
  return (
    <div className="grid flex-1 items-stretch gap-10 md:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:gap-10 [&>div]:max-h-[300px] [&>div]:w-full [&>div]:rounded-md [&>div]:border [&>div]:p-5 [&>div]:shadow">
      <BarChart1 />
      <BarChart2 />
      <BarChart3 />
      <BarChart4 />
      <BarChart5 />
    </div>
  );
};

export default BarChart;
