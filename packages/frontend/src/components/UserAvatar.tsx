type UserAvatarProps = {
  displayName?: string;
  email: string;
  size?: "sm" | "md" | "lg";
};

export default function UserAvatar({
  displayName,
  email,
  size = "md",
}: UserAvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-12 h-12 text-lg",
    lg: "w-24 h-24 text-3xl",
  };

  const initial = displayName
    ? displayName.charAt(0).toUpperCase()
    : email.charAt(0).toUpperCase();

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center flex-shrink-0`}
    >
      <span className='font-bold text-white'>{initial}</span>
    </div>
  );
}
