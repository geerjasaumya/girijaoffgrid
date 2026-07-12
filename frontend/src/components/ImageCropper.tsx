import { useState, useRef } from 'react'
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop'
import type { Crop, PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

interface ImageCropperProps {
  onCropComplete: (croppedBlob: Blob) => void
  onCancel: () => void
  aspectRatio?: number
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number): Crop {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  )
}

export default function ImageCropper({ onCropComplete, onCancel, aspectRatio = 16 / 9 }: ImageCropperProps) {
  const [imgSrc, setImgSrc] = useState('')
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const imgRef = useRef<HTMLImageElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImgSrc(reader.result as string)
    reader.readAsDataURL(file)
  }

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    setCrop(centerAspectCrop(width, height, aspectRatio))
  }

  const getCroppedBlob = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!imgRef.current || !completedCrop) return reject('No crop')

      const canvas = document.createElement('canvas')
      const scaleX = imgRef.current.naturalWidth / imgRef.current.width
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height

      canvas.width = completedCrop.width * scaleX
      canvas.height = completedCrop.height * scaleY

      const ctx = canvas.getContext('2d')
      if (!ctx) return reject('No canvas context')

      ctx.drawImage(
        imgRef.current,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      )

      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
        else reject('Canvas is empty')
      }, 'image/jpeg', 0.95)
    })
  }

  const handleConfirm = async () => {
    const blob = await getCroppedBlob()
    onCropComplete(blob)
  }

  return (
  <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] flex flex-col">
      <h3 className="font-semibold mb-4">Crop cover image</h3>

      <div className="overflow-y-auto flex-1">
        {!imgSrc ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer flex items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-400 transition-colors"
          >
            <span className="text-sm text-gray-500">Click to select an image</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspectRatio}
          >
            <img
              ref={imgRef}
              src={imgSrc}
              onLoad={onImageLoad}
              className="max-h-64 w-full object-contain"
            />
          </ReactCrop>
        )}
      </div>

      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
        {imgSrc && (
          <button
            onClick={handleConfirm}
            disabled={!completedCrop}
            className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            Use this crop
          </button>
        )}
        <button
          onClick={onCancel}
          className="text-sm text-gray-500 px-4 py-2 hover:text-black"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)
}