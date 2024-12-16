import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MovieRecommendationApp from "./components/MovieRecommendationApp";

function App() {
  return (
    <div className="container">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MovieRecommendationApp />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
