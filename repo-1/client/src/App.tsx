import { Navigate, Route, Routes } from 'react-router-dom';
import NavBar from './components/NavBar';
import Compare from './pages/Compare';
import Dashboard from './pages/Dashboard';
import UpdateMachine from './pages/UpdateMachine';

export default function App() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/update/:machineId" element={<UpdateMachine />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
