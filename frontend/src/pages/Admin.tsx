import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'

export default function Admin() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await client.post('/api/spaces/', {
        name,
        slug,
        description: description || null,
        icon: icon || null,
        order: 0,
      })
      setSuccess(`Space "${name}" created!`)
      setName('')
      setSlug('')
      setDescription('')
      setIcon('')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    backgroundColor: '#F5F0E8',
    border: '1px solid #DDD6C8',
    color: '#1B2A4A',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '14px',
    width: '100%',
    outline: 'none',
  }

  const labelStyle = {
    fontSize: '13px',
    fontWeight: '500',
    color: '#F5F0E8',
    display: 'block',
    marginBottom: '4px',
  }

  return (
    <div style={{ backgroundColor: '#1B2A4A', minHeight: '100vh' }}>
      <div className="max-w-xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold mb-8" style={{ color: '#F5F0E8' }}>
          Create a new space
        </h1>

        {error && (
          <div className="text-sm p-3 rounded-lg mb-4" style={{ backgroundColor: '#3D1515', color: '#F5A0A0' }}>
            {error}
          </div>
        )}
        {success && (
          <div className="text-sm p-3 rounded-lg mb-4" style={{ backgroundColor: '#1A3D1A', color: '#A0F5A0' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label style={labelStyle}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Coding Space"
              style={inputStyle}
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
              placeholder="coding"
              style={inputStyle}
              required
            />
            <p className="text-xs mt-1" style={{ color: '#8BA4C8' }}>
              This becomes the URL: /spaces/{slug || '...'}
            </p>
          </div>

          <div>
            <label style={labelStyle}>Icon (emoji)</label>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="💻"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="My DSA learning and dev knowledge"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="py-2 rounded-lg text-sm font-medium"
            style={{
              backgroundColor: '#F5F0E8',
              color: '#1B2A4A',
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Creating...' : 'Create Space'}
          </button>
        </form>

        <button
          onClick={() => navigate('/')}
          className="text-sm mt-6"
          style={{ color: '#8BA4C8' }}
        >
          ← Back home
        </button>
      </div>
    </div>
  )
}