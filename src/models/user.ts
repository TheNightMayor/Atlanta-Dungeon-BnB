export type UserImage =
    | string
    | {
            url?: string;
            [key: string]: unknown;
        }
    | null;

export type User = {
        _id: string;
        name: string;
        email: string;
        isAdmin: boolean;
        about: string | null;
        _createdAt: string;
    image: UserImage;
    imageUrl?: string | null;
    idDocument?: UserImage;
    idDocumentUrl?: string | null;
};