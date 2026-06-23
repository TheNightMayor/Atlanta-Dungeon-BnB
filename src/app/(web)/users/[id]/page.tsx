'use client';

import useSWR, { mutate } from 'swr';
import { FaSignOutAlt } from 'react-icons/fa';
import Image from 'next/image';
import axios from 'axios';
import { signOut, useSession } from 'next-auth/react';

import { getUserBookings } from '@/libs/apis';
import LoadingSpinner from '../../loading';
import { useState, useEffect, useRef, type ChangeEvent, type KeyboardEvent } from 'react';
import { use } from 'react';
import { BsJournalBookmarkFill } from 'react-icons/bs';
import Table from '@/components/Table/Table';
import RatingModal from '@/components/RatingModal/RatingModal';
import BackDrop from '@/components/BackDrop/BackDrop';
import ProfileProgress from '@/components/ProfileProgress/ProfileProgress';
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
  const [selectedIdImage, setSelectedIdImage] = useState<File | null>(null);
  const [selectedIdImagePreview, setSelectedIdImagePreview] = useState<string | null>(null);
  const [isUploadingId, setIsUploadingId] = useState(false);
  const profileInputRef = useRef<HTMLInputElement | null>(null);
  const idInputRef = useRef<HTMLInputElement | null>(null);

  const toggleRatingModal = () => setIsRatingVisible(prevState => !prevState);

  const reviewSubmitHandler = async () => {
    if (!ratingText.trim().length || !ratingValue) {
      return toast.error('Please provide a rating text and a rating');
    }

    if (!roomId) toast.error('Id not provided');

    setIsSubmittingReview(true)

      try {
        await axios.post('/api/users', {
          reviewText: ratingText,
          ratingValue,
          roomId,
        });
        toast.success('Review Submitted');
      } catch (error) {
        console.error(error);
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
      if (selectedIdImagePreview) {
        URL.revokeObjectURL(selectedIdImagePreview);
      }
    };
  }, [selectedProfileImagePreview, selectedIdImagePreview]);

  const handleIdImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedIdImage(file);
    setSelectedIdImagePreview(file ? URL.createObjectURL(file) : null);
  };

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

  const uploadIdDocument = async () => {
    if (!selectedIdImage) return;

    setIsUploadingId(true);
    try {
      const formData = new FormData();
      formData.append('idDocument', selectedIdImage);

      const res = await fetch('/api/users/id', { method: 'POST', body: formData });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Upload failed');
      }

      await mutate('/api/users');
      setSelectedIdImage(null);
      setSelectedIdImagePreview(null);
      toast.success('ID document uploaded');
    } catch (err) {
      console.error('ID upload failed', err);
      toast.error('Failed to upload ID document');
    } finally {
      setIsUploadingId(false);
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

  // Prefer an explicit `imageUrl` from the API, then fallback to the stored `image` value
  const userDataImageUrl = userData.imageUrl ?? (
    userData.image && typeof userData.image === 'string'
      ? userData.image
      : (userData.image as { url?: string } | null)?.url ?? null
  );

  const sessionUserImageUrl = (() => {
    const image = session?.user?.image;
    if (typeof image === 'string' && image.trim().length > 0) return image;
    const imgObj = image as { url?: string } | undefined;
    if (imgObj && typeof imgObj.url === 'string') return imgObj.url;
    return null;
  })();

  // Prefer the API-returned imageUrl (fresh after mutate), then session image, then default
  const profileImage = userDataImageUrl || sessionUserImageUrl || '/images/default-user.svg';

  const isCurrentUser = Boolean(
    session && (
      session.user?.id === userId ||
      session.user?.name === userId ||
      (session.user?.email && userData?.email && session.user.email === userData.email)
    )
  );



  return (
    <div className='container mx-auto px-2 md:px-4 pt-2 md:pt-2 py-10 min-h-[67vh] bg-white text-[#1e1e1e] dark:bg-black dark:text-white'>
      <div className='flex flex-col-reverse md:flex-row items-start md:items-stretch justify-between mb-10'>
        <div className='flex flex-col md:w-1/4 w-full h-full'>
          <div className='md:flex md:flex-col md:items-center top-10 bg-white text-[#1e1e1e] dark:bg-black dark:text-white rounded-lg py-8 border-2 border-gray-200 dark:border-tertiary-dark'>
            <div className='py-4 flex items-center justify-center'>
              <h5 className='text-2xl font-bold mr-3'>Hello, {userData.name}</h5>
            </div>
            <div className='md:w-48 w-32 h-32 md:h-48 mx-auto mb-5 rounded-full overflow-hidden border-2 border-tertiary-dark'>
              <Image
                src={profileImage}
                alt={userData.name}
                width={143}
                height={143}
                className='img rounded-full'
              />
            </div>

            {isCurrentUser && (
              <div className='flex flex-col items-center'>
                {/* Hidden input triggered by the visible button */}
                <input
                  ref={profileInputRef}
                  type='file'
                  accept='image/*'
                  className='sr-only'
                  onChange={handleProfileImageChange}
                  aria-hidden
                  tabIndex={-1}
                />

                <button
                  type='button'
                  className='btn-tertiary-action'
                  aria-label='Select profile image'
                  onClick={() => profileInputRef.current?.click()}
                >
                  Select profile image
                </button>

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
                    className='btn-tertiary-action mx-auto mt-4'
                  >
                    {isUploadingImage ? 'Uploading…' : 'Upload profile image'}
                  </button>
                )}

                <div className='mt-6'>
                  <input
                    ref={idInputRef}
                    type='file'
                    accept='image/*'
                    className='sr-only'
                    onChange={handleIdImageChange}
                    aria-hidden
                    tabIndex={-1}
                  />

                  {selectedIdImagePreview && (
                    <div className='mx-auto my-4 w-40 h-28 overflow-hidden rounded border border-gray-200 dark:border-tertiary-dark'>
                      <img src={selectedIdImagePreview} alt='ID preview' className='h-full w-full object-cover' />
                    </div>
                  )}

                  {userData.idDocumentUrl && !selectedIdImagePreview && (
                    <div className='mx-auto mt-4 w-48 h-32 overflow-hidden rounded-lg card-border'>
                      <img src={userData.idDocumentUrl} alt='Existing ID document' className='h-full w-full object-cover' />
                    </div>
                  )}

                  {selectedIdImage && (
                    <button
                      type='button'
                      onClick={uploadIdDocument}
                      disabled={isUploadingId}
                      className='my-4 rounded-full bg-secondary px-5 py-2 text-sm font-semibold text-black transition duration-200 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:text-white'
                    >
                      {isUploadingId ? 'Uploading…' : 'Upload ID Document'}
                    </button>
                  )}

                  <button
                    type='button'
                    className='btn-tertiary-action mt-4'
                    aria-label='Select ID document'
                    onClick={() => idInputRef.current?.click()}
                  >
                    Select ID document
                  </button>
                </div>
              </div>
            )}
          </div>
          <button type='button' className='btn-tertiary-action mt-4 flex items-center justify-center' onClick={() => signOut({ callbackUrl: '/' })}>
            <FaSignOutAlt className='text-2xl' />
            <p className='ml-2 font-medium'>Sign out</p>
          </button>
        </div>
        <div className='md:ml-6 container md:border-2 border-tertiary-dark rounded-lg items-start justify-start w-full md:w-3/4 p-2 h-full'>
            <ProfileProgress
              createdAt={userData._createdAt}
              profileImageUploaded={Boolean(userData.imageUrl || userData.image)}
              idUploaded={Boolean(userData.idDocumentUrl || userData.idDocument)}
              idVerified={Boolean(userData.idVerified)}
            />
        </div>
      </div>
    </div>
  );
};

export default UserDetails;