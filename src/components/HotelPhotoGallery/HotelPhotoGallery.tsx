'use client'

import { FC, useState } from "react"
import Image from "next/image";

import { Image as ImageType } from "@/models/room"
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { MdCancel } from "react-icons/md";

const HotelPhotoGallery: FC<{ photos: ImageType[] }> = ({ photos }) => {
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [showModal, setShowModal] = useState(false);

    const handlePrevious = () => {
        setCurrentPhotoIndex(prevIndex => prevIndex === 0 ? photos.length - 1 : prevIndex - 1
        );
    };

    const handleNext = () => {
        setCurrentPhotoIndex(prevIndex => prevIndex === photos.length - 1 ? 0 : prevIndex + 1
        );
    };

    return (
        <div className="w-2/3 py-8">
            <div className="container px-3">
                <div className="relative w-full h-[400px] rounded-2xl overflow-hidden bg-black flex items-center justify-center group cursor-pointer" onClick={() => setShowModal(true)}>
                    <Image
                        src={photos[currentPhotoIndex].url}
                        alt={`Room Photo ${currentPhotoIndex + 1}`}
                        fill
                        className="object-contain"
                    />

                    <button
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full z-10 transition-all"
                        onClick={(e) => {
                            e.stopPropagation();
                            handlePrevious();
                        }}
                    >
                        <FaArrowLeft className="text-xl" />
                    </button>

                    <button
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full z-10 transition-all"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleNext();
                        }}
                    >
                        <FaArrowRight className="text-xl" />
                    </button>

                    <span className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded text-sm">
                        {currentPhotoIndex + 1} / {photos.length}
                    </span>
                </div>

                <div className="grid grid-cols-5 gap-3 mt-4">
                    {photos.map((photo, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setCurrentPhotoIndex(index);
                                setShowModal(true);
                            }}
                            className={`relative h-20 rounded overflow-hidden transition-all ${
                                index === currentPhotoIndex
                                    ? 'ring-2 ring-tertiary-dark'
                                    : 'opacity-70 hover:opacity-100'
                            }`}
                        >
                            <Image
                                src={photo.url}
                                alt={`Thumbnail ${index + 1}`}
                                fill
                                className="object-cover"
                            />
                        </button>
                    ))}
                </div>

                {showModal && (
                    <div
                        className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-90 z-[55]"
                        onClick={() => setShowModal(false)}
                    >
                        <div className="relative w-[90vw] h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                            <Image
                                src={photos[currentPhotoIndex].url}
                                alt={`Room Photo ${currentPhotoIndex + 1}`}
                                fill
                                className="object-contain"
                            />

                            <button
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full z-10 transition-all"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handlePrevious();
                                }}
                            >
                                <FaArrowLeft className="text-2xl" />
                            </button>

                            <button
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full z-10 transition-all"
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
                                className="absolute top-4 right-4 text-white z-10"
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