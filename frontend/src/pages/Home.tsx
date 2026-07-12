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
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">Loading...</p>
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-500">{error}</p>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold">hey, I'm girija 👋</h1>
        <p className="text-gray-500 mt-2">
          This is my little corner of the internet.
        </p>
      </div>

      {spaces.length === 0 ? (
        <p className="text-gray-400">No spaces yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
  )
}