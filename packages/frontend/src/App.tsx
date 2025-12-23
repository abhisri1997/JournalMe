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
        <section style={{ marginTop: 16 }} aria-label='Home feed'>
          <h2 style={{ marginTop: 0 }}>Your Feed</h2>
          {loading && (
            <div style={{ color: "var(--muted)", marginBottom: 8 }}>
              Loading…
            </div>
          )}
          {error && (
            <div
              style={{
                padding: 12,
                backgroundColor: "#f8d7da",
                color: "#721c24",
                borderRadius: 6,
                marginBottom: 8,
              }}
            >
              {error}
            </div>
          )}
          {feed.length === 0 && !loading && !error && (
            <div style={{ color: "var(--muted)" }}>
              No posts yet. Follow people from the Community page or share a
              public post from your Journal.
            </div>
          )}
          <div style={{ display: "grid", gap: 12 }}>
            {feed.map((item) => (
              <div
                key={item.id}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ fontWeight: 600 }}>
                    {item.user.displayName
                      ? `${item.user.displayName} (${item.user.email})`
                      : item.user.email}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                    {new Date(item.createdAt).toLocaleString()}
                  </div>
                </div>
                <p style={{ marginTop: 8 }}>{item.text}</p>
                {item.audioPath && (
                  <audio
                    controls
                    src={`/uploads/${item.audioPath}`}
                    style={{ width: "100%" }}
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
