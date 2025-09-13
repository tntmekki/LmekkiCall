import React, { useState, useEffect } from 'react';

interface AvatarProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// A simple, elegant SVG for a user icon, used as a fallback.
const DEFAULT_AVATAR = `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'%3e%3cpath fill-rule='evenodd' d='M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z' clip-rule='evenodd' /%3e%3c/svg%3e`;


const Avatar: React.FC<AvatarProps> = ({ src, alt, size = 'md' }) => {
    const [imageSrc, setImageSrc] = useState(src || DEFAULT_AVATAR);

    // This effect ensures that if the src prop changes, we try to load the new image.
    useEffect(() => {
        setImageSrc(src || DEFAULT_AVATAR);
    }, [src]);

    const handleError = () => {
        // If the provided src fails to load, fall back to the default avatar.
        if (imageSrc !== DEFAULT_AVATAR) {
            setImageSrc(DEFAULT_AVATAR);
        }
    };

    const sizeClasses = {
        sm: 'w-10 h-10',
        md: 'w-12 h-12',
        lg: 'w-20 h-20',
        xl: 'w-32 h-32'
    };
    
    const isDefault = imageSrc === DEFAULT_AVATAR;
    
    // Conditionally apply classes for the default SVG to ensure it looks good.
    const imageClasses = [
        'w-full h-full rounded-full border-2 border-slate-200 dark:border-slate-600',
        isDefault ? 'object-contain bg-slate-200 dark:bg-slate-700 p-1' : 'object-cover',
    ].join(' ');

  return (
    <div className={`relative ${sizeClasses[size]}`}>
      <img
        className={imageClasses}
        src={imageSrc}
        alt={alt}
        onError={handleError}
      />
    </div>
  );
};

export default Avatar;
