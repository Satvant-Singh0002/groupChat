



const API_URL = "http://localhost:3000";

// ======================================
// 1. Get User and Chat Information
// ======================================

const loggedInUserId = localStorage.getItem("userId");
const token = localStorage.getItem("token");

const chatType = localStorage.getItem("chatType") || "personal";

const selectedUserId = localStorage.getItem("selectedUserId");
const selectedUserName = localStorage.getItem("selectedUserName");
const selectedUserEmail = localStorage.getItem("selectedUserEmail");

const selectedGroupId = localStorage.getItem("selectedGroupId");
const selectedGroupName = localStorage.getItem("selectedGroupName");

const loggedUserEmail = localStorage.getItem("loggedUserEmail");

// Personal chat room
const roomId = [loggedUserEmail, selectedUserEmail]
    .sort()
    .join("_");

// Group chat room
const groupRoomId = `group_${selectedGroupId}`;

// ======================================
// 2. Get HTML Elements
// ======================================

const form = document.getElementById("messageForm");
const input = document.getElementById("messageInput");
const messages = document.getElementById("messages");

const chatUserName = document.getElementById("chatUserName");
const chatStatus = document.getElementById("chatStatus");

// ======================================
// 3. Validate Login and Selected Chat
// ======================================

if (!loggedInUserId || !token) {
    alert("Please login first.");
    window.location.href = "login.html";
}

if (
    chatType === "group" &&
    !selectedGroupId
) {
    alert("Please select a group first.");
    window.location.href = "users.html";
}

if (
    chatType !== "group" &&
    !selectedUserId
) {
    alert("Please select a user first.");
    window.location.href = "users.html";
}

// ======================================
// 4. Configure Chat Header
// ======================================

if (chatUserName) {
    chatUserName.textContent =
        chatType === "group"
            ? selectedGroupName || "Group Chat"
            : selectedUserName || "Chat";
}

if (chatStatus) {
    chatStatus.textContent =
        chatType === "group" ? "Group" : "Online";
}

// ======================================
// 5. Configure Axios
// ======================================

axios.defaults.headers.common["Authorization"] = token;

// ======================================
// 6. Socket.IO Connection
// ======================================

const socket = io(API_URL, {
    auth: {
        token: token
    }
});

socket.on("connect", () => {
    console.log("Connected to Socket.IO:", socket.id);

    if (chatType === "group") {
        // Join the selected group's room.
        socket.emit("join_group", Number(selectedGroupId));
    } else {
        // Join the personal chat room.
        socket.emit("join_room", roomId);
    }
});

socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message);
});

// ======================================
// 7. Display Message Safely
// ======================================

function createMessage(text, createdAt, type) {
    const message = document.createElement("div");

    message.classList.add("message", type);

    const messageText = document.createElement("p");
    messageText.textContent = text;

    const messageTime = document.createElement("span");

    messageTime.textContent = new Date(
        createdAt || Date.now()
    ).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

    message.appendChild(messageText);
    message.appendChild(messageTime);

    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
}

// ======================================
// 8. Clear and Render Message History
// ======================================

function renderMessages(data) {
    messages.innerHTML = "";

    data.forEach((item) => {
        const senderId = item.senderId ?? item.userId;

        const type =
            String(senderId) === String(loggedInUserId)
                ? "sent"
                : "received";

        createMessage(
            item.messages ?? item.message ?? item.text ?? "",
            item.createdAt,
            type
        );
    });

    messages.scrollTop = messages.scrollHeight;
}

// ======================================
// 9. Load Personal Chat History
// ======================================

async function getMessages() {
    try {
        const response = await axios.get(
            `${API_URL}/api/GetMessages/${loggedInUserId}/${selectedUserId}`
        );

        // Do not load personal history in group chat.
        if (chatType !== "group") {
            renderMessages(response.data);
        }
    } catch (error) {
        console.error(
            "Personal message history error:",
            error.response?.data || error.message
        );
    }
}

// ======================================
// 10. Load Group Chat History
// ======================================

// async function getGroupMessages() {
//     try {
//         // Assumed endpoint: implement this route in your backend.
//         const response = await axios.get(
//             `${API_URL}/api/groups/${selectedGroupId}/messages`
//         );

//         // Make sure this is still the group chat.
//         if (chatType === "group") {
//             renderMessages(response.data);
//         }
//     } catch (error) {
//         console.error(
//             "Group message history error:",
//             error.response?.data || error.message
//         );
//     }
// }


