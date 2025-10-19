interface HoneycombLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
}

export default function HoneycombLogo({ 
  size = 'md', 
  animated = false, 
  className = '' 
}: HoneycombLogoProps) {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  return (
    <div className={`${sizeMap[size]} ${className} relative`}>
      <img
        src="/logo"
        alt="Halal Connections Logo"
        className={`w-full h-full object-contain ${animated ? 'animate-pulse' : ''}`}
      />
    </div>
  );
}