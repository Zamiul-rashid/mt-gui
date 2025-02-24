import React from "react";
import { LineChart } from "@mui/x-charts";
import { width } from "@mui/system";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import StopRoundedIcon from "@mui/icons-material/StopRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
const Coloraze = require("coloraze");

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
        <LineCard i={1} title={"UVC Module"} />
        {/* Module 2 */}
        <LineCard i={2} title={"Ninhydrin Test"} />
        {/* Module 3 */}
        <ColorCard i={3} title={"CO2 Test"} />
        {/* Module 4 */}
        <ColorCard i={4} title={"CO2 Test"} />
      </div>
    </div>
  );
}

function LineCard({ i, title, data }) {
  const dataset = Array.from({ length: 300 }, (_, i) => ({
    x: i + 1,
    y1: Math.floor(Math.random() * 100) + 1,
    y2: Math.floor(Math.random() * 200) + 1,
    y3: Math.floor(Math.random() * 20) + 1,
  }));
  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          Module {i}: {title}
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              color: "green",
              cursor: "pointer",
            }}
          >
            Start <PlayArrowRoundedIcon />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              color: "red",
              cursor: "pointer",
            }}
          >
            Stop <StopRoundedIcon />
          </div>
          <div
            style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          >
            Reset <RestartAltRoundedIcon />
          </div>
        </div>
      </div>
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
  );
}

function ColorCard({ i, title, data }) {

  const coloraze = new Coloraze();

  function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }
  

  function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
  }

  const dataset = Array.from({ length: 3 }, (_, i) => ({
    x: i + 1,
    R: Math.floor(Math.random() * 255) + 1,
    G: Math.floor(Math.random() * 255) + 1,
    B: Math.floor(Math.random() * 255) + 1,
    name: "",
  }));

  for (let i = 0; i < dataset.length; i++) {
    console.log(rgbToHex(dataset[i].R, dataset[i].G, dataset[i].B));
    var hex = rgbToHex(dataset[i].R, dataset[i].G, dataset[i].B);
    dataset[i].name = coloraze.name(hex);
  }

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          Module {i}: {title}
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              color: "green",
              cursor: "pointer",
            }}
          >
            Start <PlayArrowRoundedIcon />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              color: "red",
              cursor: "pointer",
            }}
          >
            Stop <StopRoundedIcon />
          </div>
          <div
            style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          >
            Reset <RestartAltRoundedIcon />
          </div>
        </div>
      </div>
      <div></div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          height: "40vh",
          gap: "10px",
          alignItems:"center"
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center", }}>
          <div
            style={{
              height: "200px",
              width: "200px",
              borderRadius: "100%",
              backgroundColor: `rgb(${dataset[0].R},${dataset[0].G},${dataset[0].B})`,
              fontWeight:"bold",
              color:"white",
              fontSize:"18px",
              display:"flex",
              alignItems:"center",
              justifyContent:"center"
            }}
          >{dataset[0].name}</div>
          <div>Tube 1</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
          <div
            style={{
              height: "200px",
              width: "200px",
              borderRadius: "100%",
              backgroundColor: `rgb(${dataset[1].R},${dataset[1].G},${dataset[1].B})`,
              fontWeight:"bold",
              color:"white",
              fontSize:"18px",
              display:"flex",
              alignItems:"center",
              justifyContent:"center"
            }}
          >{dataset[1].name}</div>
          <div>Tube 2</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
          <div
            style={{
              height: "200px",
              width: "200px",
              borderRadius: "100%",
              backgroundColor: `rgb(${dataset[2].R},${dataset[2].G},${dataset[2].B})`,
              fontWeight:"bold",
              color:"white",
              fontSize:"18px",
              display:"flex",
              alignItems:"center",
              justifyContent:"center"
            }}
          >{dataset[2].name}</div>
          <div>Tube 3</div>
        </div>
      </div>
    </div>
  );
}

export default Science;
