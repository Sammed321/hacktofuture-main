import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BrainCircuit, Users, ArrowRight, Loader2 } from "lucide-react";
import { useTheme } from "../ThemeContext";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";

const JoinRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [name, setName] = useState("");
  const [userCount, setUserCount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);

  // Check room capacity before showing the form
  useEffect(() => {
    fetch(`${SOCKET_URL}/room/${roomId}`)
      .then(r => r.json())
      .then(data => {
        setUserCount(data.userCount);
        setChecking(false);
      })
      .catch(() => { setChecking(false); });
  }, [roomId]);

  const handleJoin = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) { setError("Please enter your name."); return; }
    if (trimmed.length > 24) { setError("Name must be 24 characters or less."); return; }
    if (userCount >= 10) { setError("This room is full (10/10 users)."); return; }
    setLoading(true);
    // Pass name via query param so Playground can pick it up
    navigate(`/playground/${roomId}?name=${encodeURIComponent(trimmed)}`);
  };

  const inp = {
    width: "100%", padding: "12px 16px", fontSize: "15px",
    background: theme.bgSecondary, border: `1px solid ${theme.border}`,
    borderRadius: "10px", color: theme.text, outline: "none",
    boxSizing: "border-box", fontFamily: "Inter, sans-serif",
  };

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "420px", padding: "0 24px" }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center", marginBottom: "40px" }}>
          <BrainCircuit size={28} style={{ color: "#0070f3" }} />
          <span style={{ fontSize: "22px", fontWeight: 800, color: theme.text, letterSpacing: "-0.02em" }}>SYNAPSE</span>
        </div>

        <div style={{ background: theme.bgSecondary, border: `1px solid ${theme.border}`, borderRadius: "16px", padding: "32px" }}>
          <h2 style={{ margin: "0 0 6px", fontSize: "20px", fontWeight: 700, color: theme.text }}>Join Collaboration</h2>
          <p style={{ margin: "0 0 24px", fontSize: "13px", color: theme.textSecondary }}>
            Room: <span style={{ color: "#0070f3", fontWeight: 600 }}>{roomId}</span>
          </p>

          {/* User count badge */}
          {!checking && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: "8px", padding: "10px 14px", marginBottom: "20px" }}>
              <Users size={15} style={{ color: userCount >= 10 ? "#f87171" : "#4ade80" }} />
              <span style={{ fontSize: "13px", color: theme.textSecondary }}>
                <span style={{ color: userCount >= 10 ? "#f87171" : theme.text, fontWeight: 600 }}>{userCount}</span>
                <span> / 10 users online</span>
              </span>
              {userCount >= 10 && <span style={{ marginLeft: "auto", fontSize: "11px", color: "#f87171", fontWeight: 600 }}>FULL</span>}
            </div>
          )}

          {checking ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
              <Loader2 size={24} style={{ color: "#0070f3", animation: "spin 1s linear infinite" }} />
            </div>
          ) : userCount >= 10 ? (
            <div style={{ textAlign: "center", color: "#f87171", fontSize: "14px", padding: "12px 0" }}>
              This room is full. Ask the host to make space.
            </div>
          ) : (
            <form onSubmit={handleJoin}>
              <label style={{ fontSize: "12px", fontWeight: 600, color: theme.textSecondary, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "8px" }}>
                Your Display Name
              </label>
              <input
                style={inp}
                placeholder="e.g. Alex, Designer123..."
                value={name}
                onChange={e => { setName(e.target.value); setError(""); }}
                maxLength={24}
                autoFocus
              />
              {error && <p style={{ color: "#f87171", fontSize: "12px", margin: "8px 0 0" }}>{error}</p>}
              <button type="submit" disabled={loading}
                style={{ marginTop: "16px", width: "100%", background: "#0070f3", color: "#fff", border: "none", padding: "13px", borderRadius: "10px", fontSize: "15px", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", opacity: loading ? 0.7 : 1 }}>
                {loading ? <Loader2 size={18} /> : <><ArrowRight size={18} /> Join Canvas</>}
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "12px", color: theme.textSecondary }}>
          You'll be able to draw and collaborate in real-time.
        </p>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default JoinRoom;