async function getGroupMessages() {
    try {
        const response = await axios.get(
            `${API_URL}/api/groups/${selectedGroupId}/messages`
        );

        if (chatType === "group") {
            const data = Array.isArray(response.data)
                ? response.data
                : response.data.messages;

            if (!Array.isArray(data)) {
                throw new Error(
                    "Invalid group messages response"
                );
            }

            renderMessages(data);
        }
    } catch (error) {
        console.error(
            "Group message history error:",
            error.response?.data || error.message
        );
    }
}


// ======================================
// 11. Receive Socket.IO Messages
// ======================================

socket.on("message", (data) => {
    // The backend should emit an object containing senderId and text.
    if (!data || typeof data !== "object") {
        console.warn(
            "Expected a message object from the server:",
            data
        );
        return;
    }

    // Ignore messages belonging to a different chat.
    if (chatType === "group") {
        if (String(data.groupId) !== String(selectedGroupId)) {
            return;
        }
    } else {
        const senderId = String(data.senderId);
        const receiverId = String(data.receiverId);

        const isPersonalChatMessage =
            (
                senderId === String(selectedUserId) &&
                receiverId === String(loggedInUserId)
            ) ||
            (
                senderId === String(loggedInUserId) &&
                receiverId === String(selectedUserId)
            );

        if (!isPersonalChatMessage) {
            return;
        }
    }

    // The server should not send the sender their own message.
    if (String(data.senderId) === String(loggedInUserId)) {
        return;
    }

    createMessage(
        data.text ?? data.messages ?? data.message ?? "",
        data.createdAt || new Date(),
        "received"
    );
});


socket.on("group_message", (data) => {
    console.log("Group message received:", data);

    if (chatType !== "group") {
        return;
    }

    if (
        Number(data.groupId) !== Number(selectedGroupId)
    ) {
        return;
    }

    // Ignore messages sent by the current user.
    if (
        Number(data.senderId) === Number(loggedInUserId)
    ) {
        return;
    }

    createMessage(
        data.message,
        data.createdAt || new Date(),
        "received"
    );
});


// ======================================
// 12. Send Personal Message
// ======================================

async function sendPersonalMessage(text) {
    const response = await axios.post(
        `${API_URL}/api/addMessage`,
        {
            senderId: Number(loggedInUserId),
            receiverId: Number(selectedUserId),
            messages: text
        }
    );

    console.log("Personal message saved:", response.data);

    socket.emit("message", {
        roomId: roomId,
        senderId: Number(loggedInUserId),
        receiverId: Number(selectedUserId),
        text: text
    });

    createMessage(text, new Date(), "sent");
}


async function sendGroupMessage(text) {
    if (!text.trim()) {
        return;
    }

    socket.emit("group_message", {
        groupId: Number(selectedGroupId),
        message: text.trim()
    });
   // createMessage(text, new Date(), "sent");
}


// ======================================
// 13. Send Group Message
// ======================================

// async function sendGroupMessage(text) {
//     // Assumed endpoint: implement this route in your backend.

//     if(!text.trim())return;

//     socket.emit("group_message", {
//         groupId: Number(selectedGroupId),
//         senderId: Number(loggedInUserId),
//         message: text
//     });

//    createMessage(text, new Date(), "sent");
// }

// ======================================
// 14. Submit Message
// ======================================

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const text = input.value.trim();

    if (!text) {
        return;
    }

    // Prevent double submissions while saving.
    const submitButton = form.querySelector(
        'button[type="submit"]'
    );

    if (submitButton) {
        submitButton.disabled = true;
    }

    try {
        if (chatType === "group") {
            await sendGroupMessage(text);
        } else {
            await sendPersonalMessage(text);
        }

        input.value = "";
        input.focus();
    } catch (error) {
        console.error(
            "Message sending error:",
            error.response?.data || error.message
        );

        alert("Message could not be sent. Please try again.");
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
        }
    }
});

// ======================================
// 15. Load Correct Chat History
// ======================================

async function initializeChat() {
    // Remove any old messages before opening the chat.
    messages.innerHTML = "";

    if (chatType === "group") {
        await getGroupMessages();
    } else {
        await getMessages();
    }
}



initializeChat();


socket.on("group_message_saved", (data) => {
    console.log("Group message saved:", data);

    if (
        chatType !== "group" ||
        Number(data.groupId) !== Number(selectedGroupId)
    ) {
        return;
    }

    createMessage(
        data.message,
        data.createdAt || new Date(),
        "sent"
    );
});

socket.on("group_message_error", (error) => {
    console.error("Group message error:", error);
    alert(
        typeof error === "string"
            ? error
            : "Failed to send group message"
    );
});

