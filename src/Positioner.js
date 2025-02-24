import "./App.css";
import React, { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  useMapEvents,
  Marker,
  Polyline,
  ScaleControl,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Draggable from "react-draggable";
import markerRed from "./assets/markerRed.png";
import markerBlack from "./assets/markerBlack.png";
import roverIcon from "./assets/rover.png";
import compassIcon from "./assets/compass.png";
import axios from "axios";

function Positioner() {
  const onlineURL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const offlineURL = "./maps/{z}/{x}/{y}.png";
  const [connect, setConnect] = useState(false);
  const mapM = useRef();

  const [locations, setLocations] = useState([]);
  const [multiPoints, setMultiPoints] = useState([]);
  const [distance, setDistance] = useState(null);
  const [copyMessage, setCopyMessage] = useState("");

  const latRef = useRef(null);
  const lonRef = useRef(null);
  const [position, setPosition] = useState(null);
  const markerIcon = L.icon({
    iconUrl: markerRed,
    iconSize: [38, 38],
    iconAnchor: [19, 40],
    popupAnchor: [-3, -76],
  });
  const markerIcon2 = L.icon({
    iconUrl: markerBlack,
    iconSize: [38, 38],
    iconAnchor: [19, 40],
    popupAnchor: [-3, -76],
  });

  const markerIcon3 = L.icon({
    iconUrl: roverIcon,
    iconSize: [38, 38],
    iconAnchor: [19, 40],
    popupAnchor: [-3, -76],
  });

  function createLabeledIcon(label) {
    return L.divIcon({
      html: `<div style="background-color: white; border: 1px solid black; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">${label}</div>`,
      className: "",
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  }

  // Copy to clipboard function
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      function() {
        setCopyMessage("Copied!");
        setTimeout(() => setCopyMessage(""), 2000);
      },
      function(err) {
        setCopyMessage("Failed to copy");
        setTimeout(() => setCopyMessage(""), 2000);
      }
    );
  };

  // Function to clear coordinate inputs
  const clearCoordinateInputs = () => {
    if (latRef.current) latRef.current.value = '';
    if (lonRef.current) lonRef.current.value = '';
  };

  // Calculate distance between two coordinates in meters using Haversine formula
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Radius of the earth in meters
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in meters
    return d;
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  // Update distance calculation whenever multiPoints changes
  useEffect(() => {
    if (multiPoints.length >= 2) {
      const latestPoints = [...multiPoints].slice(-2);
      const dist = calculateDistance(
        latestPoints[0].lat,
        latestPoints[0].lon,
        latestPoints[1].lat,
        latestPoints[1].lon
      );
      setDistance(dist);
    } else {
      setDistance(null);
    }
  }, [multiPoints]);

  function LocationMarker() {
    const markerRef = useRef(null);
    const map = useMapEvents({
      click(e) {
        setPosition(e.latlng);
      },
      locationfound(e) {
        setPosition(e.latlng);
        map.flyTo(e.latlng, map.getZoom());
      },
    });

    useEffect(() => {
      if (connect) {
        const fetchLocation = async () => {
          await axios.get("http://localhost:4000/navsat/fix").then((res) => {
            setLocations((prev) => [
              ...prev,
              new L.LatLng(res?.data[0]?.latitude, res?.data[0]?.longitude),
            ]);

            markerIn(res?.data[0]?.latitude, res?.data[0]?.longitude);
            document.getElementById("loclat").innerHTML =
              res?.data[0]?.latitude;
            document.getElementById("loclon").innerHTML =
              res?.data[0]?.longitude;
          });
        };

        const fetchYaw = async () => {
          await axios.get("http://localhost:4000/yaw").then((res) => {
            if (res.data[0] !== undefined) {
              document.getElementById("yaw").style.transform = `rotate(${-res.data[0].data}deg)`;
            }
          });
        };

        fetchYaw();
        fetchLocation();
      }
    }, [connect]);

    if (locations.length > 100) {
      setLocations([]);
    }

    function markerIn(lat, lon) {
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker && layer.options.icon !== markerIcon3) {
          layer.remove();
        }
      });

      L.polyline(locations, {
        color: "blue",
        weight: 2,
        opacity: 0.5,
        smoothFactor: 1,
      }).addTo(map);

      if (position !== null) {
        var marker = L.marker([position.lat, position.lng], {
          icon: markerIcon,
        });
        marker.addTo(map);
      }

      var marker = L.marker([lat, lon], { icon: markerIcon3 });
      marker.addTo(map);
    }

    return position === null ? null : (
      <Marker
        position={position}
        ref={markerRef}
        icon={markerIcon}
        onClick={(e) => {
          e.preventDefault();
          map.flyTo(position, 13);
        }}
      ></Marker>
    );
  }

  const [pressedKeys, setPressedKeys] = useState();

  function keyPress(e) {
    if (connect) {
      setPressedKeys(e.key.toUpperCase());
      axios.post("http://localhost:4000/keys", { key: e.key });
    }
  }

  useEffect(() => {
    setTimeout(() => {
      setPressedKeys();
    }, 500);
  }, [pressedKeys]);

  if (!connect) {
    setTimeout(() => {
      setLocations([]);
      document.getElementById("loclat").innerHTML = "-";
      document.getElementById("loclon").innerHTML = "-";
    }, 500);
  }

  function InputMarker() {
    const markerRef2 = useRef(null);

    return latRef.current.value === 0 || lonRef.current.value === 0 ? null : (
      <Marker
        position={[latRef.current.value, lonRef.current.value]}
        ref={markerRef2}
        icon={markerIcon2}
      ></Marker>
    );
  }

  function handleAddPoint() {
    const lat = parseFloat(latRef.current.value);
    const lon = parseFloat(lonRef.current.value);
    if (!isNaN(lat) && !isNaN(lon)) {
      setMultiPoints((prev) => [...prev, { lat, lon }]);
    }
  }

  function handleRemovePoint(index) {
    setMultiPoints((prev) => prev.filter((_, i) => i !== index));
  }

  function handleMovePointUp(index) {
    if (index > 0) {
      setMultiPoints((prev) => {
        const newPoints = [...prev];
        [newPoints[index - 1], newPoints[index]] = [newPoints[index], newPoints[index - 1]];
        return newPoints;
      });
    }
  }

  function handleMovePointDown(index) {
    if (index < multiPoints.length - 1) {
      setMultiPoints((prev) => {
        const newPoints = [...prev];
        [newPoints[index + 1], newPoints[index]] = [newPoints[index], newPoints[index + 1]];
        return newPoints;
      });
    }
  }

  return (
    <div onKeyDown={keyPress}>
      <Draggable>
        <div
          style={{
            position: "absolute",
            top: "90px",
            left: "30px",
            zIndex: "9999",
            display: "flex",
            flexDirection: "column",
            background: "rgba(255, 255, 255, 0.12)",
            borderRadius: "16px",
            boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
            backdropFilter: "blur(13.5px)",
            padding: "10px",
          }}
        >
          <img src={compassIcon} id="yaw" alt="compass" style={{ width: "150px" }} />
        </div>
      </Draggable>
      <Draggable cancel=".cancel">
        <div
          style={{
            position: "absolute",
            bottom: "30px",
            left: "30px",
            zIndex: "9999",
            display: "flex",
            flexDirection: "column",
            background: "rgba(255, 255, 255, 0.12)",
            borderRadius: "16px",
            boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
            backdropFilter: "blur(13.5px)",
            padding: "10px",
            minWidth: "15rem",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontWeight: "bold",
                fontSize: "1.2rem",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "10px",
              }}
            >
              ROS{" "}
              <span id="cnctDot" style={{ fontSize: "0.5rem" }}>
                🔴
              </span>
            </div>
            <div
              className="cnct"
              id="cnctStatus"
              onClick={() => {
                setConnect(!connect);
                document.getElementById("cnctStatus").innerHTML = !connect
                  ? "Disconnect"
                  : "Connect";
                document.getElementById("cnctDot").innerHTML = !connect
                  ? "🟢"
                  : "🔴";
                if (connect === false) {
                  document.getElementById("loclat").innerHTML = "-";
                  document.getElementById("loclon").innerHTML = "-";
                }
              }}
            >
              Connect
            </div>
          </div>
          <div>
            Pressed Key:{" "}
            <span style={{ fontWeight: "bold", fontSize: "2rem" }} id="keys">
              {pressedKeys ? pressedKeys : "-"}
            </span>
          </div>
          <br />
          <div
            style={{
              fontWeight: "bold",
              fontSize: "1.2rem",
              marginTop: "20px",
            }}
          >
            Location data:
          </div>
          <div>
            Latitude:{" "}
            <span
              style={{ fontWeight: "bold", fontSize: "1.2rem", cursor: "pointer" }}
              id="loclat"
              onClick={() => {
                const lat = document.getElementById("loclat").innerText;
                if (lat !== "-") copyToClipboard(lat);
              }}
              title="Click to copy"
            >
              -
            </span>
          </div>
          <div>
            Longitude:{" "}
            <span
              style={{ fontWeight: "bold", fontSize: "1.2rem", cursor: "pointer" }}
              id="loclon"
              onClick={() => {
                const lon = document.getElementById("loclon").innerText;
                if (lon !== "-") copyToClipboard(lon);
              }}
              title="Click to copy"
            >
              -
            </span>
          </div>
        </div>
      </Draggable>
      <Draggable cancel=".cancel">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddPoint();
          }}
          style={{
            position: "absolute",
            top: "30px",
            right: "30px",
            zIndex: "9999",
            display: "flex",
            flexDirection: "column",
            background: "rgba(255, 255, 255, 0.12)",
            borderRadius: "16px",
            boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
            backdropFilter: "blur(13.5px)",
            padding: "10px",
          }}
        >
          <label htmlFor="inputlat">Latitude:</label>
          <input
            className="cancel"
            type="text"
            id="inputlat"
            name="inputlat"
            ref={latRef}
          />
          <label htmlFor="inputlon">Longitude:</label>
          <input
            className="cancel"
            type="text"
            id="inputlon"
            name="inputlon"
            ref={lonRef}
          />
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="button cancel" type="submit">
              <span>Add Point</span>
            </button>
            <button 
              className="button cancel" 
              type="button" 
              onClick={clearCoordinateInputs}
            >
              <span>Clear</span>
            </button>
          </div>
        </form>
      </Draggable>
      <Draggable>
        <div
          style={{
            position: "absolute",
            top: "250px",
            right: "30px",
            zIndex: "9999",
            display: "flex",
            flexDirection: "column",
            background: "rgba(255, 255, 255, 0.12)",
            borderRadius: "16px",
            boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
            backdropFilter: "blur(13.5px)",
            padding: "10px",
          }}
        >
          <div style={{ fontWeight: "bold" }}>Points</div>
          <ul>
            {multiPoints.map((point, index) => (
              <li key={index}>
                <span 
                  style={{ cursor: "pointer" }}
                  title="Click to copy coordinates" 
                  onClick={() => copyToClipboard(`${point.lat}, ${point.lon}`)}
                >
                  {String.fromCharCode(65 + index)}: {point.lat}, {point.lon}
                </span>{" "}
                <button onClick={() => handleRemovePoint(index)}>Remove</button>
                <button onClick={() => handleMovePointUp(index)}>Up</button>
                <button onClick={() => handleMovePointDown(index)}>Down</button>
              </li>
            ))}
          </ul>
        </div>
      </Draggable>
      {position && (
        <Draggable>
          <div
            style={{
              position: "absolute",
              bottom: "30px",
              right: "30px",
              zIndex: "9999",
              display: "flex",
              flexDirection: "column",
              background: "rgba(255, 255, 255, 0.12)",
              borderRadius: "16px",
              boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
              backdropFilter: "blur(13.5px)",
              padding: "10px",
            }}
          >
            <div style={{ fontWeight: "bold" }}>Output</div>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "5px", gap: "10px" }}>
              <div>Latitude: <span style={{ fontWeight: "bold" }}>{position.lat}</span></div>
              <button 
                onClick={() => copyToClipboard(position.lat)}
                style={{ padding: "2px 8px" }}
              >
                Copy Lat
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div>Longitude: <span style={{ fontWeight: "bold" }}>{position.lng}</span></div>
              <button 
                onClick={() => copyToClipboard(position.lng)}
                style={{ padding: "2px 8px" }}
              >
                Copy Lon
              </button>
            </div>
            {copyMessage && <div style={{ color: "green", marginTop: "5px", textAlign: "center" }}>{copyMessage}</div>}
          </div>
        </Draggable>
      )}
      {/* Distance display component showing meters */}
      {distance !== null && (
        <Draggable>
          <div
            style={{
              position: "absolute",
              bottom: "150px",
              right: "30px",
              zIndex: "9999",
              display: "flex",
              flexDirection: "column",
              background: "rgba(255, 255, 255, 0.12)",
              borderRadius: "16px",
              boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
              backdropFilter: "blur(13.5px)",
              padding: "10px",
              minWidth: "200px",
            }}
          >
            <div style={{ fontWeight: "bold" }}>Distance</div>
            <div>Between last two points:</div>
            <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
              {Math.round(distance)} meters
            </div>
          </div>
        </Draggable>
      )}
      {!navigator.onLine ? (
        <MapContainer
          attributionControl={true}
          center={[23.777176, 90.399452]}
          zoom={13}
          minZoom={6}
          maxZoom={13}
          ref={mapM}
        >
          <TileLayer url={offlineURL} attribution="&#128308; Offline" />
          <LocationMarker />
          <InputMarker />
          <ScaleControl />
          {multiPoints.map((point, index) => (
            <Marker
              key={index}
              position={[point.lat, point.lon]}
              icon={createLabeledIcon(String.fromCharCode(65 + index))}
            />
          ))}
          {multiPoints.length > 1 && (
            <Polyline
              positions={multiPoints.map((point) => [point.lat, point.lon])}
              color="red"
              dashArray='10'
            />
          )}
        </MapContainer>
      ) : (
        <MapContainer
          center={[23.777176, 90.399452]}
          zoom={13}
          attributionControl={true}
          ref={mapM}
        >
          <TileLayer url={onlineURL} attribution="&#128994; Online" />
          <LocationMarker />
          <InputMarker />
          <ScaleControl />
          {multiPoints.map((point, index) => (
            <Marker
              key={index}
              position={[point.lat, point.lon]}
              icon={createLabeledIcon(String.fromCharCode(65 + index))}
            />
          ))}
          {multiPoints.length > 1 && (
            <Polyline
              positions={multiPoints.map((point) => [point.lat, point.lon])}
              color="red"
              dashArray='10'
            />
          )}
        </MapContainer>
      )}
    </div>
  );
}

export default Positioner;