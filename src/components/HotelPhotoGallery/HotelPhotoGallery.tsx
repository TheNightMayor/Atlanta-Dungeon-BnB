'use client'

import { FC, useEffect, useState } from "react"
import Image from "next/image";

import { Image as ImageType } from "@/models/room"
import getImageUrl from '@/libs/imageUrl';
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { MdCancel } from "react-icons/md";

const HotelPhotoGallery: FC<{ photos: ImageType[] }> = ({ photos }) => {
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [showModal, setShowModal] = useState(false);

    const placeholderImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23cccccc" width="800" height="600"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="24" fill="%23666" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';

    const handleCloseModal = () => setShowModal(false);

    useEffect(() => {
        if (showModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [showModal]);

    // Filter photos to those with a usable url to avoid Next/Image errors
    const usablePhotos = Array.isArray(photos) ? photos.map(p => ({ ...p, url: getImageUrl(p) || '' })) : [];
    const displayedPhotos = usablePhotos.filter(p => !!p.url);
    const effectivePhotos = displayedPhotos.length > 0 ? displayedPhotos : usablePhotos;
    const photoCount = effectivePhotos.length;

    const handlePrevious = () => {
        if (photoCount === 0) return;
        setCurrentPhotoIndex(prevIndex => prevIndex === 0 ? photoCount - 1 : prevIndex - 1);
    };

    const handleNext = () => {
        if (photoCount === 0) return;
        setCurrentPhotoIndex(prevIndex => prevIndex === photoCount - 1 ? 0 : prevIndex + 1);
    };

    useEffect(() => {
        if (photoCount === 0) {
            setCurrentPhotoIndex(0);
            return;
        }

        setCurrentPhotoIndex(prevIndex => (prevIndex >= photoCount ? 0 : prevIndex));
    }, [photoCount]);

    return (
        <div className="w-full md:w-[90%] lg:w-[80%] xl:w-[70%] mx-auto md:py-8">
            <div className="container px-3">
                        <div
                    role="button"
                    tabIndex={0}
                    className="relative w-full aspect-square rounded-2xl overflow-hidden bg-black flex items-center justify-center group cursor-pointer focus:outline-none"
                    onClick={() => setShowModal(true)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setShowModal(true);
                        }
                    }}
                    aria-label="Open photo gallery modal"
                >
                            <Image
                                src={effectivePhotos[currentPhotoIndex]?.url || placeholderImage}
                                alt={`Room Photo ${currentPhotoIndex + 1}`}
                                fill
                                loading='eager'
                                priority
                                sizes='(max-width: 768px) 100vw, 800px'
                                className="object-contain"
                            />

                    <button
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full transition-all"
                        onClick={(e) => {
                            e.stopPropagation();
                            handlePrevious();
                        }}
                    >
                        <FaArrowLeft className="text-xl" />
                    </button>

                    <button
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full transition-all"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleNext();
                        }}
                    >
                        <FaArrowRight className="text-xl" />
                    </button>

                    <span className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded text-sm">
                        {currentPhotoIndex + 1} / {effectivePhotos.length}
                    </span>
                </div>

                {/* Thumbnails removed for simplified gallery view on mobile */}

                {showModal && (
                    <div
                        className="fixed inset-0 z-[99999] flex justify-center items-center bg-black bg-opacity-90"
                        onClick={handleCloseModal}
                        role="presentation"
                    >
                        <div
                            className="relative w-[90vw] h-[90vh] flex items-center justify-center"
                            role="dialog"
                            aria-modal="true"
                            aria-label="Photo viewer modal"
                        >
                            <div className="absolute inset-0 flex items-center justify-center" onClick={handleCloseModal}>
                                <div
                                    className="relative w-full h-full max-w-[min(90vw,80rem)] max-h-[min(90vh,60rem)]"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Image
                                        src={effectivePhotos[currentPhotoIndex]?.url || placeholderImage}
                                        alt={`Room Photo ${currentPhotoIndex + 1}`}
                                        fill
                                        sizes='90vw'
                                        className="object-contain"
                                    />

                                    <button
                                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full transition-all"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handlePrevious();
                                        }}
                                    >
                                        <FaArrowLeft className="text-2xl" />
                                    </button>

                                    <button
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full transition-all"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleNext();
                                        }}
                                    >
                                        <FaArrowRight className="text-2xl" />
                                    </button>

                                    <span className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded text-sm">
                                        {photoCount > 0 ? currentPhotoIndex + 1 : 0} / {photoCount || 1}
                                    </span>

                                    <button
                                        className="absolute top-4 right-4 text-white"
                                        onClick={() => setShowModal(false)}
                                    >
                                        <MdCancel className="text-3xl" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


export default HotelPhotoGallery