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

    socket.on("deleteTask", ({ notification, userIds }) => {
        userIds?.forEach((userId: string) => {            
            const reciever = getUser(userId);
            if(reciever) io.to(reciever?.socketId).emit("sendDeleteTaskNotification", notification);
        });
    });

    socket.on("editTask", ({ notification, userIds }) => {
        userIds?.forEach((userId: string) => {            
            const reciever = getUser(userId);
            if(reciever) io.to(reciever?.socketId).emit("sendEditTaskNotification", notification);
        });
    });

    socket.on("duplicateTask", ({ notification, userIds }) => {
        userIds?.forEach((userId: string) => {            
            const reciever = getUser(userId);
            if(reciever) io.to(reciever?.socketId).emit("sendDuplicateTaskNotification", notification);
        });
    });

    socket.on("addSubtask", ({ notification, userIds }) => {
        userIds?.forEach((userId: string) => {            
            const reciever = getUser(userId);
            if(reciever) io.to(reciever?.socketId).emit("sendAddSubTaskNotification", notification);
        });
    });

    socket.on("assignTask", ({ notification, userIds }) => {
        userIds?.forEach((userId: string) => {            
            const reciever = getUser(userId);
            if(reciever) io.to(reciever?.socketId).emit("sendUserAssignNotification", notification);
        });
    });

    socket.on("addUser", ({ notification, userIds }) => {
        userIds?.forEach((userId: string) => {            
            const reciever = getUser(userId);
            if(reciever) io.to(reciever?.socketId).emit("sendAddUserNotification", notification);
        });
    });

    socket.on("addComment", ({ notification, userIds }) => {  
        userIds?.forEach((userId: string) => {            
            const reciever = getUser(userId);
            if(reciever) io.to(reciever?.socketId).emit("sendUserAddCommentNotification", notification);
        });
    });
    
    socket.on("disconnect", () => {
        removeUser(socket.id);
    });
});

io.listen(parseInt(process.env.PORT || "4000", 10));