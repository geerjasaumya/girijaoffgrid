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
    <nav className="border-b border-gray-200 px-6 py-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <Link to="/" className="font-bold text-lg tracking-tight">
          girijaoffgrid
        </Link>

        <div className="flex items-center gap-4">
          {isAdmin ? (
            <>
              <Link
                to="/admin"
                className="text-sm text-gray-600 hover:text-black transition-colors"
              >
                Admin
              </Link>
              {/* <span className="text-sm text-gray-500">admin</span> */}
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-black transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="text-sm text-gray-600 hover:text-black transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}