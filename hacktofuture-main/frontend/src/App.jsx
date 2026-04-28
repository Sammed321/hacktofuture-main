import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Playground from "./pages/Playground";
import JoinRoom from "./pages/JoinRoom";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={<Dashboard />} />
      {/* host=true skips the join screen */}
      <Route path="/playground/:roomId" element={<Playground />} />
      {/* shared links go through the join screen */}
      <Route path="/join/:roomId" element={<JoinRoom />} />
    </Routes>
  );
}

export default App;
