import React, { useEffect, useState, useMemo } from "react";
import { io } from "socket.io-client";
import {
  Container,
  TextField,
  Button,
  Typography,
  Stack,
  MenuItem,
  Select,
} from "@mui/material";

const App = () => {
  const socket = useMemo(() => io("http://localhost:3000"), []);
  const [username, setUsername] = useState("");
  const [messages, setMessages] = useState("");
  const [Room, setRoom] = useState("");
  const [socketID, setSocketID] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [roomName, setRoomName] = useState("");
  const [users, setUsers] = useState({});
  const [recipientId, setRecipientId] = useState("");
  const [privateMessage, setPrivateMessage] = useState("");

  const registerUser = () => {
    if (username.trim() !== "") {
      socket.emit("register-user", username);
    }
  };

  const joinRoomHandler = (e) => {
    e.preventDefault();
    if (roomName.trim() !== "") {
      socket.emit("join-room", roomName);
      setRoom(roomName);
      setRoomName("");
    }
  };

  const handlerSubmit = (e) => {
    e.preventDefault();
    if (messages.trim() !== "" && Room.trim() !== "") {
      socket.emit("message", { messages, Room });
      setMessages("");
    }
  };

  const sendPrivateMessage = (e) => {
    e.preventDefault();
    if (privateMessage.trim() !== "" && recipientId) {
      socket.emit("private-message", { recipientId, message: privateMessage });
      setPrivateMessage("");
    }
  };

  useEffect(() => {
    socket.on("connect", () => {
      setSocketID(socket.id);
      console.log("Connected to server", socket.id);
    });

    socket.on("receive-message", (data) => {
      console.log("Message received:", data);
      setMessageList((prev) => [...prev, data]);
    });

    socket.on("update-users", (users) => {
      setUsers(users);
    });

    return () => {
      socket.off("connect");
      socket.off("receive-message");
      socket.off("update-users");
      socket.disconnect();
    };
  }, []);

  return (
    <Container maxWidth="sm">
      <Typography variant="h3" gutterBottom>
        WebSocket Chat App
      </Typography>

      <Typography variant="h6" gutterBottom>
        Your ID: {socketID}
      </Typography>

      {/* Register Username */}
      <TextField
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        label="Enter Your Name"
        variant="outlined"
        fullWidth
        margin="normal"
      />
      <Button variant="contained" color="primary" onClick={registerUser}>
        Register
      </Button>

      {/* Join Room */}
      <form onSubmit={joinRoomHandler}>
        <h5>Join a Room</h5>
        <TextField
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          label="Room Name"
          variant="outlined"
          fullWidth
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary">
          Join Room
        </Button>
      </form>

      {/* Send Message */}
      <form onSubmit={handlerSubmit}>
        <TextField
          value={messages}
          onChange={(e) => setMessages(e.target.value)}
          label="Message"
          variant="outlined"
          fullWidth
          margin="normal"
        />
        <TextField
          value={Room}
          onChange={(e) => setRoom(e.target.value)}
          label="Room"
          variant="outlined"
          fullWidth
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary">
          Send Message
        </Button>
      </form>

      {/* Private Messaging */}
      <form onSubmit={sendPrivateMessage}>
        <h5>Send Private Message</h5>
        <Select
          value={recipientId}
          onChange={(e) => setRecipientId(e.target.value)}
          fullWidth
          displayEmpty
        >
          <MenuItem value="" disabled>
            Select User
          </MenuItem>
          {Object.entries(users).map(
            ([id, name]) =>
              id !== socketID && (
                <MenuItem key={id} value={id}>
                  {name}
                </MenuItem>
              )
          )}
        </Select>
        <TextField
          value={privateMessage}
          onChange={(e) => setPrivateMessage(e.target.value)}
          label="Private Message"
          variant="outlined"
          fullWidth
          margin="normal"
        />
        <Button type="submit" variant="contained" color="secondary">
          Send Private
        </Button>
      </form>

      {/* Messages */}
      <Stack spacing={1} mt={2}>
        {messageList.map((message, index) => (
          <Typography
            key={index}
            variant="body1"
            sx={{ padding: 1, border: "1px solid #ddd", borderRadius: 2 }}
          >
            {message}
          </Typography>
        ))}
      </Stack>
    </Container>
  );
};

export default App;
