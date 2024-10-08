type CoverImage = {
    url: string;
};

type Image = {
    _key: string;
    url: string;
}; 

type Amenity = {
    _key: string;
    amenity: string;
    icon: string;
};

type Slug = {
    _type: string;
    current: string;
}

export type Room = {
    _id: string;
    coverImage: CoverImage;
    description: string;
    images: Image[];
    dimension: string;
    discount: number;
    isBooked: boolean;
    isFeatured: boolean;
    name: string;
    numberOfBeds: number;
    offeredAmenities: Amenity[];
    price: number;
    slug: Slug;
    specialNote: string;
    type: string;
    
}