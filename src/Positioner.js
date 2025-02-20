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
  // const [isOnline, setIsOnline] = useState(true);
  const [connect, setConnect] = useState(false);
  const mapM = useRef();

  const [locations, setLocations] = useState([]);
  const [multiPoints, setMultiPoints] = useState([]);

  const latRef = useRef(null);
  const lonRef = useRef(null);
  const [position, setPosition] = useState(null);
  // const markerRef2 = useRef({ latitude: 0, longitude: 0 });
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
              style={{ fontWeight: "bold", fontSize: "1.2rem" }}
              id="loclat"
            >
              -
            </span>
          </div>
          <div>
            Longitude:{" "}
            <span
              style={{ fontWeight: "bold", fontSize: "1.2rem" }}
              id="loclon"
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
          <button className="button cancel">
            <span>Add Point</span>
          </button>
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
                {String.fromCharCode(65 + index)}: {point.lat}, {point.lon}{" "}
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
            <div>Latitude: {position && position.lat}</div>
            <div>Longitude: {position && position.lng}</div>
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
              // dashOffset="10"

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
