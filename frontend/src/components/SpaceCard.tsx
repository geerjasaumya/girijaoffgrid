import { Link } from 'react-router-dom'

interface Space {
  id: number
  name: string
  slug: string
  description: string | null
  icon: string | null
  cover_image_url: string | null
  order: number
}

interface SpaceCardProps {
  space: Space
  onClick: () => void
  isAdmin?: boolean
  onDelete?: () => void
}

export default function SpaceCard({ space, onClick, isAdmin, onDelete }: SpaceCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 hover:border-gray-400 transition-all duration-200 overflow-hidden relative">
      {isAdmin && (
        <div className="absolute top-2 right-2 z-10 flex gap-1">
          <Link
            to={`/spaces/${space.slug}/edit`}
            onClick={(e) => e.stopPropagation()}
            className="bg-white/90 text-gray-600 text-xs px-2 py-1 rounded-md hover:bg-white hover:text-black transition-colors"
          >
            Edit
          </Link>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete?.()
            }}
            className="bg-white/90 text-red-500 text-xs px-2 py-1 rounded-md hover:bg-white hover:text-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      )}

      <div onClick={onClick} className="cursor-pointer">
        {space.cover_image_url ? (
          <img
            src={space.cover_image_url}
            alt={space.name}
            className="w-full h-36 object-cover"
          />
        ) : (
          <div className="w-full h-36 bg-gray-100 flex items-center justify-center text-5xl">
            {space.icon || '📁'}
          </div>
        )}

        <div className="p-4">
          <div className="flex items-center gap-2">
            {space.icon && <span className="text-xl">{space.icon}</span>}
            <h2 className="font-semibold text-gray-900">{space.name}</h2>
          </div>
          {space.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {space.description}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}