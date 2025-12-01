import { useEffect, useState } from 'react';

const AuthenticatedImage = ({ src, alt, className, style, onError, fallback }) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const loadImage = async () => {
            try {
                setLoading(true);
                setError(false);

                const token = localStorage.getItem('accessToken');
                const response = await fetch(src, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const blob = await response.blob();
                    const objectUrl = URL.createObjectURL(blob);
                    setImageSrc(objectUrl);
                } else {
                    setError(true);
                    if (onError) onError();
                }
            } catch (err) {
                console.error('Error loading authenticated image:', err);
                setError(true);
                if (onError) onError();
            } finally {
                setLoading(false);
            }
        };

        if (src) {
            loadImage();
        }

        // Cleanup
        return () => {
            if (imageSrc) {
                URL.revokeObjectURL(imageSrc);
            }
        };
    }, [src]);

    if (loading || error || !imageSrc) {
        return fallback || null;
    }

    return (
        <img
            src={imageSrc}
            alt={alt}
            className={className}
            style={style}
        />
    );
};

export default AuthenticatedImage;
