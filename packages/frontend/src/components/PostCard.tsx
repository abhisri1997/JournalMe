import UserAvatar from "./UserAvatar";

type User = {
  id: string;
  email: string;
  username: string;
  displayName?: string;
};

type Post = {
  id: string;
  text: string;
  imagePath?: string;
  videoPath?: string;
  audioPath?: string;
  createdAt: string;
  isPublic: boolean;
  user: User;
};

type PostCardProps = {
  post: Post;
  onClick: () => void;
  showUser?: boolean;
};

export default function PostCard({
  post,
  onClick,
  showUser = true,
}: PostCardProps) {
  return (
    <div
      className='rounded-lg border border-[var(--border)] p-3 cursor-pointer hover:bg-[var(--hover)] transition'
      onClick={onClick}
      role='button'
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {showUser && (
        <div className='flex items-center justify-between mb-2'>
          <div className='flex items-center gap-2'>
            <UserAvatar
              displayName={post.user.displayName}
              email={post.user.email}
              size='sm'
            />
            <div className='font-semibold text-sm'>
              {post.user.displayName || post.user.username}
            </div>
          </div>
          <div className='text-xs text-[var(--muted)]'>
            {new Date(post.createdAt).toLocaleString()}
          </div>
        </div>
      )}

      {post.text && <p className='mt-2 line-clamp-3'>{post.text}</p>}

      {/* Preview thumbnails */}
      {post.imagePath && (
        <div className='mt-2 relative h-48 overflow-hidden rounded-md'>
          <img
            src={`/uploads/${post.imagePath}`}
            alt='Post preview'
            className='w-full h-full object-cover'
          />
        </div>
      )}

      {post.videoPath && (
        <div className='mt-2 relative h-48 overflow-hidden rounded-md bg-black flex items-center justify-center'>
          <svg
            className='w-16 h-16 text-white/70'
            fill='currentColor'
            viewBox='0 0 24 24'
          >
            <path d='M8 5v14l11-7z' />
          </svg>
        </div>
      )}

      {post.audioPath && !post.imagePath && !post.videoPath && (
        <div className='mt-2 bg-gradient-to-br from-orange-500 to-rose-600 rounded-md p-4 flex items-center gap-3'>
          <svg
            className='w-8 h-8 text-white'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z'
            />
          </svg>
          <span className='text-white text-sm font-medium'>
            Audio Recording
          </span>
        </div>
      )}
    </div>
  );
}
