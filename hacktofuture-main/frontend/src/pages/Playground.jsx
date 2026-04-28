import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Stage, Layer, Rect, Circle, Line, Text, Transformer, Arrow } from "react-konva";
import { io } from "socket.io-client";
import {
  BrainCircuit, Square, Circle as CircleIcon, Type, Pencil,
  MousePointer2, Trash2, Download, Share2, Crown, Sun, Moon, Users,
  Eraser, Minus, ArrowRight, Undo2, Redo2, ZoomIn, ZoomOut,
  AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline,
  Layers, Lock, Unlock, Eye, EyeOff, Copy, Clipboard, Grid,
  MessageCircle, Image as ImageIcon, X, ChevronDown,
  Mic, MicOff, PhoneOff, Volume2,
} from "lucide-react";
import Toast from "../components/Toast";
import { useTheme } from "../ThemeContext";
import { v4 as uuidv4 } from "uuid";

const SOCKET_URL = "http://localhost:4000";
const COLORS = ["#f87171","#fb923c","#facc15","#4ade80","#60a5fa","#c084fc","#f472b6","#ffffff","#000000","#6b7280"];

// ── Custom Input Modal ────────────────────────────────────────────────────────
function InputModal({ title, placeholder, multiline = false, onConfirm, onCancel, theme }) {
  const [value, setValue] = useState("");
  const inputRef = useRef();

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 50); }, []);

  const confirm = () => { if (value.trim()) onConfirm(value.trim()); };
  const onKey = (e) => {
    if (e.key === "Enter" && !multiline) confirm();
    if (e.key === "Escape") onCancel();
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 99999,
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={onCancel}>
      <div onClick={e => e.stopPropagation()} style={{
        background: theme.bgSecondary, border: `1px solid ${theme.border}`,
        borderRadius: "16px", padding: "28px 28px 24px",
        width: "100%", maxWidth: "420px", boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
        fontFamily: "Inter, sans-serif", animation: "modalIn 0.18s cubic-bezier(0.22,1,0.36,1)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#0070f3" }} />
            <span style={{ fontSize: "15px", fontWeight: 700, color: theme.text }}>{title}</span>
          </div>
          <button onClick={onCancel} style={{ background: "none", border: "none", cursor: "pointer", color: theme.textSecondary, display: "flex", padding: "4px", borderRadius: "6px" }}>
            <X size={16} />
          </button>
        </div>

        {/* Input */}
        {multiline ? (
          <textarea
            ref={inputRef}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={onKey}
            placeholder={placeholder}
            rows={4}
            style={{
              width: "100%", boxSizing: "border-box", resize: "vertical",
              background: theme.bg, border: `1.5px solid ${theme.border}`,
              borderRadius: "10px", padding: "12px 14px", fontSize: "14px",
              color: theme.text, outline: "none", fontFamily: "Inter, sans-serif",
              lineHeight: 1.5, transition: "border-color 0.15s",
            }}
            onFocus={e => e.target.style.borderColor = "#0070f3"}
            onBlur={e => e.target.style.borderColor = theme.border}
          />
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={onKey}
            placeholder={placeholder}
            style={{
              width: "100%", boxSizing: "border-box",
              background: theme.bg, border: `1.5px solid ${theme.border}`,
              borderRadius: "10px", padding: "12px 14px", fontSize: "14px",
              color: theme.text, outline: "none", fontFamily: "Inter, sans-serif",
              transition: "border-color 0.15s",
            }}
            onFocus={e => e.target.style.borderColor = "#0070f3"}
            onBlur={e => e.target.style.borderColor = theme.border}
          />
        )}

        {/* Buttons */}
        <div style={{ display: "flex", gap: "10px", marginTop: "20px", justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{
            padding: "9px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 600,
            background: "transparent", border: `1px solid ${theme.border}`,
            color: theme.textSecondary, cursor: "pointer",
          }}>Cancel</button>
          <button onClick={confirm} disabled={!value.trim()} style={{
            padding: "9px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 600,
            background: value.trim() ? "#0070f3" : theme.border,
            border: "none", color: "#fff", cursor: value.trim() ? "pointer" : "not-allowed",
            transition: "background 0.15s",
          }}>Confirm</button>
        </div>
      </div>
      <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.94) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
    </div>
  );
}

function randomColor() {
  return COLORS[Math.floor(Math.random() * 7)];
}
const MY_NAME = (() => {
  const params = new URLSearchParams(window.location.search);
  return params.get("name") || `User-${Math.random().toString(36).slice(2, 6)}`;
})();

// ── Dot-grid background ───────────────────────────────────────────────────────
function DotGrid({ width, height, theme, scale, offsetX, offsetY }) {
  const step = 24;
  const dots = [];
  const startX = Math.floor(-offsetX / scale / step) * step;
  const startY = Math.floor(-offsetY / scale / step) * step;
  const endX = startX + width / scale + step * 2;
  const endY = startY + height / scale + step * 2;
  const color = theme.isDark ? "#2a2a2a" : "#d1d5db";
  for (let x = startX; x < endX; x += step) {
    for (let y = startY; y < endY; y += step) {
      dots.push(<Circle key={`${x}-${y}`} x={x} y={y} radius={1} fill={color} listening={false} />);
    }
  }
  return <Layer listening={false}>{dots}</Layer>;
}

// ── Shape node ────────────────────────────────────────────────────────────────
function ShapeNode({ shape, isSelected, onSelect, onChange, tool, bgColor }) {
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  if (shape.hidden) return null;

  const draggable = tool === "select" && !shape.locked;

  const common = {
    ref: shapeRef,
    onClick: (e) => { e.cancelBubble = true; onSelect(shape.id); },
    onTap: (e) => { e.cancelBubble = true; onSelect(shape.id); },
    draggable,
    opacity: shape.opacity ?? 1,
    onDragEnd: (e) => onChange({ ...shape, x: e.target.x(), y: e.target.y() }),
    onTransformEnd: () => {
      const node = shapeRef.current;
      onChange({ ...shape, x: node.x(), y: node.y(), scaleX: node.scaleX(), scaleY: node.scaleY(), rotation: node.rotation() });
    },
  };

  let node = null;
  if (shape.type === "rect") {
    node = <Rect {...common} x={shape.x} y={shape.y} width={shape.w} height={shape.h}
      fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.strokeWidth ?? 2}
      cornerRadius={shape.cornerRadius ?? 0}
      scaleX={shape.scaleX ?? 1} scaleY={shape.scaleY ?? 1} rotation={shape.rotation ?? 0} />;
  } else if (shape.type === "circle") {
    node = <Circle {...common} x={shape.x} y={shape.y} radius={shape.r}
      fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.strokeWidth ?? 2}
      scaleX={shape.scaleX ?? 1} scaleY={shape.scaleY ?? 1} rotation={shape.rotation ?? 0} />;
  } else if (shape.type === "line") {
    node = <Line {...common} points={shape.points} stroke={shape.stroke}
      strokeWidth={shape.strokeWidth ?? 2} lineCap="round" lineJoin="round" />;
  } else if (shape.type === "arrow") {
    node = <Arrow {...common} points={shape.points} stroke={shape.stroke} fill={shape.stroke}
      strokeWidth={shape.strokeWidth ?? 2} pointerLength={10} pointerWidth={8} />;
  } else if (shape.type === "text") {
    node = <Text {...common} x={shape.x} y={shape.y} text={shape.text}
      fontSize={shape.fontSize ?? 18} fill={shape.fill} fontFamily="Inter, sans-serif"
      fontStyle={`${shape.bold ? "bold" : ""} ${shape.italic ? "italic" : ""}`.trim() || "normal"}
      textDecoration={shape.underline ? "underline" : ""}
      align={shape.align ?? "left"}
      scaleX={shape.scaleX ?? 1} scaleY={shape.scaleY ?? 1} rotation={shape.rotation ?? 0} />;
  } else if (shape.type === "pen") {
    node = <Line {...common} points={shape.points} stroke={shape.stroke}
      strokeWidth={shape.strokeWidth ?? 3} tension={0.4} lineCap="round" lineJoin="round"
      globalCompositeOperation="source-over" />;
  } else if (shape.type === "eraser") {
    node = <Line {...common} points={shape.points} stroke={bgColor}
      strokeWidth={shape.strokeWidth ?? 20} tension={0.4} lineCap="round" lineJoin="round"
      globalCompositeOperation="source-over" />;
  }

  return (
    <>
      {node}
      {isSelected && !shape.locked && (
        <Transformer ref={trRef} boundBoxFunc={(_, nb) => nb}
          anchorSize={8} anchorCornerRadius={4}
          borderStroke="#0070f3" borderStrokeWidth={1.5}
          anchorStroke="#0070f3" anchorFill="#fff" />
      )}
    </>
  );
}

