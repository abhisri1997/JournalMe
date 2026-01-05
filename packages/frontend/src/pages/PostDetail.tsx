import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";
import { useAuth } from "../hooks";
import { JournalService, FeedEntry } from "../services/api";
import { STORAGE_KEYS } from "../constants";

type User = {
  id: string;
  email: string;
  username: string;
  displayName?: string;
};

export default function PostDetailPage() {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();
  const { isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [post, setPost] = useState<FeedEntry | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user:", e);
      }
    }
  }, []);

  useEffect(() => {
    const loadPost = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await JournalService.fetchEntries();
        const foundPost = response.entries.find((p) => p.id === postId);
        if (foundPost) {
          setPost(foundPost);
        } else {
          setError("Post not found");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load post");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (postId) loadPost();
  }, [postId]);

  if (loading) {
    return (
      <main className='site-container'>
        <NavigationBar
          isAuthenticated={isAuthenticated}
          menuOpen={menuOpen}
          onMenuToggle={() => setMenuOpen((v) => !v)}
        />
        <div className='text-center py-12'>
          <p className='text-[var(--muted)]'>Loading post...</p>
        </div>
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className='site-container'>
        <NavigationBar
          isAuthenticated={isAuthenticated}
          menuOpen={menuOpen}
          onMenuToggle={() => setMenuOpen((v) => !v)}
        />
        <section className='mt-6'>
          <div className='rounded-md bg-[var(--error)]/10 text-[var(--error)] p-4 mb-4'>
            {error || "Post not found"}
          </div>
          <button
            onClick={() => navigate("/profile")}
            className='px-4 py-2 bg-[var(--accent)] text-[#faf6f0] rounded-md hover:bg-[var(--accent-hover)] transition'
          >
            Back to Profile
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className='site-container'>
      <NavigationBar
        isAuthenticated={isAuthenticated}
        menuOpen={menuOpen}
        onMenuToggle={() => setMenuOpen((v) => !v)}
      />

      <section className='mt-6'>
        <button
          onClick={() => navigate("/profile")}
          className='mb-6 text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium'
        >
          ← Back to Profile
        </button>

        <div className='max-w-2xl'>
          {/* Post Header */}
          <div className='mb-6 pb-4 border-b border-black/10'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center flex-shrink-0'>
                <span className='text-lg font-bold text-white'>
                  {(user?.displayName || user?.username)
                    ?.charAt(0)
                    .toUpperCase()}
                </span>
              </div>
              <div>
                <p className='font-semibold text-[var(--text)]'>
                  {user?.displayName || user?.username}
                </p>
                <p className='text-xs text-[var(--muted)]'>
                  {new Date(post.createdAt).toLocaleString()}
                </p>
              </div>
              <div className='ml-auto'>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
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

          {/* Post Content */}
          <div className='mb-6'>
            <p className='text-[var(--text)] text-lg mb-6 whitespace-pre-wrap'>
              {post.text}
            </p>

            {/* Image */}
            {post.imagePath && (
              <img
                src={`/uploads/${post.imagePath}`}
                alt='Post'
                className='w-full rounded-md mb-6 max-h-96 object-cover'
              />
            )}

            {/* Video */}
            {post.videoPath && (
              <video
                src={`/uploads/${post.videoPath}`}
                controls
                className='w-full rounded-md mb-6 max-h-96'
              >
                <track kind='captions' />
              </video>
            )}

            {/* Audio */}
            {post.audioPath && (
              <div className='bg-gradient-to-br from-orange-500 via-rose-500 to-pink-600 rounded-xl p-8 mb-6 shadow-xl relative overflow-hidden'>
                {/* Background decoration */}
                <div className='absolute inset-0 opacity-10'>
                  <div className='absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl'></div>
                  <div className='absolute bottom-0 right-0 w-80 h-80 bg-white rounded-full blur-3xl'></div>
                </div>

                <div className='relative z-10'>
                  <div className='flex items-center gap-6 mb-6'>
                    <div className='p-5 bg-white/20 rounded-full backdrop-blur-sm'>
                      <svg
                        className='w-12 h-12 text-white'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={1.5}
                          d='M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z'
                        />
                      </svg>
                    </div>
                    <div className='flex-1'>
                      <p className='text-white text-lg font-bold mb-1'>
                        Audio Recording
                      </p>
                      <p className='text-white/80 text-sm'>
                        Recorded on{" "}
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className='bg-white/10 backdrop-blur-sm rounded-lg p-4'>
                    <audio
                      src={`/uploads/${post.audioPath}`}
                      controls
                      className='w-full'
                      style={{
                        filter: "invert(1) hue-rotate(180deg)",
                        height: "40px",
                      }}
                    >
                      <track kind='captions' />
                    </audio>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Post Meta */}
          <div className='border-t border-black/10 pt-4'>
            <p className='text-xs text-[var(--muted)]'>Post ID: {post.id}</p>
            <p className='text-xs text-[var(--muted)] mt-2'>
              Created: {new Date(post.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
