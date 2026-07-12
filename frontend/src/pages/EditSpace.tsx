import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import client from '../api/client'
import ImageCropper from '../components/ImageCropper'

export default function EditSpace() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [showCropper, setShowCropper] = useState(false)

  useEffect(() => {
    const fetchSpace = async () => {
      try {
        const response = await client.get(`/api/spaces/${slug}`)
        setName(response.data.name)
        setDescription(response.data.description || '')
        setIcon(response.data.icon || '')
        setCoverImageUrl(response.data.cover_image_url)
      } catch (err) {
        setError('Failed to load space')
      } finally {
        setLoading(false)
      }
    }
    fetchSpace()
  }, [slug])


  const handleCropComplete = async (croppedBlob: Blob) => {
    setShowCropper(false)
    setUploading(true)
    setError('')

    const formData = new FormData()
    formData.append('file', croppedBlob, 'cover.jpg')

    try {
        const response = await client.post(
        `/api/spaces/${slug}/cover`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        setCoverImageUrl(response.data.cover_image_url)
    } catch (err: any) {
        setError(err.response?.data?.detail || 'Upload failed')
    } finally {
        setUploading(false)
    }
    }


//   const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0]
//     if (!file) return

//     setUploading(true)
//     setError('')

//     const formData = new FormData()
//     formData.append('file', file)

//     try {
//       const response = await client.post(
//         `/api/spaces/${slug}/cover`,
//         formData,
//         { headers: { 'Content-Type': 'multipart/form-data' } }
//       )
//       setCoverImageUrl(response.data.cover_image_url)
//     } catch (err: any) {
//       setError(err.response?.data?.detail || 'Upload failed')
//     } finally {
//       setUploading(false)
//       e.target.value = ''
//     }
//   }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      await client.patch(`/api/spaces/${slug}`, {
        name,
        description: description || null,
        icon: icon || null,
      })
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">Loading...</p>
    </div>
  )

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold mb-8">Edit space</h1>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Cover image */}
        <div className="mb-6">
        <label className="text-sm font-medium text-gray-700 block mb-2">
            Cover image
        </label>
        {coverImageUrl ? (
            <div className="relative">
            <img
                src={coverImageUrl}
                alt="Cover"
                className="w-full h-40 object-cover rounded-xl"
            />
            <button
                type="button"
                onClick={() => setShowCropper(true)}
                className="absolute bottom-2 right-2 bg-white/90 text-gray-700 text-xs px-3 py-1.5 rounded-lg hover:bg-white transition-colors"
            >
                {uploading ? 'Uploading...' : 'Change'}
            </button>
            </div>
        ) : (
            <button
            type="button"
            onClick={() => setShowCropper(true)}
            className="flex items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-400 transition-colors"
            >
            <span className="text-sm text-gray-500">
                {uploading ? 'Uploading...' : '+ Upload cover image'}
            </span>
            </button>
        )}
        </div>

        {/* Cropper modal */}
        {showCropper && (
        <ImageCropper
            onCropComplete={handleCropComplete}
            onCancel={() => setShowCropper(false)}
            aspectRatio={16 / 9}
        />
        )}
        

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Icon (emoji)</label>
          <input
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-sm text-gray-500 px-4 py-2 hover:text-black"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}