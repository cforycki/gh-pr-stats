import { useAtomValue } from "jotai";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { summedState } from "../state.js";

export const ChartBase = ({ chartData, height = 600 }) => {
  const summed = useAtomValue(summedState);
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

        {!summed && <Bar dataKey="created" name="Created" fill={"#7eb0d5"} />}
        {!summed && <Bar dataKey="approved" name="Approved" fill={"#b2e061"} />}
        {!summed && <Bar dataKey="requestedChanges" name="Requested changes" fill={"#bd7ebe"} />}
        {!summed && <Bar dataKey="comments" name="Comments" fill={"#8bd3c7"} />}
      </BarChart>
    </ResponsiveContainer>
  );
};
