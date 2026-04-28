import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BrainCircuit,
  Plus,
  Clock3,
  Users,
  Settings,
  LogOut,
  Sun,
  Moon, Check,
} from "lucide-react";import { Share2, Trash2, Pencil } from "lucide-react";
import { useTheme } from "../ThemeContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [history, setHistory] = useState([]);
const [editingId, setEditingId] = useState(null);
const [tempName, setTempName] = useState("");
  // Use the theme border and bg for the card style dynamically
  const cardStyle = {
    background: theme.bgSecondary,
    border: `1px solid ${theme.border}`,
    borderRadius: "12px",
    padding: "24px",
    transition: "all 0.2s ease",
    cursor: "pointer",
  };

  useEffect(() => {
    const storedHistory = JSON.parse(
      localStorage.getItem("designHistory") || "[]",
    );
    setHistory(storedHistory);
  }, []);
  // SHARE
  const handleShare = (id) => {
    const link = `${window.location.origin}/playground/${id}`;
    navigator.clipboard.writeText(link);
    alert("Link copied!"); // you can replace with your toast later
  };

  // DELETE
  const handleDelete = (id) => {
    const updated = history.filter((proj) => proj.id !== id);
    setHistory(updated);
    localStorage.setItem("designHistory", JSON.stringify(updated));
  };

  // RENAME
  const handleRename = (id) => {
    const newName = prompt("Enter new project name:");
    if (!newName) return;

    const updated = history.map((proj) =>
      proj.id === id ? { ...proj, name: newName } : proj,
    );

    setHistory(updated);
    localStorage.setItem("designHistory", JSON.stringify(updated));
  };
  const handleRenameClick = (proj) => {
    setEditingId(proj.id);
    setTempName(proj.name);
  };

  const handleRenameSave = (id) => {
    if (!tempName.trim()) return;

    const updated = history.map((proj) =>
      proj.id === id ? { ...proj, name: tempName } : proj,
    );

    setHistory(updated);
    localStorage.setItem("designHistory", JSON.stringify(updated));
    setEditingId(null);
  };
  const createNewProject = () => {
    const roomId = Math.random().toString(36).substring(7);
    const projectName = `Untitled-${roomId}`;

    const newEntry = {
      id: roomId,
      name: projectName,
      date: new Date().toLocaleDateString(),
    };
    const updatedHistory = [newEntry, ...history];
    localStorage.setItem("designHistory", JSON.stringify(updatedHistory));

    navigate(`/playground/${roomId}?host=true`);
  };
const actionBtnStyle = {
  background: "transparent",
  border: `1px solid ${theme.border}`,
  color: theme.textSecondary,
  padding: "6px",
  borderRadius: "6px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s ease",
};
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: theme.bg,
        transition: "background 0.3s ease",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: "260px",
          borderRight: `1px solid ${theme.border}`,
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: theme.bg,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "18px",
              fontWeight: 700,
              color: theme.text,
              marginBottom: "48px",
            }}
          >
            <BrainCircuit size={24} style={{ color: theme.accent }} />
            SYNAPSE
          </div>
          <nav
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {[
              { name: "Projects", icon: BrainCircuit },
              { name: "Teams", icon: Users },
              { name: "Settings", icon: Settings },
            ].map((item) => (
              <div
                key={item.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  color:
                    item.name === "Projects" ? theme.text : theme.textSecondary,
                  background:
                    item.name === "Projects"
                      ? theme.isDark
                        ? "#111111"
                        : "#f0f0f0"
                      : "transparent",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                <item.icon size={20} /> {item.name}
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer: Theme Toggle & Logout */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div
            onClick={toggleTheme}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              color: theme.textSecondary,
              cursor: "pointer",
              padding: "10px 16px",
              borderRadius: "8px",
              border: `1px solid ${theme.border}`,
            }}
          >
            {theme.isDark ? <Sun size={20} /> : <Moon size={20} />}
            {theme.isDark ? "Light Mode" : "Dark Mode"}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              color: "#888888",
              cursor: "pointer",
              padding: "10px 16px",
            }}
          >
            <LogOut size={20} /> Logout
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "48px 60px" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "48px",
          }}
        >
          <h1
            style={{
              fontSize: "32px",
              fontWeight: 700,
              margin: 0,
              color: theme.text,
              letterSpacing: "-0.02em",
            }}
          >
            Dashboard
          </h1>
          <button
            onClick={createNewProject}
            style={{
              background: theme.isDark ? "#ffffff" : "#000000",
              color: theme.isDark ? "#000000" : "#ffffff",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              fontSize: "15px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
            }}
          >
            <Plus size={20} /> New Project
          </button>
        </header>

        {/* History Section */}
        <section>
          <h2
            style={{
              fontSize: "16px",
              fontWeight: 600,
              color: theme.textSecondary,
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Clock3 size={18} /> Recent Projects
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "24px",
            }}
          >
            {history.length === 0 ? (
              <div
                style={{
                  ...cardStyle,
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  color: theme.textSecondary,
                  cursor: "default",
                }}
              >
                No projects yet. Click 'New Project' to launch Synapse.
              </div>
            ) : (
              history.map((proj) => (
                <div
                  key={proj.id}
                  style={cardStyle}
                  onClick={() => navigate(`/playground/${proj.id}`)}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.borderColor = theme.isDark
                      ? "#444"
                      : "#ccc")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.borderColor = theme.border)
                  }
                >
                  {/* TOP ROW */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    {/* LEFT: Name or Input */}
                    {editingId === proj.id ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          flex: 1,
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          value={tempName}
                          onChange={(e) => setTempName(e.target.value)}
                          autoFocus
                          onFocus={(e) => e.target.select()}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleRenameSave(proj.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          onBlur={() => handleRenameSave(proj.id)} // optional smooth UX
                          style={{
                            flex: 1,
                            padding: "8px 12px",
                            borderRadius: "8px",
                            border: `1px solid ${theme.border}`,
                            outline: "none",
                            background: theme.bgSecondary,
                            color: theme.text,
                            fontSize: "14px",
                            fontWeight: "500",
                            transition:
                              "all 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
                          }}
                        />

                        {/* Tick Save */}
                        <button
                          onClick={() => handleRenameSave(proj.id)}
                          style={{
                            ...actionBtnStyle,
                            background: theme.isDark ? "#fff" : "#000",
                            color: theme.isDark ? "#000" : "#fff",
                          }}
                        >
                          <Check size={16} />
                        </button>
                      </div>
                    ) : (
                      <div
                        style={{
                          fontSize: "16px",
                          fontWeight: 600,
                          color: theme.text,
                        }}
                      >
                        {proj.name}
                      </div>
                    )}

                    {/* RIGHT: Action buttons */}
                    {editingId !== proj.id && (
                      <div style={{ display: "flex", gap: "8px" }}>
                        {/* Share */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(proj.id);
                          }}
                          style={actionBtnStyle}
                        >
                          <Share2 size={16} />
                        </button>

                        {/* Rename */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRenameClick(proj);
                          }}
                          style={actionBtnStyle}
                        >
                          <Pencil size={16} />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(proj.id);
                          }}
                          style={actionBtnStyle}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* BOTTOM ROW */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      color: theme.textSecondary,
                      fontSize: "14px",
                    }}
                  >
                    <span>ID: {proj.id}</span>
                    <span>{proj.date}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};;
export default Dashboard;
