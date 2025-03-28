import { useState, useEffect } from "react";
import { io } from "socket.io-client";

// Automatically use the correct backend URL
const socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:5000");


export default function Chat() {
    const [chat, setChat] = useState("");
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        socket.on("receiveMessage", (message) => {
            setMessages((prev) => [...prev, message]);
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

    return (
        <div className="h-screen flex flex-col">
            {/* Fixed Header */}
            <div className="bg-purple-800 flex justify-center items-center p-4 fixed top-0 left-0 w-full">
                <h1 className="text-2xl text-white font-bold font-serif">Let's Chat</h1>
            </div>

            {/* Chat Area (Adjusted with padding) */}
            <div id="chat" className="flex-1 mt-4 overflow-y-auto p-4 pt-[60px]">
                {messages.map((msg, index) => (
                    <section key={index} className="p-2 text-wrap rounded-md bg-gray-200 max-w-xs whitespace-pre-wrap break-words mb-2">
                        <p>{msg}</p>
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
                    />
                    <button className="bg-white text-purple-800 p-2 w-32 rounded-lg font-semibold" onClick={sendChat}>
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}
