import { BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import SpacePage from './pages/SpacePage'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Admin from './pages/Admin'
import EditSpace from './pages/EditSpace'


function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth()
  return isAdmin ? <>{children}</> : <Navigate to="/login" />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/spaces/:slug" element={<SpacePage />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
      <Route
        path="/spaces/:slug/edit"
        element={
          <ProtectedRoute>
            <EditSpace />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}