import React from "react";
import { LineChart } from "@mui/x-charts";
import { width } from "@mui/system";

function Science() {
  const dataset = Array.from({ length: 300 }, (_, i) => ({
    x: i + 1,
    y1: Math.floor(Math.random() * 100) + 1,
    y2: Math.floor(Math.random() * 200) + 1,
    y3: Math.floor(Math.random() * 20) + 1,
  }));
  return (
    <div>
      <div style={{ fontWeight: "bold", fontSize: "18pt", padding: "10px" }}>
        MT-10 Science Dashboard
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "5px",
          padding: "10px",
        }}
      >
        {/* Module 1 */}
        <div style={{ padding: "20px" }}>
          <div>Module 01</div>
          <div></div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              height: "40vh",
            }}
          >
            <LineChart
              // skipAnimation
              dataset={dataset}
              xAxis={[{ dataKey: "x" }]}
              series={[
                {
                  dataKey: "y1",
                  curve: "linear",
                  showMark: ({ index }) => index % 0 === 0,
                },
                {
                  dataKey: "y2",
                  curve: "linear",
                  showMark: ({ index }) => index % 0 === 0,
                },
                {
                  dataKey: "y3",
                  curve: "linear",
                  showMark: ({ index }) => index % 0 === 0,
                },
              ]}
              style={{ height: "100%", width: "100%" }}
            />
          </div>
        </div>
        {/* Module 2 */}
        <div style={{ padding: "20px" }}>
          <div>Module 02</div>
          <div></div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              height: "40vh",
            }}
          >
            <LineChart
              // skipAnimation
              dataset={dataset}
              xAxis={[{ dataKey: "x" }]}
              series={[
                {
                  dataKey: "y1",
                  curve: "linear",
                  showMark: ({ index }) => index % 0 === 0,
                },
                {
                  dataKey: "y2",
                  curve: "linear",
                  showMark: ({ index }) => index % 0 === 0,
                },
                {
                  dataKey: "y3",
                  curve: "linear",
                  showMark: ({ index }) => index % 0 === 0,
                },
              ]}
              style={{ height: "100%", width: "100%" }}
            />
          </div>
        </div>
        {/* Module 3 */}
        <div style={{ padding: "20px" }}>
          <div>Module 03</div>
          <div></div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              height: "40vh",
            }}
          >
            <LineChart
              // skipAnimation
              dataset={dataset}
              xAxis={[{ dataKey: "x" }]}
              series={[
                {
                  dataKey: "y1",
                  curve: "linear",
                  showMark: ({ index }) => index % 0 === 0,
                },
                {
                  dataKey: "y2",
                  curve: "linear",
                  showMark: ({ index }) => index % 0 === 0,
                },
                {
                  dataKey: "y3",
                  curve: "linear",
                  showMark: ({ index }) => index % 0 === 0,
                },
              ]}
              style={{ height: "100%", width: "100%" }}
            />
          </div>
        </div>
        {/* Module 4 */}
        <div style={{ padding: "20px" }}>
          <div>Module 04</div>
          <div></div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              height: "40vh",
            }}
          >
            <LineChart
              // skipAnimation
              dataset={dataset}
              xAxis={[{ dataKey: "x" }]}
              series={[
                {
                  label: "Experiment 1",
                  dataKey: "y1",
                  curve: "linear",
                  showMark: ({ index }) => index % 0 === 0,
                },
                {
                  label: "Experiment 2",
                  dataKey: "y2",
                  curve: "linear",
                  showMark: ({ index }) => index % 0 === 0,
                },
                {
                  label: "Experiment 3",
                  dataKey: "y3",
                  curve: "linear",
                  showMark: ({ index }) => index % 0 === 0,
                },
              ]}
              style={{ height: "100%", width: "100%" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Science;
