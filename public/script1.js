const socket = io();
const messages = document.getElementById("messages");
const msg = document.getElementById("msg");
const send = document.getElementById("send");
const typingDiv = document.getElementById("typing");
const status = document.getElementById("status");
const darkBtn = document.getElementById("darkBtn");
const emojiBtn = document.getElementById("emojiBtn");
const emojiBox = document.getElementById("emojiBox");

let username = localStorage.getItem("name") || prompt("Enter your name");
localStorage.setItem("name", username);

darkBtn.onclick = () => document.body.classList.toggle("dark");

emojiBtn.onclick = () => {
  emojiBox.style.display =
    emojiBox.style.display === "block" ? "none" : "block";
};

emojiBox.onclick = e => {
  msg.value += e.target.innerText;
};

socket.on("users", n => {
  status.innerText = n > 1 ? "Online" : "Offline";
});

msg.addEventListener("input", () => {
  socket.emit("typing", username);
});

socket.on("typing", name => {
  typingDiv.innerText = name + " is typing...";
  setTimeout(() => (typingDiv.innerText = ""), 800);
});

send.onclick = sendMsg;
msg.addEventListener("keypress", e => {
  if (e.key === "Enter") sendMsg();
});

function sendMsg() {
  if (!msg.value.trim()) return;

  const data = {
    id: Date.now(),
    user: username,
    text: msg.value,
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    })
  };

  showMsg(data, true);
  socket.emit("chatMessage", data);
  save(data, true);
  msg.value = "";
}

socket.on("chatMessage", data => {
  showMsg(data, false);
  save(data, false);
});

socket.on("seen", id => {
  document.getElementById("seen-" + id).innerText = "✔✔";
});

function showMsg(d, mine) {
  const div = document.createElement("div");
  div.className = mine ? "msg sent" : "msg received";
  div.id = d.id;

  div.innerHTML = `
    <b>${d.user}</b><br>
    ${d.text}<br>
    <span class="time">${d.time}</span>
    <span id="seen-${d.id}" class="seen">✔</span>
    <span class="del" onclick="del(${d.id})">❌</span>
  `;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function del(id) {
  document.getElementById(id)?.remove();
  socket.emit("deleteForAll", id);
}

socket.on("deleteForAll", id => {
  document.getElementById(id)?.remove();
});

function save(d, mine) {
  const arr = JSON.parse(localStorage.getItem("chat") || "[]");
  arr.push({ ...d, mine });
  localStorage.setItem("chat", JSON.stringify(arr));
}

window.onload = () => {
  JSON.parse(localStorage.getItem("chat") || "[]")
    .forEach(d => showMsg(d, d.mine));
};