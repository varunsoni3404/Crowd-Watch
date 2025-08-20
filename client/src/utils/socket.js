// src/utils/socket.js
import { io } from "socket.io-client";

// const SOCKET_URL = "http://localhost:5000";
const SOCKET_URL = "https://sq04q0b3-5000.inc1.devtunnels.ms";

const socket = io(SOCKET_URL, {
  autoConnect: true,
});

export default socket;
