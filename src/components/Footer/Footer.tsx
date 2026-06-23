'use client'
import Link from "next/link"
import { BsEnvelope } from "react-icons/bs"

const Footer = () => {
    return (
        <footer>

            <div className="pt-14 font-orbitron bg-gradient-to-t  from-tertiary-light from-50% via-white  dark:via-black via-90% to-transparent w-full bottom-0 left-0 text-white" >
                <h4 className="justify-self-center text-white">Contact Us</h4>
                <div className="flex md:flex-row flex-wrap items-center justify-evenly text-sm md:text-base gap-2 py-2 text-white">
                    <div className="flex items-center text-white">
                        <BsEnvelope className="text-white" />
                        <Link
                            href='/contact'
                            className="ml-2 text-white"
                        >Contact Us</Link>
                    </div>
                    <div className="flex items-center text-white">
                        <img
                            src="/icons/instagram.svg"
                            alt="Instagram logo"
                            className="w-5 h-5"
                        />
                        <Link
                            href="https://www.instagram.com/atlantabedandb0ndage/"
                            rel="noopener noreferrer"
                            target="_blank"
                            className="ml-2 text-white"
                        >Follow our Instagram</Link>
                    </div>
                    <div className="flex items-center text-white">
                        <img
                            src="/icons/linktree.svg"
                            alt="Linktree logo"
                            className="w-5 h-5"
                        />
                        <Link
                            href={"https://linktr.ee/atlantakbnb"}
                            rel="noopener noreferrer"
                            target="_blank"
                            className="ml-2 text-white"
                        >Other Links on Linktree</Link>
                    </div>
                    {/*
                    <div className="flex items-center text-white">
                        <BiLogoAirbnb className="text-white" />
                        <Link
                            href={"https://www.airbnb.com/rooms/1171823093801738771"}
                            rel="noopener noreferrer"
                            target="_blank"
                            className="ml-2 text-white"
                        >airbnb</Link>
                    </div>
                    */}
                    <div className="flex items-center text-white">
                        <img
                            src="/icons/x.svg"
                            alt="X logo"
                            className="w-5 h-5"
                        />
                        <Link
                            href={"https://x.com/AtlBed_Bondage"}
                            rel="noopener noreferrer"
                            target="_blank"
                            className="ml-2 text-white"
                        >Follow us on X</Link>
                    </div>
                    <div className="flex items-center text-white">
                        <img
                            src="/icons/vrbo.svg"
                            alt="Vrbo logo"
                            className="w-5 h-5"
                        />
                        <Link
                            href={"https://www.vrbo.com/4255461?dateless=true"}
                            rel="noopener noreferrer"
                            target="_blank"
                            className="ml-2 text-white"
                        >Check us out on Vrbo</Link>
                    </div>

                </div>

            </div>
        </footer>
    )
}

export default Footer