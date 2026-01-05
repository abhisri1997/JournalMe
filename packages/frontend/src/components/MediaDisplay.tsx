type MediaDisplayProps = {
  imagePath?: string;
  videoPath?: string;
  audioPath?: string;
  createdAt: string;
  autoPlay?: boolean;
};

export default function MediaDisplay({
  imagePath,
  videoPath,
  audioPath,
  createdAt,
  autoPlay = false,
}: MediaDisplayProps) {
  if (imagePath) {
    return (
      <div className='mb-6 rounded-xl overflow-hidden flex items-center justify-center bg-black/5'>
        <img
          src={`/uploads/${imagePath}`}
          alt='Journal post media'
          className='w-full max-h-[35vh] sm:max-h-[50vh] md:max-h-[60vh] object-contain'
        />
      </div>
    );
  }

  if (videoPath) {
    return (
      <div className='mb-6 rounded-xl overflow-hidden bg-black flex items-center justify-center'>
        <video
          src={`/uploads/${videoPath}`}
          controls
          autoPlay={autoPlay}
          className='w-full max-h-[35vh] sm:max-h-[50vh] md:max-h-[60vh] object-contain'
        >
          <track kind='captions' />
        </video>
      </div>
    );
  }

  if (audioPath) {
    return (
      <div className='bg-gradient-to-br from-orange-500 via-rose-500 to-pink-600 rounded-xl p-8 shadow-xl relative overflow-hidden mb-6'>
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
                Recorded on {new Date(createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className='bg-white/10 backdrop-blur-sm rounded-lg p-4'>
            <audio
              src={`/uploads/${audioPath}`}
              controls
              autoPlay={autoPlay}
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
    );
  }

  return null;
}
