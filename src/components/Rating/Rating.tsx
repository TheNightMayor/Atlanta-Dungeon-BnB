import { FC, Fragment } from 'react';
import { FaStar, FaStarHalf } from 'react-icons/fa';

type Props = {
    rating: number;
};

const Rating: FC<Props> = ({ rating }) => {
    const fullStars = Math.floor(rating);
    const decimalPart = rating - fullStars;

    const fullStarElements = Array.from({ length: fullStars }, (_, index) => (
        <FaStar key={`full-star-${index}`} />
    ));

    const halfStarElement = decimalPart > 0 ? <FaStarHalf key="half-star" /> : null;

    return (
        <Fragment>
            {fullStarElements}
            {halfStarElement}
        </Fragment>
    );
};

export default Rating;