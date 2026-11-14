import { useState } from 'react'
import client from '../api/client'

interface LinkItem {
  title: string
  url: string
}

interface PostFormProps {
  slug: string
  onPostCreated: () => void
}

export default function PostForm({ slug, onPostCreated }: PostFormProps) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tags, setTags] = useState('')
  const [links, setLinks] = useState<LinkItem[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const addLink = () => setLinks([...links, { title: '', url: '' }])
  const removeLink = (index: number) => setLinks(links.filter((_, i) => i !== index))
  const updateLink = (index: number, field: 'title' | 'url', value: string) => {
    const updated = [...links]
    updated[index][field] = value
    setLinks(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await client.post(`/api/spaces/${slug}/posts/`, {
        title,
        body: body || null,
        tags: tags || null,
        links: links.length > 0 ? links.filter(l => l.title && l.url) : null,
        order: 0,
      })
      setTitle('')
      setBody('')
      setTags('')
      setLinks([])
      setIsOpen(false)
      onPostCreated()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-2xl p-4 text-sm w-full text-center transition-colors"
        style={{ border: '1px dashed #3D5A8A', color: '#C4D4E8' }}
      >
        + New post
      </button>
    )
  }

  return (
    <div className="rounded-2xl p-6" style={{ border: '1px solid #3D5A8A' }}>
      <h3 className="font-semibold mb-4" style={{ color: '#F5F0E8' }}>New post</h3>

      {error && (
        <div className="text-sm p-3 rounded-lg mb-4" style={{ backgroundColor: '#3D1515', color: '#F5A0A0' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="dark-input"
          required
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write something..."
          rows={4}
          className="dark-input"
        />
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="tags, comma, separated"
          className="dark-input"
        />

        <div className="flex flex-col gap-2">
          {links.map((link, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={link.title}
                onChange={(e) => updateLink(index, 'title', e.target.value)}
                placeholder="Link title (e.g. GitHub)"
                className="dark-input flex-1"
              />
              <input
                type="url"
                value={link.url}
                onChange={(e) => updateLink(index, 'url', e.target.value)}
                placeholder="https://..."
                className="dark-input flex-1"
              />
              <button
                type="button"
                onClick={() => removeLink(index)}
                className="text-sm px-2"
                style={{ color: '#F5A0A0' }}
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addLink}
            className="text-xs text-left"
            style={{ color: '#8BA4C8' }}
          >
            + Add link
          </button>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ backgroundColor: '#F5F0E8', color: '#1B2A4A', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-sm px-4 py-2"
            style={{ color: '#8BA4C8' }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}