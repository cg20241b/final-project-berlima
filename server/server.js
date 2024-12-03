import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // React app
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Mendengarkan pesan dari client
  socket.on("send_message", (data) => {
    console.log("Message received:", data);
    // Kirim pesan ke semua client
    io.emit("receive_message", "d");
  });

  io.emit("receive_message", "d");
  
  

  setInterval(() => {
    // Kirim pesan ke semua client
    io.emit("receive_message", "d");
  }, 500);


  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
