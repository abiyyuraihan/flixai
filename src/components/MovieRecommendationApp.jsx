import React, { useState, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  Film,
  Star,
  Calendar,
  Clapperboard,
  UserCircle,
  ChevronDown,
  Check,
} from "lucide-react";

const MovieRecommendationApp = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [movies, setMovies] = useState([]);
  const [genreDropdownOpen, setGenreDropdownOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const resultsRef = useRef(null);

  const initializeAI = () => {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "API key tidak dikonfigurasi. Pastikan environment variable REACT_APP_GEMINI_API_KEY telah diatur."
      );
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      return genAI.getGenerativeModel({ model: "gemini-pro" });
    } catch (error) {
      throw new Error(`Gagal menginisialisasi Gemini AI: ${error.message}`);
    }
  };

  const genres = [
    { id: "action", name: "Action" },
    { id: "adventure", name: "Adventure" },
    { id: "animation", name: "Animation" },
    { id: "comedy", name: "Comedy" },
    { id: "crime", name: "Crime" },
    { id: "documentary", name: "Documentary" },
    { id: "drama", name: "Drama" },
    { id: "family", name: "Family" },
    { id: "fantasy", name: "Fantasy" },
    { id: "history", name: "Historical" },
    { id: "horror", name: "Horror" },
    { id: "music", name: "Music" },
    { id: "mystery", name: "Mystery" },
    { id: "romance", name: "Romance" },
    { id: "scifi", name: "Science Fiction" },
    { id: "sports", name: "Sports" },
    { id: "thriller", name: "Thriller" },
    { id: "war", name: "War" },
    { id: "western", name: "Western" },
  ];

  const languages = [
    { code: "id", name: "Indonesia" },
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "hi", name: "Hindi" },
    { code: "ja", name: "Japanese" },
    { code: "ko", name: "Korean" },
  ];

  const toggleGenre = (genreId) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId]
    );
  };

  const safeParseJSON = (jsonString) => {
    try {
      const cleanedJson = jsonString
        .replace(/^[^{]*/, "")
        .replace(/[^}]*$/, "")
        .replace(/```json\s*/, "")
        .replace(/```\s*$/, "")
        .trim();

      const parsed = JSON.parse(cleanedJson);

      if (parsed && parsed.movies && Array.isArray(parsed.movies)) {
        return parsed.movies;
      }

      throw new Error("Invalid JSON structure");
    } catch (error) {
      console.error("JSON Parsing Error:", error);
      console.error("Raw response:", jsonString);
      throw new Error(
        `Failed to parse movie recommendations: ${error.message}`
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedGenres.length === 0 || !selectedLanguage) return;

    setLoading(true);
    setError(null);
    setMovies([]);

    const MAX_RETRIES = 3;
    let retries = 0;

    while (retries < MAX_RETRIES) {
      try {
        const model = initializeAI();
        const prompt = `
        PENTING: Jawab PERSIS dalam format JSON yang valid. 
DILARANG menambahkan komentar atau teks di luar struktur JSON.


        Berikan 5 rekomendasi film berkualitas tinggi dengan kriteria berikut:
- Genre: ${selectedGenres.join(", ")}
- Bahasa: ${languages.find((l) => l.code === selectedLanguage)?.name}

Format jawaban HARUS dalam JSON yang valid dengan struktur berikut:
{
  "movies": [
    {
      "title": "Judul Film",
      "synopsis": "Sinopsis singkat dan menarik (maks 100 kata)",
      "director": "Nama Sutradara",
      "mainCast": ["Pemain 1", "Pemain 2", "Pemain 3"],
      "rating": 8.5,
      "releaseYear": 2023,
      "additionalDetails": "Informasi tambahan menarik tentang film"
    }
  ]
}

Pastikan:
- Film benar-benar sesuai genre yang diminta
- Pilih film yang berkualitas dan menarik
- Informasi akurat dan up-to-date`;

        const result = await model.generateContent(prompt);
        const responseText = await result.response.text();

        const parsedMovies = safeParseJSON(responseText);
        setMovies(parsedMovies);
        break;
      } catch (error) {
        console.error("Error generating movie recommendations:", error);
        setError(`Terjadi kesalahan: ${error.message}`);

        setMovies([
          {
            title: "Film Rekomendasi",
            synopsis: "Maaf, saat ini tidak dapat menghasilkan rekomendasi.",
            director: "-",
            mainCast: ["-"],
            rating: 0,
            releaseYear: new Date().getFullYear(),
          },
        ]);
      }
    }

    setLoading(false);
    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="w-screen min-h-screen bg-black text-white flex flex-col items-center font-sans">
      <div className="w-full max-w-6xl bg-black shadow-2xl p-6">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Clapperboard className="text-8xl text-red-500" />
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
              Flix.AI
            </h1>
          </div>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto">
            Temukan Rekomendasi Film Sesuai Selera Anda
          </p>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-900/30 border border-red-700 rounded-2xl text-red-300">
            {error}
          </div>
        )}

        <div className="max-w-3xl mx-auto mb-10 bg-[#2a2a2a] border border-gray-800 p-10 rounded-3xl shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="relative">
              <label className="block text-gray-300 mb-3 text-sm font-semibold uppercase tracking-wider">
                Pilih Genre Film
              </label>
              <button
                type="button"
                onClick={() => setGenreDropdownOpen(!genreDropdownOpen)}
                className="w-full flex items-center justify-between bg-[#3a3a3a] border border-gray-700 rounded-xl px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <span className="text-gray-300">
                  {selectedGenres.length > 0
                    ? `${selectedGenres.length} genre(s) terpilih`
                    : "Pilih Genre"}
                </span>
                <ChevronDown
                  className={`transform transition-transform ${
                    genreDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {genreDropdownOpen && (
                <div className="absolute z-10 mt-2 w-full bg-[#3a3a3a] border border-gray-700 rounded-xl shadow-2xl max-h-64 overflow-y-auto">
                  <div className="p-4 grid grid-cols-3 gap-2">
                    {genres.map((genre) => (
                      <label
                        key={genre.id}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-800 p-2 rounded-lg transition-colors group"
                      >
                        <input
                          type="checkbox"
                          checked={selectedGenres.includes(genre.id)}
                          onChange={() => toggleGenre(genre.id)}
                          className="hidden"
                        />
                        <span
                          className={`w-5 h-5 border rounded transition-colors 
                            ${
                              selectedGenres.includes(genre.id)
                                ? "bg-red-500 border-red-500"
                                : "border-gray-600 group-hover:border-gray-500"
                            }`}
                        >
                          {selectedGenres.includes(genre.id) && (
                            <Check className="text-white" size={16} />
                          )}
                        </span>
                        <span className="text-gray-300 group-hover:text-white">
                          {genre.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <label className="block text-gray-300 mb-3 text-sm font-semibold uppercase tracking-wider">
                Bahasa Dalam Film
              </label>
              <button
                type="button"
                onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                className="w-full flex items-center justify-between bg-[#3a3a3a] border border-gray-700 rounded-xl px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <span className="text-gray-300">
                  {selectedLanguage
                    ? languages.find((l) => l.code === selectedLanguage)?.name
                    : "Pilih Bahasa"}
                </span>
                <ChevronDown
                  className={`transform transition-transform ${
                    languageDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {languageDropdownOpen && (
                <div className="absolute z-10 mt-2 w-full bg-[#3a3a3a] border border-gray-700 rounded-xl shadow-2xl">
                  <div className="p-4 grid grid-cols-3 gap-2">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          setSelectedLanguage(lang.code);
                          setLanguageDropdownOpen(false);
                        }}
                        className={`px-4 py-2 rounded-lg text-sm transition-colors text-left
                          ${
                            selectedLanguage === lang.code
                              ? "bg-red-500 text-white"
                              : "bg-transparent text-gray-300 hover:bg-gray-800"
                          }`}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={
                selectedGenres.length === 0 || !selectedLanguage || loading
              }
              className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-2xl font-bold uppercase tracking-wider transition-all transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-red-500/50"
            >
              {loading ? "Mencari Film Terbaik..." : "Mencari Film"}
            </button>
          </form>
        </div>

        {movies.length > 0 && (
          <div ref={resultsRef} className="space-y-8">
            {movies.map((movie, index) => (
              <div
                key={index}
                className="bg-[#2a2a2a] border border-gray-700 rounded-xl shadow-lg p-6"
              >
                <div className="flex gap-6">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-red-500 mb-4">
                      {movie.title}
                    </h2>
                    <p className="text-gray-300 mb-4">{movie.synopsis}</p>

                    <div className="grid grid-cols-2 gap-4 text-gray-400">
                      <div className="flex items-center gap-2">
                        <UserCircle className="text-red-600" size={20} />
                        <span>Sutradara: {movie.director}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <UserCircle className="text-red-600" size={20} />
                        <span>Pemain: {movie.mainCast.join(", ")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="text-red-600" size={20} />
                        <span>Rating: {movie.rating} / 10</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="text-red-600" size={20} />
                        <span>Tahun: {movie.releaseYear}</span>
                      </div>
                    </div>

                    {movie.additionalDetails && (
                      <div className="mt-4 text-gray-300 italic">
                        "{movie.additionalDetails}"
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieRecommendationApp;
