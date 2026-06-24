'use client'
import Link from "next/link"
import { BsEnvelope } from "react-icons/bs"

const Footer = () => {
    return (
        <footer>

            <div className="py-8 font-orbitron bg-gradient-to-t  from-tertiary-light from-50% via-white  dark:via-black via-90% to-transparent w-full bottom-0 left-0 text-white " >
                <h4 className="justify-self-center text-white pt-14">Contact Us</h4>
                <div className="flex md:flex-row flex-wrap items-center justify-evenly text-sm md:text-base gap-2 py-2 text-white">
                    <Link
                        href='/contact'
                        className="flex items-center text-white"
                        aria-label="Contact Us"
                    >
                        <BsEnvelope className="text-white" />
                        <span className="hidden md:inline ml-2">Contact Us</span>
                    </Link>
                    <Link
                        href="https://www.instagram.com/atlantabedandb0ndage/"
                        rel="noopener noreferrer"
                        target="_blank"
                        className="flex items-center text-white"
                        aria-label="Follow our Instagram"
                    >
                        <img
                            src="/icons/instagram.svg"
                            alt="Instagram logo"
                            className="w-5 h-5"
                        />
                        <span className="hidden md:inline ml-2">Follow our Instagram</span>
                    </Link>
                    <Link
                        href={"https://linktr.ee/atlantakbnb"}
                        rel="noopener noreferrer"
                        target="_blank"
                        className="flex items-center text-white"
                        aria-label="Other Links on Linktree"
                    >
                        <img
                            src="/icons/linktree.svg"
                            alt="Linktree logo"
                            className="w-5 h-5"
                        />
                        <span className="hidden md:inline ml-2">Other Links on Linktree</span>
                    </Link>
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
                    <Link
                        href={"https://x.com/AtlBed_Bondage"}
                        rel="noopener noreferrer"
                        target="_blank"
                        className="flex items-center text-white"
                        aria-label="Follow us on X"
                    >
                        <img
                            src="/icons/x.svg"
                            alt="X logo"
                            className="w-5 h-5"
                        />
                        <span className="hidden md:inline ml-2">Follow us on X</span>
                    </Link>
                    <Link
                        href={"https://www.vrbo.com/4255461?dateless=true"}
                        rel="noopener noreferrer"
                        target="_blank"
                        className="flex items-center text-white"
                        aria-label="Check us out on Vrbo"
                    >
                        <img
                            src="/icons/vrbo.svg"
                            alt="Vrbo logo"
                            className="w-5 h-5"
                        />
                        <span className="hidden md:inline ml-2">Check us out on Vrbo</span>
                    </Link>

                </div>

            </div>
        </footer>
    )
}

export default Footer