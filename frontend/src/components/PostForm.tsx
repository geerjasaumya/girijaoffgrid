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

  const addLink = () => {
    setLinks([...links, { title: '', url: '' }])
  }

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index))
  }

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
        className="border border-dashed border-gray-300 rounded-xl p-4 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors w-full text-center"
      >
        + New post
      </button>
    )
  }

  return (
    <div className="border border-gray-200 rounded-xl p-6">
      <h3 className="font-semibold mb-4">New post</h3>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          required
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write something..."
          rows={4}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="tags, comma, separated"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />

        {/* Links */}
        <div className="flex flex-col gap-2">
          {links.map((link, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={link.title}
                onChange={(e) => updateLink(index, 'title', e.target.value)}
                placeholder="Link title (e.g. GitHub)"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black flex-1"
              />
              <input
                type="url"
                value={link.url}
                onChange={(e) => updateLink(index, 'url', e.target.value)}
                placeholder="https://..."
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black flex-1"
              />
              <button
                type="button"
                onClick={() => removeLink(index)}
                className="text-red-400 hover:text-red-600 text-sm px-2"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addLink}
            className="text-xs text-gray-500 hover:text-black text-left"
          >
            + Add link
          </button>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-sm text-gray-500 px-4 py-2 hover:text-black"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}