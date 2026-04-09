import { groq } from "next-sanity";

export const getFeaturedRoomQuery = groq`*[_type == "hotelRoom" && isFeatured == true][0] {
    _id,
    description,
    discount,
    flatFee,
    images,
    isFeatured,
    overnight,
    name,
    price,
    slug,
    coverImage
}`;

export const getRoomsQuery = groq`*[_type == "hotelRoom" && visibleToUsers == true] {
    _id, 
    coverImage,
    description,
    discount,
    flatFee,
    images,
    instantBook,
    overnight,
    isFeatured,
    name,
    price,
    slug,
    type
}`;

export const getRoom = groq`*[_type == "hotelRoom" && slug.current == $slug][0] {
    _id,
    coverImage,
    description,
    discount,
    flatFee,
    images,
    instantBook,
    overnight,
    isFeatured,
    name,
    offeredAmenities,
    price,
    slug,
    specialNote,
    type
}`;

export const getUserBookingsQuery = groq`*[_type == 'booking' && user._ref == $userId] {
    _id,
    hotelRoom -> {
        _id,
        name,
        slug,
        price
    },
    checkinDate,
    checkoutDate,
    numberOfDays,
    adults,
    children,
    totalPrice,
    discount
}`;

export const getUserDataQuery = groq`*[_type == 'user' && _id == $userId][0] {
    _id,
    name,
    email,
    isAdmin,
    about,
    _createdAt,
    image,
    "imageUrl": coalesce(image.asset->url, image),
    idDocument,
    "idDocumentUrl": coalesce(idDocument.asset->url, idDocument),
}`;

export const getRoomReviewsQuery = groq`*[_type == "review" && hotelRoom._ref == $roomId] {
    _createdAt,
    _id,
    text,
    user -> {
        name
    },
    userRating
}`;

export const getRoomBookingsQuery = groq`*[_type == "booking" && hotelRoom._ref == $roomId] {
    _createdAt,
    _id,
    hotelRoom -> {
        name
    },
    checkinDate,
    checkoutDate,
    user -> {
        name
    }
        }`;

export const getInfoPageQuery = groq`*[_type == "infoPage"][0] {
    internalName,
    title,
    content
}`;

export const getInfoPageByInternalNameQuery = groq`*[_type == "infoPage" && internalName == $internalName][0] {
    internalName,
    title,
    content
}`;
