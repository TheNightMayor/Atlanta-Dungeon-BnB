'use client'

import { FC } from "react"
import Image from "next/image";



const ClientComponent: FC = _props => {

    return <section className="min-h-96">
        <div className="w-full text-center relative z-10 mt-1">
            <video autoPlay muted loop className="fixed -z-20 w-full object-cover h-96">
                <source src="/images/hero-4.webm" type="video/mp4" />
            </video>
            <div className="flex flex-col items-center pt-32 h-full  text-black dark:text-white bg-transparent min-h-96">
                <h1 className="font-orbitron mb-6 text-7xl">
                    Dungeon Next Door
                </h1>
                <p className="text-black dark:text-white max-w-lg text-xl font-bold ">
                    Prepare for an Unforgettable Experience</p>
            </div>
        </div>
    </section>
}

export default ClientComponent