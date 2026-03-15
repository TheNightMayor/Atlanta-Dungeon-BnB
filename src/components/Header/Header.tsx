
'use client';

import Link from 'next/link';
import { useContext, useState } from 'react';
import { FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';
import { MdDarkMode, MdOutlineLightMode } from 'react-icons/md';
import { useSession } from 'next-auth/react';

import ThemeContext from '@/context/themeContext';
import Image from 'next/image';

const Header = () => {
  const { darkTheme, setDarkTheme } = useContext(ThemeContext);
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);


  return (
    <header className='font-orbitron fixed top-0 left-0 right-0 bg-gradient-to-b from-tertiary-light from-10% to-white dark:to-black to-80% p-8 md:p-8 mx-auto text-xl flex flex-wrap md:flex-nowrap items-center justify-between z-20'>
      <div className='container'>
        <div className='flex items-center justify-between w-full p-4 md:w-auto'>
          <Link href='/' className='font-orbitron text-2xl text-black dark:text-white'>
            Atlanta Bed and Bondage
          </Link>

          <div className='flex justify-between'>
            {/* Mobile menu button */}
            <button
              className='md:hidden text-2xl'
              onClick={toggleMenu}
              aria-label='Toggle menu'
            >
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>

            {/* Desktop Navigation */}
            <ul className='hidden md:flex items-center justify-around w-full md:w-1/3 mt-4 md:mt-0'>
              <li className='hover:-translate-y-1 duration-500 transition-all px-4'>
                <Link href='/'>Home</Link>
              </li>
              <li className='hover:-translate-y-1 duration-500 transition-all px-4'>
                <Link href='/rooms'>Booking</Link>
              </li>
                <li className='hover:-translate-y-1 duration-500 transition-all px-4'>
                <Link href='/contact'>Contact Us</Link>
              </li>
            </ul>

            {/* User controls - always visible */}
            <div className='flex items-center p-2'>
              <ul className='flex items-center'>
                <li className='flex items-center'>
                  {session?.user ? (
                    <Link href={`/users/${session.user.name}`}>
                      {session.user.image ? (
                        <div className='w-10 h-10 rounded-full overflow-hidden'>
                          <Image
                            src={session.user.image}
                            alt={session.user.name!}
                            width={40}
                            height={40}
                            className='scale-animation img'
                          />
                        </div>
                      ) : (
                        <FaUserCircle className='cursor-pointer' />
                      )}
                    </Link>
                  ) : (
                    <Link href='/auth'>
                      <FaUserCircle className='cursor-pointer' />
                    </Link>
                  )}
                </li>
                <li className='ml-2'>
                  {darkTheme ? (
                    <MdOutlineLightMode
                      className='cursor-pointer'
                      onClick={() => {
                        setDarkTheme(false);
                        localStorage.removeItem('hotel-theme');
                      }}
                    />
                  ) : (
                    <MdDarkMode
                      className='cursor-pointer'
                      onClick={() => {
                        setDarkTheme(true);
                        localStorage.setItem('hotel-theme', 'true');
                      }}
                    />
                  )}
                </li>
              </ul>
            </div>

            {/* Mobile Navigation Menu */}
            <div className={`md:hidden absolute top-full left-0 right-0 bg-white dark:bg-black shadow-lg border-t border-gray-200 dark:border-gray-700 overflow-hidden transition-translate duration-300 ease-in-out ${isMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
              }`}>
              <ul className='flex flex-col py-4'>
                <li className='px-8 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200'>
                  <Link href='/' onClick={() => setIsMenuOpen(false)}>Home</Link>
                </li>
                <li className='px-8 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200'>
                  <Link href='/rooms' onClick={() => setIsMenuOpen(false)}>Booking</Link>
                </li>
                <li className='px-8 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200'>
                  <Link
                    href="mailto:Atlantakbnb@yahoo.com"
                    rel="noopener noreferrer"
                    target="_blank"
                    onClick={() => setIsMenuOpen(false)}
                  >Contact</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;