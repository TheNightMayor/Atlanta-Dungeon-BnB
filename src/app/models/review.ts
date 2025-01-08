export type UpdateReviewDto = {
    reviewId: string;
    reviewText: string;
    userRating: number;
};

export type CreateReviewDto = {
    hotelRoomId: string;
    reviewText: string;
    userRating: number;
    userId: string;
}