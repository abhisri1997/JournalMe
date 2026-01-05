import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { JournalService } from "../services/api";

export default function CreatePost() {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // File inputs
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const removeVideo = () => {
    setVideoFile(null);
    setVideoPreview(null);
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const removeAudio = () => {
    setAudioFile(null);
    if (audioInputRef.current) audioInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim() && !imageFile && !videoFile && !audioFile) {
      setError("Please add some content (text, image, video, or audio)");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await JournalService.createEntry(
        text,
        audioFile || undefined,
        isPublic,
        imageFile || undefined,
        videoFile || undefined
      );

      setSuccess(true);
      setText("");
      removeImage();
      removeVideo();
      removeAudio();
      setIsPublic(false);

      setTimeout(() => {
        navigate("/profile");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className='site-container'>
      <div className='max-w-2xl mx-auto'>
        <h1 className='text-3xl font-bold text-[var(--text)] mb-6'>
          Create a New Post
        </h1>

        {error && (
          <div className='rounded-md bg-[var(--error)]/10 text-[var(--error)] p-4 mb-4'>
            {error}
          </div>
        )}

        {success && (
          <div className='rounded-md bg-[var(--success)]/10 text-[var(--success)] p-4 mb-4'>
            Post created successfully! Redirecting to your profile...
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Text Content */}
          <div className='grid gap-2'>
            <label htmlFor='text' className='font-semibold text-[var(--text)]'>
              What's on your mind?
            </label>
            <textarea
              id='text'
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder='Write your thoughts, feelings, or memories...'
              className='w-full min-h-[150px] resize-y text-base p-4 rounded-lg border-2 border-[var(--border)] bg-[var(--card)] text-[var(--text)] focus:border-[var(--accent)] focus:outline-none transition'
            />
            <p className='text-xs text-[var(--muted)]'>
              {text.length} characters
            </p>
          </div>

          {/* Image Upload */}
          <div className='grid gap-2'>
            <label
              htmlFor='imageInput'
              className='font-semibold text-[var(--text)]'
            >
              Add an Image
            </label>
            <div className='flex items-center gap-2'>
              <button
                type='button'
                onClick={() => imageInputRef.current?.click()}
                className='px-4 py-2 bg-[var(--accent)] text-white rounded-md hover:bg-[var(--accent-hover)] transition'
              >
                Choose Image
              </button>
              {imageFile && (
                <span className='text-sm text-[var(--muted)]'>
                  {imageFile.name}
                </span>
              )}
            </div>
            <input
              id='imageInput'
              ref={imageInputRef}
              type='file'
              accept='image/*'
              onChange={handleImageChange}
              className='hidden'
            />
            {imagePreview && (
              <div className='relative'>
                <img
                  src={imagePreview}
                  alt='Preview'
                  className='max-h-64 rounded-lg object-cover'
                />
                <button
                  type='button'
                  onClick={removeImage}
                  className='absolute top-2 right-2 bg-[var(--error)] text-white p-2 rounded-full hover:bg-[var(--error)] transition'
                  aria-label='Remove image'
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Video Upload */}
          <div className='grid gap-2'>
            <label
              htmlFor='videoInput'
              className='font-semibold text-[var(--text)]'
            >
              Add a Video
            </label>
            <div className='flex items-center gap-2'>
              <button
                type='button'
                onClick={() => videoInputRef.current?.click()}
                className='px-4 py-2 bg-[var(--accent)] text-white rounded-md hover:bg-[var(--accent-hover)] transition'
              >
                Choose Video
              </button>
              {videoFile && (
                <span className='text-sm text-[var(--muted)]'>
                  {videoFile.name}
                </span>
              )}
            </div>
            <input
              id='videoInput'
              ref={videoInputRef}
              type='file'
              accept='video/*'
              onChange={handleVideoChange}
              className='hidden'
            />
            {videoPreview && (
              <div className='relative'>
                <video
                  src={videoPreview}
                  controls
                  className='max-h-64 rounded-lg object-cover w-full'
                >
                  <track kind='captions' srcLang='en' label='English' />
                </video>
                <button
                  type='button'
                  onClick={removeVideo}
                  className='absolute top-2 right-2 bg-[var(--error)] text-white p-2 rounded-full hover:bg-[var(--error)] transition'
                  aria-label='Remove video'
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Audio Upload */}
          <div className='grid gap-2'>
            <label
              htmlFor='audioInput'
              className='font-semibold text-[var(--text)]'
            >
              Add Audio
            </label>
            <div className='flex items-center gap-2'>
              <button
                type='button'
                onClick={() => audioInputRef.current?.click()}
                className='px-4 py-2 bg-[var(--accent)] text-white rounded-md hover:bg-[var(--accent-hover)] transition'
              >
                Choose Audio
              </button>
              {audioFile && (
                <span className='text-sm text-[var(--muted)]'>
                  {audioFile.name}
                </span>
              )}
            </div>
            <input
              id='audioInput'
              ref={audioInputRef}
              type='file'
              accept='audio/*'
              onChange={handleAudioChange}
              className='hidden'
            />
          </div>

          {/* Privacy Toggle */}
          <div className='flex items-center gap-3 p-4 bg-[var(--card)] rounded-lg border border-[var(--border)]'>
            <input
              type='checkbox'
              id='isPublic'
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className='w-5 h-5 cursor-pointer rounded border-[var(--border)]'
            />
            <label
              htmlFor='isPublic'
              className='flex-1 cursor-pointer font-medium text-[var(--text)]'
            >
              Make this post public
            </label>
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full ${
                isPublic
                  ? "bg-[var(--success)]/10 text-[var(--success)]"
                  : "bg-[var(--muted)]/10 text-[var(--muted)]"
              }`}
            >
              {isPublic ? "Public" : "Private"}
            </span>
          </div>

          {/* Submit Buttons */}
          <div className='flex gap-3 justify-end'>
            <button
              type='button'
              onClick={() => navigate(-1)}
              className='px-6 py-2 border-2 border-[var(--accent)] text-[var(--accent)] bg-transparent rounded-md hover:bg-[var(--accent)]/5 transition font-medium'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={loading}
              className='px-6 py-2 bg-[var(--accent)] text-[#faf6f0] rounded-md hover:bg-[var(--accent-hover)] transition disabled:opacity-50 font-medium'
            >
              {loading ? "Creating..." : "Create Post"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
