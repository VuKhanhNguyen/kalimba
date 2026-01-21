import "./App.css";
import React, { Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import PlayKalimbaPage from "./components/pages/PlayKalimbaPage.jsx";
import InstructionsPage from "./components/pages/InstructionsPage.jsx";
import RouteChangeLoader from "./components/commons/RouteChangeLoader.jsx";
import PageLoaderOverlay from "./components/commons/PageLoaderOverlay.jsx";

function App() {
  return (
    <>
      <BrowserRouter>
        <RouteChangeLoader />
        <Suspense fallback={<PageLoaderOverlay />}>
          <Routes>
            <Route path="/" element={<PlayKalimbaPage />} />
            <Route path="/instructions" element={<InstructionsPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  );
}

export default App;
