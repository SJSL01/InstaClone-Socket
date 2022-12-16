var express = require('express');
const cors = require("cors")
var app = express();
var server = require('http').createServer(app);
const io = require("socket.io")(server, {
    cors: {
        origin: "*"
    }
})


let users = [];

const addUser = (userId, socketId) => {
    !users.some((user) => user.userId === userId) &&
        users.push({ userId, socketId });
};


const removeUser = (socketId) => {
    users = users.filter(user => user.socketId !== socketId)
}


const getUser = (receiverId) => {
    return users.find(user => user.userId === receiverId)
}

io.on("connection", (socket) => {
    //when connect
    console.log("a user connected.");

    //take userId and socketId from user
    socket.on("addUser", (userId) => {
        addUser(userId, socket.id);
        io.emit("getUsers", users);
    })

    socket.on("sendMessage", ({ senderId, receiverId, message }) => {
        const receiver = getUser(receiverId)
        io.to(receiver.socketId,).emit("getMessage", {
            senderId,
            message
        })
    })

    socket.on("disconnect", () => {
        console.log("a user disconected");
        removeUser(socket.id)
        io.emit("getUsers", users);
    })
})



server.listen(3012 || process.env.PORT, () => {
    console.log("service is up");
})