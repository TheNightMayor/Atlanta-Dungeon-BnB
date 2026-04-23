'use client'
import Link from "next/link"
import { BiLogoAirbnb } from "react-icons/bi"
import { TbLetterV } from "react-icons/tb"
import { BsEnvelope, BsInstagram, BsTree } from "react-icons/bs"

const Footer = () => {
    return (
        <footer>

            <div className="pt-14 font-orbitron bg-gradient-to-t  from-tertiary-light from-50% via-white  dark:via-black via-90% to-transparent w-full bottom-0 left-0" >
                <h4 className="justify-self-center">Contact Us</h4>
                <div className="flex md:flex-row flex-wrap items-center justify-evenly text-sm md:text-base gap-2 py-2">
                    <div className="flex items-center">
                        <BsEnvelope />
                        <Link
                            href='/contact'
                            className="ml-2"
                        >Contact Us</Link>
                    </div>
                    <div className="flex items-center">
                        <BsInstagram />
                        <Link
                            href="https://www.instagram.com/atlantabedandb0ndage/"
                            rel="noopener noreferrer"
                            target="_blank"
                            className="ml-2"
                        >Instagram</Link>
                    </div>
                    <div className="flex items-center">
                        <BsTree />
                        <Link
                            href={"https://linktr.ee/atlantakbnb"}
                            rel="noopener noreferrer"
                            target="_blank"
                            className="ml-2">Linktree</Link>
                    </div>
                    <div className="flex items-center">
                        <BiLogoAirbnb />
                        <Link
                            href={"https://www.airbnb.com/rooms/1171823093801738771"}
                            rel="noopener noreferrer"
                            target="_blank"
                            className="ml-2"
                        >airbnb</Link>
                    </div>
                    <div className="flex items-center">
                        <TbLetterV />
                        <Link
                            href={"https://www.vrbo.com/4255461?dateless=true"}
                            rel="noopener noreferrer"
                            target="_blank"
                            className="ml-2"
                        >Vrbo</Link>
                    </div>

                </div>

            </div>
        </footer>
    )
}

export default Footer