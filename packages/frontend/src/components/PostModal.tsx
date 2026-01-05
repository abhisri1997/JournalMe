import UserAvatar from "./UserAvatar";
import MediaDisplay from "./MediaDisplay";

type User = {
  id: string;
  email: string;
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

type PostModalProps = {
  post: Post | null;
  onClose: () => void;
};

export default function PostModal({ post, onClose }: PostModalProps) {
  if (!post) return null;

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className='fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4'
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      role='button'
      tabIndex={0}
      aria-label='Close modal'
    >
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        className='bg-[var(--card)] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] sm:max-h-[90vh] overflow-y-auto'
        onClick={(e) => e.stopPropagation()}
        role='dialog'
        aria-modal='true'
      >
        {/* Modal Header */}
        <div className='sm:sticky top-0 bg-[var(--card)] border-b border-black/10 p-4 sm:p-6 flex items-center justify-between z-10'>
          <div className='flex items-center gap-2 sm:gap-3 flex-1 min-w-0'>
            <UserAvatar
              displayName={post.user.displayName}
              email={post.user.email}
              size='md'
            />
            <div className='min-w-0 flex-1'>
              <p className='font-semibold text-[var(--text)] truncate'>
                {post.user.displayName || post.user.email.split("@")[0]}
              </p>
              <p className='text-xs text-[var(--muted)] truncate'>
                {new Date(post.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='flex-shrink-0 ml-2 p-2 sm:p-2 bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 rounded-full transition'
            aria-label='Close'
          >
            <svg
              className='w-6 h-6 sm:w-6 sm:h-6 text-[var(--accent)]'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className='p-3 sm:p-6'>
          {/* Post Text */}
          {post.text && (
            <p className='text-[var(--text)] text-sm sm:text-base md:text-lg mb-4 sm:mb-6 whitespace-pre-wrap line-clamp-6 sm:line-clamp-none'>
              {post.text}
            </p>
          )}

          {/* Media */}
          <MediaDisplay
            imagePath={post.imagePath}
            videoPath={post.videoPath}
            audioPath={post.audioPath}
            createdAt={post.createdAt}
            autoPlay={true}
          />

          {/* Post Meta */}
          <div className='mt-3 sm:mt-6 pt-3 sm:pt-4 border-t border-black/10'>
            <span
              className={`text-xs font-semibold px-2 sm:px-3 py-1 rounded-full ${
                post.isPublic
                  ? "bg-[var(--success)]/10 text-[var(--success)]"
                  : "bg-[var(--muted)]/10 text-[var(--muted)]"
              }`}
            >
              {post.isPublic ? "Public" : "Private"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
