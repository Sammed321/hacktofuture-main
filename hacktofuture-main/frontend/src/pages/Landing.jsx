import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  BrainCircuit,
  MoveRight,
  Zap,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "../ThemeContext";

const Landing = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      style={{
        background: theme.bg,
        color: theme.text,
        minHeight: "100vh",
        transition: "all 0.3s",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "20px 40px",
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontWeight: 800,
          }}
        >
          <BrainCircuit style={{ color: theme.accent }} /> SYNAPSE
        </div>
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <button
            onClick={toggleTheme}
            style={{
              background: "none",
              border: "none",
              color: theme.text,
              cursor: "pointer",
            }}
          >
            {theme.isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              background: theme.text,
              color: theme.bg,
              border: "none",
              padding: "8px 16px",
              borderRadius: "6px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Launch App
          </button>
        </div>
      </header>

      <main
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: "100px",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "64px", fontWeight: 800, maxWidth: "800px" }}>
          Collaborate at{" "}
          <span style={{ color: theme.accent }}>Lightspeed.</span>
        </h1>

        {/* Custom Styled Button */}
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}dd)`,
            color: "#fff",
            border: "none",
            padding: "14px 32px",
            borderRadius: "50px",
            fontSize: "18px",
            fontWeight: 600,
            cursor: "pointer",
            marginTop: "32px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            transition: "all 0.3s ease",
            boxShadow: `0 4px 15px ${theme.accent}40`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = `0 8px 25px ${theme.accent}60`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = `0 4px 15px ${theme.accent}40`;
          }}
        >
          Get Started{" "}
          <MoveRight size={20} style={{ transition: "transform 0.3s" }} />
        </button>

        <p
          style={{
            color: theme.textSecondary,
            fontSize: "20px",
            maxWidth: "600px",
          }}
        >
          The infinite canvas for high-performance design teams.
        </p>
      </main>
    </div>
  );
};
export default Landing;
