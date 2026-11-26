import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { API_OPTIONS, GEMINI_MODEL } from "../utils/constants";
import lang from "../utils/languageConstants";
import { addGptMovieResult } from "../utils/gptSlice";

const GptSearchBar = () => {
  const dispatch = useDispatch();
  const langKey = useSelector((store) => store.config?.lang) || "en";
  const searchText = useRef(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [fallbackNotice, setFallbackNotice] = useState("");

  const searchMovieTMDB = async (movie) => {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
        movie
      )}&include_adult=false&language=en-US&page=1`,
      API_OPTIONS
    );
    const json = await response.json();
    return json.results || [];
  };

  const getGeminiMovieNames = async (query) => {
    const geminiKey = process.env.REACT_APP_GEMINI_KEY;
    if (!geminiKey) {
      throw new Error("MISSING_GEMINI_KEY");
    }

    const activeModel =
      process.env.REACT_APP_GEMINI_MODEL || GEMINI_MODEL || "gemini-3.5-flash-lite";

    const prompt = `Act as a movie recommendation system and suggest only 5 movies for the query: "${query}". Return ONLY 5 comma-separated movie names like this example: Gadar, Sholay, Don, Golmaal, Koi Mil Gaya. Do not include numbers, bullet points, or extra text.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": geminiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      const message =
        errJson?.error?.message || `Gemini request failed (${response.status})`;
      throw new Error(message);
    }

    const data = await response.json();
    const rawText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    const names = rawText
      .split(",")
      .map((name) => name.replace(/^[\d.\-*)\s]+/, "").trim())
      .filter(Boolean);

    if (names.length === 0) {
      throw new Error("Gemini returned no movie titles.");
    }

    return names;
  };

  const handleGptSearchClick = async (e) => {
    e.preventDefault();
    const query = searchText.current?.value?.trim();
    if (!query) return;

    setLoading(true);
    setErrorMsg("");
    setFallbackNotice("");

    try {
      let movieNames = [];

      try {
        movieNames = await getGeminiMovieNames(query);
      } catch (geminiError) {
        const directMatches = await searchMovieTMDB(query);
        if (!directMatches.length) {
          throw geminiError;
        }

        dispatch(
          addGptMovieResult({
            movieNames: [query],
            movieResults: [directMatches],
          })
        );

        setFallbackNotice(
          geminiError.message === "MISSING_GEMINI_KEY"
            ? "Showing direct TMDB results (add REACT_APP_GEMINI_KEY to .env for AI picks)."
            : `Showing direct TMDB results (${geminiError.message}).`
        );
        return;
      }

      const promiseArray = movieNames.map((movie) => searchMovieTMDB(movie));
      const tmdbResults = await Promise.all(promiseArray);

      dispatch(
        addGptMovieResult({
          movieNames,
          movieResults: tmdbResults,
        })
      );
    } catch (err) {
      setErrorMsg(err.message || "Unable to complete search.");
    } finally {
      setLoading(false);
    }
  };

  const currentLang = lang[langKey] || lang.en || {
    gptSearchPlaceholder: "What would you like to watch today?",
    search: "Search",
  };

  return (
    <div className="pt-[35%] md:pt-[10%] flex flex-col items-center px-4">
      <form
        onSubmit={handleGptSearchClick}
        className="w-full md:w-1/2 bg-black/80 grid grid-cols-12 rounded-lg overflow-hidden border border-gray-800"
      >
        <input
          ref={searchText}
          type="text"
          className="p-4 col-span-9 bg-white text-black outline-none"
          placeholder={currentLang.gptSearchPlaceholder}
        />
        <button
          type="submit"
          disabled={loading}
          className="col-span-3 py-2 px-4 bg-red-700 hover:bg-red-800 disabled:opacity-60 text-white font-semibold cursor-pointer"
        >
          {loading ? "..." : currentLang.search}
        </button>
      </form>

      {fallbackNotice && (
        <p className="mt-3 text-xs md:text-sm text-yellow-300 bg-yellow-950/75 border border-yellow-700/60 px-4 py-2 rounded">
          {fallbackNotice}
        </p>
      )}

      {errorMsg && (
        <p className="mt-3 text-xs md:text-sm text-red-300 bg-red-950/80 border border-red-700 px-4 py-2 rounded">
          {errorMsg}
        </p>
      )}
    </div>
  );
};

export default GptSearchBar;