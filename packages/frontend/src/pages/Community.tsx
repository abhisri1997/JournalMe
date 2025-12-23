import { useEffect, useMemo, useState } from "react";
import NavigationBar from "../components/NavigationBar";
import { useAuth } from "../hooks";
import {
  DiscoveredUser,
  FollowConnection,
  FollowRequest,
  FollowService,
  UserService,
} from "../services/api";

type RequestDirection = "sent" | "received";

export default function CommunityPage() {
  const { isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [discover, setDiscover] = useState<DiscoveredUser[]>([]);
  const [incoming, setIncoming] = useState<FollowRequest[]>([]);
  const [outgoing, setOutgoing] = useState<FollowRequest[]>([]);
  const [connections, setConnections] = useState<{
    following: FollowConnection[];
    followers: FollowConnection[];
  }>({ following: [], followers: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Do not pre-load users for privacy; load other data only
    Promise.all([
      loadRequests("received"),
      loadRequests("sent"),
      loadConnections(),
    ]);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const term = search.trim();
      if (term.length >= 3) {
        loadUsers(term);
      } else {
        setDiscover([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const mutualIds = useMemo(() => {
    const followers = new Set(connections.followers.map((f) => f.user.id));
    return new Set(
      connections.following
        .filter((f) => followers.has(f.user.id))
        .map((f) => f.user.id)
    );
  }, [connections]);

  async function loadUsers(term: string) {
    try {
      setLoading(true);
      setError(null);
      const data = await UserService.listUsers(term);
      setDiscover(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function loadRequests(direction: RequestDirection) {
    try {
      const requests = await FollowService.listRequests(direction);
      if (direction === "received") setIncoming(requests);
      else setOutgoing(requests);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function loadConnections() {
    try {
      const data = await FollowService.listConnections();
      setConnections(data);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function sendRequest(targetUserId: string) {
    try {
      setError(null);
      await FollowService.sendRequest(targetUserId);
      await Promise.all([loadRequests("sent"), loadUsers(search)]);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function accept(id: string) {
    try {
      setError(null);
      await FollowService.acceptRequest(id);
      await Promise.all([loadRequests("received"), loadConnections()]);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function reject(id: string) {
    try {
      setError(null);
      await FollowService.rejectRequest(id);
      await Promise.all([loadRequests("received"), loadUsers(search)]);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function formatUser(u: { email: string; displayName?: string | null }) {
    return u.displayName ? `${u.displayName} (${u.email})` : u.email;
  }

  return (
    <main className='site-container'>
      <NavigationBar
        isAuthenticated={isAuthenticated}
        menuOpen={menuOpen}
        onMenuToggle={() => setMenuOpen((v) => !v)}
      />

      <section style={{ marginTop: 16, display: "grid", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h1 style={{ margin: 0 }}>Community</h1>
          {loading && <span style={{ color: "var(--muted)" }}>Loading…</span>}
        </div>

        {error && (
          <div
            style={{
              padding: "12px",
              backgroundColor: "#f8d7da",
              color: "#721c24",
              borderRadius: 6,
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: "grid", gap: 8 }}>
          <label htmlFor='search'>Find people</label>
          <input
            id='search'
            type='search'
            value={search}
            placeholder='Search by email, username, or phone (min 3 chars)'
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid var(--border)",
            }}
          />
          <div style={{ display: "grid", gap: 8 }}>
            {discover.length === 0 && (
              <div style={{ color: "var(--muted)" }}>
                {search.trim().length < 3
                  ? "Type at least 3 characters to search."
                  : "No users found."}
              </div>
            )}
            {discover.map((user) => (
              <div
                key={user.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {user.displayName || user.email}
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "var(--muted)" }}>
                    {user.email}
                  </div>
                  {mutualIds.has(user.id) && (
                    <div style={{ fontSize: "0.85rem", color: "green" }}>
                      Mutual
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {user.incomingStatus === "PENDING" &&
                    user.incomingFollowId && (
                      <>
                        <button onClick={() => accept(user.incomingFollowId!)}>
                          Accept
                        </button>
                        <button
                          onClick={() => reject(user.incomingFollowId!)}
                          style={{
                            backgroundColor: "var(--danger, #dc3545)",
                            color: "white",
                          }}
                        >
                          Reject
                        </button>
                      </>
                    )}

                  {user.outgoingStatus === "PENDING" && (
                    <span style={{ color: "var(--muted)" }}>Request sent</span>
                  )}

                  {!user.outgoingStatus && !user.incomingStatus && (
                    <button onClick={() => sendRequest(user.id)}>Follow</button>
                  )}

                  {user.outgoingStatus === "ACCEPTED" && (
                    <span style={{ color: "green" }}>Following</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          }}
        >
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: 12,
            }}
          >
            <h3 style={{ marginTop: 0 }}>Requests for you</h3>
            {incoming.length === 0 && (
              <div style={{ color: "var(--muted)" }}>No pending requests.</div>
            )}
            {incoming.map((req) => (
              <div
                key={req.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "6px 0",
                }}
              >
                <div>
                  {req.follower ? formatUser(req.follower) : req.followerId}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => accept(req.id)}>Accept</button>
                  <button
                    onClick={() => reject(req.id)}
                    style={{
                      backgroundColor: "var(--danger, #dc3545)",
                      color: "white",
                    }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: 12,
            }}
          >
            <h3 style={{ marginTop: 0 }}>Requests you sent</h3>
            {outgoing.length === 0 && (
              <div style={{ color: "var(--muted)" }}>No outgoing requests.</div>
            )}
            {outgoing.map((req) => (
              <div key={req.id} style={{ padding: "6px 0" }}>
                {req.following ? formatUser(req.following) : req.followingId}
                <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                  Status: {req.status}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: 12,
            }}
          >
            <h3 style={{ marginTop: 0 }}>You follow</h3>
            {connections.following.length === 0 && (
              <div style={{ color: "var(--muted)" }}>
                Not following anyone yet.
              </div>
            )}
            {connections.following.map((c) => (
              <div key={c.id} style={{ padding: "6px 0" }}>
                {formatUser(c.user)}
              </div>
            ))}
          </div>

          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: 12,
            }}
          >
            <h3 style={{ marginTop: 0 }}>Your followers</h3>
            {connections.followers.length === 0 && (
              <div style={{ color: "var(--muted)" }}>No followers yet.</div>
            )}
            {connections.followers.map((c) => (
              <div key={c.id} style={{ padding: "6px 0" }}>
                {formatUser(c.user)}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
