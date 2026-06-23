'use client'

import { FC, useState } from "react"



const ClientComponent: FC = _props => {
    const [videoFailed, setVideoFailed] = useState(false)
    const textColorClass = videoFailed ? 'text-black' : 'text-white'


    return <section className="min-h-[36rem] relative -mt-4 z-0 overflow-hidden py-10 md:py-16">
        <div className="w-full text-center relative mt-1">
            <video
                autoPlay
                muted
                loop
                className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
                onError={() => setVideoFailed(true)}
                onLoadedData={() => setVideoFailed(false)}
            >
                <source src="/images/hero-4.mp4" type="video/mp4" />
                <source src="/images/hero-4.webm" type="video/webm" />
            </video>
            <div className={`flex flex-col items-center justify-center h-full ${textColorClass} bg-transparent min-h-[36rem] z-20 relative md:pt-20 gap-8`}>
                <h1 className="font-orbitron text-6xl md:text-7xl leading-tight">
                    Atlanta Bed and Bondage
                </h1>
                <p className={`${textColorClass} max-w-lg text-xl md:text-2xl font-bold leading-relaxed`}>
                    Your Dungeon Next Door
                </p>
            </div>
        </div>
    </section>
}

export default ClientComponent