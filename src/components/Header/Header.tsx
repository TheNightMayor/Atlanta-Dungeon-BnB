
'use client';

import Link from 'next/link';
import { useContext, useState, useEffect } from 'react';
import useSWR from 'swr';
import { FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';
import { MdDarkMode, MdOutlineLightMode } from 'react-icons/md';
import { useSession } from 'next-auth/react';
import { getUserData } from '@/libs/apis';

import ThemeContext from '@/context/themeContext';
import Image from 'next/image';

const Header = () => {

  const { darkTheme, setDarkTheme } = useContext(ThemeContext);
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  };

  const { data: me } = useSWR(session?.user?.id ? '/api/users' : null, fetcher);

  useEffect(() => {
    const fetchAdmin = async () => {
      if (session?.user?.id) {
        try {
          const userData = me ?? (await getUserData(session.user.id));
          setIsAdmin(!!userData?.isAdmin);
        } catch (e) {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };
    fetchAdmin();
  }, [session?.user?.id]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const sessionUserImage = (() => {
    // Prefer the user record from /api/users (me) which will reflect recent image uploads
    if (me && me.imageUrl) return me.imageUrl;

    const image = session?.user?.image;
    if (typeof image === 'string' && image.trim().length > 0) {
      return image;
    }
    const imageObject = image as { url?: string } | undefined;
    if (imageObject && typeof imageObject.url === 'string') {
      return imageObject.url;
    }
    return null;
  })();

  return (
    <header className='font-orbitron sticky top-0 left-0 right-0 bg-gradient-to-b from-tertiary-light from-50% via-white via-90% dark:via-black to-100% text-white pt-2 pb-8 md:px-8 md:pb-10 md:pt-4 mx-auto text-xl flex flex-nowrap items-center justify-between z-20 w-full '>
      <div className='w-full'>
        <div className='flex items-center justify-between px-4 md:w-auto'>
          <Link href='/' className='font-orbitron md:text-2xl text-white transition-transform duration-200 transform-gpu hover:scale-110'>
            Atlanta Bed and Bondage
          </Link>

          <div className='flex justify-between'>
            {/* Mobile menu button */}
            <button
              className='md:hidden text-2xl text-white'
              onClick={toggleMenu}
              aria-label='Toggle menu'
            >
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>


            {/* Desktop Navigation */}
            <ul className='hidden md:flex items-center justify-between w-full mt-4 md:mt-0'>
              {isAdmin && (
                <li className='inline-block px-4'>
                  <Link href="/studio" target="_blank" rel="noopener noreferrer" className='inline-block transition-transform duration-200 transform-gpu hover:scale-110 text-white'>Studio</Link>
                </li>
              )}
              <li className='inline-block px-4'>
                <Link href='/' className='inline-block transition-transform duration-200 transform-gpu hover:scale-110 text-white'>Home</Link>
              </li>
              <li className='inline-block px-4'>
                <Link href='/about' className='inline-block transition-transform duration-200 transform-gpu hover:scale-110 text-white'>About Us</Link>
              </li>
              <li className='inline-block px-4'>
                <Link href='/rooms' className='inline-block transition-transform duration-200 transform-gpu hover:scale-110 text-white'>Booking</Link>
              </li>
              <li className='inline-block px-4'>
                <Link href='/contact' className='inline-block transition-transform duration-200 transform-gpu hover:scale-110 text-white'>Contact Us</Link>
              </li>
            </ul>

            {/* User controls - always visible */}
            <div className='flex items-center p-2'>
              <ul className='flex items-center'>
                <li className='flex items-center'>
                  {session?.user ? (
                    <Link href={`/users/${session.user.name}`}>
                      {sessionUserImage ? (
                        <div className='w-10 h-10 rounded-full overflow-hidden'>
                          <Image
                            src={sessionUserImage}
                            alt={session.user.name || 'User'}
                            width={40}
                            height={40}
                            className='scale-animation img'
                          />
                        </div>
                      ) : (
                        <div className='w-10 h-10 rounded-full overflow-hidden'>
                          <Image
                            src="/images/default-user.svg"
                            alt={session.user.name || 'User'}
                            width={40}
                            height={40}
                            className='scale-animation img'
                          />
                        </div>
                      )}
                    </Link>
                  ) : (
                    <Link href='/auth'>
                      <FaUserCircle className='cursor-pointer' />
                    </Link>
                  )}
                </li>
                <li className='ml-2 flex items-center'>
                  {darkTheme ? (
                    <button
                      type='button'
                      className='flex h-10 w-10 items-center justify-center rounded-full text-2xl text-white focus:outline-none'
                      onClick={() => {
                        setDarkTheme(false);
                        localStorage.removeItem('hotel-theme');
                      }}
                      aria-label='Switch to light mode'
                    >
                      <MdOutlineLightMode />
                    </button>
                  ) : (
                    <button
                      type='button'
                      className='flex h-10 w-10 items-center justify-center rounded-full text-2xl text-white focus:outline-none'
                      onClick={() => {
                        setDarkTheme(true);
                        localStorage.setItem('hotel-theme', 'true');
                      }}
                      aria-label='Switch to dark mode'
                    >
                      <MdDarkMode />
                    </button>
                  )}
                </li>
              </ul>
            </div>

            {/* Mobile Navigation Menu */}
            <div className={`md:hidden absolute top-full left-0 right-0 bg-white dark:bg-black shadow-lg border-t border-gray-200 dark:border-gray-700 overflow-hidden transition-translate duration-300 ease-in-out ${isMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
              }`}>
              <ul className='flex flex-col py-4'>
                <li className='px-8 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200'>
                  <Link href='/' className='inline-block transition-transform duration-200 transform-gpu hover:scale-105' onClick={() => setIsMenuOpen(false)}>Home</Link>
                </li>
                <li className='px-8 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200'>
                  <Link href='/about' className='inline-block transition-transform duration-200 transform-gpu hover:scale-105' onClick={() => setIsMenuOpen(false)}>About Us</Link>
                </li>
                <li className='px-8 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200'>
                  <Link href='/rooms' className='inline-block transition-transform duration-200 transform-gpu hover:scale-105' onClick={() => setIsMenuOpen(false)}>Booking</Link>
                </li>
                <li className='px-8 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200'>
                  <Link
                    href="/contact"
                    className='inline-block transition-transform duration-200 transform-gpu hover:scale-105'
                    onClick={() => setIsMenuOpen(false)}
                  >Contact Us</Link>
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