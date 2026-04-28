import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Playground from "./pages/Playground";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={<Dashboard />} />
      {/* The :id makes the link shareable for collaboration */}
      <Route path="/playground/:roomId" element={<Playground />} />
    </Routes>
  );
}

export default App;
