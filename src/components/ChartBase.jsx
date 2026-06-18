import { useAtomValue } from "jotai";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { METRICS } from "../core/metrics.js";
import { metricsState, summedState } from "../state.js";

export const ChartBase = ({ chartData, height = 600 }) => {
  const summed = useAtomValue(summedState);
  const selected = useAtomValue(metricsState);
  const visibleMetrics = METRICS.filter((metric) => selected.includes(metric.key));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        width={500}
        height={600}
        data={chartData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={"name"} />
        <YAxis />
        <Tooltip labelStyle={{ color: "#666" }} cursor={{ fill: "var(--chakra-colors-gray-muted)", opacity: 0.65 }} />
        <Legend />

        {summed && <Bar dataKey="contributions" name="Contributions" fill={"#7eb0d5"} />}

        {!summed &&
          visibleMetrics.map(({ key, label, color }) => <Bar key={key} dataKey={key} name={label} fill={color} />)}
      </BarChart>
    </ResponsiveContainer>
  );
};
