import { HiStar, HiOutlineStar } from 'react-icons/hi';

const StarRating = ({ rating = 0, onRate, interactive = false, size = 16 }) => {
  return (
    <div className="star-rating" style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => interactive && onRate?.(star)}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
          {star <= rating ? <HiStar /> : <HiOutlineStar className="star-rating--muted" />}
        </span>
      ))}
    </div>
  );
};

export default StarRating;
