'use client'

import { FC, useState } from "react"
import Image from "next/image";

import { Image as ImageType } from "@/models/room"
import getImageUrl from '@/libs/imageUrl';
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { MdCancel } from "react-icons/md";

const HotelPhotoGallery: FC<{ photos: ImageType[] }> = ({ photos }) => {
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [showModal, setShowModal] = useState(false);

    const placeholderImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23cccccc" width="800" height="600"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="24" fill="%23666" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';

    // Filter photos to those with a usable url to avoid Next/Image errors
    const usablePhotos = Array.isArray(photos) ? photos.map(p => ({ ...p, url: getImageUrl(p) || '' })) : [];
    const displayedPhotos = usablePhotos.filter(p => !!p.url);
    const effectivePhotos = displayedPhotos.length > 0 ? displayedPhotos : usablePhotos;

    const handlePrevious = () => {
        setCurrentPhotoIndex(prevIndex => prevIndex === 0 ? photos.length - 1 : prevIndex - 1
        );
    };

    const handleNext = () => {
        setCurrentPhotoIndex(prevIndex => prevIndex === photos.length - 1 ? 0 : prevIndex + 1
        );
    };

    return (
        <div className="md:w-full md:py-8">
            <div className="container px-3">
                        <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-black flex items-center justify-center group cursor-pointer" onClick={() => setShowModal(true)}>
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
                        className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-90"
                        onClick={() => setShowModal(false)}
                    >
                        <div className="relative w-[90vw] h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
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
                                {currentPhotoIndex + 1} / {photos.length}
                            </span>

                            <button
                                className="absolute top-4 right-4 text-white"
                                onClick={() => setShowModal(false)}
                            >
                                <MdCancel className="text-3xl" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


export default HotelPhotoGallery