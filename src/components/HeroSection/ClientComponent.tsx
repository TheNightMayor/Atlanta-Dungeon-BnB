'use client'

import { FC } from "react"



const ClientComponent: FC = _props => {

    return <section className="min-h-72 relative -mt-4 z-0">
        <div className="w-full text-center relative mt-1 ">
                        <video autoPlay muted loop className="fixed w-full object-cover h-72">
                    <source src="/images/hero-4.webm" type="video/mp4" />
                </video>
            <div className="flex flex-col items-center h-full  text-black dark:text-white bg-transparent min-h-72 z-10 relative md:pt-20">
                <h1 className="font-orbitron mb-4 text-7xl">
                    Atlanta Bed and Bondage
                </h1>
                <p className="text-black dark:text-white max-w-lg text-xl font-bold ">
                    Your Dungeon Next Door</p>
            </div>
        </div>
    </section>
}

export default ClientComponent