import "./App.css";
import React, { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  useMapEvents,
  Marker,
  ScaleControl,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Draggable from "react-draggable";
import markerRed from "./assets/markerRed.png";
import markerBlack from "./assets/markerBlack.png";
import roverIcon from "./assets/rover.png";
import axios from "axios";

function App() {
  const onlineURL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const offlineURL = "./maps/{z}/{x}/{y}.png";
  const [isOnline, setIsOnline] = useState(true);
  const [connect, setConnect] = useState(false);
  const mapM = useRef();

  const [locations, setLocations] = useState([]);

  const latRef = useRef(null);
  const lonRef = useRef(null);
  const [position, setPosition] = useState(null);
  const markerRef2 = useRef({ latitude: 0, longitude: 0 });
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
  function LocationMarker() {
    const markerRef = useRef(null);
    const map = useMapEvents({
      click(e) {
        setPosition(e.latlng);
        // map.flyTo(e.latlng, map.getZoom())
      },
      locationfound(e) {
        setPosition(e.latlng);
        map.flyTo(e.latlng, map.getZoom());
      },
    });

    const [flag, setFlag] = useState(false);
    const [vals, setVals] = useState([]);
    const [loc, setLoc] = useState();
    // var loc2 = { latitude: 0, longitude: 0 };
    const [mark, setMark] = useState();
    const [count, setCount] = useState(0);

    // var markers = L.markerClusterGroup();

    useEffect(() => {
      if (connect) {
        axios.get("http://localhost:4000/keys").then((res) => {
          // console.log(res.data);
          setVals((prev) => [...res.data]);
          if (res.data.length > 0) {
            res.data.map((val) => {
              if (val !== undefined) {
                document.getElementById("keys").innerHTML =
                  val.data.toUpperCase();
                // setTimeout(() => {
                //   document.getElementById("keys").innerHTML = "-";
                // }, 1000);
              }
            });
          }
          setFlag(!flag);
          setCount((count) => count + 1);
          axios.get("http://localhost:4000/navsat/fix").then((res) => {
            // console.log(res.data[0]);
            setLoc((prev) => res.data[0]);

            // setLocations((prev) => [res.data[0], ...prev])

            setLocations((prev) => [
              ...prev,
              new L.LatLng(res.data[0].latitude, res.data[0].longitude),
            ]);

            markerIn(res.data[0].latitude, res.data[0].longitude);
            // markerRef2.current._latlng.lat = res.data[0].latitude;
            // markerRef2.current._latlng.lng = res.data[0].longitude;
            document.getElementById("loclat").innerHTML =
              res?.data[0]?.latitude;
            document.getElementById("loclon").innerHTML =
              res?.data[0]?.longitude;
          });
          axios.get("http://localhost:4000/imu/data").then((res) => {
            document.getElementById("orx").innerHTML =
              res.data[0].orientation.x;
            document.getElementById("ory").innerHTML =
              res.data[0].orientation.y;
            document.getElementById("orz").innerHTML =
              res.data[0].orientation.z;
            document.getElementById("orw").innerHTML =
              res.data[0].orientation.w;

            document.getElementById("angx").innerHTML =
              res.data[0].angular_velocity.x;
            document.getElementById("angy").innerHTML =
              res.data[0].angular_velocity.y;
            document.getElementById("angz").innerHTML =
              res.data[0].angular_velocity.z;

            document.getElementById("linx").innerHTML =
              res.data[0].linear_acceleration.x;
            document.getElementById("liny").innerHTML =
              res.data[0].linear_acceleration.y;
            document.getElementById("linz").innerHTML =
              res.data[0].linear_acceleration.z;
          });
        });
      }
    }, [flag, connect]);
    console.log(locations);

    if(locations.length > 100) {
      setLocations([]);
    }

    const [multiMarker, setMultiMarker] = useState(false);
    const [multiMarker2, setMultiMarker2] = useState([]);

    function MultiMarkerEnabler() {
      if (multiMarker) {
        setMultiMarker(false);
      } else {
        setMultiMarker(true);
      }
    }

    function markerIn(lat, lon) {
      map.eachLayer((layer) => {
        // console.log(layer);
        if (layer instanceof L.Marker) {
          layer.remove();
        }

        // if (layer instanceof L.Polyline) {
        //   layer.remove();
        // }
      });

      var polyline = L.polyline(locations, {
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
      // map.addLayer(markers);
    }

    // console.log(mapM);

    // console.log("vals:", vals);
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
  // console.log(markerRef2);

  function keyPress(e) {
    if (connect) {
      // console.log("Key:", e.key);
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
      document.getElementById("orx").innerHTML = "-";
      document.getElementById("ory").innerHTML = "-";
      document.getElementById("orz").innerHTML = "-";
      document.getElementById("orw").innerHTML = "-";
      document.getElementById("angx").innerHTML = "-";
      document.getElementById("angy").innerHTML = "-";
      document.getElementById("angz").innerHTML = "-";
      document.getElementById("linx").innerHTML = "-";
      document.getElementById("liny").innerHTML = "-";
      document.getElementById("linz").innerHTML = "-";
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

  // function InputMarker2() {
  // return markerRef2.current.latitude===0 && markerRef2.current.longitude===0 ? null : (
  //   <Marker
  //     position={[markerRef2.current.latitude, markerRef2.current.longitude]}
  //     ref={markerRef2}
  //     icon={markerIcon2}
  //   ></Marker>
  // );

  // }

  // const [r, setR] = useState(false);
  // useEffect(()=> {
  //   setR(!r)
  // }, [])

  return (
    <div onKeyDown={keyPress}>
      {/* <Draggable>
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
            <div className="cnct" id="multiM" onClick={() => {
             
            }} style={{fontWeight:"bold"}}>Enable multiple pointers</div>
          </div>
        </Draggable> */}
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
          <br />
          <div
            style={{
              fontWeight: "bold",
              fontSize: "1.2rem",
              marginTop: "20px",
            }}
          >
            IMU Data:
          </div>
          <div>
            <span style={{ fontWeight: "bold" }}>Orientation:</span> <br />
            x: <span id="orx">-</span>
            <br />
            y: <span id="ory">-</span>
            <br />
            z: <span id="orz">-</span>
            <br />
            w: <span id="orw">-</span>
          </div>
          <div>
            <span style={{ fontWeight: "bold" }}>Angular Velocity:</span> <br />
            x: <span id="angx">-</span>
            <br />
            y: <span id="angy">-</span>
            <br />
            z: <span id="angz">-</span>
          </div>
          <div>
            <span style={{ fontWeight: "bold" }}>Linear Accelaration:</span>{" "}
            <br />
            x: <span id="linx">-</span>
            <br />
            y: <span id="liny">-</span>
            <br />
            z: <span id="linz">-</span>
          </div>
          {/* <div id="loclat"></div> */}
        </div>
      </Draggable>
      <Draggable cancel=".cancel">
        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
          onClick={() => {
            setIsOnline(!isOnline);
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
          {/* <label class="switch">
          <input type="checkbox" />
          <span class="slider round"></span>
        </label> */}
          <label for="inputlat">Latitude:</label>
          <input
            className="cancel"
            type="text"
            id="inputlat"
            name="inputlat"
            ref={latRef}
          />
          <label for="inputlon">Longitude:</label>
          <input
            className="cancel"
            type="text"
            id="inputlon"
            name="inputlon"
            ref={lonRef}
          />
          <button className="button cancel">
            <span>Go</span>
          </button>
        </form>
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
        </MapContainer>
      ) : (
        <MapContainer
          center={[23.777176, 90.399452]}
          zoom={13}
          attributionControl={true}
          // maxZoom={24}
          ref={mapM}
        >
          <TileLayer url={onlineURL} attribution="&#128994; Online" />
          <LocationMarker />

          <InputMarker />
          <ScaleControl />
        </MapContainer>
      )}
    </div>
  );
}

export default App;
