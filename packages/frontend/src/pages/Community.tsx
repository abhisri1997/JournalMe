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

  async function unfollow(id: string) {
    try {
      setError(null);
      await FollowService.unfollow(id);
      await Promise.all([loadConnections(), loadUsers(search)]);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function formatUser(u: { username: string; displayName?: string | null }) {
    return u.displayName || u.username;
  }

  return (
    <main className='site-container'>
      <NavigationBar
        isAuthenticated={isAuthenticated}
        menuOpen={menuOpen}
        onMenuToggle={() => setMenuOpen((v) => !v)}
      />

      <section className='mt-4 grid gap-4'>
        <div className='flex items-center gap-3'>
          <h1 className='m-0 text-2xl font-semibold'>Community</h1>
          {loading && <span className='text-[var(--muted)]'>Loading…</span>}
        </div>

        {error && (
          <div className='rounded-md bg-[var(--error)]/10 text-[var(--error)] p-3'>
            {error}
          </div>
        )}

        <div className='grid gap-2'>
          <label htmlFor='search'>Find people</label>
          <input
            id='search'
            type='search'
            value={search}
            placeholder='Search by email, username, or phone (min 3 chars)'
            onChange={(e) => setSearch(e.target.value)}
            className='rounded-md border border-[var(--border)] px-3 py-2'
          />
          <div className='grid gap-2'>
            {discover.length === 0 && (
              <div className='text-[var(--muted)] text-sm'>
                {search.trim().length < 3
                  ? "Type at least 3 characters to search."
                  : "No users found."}
              </div>
            )}
            {discover.map((user) => (
              <div
                key={user.id}
                className='flex items-center justify-between p-3 border border-[var(--border)] rounded-lg'
              >
                <div>
                  <div className='font-semibold'>
                    {user.displayName || user.username}
                  </div>
                  <div className='text-sm text-[var(--muted)]'>
                    @{user.username}
                  </div>
                  {mutualIds.has(user.id) && (
                    <div className='text-sm text-[var(--accent)]'>Mutual</div>
                  )}
                </div>

                <div className='flex items-center gap-2'>
                  {user.incomingStatus === "PENDING" &&
                    user.incomingFollowId && (
                      <>
                        <button
                          onClick={() => accept(user.incomingFollowId!)}
                          className='font-medium'
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => reject(user.incomingFollowId!)}
                          className='bg-[var(--error)] text-[#faf6f0] font-medium'
                        >
                          Reject
                        </button>
                      </>
                    )}

                  {user.outgoingStatus === "PENDING" && (
                    <span className='text-[var(--muted)] text-sm'>
                      Request sent
                    </span>
                  )}

                  {!user.outgoingStatus && !user.incomingStatus && (
                    <button
                      onClick={() => sendRequest(user.id)}
                      className='font-medium'
                    >
                      Follow
                    </button>
                  )}

                  {user.outgoingStatus === "ACCEPTED" &&
                    user.outgoingFollowId && (
                      <button
                        onClick={() => unfollow(user.outgoingFollowId!)}
                        className='bg-[var(--error)] text-[#faf6f0] font-medium'
                      >
                        Unfollow
                      </button>
                    )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='grid gap-3 grid-cols-1 md:grid-cols-2'>
          <div className='border border-[var(--border)] rounded-lg p-3'>
            <h3 className='mt-0 mb-2 text-lg font-semibold'>
              Requests for you
            </h3>
            {incoming.length === 0 && (
              <div className='text-[var(--muted)] text-sm'>
                No pending requests.
              </div>
            )}
            {incoming.map((req) => (
              <div
                key={req.id}
                className='flex justify-between items-center py-1.5'
              >
                <div>
                  {req.follower ? formatUser(req.follower) : req.followerId}
                </div>
                <div className='flex gap-2'>
                  <button
                    onClick={() => accept(req.id)}
                    className='font-medium'
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => reject(req.id)}
                    className='bg-[var(--error)] text-[#faf6f0] font-medium'
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className='border border-[var(--border)] rounded-lg p-3'>
            <h3 className='mt-0 mb-2 text-lg font-semibold'>
              Requests you sent
            </h3>
            {outgoing.length === 0 && (
              <div className='text-[var(--muted)] text-sm'>
                No outgoing requests.
              </div>
            )}
            {outgoing.map((req) => (
              <div key={req.id} className='py-1.5'>
                {req.following ? formatUser(req.following) : req.followingId}
                <div className='text-sm text-[var(--muted)]'>
                  Status: {req.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
