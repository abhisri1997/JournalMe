import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";
import UserAvatar from "../components/UserAvatar";
import PostModal from "../components/PostModal";
import { useAuth } from "../hooks";
import { useFollowRequests } from "../contexts/FollowRequestContext";
import {
  JournalService,
  FollowService,
  FeedEntry,
  FollowConnection,
  FollowRequest,
} from "../services/api";
import { STORAGE_KEYS } from "../constants";

type User = {
  id: string;
  email: string;
  username: string;
  displayName?: string;
};

type Tab = "posts" | "followers" | "following";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { refreshFollowRequests } = useFollowRequests();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("posts");
  const [posts, setPosts] = useState<FeedEntry[]>([]);
  const [followers, setFollowers] = useState<FollowConnection[]>([]);
  const [following, setFollowing] = useState<FollowConnection[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FollowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [selectedPost, setSelectedPost] = useState<FeedEntry | null>(null);
  const [postsSkip, setPostsSkip] = useState(0);
  const [hasMorePosts, setHasMorePosts] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (!storedUser) {
      navigate("/");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    } catch (e) {
      navigate("/");
    }
  }, [navigate]);

  const loadProfileData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const [entriesResponse, connectionsData, outgoingReqs] =
        await Promise.all([
          JournalService.fetchEntries(20, 0),
          FollowService.listConnections(),
          FollowService.listRequests("sent"),
        ]);
      const entries = Array.isArray(entriesResponse)
        ? entriesResponse
        : entriesResponse.entries;
      setPosts(entries);
      setHasMorePosts(
        Array.isArray(entriesResponse) ? false : entriesResponse.hasMore
      );
      setPostsSkip(20);
      setFollowers(connectionsData.followers);
      setFollowing(connectionsData.following);
      setOutgoingRequests(outgoingReqs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) loadProfileData();
  }, [user, loadProfileData]);

  // Refresh follow state when real-time follow events arrive
  useEffect(() => {
    const handler = () => loadProfileData();
    window.addEventListener("follow-request-updated", handler);
    return () => window.removeEventListener("follow-request-updated", handler);
  }, [loadProfileData]);

  async function unfollowUser(id: string) {
    try {
      setError("");
      await FollowService.unfollow(id);
      // Reload following list
      const connectionsData = await FollowService.listConnections();
      setFollowing(connectionsData.following);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unfollow user");
    }
  }

  async function followBackUser(targetUserId: string) {
    try {
      setError("");
      const response = await FollowService.sendRequest(targetUserId);
      console.log("Follow request sent:", response);
      // Reload connections and outgoing requests to update UI
      const [connectionsData, outgoingReqs] = await Promise.all([
        FollowService.listConnections(),
        FollowService.listRequests("sent"),
      ]);
      setFollowing(connectionsData.following);
      setFollowers(connectionsData.followers);
      setOutgoingRequests(outgoingReqs);
      // Trigger global refresh for Community page
      refreshFollowRequests();
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to send follow request";
      console.error("Follow back error:", errorMsg);
      setError(errorMsg);
    }
  }

  async function cancelFollowRequest(requestId: string) {
    try {
      setError("");
      await FollowService.unfollow(requestId);
      console.log("Follow request cancelled");
      // Reload outgoing requests to update UI
      const outgoingReqs = await FollowService.listRequests("sent");
      setOutgoingRequests(outgoingReqs);
      // Trigger global refresh for Community page
      refreshFollowRequests();
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to cancel follow request";
      console.error("Cancel request error:", errorMsg);
      setError(errorMsg);
    }
  }

  // Create a set of user IDs the logged-in user is following
  const followingIds = new Set(following.map((f) => f.user.id));

  // Create a set of user IDs the logged-in user has sent follow requests to (pending)
  const pendingFollowIds = new Set(
    outgoingRequests?.map((r) => r.followingId) || []
  );

  if (!user) return null;

  const displayName = user.displayName || user.username;
  const postCount = posts.length;
  const followerCount = followers.length;
  const followingCount = following.length;

  return (
    <main className='site-container'>
      <NavigationBar
        isAuthenticated={isAuthenticated}
        menuOpen={menuOpen}
        onMenuToggle={() => setMenuOpen((v) => !v)}
      />

      <section className='mt-6'>
        {/* Profile Header */}
        <div className='mb-8 pb-6 border-b border-black/10'>
          <div className='flex items-start gap-6 mb-6'>
            {/* Avatar */}
            <div className='w-24 h-24'>
              <UserAvatar
                displayName={displayName}
                email={user.email}
                size='lg'
              />
            </div>

            {/* Profile Info */}
            <div className='flex-1'>
              <h1 className='text-3xl font-bold text-[var(--text)] mb-2'>
                {displayName}
              </h1>
              <p className='text-[var(--muted)] mb-4'>@{user.username}</p>

              <button
                onClick={() => navigate("/edit-profile")}
                className='px-6 py-2 bg-[var(--accent)] text-[#faf6f0] rounded-md hover:bg-[var(--accent-hover)] transition'
              >
                Edit Profile
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className='flex gap-8'>
            <div className='text-center'>
              <p className='text-2xl font-bold text-[var(--text)]'>
                {postCount}
              </p>
              <p className='text-[var(--muted)]'>Posts</p>
            </div>
            <div className='text-center'>
              <p className='text-2xl font-bold text-[var(--text)]'>
                {followerCount}
              </p>
              <p className='text-[var(--muted)]'>Followers</p>
            </div>
            <div className='text-center'>
              <p className='text-2xl font-bold text-[var(--text)]'>
                {followingCount}
              </p>
              <p className='text-[var(--muted)]'>Following</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className='flex gap-3 mb-6'>
          {(["posts", "followers", "following"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md font-medium transition-colors capitalize ${
                activeTab === tab
                  ? "bg-[var(--accent)] text-[#faf6f0]"
                  : "bg-transparent border-2 border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)]/5"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className='text-center py-12'>
            <p className='text-[var(--muted)]'>Loading...</p>
          </div>
        ) : error ? (
          <div className='rounded-md bg-[var(--error)]/10 text-[var(--error)] p-4 mb-4'>
            {error}
          </div>
        ) : (
          <>
            {/* Posts Tab */}
            {activeTab === "posts" && (
              <div>
                {posts.length === 0 ? (
                  <div className='text-center py-12'>
                    <p className='text-[var(--muted)]'>No posts yet</p>
                  </div>
                ) : (
                  <>
                    <div className='grid grid-cols-3 gap-2 sm:gap-3 md:gap-4'>
                      {posts.map((post) => (
                        <div
                          key={post.id}
                          onClick={() => {
                            // Open modal for all post types
                            setSelectedPost(post);
                          }}
                          className='group relative aspect-square rounded-md overflow-hidden cursor-pointer bg-[var(--card)] border border-black/10 hover:border-[var(--accent)] hover:shadow-lg transition-all'
                          role='button'
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setSelectedPost(post);
                            }
                          }}
                          aria-label={`View post${
                            post.text ? `: ${post.text.substring(0, 50)}` : ""
                          }`}
                        >
                          {/* Show media if available */}
                          {post.imagePath && (
                            <img
                              src={`/uploads/${post.imagePath}`}
                              alt='Post'
                              className='w-full h-full object-cover group-hover:scale-105 transition-transform'
                            />
                          )}
                          {post.videoPath && (
                            <video
                              src={`/uploads/${post.videoPath}`}
                              className='w-full h-full object-cover group-hover:scale-105 transition-transform'
                            >
                              <track kind='captions' />
                            </video>
                          )}

                          {/* Audio post - show waveform-like indicator */}
                          {post.audioPath &&
                            !post.imagePath &&
                            !post.videoPath && (
                              <div className='w-full h-full bg-gradient-to-br from-orange-500 via-rose-500 to-pink-600 flex flex-col items-center justify-center relative overflow-hidden'>
                                {/* Animated background circles */}
                                <div className='absolute inset-0 opacity-20'>
                                  <div className='absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl'></div>
                                  <div className='absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl'></div>
                                </div>

                                {/* Content */}
                                <div className='relative z-10 flex flex-col items-center transform group-hover:scale-110 transition-transform'>
                                  <div className='mb-1 sm:mb-2 p-2 sm:p-3 md:p-4 bg-white/10 rounded-full backdrop-blur-sm'>
                                    <svg
                                      className='w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 text-white'
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
                                  </div>
                                  <p className='text-white text-[0.6rem] sm:text-xs md:text-base font-bold tracking-wide'>
                                    AUDIO POST
                                  </p>
                                  <p className='text-white/80 text-[0.5rem] sm:text-xs mt-0.5 sm:mt-1 hidden sm:block'>
                                    Click to play
                                  </p>
                                </div>
                              </div>
                            )}

                          {/* Text-only post */}
                          {!post.imagePath &&
                            !post.videoPath &&
                            !post.audioPath && (
                              <div className='w-full h-full bg-gradient-to-br from-orange-400 to-rose-500 p-2 sm:p-4 md:p-6 flex flex-col justify-center group-hover:from-orange-500 group-hover:to-rose-600 transition-all'>
                                <svg
                                  className='w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white/50 mb-1 sm:mb-2 md:mb-3'
                                  fill='none'
                                  stroke='currentColor'
                                  viewBox='0 0 24 24'
                                >
                                  <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z'
                                  />
                                </svg>
                                <p className='text-white line-clamp-3 sm:line-clamp-4 text-[0.6rem] sm:text-xs md:text-sm font-medium leading-snug sm:leading-relaxed'>
                                  {post.text}
                                </p>
                              </div>
                            )}

                          {/* Hover overlay */}
                          <div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center pointer-events-none'>
                            <div className='text-white text-center'>
                              <p className='font-semibold text-xs sm:text-sm md:text-lg'>
                                View Post
                              </p>
                              <p className='text-[0.6rem] sm:text-xs md:text-sm text-gray-200'>
                                {post.isPublic ? "Public" : "Private"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Load More Button */}
                    {hasMorePosts && (
                      <div className='flex justify-center mt-6'>
                        <button
                          onClick={async () => {
                            setLoadingMore(true);
                            try {
                              const response =
                                await JournalService.fetchEntries(
                                  20,
                                  postsSkip
                                );
                              const newEntries = Array.isArray(response)
                                ? response
                                : response.entries;
                              setPosts((prevPosts) => [
                                ...prevPosts,
                                ...newEntries,
                              ]);
                              setHasMorePosts(
                                Array.isArray(response)
                                  ? false
                                  : response.hasMore
                              );
                              setPostsSkip(
                                (prevSkip) =>
                                  prevSkip +
                                  (Array.isArray(response)
                                    ? 0
                                    : response.entries.length)
                              );
                            } catch (err) {
                              console.error("Failed to load more posts:", err);
                            } finally {
                              setLoadingMore(false);
                            }
                          }}
                          disabled={loadingMore}
                          className='px-6 py-2 bg-[var(--accent)] text-[#faf6f0] rounded-md hover:bg-[var(--accent-hover)] disabled:opacity-60 disabled:cursor-not-allowed transition font-medium'
                        >
                          {loadingMore ? "Loading..." : "Load More"}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Followers Tab */}
            {activeTab === "followers" && (
              <div>
                {followers.length === 0 ? (
                  <div className='text-center py-12'>
                    <p className='text-[var(--muted)]'>No followers yet</p>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    {followers.map((connection) => {
                      const isFollowingBack = followingIds.has(
                        connection.user.id
                      );
                      const hasPendingRequest = pendingFollowIds.has(
                        connection.user.id
                      );
                      return (
                        <div
                          key={connection.id}
                          className='flex items-center justify-between p-4 bg-[var(--card)] rounded-md border border-black/10'
                        >
                          <div className='flex items-center gap-3'>
                            <div className='w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center flex-shrink-0'>
                              <span className='text-lg font-bold text-white'>
                                {(
                                  connection.user.displayName ||
                                  connection.user.username
                                )
                                  .charAt(0)
                                  .toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className='font-semibold text-[var(--text)]'>
                                {connection.user.displayName ||
                                  connection.user.username}
                              </p>
                              <p className='text-sm text-[var(--muted)]'>
                                @{connection.user.username}
                              </p>
                            </div>
                          </div>
                          <div className='flex flex-col items-end gap-2'>
                            <p className='text-xs text-[var(--muted)]'>
                              Following since{" "}
                              {new Date(connection.since).toLocaleDateString()}
                            </p>
                            {!isFollowingBack && !hasPendingRequest && (
                              <button
                                onClick={() =>
                                  followBackUser(connection.user.id)
                                }
                                className='bg-[var(--accent)] text-[#faf6f0] font-medium px-3 py-1 rounded-md hover:bg-[var(--accent-hover)] transition text-sm'
                              >
                                Follow Back
                              </button>
                            )}
                            {!isFollowingBack && hasPendingRequest && (
                              <button
                                onClick={() => {
                                  const pendingReq = outgoingRequests?.find(
                                    (r) => r.followingId === connection.user.id
                                  );
                                  if (pendingReq) {
                                    cancelFollowRequest(pendingReq.id);
                                  }
                                }}
                                className='bg-[var(--error)] text-[#faf6f0] font-medium px-3 py-1 rounded-md hover:bg-[var(--error)]/80 transition text-sm'
                              >
                                Cancel Request
                              </button>
                            )}
                            {isFollowingBack && (
                              <span className='text-[var(--accent)] text-xs font-medium'>
                                Following back
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Following Tab */}
            {activeTab === "following" && (
              <div>
                {following.length === 0 ? (
                  <div className='text-center py-12'>
                    <p className='text-[var(--muted)]'>
                      Not following anyone yet
                    </p>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    {following.map((connection) => (
                      <div
                        key={connection.id}
                        className='flex items-center justify-between p-4 bg-[var(--card)] rounded-md border border-black/10'
                      >
                        <div className='flex items-center gap-3'>
                          <div className='w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-amber-500 flex items-center justify-center flex-shrink-0'>
                            <span className='text-lg font-bold text-white'>
                              {(
                                connection.user.displayName ||
                                connection.user.username
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className='font-semibold text-[var(--text)]'>
                              {connection.user.displayName ||
                                connection.user.username}
                            </p>
                            <p className='text-sm text-[var(--muted)]'>
                              @{connection.user.username}
                            </p>
                          </div>
                        </div>
                        <div className='flex flex-col items-end gap-2'>
                          <p className='text-xs text-[var(--muted)]'>
                            Following since{" "}
                            {new Date(connection.since).toLocaleDateString()}
                          </p>
                          <button
                            onClick={() => unfollowUser(connection.id)}
                            className='bg-[var(--error)] text-[#faf6f0] font-medium px-3 py-1 rounded-md hover:bg-[var(--error)]/80 transition text-sm'
                          >
                            Unfollow
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </section>

      {/* Post Modal */}
      <PostModal
        post={
          selectedPost && user
            ? {
                ...selectedPost,
                user: { ...user, id: user.id },
                imagePath: selectedPost.imagePath ?? undefined,
                videoPath: selectedPost.videoPath ?? undefined,
                audioPath: selectedPost.audioPath ?? undefined,
              }
            : null
        }
        onClose={() => setSelectedPost(null)}
      />
    </main>
  );
}