// ── Comment Marker (DOM overlay, not Konva) ───────────────────────────────────
function CommentMarker({ marker, zoom, stagePos, theme, onDelete, onMove, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // canvas → screen
  const sx = marker.x * zoom + stagePos.x;
  const sy = marker.y * zoom + stagePos.y;

  const handlePinMouseDown = (e) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    setDragging(true);
    dragOffset.current = { x: e.clientX - sx, y: e.clientY - sy };
    const onMove = (me) => {
      const newSx = me.clientX - dragOffset.current.x;
      const newSy = me.clientY - dragOffset.current.y;
      const cx = (newSx - stagePos.x) / zoom;
      const cy = (newSy - stagePos.y) / zoom;
      onMove(marker.id, cx, cy);
    };
    const onUp = () => {
      setDragging(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const pinColor = marker.color || "#f59e0b";

  return (
    <div style={{ position: "absolute", left: sx, top: sy, zIndex: 100, userSelect: "none" }}>
      {/* Pin */}
      <div
        onMouseDown={handlePinMouseDown}
        onClick={(e) => { e.stopPropagation(); if (!dragging) setOpen(o => !o); }}
        title={marker.author}
        style={{
          width: "32px", height: "32px", borderRadius: "50% 50% 50% 0",
          background: pinColor, transform: "rotate(-45deg)",
          cursor: dragging ? "grabbing" : "grab",
          boxShadow: open ? `0 0 0 3px ${pinColor}44, 0 4px 12px rgba(0,0,0,0.4)` : "0 2px 8px rgba(0,0,0,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "box-shadow 0.15s",
          border: `2px solid ${theme.isDark ? "#000" : "#fff"}`,
        }}
      >
        <span style={{ transform: "rotate(45deg)", fontSize: "13px" }}>
          {marker.contentType === "image" ? "🖼" : "💬"}
        </span>
      </div>

      {/* Card popup */}
      {open && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: "absolute", left: "38px", top: "-8px",
            width: "240px", background: theme.bgSecondary,
            border: `1px solid ${theme.border}`, borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
            overflow: "hidden", animation: "fadeIn 0.15s ease",
          }}
        >
          {/* Card header */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", borderBottom: `1px solid ${theme.border}`, background: pinColor + "22" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: pinColor, flexShrink: 0 }} />
            <span style={{ fontSize: "12px", fontWeight: 700, color: theme.text, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {marker.author}
            </span>
            <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: theme.textSecondary, padding: "0", display: "flex" }}>
              <X size={14} />
            </button>
            <button onClick={() => onDelete(marker.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#f87171", padding: "0", display: "flex" }} title="Delete marker">
              <Trash2 size={14} />
            </button>
          </div>

          {/* Card content */}
          <div style={{ padding: "12px" }}>
            {marker.contentType === "text" ? (
              <p style={{ margin: 0, fontSize: "13px", color: theme.text, lineHeight: 1.5, wordBreak: "break-word" }}>
                {marker.content}
              </p>
            ) : marker.contentType === "image" && marker.content ? (
              <img src={marker.content} alt="marker"
                style={{ width: "100%", borderRadius: "8px", display: "block", maxHeight: "160px", objectFit: "cover" }} />
            ) : (
              <p style={{ margin: 0, fontSize: "12px", color: theme.textSecondary, fontStyle: "italic" }}>No content</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Playground ───────────────────────────────────────────────────────────
const Playground = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const isHost = location.search.includes("host=true");

  const [activeTool, setActiveTool] = useState("select");
  const [shapes, setShapes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [cursors, setCursors] = useState({});
  const [users, setUsers] = useState([]);
  const [toast, setToast] = useState({ show: false, message: "" });
  const [strokeColor, setStrokeColor] = useState("#0070f3");
  const [fillColor, setFillColor] = useState("transparent");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [opacity, setOpacity] = useState(1);
  const [fontSize, setFontSize] = useState(18);
  const [textBold, setTextBold] = useState(false);
  const [textItalic, setTextItalic] = useState(false);
  const [textUnderline, setTextUnderline] = useState(false);
  const [textAlign, setTextAlign] = useState("left");
  const [cornerRadius, setCornerRadius] = useState(0);
  const [showGrid, setShowGrid] = useState(true);
  const [showLayers, setShowLayers] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [history, setHistory] = useState([[]]);
  const [historyIdx, setHistoryIdx] = useState(0);
  const [clipboard, setClipboardShape] = useState(null);
  const [stageSize, setStageSize] = useState({ w: window.innerWidth - 260, h: window.innerHeight });
  const [eraserSize, setEraserSize] = useState(20);
  const [mousePos, setMousePos] = useState({ x: -999, y: -999 });
  // ── comment markers ──────────────────────────────────────────────────────────
  const [markers, setMarkers] = useState([]);
  const [commentDropdown, setCommentDropdown] = useState(null);
  const [pendingMarkerPos, setPendingMarkerPos] = useState(null);
  const [modal, setModal] = useState(null);
  // ── voice chat ───────────────────────────────────────────────────────────────
  const [voiceActive, setVoiceActive] = useState(false);
  const [muted, setMuted] = useState(false);
  const [voicePeers, setVoicePeers] = useState({}); // { socketId: { username, color, speaking } }
  const localStreamRef = useRef(null);
  const peerConnsRef = useRef({}); // { socketId: RTCPeerConnection } // { title, placeholder, multiline, onConfirm }
  const socketRef = useRef(null);
  const stageRef = useRef(null);
  const isDrawing = useRef(false);
  const currentLine = useRef(null);
  const drawStart = useRef(null);
  const panStart = useRef(null);
  const containerRef = useRef(null);

  const selectedShape = shapes.find(s => s.id === selectedId) ?? null;

  // ── resize observer ──────────────────────────────────────────────────────────
  useEffect(() => {
    const onResize = () => setStageSize({ w: window.innerWidth - 260, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ── socket ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;
    socket.emit("join-room", { roomId, username: MY_NAME });
    socket.on("room-state", ({ shapes: s, markers: ms }) => {
      setShapes(s || []);
      setHistory([s || []]);
      setHistoryIdx(0);
      setMarkers(ms || []);
    });
    socket.on("shape-add", (s) => setShapes(prev => [...prev, s]));
    socket.on("shape-update", (s) => setShapes(prev => prev.map(p => p.id === s.id ? s : p)));
    socket.on("shape-delete", (id) => setShapes(prev => prev.filter(p => p.id !== id)));
    socket.on("canvas-clear", () => setShapes([]));
    socket.on("cursor-update", ({ userId, x, y, username, color }) =>
      setCursors(prev => ({ ...prev, [userId]: { x, y, username, color } })));
    socket.on("user-left", (id) => setCursors(prev => { const n = { ...prev }; delete n[id]; return n; }));
    socket.on("users-update", (u) => setUsers(u));
    socket.on("room-full", () => {
      alert("This room is full (10/10 users).");
      navigate("/dashboard");
    });
    socket.on("draw-stroke", ({ id, points, stroke, strokeWidth: sw }) => {
      setShapes(prev => {
        const idx = prev.findIndex(s => s.id === id);
        if (idx === -1) return [...prev, { id, type: "pen", points, stroke, strokeWidth: sw }];
        const updated = [...prev];
        updated[idx] = { ...updated[idx], points };
        return updated;
      });
    });
    socket.on("marker-add",    (m) => setMarkers(prev => [...prev, m]));
    socket.on("marker-update", (m) => setMarkers(prev => prev.map(p => p.id === m.id ? m : p)));
    socket.on("marker-delete", (id) => setMarkers(prev => prev.filter(p => p.id !== id)));

    // ── WebRTC voice signaling ──────────────────────────────────────────────
    socket.on("voice-user-joined", async ({ userId, username, color }) => {
      setVoicePeers(prev => ({ ...prev, [userId]: { username, color } }));
      // we are already in voice — create offer for the new peer
      if (!localStreamRef.current) return;
      const pc = createPeerConnection(userId, socket);
      localStreamRef.current.getTracks().forEach(t => pc.addTrack(t, localStreamRef.current));
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("voice-offer", { to: userId, offer });
    });

    socket.on("voice-offer", async ({ from, offer }) => {
      setVoicePeers(prev => ({ ...prev, [from]: prev[from] || { username: from, color: "#888" } }));
      if (!localStreamRef.current) return;
      const pc = createPeerConnection(from, socket);
      localStreamRef.current.getTracks().forEach(t => pc.addTrack(t, localStreamRef.current));
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("voice-answer", { to: from, answer });
    });

    socket.on("voice-answer", async ({ from, answer }) => {
      const pc = peerConnsRef.current[from];
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on("voice-ice", async ({ from, candidate }) => {
      const pc = peerConnsRef.current[from];
      if (pc && candidate) await pc.addIceCandidate(new RTCIceCandidate(candidate));
    });

    socket.on("voice-user-left", ({ userId }) => {
      setVoicePeers(prev => { const n = { ...prev }; delete n[userId]; return n; });
      if (peerConnsRef.current[userId]) {
        peerConnsRef.current[userId].close();
        delete peerConnsRef.current[userId];
      }
    });
    return () => {
      socket.disconnect();
      stopVoice();
    };
  }, [roomId]);

  // ── history helpers ──────────────────────────────────────────────────────────
  const pushHistory = useCallback((newShapes) => {
    setHistory(prev => {
      const trimmed = prev.slice(0, historyIdx + 1);
      return [...trimmed, newShapes];
    });
    setHistoryIdx(prev => prev + 1);
  }, [historyIdx]);

  const undo = useCallback(() => {
    if (historyIdx <= 0) return;
    const prev = history[historyIdx - 1];
    setShapes(prev);
    setHistoryIdx(i => i - 1);
    setSelectedId(null);
  }, [history, historyIdx]);

  const redo = useCallback(() => {
    if (historyIdx >= history.length - 1) return;
    const next = history[historyIdx + 1];
    setShapes(next);
    setHistoryIdx(i => i + 1);
    setSelectedId(null);
  }, [history, historyIdx]);

  // ── emit helpers ─────────────────────────────────────────────────────────────
  const emitAdd = (s) => socketRef.current?.emit("shape-add", s);
  const emitUpdate = (s) => socketRef.current?.emit("shape-update", s);
  const emitDelete = (id) => socketRef.current?.emit("shape-delete", id);

  const addShape = (shape) => {
    const newShapes = [...shapes, shape];
    setShapes(newShapes);
    pushHistory(newShapes);
    emitAdd(shape);
  };

  const handleShapeChange = useCallback((updated) => {
    setShapes(prev => {
      const next = prev.map(s => s.id === updated.id ? updated : s);
      pushHistory(next);
      return next;
    });
    emitUpdate(updated);
  }, [pushHistory]);

  // ── pen finalize ─────────────────────────────────────────────────────────────
  const finalizePenStroke = useCallback(() => {
    const line = currentLine.current;
    if (!line) return;
    currentLine.current = null;
    if (line.points.length >= 4) {
      // shape is already in state from mousedown/mousemove — just emit & push history
      emitAdd(line);
      setShapes(prev => {
        pushHistory(prev);
        return prev;
      });
    } else {
      // single-point ghost — remove it
      setShapes(prev => prev.filter(s => s.id !== line.id));
    }
  }, [pushHistory]);

  // ── zoom ─────────────────────────────────────────────────────────────────────
  const handleWheel = (e) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    const oldScale = zoom;
    const pointer = stage.getPointerPosition();
    const mousePointTo = { x: (pointer.x - stagePos.x) / oldScale, y: (pointer.y - stagePos.y) / oldScale };
    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = Math.min(Math.max(oldScale + direction * 0.08, 0.1), 5);
    setZoom(newScale);
    setStagePos({ x: pointer.x - mousePointTo.x * newScale, y: pointer.y - mousePointTo.y * newScale });
  };

  // ── mouse events ─────────────────────────────────────────────────────────────
  const getPos = (e) => {
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    return { x: (pos.x - stagePos.x) / zoom, y: (pos.y - stagePos.y) / zoom };
  };

  const handleMouseDown = (e) => {
    const pos = getPos(e);
    socketRef.current?.emit("cursor-move", pos);

    // middle mouse or space+drag = pan
    if (e.evt.button === 1 || activeTool === "pan") {
      setIsPanning(true);
      panStart.current = { x: e.evt.clientX - stagePos.x, y: e.evt.clientY - stagePos.y };
      return;
    }
    if (activeTool === "select") return;
    if (activeTool === "comment") {
      // show dropdown at click position
      const stage = e.target.getStage();
      const raw = stage.getPointerPosition();
      setPendingMarkerPos(pos);
      setCommentDropdown({ x: raw.x + 260, y: raw.y }); // +260 sidebar
      return;
    }

    isDrawing.current = true;
    setSelectedId(null);

    if (activeTool === "pen" || activeTool === "eraser") {
      const shape = {
        id: uuidv4(), type: activeTool,
        points: [pos.x, pos.y],
        stroke: activeTool === "eraser" ? null : strokeColor,
        strokeWidth: activeTool === "eraser" ? eraserSize : strokeWidth,
        opacity,
      };
      currentLine.current = shape;
      setShapes(prev => [...prev, shape]);
    } else {
      drawStart.current = pos;
    }
  };

  const handleMouseMove = (e) => {
    // always emit cursor position regardless of tool or drawing state
    const stage = e.target.getStage();
    const raw = stage.getPointerPosition();
    const canvasPos = { x: (raw.x - stagePos.x) / zoom, y: (raw.y - stagePos.y) / zoom };
    socketRef.current?.emit("cursor-move", canvasPos);

    const pos = canvasPos;

    // track screen position for eraser cursor circle
    if (activeTool === "eraser") {
      setMousePos({ x: raw.x + 260, y: raw.y });
    }

    if (isPanning) {
      setStagePos({ x: e.evt.clientX - panStart.current.x, y: e.evt.clientY - panStart.current.y });
      return;
    }
    if (!isDrawing.current) return;

    if (activeTool === "pen" || activeTool === "eraser") {
      const line = currentLine.current;
      if (!line) return;
      const pts = [...line.points, pos.x, pos.y];
      currentLine.current = { ...line, points: pts };
      setShapes(prev => prev.map(s => s.id === line.id ? { ...s, points: pts } : s));
      socketRef.current?.emit("draw-stroke", { id: line.id, points: pts, stroke: line.stroke, strokeWidth: line.strokeWidth });
      return;
    }

    const start = drawStart.current;
    if (!start) return;

    // live preview for shapes
    const previewId = "__preview__";
    let preview = null;
    if (activeTool === "rect") {
      preview = { id: previewId, type: "rect", x: Math.min(start.x, pos.x), y: Math.min(start.y, pos.y), w: Math.abs(pos.x - start.x), h: Math.abs(pos.y - start.y), fill: fillColor, stroke: strokeColor, strokeWidth, cornerRadius, opacity };
    } else if (activeTool === "circle") {
      const r = Math.hypot(pos.x - start.x, pos.y - start.y) / 2;
      preview = { id: previewId, type: "circle", x: (start.x + pos.x) / 2, y: (start.y + pos.y) / 2, r, fill: fillColor, stroke: strokeColor, strokeWidth, opacity };
    } else if (activeTool === "line") {
      preview = { id: previewId, type: "line", points: [start.x, start.y, pos.x, pos.y], stroke: strokeColor, strokeWidth, opacity };
    } else if (activeTool === "arrow") {
      preview = { id: previewId, type: "arrow", points: [start.x, start.y, pos.x, pos.y], stroke: strokeColor, strokeWidth, opacity };
    }
    if (preview) setShapes(prev => [...prev.filter(s => s.id !== previewId), preview]);
  };

  const handleMouseUp = (e) => {
    if (isPanning) { setIsPanning(false); return; }
    if (!isDrawing.current) return;
    isDrawing.current = false;
    const pos = getPos(e);

    if (activeTool === "pen" || activeTool === "eraser") {
      finalizePenStroke();
      return;
    }

    const start = drawStart.current;
    if (!start) return;
    setShapes(prev => prev.filter(s => s.id !== "__preview__"));

    let shape = null;
    if (activeTool === "rect") {
      const w = Math.abs(pos.x - start.x), h = Math.abs(pos.y - start.y);
      if (w < 4 || h < 4) { drawStart.current = null; return; }
      shape = { id: uuidv4(), type: "rect", x: Math.min(start.x, pos.x), y: Math.min(start.y, pos.y), w, h, fill: fillColor, stroke: strokeColor, strokeWidth, cornerRadius, opacity };
    } else if (activeTool === "circle") {
      const r = Math.hypot(pos.x - start.x, pos.y - start.y) / 2;
      if (r < 4) { drawStart.current = null; return; }
      shape = { id: uuidv4(), type: "circle", x: (start.x + pos.x) / 2, y: (start.y + pos.y) / 2, r, fill: fillColor, stroke: strokeColor, strokeWidth, opacity };
    } else if (activeTool === "line") {
      shape = { id: uuidv4(), type: "line", points: [start.x, start.y, pos.x, pos.y], stroke: strokeColor, strokeWidth, opacity };
    } else if (activeTool === "arrow") {
      shape = { id: uuidv4(), type: "arrow", points: [start.x, start.y, pos.x, pos.y], stroke: strokeColor, strokeWidth, opacity };
    } else if (activeTool === "text") {
      // show custom modal instead of prompt
      const pos2 = { ...start };
      setModal({
        title: "Add Text", placeholder: "Type something...",
        onConfirm: (text) => {
          const shape = { id: uuidv4(), type: "text", x: pos2.x, y: pos2.y, text, fill: strokeColor, fontSize, bold: textBold, italic: textItalic, underline: textUnderline, align: textAlign, opacity };
          addShape(shape);
          setModal(null);
        },
      });
      drawStart.current = null;
      return;
    }

    if (shape) addShape(shape);
    drawStart.current = null;
  };

  // ── keyboard shortcuts ────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if ((e.ctrlKey || e.metaKey) && e.key === "z") { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") { e.preventDefault(); redo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        if (selectedShape) setClipboardShape({ ...selectedShape });
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        if (clipboard) {
          const pasted = { ...clipboard, id: uuidv4(), x: (clipboard.x ?? 0) + 20, y: (clipboard.y ?? 0) + 20 };
          addShape(pasted);
          setSelectedId(pasted.id);
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        if (selectedShape) {
          const dup = { ...selectedShape, id: uuidv4(), x: (selectedShape.x ?? 0) + 20, y: (selectedShape.y ?? 0) + 20 };
          addShape(dup);
          setSelectedId(dup.id);
        }
      }
      if (e.key === "Delete" || e.key === "Backspace") deleteSelected();
      if (e.key === "Escape") setSelectedId(null);
      if (e.key === "v") setActiveTool("select");
      if (e.key === "p") setActiveTool("pen");
      if (e.key === "r") setActiveTool("rect");
      if (e.key === "c") setActiveTool("circle");
      if (e.key === "t") setActiveTool("text");
      if (e.key === "l") setActiveTool("line");
      if (e.key === "a") setActiveTool("arrow");
      if (e.key === "e") setActiveTool("eraser");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedShape, clipboard, shapes, undo, redo]);

  // ── actions ───────────────────────────────────────────────────────────────────
  const deleteSelected = () => {
    if (!selectedId) return;
    const newShapes = shapes.filter(s => s.id !== selectedId);
    setShapes(newShapes);
    pushHistory(newShapes);
    emitDelete(selectedId);
    setSelectedId(null);
  };

  const clearCanvas = () => {
    setShapes([]);
    pushHistory([]);
    socketRef.current?.emit("canvas-clear");
    setSelectedId(null);
  };

  const toggleLock = () => {
    if (!selectedShape) return;
    handleShapeChange({ ...selectedShape, locked: !selectedShape.locked });
  };

  const toggleHide = () => {
    if (!selectedShape) return;
    handleShapeChange({ ...selectedShape, hidden: !selectedShape.hidden });
  };

  const bringForward = () => {
    if (!selectedId) return;
    setShapes(prev => {
      const idx = prev.findIndex(s => s.id === selectedId);
      if (idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      pushHistory(next);
      return next;
    });
  };

  const sendBackward = () => {
    if (!selectedId) return;
    setShapes(prev => {
      const idx = prev.findIndex(s => s.id === selectedId);
      if (idx <= 0) return prev;
      const next = [...prev];
      [next[idx], next[idx - 1]] = [next[idx - 1], next[idx]];
      pushHistory(next);
      return next;
    });
  };

  const exportPNG = () => {
    const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
    const a = document.createElement("a"); a.href = uri; a.download = `sketchly-${roomId}.png`; a.click();
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/join/${roomId}`;
    navigator.clipboard.writeText(link);
    setToast({ show: true, message: "Invite link copied! Share it with up to 10 collaborators." });
  };

  const zoomTo = (val) => {
    const newScale = Math.min(Math.max(val, 0.1), 5);
    const cx = stageSize.w / 2, cy = stageSize.h / 2;
    setStagePos({ x: cx - (cx - stagePos.x) * (newScale / zoom), y: cy - (cy - stagePos.y) * (newScale / zoom) });
    setZoom(newScale);
  };

  const resetView = () => { setZoom(1); setStagePos({ x: 0, y: 0 }); };

  // ── WebRTC helpers ────────────────────────────────────────────────────────────
  const createPeerConnection = (peerId, socket) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });
    pc.onicecandidate = (e) => {
      if (e.candidate) socket.emit("voice-ice", { to: peerId, candidate: e.candidate });
    };
    pc.ontrack = (e) => {
      const audio = document.createElement("audio");
      audio.srcObject = e.streams[0];
      audio.autoplay = true;
      audio.dataset.peerId = peerId;
      document.body.appendChild(audio);
    };
    peerConnsRef.current[peerId] = pc;
    return pc;
  };

  const startVoice = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream;
      setVoiceActive(true);
      socketRef.current?.emit("voice-join");
      setToast({ show: true, message: "Voice chat started — others will hear you." });
    } catch {
      setToast({ show: true, message: "Microphone access denied." });
    }
  };

  const stopVoice = () => {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    Object.values(peerConnsRef.current).forEach(pc => pc.close());
    peerConnsRef.current = {};
    // remove injected audio elements
    document.querySelectorAll("audio[data-peer-id]").forEach(a => a.remove());
    setVoiceActive(false);
    setMuted(false);
    setVoicePeers({});
    socketRef.current?.emit("voice-leave");
  };

  const toggleMute = () => {
    if (!localStreamRef.current) return;
    const enabled = !muted;
    localStreamRef.current.getAudioTracks().forEach(t => { t.enabled = enabled; });
    setMuted(!enabled);
  };

  // ── comment marker actions ────────────────────────────────────────────────────
  const addMarker = (contentType, content) => {
    if (!pendingMarkerPos) return;
    const marker = {
      id: uuidv4(), x: pendingMarkerPos.x, y: pendingMarkerPos.y,
      contentType, content, author: MY_NAME,
      color: COLORS[Math.floor(Math.random() * 7)],
    };
    setMarkers(prev => [...prev, marker]);
    socketRef.current?.emit("marker-add", marker);
    setCommentDropdown(null);
    setPendingMarkerPos(null);
  };

  const deleteMarker = (id) => {
    setMarkers(prev => prev.filter(m => m.id !== id));
    socketRef.current?.emit("marker-delete", id);
  };

  const moveMarker = (id, x, y) => {
    setMarkers(prev => {
      const updated = prev.map(m => m.id === id ? { ...m, x, y } : m);
      const moved = updated.find(m => m.id === id);
      if (moved) socketRef.current?.emit("marker-update", moved);
      return updated;
    });
  };

  const handleAddTextMarker = () => {
    setCommentDropdown(null);
    setModal({
      title: "Add Comment", placeholder: "Write your comment...", multiline: true,
      onConfirm: (text) => { addMarker("text", text); setModal(null); },
    });
  };

  const handleAddImageMarker = () => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => addMarker("image", ev.target.result);
      reader.readAsDataURL(file);
    };
    input.click();
    setCommentDropdown(null);
  };

  // ── cursor style ──────────────────────────────────────────────────────────────
  const cursorMap = { select: "default", pen: "crosshair", eraser: "none", rect: "crosshair", circle: "crosshair", line: "crosshair", arrow: "crosshair", text: "text", pan: "grab", comment: "cell" };
  const stageCursor = isPanning ? "grabbing" : (cursorMap[activeTool] ?? "default");

  // ── tool definitions ──────────────────────────────────────────────────────────
  const tools = [
    { key: "select",  icon: MousePointer2,  label: "Select (V)" },
    { key: "pen",     icon: Pencil,         label: "Pen (P)" },
    { key: "eraser",  icon: Eraser,         label: "Eraser (E)" },
    { key: "rect",    icon: Square,         label: "Rectangle (R)" },
    { key: "circle",  icon: CircleIcon,     label: "Circle (C)" },
    { key: "line",    icon: Minus,          label: "Line (L)" },
    { key: "arrow",   icon: ArrowRight,     label: "Arrow (A)" },
    { key: "text",    icon: Type,           label: "Text (T)" },
    { key: "comment", icon: MessageCircle,  label: "Comment Marker" },
  ];

  // ── styles ────────────────────────────────────────────────────────────────────
  const s = {
    sidebar: {
      width: "260px", borderRight: `1px solid ${theme.border}`, padding: "16px",
      display: "flex", flexDirection: "column", background: theme.bgSecondary,
      flexShrink: 0, overflowY: "auto", gap: "0",
    },
    section: { marginBottom: "20px" },
    sectionLabel: {
      fontSize: "10px", fontWeight: 700, color: theme.textSecondary,
      textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "8px", display: "block",
    },
    iconBtn: (active) => ({
      background: active ? "#0070f3" : "transparent",
      border: `1px solid ${active ? "#0070f3" : theme.border}`,
      color: active ? "#fff" : theme.textSecondary,
      width: "36px", height: "36px", borderRadius: "8px",
      display: "flex", alignItems: "center", justifyContent: "center",
      cursor: "pointer", transition: "all 0.15s",
    }),
    input: {
      background: theme.bg, border: `1px solid ${theme.border}`, color: theme.text,
      borderRadius: "6px", padding: "5px 8px", fontSize: "12px", width: "100%", boxSizing: "border-box",
    },
    row: { display: "flex", gap: "8px", alignItems: "center" },
    label: { fontSize: "11px", color: theme.textSecondary, marginBottom: "4px", display: "block" },
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: theme.bg, overflow: "hidden", fontFamily: "Inter, sans-serif" }}>
      <Toast show={toast.show} message={toast.message} theme={theme} onClose={() => setToast({ ...toast, show: false })} />

      {/* Custom input modal */}
      {modal && (
        <InputModal
          title={modal.title}
          placeholder={modal.placeholder}
          multiline={modal.multiline}
          theme={theme}
          onConfirm={modal.onConfirm}
          onCancel={() => { setModal(null); setPendingMarkerPos(null); }}
        />
      )}

      {/* Eraser cursor circle */}
      {activeTool === "eraser" && (
        <div style={{
          position: "fixed",
          left: mousePos.x - eraserSize / 2,
          top: mousePos.y - eraserSize / 2,
          width: eraserSize,
          height: eraserSize,
          borderRadius: "50%",
          border: "2px solid #0070f3",
          background: "rgba(0,112,243,0.08)",
          pointerEvents: "none",
          zIndex: 9999,
          transition: "width 0.1s, height 0.1s",
        }} />
      )}

      {/* Comment dropdown */}
      {commentDropdown && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: "fixed", left: commentDropdown.x, top: commentDropdown.y,
            zIndex: 9999, background: theme.bgSecondary,
            border: `1px solid ${theme.border}`, borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.35)", overflow: "hidden",
            minWidth: "180px", animation: "fadeIn 0.15s ease",
          }}
        >
          <div style={{ padding: "8px 12px", borderBottom: `1px solid ${theme.border}`, fontSize: "11px", fontWeight: 700, color: theme.textSecondary, textTransform: "uppercase", letterSpacing: "0.1em", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            Add Marker
            <button onClick={() => { setCommentDropdown(null); setPendingMarkerPos(null); }} style={{ background: "none", border: "none", cursor: "pointer", color: theme.textSecondary, padding: 0, display: "flex" }}><X size={13}/></button>
          </div>
          <button onClick={handleAddTextMarker}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "11px 14px", background: "none", border: "none", cursor: "pointer", color: theme.text, fontSize: "13px", fontWeight: 500, borderBottom: `1px solid ${theme.border}` }}
            onMouseEnter={e => e.currentTarget.style.background = theme.isDark ? "#1a1a1a" : "#f5f5f5"}
            onMouseLeave={e => e.currentTarget.style.background = "none"}
          >
            <MessageCircle size={16} style={{ color: "#0070f3" }} /> Add Text Comment
          </button>
          <button onClick={handleAddImageMarker}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "11px 14px", background: "none", border: "none", cursor: "pointer", color: theme.text, fontSize: "13px", fontWeight: 500 }}
            onMouseEnter={e => e.currentTarget.style.background = theme.isDark ? "#1a1a1a" : "#f5f5f5"}
            onMouseLeave={e => e.currentTarget.style.background = "none"}
          >
            <ImageIcon size={16} style={{ color: "#f59e0b" }} /> Add Image
          </button>
        </div>
      )}

      {/* ── Left Sidebar ── */}
      <aside style={s.sidebar}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: 700, color: theme.text, cursor: "pointer" }} onClick={() => navigate("/dashboard")}>
            <BrainCircuit size={18} style={{ color: "#0070f3" }} />
            Sketchly <span style={{ color: theme.textSecondary, fontWeight: 400, fontSize: "12px" }}>Beta</span>
          </div>
          <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
            {isHost && <Crown size={16} style={{ color: "#F59E0B" }} />}
            <button onClick={toggleTheme} style={s.iconBtn(false)} title="Toggle theme">
              {theme.isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </div>

        {/* Tools */}
        <div style={s.section}>
          <span style={s.sectionLabel}>Tools</span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "6px" }}>
            {tools.map(t => (
              <button key={t.key} title={t.label}
                style={{ ...s.iconBtn(activeTool === t.key), width: "100%", height: "38px", borderRadius: "8px", flexDirection: "column", gap: "2px", fontSize: "9px" }}
                onClick={() => setActiveTool(t.key)}>
                <t.icon size={15} />
              </button>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div style={s.section}>
          <span style={s.sectionLabel}>Colors</span>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
            {COLORS.map(c => (
              <div key={c} onClick={() => setStrokeColor(c)}
                style={{ width: "20px", height: "20px", borderRadius: "50%", background: c, cursor: "pointer", border: strokeColor === c ? "2px solid #0070f3" : `2px solid ${theme.border}`, flexShrink: 0 }} />
            ))}
          </div>
          <div style={s.row}>
            <div style={{ flex: 1 }}>
              <span style={s.label}>Stroke</span>
              <input type="color" value={strokeColor} onChange={e => setStrokeColor(e.target.value)}
                style={{ width: "100%", height: "28px", border: `1px solid ${theme.border}`, borderRadius: "6px", cursor: "pointer", background: "none", padding: "2px" }} />
            </div>
            <div style={{ flex: 1 }}>
              <span style={s.label}>Fill</span>
              <input type="color" value={fillColor === "transparent" ? "#ffffff" : fillColor}
                onChange={e => setFillColor(e.target.value)}
                style={{ width: "100%", height: "28px", border: `1px solid ${theme.border}`, borderRadius: "6px", cursor: "pointer", background: "none", padding: "2px" }} />
            </div>
            <div style={{ marginTop: "14px" }}>
              <button onClick={() => setFillColor("transparent")} title="No fill"
                style={{ ...s.iconBtn(fillColor === "transparent"), width: "28px", height: "28px", fontSize: "9px", borderRadius: "6px" }}>
                ∅
              </button>
            </div>
          </div>
        </div>

        {/* Stroke & Opacity */}
        <div style={s.section}>
          <span style={s.sectionLabel}>Style</span>
          <div style={{ marginBottom: "10px" }}>
            <span style={s.label}>Stroke Width: {strokeWidth}px</span>
            <input type="range" min="1" max="30" value={strokeWidth} onChange={e => setStrokeWidth(+e.target.value)}
              style={{ width: "100%", accentColor: "#0070f3" }} />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <span style={s.label}>Opacity: {Math.round(opacity * 100)}%</span>
            <input type="range" min="0" max="1" step="0.05" value={opacity} onChange={e => setOpacity(+e.target.value)}
              style={{ width: "100%", accentColor: "#0070f3" }} />
          </div>
          {activeTool === "rect" && (
            <div>
              <span style={s.label}>Corner Radius: {cornerRadius}px</span>
              <input type="range" min="0" max="60" value={cornerRadius} onChange={e => setCornerRadius(+e.target.value)}
                style={{ width: "100%", accentColor: "#0070f3" }} />
            </div>
          )}
          {activeTool === "eraser" && (
            <div>
              <span style={s.label}>Eraser Size: {eraserSize}px</span>
              <input type="range" min="4" max="120" value={eraserSize} onChange={e => setEraserSize(+e.target.value)}
                style={{ width: "100%", accentColor: "#0070f3" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: "8px" }}>
                <div style={{ width: `${Math.min(eraserSize, 80)}px`, height: `${Math.min(eraserSize, 80)}px`, borderRadius: "50%", border: "2px solid #0070f3", background: "transparent" }} />
              </div>
            </div>
          )}
        </div>

        {/* Text options */}
        {(activeTool === "text" || selectedShape?.type === "text") && (
          <div style={s.section}>
            <span style={s.sectionLabel}>Text</span>
            <div style={{ marginBottom: "8px" }}>
              <span style={s.label}>Font Size</span>
              <input type="number" value={fontSize} min="8" max="120"
                onChange={e => { setFontSize(+e.target.value); if (selectedShape?.type === "text") handleShapeChange({ ...selectedShape, fontSize: +e.target.value }); }}
                style={s.input} />
            </div>
            <div style={{ ...s.row, marginBottom: "8px" }}>
              <button style={s.iconBtn(textBold)} onClick={() => { setTextBold(b => !b); if (selectedShape?.type === "text") handleShapeChange({ ...selectedShape, bold: !textBold }); }} title="Bold"><Bold size={14} /></button>
              <button style={s.iconBtn(textItalic)} onClick={() => { setTextItalic(i => !i); if (selectedShape?.type === "text") handleShapeChange({ ...selectedShape, italic: !textItalic }); }} title="Italic"><Italic size={14} /></button>
              <button style={s.iconBtn(textUnderline)} onClick={() => { setTextUnderline(u => !u); if (selectedShape?.type === "text") handleShapeChange({ ...selectedShape, underline: !textUnderline }); }} title="Underline"><Underline size={14} /></button>
            </div>
            <div style={s.row}>
              {["left","center","right"].map(a => (
                <button key={a} style={s.iconBtn(textAlign === a)} onClick={() => { setTextAlign(a); if (selectedShape?.type === "text") handleShapeChange({ ...selectedShape, align: a }); }} title={`Align ${a}`}>
                  {a === "left" ? <AlignLeft size={14}/> : a === "center" ? <AlignCenter size={14}/> : <AlignRight size={14}/>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected shape properties */}
        {selectedShape && (
          <div style={s.section}>
            <span style={s.sectionLabel}>Selection</span>
            <div style={{ ...s.row, flexWrap: "wrap", gap: "6px" }}>
              <button style={s.iconBtn(false)} onClick={() => { setClipboardShape({ ...selectedShape }); setToast({ show: true, message: "Copied!" }); }} title="Copy (Ctrl+C)"><Copy size={14}/></button>
              <button style={s.iconBtn(false)} onClick={() => { if (clipboard) { const p = { ...clipboard, id: uuidv4(), x: (clipboard.x??0)+20, y: (clipboard.y??0)+20 }; addShape(p); setSelectedId(p.id); } }} title="Paste (Ctrl+V)"><Clipboard size={14}/></button>
              <button style={s.iconBtn(false)} onClick={() => { const d = { ...selectedShape, id: uuidv4(), x: (selectedShape.x??0)+20, y: (selectedShape.y??0)+20 }; addShape(d); setSelectedId(d.id); }} title="Duplicate (Ctrl+D)"><Copy size={14}/></button>
              <button style={s.iconBtn(selectedShape.locked)} onClick={toggleLock} title="Lock/Unlock">{selectedShape.locked ? <Lock size={14}/> : <Unlock size={14}/>}</button>
              <button style={s.iconBtn(selectedShape.hidden)} onClick={toggleHide} title="Show/Hide">{selectedShape.hidden ? <EyeOff size={14}/> : <Eye size={14}/>}</button>
              <button style={{ ...s.iconBtn(false), color: "#f87171", borderColor: "#f87171" }} onClick={deleteSelected} title="Delete (Del)"><Trash2 size={14}/></button>
            </div>
            <div style={{ ...s.row, marginTop: "8px" }}>
              <button style={{ ...s.iconBtn(false), flex: 1, width: "auto", fontSize: "10px", gap: "4px" }} onClick={bringForward}>↑ Forward</button>
              <button style={{ ...s.iconBtn(false), flex: 1, width: "auto", fontSize: "10px", gap: "4px" }} onClick={sendBackward}>↓ Backward</button>
            </div>
            {/* Opacity for selected */}
            <div style={{ marginTop: "8px" }}>
              <span style={s.label}>Opacity: {Math.round((selectedShape.opacity ?? 1) * 100)}%</span>
              <input type="range" min="0" max="1" step="0.05" value={selectedShape.opacity ?? 1}
                onChange={e => handleShapeChange({ ...selectedShape, opacity: +e.target.value })}
                style={{ width: "100%", accentColor: "#0070f3" }} />
            </div>
          </div>
        )}

        {/* Layers */}
        <div style={s.section}>
          <div style={{ ...s.row, justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={s.sectionLabel}>Layers ({shapes.length})</span>
            <button style={s.iconBtn(showLayers)} onClick={() => setShowLayers(l => !l)} title="Toggle layers"><Layers size={13}/></button>
          </div>
          {showLayers && (
            <div style={{ maxHeight: "160px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "3px" }}>
              {[...shapes].reverse().map((sh, i) => (
                <div key={sh.id} onClick={() => setSelectedId(sh.id)}
                  style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 8px", borderRadius: "6px", cursor: "pointer", background: selectedId === sh.id ? "#0070f320" : "transparent", border: `1px solid ${selectedId === sh.id ? "#0070f3" : "transparent"}`, fontSize: "11px", color: theme.text }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: sh.stroke || sh.fill || "#888", flexShrink: 0 }} />
                  <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {sh.type}{sh.type === "text" ? `: ${sh.text?.slice(0, 12)}` : ""} #{shapes.length - i}
                  </span>
                  {sh.locked && <Lock size={10} style={{ color: theme.textSecondary }} />}
                  {sh.hidden && <EyeOff size={10} style={{ color: theme.textSecondary }} />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Online users */}
        <div style={{ ...s.section, flex: 1 }}>
          <span style={s.sectionLabel}><Users size={10} style={{ display: "inline", marginRight: "4px" }} />Online ({users.length})</span>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            {users.map(u => (
              <div key={u.id} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: theme.textSecondary }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: u.color, flexShrink: 0 }} />
                {u.username}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "auto", paddingTop: "12px", borderTop: `1px solid ${theme.border}` }}>
          <div style={{ ...s.row, flexWrap: "wrap", gap: "6px" }}>
            <button onClick={clearCanvas} style={{ ...s.iconBtn(false), color: "#f87171", borderColor: "#f87171", flex: 1, width: "auto", fontSize: "11px" }}>Clear All</button>
            <button onClick={exportPNG} style={{ ...s.iconBtn(false), flex: 1, width: "auto", fontSize: "11px", gap: "4px" }}><Download size={13}/>PNG</button>
          </div>

          {/* Voice chat */}
          {!voiceActive ? (
            <button onClick={startVoice} style={{ width: "100%", background: "#16a34a", color: "#fff", border: "none", padding: "10px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", cursor: "pointer" }}>
              <Mic size={15}/> Start Voice Chat
            </button>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {/* Active voice bar */}
              <div style={{ background: "#16a34a18", border: "1px solid #16a34a55", borderRadius: "8px", padding: "8px 10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: voicePeers && Object.keys(voicePeers).length > 0 ? "8px" : "0" }}>
                  <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 6px #4ade80", flexShrink: 0 }} />
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#4ade80", flex: 1 }}>Voice Active</span>
                  <span style={{ fontSize: "10px", color: theme.textSecondary }}>{Object.keys(voicePeers).length + 1} connected</span>
                </div>
                {/* Peer avatars */}
                {Object.entries(voicePeers).length > 0 && (
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                    {/* Self */}
                    <div title={`${MY_NAME} (you)`} style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#0070f3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, color: "#fff", border: muted ? "2px solid #f87171" : "2px solid #4ade80", position: "relative" }}>
                      {MY_NAME[0]?.toUpperCase()}
                      {muted && <MicOff size={8} style={{ position: "absolute", bottom: "-2px", right: "-2px", color: "#f87171" }} />}
                    </div>
                    {Object.entries(voicePeers).map(([id, p]) => (
                      <div key={id} title={p.username} style={{ width: "24px", height: "24px", borderRadius: "50%", background: p.color || "#888", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, color: "#fff", border: "2px solid #4ade80" }}>
                        {p.username?.[0]?.toUpperCase() ?? "?"}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Controls */}
              <div style={{ display: "flex", gap: "6px" }}>
                <button onClick={toggleMute} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", padding: "8px", borderRadius: "8px", border: `1px solid ${muted ? "#f87171" : theme.border}`, background: muted ? "#f8717122" : "transparent", color: muted ? "#f87171" : theme.textSecondary, cursor: "pointer", fontSize: "11px", fontWeight: 600 }}>
                  {muted ? <MicOff size={13}/> : <Mic size={13}/>}
                  {muted ? "Unmute" : "Mute"}
                </button>
                <button onClick={stopVoice} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", padding: "8px", borderRadius: "8px", border: "1px solid #f87171", background: "#f8717122", color: "#f87171", cursor: "pointer", fontSize: "11px", fontWeight: 600 }}>
                  <PhoneOff size={13}/> End
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ── Canvas Area ── */}
      <main style={{ flex: 1, position: "relative", overflow: "hidden", background: theme.bg }}>

        {/* Top HUD */}
        <div style={{ position: "absolute", top: "12px", left: "50%", transform: "translateX(-50%)", zIndex: 20, display: "flex", alignItems: "center", gap: "8px", background: theme.bgSecondary, border: `1px solid ${theme.border}`, borderRadius: "12px", padding: "6px 12px", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
          {/* Undo / Redo */}
          <button style={s.iconBtn(false)} onClick={undo} title="Undo (Ctrl+Z)" disabled={historyIdx <= 0}><Undo2 size={15}/></button>
          <button style={s.iconBtn(false)} onClick={redo} title="Redo (Ctrl+Y)" disabled={historyIdx >= history.length - 1}><Redo2 size={15}/></button>
          <div style={{ width: "1px", height: "20px", background: theme.border }} />
          {/* Zoom */}
          <button style={s.iconBtn(false)} onClick={() => zoomTo(zoom - 0.1)} title="Zoom out"><ZoomOut size={15}/></button>
          <span onClick={resetView} style={{ fontSize: "12px", color: theme.text, cursor: "pointer", minWidth: "44px", textAlign: "center", userSelect: "none" }}>{Math.round(zoom * 100)}%</span>
          <button style={s.iconBtn(false)} onClick={() => zoomTo(zoom + 0.1)} title="Zoom in"><ZoomIn size={15}/></button>
          <div style={{ width: "1px", height: "20px", background: theme.border }} />
          {/* Grid toggle */}
          <button style={s.iconBtn(showGrid)} onClick={() => setShowGrid(g => !g)} title="Toggle grid"><Grid size={15}/></button>
          <div style={{ width: "1px", height: "20px", background: theme.border }} />
          <span style={{ fontSize: "11px", color: theme.textSecondary, whiteSpace: "nowrap" }}>
            🎨 {roomId}
          </span>
        </div>

        {/* Live Collaboration Bar — top right */}
        <div style={{ position: "absolute", top: "12px", right: "16px", zIndex: 20, display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Avatar stack */}
          <div style={{ display: "flex", alignItems: "center" }}>
            {users.slice(0, 8).map((u, i) => (
              <div key={u.id} title={u.username}
                style={{ width: "30px", height: "30px", borderRadius: "50%", background: u.color, border: `2px solid ${theme.bg}`, marginLeft: i === 0 ? 0 : "-8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#fff", zIndex: users.length - i, position: "relative", cursor: "default", userSelect: "none", textTransform: "uppercase" }}>
                {u.username?.[0] ?? "?"}
              </div>
            ))}
            {users.length > 8 && (
              <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: theme.bgSecondary, border: `2px solid ${theme.border}`, marginLeft: "-8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, color: theme.textSecondary, zIndex: 0, position: "relative" }}>
                +{users.length - 8}
              </div>
            )}
          </div>

          {/* User count pill */}
          <div style={{ display: "flex", alignItems: "center", gap: "5px", background: theme.bgSecondary, border: `1px solid ${theme.border}`, borderRadius: "20px", padding: "4px 10px", fontSize: "12px", color: theme.textSecondary }}>
            <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 6px #4ade80" }} />
            {users.length}/10
          </div>

          {/* Share button */}
          <button onClick={copyInviteLink}
            style={{ display: "flex", alignItems: "center", gap: "6px", background: "#0070f3", color: "#fff", border: "none", padding: "7px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
            <Share2 size={13}/> Share
          </button>
        </div>

        {/* Active tool badge */}
        <div style={{ position: "absolute", bottom: "16px", left: "50%", transform: "translateX(-50%)", zIndex: 20, background: "#0070f3", color: "#fff", padding: "4px 14px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", pointerEvents: "none", textTransform: "uppercase" }}>
          {activeTool}
        </div>

        <Stage
          ref={stageRef}
          width={stageSize.w}
          height={stageSize.h}
          scaleX={zoom}
          scaleY={zoom}
          x={stagePos.x}
          y={stagePos.y}
          style={{ cursor: stageCursor }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            if (isDrawing.current) { isDrawing.current = false; finalizePenStroke(); }
            if (isPanning) setIsPanning(false);
            setMousePos({ x: -999, y: -999 });
            socketRef.current?.emit("cursor-move", { x: -9999, y: -9999 });
          }}
          onWheel={handleWheel}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
          onClick={(e) => { if (e.target === e.target.getStage()) { setSelectedId(null); setCommentDropdown(null); setPendingMarkerPos(null); } }}
        >
          {/* Dot grid */}
          {showGrid && <DotGrid width={stageSize.w / zoom + 200} height={stageSize.h / zoom + 200} theme={theme} scale={zoom} offsetX={stagePos.x} offsetY={stagePos.y} />}

          {/* Shapes */}
          <Layer>
            {shapes.map(sh => (
              <ShapeNode key={sh.id} shape={sh}
                isSelected={selectedId === sh.id}
                onSelect={setSelectedId}
                onChange={handleShapeChange}
                tool={activeTool}
                bgColor={theme.bg} />
            ))}
          </Layer>

          {/* Remote cursors */}
          <Layer listening={false}>
            {Object.entries(cursors).map(([id, c]) => {
              if (c.x < -1000 || c.y < -1000) return null; // off-canvas / hidden
              // convert canvas coords back to screen coords for this viewer
              const sx = c.x * zoom + stagePos.x;
              const sy = c.y * zoom + stagePos.y;
              return (
                <React.Fragment key={id}>
                  <Line points={[sx, sy, sx+8, sy+14, sx+4, sy+12, sx+2, sy+18, sx, sy+14, sx+4, sy+12]}
                    closed fill={c.color} stroke={c.color} strokeWidth={1} />
                  <Text x={sx+12} y={sy+2} text={c.username} fontSize={11} fill={c.color} fontStyle="bold" fontFamily="Inter, sans-serif" />
                </React.Fragment>
              );
            })}
          </Layer>
        </Stage>

        {/* Comment markers overlay */}
        {markers.map(m => (
          <CommentMarker key={m.id} marker={m} zoom={zoom} stagePos={stagePos} theme={theme}
            onDelete={deleteMarker} onMove={moveMarker} onUpdate={() => {}} />
        ))}
      </main>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  );
};

export default Playground;
