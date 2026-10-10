const GroupMembers=require('../../models/GroupMembers');
const GroupMessages=require('../../models/GroupMessage');


module.exports=(socket,io)=>{

    // ==============================
    // Register user
    // ==============================

    socket.on("join_room", (roomId) => {

        socket.join(roomId);

        console.log(
            `User ${socket.userId} joined room ${roomId}`
        );

    });

    socket.on("join_group", async (groupId) => {
    try {
        const membership = await GroupMembers.findOne({
            where: {
                groupId: Number(groupId),
                userId: Number(socket.userId)
            }
        });

        if (!membership) {
            socket.emit("group_message_error", "You are not a member of this group");
            return;
        }

        const roomId = `group_${groupId}`;
        socket.join(roomId);

        console.log(`User ${socket.userId} joined ${roomId}`);
    } catch (error) {
        console.error("Error joining group:", error);
    }
});
    // receiving message from the client
socket.on("message",(data)=>{
    const {
        roomId,
        senderId,
        receiverId,
        text
    }=data;
    console.log("Received message:",data);

    // sending message to the receiver
socket.to(roomId).emit(
    "message",{
        roomId,
            senderId,
            receiverId,
            text,
            createdAt: new Date()
    }
    
);
});
 
// // receiving group message from the client
// socket.on("group_message",(data)=>{
//     const {
//         groupId,
//         senderId,
//         message
//     }=data;
//     console.log("Received group message:",data);
//     // sending message to the group
//     socket.to(groupId).emit(
//         "group_message",{
//             groupId,
//             senderId,
//             message,
//             createdAt: new Date()
//         }
//     );

// });

// Receiving group message from client
socket.on("group_message", async (data) => {
    try {
        const { groupId, message } = data;

        console.log("Received group message:", data);

        if (!groupId || !message || !message.trim()) {
            return;
        }

        // Check whether sender is a member of the group
        const membership = await GroupMembers.findOne({
            where: {
                groupId: Number(groupId),
                userId: Number(socket.userId)
            }
        });

        if (!membership) {
            socket.emit(
                "group_message_error",
                "You are not a member of this group"
            );
            return;
        }

        // Save message in group_messages table
        const savedMessage = await GroupMessages.create({
            groupId: Number(groupId),
            senderId: Number(socket.userId),
            message: message.trim()
        });

        console.log("Group message saved:", savedMessage.id);

        // Broadcast to other group members
        const roomId = `group_${groupId}`;

       console.log("Broadcasting to room:",roomId);
       console.log(
    "Sockets in room:",
    io.sockets.adapter.rooms.get(roomId)?.size
);
        socket.to(roomId).emit("group_message", {
            id: savedMessage.id,
            groupId: savedMessage.groupId,
            senderId: savedMessage.senderId,
            message: savedMessage.message,
            createdAt: savedMessage.createdAt
        });

        // Confirm successful save to sender
        socket.emit("group_message_saved", {
            id: savedMessage.id,
            groupId: savedMessage.groupId,
            senderId: savedMessage.senderId,
            message: savedMessage.message,
            createdAt: savedMessage.createdAt
        });

    } catch (error) {
        console.error("Error saving group message:", error);

        socket.emit(
            "group_message_error",
            "Failed to save group message"
        );
    }
});
}
