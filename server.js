const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

let users = 0;

io.on("connection", socket => {
  users++;
  io.emit("users", users);

  socket.on("chatMessage", data => {
    socket.broadcast.emit("chatMessage", data);
    socket.emit("seen", data.id);
  });

  socket.on("typing", name => {
    socket.broadcast.emit("typing", name);
  });

  socket.on("deleteForAll", id => {
    io.emit("deleteForAll", id);
  });

  socket.on("disconnect", () => {
    users--;
    io.emit("users", users);
  });
});

http.listen(3000, () =>
  console.log("Server running on http://localhost:3000")
);