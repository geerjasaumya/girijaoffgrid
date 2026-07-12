import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import SpaceCard from '../components/SpaceCard'

interface Space {
  id: number
  name: string
  slug: string
  description: string | null
  icon: string | null
  cover_image_url: string | null
  order: number
}

export default function Home() {
  const { isAdmin } = useAuth()
  const [spaces, setSpaces] = useState<Space[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const fetchSpaces = async () => {
    try {
      const response = await client.get('/api/spaces/')
      setSpaces(response.data)
    } catch (err) {
      setError('Failed to load spaces')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSpaces()
  }, [])

  const handleDeleteSpace = async (slug: string) => {
    if (!confirm('Delete this space and everything in it? This cannot be undone.')) return
    try {
      await client.delete(`/api/spaces/${slug}`)
      fetchSpaces()
    } catch (err) {
      alert('Failed to delete space')
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F0E8' }}>
      <p className="text-gray-400">Loading...</p>
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F0E8' }}>
      <p className="text-red-500">{error}</p>
    </div>
  )

  return (
  <div style={{ backgroundColor: '#1B2A4A', minHeight: '100vh' }}>
    <div className="max-w-4xl mx-auto px-6 py-16">
      {/* Hero */}
      <div className="mb-16">
        <p className="text-xs font-medium tracking-widest uppercase mb-3" style={{ color: '#8BA4C8' }}>
          welcome to my space
        </p>
        <h1 className="text-5xl sm:text-6xl font-bold leading-tight mb-4" style={{ color: '#F5F0E8' }}>
          hey, I'm <span style={{ color: '#A8C4E0' }}>Girija</span> 👋
        </h1>
        <p className="text-lg font-light" style={{ color: '#C4D4E8' }}>
          This is my little corner of the internet — a collection of things I love, learn, and build.
        </p>
      </div>

      {/* Spaces */}
      <div>
        <h2 className="text-xl font-semibold mb-6" style={{ color: '#F5F0E8' }}>
          my spaces
        </h2>
        {spaces.length === 0 ? (
          <p style={{ color: '#8BA4C8' }}>No spaces yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {spaces.map((space) => (
              <SpaceCard
                key={space.id}
                space={space}
                onClick={() => navigate(`/spaces/${space.slug}`)}
                isAdmin={isAdmin}
                onDelete={() => handleDeleteSpace(space.slug)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
)
}