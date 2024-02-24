const express = require("express");
const app = express();
const http = require("http");
const websocket = require("ws");
const roslib = require("roslib");
const bodyParser = require('body-parser');
app.use(bodyParser.json());

var cors = require('cors');
app.use(cors());

const server = http.createServer(app);
const port = 4000;

// respond with "hello world" when a GET request is made to the homepage
app.get("/keys", (req, res) => {
  const ros = new roslib.Ros({ encoding: "ascii" });

  ros.on('error', function(error) {
    console.error('ROSlib error:', error);
  });

  ros.connect("ws://localhost:9090");
  console.log("ROS connected");

  const listener = new roslib.Topic({
    ros: ros,
    name: "/keys",
    messageType: "std_msgs/String",
  });

  var msgs = []
  // Array to store received messages
  listener.subscribe(function (message) {
    console.log("Received message on " + listener.name + ": " + message.data);
    msgs.push(message);
  });

  setTimeout(() => {
    listener.unsubscribe();
    ros.close();
    res.send(msgs);
  }, 200);
});

app.get("/navsat/fix", (req, res) => {
  const ros = new roslib.Ros({ encoding: "ascii" });

  ros.on('error', function(error) {
    console.error('ROSlib error:', error);
  });

  ros.connect("ws://localhost:9090");
  console.log("ROS connected");

  const listener = new roslib.Topic({
    ros: ros,
    name: "/navsat/fix",
    messageType: "sensor_msgs/NavSatFix",
  });

  var msgs = []
  // Array to store received messages
  listener.subscribe(function (message) {
    console.log("Received message on " + listener.name + ": " + message);
    console.log(message.latitude);
    console.log(message.longitude);
    msgs.push(message);
  });

  setTimeout(() => {
    listener.unsubscribe();
    ros.close();
    res.send(msgs);
  }, 200);
});

app.get("/imu/data", (req, res) => {
  const ros = new roslib.Ros({ encoding: "ascii" });

  ros.on('error', function(error) {
    console.error('ROSlib error:', error);
  });

  ros.connect("ws://localhost:9090");
  console.log("ROS connected");

  const listener = new roslib.Topic({
    ros: ros,
    name: "/imu/data",
    messageType: "sensor_msgs/Imu",
  });

  var msgs = []

  listener.subscribe(function (message) {
    console.log("Received message on " + listener.name + ": " + message);
    console.log(message.orientation);
    msgs.push(message);
  });

  setTimeout(() => {
    listener.unsubscribe();
    ros.close();
    res.send(msgs);
  }, 200);
});

app.post("/keys", (req, res) => {
  const ros = new roslib.Ros({ encoding: "ascii" });

  ros.on('error', function(error) {
    console.error('ROSlib error:', error);
  });

  ros.connect("ws://localhost:9090");
  console.log("ROS connected");

  const talker = new roslib.Topic({
    ros: ros,
    name: "/keys",
    messageType: "std_msgs/String",
  });

  const msg = new roslib.Message({
    data: req.body.key
  });

  talker.publish(msg);
  // ros.close();
  console.log("Key published:", req.body.key);
  res.send("Published");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
