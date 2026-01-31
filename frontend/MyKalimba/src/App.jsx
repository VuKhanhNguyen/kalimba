import "./App.css";
import React, { Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import PlayKalimbaPage from "./components/pages/PlayKalimbaPage.jsx";
import InstructionsPage from "./components/pages/InstructionsPage.jsx";
import RouteChangeLoader from "./components/commons/RouteChangeLoader.jsx";
import PageLoaderOverlay from "./components/commons/PageLoaderOverlay.jsx";
import AuthSessionWatcher from "./components/commons/AuthSessionWatcher.jsx";
import Login from "./components/login_register/login.jsx";
import Register from "./components/login_register/register.jsx";
import ProfilePage from "./components/pages/ProfilePage.jsx";
import SettingsPage from "./components/pages/SettingsPage.jsx";
import SongsPage from "./components/pages/SongsPage.jsx";
import OAuthCallbackPage from "./components/pages/OAuthCallbackPage.jsx";
import ForgotPasswordPage from "./components/pages/ForgotPasswordPage.jsx";

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
            <Route path="/songs" element={<SongsPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  );
}

export default App;
