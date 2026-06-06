import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";

function App() {
  return (
    
      <div className="flex min-h-screen bg-black text-white">
        
        <Sidebar />

        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/jobs" element={<Jobs />} />
          </Routes>
        </main>

      </div>
    
  );
}

export default App;