import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedMovie } from "../utils/moviesSlice";
import { API_OPTIONS } from "../utils/constants";

const BACKDROP_URL = "https://image.tmdb.org/t/p/w1280";

const MovieModal = () => {
  const dispatch = useDispatch();
  const movie = useSelector((store) => store.movies.selectedMovie);
  const [trailerKey, setTrailerKey] = useState(null);

  const close = () => dispatch(setSelectedMovie(null));

  // Fetch this movie's trailer
  useEffect(() => {
    if (!movie) return;
    setTrailerKey(null);

    const getTrailer = async () => {
      try {
        const data = await fetch(
          `https://api.themoviedb.org/3/movie/${movie.id}/videos?language=en-US`,
          API_OPTIONS
        );
        const json = await data.json();
        const results = json.results || [];
        const trailer =
          results.find((v) => v.type === "Trailer") || results[0];
        setTrailerKey(trailer?.key || null);
      } catch (e) {
        setTrailerKey(null);
      }
    };
    getTrailer();
  }, [movie]);

  // Close on Escape key
  useEffect(() => {
    if (!movie) return;
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [movie]);

  if (!movie) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4"
      onClick={close}
    >
      <div
        className="relative bg-zinc-900 text-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={close}
          className="absolute top-3 right-3 z-10 bg-black bg-opacity-70 w-10 h-10 rounded-full text-xl hover:bg-opacity-100"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Trailer, or backdrop image if there's no trailer */}
        <div className="aspect-video w-full bg-black">
          {trailerKey ? (
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=0`}
              title={movie.title}
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
            ></iframe>
          ) : movie.backdrop_path ? (
            <img
              className="w-full h-full object-cover"
              src={BACKDROP_URL + movie.backdrop_path}
              alt={movie.title}
            />
          ) : null}
        </div>

        <div className="p-6">
          <h2 className="text-3xl font-bold">{movie.title}</h2>

          <div className="flex flex-wrap gap-4 py-3 text-sm text-gray-300">
            {movie.vote_average > 0 && (
              <span className="text-green-400 font-semibold">
                ★ {movie.vote_average.toFixed(1)}
              </span>
            )}
            {movie.release_date && <span>{movie.release_date}</span>}
            {movie.original_language && (
              <span className="uppercase border px-1 rounded">
                {movie.original_language}
              </span>
            )}
          </div>

          <p className="text-gray-200 leading-relaxed">
            {movie.overview || "No description available."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MovieModal;