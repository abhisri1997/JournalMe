import React, { useEffect, useState } from "react";
import NavigationBar from "./components/NavigationBar";
import PostCard from "./components/PostCard";
import PostModal from "./components/PostModal";
import { useAuth } from "./hooks";
import { FollowService, FeedEntry } from "./services/api";

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const [feed, setFeed] = useState<FeedEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<FeedEntry | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setFeed([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    FollowService.fetchFeed()
      .then((data) => {
        if (!cancelled) setFeed(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load feed");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  return (
    <div className='site-container'>
      <NavigationBar
        isAuthenticated={isAuthenticated}
        menuOpen={menuOpen}
        onMenuToggle={() => setMenuOpen((v) => !v)}
      />
      {!isAuthenticated && (
        <section className='welcome-card' aria-label='Welcome message'>
          <h2 className='welcome-title'>Welcome to JournalMe</h2>
          <p className='welcome-text'>
            A simple journaling app—use the navigation to access pages.
          </p>
        </section>
      )}

      {isAuthenticated && (
        <section className='mt-4' aria-label='Home feed'>
          <h2 className='mt-0 text-2xl font-semibold'>Your Feed</h2>
          {loading && <div className='mb-2 text-[var(--muted)]'>Loading…</div>}
          {error && (
            <div className='mb-2 rounded-md bg-[var(--error)]/10 p-3 text-[var(--error)]'>
              {error}
            </div>
          )}
          {feed.length === 0 && !loading && !error && (
            <div className='text-[var(--muted)] text-sm'>
              No posts yet. Follow people from the Community page or share a
              public post from your Journal.
            </div>
          )}
          <div className='grid gap-3'>
            {feed.map((item) => (
              <PostCard
                key={item.id}
                post={{
                  ...item,
                  imagePath: item.imagePath ?? undefined,
                  audioPath: item.audioPath ?? undefined,
                  videoPath: item.videoPath ?? undefined,
                  user: {
                    ...item.user,
                    displayName: item.user.displayName ?? undefined,
                  },
                }}
                onClick={() => setSelectedPost(item)}
                showUser={true}
              />
            ))}
          </div>
        </section>
      )}

      <PostModal
        post={
          selectedPost
            ? {
                ...selectedPost,
                imagePath: selectedPost.imagePath ?? undefined,
                audioPath: selectedPost.audioPath ?? undefined,
                videoPath: selectedPost.videoPath ?? undefined,
                user: {
                  ...selectedPost.user,
                  displayName: selectedPost.user.displayName ?? undefined,
                },
              }
            : null
        }
        onClose={() => setSelectedPost(null)}
      />
    </div>
  );
}
