import { groq } from "next-sanity";

export const getRoomsQuery = groq`*[_type == "hotelRoom" && visibleToUsers == true] {
    _id,
    _updatedAt,
        coverImage {
            "url": image.asset->url,
            image,
            "assetRef": image.asset._ref
        },
        description,
        discount,
        flatFee,
        images[]{
            "url": image.asset->url,
            image
        },
    instantBook,
    overnight,
    name,
    price,
    slug,
    type
}`;

export const getRoom = groq`*[_type == "hotelRoom" && slug.current == $slug][0] {
    _id,
    _updatedAt,
        coverImage {
            "url": image.asset->url,
            image,
            "assetRef": image.asset._ref
        },
        description,
        discount,
        flatFee,
        images[]{
            "url": image.asset->url,
            image
        },
    instantBook,
    overnight,
    name,
    offeredAmenities,
    price,
    slug,
    specialNote,
    type
}`;

export const getUserBookingsQuery = groq`*[_type == 'booking' && (
        user._ref == $userId ||
        user._id == $userId ||
        user->email == $userId ||
        user.email == $userId ||
        user->name == $userId ||
        user.name == $userId
    ) && status != "deleted"] | order(checkinDate asc) {
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
    totalPrice,
    discount,
    discountCode,
    amountPaid,
    paymentReceivedAt,
    refundedAmount,
    refundedAt,
    deletedAt,
    deletedBy,
    status,
    stripeSessionId,
    stripePaymentIntentId,
    customerEmail,
    customerName
}`;

export const getBookingByIdQuery = groq`*[_type == 'booking' && _id == $bookingId][0] {
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
    user-> { _id, name, email },
    totalPrice,
    amountPaid,
    paymentReceivedAt,
    refundedAmount,
    refundedAt,
    deletedAt,
    deletedBy,
    discount,
    discountCode,
    status,
    stripeSessionId,
    stripePaymentIntentId,
    customerEmail,
    customerName
}`;

export const getUserDataQuery = groq`*[_type == 'user' && (
    _id == $userId ||
    email == $userId ||
    name == $userId
  )][0] {
    _id,
    name,
    email,
    isAdmin,
    about,
    _createdAt,
    image,
    idVerified,
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

export const getRandomReviewsQuery = groq`*[_type == "review"] {
        _createdAt,
        _id,
        text,
        user->{name},
        userRating,
        hotelRoom-> {_id, name, slug}
}`;

export const getRoomBookingsQuery = groq`*[_type == "booking" && hotelRoom._ref == $roomId && status != "rejected" && status != "deleted" && status != "cancelled" && status != "refunded"] {
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

export const getInfoPageByTitleQuery = groq`*[_type == "infoPage" && title == $title][0] {
    internalName,
    title,
    content
}`;
