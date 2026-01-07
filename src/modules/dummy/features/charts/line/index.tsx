import LineChart1 from "./LineChart1";
import LineChart2 from "./LineChart2";
import LineChart3 from "./LineChart3";

const LineChart = () => {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3 [&>div]:max-h-[300px] [&>div]:rounded-md [&>div]:border [&>div]:p-5 [&>div]:shadow">
      <LineChart1 />
      <LineChart2 />
      <LineChart3 />
    </div>
  );
};

export default LineChart;
