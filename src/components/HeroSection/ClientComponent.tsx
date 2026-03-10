'use client'

import { FC } from "react"
import Image from "next/image";



const ClientComponent: FC = _props => {

    return <section className="min-h-96">
        <div className="w-full text-center relative z-10 mt-1">
            <video autoPlay muted loop className="fixed -z-20 w-full object-cover h-96">
                <source src="/images/hero-4.webm" type="video/mp4" />
            </video>
            <div className="flex flex-col items-center pt-32 h-full  text-white bg-transparent min-h-96">
                <h1 className="font-orbitron mb-6 text-7xl">
                    Dungeon Next Door
                </h1>
                <p className="text-white max-w-lg text-xl font-bold">
                    Prepare for an Unforgettable Experience During Your Stay</p>
            </div>
        </div>
        {/* <button className="btn-primary md:w-auto w-full">
        Get Started
    </button> */}


        {/* <div className="md:grid hidden gap-8 grid-cols-1 w-1/3 mb-10">
            <div className="rounded-2xl overflow-hidden h-48">
                <Image
                    src='/images/hero-1.jpg'
                    alt='hero-1'
                    width={300}
                    height={300}                />
            </div>
            <div className='grid grid-cols-2 gap-8 h-48'>
                <div className="rounded-2xl overflow-hidden">
                    <Image
                        src='/images/hero-2.jpg'
                        alt='hero-2'
                        width={300}
                        height={300}
                        className="img scale-animation"
                    /></div>
                <div className="rounded-2xl overflow-hidden">
                    <Image
                        src='/images/hero-3.jpg'
                        alt='hero-3'
                        width={300}
                        height={300}
                        className="img scale-animation"
                    />
                </div>
            </div>
        </div> */}
    </section>
}

export default ClientComponent