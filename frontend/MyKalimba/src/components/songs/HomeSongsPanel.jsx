import React, { useContext, useEffect, useMemo, useState } from "react";
import { I18nContext } from "../../i18n/I18nProvider";
import { SongTabsList } from "./SongTabsList.jsx";
import TabLyricNotationView from "./TabLyricNotationView.jsx";
import {
  toContentString,
  buildLyricNotationBlocks,
} from "../../utils/tabLyricLayout";

function readAccessToken() {
  try {
    return window.localStorage?.getItem("access_token") || "";
  } catch {
    return "";
  }
}

export default function HomeSongsPanel() {
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
  const { t } = useContext(I18nContext);

  const [accessToken, setAccessToken] = useState(() => readAccessToken());
  useEffect(() => {
    const sync = () => setAccessToken(readAccessToken());
    window.addEventListener("auth:changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("auth:changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const [songs, setSongs] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [tabs, setTabs] = useState([]);
  const [tabsLoading, setTabsLoading] = useState(false);
  const [tabsError, setTabsError] = useState("");
  const [selectedTabId, setSelectedTabId] = useState("");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadTabsForSong = async (song) => {
      if (!song?.id) return;
      setTabsLoading(true);
      setTabsError("");
      try {
        const headers = {};
        if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
        const res = await fetch(`${API_BASE_URL}/api/tabs?songId=${song.id}`, {
          headers,
        });
        if (!res.ok) throw new Error("Failed to load tabs");

        const data = await res.json();
        if (cancelled) return;
        const arr = Array.isArray(data) ? data : [];
        setTabs(arr);
        setSelectedTabId(arr[0]?.id ? String(arr[0].id) : "");
      } catch (e) {
        if (cancelled) return;
        setTabs([]);
        setSelectedTabId("");
        setTabsError(e?.message || "Error loading tabs");
      } finally {
        if (!cancelled) setTabsLoading(false);
      }
    };

    if (selectedSong) loadTabsForSong(selectedSong);
    else {
      setTabs([]);
      setSelectedTabId("");
      setTabsError("");
      setTabsLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [selectedSong, API_BASE_URL, accessToken]);

  const selectedTab = useMemo(() => {
    if (!selectedTabId) return tabs[0] || null;
    return (
      tabs.find((t) => String(t.id) === String(selectedTabId)) ||
      tabs[0] ||
      null
    );
  }, [tabs, selectedTabId]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError("");
      try {
        const headers = {};
        const url = new URL(`${API_BASE_URL}/api/songs`);

        if (accessToken) {
          headers["Authorization"] = `Bearer ${accessToken}`;
          url.searchParams.append("includeMine", "1");
        }

        const res = await fetch(url.toString(), { headers });
        if (!res.ok) throw new Error("Failed to fetch songs");

        const data = await res.json();
        if (cancelled) return;
        setSongs(Array.isArray(data) ? data : []);
      } catch (e) {
        if (cancelled) return;
        setSongs([]);
        setError(e?.message || "Error loading songs");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [API_BASE_URL, accessToken]);

  const filteredSongs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return songs;
    return songs.filter((s) => {
      const title = String(s.title || "").toLowerCase();
      const artist = String(s.artist || "").toLowerCase();
      return title.includes(q) || artist.includes(q);
    });
  }, [songs, query]);

  return (
    <section style={{ marginBottom: "1rem" }}>
      <article style={{ marginBottom: "1rem" }}>
        <header style={{ marginBottom: "0.75rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "end",
              gap: "0.75rem",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h3 style={{ marginBottom: "0.25rem" }}>{t("songs.title")}</h3>
              <small style={{ color: "var(--muted-color)" }}>
                {t("home.songs.pickHint")}
              </small>
            </div>

            <div style={{ minWidth: "260px", flex: "1 1 280px" }}>
              <label style={{ marginBottom: 0 }}>
                <small>{t("home.songs.search")}</small>
                <input
                  type="search"
                  placeholder={t("home.songs.searchPlaceholder")}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
            </div>
          </div>
        </header>

        {isLoading ? (
          <p aria-busy="true">{t("profile.loading")}</p>
        ) : error ? (
          <p>{error}</p>
        ) : filteredSongs.length === 0 ? (
          <p>{t("songs.noSongs")}</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "0.75rem",
            }}
          >
            {filteredSongs.map((song) => {
              const active = selectedSong?.id === song.id;
              return (
                <button
                  key={song.id}
                  type="button"
                  className={active ? "contrast" : "secondary"}
                  onClick={() => setSelectedSong(song)}
                  style={{
                    textAlign: "left",
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "var(--border-radius)",
                    border: active
                      ? "2px solid var(--contrast)"
                      : "1px solid var(--muted-border-color)",
                    background: "var(--card-background-color)",
                    color: "inherit",
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: "0.25rem" }}>
                    {song.title}
                  </div>
                  <div
                    style={{ color: "var(--muted-color)", fontSize: "0.85rem" }}
                  >
                    {song.artist || "—"}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </article>

      {selectedSong ? (
        <article>
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "start",
              gap: "0.75rem",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h4 style={{ marginBottom: "0.25rem" }}>{selectedSong.title}</h4>
              <small style={{ color: "var(--muted-color)" }}>
                {selectedSong.artist || "—"}
              </small>
            </div>

            <button
              type="button"
              className="secondary outline"
              style={{ width: "auto" }}
              onClick={() => setSelectedSong(null)}
            >
              {t("home.songs.clearSelection")}
            </button>
          </header>

          <div
            style={{
              marginTop: "0.75rem",
              padding: "0.75rem",
              border: "1px solid var(--muted-border-color)",
              borderRadius: "var(--border-radius)",
              background: "var(--card-background-color)",
            }}
          >
            <strong>{t("home.song.lyricsTitle")}</strong>

            {tabsLoading ? (
              <p aria-busy="true" style={{ margin: "0.5rem 0 0 0" }}>
                {t("profile.loading")}
              </p>
            ) : tabsError ? (
              <p style={{ margin: "0.5rem 0 0 0" }}>{tabsError}</p>
            ) : tabs.length === 0 ? (
              <p
                style={{ margin: "0.5rem 0 0 0", color: "var(--muted-color)" }}
              >
                {t("home.song.noLyrics")}
              </p>
            ) : (
              <>
                {tabs.length > 1 ? (
                  <label
                    style={{ marginTop: "0.5rem", marginBottom: "0.5rem" }}
                  >
                    <small>{t("tabs.title")}</small>
                    <select
                      value={selectedTabId}
                      onChange={(e) => setSelectedTabId(e.target.value)}
                    >
                      {tabs.map((tab) => (
                        <option key={tab.id} value={String(tab.id)}>
                          {tab.instrument} ({tab.keysCount} keys) ·{" "}
                          {t("option.labeltype")}{" "}
                          {tab.labelType === "Letter" ? "C" : "1"}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}

                {(() => {
                  const contentString = toContentString(selectedTab?.content);
                  const blocks = buildLyricNotationBlocks(contentString);
                  const showLyricLayout = blocks.some(
                    (b) => b.lyric && b.notes,
                  );

                  return showLyricLayout ? (
                    <TabLyricNotationView
                      content={contentString}
                      style={{
                        marginTop: "0.5rem",
                        maxHeight: 260,
                        overflowY: "auto",
                      }}
                    />
                  ) : (
                    <p
                      style={{
                        margin: "0.5rem 0 0 0",
                        color: "var(--muted-color)",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {contentString || t("home.song.noLyrics")}
                    </p>
                  );
                })()}
              </>
            )}
          </div>

          <SongTabsList songId={selectedSong.id} isOwner={false} />
        </article>
      ) : null}
    </section>
  );
}
