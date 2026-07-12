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
    <div
      className="rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer relative group"
      style={{ backgroundColor: '#F5F0E8', border: '1px solid #DDD6C8' }}
    >
      {isAdmin && (
        <div className="absolute top-3 right-3 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link
            to={`/spaces/${space.slug}/edit`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs px-2 py-1 rounded-lg font-medium"
            style={{ backgroundColor: '#F5F0E8', color: '#1B2A4A' }}
          >
            Edit
          </Link>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete?.()
            }}
            className="text-xs px-2 py-1 rounded-lg font-medium"
            style={{ backgroundColor: '#F5F0E8', color: '#8B2020' }}
          >
            Delete
          </button>
        </div>
      )}

      <div onClick={onClick}>
        {space.cover_image_url ? (
          <img
            src={space.cover_image_url}
            alt={space.name}
            className="w-full h-40 object-cover"
          />
        ) : (
          <div
            className="w-full h-40 flex items-center justify-center text-5xl"
            style={{ backgroundColor: '#EDE8DC' }}
          >
            {space.icon || '📁'}
          </div>
        )}

        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            {space.icon && <span className="text-lg">{space.icon}</span>}
            <h2 className="font-semibold text-base" style={{ color: '#1B2A4A' }}>
              {space.name}
            </h2>
          </div>
          {space.description && (
            <p className="text-sm line-clamp-2" style={{ color: '#3D5A8A' }}>
              {space.description}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}