import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/Login';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-darkCard border-b border-slate-800 p-4 sticky top-0 z-50 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-amber-400">
            ⚙️ BENGKEL.LAB
          </span>
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium">
          {user ? (
            <>
              <span className="text-slate-400">Halo, <strong className="text-slate-200">{user.nama}</strong> ({user.role})</span>
              <button
                onClick={handleLogout}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg transition-colors"
              >
                Keluar
              </button>
            </>
          ) : (
            <Link to="/login" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl transition-all">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-darkBg text-slate-200 font-sans">
          <Navbar />
          <main className="max-w-7xl mx-auto p-6">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}