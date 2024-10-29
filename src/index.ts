import { Server } from 'socket.io';
 
const io = new Server({
    cors: {
        origin: ["https://taskzen-management.vercel.app", "http://localhost:3000"] 
    }
});

let onlineUsers: {
    userId: string;
    socketId: string;
}[] = [];

const addUser = ({ userId,socketId }: { userId: string, socketId: string }) => {  
    if(!onlineUsers.some((user) => user.userId === userId)) {        
        onlineUsers.push({ userId,socketId });
    }
};

const removeUser = (socketId: string) => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getUser = (userId: string) => {       
    return onlineUsers.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
    socket.on("newUser", (userId) => {        
        addUser({ userId, socketId: socket.id });
    });

    socket.on("likeComment", ({ userId,fullName,type,message }) => {        
        const reciever = getUser(userId);
        if(reciever) io.to(reciever?.socketId).emit("sendUserLikeNotification", { userId,fullName,type,message });
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