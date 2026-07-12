import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav style={{ backgroundColor: '#F5F0E8', borderBottom: '1px solid #DDD6C8' }} className="px-6 py-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-lg font-semibold" style={{ color: '#1B2A4A' }}>
          girijaoffgrid
        </Link>

        <div className="flex items-center gap-6">
          {isAdmin ? (
            <>
              <Link to="/admin" className="text-sm font-medium" style={{ color: '#1B2A4A' }}>
                Admin
              </Link>
              <button onClick={handleLogout} className="text-sm font-medium" style={{ color: '#3D5A8A' }}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="text-sm font-medium" style={{ color: '#1B2A4A' }}>
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}