import React, { useEffect } from "react";

const Toast = ({ message, show, onClose, theme }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!show) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: "24px",
        right: "24px",
        padding: "14px 20px",
        borderRadius: "12px",
        fontSize: "14px",
        fontWeight: "500",
        zIndex: 9999,

        background: theme.isDark ? "#ffffff" : "#000000",
        color: theme.isDark ? "#000000" : "#ffffff",

        boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",

        transition:
          "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.45s ease, scale 0.45s ease",

        transform: show
          ? "translateY(0px) scale(1)"
          : "translateY(18px) scale(0.96)",

        opacity: show ? 1 : 0,

        willChange: "transform, opacity",
      }}
    >
      {message}
    </div>
  );
};

export default Toast;