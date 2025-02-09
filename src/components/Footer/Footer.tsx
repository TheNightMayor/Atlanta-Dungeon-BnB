import Link from "next/link"
import { BiLogoAirbnb, BiMessageDetail } from "react-icons/bi"
import { BsEnvelope, BsFillSendFill, BsInstagram, BsMailbox, BsTelephoneOutbound, BsTree } from "react-icons/bs"

const Footer = () => {
    return (
        <footer className="mt-16">
            <div className="container mx-auto px-4">
                <Link href='/' className="font-black text-tertiary-dark">
                    Home</Link></div>
                    <div className="bg-tertiary-light w-full bottom-0 left-0" >
                <h4 className="justify-self-center font-semibold text-[24px] py-4">Contact Us</h4>
                <div className="flex md:flex-row flex-wrap items-center justify-evenly">
                    <div className="flex items-center">
                        <BsEnvelope />
                        <Link
                            href="mailto:Atlantakbnb@yahoo.com"
                            rel="noopener noreferrer"
                            target="_blank"
                            className="ml-2 py-4"
                        >email</Link>
                    </div>
                    <div className="flex items-center py-4">
                        <BsInstagram />
                        <Link
                            href="https://www.instagram.com/atlkinkbnb/"
                            rel="noopener noreferrer"
                            target="_blank"
                            className="ml-2"
                        >instagram</Link>
                    </div>
                    <div className="flex items-center">
                        <BsTree />
                        <Link
                            href={"https://linktr.ee/atlantakbnb"}
                            rel="noopener noreferrer"
                            target="_blank"
                            className="ml-2 py-4">Linktree</Link>
                    </div>
                    <div className="flex items-center">
                        <BiLogoAirbnb />
                        <Link
                            href={"https://www.airbnb.com/rooms/1171823093801738771"}
                            rel="noopener noreferrer"
                            target="_blank"
                            className="ml-2 py-4"
                        >airbnb</Link>
                    </div>

                    </div>

           </div>
        </footer>
    )
}

export default Footer