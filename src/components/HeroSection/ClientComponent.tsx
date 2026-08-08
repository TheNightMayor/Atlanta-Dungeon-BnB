'use client'

import { FC, useEffect, useRef, useState } from "react"



const ClientComponent: FC = _props => {
    const [videoFailed, setVideoFailed] = useState(false)
    const videoRef = useRef<HTMLVideoElement | null>(null)

    const textColorClass = videoFailed ? 'text-black' : 'text-white'

    const setPlaybackRate = () => {
        if (videoRef.current) {
            videoRef.current.defaultPlaybackRate = 0.6
            videoRef.current.playbackRate = 0.6
        }
    }

    useEffect(() => {
        setPlaybackRate()
    }, [])
  
    return <section className="min-h-[36rem] relative -mt-4 z-0 overflow-hidden py-10 md:py-16">
        <div className="w-full text-center relative mt-1">
            <video
                ref={videoRef}
                autoPlay
                muted
                loop
                className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
                onError={() => setVideoFailed(true)}
                onLoadedMetadata={() => setPlaybackRate()}
                onLoadedData={() => {
                    setVideoFailed(false)
                    setPlaybackRate()
                }}
                onPlay={() => setPlaybackRate()}
            >
                <source src="/images/Hero-Tour-Vid.mp4" type="video/mp4" />
                <source src="/images/Hero-Tour-Vid.webm" type="video/webm" />
            </video>
            <div
                className="absolute inset-0 z-10 pointer-events-none"
                style={{
                    background: 'radial-gradient(circle at center, rgba(0,0,0,0) 18%, rgba(0,0,0,0.3) 45%, rgba(0,0,0,0.9) 100%)',
                }}
            />
            <div className={`flex flex-col items-center justify-center h-full ${textColorClass} bg-transparent min-h-[36rem] z-20 relative md:pt-20 gap-8`}>
                <h1 className="font-orbitron text-6xl md:text-7xl leading-tight drop-shadow-[0_0_16px_rgba(0,0,0,0.65)]" style={{ textShadow: '0 0 2px rgba(0,0,0,0.85), 0 0 6px rgba(0,0,0,0.5)' }}>
                    Atlanta Bed and Bondage
                </h1>
                <p
                    className={`${textColorClass} max-w-lg text-xl md:text-2xl font-bold leading-relaxed`}
                    style={{ textShadow: '0 0 2px rgba(0,0,0,0.85), 0 0 4px rgba(0,0,0,0.55)' }}
                >
                    Your Dungeon Next Door
                </p>
            </div>
        </div>
    </section>
}

export default ClientComponent