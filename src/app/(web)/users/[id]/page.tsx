'use client';

import useSWR, { mutate } from 'swr';
import { FaSignOutAlt } from 'react-icons/fa';
import Image from 'next/image';
import axios from 'axios';
import { signOut, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

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
import { Booking } from '@/models/booking';

const MAX_ID_DOCUMENT_BYTES = 10 * 1024 * 1024;
const HEIC_IMAGE_TYPES = new Set(['image/heic', 'image/heif']);

const isHeicImage = (file: File) =>
  HEIC_IMAGE_TYPES.has(file.type.toLowerCase()) || /\.hei[cf]$/i.test(file.name);

const prepareIdDocumentForUpload = async (file: File) => {
  if (file.size > MAX_ID_DOCUMENT_BYTES) {
    throw new Error('ID document must be 10 MB or smaller.');
  }

  if (!isHeicImage(file)) return file;

  const { default: heic2any } = await import('heic2any');
  const converted = await heic2any({
    blob: file,
    toType: 'image/jpeg',
    quality: 0.9,
  });
  const convertedBlob = Array.isArray(converted) ? converted[0] : converted;

  return new File(
    [convertedBlob],
    `${file.name.replace(/\.hei[cf]$/i, '') || 'id-document'}.jpg`,
    { type: 'image/jpeg' }
  );
};

const UserDetails = (props: { params: Promise<{ id: string }> }) => {
  const { data: session } = useSession();
  const { id: userId } = use(props.params);
  const router = useRouter();
  const searchParams = useSearchParams();

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

  // Fetch via our server endpoint so authentication/session is respected
  const fetchUserBooking = async () => {
    const res = await fetch('/api/userbooking');
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`Failed to fetch user bookings: ${res.status} ${txt}`);
    }
    return res.json();
  };
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

  useEffect(() => {
    if (searchParams?.get('paymentSuccess') === 'true') {
      toast.success('Payment successful! Your booking is pending approval.');
      const cleanUrl = window.location.pathname;
      router.replace(cleanUrl);
    }
  }, [router, searchParams]);

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
      const idDocument = await prepareIdDocumentForUpload(selectedIdImage);
      const formData = new FormData();
      formData.append('idDocument', idDocument);

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
      toast.error(err instanceof Error ? err.message : 'Failed to upload ID document');
    } finally {
      setIsUploadingId(false);
    }
  };

  // Use a user-specific SWR key so cached results don't leak between profiles
  const swrKey = userId ? ['/api/userbooking', userId] : null;
  const {
    data: userBookings,
    error,
    isLoading,
  } = useSWR<Booking[]>(swrKey, fetchUserBooking);


  const {
    data: userData,
    isLoading: loadingUserData,
    error: errorGettingUserData,
  } = useSWR('/api/users', fetchUserData);

  const upcomingBookings = (userBookings ?? [])
    .map((booking) => ({
      ...booking,
      // parse YYYY-MM-DD as local date to avoid UTC parsing shifts
      checkinDateObj: booking.checkinDate
        ? (() => {
            const datePart = booking.checkinDate.split('T')[0];
            const [y, m, d] = datePart.split('-').map((s) => Number(s));
            return new Date(y, m - 1, d);
          })()
        : null,
    }))
    .filter((booking) => {
      if (!booking.checkinDateObj) return false;
      const checkin = new Date(booking.checkinDateObj);
      checkin.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return checkin >= today;
    })
    .sort((a, b) => a.checkinDateObj!.toISOString().localeCompare(b.checkinDateObj!.toISOString()));

  const formatBookingDate = (date: string) => {
    const [year, month, day] = date.split('T')[0].split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString();
  };

  // Debugging: log bookings and computed upcoming bookings to help trace missing entries
  // This is moved below `isCurrentUser` declaration to avoid referencing uninitialized variables.

  

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

    // (debug logs removed)


  return (
    <div className='container mx-auto px-2 md:px-4 pt-2 md:pt-2 py-10 min-h-[67vh] bg-white text-[#1e1e1e] dark:bg-black dark:text-white'>
      <div className='flex flex-col-reverse md:flex-row items-start md:items-stretch justify-between mb-10'>
        <div className='flex flex-col md:w-1/4 w-full h-full'>
          <div className='md:flex md:flex-col md:items-center top-10 bg-white text-[#1e1e1e] dark:bg-black dark:text-white rounded-lg py-8 border-2 border-tertiary-dark'>
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
                    accept='image/jpeg,image/png,image/webp,image/heic,image/heif'
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
        <div className='md:ml-6 container rounded-lg items-start justify-start w-full md:w-3/4 p-2 h-full'>
          <section className='p-4 bg-white dark:bg-black border-2 border-tertiary-dark rounded-lg shadow-sm'>
            <ProfileProgress
              createdAt={userData._createdAt}
              profileImageUploaded={Boolean(userData.imageUrl || userData.image)}
              idUploaded={Boolean(userData.idDocumentUrl || userData.idDocument)}
              idVerified={Boolean(userData.idVerified)}
            />
          </section>

          <section className='mt-6 p-4 bg-white dark:bg-black border-2 border-tertiary-dark rounded-lg shadow-sm'>
            <div className='flex items-center justify-between mb-4'>
              <div>
                <p className='text-sm text-gray-500 dark:text-gray-300'>Upcoming booking</p>
                <h2 className='text-xl font-semibold'>Next stay</h2>
              </div>
              <span className='text-xs uppercase tracking-wide text-tertiary-dark'>
                {upcomingBookings.length} booked
              </span>
            </div>

            {upcomingBookings.length === 0 ? (
              <p className='text-sm text-gray-600 dark:text-gray-300'>
                No upcoming bookings yet.
              </p>
            ) : (
              <div className='space-y-4'>
                {upcomingBookings.slice(0, 2).map((booking) => {
                  const status = booking.status ?? 'pending approval';
                  const statusClass =
                    status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : status === 'rejected'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-tertiary-light text-white dark:bg-[#2c2734] dark:text-white border border-tertiary-dark';

                  return (
                    <div key={booking._id} className='rounded-2xl border-2 border-tertiary-dark p-4 bg-gray-50 dark:bg-slate-950'>
                      <div className='flex items-start justify-between gap-4'>
                        <div>
                          <p className='text-sm text-gray-500 dark:text-gray-400'>Room</p>
                          <p className='text-base font-semibold text-gray-900 dark:text-white'>
                            {booking.hotelRoom.name}
                          </p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </div>
                      {status === 'pending approval' ? (
                        <p className='mt-3 text-sm text-tertiary-dark dark:text-tertiary-light'>
                          Payment pending booking approval, can take up to 24 hours.
                        </p>
                      ) : null}
                      <div className='mt-3 grid gap-2 sm:grid-cols-2'>
                        <div>
                          <p className='text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400'>Check-in</p>
                          <p className='text-sm text-gray-900 dark:text-white'>
                            {formatBookingDate(booking.checkinDate)}
                          </p>
                        </div>
                        <div>
                          <p className='text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400'>Check-out</p>
                          <p className='text-sm text-gray-900 dark:text-white'>
                            {formatBookingDate(booking.checkoutDate)}
                          </p>
                        </div>
                      </div>
                      <div className='mt-4 flex items-center justify-between'>
                        <p className='text-sm font-medium text-tertiary-dark'>${booking.totalPrice}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;