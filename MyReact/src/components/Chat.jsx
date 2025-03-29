import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

// Use Render backend URL
const socket = io("https://letschat-rur0.onrender.com");

// List of good border colors
const colors = [
    "#4A90E2", "#D0021B", "#F5A623", "#8B572A",
    "#417505", "#BD10E0", "#9013FE", "#50E3C2"
];

export default function Chat() {
    const [chat, setChat] = useState("");
    const [messages, setMessages] = useState(() => {
        return JSON.parse(sessionStorage.getItem("messages")) || [];
    });

    const chatRef = useRef(null); // Ref for chat container
    const lastMessageRef = useRef(null); // Ref for last message

    useEffect(() => {
        socket.on("receiveMessage", (message) => {
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            const newMessage = { text: message, borderColor: randomColor };

            setMessages((prev) => {
                const updatedMessages = [...prev, newMessage];
                sessionStorage.setItem("messages", JSON.stringify(updatedMessages)); // Save to session storage
                return updatedMessages;
            });
        });

        return () => {
            socket.off("receiveMessage");
        };
    }, []);

    useEffect(() => {
        // Auto-scroll to the latest message
        if (lastMessageRef.current) {
            lastMessageRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    }, [messages]);

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
        <div className="h-screen flex flex-col bg-gray-100">
            {/* Fixed Header */}
            <div className="bg-purple-800 flex justify-center items-center p-4 fixed top-0 left-0 w-full z-10">
                <h1 className="text-2xl text-white font-bold font-serif">Let's Chat</h1>
            </div>

            {/* Chat Area (Scrollable) */}
            <div 
                ref={chatRef} 
                className="flex-1 mt-16 overflow-y-auto p-4 pb-20"
                style={{ scrollBehavior: "smooth" }}
            >
                {messages.map((msg, index) => (
                    <section 
                        key={index} 
                        className="p-3 text-wrap rounded-md max-w-xs whitespace-pre-wrap break-words mb-2 border-2 bg-white"
                        style={{ borderColor: msg.borderColor, color: "black" }}
                        ref={index === messages.length - 1 ? lastMessageRef : null}
                    >
                        <p>{msg.text}</p>
                    </section>
                ))}
            </div>

            {/* Fixed Input at Bottom */}
            <div className="bg-purple-800 p-3 fixed bottom-0 left-0 w-full">
                <div className="flex items-center space-x-3 max-w-2xl mx-auto">
                    <input 
                        type="text" 
                        className="flex-1 p-2 rounded-lg outline-none bg-white text-black"
                        placeholder="Type a message..."
                        value={chat}
                        onChange={(e) => setChat(e.target.value)}
                        onKeyDown={handleKeyPress}
                    />
                    <button 
                        className="bg-white text-purple-800 p-2 px-4 rounded-lg font-semibold" 
                        onClick={sendChat}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}
