"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const io = new socket_io_1.Server({
    cors: {
        origin: ["https://taskzen-management.vercel.app", "http://localhost:3000"]
    }
});
let onlineUsers = [];
const addUser = ({ userId, socketId }) => {
    if (!onlineUsers.some((user) => user.userId === userId)) {
        onlineUsers.push({ userId, socketId });
    }
};
const removeUser = (socketId) => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};
const getUser = (userId) => {
    return onlineUsers.find((user) => user.userId === userId);
};
io.on("connection", (socket) => {
    socket.on("newUser", (userId) => {
        addUser({ userId, socketId: socket.id });
    });
    socket.on("likeComment", ({ userId, fullName, type, message }) => {
        const reciever = getUser(userId);
        if (reciever)
            io.to(reciever === null || reciever === void 0 ? void 0 : reciever.socketId).emit("sendUserLikeNotification", { fullName, type, message });
    });
    socket.on("deleteTask", (taskId) => {
        io.emit("sendDeleteTaskNotification", taskId);
    });
    socket.on("editTask", (taskId) => {
        io.emit("sendEditTaskNotification", taskId);
    });
    socket.on("duplicateTask", (taskId) => {
        io.emit("sendDuplicateTaskNotification", taskId);
    });
    socket.on("disconnect", () => {
        removeUser(socket.id);
    });
});
io.listen(parseInt(process.env.PORT || "4000", 10));
