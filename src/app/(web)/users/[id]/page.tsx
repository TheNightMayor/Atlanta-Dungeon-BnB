'use client';

import useSWR, { mutate } from 'swr';
import { FaSignOutAlt } from 'react-icons/fa';
import Image from 'next/image';
import axios from 'axios';
import { signOut, useSession } from 'next-auth/react';

import { getUserBookings } from '@/libs/apis';
import LoadingSpinner from '../../loading';
import { useState, useEffect, type ChangeEvent, type KeyboardEvent } from 'react';
import { use } from 'react';
import { BsJournalBookmarkFill } from 'react-icons/bs';
import Table from '@/components/Table/Table';
import Chart from '@/components/Chart/Chart';
import RatingModal from '@/components/RatingModal/RatingModal';
import BackDrop from '@/components/BackDrop/BackDrop';
import toast from 'react-hot-toast';
import { User } from '@/models/user';

const UserDetails = (props: { params: Promise<{ id: string }> }) => {
  const { data: session } = useSession();
  const { id: userId } = use(props.params);

  const [currentNav, setCurrentNav] = useState<
    'bookings' | 'amount' | 'ratings'
  >('bookings');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isRatingVisible, setIsRatingVisible] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [ratingValue, setRatingValue] = useState<number | null>(0);
  const [ratingText, setRatingText] = useState('');
  const [selectedProfileImage, setSelectedProfileImage] = useState<File | null>(null);
  const [selectedProfileImagePreview, setSelectedProfileImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const toggleRatingModal = () => setIsRatingVisible(prevState => !prevState);

  const reviewSubmitHandler = async () => {
    if (!ratingText.trim().length || !ratingValue) {
      return toast.error('Please provide a rating text and a rating');
    }

    if (!roomId) toast.error('Id not provided');

    setIsSubmittingReview(true)

    try {
      const { data } = await axios.post('/api/users', {
        reviewText: ratingText,
        ratingValue,
        roomId,
      });
      console.log(data);
      toast.success('Review Submitted');
    } catch (error) {
      console.log(error);
      toast.error('Review Failed');
    } finally {
      setRatingText('');
      setRatingValue(null);
      setRoomId(null);
      setIsSubmittingReview(false);
      setIsRatingVisible(false);
    }
  };

  const fetchUserBooking = async () => getUserBookings(userId);
  const fetchUserData = async () => {
    const { data } = await axios.get<User>('/api/users');
    return data;
  };

  const handleProfileImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedProfileImage(file);
    setSelectedProfileImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleLabelKeyDown = (e: KeyboardEvent<HTMLLabelElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const input = e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement | null;
      input?.click();
    }
  };

  useEffect(() => {
    return () => {
      if (selectedProfileImagePreview) {
        URL.revokeObjectURL(selectedProfileImagePreview);
      }
    };
  }, [selectedProfileImagePreview]);

  const uploadProfileImage = async () => {
    if (!selectedProfileImage) return;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedProfileImage);

      const res = await fetch('/api/users/image', { method: 'POST', body: formData });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Upload failed');
      }

      await mutate('/api/users');
      setSelectedProfileImage(null);
      setSelectedProfileImagePreview(null);
      toast.success('Profile image uploaded');
    } catch (err) {
      console.error('Upload failed', err);
      toast.error('Failed to upload profile image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const {
    data: userBookings,
    error,
    isLoading,
  } = useSWR('/api/userbooking', fetchUserBooking);

  const {
    data: userData,
    isLoading: loadingUserData,
    error: errorGettingUserData,
  } = useSWR('/api/users', fetchUserData);

  if (error || errorGettingUserData) throw new Error('Cannot fetch data');
  if (typeof userBookings === 'undefined' && !isLoading)
    throw new Error('Cannot fetch data');
  if (typeof userData === 'undefined' && !loadingUserData)
    throw new Error('Cannot fetch data');

  if (loadingUserData) return <LoadingSpinner />;
  if (!userData) throw new Error('Cannot fetch data');
  if (!userData) throw new Error('Cannot fetch data');

  // Prefer session user image (Google), then userData.image, then default
  const userDataImageUrl = userData.image && typeof userData.image !== 'string'
    ? (userData.image as { url?: string }).url
    : userData.image;

  const sessionUserImageUrl = (() => {
    const image = session?.user?.image;
    if (typeof image === 'string' && image.trim().length > 0) return image;
    const imgObj = image as { url?: string } | undefined;
    if (imgObj && typeof imgObj.url === 'string') return imgObj.url;
    return null;
  })();

  const profileImage = sessionUserImageUrl || userDataImageUrl || '/images/default-user.svg';

  const isCurrentUser = session?.user?.id === userId || session?.user?.name === userId;

  return (
    <div className='container mx-auto px-2 md:px-4 pt-2 md:pt-2 py-10 min-h-[67vh] bg-white text-[#1e1e1e] dark:bg-black dark:text-white'>
      <div className='md:grid md:grid-cols-12 gap-10'>
        <div className='hidden md:block md:col-span-4 lg:col-span-3 shadow-lg h-fit sticky top-10 bg-white text-[#1e1e1e] dark:bg-black dark:text-white rounded-lg px-6 py-4 border-2 border-gray-200 dark:border-tertiary-dark'>
          <div className='md:w-[143px] w-28 h-28 md:h-[143px] mx-auto mb-5 rounded-full overflow-hidden'>
            <Image
              src={profileImage}
              alt={userData.name}
              width={143}
              height={143}
              className='img scale-animation rounded-full'
            />
          </div>
          {/* <div className='font-normal py-4 text-left'>
            <h6 className='text-xl font-bold pb-3'>About</h6>
            <p className='text-sm'>{userData.about ?? ''}</p>
          </div> */}
          <div className='font-normal text-left'>
            <h6 className='text-xl font-bold pb-3 text-tertiary-dark'>{userData.name}</h6>
          </div>
          <div className='flex items-center'>
            <FaSignOutAlt
              className='text-2xl cursor-pointer'
              onClick={() => signOut({ callbackUrl: '/' })}
            />
            <p className='ml-2 font-medium'> Sign Out</p>
          </div>

          {isCurrentUser && (
            <div className='mt-6 text-center'>
              <label
                className='inline-flex cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-gray-100 px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:border-tertiary-dark dark:bg-tertiary-dark dark:text-white'
                tabIndex={0}
                role='button'
                aria-label='Select profile image'
                onKeyDown={handleLabelKeyDown}
              >
                Select profile image
                <input
                  type='file'
                  accept='image/*'
                  className='sr-only'
                  onChange={handleProfileImageChange}
                />
              </label>

              {selectedProfileImagePreview && (
                <div className='mx-auto mt-4 w-24 h-24 overflow-hidden rounded-full border border-gray-200 dark:border-tertiary-dark'>
                  <img
                    src={selectedProfileImagePreview}
                    alt='Profile preview'
                    className='h-full w-full object-cover'
                  />
                </div>
              )}

              {selectedProfileImage && (
                <button
                  type='button'
                  onClick={uploadProfileImage}
                  disabled={isUploadingImage}
                  className='mt-4 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-black transition duration-200 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:text-white'
                >
                  {isUploadingImage ? 'Uploading…' : 'Upload image'}
                </button>
              )}
            </div>
          )}
        </div>

        <div className='md:col-span-8 lg:col-span-9 col-span-1'>
          <div className='flex items-center'>
            <h5 className='text-2xl font-bold mr-3'>Hello, {userData.name}</h5>
          </div>
          <div className='md:hidden w-14 h-14 rounded-full overflow-hidden'>
            <Image
              className='img scale-animation rounded-full'
              width={56}
              height={56}
              src={profileImage}
              alt='User Name'
            />
          </div>
          {isCurrentUser && (
            <div className='md:hidden mt-4 flex flex-col items-start gap-3'>
              <label
                className='inline-flex cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-gray-100 px-5 py-3 text-sm font-medium transition hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:border-tertiary-dark dark:bg-tertiary-dark dark:text-white'
                tabIndex={0}
                role='button'
                aria-label='Pick profile image'
                onKeyDown={handleLabelKeyDown}
              >
                Pick profile image
                <input
                  type='file'
                  accept='image/*'
                  className='sr-only'
                  onChange={handleProfileImageChange}
                />
              </label>

              {selectedProfileImagePreview && (
                <div className='w-20 h-20 overflow-hidden rounded-full border border-gray-200 dark:border-tertiary-dark'>
                  <img
                    src={selectedProfileImagePreview}
                    alt='Profile preview'
                    className='h-full w-full object-cover'
                  />
                </div>
              )}

              {selectedProfileImage && (
                <button
                  type='button'
                  onClick={uploadProfileImage}
                  disabled={isUploadingImage}
                  className='rounded-full bg-primary px-4 py-2 text-xs font-semibold text-black transition duration-200 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:text-white'
                >
                  {isUploadingImage ? 'Uploading…' : 'Upload'}
                </button>
              )}
            </div>
          )}
          {/* <p className='block w-fit md:hidden text-sm py-2'>
            {userData.about ?? ''}
          </p>

          <p className='text-xs py-2 font-medium'>
            Joined In {userData._createdAt.split('T')[0]}
          </p> */}
          <div className='md:hidden flex items-center my-2'>
            <FaSignOutAlt
              className='text-2xl cursor-pointer'
              onClick={() => signOut({ callbackUrl: '/' })}
            />
            <p className='ml-2 font-medium'>Sign out</p>
          </div>

          <nav className='sticky top-0 px-2 w-fit mx-auto md:w-full md:px-5 py-3 mb-8 text-[#1e1e1e] dark:text-white border-2 border-gray-200 dark:border-tertiary-dark rounded-lg bg-white dark:bg-black mt-7'>
            <ol
              className={`${currentNav === 'bookings' ? 'text-tertiary-dark' : 'text-[#1e1e1e] dark:text-white'
                } inline-flex mr-1 md:mr-5 items-center space-x-1 md:space-x-3`}
            >
              <li
                onClick={() => setCurrentNav('bookings')}
                className='inline-flex items-center cursor-pointer'
              >
                <BsJournalBookmarkFill />
                <a className='inline-flex items-center mx-1 md:mx-3 text-xs md:text-sm font-bold'>
                  Current Bookings
                </a>
              </li>
            </ol>
            <ol
              className={`${currentNav === 'amount' ? 'text-tertiary-dark' : 'text-[#1e1e1e] dark:text-white'
                } inline-flex mr-1 md:mr-5 items-center space-x-1 md:space-x-3`}
            >
              {/* <li
                onClick={() => setCurrentNav('amount')}
                className='inline-flex items-center cursor-pointer'
              >
                <GiMoneyStack />
                <a className='inline-flex items-center mx-1 md:mx-3 text-xs md:text-sm font-medium'>
                  Amount Spent
                </a>
              </li> */}
            </ol>
          </nav>

          {currentNav === 'bookings' ? (
            userBookings && (
              <Table 
                bookingDetails={userBookings}
                setRoomId={setRoomId}
                toggleRatingModal={toggleRatingModal}
              />
            )
          ) : (
            <></>
          )}

          {currentNav === 'amount' ? (
            userBookings && <Chart userBookings={userBookings} />
          ) : (
            <></>
          )}
        </div>
      </div>

      <RatingModal
        isOpen={isRatingVisible}
        ratingValue={ratingValue}
        setRatingValue={setRatingValue}
        ratingText={ratingText}
        setRatingText={setRatingText}
        isSubmittingReview={isSubmittingReview}
        reviewSubmitHandler={reviewSubmitHandler}
        toggleRatingModal={toggleRatingModal}
      />
      <BackDrop isOpen={isRatingVisible} />
    </div>
  );
};

export default UserDetails;