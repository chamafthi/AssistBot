import { useState, useEffect, useRef } from "react";
import { sendMessage } from "../utils/api"; // Import the function
import { FaPaperPlane, FaPlus, FaMoon, FaSun } from "react-icons/fa"; // Import icons

export default function Chat() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<{ user: string; bot: string }[]>([{ user: "", bot: "Welcome! I am AssistBot. How can I help you?" }]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode) {
      setDarkMode(savedMode === "true");
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [darkMode]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chat]);

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
  };

  const handleSendMessage = async () => {
    if (!message.trim() && !file) return;

    setLoading(true);
    setChat((prevChat) => [...prevChat, { user: message, bot: "..." }]);

    try {
      const data = await sendMessage(message, file ?? undefined);
      setChat((prevChat) =>
        prevChat.map((c, i) =>
          i === prevChat.length - 1 ? { ...c, bot: data.bot_reply } : c
        )
      );
    } catch (error) {
      setChat((prevChat) =>
        prevChat.map((c, i) =>
          i === prevChat.length - 1 ? { ...c, bot: "Error occurred" } : c
        )
      );
    }

    setMessage("");
    setFile(null);
    setLoading(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: darkMode ? "#121212" : "#ffffff",
      }}
    >
      <div
        style={{
          padding: "20px",
          backgroundColor: darkMode ? "#292929" : "#007bff",
          color: "#fff",
          textAlign: "center",
          fontSize: "24px",
          fontWeight: "bold",
        }}
      >
        AssistBot
      </div>

      <div
        style={{ position: "absolute", top: "20px", right: "20px", cursor: "pointer" }}
        onClick={handleDarkModeToggle}
      >
        {darkMode ? <FaSun size={24} color="#fff" /> : <FaMoon size={24} color="#333" />}
      </div>

      <div
        ref={chatContainerRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px",
          backgroundColor: darkMode ? "#1d1d1d" : "#f9f9f9",
          display: "flex",
          flexDirection: "column-reverse",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "60%",
            maxWidth: "800px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {chat.map((c, i) => (
            <div key={i} style={{ marginBottom: "15px", display: "flex", flexDirection: "column", width: "100%" }}>
              {c.user && (
                <div
                  style={{
                    backgroundColor: darkMode ? "#444" : "#f1f1f1",
                    padding: "10px",
                    borderRadius: "10px",
                    maxWidth: "60%",
                    textAlign: "left",
                    color: darkMode ? "#fff" : "#333",
                    alignSelf: "flex-end",
                    marginBottom: "5px",
                  }}
                >
                  <strong>You:</strong>
                  <p>{c.user}</p>
                </div>
              )}
              <div
                style={{
                  backgroundColor: darkMode ? "#333" : "#e5e5e5",
                  padding: "10px",
                  borderRadius: "10px",
                  maxWidth: "60%",
                  textAlign: "left",
                  color: darkMode ? "#fff" : "#333",
                  alignSelf: "flex-start",
                }}
              >
                <strong>Bot:</strong>
                <p>{c.bot}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "10px" }}>
        <label htmlFor="file-upload" style={{ cursor: "pointer", marginRight: "10px" }}>
          <FaPlus size={24} style={{ color: darkMode ? "#fff" : "#007bff" }} />
          <input
            type="file"
            id="file-upload"
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
            style={{ display: "none" }}
          />
        </label>

        {file && (
          <div
            style={{
              maxWidth: "200px",
              padding: "10px",
              borderRadius: "10px",
              backgroundColor: darkMode ? "#444" : "#f1f1f1",
              color: darkMode ? "#fff" : "#333",
              marginRight: "10px",
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}
          >
            <strong>File:</strong> {file.name}
          </div>
        )}

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          style={{
            width: "50%",
            height: "55px",
            padding: "10px",
            borderRadius: "12px",
            marginRight: "10px",
            textAlign: "left",
          }}
        />
        <button
          onClick={handleSendMessage}
          style={{
            backgroundColor: "#007bff",
            color: "white",
            padding: "10px",
            borderRadius: "50%",
            width: "50px",
            height: "50px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            border: "none",
          }}
          disabled={loading}
        >
          {loading ? <span>...</span> : <FaPaperPlane size={20} />}
        </button>
      </div>
    </div>
  );
}
