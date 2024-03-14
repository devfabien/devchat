const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");
const msgInput = document.getElementById("msg");
const typingInput = document.querySelector(".typing");
let isTyping = false;
let typingTimeout;
const typingDelay = 2000; // 2 seconds

// Get username and room from URL

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

// Join Chatroom
socket.emit("joinRoom", { username, room });

// Get room and users
socket.on("roomUsers", ({ room, users }) => {
  outPutRoomName(room);
  outPutUsers(users);
});

// Message from server
socket.on("message", (message) => {
  console.log(message);
  outputMessage(message);

  //Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Is typing
msgInput.addEventListener("input", () => {
  clearTimeout(typingTimeout);
  socket.emit("typing", room);
  typingTimeout = setTimeout(stopTyping, typingDelay);
});

socket.on("typing", (data) => {
  isTyping = true;
  if (isTyping) {
    typingInput.innerHTML = `${data.username} is typing...`;
  }
});

socket.on("stopTyping", () => {
  isTyping = false;
  typingInput.innerHTML = "";
});
// Message submit

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const msg = e.target.elements.msg.value;

  // Emit message to the server
  socket.emit("chatMessage", msg);

  // Clear input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.setAttribute("class", "p-3 mb-5 bg-gray-200 rounded-md");

  div.innerHTML = `<p class="text-base font-bold opacity-70 mb-2">${message.username} <span class="text-gray-500">${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
  document.querySelector(".chat-messages").appendChild(div);
}

// Add room name to DOM
function outPutRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outPutUsers(users) {
  userList.innerHTML = `${users
    .map((user) => `<li>${user.username}</li>`)
    .join("")}`;
}

// Stop typing
function stopTyping() {
  socket.emit("stopTyping", room);
}
