import { useDispatch } from "react-redux";
import { IMG_CDN_URL } from "../utils/constants";
import { setSelectedMovie } from "../utils/moviesSlice";

const MovieCard = ({ movie }) => {
  const dispatch = useDispatch();

  if (!movie?.poster_path) return null;

  return (
    <div
      className="w-36 md:w-48 pr-4 shrink-0 cursor-pointer transition-transform duration-300 hover:scale-110 hover:z-10"
      onClick={() => dispatch(setSelectedMovie(movie))}
    >
      <img
        className="rounded-md"
        alt={movie.title}
        src={IMG_CDN_URL + movie.poster_path}
        loading="lazy"
      />
    </div>
  );
};

export default MovieCard;