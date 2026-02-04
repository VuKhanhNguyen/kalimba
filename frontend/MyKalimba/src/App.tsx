import "./App.css";
import React, { Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import PlayKalimbaPage from "./components/pages/PlayKalimbaPage";
import InstructionsPage from "./components/pages/InstructionsPage";
import RouteChangeLoader from "./components/commons/RouteChangeLoader";
import PageLoaderOverlay from "./components/commons/PageLoaderOverlay";
import AuthSessionWatcher from "./components/commons/AuthSessionWatcher";
import Login from "./components/login_register/login";
import Register from "./components/login_register/register";
import ProfilePage from "./components/pages/ProfilePage";
import SettingsPage from "./components/pages/SettingsPage";
import SongsPage from "./components/pages/SongsPage";
import OAuthCallbackPage from "./components/pages/OAuthCallbackPage";
import ForgotPasswordPage from "./components/pages/ForgotPasswordPage";

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
