import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

// Use Render backend URL
const socket = io("https://letschat-rur0.onrender.com");

// List of good border colors
const colors = [
    "#4A90E2", // Blue
    "#D0021B", // Red
    "#F5A623", // Orange
    "#8B572A", // Brown
    "#417505", // Green
    "#BD10E0", // Purple
    "#9013FE", // Violet
    "#50E3C2"  // Teal
];

export default function Chat() {
    const [chat, setChat] = useState("");
    const [messages, setMessages] = useState(() => {
        return JSON.parse(localStorage.getItem("messages")) || [];
    });
    const chatRef = useRef(null); // Ref to scroll messages

    useEffect(() => {
        socket.on("receiveMessage", (message) => {
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            const newMessage = { text: message, borderColor: randomColor };

            setMessages((prev) => {
                const updatedMessages = [...prev, newMessage];
                localStorage.setItem("messages", JSON.stringify(updatedMessages)); // Save to local storage
                return updatedMessages;
            });
        });

        return () => {
            socket.off("receiveMessage");
        };
    }, []);

    function sendChat() {
        if (chat.trim()) {
            socket.emit("sendMessage", chat);
            setChat("");
        }
    }

    function handleKeyPress(e) {
        if (e.key === "Enter") {
            sendChat();
        }
    }

    return (
        <div className="h-screen flex flex-col">
            {/* Fixed Header */}
            <div className="bg-purple-800 flex justify-center items-center p-4 fixed top-0 left-0 w-full">
                <h1 className="text-2xl text-white font-bold font-serif">Let's Chat</h1>
            </div>

            {/* Chat Area (Scrollable) */}
            <div ref={chatRef} id="chat" className="flex-1 mt-4 overflow-y-auto p-4 pt-[60px]">
                {messages.map((msg, index) => (
                    <section 
                        key={index} 
                        className="p-2 text-wrap rounded-md max-w-xs whitespace-pre-wrap break-words mb-2 border-2"
                        style={{ borderColor: msg.borderColor, color: "white" }}
                    >
                        <p>{msg.text}</p>
                    </section>
                ))}
            </div>

            {/* Fixed Input at Bottom */}
            <div className="bg-purple-800 p-3 fixed bottom-0 left-0 w-full">
                <div className="flex space-x-3 max-w-2xl mx-auto">
                    <input 
                        type="text" 
                        className="w-full p-2 rounded-lg outline-none"
                        placeholder="Type a message..."
                        value={chat}
                        onChange={(e) => setChat(e.target.value)}
                        onKeyDown={handleKeyPress} // Handle Enter key
                    />
                    <button className="bg-white text-purple-800 p-2 w-32 rounded-lg font-semibold" onClick={sendChat}>
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}
