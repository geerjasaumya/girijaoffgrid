import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import PostForm from '../components/PostForm'
import MediaUploader from '../components/MediaUploader'

interface MediaItem {
  id: number
  url: string
  media_type: string
  mime_type: string | null
  caption: string | null
}

interface LinkItem {
  title: string
  url: string
}

interface Post {
  id: number
  title: string
  body: string | null
  tags: string | null
  links: LinkItem[] | null    // ← add this
  created_at: string
  media_items: MediaItem[]
}

interface Space {
  id: number
  name: string
  slug: string
  description: string | null
  icon: string | null
  cover_image_url: string | null
  posts: Post[]
}

export default function SpacePage() {
  const { slug } = useParams<{ slug: string }>()
  const { isAdmin } = useAuth()
  const [space, setSpace] = useState<Space | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingPostId, setEditingPostId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editBody, setEditBody] = useState('')
  const [editTags, setEditTags] = useState('')
  const [editLinks, setEditLinks] = useState<LinkItem[]>([])

  const fetchSpace = async () => {
    try {
      const response = await client.get(`/api/spaces/${slug}`)
      setSpace(response.data)
    } catch (err) {
      setError('Space not found')
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePost = async (postId: number) => {
    if (!confirm('Delete this post? This cannot be undone.')) return
    try {
      await client.delete(`/api/spaces/${slug}/posts/${postId}`)
      fetchSpace()
    } catch (err) {
      alert('Failed to delete post')
    }
  }

  const startEditing = (post: Post) => {
    setEditingPostId(post.id)
    setEditTitle(post.title)
    setEditBody(post.body || '')
    setEditTags(post.tags || '')
  }

  const cancelEditing = () => {
    setEditingPostId(null)
  }

  const handleUpdatePost = async (postId: number) => {
    try {
      await client.patch(`/api/spaces/${slug}/posts/${postId}`, {
        title: editTitle,
        body: editBody || null,
        tags: editTags || null,
        links: editLinks.length > 0 ? editLinks.filter(l => l.title && l.url) : null,
      })
      setEditingPostId(null)
      fetchSpace()
    } catch (err) {
      alert('Failed to update post')
    }
  }


  const addEditLink = () => setEditLinks([...editLinks, { title: '', url: '' }])

  const removeEditLink = (index: number) => setEditLinks(editLinks.filter((_, i) => i !== index))

  const updateEditLink = (index: number, field: 'title' | 'url', value: string) => {
    const updated = [...editLinks]
    updated[index][field] = value
    setEditLinks(updated)
  }


  const handleDeleteMedia = async (postId: number, mediaId: number) => {
    if (!confirm('Delete this media item?')) return
    try {
      await client.delete(`/api/spaces/${slug}/posts/${postId}/media/${mediaId}`)
      fetchSpace()
    } catch (err) {
      alert('Failed to delete media')
    }
  }


  useEffect(() => {
    fetchSpace()
  }, [slug])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">Loading...</p>
    </div>
  )

  if (error || !space) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-500">{error || 'Space not found'}</p>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {space.cover_image_url && (
        <img
          src={space.cover_image_url}
          alt={space.name}
          className="w-full h-48 object-cover rounded-xl mb-8"
        />
      )}

      <div className="mb-10">
        <div className="flex items-center gap-3">
          {space.icon && <span className="text-4xl">{space.icon}</span>}
          <h1 className="text-3xl font-bold">{space.name}</h1>
        </div>
        {space.description && (
          <p className="text-gray-500 mt-2">{space.description}</p>
        )}
      </div>

      <div className="flex flex-col gap-8">
        {isAdmin && (
          <PostForm slug={slug!} onPostCreated={fetchSpace} />
        )}

        {space.posts.length === 0 ? (
          <p className="text-gray-400">Nothing here yet.</p>
        ) : (
          space.posts.map((post) => (
            <div key={post.id} className="border border-gray-200 rounded-xl p-6">
              {editingPostId === post.id ? (
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <textarea
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    rows={4}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <input
                    type="text"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    placeholder="tags, comma, separated"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />

                  {/* Links editing */}
                  <div className="flex flex-col gap-2">
                    {editLinks.map((link, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={link.title}
                          onChange={(e) => updateEditLink(index, 'title', e.target.value)}
                          placeholder="Link title"
                          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black flex-1"
                        />
                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) => updateEditLink(index, 'url', e.target.value)}
                          placeholder="https://..."
                          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => removeEditLink(index)}
                          className="text-red-400 hover:text-red-600 text-sm px-2"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addEditLink}
                      className="text-xs text-gray-500 hover:text-black text-left"
                    >
                      + Add link
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdatePost(post.id)}
                      className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="text-sm text-gray-500 px-4 py-2 hover:text-black"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                    {isAdmin && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => startEditing(post)}
                          className="text-xs text-gray-400 hover:text-black transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="text-xs text-red-400 hover:text-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {post.tags && (
                    <div className="flex gap-2 mb-4 flex-wrap">
                      {post.tags.split(',').map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {post.body && (
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                      {post.body}
                    </p>
                  )}

                  {post.links && post.links.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {post.links.map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 hover:border-gray-400 hover:text-black transition-colors"
                        >
                          🔗 {link.title}
                        </a>
                      ))}
                    </div>
                  )}

                  {post.media_items.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {post.media_items.map((item) => (
                        <div key={item.id} className="relative">
                          {item.media_type === 'image' && (
                            <img
                              src={item.url}
                              alt={item.caption || ''}
                              className="w-full rounded-lg object-cover"
                            />
                          )}
                          {item.media_type === 'video' && (
                            <video src={item.url} controls className="w-full rounded-lg" />
                          )}
                          {item.media_type === 'audio' && (
                            <audio src={item.url} controls className="w-full" />
                          )}
                          {item.caption && (
                            <p className="text-xs text-gray-400 mt-1">{item.caption}</p>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteMedia(post.id, item.id)}
                              className="absolute top-2 right-2 bg-white/90 text-red-500 text-xs px-2 py-1 rounded-md hover:bg-white hover:text-red-700 transition-colors"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-gray-400 mt-4">
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                  {isAdmin && (
                    <MediaUploader
                      slug={slug!}
                      postId={post.id}
                      onUploaded={fetchSpace}
                    />
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}