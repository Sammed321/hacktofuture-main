const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// In-memory store
// rooms[roomId] = { shapes: [], users: {}, markers: [] }
const rooms = {};

function getRoom(roomId) {
  if (!rooms[roomId]) {
    rooms[roomId] = { shapes: [], users: {}, markers: [] };
  }
  return rooms[roomId];
}

// REST: get room state (for late joiners)
app.get("/room/:roomId", (req, res) => {
  const room = getRoom(req.params.roomId);
  res.json({ shapes: room.shapes, userCount: Object.keys(room.users).length });
});

io.on("connection", (socket) => {
  let currentRoom = null;
  let currentUser = null;

  // --- JOIN ROOM ---
  socket.on("join-room", ({ roomId, username }) => {
    const room = getRoom(roomId);

    // Enforce 10-user limit
    if (Object.keys(room.users).length >= 10) {
      socket.emit("room-full");
      return;
    }

    currentRoom = roomId;
    currentUser = { id: socket.id, username: username || `User-${socket.id.slice(0, 4)}`, color: randomColor() };

    socket.join(roomId);
    room.users[socket.id] = currentUser;

    // Send existing canvas state to the new joiner
    socket.emit("room-state", { shapes: room.shapes, users: Object.values(room.users), markers: room.markers });

    // Notify others
    socket.to(roomId).emit("user-joined", currentUser);
    io.to(roomId).emit("users-update", Object.values(room.users));
  });

  // --- CURSOR MOVE ---
  socket.on("cursor-move", ({ x, y }) => {
    if (!currentRoom) return;
    socket.to(currentRoom).emit("cursor-update", { userId: socket.id, x, y, ...currentUser });
  });

  // --- SHAPE ADDED ---
  socket.on("shape-add", (shape) => {
    if (!currentRoom) return;
    const room = getRoom(currentRoom);
    // Assign a stable id if missing
    if (!shape.id) shape.id = uuidv4();
    room.shapes.push(shape);
    socket.to(currentRoom).emit("shape-add", shape);
  });

  // --- SHAPE UPDATED (move/resize) ---
  socket.on("shape-update", (shape) => {
    if (!currentRoom) return;
    const room = getRoom(currentRoom);
    const idx = room.shapes.findIndex((s) => s.id === shape.id);
    if (idx !== -1) room.shapes[idx] = shape;
    socket.to(currentRoom).emit("shape-update", shape);
  });

  // --- SHAPE DELETED ---
  socket.on("shape-delete", (shapeId) => {
    if (!currentRoom) return;
    const room = getRoom(currentRoom);
    room.shapes = room.shapes.filter((s) => s.id !== shapeId);
    socket.to(currentRoom).emit("shape-delete", shapeId);
  });

  // --- CLEAR CANVAS ---
  socket.on("canvas-clear", () => {
    if (!currentRoom) return;
    const room = getRoom(currentRoom);
    room.shapes = [];
    io.to(currentRoom).emit("canvas-clear");
  });

  // --- FREEHAND DRAWING (stroke streaming) ---
  socket.on("draw-stroke", (stroke) => {
    if (!currentRoom) return;
    socket.to(currentRoom).emit("draw-stroke", stroke);
  });

  // --- MARKERS ---
  socket.on("marker-add", (marker) => {
    if (!currentRoom) return;
    const room = getRoom(currentRoom);
    room.markers.push(marker);
    socket.to(currentRoom).emit("marker-add", marker);
  });

  socket.on("marker-update", (marker) => {
    if (!currentRoom) return;
    const room = getRoom(currentRoom);
    const idx = room.markers.findIndex(m => m.id === marker.id);
    if (idx !== -1) room.markers[idx] = marker;
    socket.to(currentRoom).emit("marker-update", marker);
  });

  socket.on("marker-delete", (id) => {
    if (!currentRoom) return;
    const room = getRoom(currentRoom);
    room.markers = room.markers.filter(m => m.id !== id);
    socket.to(currentRoom).emit("marker-delete", id);
  });

  // --- WEBRTC SIGNALING ---
  socket.on("voice-join", () => {
    if (!currentRoom) return;
    socket.to(currentRoom).emit("voice-user-joined", { userId: socket.id, ...currentUser });
  });

  socket.on("voice-offer", ({ to, offer }) => {
    io.to(to).emit("voice-offer", { from: socket.id, offer });
  });

  socket.on("voice-answer", ({ to, answer }) => {
    io.to(to).emit("voice-answer", { from: socket.id, answer });
  });

  socket.on("voice-ice", ({ to, candidate }) => {
    io.to(to).emit("voice-ice", { from: socket.id, candidate });
  });

  socket.on("voice-leave", () => {
    if (!currentRoom) return;
    socket.to(currentRoom).emit("voice-user-left", { userId: socket.id });
  });

  // --- DISCONNECT ---
  socket.on("disconnect", () => {
    if (!currentRoom) return;
    const room = rooms[currentRoom];
    if (room) {
      delete room.users[socket.id];
      io.to(currentRoom).emit("user-left", socket.id);
      io.to(currentRoom).emit("users-update", Object.values(room.users));
    }
  });
});

function randomColor() {
  const colors = ["#f87171", "#fb923c", "#facc15", "#4ade80", "#60a5fa", "#c084fc", "#f472b6"];
  return colors[Math.floor(Math.random() * colors.length)];
}

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Synapse backend running on port ${PORT}`));
