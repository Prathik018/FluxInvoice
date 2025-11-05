import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home Page */}
        <Route path="/" element={<Home />} />

        {/* Dashboard (placeholder until you build it) */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Optional: 404 fallback */}
        <Route path="*" element={<h1 className="p-10 text-2xl">404 - Page not found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
