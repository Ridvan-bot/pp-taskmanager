import React from "react";

interface ChatSidebarProps {
  onClose: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ onClose }) => {
  return (
    <aside
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        height: "100vh",
        width: 370,
        background: "rgba(30,41,59,0.98)",
        borderLeft: "none",
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        boxShadow: "-8px 0 24px 0 rgba(59,130,246,0.10)",
        borderTopLeftRadius: 24,
        borderBottomLeftRadius: 24,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 20,
          borderBottom: "1px solid #334155",
          background: "rgba(30,41,59,0.98)",
        }}
      >
        <span
          style={{
            color: "#fff",
            fontWeight: 700,
            fontSize: 20,
            letterSpacing: 0.5,
          }}
        >
          💬 Chat
        </span>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "#fff",
            fontSize: 28,
            cursor: "pointer",
            borderRadius: 8,
            transition: "background 0.2s",
          }}
          aria-label="Close chat"
          onMouseOver={(e) => (e.currentTarget.style.background = "#334155")}
          onMouseOut={(e) => (e.currentTarget.style.background = "none")}
        >
          ×
        </button>
      </div>
      <div
        style={{
          flex: 1,
          padding: 20,
          color: "#fff",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div
          style={{
            background: "rgba(59,130,246,0.10)",
            borderRadius: 16,
            padding: "16px 20px",
            color: "#fff",
            fontSize: 15,
            maxWidth: "80%",
            alignSelf: "flex-start",
            boxShadow: "0 2px 8px 0 rgba(59,130,246,0.08)",
          }}
        >
          Här kan du implementera din chatt!
        </div>
      </div>
      <div
        style={{
          padding: 20,
          borderTop: "1px solid #334155",
          background: "rgba(30,41,59,0.98)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#1e293b",
            borderRadius: 16,
            boxShadow: "0 2px 8px 0 rgba(59,130,246,0.04)",
            padding: "6px 12px",
          }}
        >
          <input
            type="text"
            placeholder="Skriv ett meddelande..."
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "none",
              outline: "none",
              background: "transparent",
              color: "#fff",
              fontSize: 15,
              borderRadius: 12,
            }}
          />
          <button
            style={{
              marginLeft: 8,
              background: "linear-gradient(90deg,#3b82f6 0%,#60a5fa 100%)",
              border: "none",
              color: "#fff",
              borderRadius: 12,
              padding: "8px 16px",
              fontWeight: 600,
              fontSize: 15,
              cursor: "pointer",
              boxShadow: "0 2px 8px 0 rgba(59,130,246,0.10)",
              transition: "background 0.2s",
            }}
          >
            Skicka
          </button>
        </div>
      </div>
    </aside>
  );
};

export default ChatSidebar;
