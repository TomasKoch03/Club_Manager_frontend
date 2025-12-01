import { useEffect, useRef, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { IoCameraOutline, IoTrashOutline } from 'react-icons/io5';
import { useToast } from '../../hooks/useToast';
import { deleteProfileImage, getProfileImageUrl, uploadProfileImage } from '../../services/api';
import AuthenticatedImage from './AuthenticatedImage';

const ProfileImageUpload = ({ userId, onImageUpdate }) => {
    const [imageUrl, setImageUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [hasImage, setHasImage] = useState(false);
    const fileInputRef = useRef(null);
    const toast = useToast();

    useEffect(() => {
        const checkImage = async () => {
            if (userId) {
                try {
                    const token = localStorage.getItem('accessToken');
                    const url = getProfileImageUrl(userId);
                    const response = await fetch(url, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });
                    if (response.ok) {
                        setImageUrl(`${url}?t=${Date.now()}`);
                        setHasImage(true);
                    } else {
                        setImageUrl(`${url}?t=${Date.now()}`);
                        setHasImage(false);
                    }
                } catch (error) {
                    const url = getProfileImageUrl(userId);
                    setImageUrl(`${url}?t=${Date.now()}`);
                    setHasImage(false);
                }
            }
        };

        checkImage();
    }, [userId]);

    const getInitials = (fullName) => {
        if (!fullName) return 'U';
        const names = fullName.trim().split(' ');
        if (names.length === 1) return names[0].charAt(0).toUpperCase();
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    };

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Por favor selecciona una imagen válida');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('La imagen no puede superar los 5MB');
            return;
        }

        try {
            setUploading(true);
            await uploadProfileImage(userId, file);

            // Update image URL with timestamp to force refresh
            const newUrl = `${getProfileImageUrl(userId)}&t=${Date.now()}`;
            setImageUrl(newUrl);
            setHasImage(true);

            toast.success('Imagen de perfil actualizada');
            if (onImageUpdate) {
                onImageUpdate(newUrl);
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error(error.detail || 'Error al subir la imagen');
        } finally {
            setUploading(false);
            // Clear input value to allow uploading same file again
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDeleteImage = async () => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar tu foto de perfil?')) {
            return;
        }

        try {
            setDeleting(true);
            await deleteProfileImage(userId);
            setImageUrl(null);
            setHasImage(false);
            toast.success('Imagen de perfil eliminada');
            if (onImageUpdate) {
                onImageUpdate(null);
            }
        } catch (error) {
            console.error('Error deleting image:', error);
            if (error.status === 404) {
                toast.error('No hay imagen de perfil para eliminar');
            } else {
                toast.error(error.detail || 'Error al eliminar la imagen');
            }
        } finally {
            setDeleting(false);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="d-flex flex-column align-items-center gap-3">
            {/* Profile Image Display */}
            <div
                style={{
                    position: 'relative',
                    width: '150px',
                    height: '150px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '4px solid #f8f9fa',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}
            >
                <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <AuthenticatedImage
                        src={imageUrl}
                        alt="Profile"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                        onError={() => setHasImage(false)}
                        fallback={
                            <div
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: '#e9ecef',
                                    fontSize: '3rem',
                                    fontWeight: 'bold',
                                    color: '#6c757d',
                                }}
                                onLoad={() => setHasImage(false)}
                            >
                                {getInitials('Usuario')}
                            </div>
                        }
                    />
                </div>

                {(uploading || deleting) && (
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Spinner animation="border" variant="light" />
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="d-flex gap-2">
                <button
                    onClick={handleUploadClick}
                    disabled={uploading || deleting}
                    className="btn btn-outline-dark"
                    style={{
                        borderRadius: '8px',
                        padding: '8px 20px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}
                >
                    <IoCameraOutline size={18} />
                    {hasImage ? 'Cambiar foto' : 'Subir foto'}
                </button>

                {hasImage && (
                    <button
                        onClick={handleDeleteImage}
                        disabled={uploading || deleting}
                        className="btn btn-outline-danger"
                        style={{
                            borderRadius: '8px',
                            padding: '8px 20px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}
                    >
                        <IoTrashOutline size={18} />
                        Eliminar
                    </button>
                )}
            </div>

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
            />

            {/* Help Text */}
            <p className="text-muted mb-0" style={{ fontSize: '0.85rem', textAlign: 'center' }}>
                Formatos: JPG, PNG, WebP. Máximo 5MB
            </p>
        </div>
    );
};

export default ProfileImageUpload;
