import { useState } from 'react'
import client from '../api/client'

interface MediaUploaderProps {
  slug: string
  postId: number
  onUploaded: () => void
}

export default function MediaUploader({ slug, postId, onUploaded }: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')

    const formData = new FormData()
    formData.append('file', file)

    try {
      await client.post(
        `/api/spaces/${slug}/posts/${postId}/media/`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      )
      onUploaded()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="mt-4">
      {error && (
        <p className="text-xs text-red-500 mb-2">{error}</p>
      )}
      <label className="cursor-pointer inline-flex items-center gap-2 text-xs text-gray-500 hover:text-black transition-colors border border-dashed border-gray-300 hover:border-gray-400 rounded-lg px-3 py-2">
        {uploading ? 'Uploading...' : '+ Add image / video / audio'}
        <input
          type="file"
          accept="image/*,video/*,audio/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
      </label>
    </div>
  )
}