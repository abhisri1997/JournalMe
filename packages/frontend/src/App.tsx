import React, { useEffect, useState } from "react";
import NavigationBar from "./components/NavigationBar";
import { useAuth } from "./hooks";
import { FollowService, FeedEntry } from "./services/api";

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const [feed, setFeed] = useState<FeedEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
            <div className='mb-2 rounded-md bg-red-100 p-3 text-red-800'>
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
              <div
                key={item.id}
                className='rounded-lg border border-[var(--border)] p-3'
              >
                <div className='flex items-center justify-between'>
                  <div className='font-semibold'>
                    {item.user.displayName
                      ? `${item.user.displayName} (${item.user.email})`
                      : item.user.email}
                  </div>
                  <div className='text-xs text-[var(--muted)]'>
                    {new Date(item.createdAt).toLocaleString()}
                  </div>
                </div>
                <p className='mt-2'>{item.text}</p>
                {item.imagePath && (
                  <img
                    src={`/uploads/${item.imagePath}`}
                    alt='Journal attachment'
                    className='mt-2 max-h-64 w-full rounded-md object-cover'
                  />
                )}
                {item.videoPath && (
                  <video
                    className='mt-2 w-full rounded-md'
                    controls
                    src={`/uploads/${item.videoPath}`}
                  />
                )}
                {item.audioPath && (
                  <audio
                    controls
                    src={`/uploads/${item.audioPath}`}
                    className='w-full'
                  >
                    <track
                      kind='captions'
                      srcLang='en'
                      src={`/uploads/${item.audioPath}.vtt`}
                    />
                  </audio>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
