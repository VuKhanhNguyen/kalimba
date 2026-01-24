import React, { useContext, useEffect, useState } from "react";
import { I18nContext } from "../../i18n/I18nProvider";
import Header from "../commons/header.jsx";
import Footer from "../commons/footer.jsx";
import { SongTabsList } from "../songs/SongTabsList.jsx";
import Modal from "../commons/Modal.jsx";

function parseJwtPayload(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "===".slice((base64.length + 3) % 4);
    const json = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join(""),
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function readAuthSnapshot() {
  let accessToken = "";
  let authUser = null;
  try {
    accessToken = window.localStorage?.getItem("access_token") || "";
  } catch {
    accessToken = "";
  }

  try {
    const raw = window.localStorage?.getItem("auth_user");
    authUser = raw ? JSON.parse(raw) : null;
  } catch {
    authUser = null;
  }

  return { accessToken, authUser };
}

export function SongsPage() {
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
  const { t } = useContext(I18nContext);

  const [auth, setAuth] = useState(() => readAuthSnapshot());
  const accessToken = auth.accessToken;

  useEffect(() => {
    const sync = () => setAuth(readAuthSnapshot());
    window.addEventListener("auth:changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("auth:changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [serverMessage, setServerMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [viewingSong, setViewingSong] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    is_public: false,
  });

  useEffect(() => {
    loadSongs();
  }, [accessToken]);

  const loadSongs = async () => {
    setIsLoading(true);
    setServerMessage("");
    try {
      const headers = {};
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }

      // If logged in, we might want to see our own private songs too.
      // The backend logic says: if (req.user && req.query.includeMine === "1")
      const url = new URL(`${API_BASE_URL}/api/songs`);
      if (accessToken) {
        url.searchParams.append("includeMine", "1");
      }

      const res = await fetch(url.toString(), { headers });
      if (!res.ok) throw new Error("Failed to fetch songs");
      const data = await res.json();
      setSongs(data);
    } catch (err) {
      setServerMessage(err.message || "Error loading songs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("songs.deleteConfirm"))) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/songs/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!res.ok) throw new Error("Failed to delete");
      // Remove from list locally
      setSongs((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (song) => {
    setEditingSong(song);
    setFormData({
      title: song.title,
      artist: song.artist || "",
      is_public: song.isPublic,
    });
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingSong(null);
    setFormData({
      title: "",
      artist: "",
      is_public: false,
    });
    setShowForm(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingSong
        ? `${API_BASE_URL}/api/songs/${editingSong.id}`
        : `${API_BASE_URL}/api/songs`;
      const method = editingSong ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save song");

      await loadSongs(); // Reload list to get fresh data
      setShowForm(false);
      setEditingSong(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const userCanEdit = (song) => {
    if (!accessToken) return false;

    const payload = parseJwtPayload(accessToken);
    const tokenUserId =
      payload && payload.id !== undefined && payload.id !== null
        ? Number(payload.id)
        : null;
    const storedUserId =
      auth.authUser?.id !== undefined ? Number(auth.authUser.id) : null;

    const currentUserId = Number.isFinite(tokenUserId)
      ? tokenUserId
      : Number.isFinite(storedUserId)
        ? storedUserId
        : null;

    if (!currentUserId) return false;
    return Number(song.createdBy) === currentUserId;
  };

  const openSongDetails = (song) => setViewingSong(song);
  const closeSongDetails = () => setViewingSong(null);

  const closeSongForm = () => {
    setShowForm(false);
    setEditingSong(null);
  };

  return (
    <main className="container">
      <Header />
      <article>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* <h2>{t("songs.title")}</h2> */}
          {accessToken && (
            <button onClick={handleAddNew} className="outline">
              {t("songs.add")}
            </button>
          )}
        </header>

        <Modal
          open={showForm}
          title={editingSong ? t("songs.edit") : t("songs.add")}
          onClose={closeSongForm}
          maxWidth={640}
        >
          <form onSubmit={handleFormSubmit}>
            <label>
              {t("songs.form.title")}
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </label>
            <label>
              {t("songs.form.artist")}
              <input
                type="text"
                value={formData.artist}
                onChange={(e) =>
                  setFormData({ ...formData, artist: e.target.value })
                }
              />
            </label>
            <label>
              <input
                type="checkbox"
                checked={formData.is_public}
                onChange={(e) =>
                  setFormData({ ...formData, is_public: e.target.checked })
                }
              />
              {t("songs.form.isPublic")}
            </label>
            <div className="grid">
              <button type="submit">{t("songs.form.save")}</button>
              <button
                type="button"
                className="secondary"
                onClick={closeSongForm}
              >
                {t("songs.form.cancel")}
              </button>
            </div>
          </form>
        </Modal>

        <Modal
          open={Boolean(viewingSong)}
          title={viewingSong ? viewingSong.title : t("songs.title")}
          onClose={closeSongDetails}
          maxWidth={980}
        >
          {viewingSong ? (
            <div>
              <div
                style={{ marginBottom: "0.75rem", color: "var(--muted-color)" }}
              >
                <small>
                  {t("songs.form.artist")}: {viewingSong.artist || "—"}
                </small>
              </div>

              <SongTabsList
                songId={viewingSong.id}
                isOwner={userCanEdit(viewingSong)}
              />
            </div>
          ) : null}
        </Modal>

        {isLoading ? (
          <p aria-busy="true">{t("profile.loading")}</p>
        ) : serverMessage ? (
          <p>{serverMessage}</p>
        ) : songs.length === 0 ? (
          <p>{t("songs.noSongs")}</p>
        ) : (
          <figure>
            <table role="grid">
              <thead>
                <tr>
                  <th scope="col">{t("songs.form.title")}</th>
                  <th scope="col">{t("songs.form.artist")}</th>
                  <th scope="col"></th>
                </tr>
              </thead>
              <tbody>
                {songs.map((song) => (
                  <tr
                    key={song.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => openSongDetails(song)}
                  >
                    <td>
                      <strong>{song.title}</strong>
                    </td>
                    <td>{song.artist}</td>
                    <td style={{ textAlign: "right" }}>
                      {userCanEdit(song) && (
                        <div
                          className="grid"
                          style={{ gap: "0.5rem", justifyContent: "end" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="secondary outline"
                            style={{
                              padding: "0.25rem 0.5rem",
                              fontSize: "0.8rem",
                              width: "auto",
                            }}
                            onClick={() => handleEdit(song)}
                          >
                            {t("songs.edit")}
                          </button>
                          <button
                            className="contrast outline"
                            style={{
                              padding: "0.25rem 0.5rem",
                              fontSize: "0.8rem",
                              width: "auto",
                            }}
                            onClick={() => handleDelete(song.id)}
                          >
                            {t("songs.delete")}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </figure>
        )}
      </article>
      <Footer />
    </main>
  );
}

export default SongsPage;
