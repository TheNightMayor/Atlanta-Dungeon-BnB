import Link from "next/link"
import { BiLogoAirbnb } from "react-icons/bi"
import { TbLetterV } from "react-icons/tb"
import { BsEnvelope, BsInstagram, BsTree } from "react-icons/bs"

const Footer = () => {
    return (
        <footer className="font-orbitron">

            <div className="bg-gradient-to-t  from-tertiary-light to-white dark:to-black  w-full bottom-0 left-0" >
                <h4 className="justify-self-center font-semibold text-[24px] py-4">Contact Us</h4>
                <div className="flex md:flex-row flex-wrap items-center justify-evenly">
                    <div className="flex items-center">
                        <BsEnvelope />
                        <Link
                            href='/contact'
                            className="ml-2 py-4 font-bold"
                        >Contact Us</Link>
                    </div>
                    {/* <div className="flex items-center py-4">
                        <BsInstagram />
                        <Link
                            href="https://www.instagram.com/atlkinkbnb/"
                            rel="noopener noreferrer"
                            target="_blank"
                            className="ml-2 font-bold"
                        >instagram</Link>
                    </div> */}
                    <div className="flex items-center">
                        <BsTree />
                        <Link
                            href={"https://linktr.ee/atlantakbnb"}
                            rel="noopener noreferrer"
                            target="_blank"
                            className="ml-2 py-4 font-bold">Linktree</Link>
                    </div>
                    <div className="flex items-center">
                        <BiLogoAirbnb />
                        <Link
                            href={"https://www.airbnb.com/rooms/1171823093801738771"}
                            rel="noopener noreferrer"
                            target="_blank"
                            className="ml-2 py-4 font-bold"
                        >airbnb</Link>
                    </div>
                    <div className="flex items-center">
                        <TbLetterV />
                        <Link
                            href={"https://www.vrbo.com/4255461?dateless=true"}
                            rel="noopener noreferrer"
                            target="_blank"
                            className="ml-2 py-4 font-bold"
                        >Vrbo</Link>
                    </div>

                </div>

            </div>
        </footer>
    )
}

export default Footer