import "./App.css";
import React, { Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import PlayKalimbaPage from "./components/pages/PlayKalimbaPage.jsx";
import InstructionsPage from "./components/pages/InstructionsPage.jsx";
import RouteChangeLoader from "./components/commons/RouteChangeLoader.jsx";
import PageLoaderOverlay from "./components/commons/PageLoaderOverlay.jsx";
import AuthSessionWatcher from "./components/commons/AuthSessionWatcher.jsx";
import Login from "./components/login_register/Login.jsx";
import Register from "./components/login_register/Register.jsx";
import ProfilePage from "./components/pages/ProfilePage.jsx";
import SettingsPage from "./components/pages/SettingsPage.jsx";

function App() {
  return (
    <>
      <BrowserRouter>
        <RouteChangeLoader />
        <AuthSessionWatcher />
        <Suspense fallback={<PageLoaderOverlay />}>
          <Routes>
            <Route path="/" element={<PlayKalimbaPage />} />
            <Route path="/instructions" element={<InstructionsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  );
}

export default App;
