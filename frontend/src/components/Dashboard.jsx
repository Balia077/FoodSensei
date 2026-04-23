import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";

const Dashboard = ({ data }) => {
  if (!data) return null;

  const chartData = [
    { name: "Calories", value: data.calories },
    { name: "Protein", value: data.protein },
    { name: "Fat", value: data.fat },
    { name: "Sugar", value: data.sugar }
  ];

  return (
    <div style={{ marginTop: 40 }}>
      <h2>Nutrition Breakdown</h2>

      <BarChart width={400} height={300} data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" />
      </BarChart>
    </div>
  );
};

export default Dashboard;