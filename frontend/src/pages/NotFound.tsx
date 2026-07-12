import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-6xl font-bold text-gray-200">404</h1>
      <p className="text-gray-500">This page doesn't exist.</p>
      <Link to="/" className="text-sm text-black underline">
        Go back home
      </Link>
    </div>
  )
}