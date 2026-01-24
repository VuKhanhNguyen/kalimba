import React, { useContext, useEffect, useState } from "react";
import { I18nContext } from "../../i18n/I18nProvider";
import { parseTabContent, tokensToNoteSequence } from "../../utils/tabNotation";
import { playNoteSequence } from "../../utils/previewPlayer";
import Modal from "../commons/Modal.jsx";

function readAccessToken() {
  try {
    return window.localStorage?.getItem("access_token") || "";
  } catch {
    return "";
  }
}

export function SongTabsList({ songId, isOwner }) {
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

  const [tabs, setTabs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTab, setEditingTab] = useState(null);
  const [previewTab, setPreviewTab] = useState(null);
  const [bpm, setBpm] = useState(120);
  const [playback, setPlayback] = useState({ tabId: null, stop: null });

  // Form
  const [formData, setFormData] = useState({
    instrument: "kalimba",
    keys_count: 17,
    label_type: "Number",
    content: "",
  });

  useEffect(() => {
    if (songId) loadTabs();
  }, [songId, accessToken]);

  const loadTabs = async () => {
    setIsLoading(true);
    try {
      const headers = {};
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }
      const res = await fetch(`${API_BASE_URL}/api/tabs?songId=${songId}`, {
        headers,
      });
      if (!res.ok) throw new Error("Failed to load tabs");
      const data = await res.json();
      setTabs(data);
    } catch (err) {
      console.error(err);
      setTabs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("tabs.deleteConfirm"))) return;
    try {
      if (!accessToken) throw new Error("Not authenticated");
      const res = await fetch(`${API_BASE_URL}/api/tabs/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (res.ok) {
        setTabs((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const stopPlayback = () => {
    try {
      if (typeof playback.stop === "function") playback.stop();
    } finally {
      setPlayback({ tabId: null, stop: null });
    }
  };

  const togglePreview = (id) => {
    // kept for backward compatibility if referenced; now replaced by modal preview
    const found = tabs.find((t) => t.id === id);
    if (!found) return;
    setPreviewTab(found);
  };

  const closePreview = () => {
    stopPlayback();
    setPreviewTab(null);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingTab(null);
  };

  const handlePlayPreview = async (tab) => {
    try {
      stopPlayback();

      const contentString =
        typeof tab.content === "string"
          ? tab.content
          : JSON.stringify(tab.content, null, 2);
      const { tokens } = parseTabContent(
        contentString,
        tab.labelType || "Number",
      );
      const sequence = tokensToNoteSequence(tokens);
      if (!sequence.some((n) => Boolean(n))) {
        alert(t("tabs.preview.noNotes"));
        return;
      }

      const player = await playNoteSequence(sequence, { bpm });
      setPlayback({ tabId: tab.id, stop: player.stop });
    } catch (err) {
      alert(err?.message || "Failed to play preview");
    }
  };

  const handleEdit = (tab) => {
    setEditingTab(tab);
    setPreviewTab(null);
    setFormData({
      instrument: tab.instrument,
      keys_count: tab.keysCount || 17,
      label_type: tab.labelType || "Number",
      content:
        typeof tab.content === "string"
          ? tab.content
          : JSON.stringify(tab.content, null, 2),
    });
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingTab(null);
    setPreviewTab(null);
    setFormData({
      instrument: "kalimba",
      keys_count: 17,
      label_type: "Number",
      content: "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!accessToken) throw new Error("Not authenticated");
      const url = editingTab
        ? `${API_BASE_URL}/api/tabs/${editingTab.id}`
        : `${API_BASE_URL}/api/tabs`;
      const method = editingTab ? "PUT" : "POST";

      const body = {
        ...formData,
        song_id: songId,
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to save tab");
      }

      await loadTabs();
      closeForm();
    } catch (error) {
      alert(error.message);
    }
  };

  if (isLoading) return <p aria-busy="true">{t("profile.loading")}</p>;

  return (
    <div
      style={{
        marginTop: "1rem",
        paddingLeft: "1rem",
        borderLeft: "2px solid var(--muted-border-color)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.5rem",
        }}
      >
        <h5 style={{ margin: 0 }}>{t("tabs.title")}</h5>
        {isOwner && (
          <button
            className="outline secondary"
            style={{
              padding: "0.25rem 0.5rem",
              fontSize: "0.8rem",
              width: "auto",
            }}
            onClick={handleAddNew}
          >
            {t("tabs.add")}
          </button>
        )}
      </div>

      <Modal
        open={showForm}
        title={editingTab ? t("songs.edit") : t("tabs.add")}
        onClose={closeForm}
        maxWidth={720}
      >
        <form onSubmit={handleSubmit}>
          <label>
            {t("tabs.instrument")}
            <select
              value={formData.instrument}
              onChange={(e) =>
                setFormData({ ...formData, instrument: e.target.value })
              }
            >
              <option value="kalimba">Kalimba</option>
              {/* Add more instruments if needed */}
            </select>
          </label>
          <label>
            {t("tabs.keysCount")}
            <input
              type="number"
              min="8"
              max="21"
              value={formData.keys_count}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  keys_count: parseInt(e.target.value, 10),
                })
              }
            />
          </label>

          <label>
            {t("option.labeltype")}
            <select
              value={formData.label_type}
              onChange={(e) =>
                setFormData({ ...formData, label_type: e.target.value })
              }
            >
              <option value="Number">1 (tab số)</option>
              <option value="Letter">C (tab chữ)</option>
            </select>
          </label>

          <label>
            {t("tabs.content")} (text/JSON)
            <textarea
              rows="10"
              required
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
            ></textarea>
          </label>
          <div className="grid">
            <button type="submit">{t("tabs.form.save")}</button>
            <button type="button" className="secondary" onClick={closeForm}>
              {t("tabs.form.cancel")}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(previewTab)}
        title={t("tabs.preview")}
        onClose={closePreview}
        maxWidth={980}
      >
        {previewTab ? (
          <div>
            <div
              style={{ marginBottom: "0.5rem", color: "var(--muted-color)" }}
            >
              <small>
                {previewTab.instrument} ({previewTab.keysCount} keys) ·{" "}
                {t("option.labeltype")}{" "}
                {previewTab.labelType === "Letter" ? "C" : "1"}
              </small>
            </div>

            <label style={{ marginBottom: "0.75rem" }}>
              <small>
                {t("tabs.preview.speed")} {bpm}
              </small>
              <input
                type="range"
                min="60"
                max="200"
                value={bpm}
                onChange={(e) => setBpm(parseInt(e.target.value, 10))}
              />
            </label>

            {(() => {
              const contentString =
                typeof previewTab.content === "string"
                  ? previewTab.content
                  : JSON.stringify(previewTab.content, null, 2);
              const { tokens, warnings } = parseTabContent(
                contentString,
                previewTab.labelType || "Number",
              );

              return (
                <>
                  {warnings?.length ? (
                    <p style={{ margin: "0 0 0.5rem 0" }}>
                      <small style={{ color: "var(--secondary)" }}>
                        {warnings[0]}
                      </small>
                    </p>
                  ) : null}

                  <div
                    style={{
                      fontFamily:
                        "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                      lineHeight: 1.8,
                      padding: "0.75rem",
                      border: "1px solid var(--muted-border-color)",
                      borderRadius: "var(--border-radius)",
                      overflowX: "auto",
                      background: "var(--card-background-color)",
                    }}
                  >
                    {tokens.map((tok, idx) => {
                      if (tok.type === "newline") {
                        return <br key={`nl-${idx}`} />;
                      }

                      if (tok.type === "bar") {
                        return (
                          <span
                            key={`bar-${idx}`}
                            style={{
                              display: "inline-block",
                              minWidth: "1rem",
                              textAlign: "center",
                              margin: "0 0.35rem 0 0.1rem",
                              color: "var(--muted-color)",
                              fontWeight: 700,
                            }}
                            title="bar"
                          >
                            |
                          </span>
                        );
                      }

                      if (tok.type === "beat") {
                        return (
                          <span
                            key={`beat-${idx}`}
                            style={{
                              display: "inline-block",
                              minWidth: "1rem",
                              textAlign: "center",
                              margin: "0 0.35rem 0 0.1rem",
                              color: "var(--muted-color)",
                            }}
                            title="beat"
                          >
                            ,
                          </span>
                        );
                      }

                      if (tok.type === "hold") {
                        return (
                          <span
                            key={`h-${idx}`}
                            style={{
                              display: "inline-block",
                              minWidth: "1.4rem",
                              textAlign: "center",
                              marginRight: "0.25rem",
                              padding: "0.1rem 0.35rem",
                              borderRadius: "0.35rem",
                              border: "1px dashed var(--muted-border-color)",
                              color: "var(--muted-color)",
                            }}
                            title="hold"
                          >
                            {tok.raw}
                          </span>
                        );
                      }

                      if (tok.type === "rest") {
                        return (
                          <span
                            key={`r-${idx}`}
                            style={{
                              display: "inline-block",
                              minWidth: "1.4rem",
                              textAlign: "center",
                              marginRight: "0.25rem",
                              padding: "0.1rem 0.35rem",
                              borderRadius: "0.35rem",
                              border: "1px dashed var(--muted-border-color)",
                              color: "var(--muted-color)",
                            }}
                            title="rest"
                          >
                            {tok.raw}
                          </span>
                        );
                      }

                      return (
                        <span
                          key={`n-${idx}`}
                          style={{
                            display: "inline-block",
                            minWidth: "1.4rem",
                            textAlign: "center",
                            marginRight: "0.25rem",
                            padding: "0.1rem 0.35rem",
                            borderRadius: "0.35rem",
                            border: "1px solid var(--muted-border-color)",
                          }}
                          title={tok.noteName}
                        >
                          {tok.raw}
                        </span>
                      );
                    })}
                  </div>
                </>
              );
            })()}

            <div style={{ marginTop: "0.75rem" }} className="grid">
              {playback.tabId === previewTab.id ? (
                <button
                  type="button"
                  className="outline contrast"
                  onClick={stopPlayback}
                >
                  {t("tabs.stop")}
                </button>
              ) : (
                <button
                  type="button"
                  className="outline secondary"
                  onClick={() => handlePlayPreview(previewTab)}
                >
                  {t("tabs.play")}
                </button>
              )}
              <button
                type="button"
                className="secondary"
                onClick={closePreview}
              >
                {t("tabs.form.cancel")}
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      {tabs.length === 0 ? (
        <p>
          <small>{t("tabs.noTabs")}</small>
        </p>
      ) : (
        <ul style={{ padding: 0 }}>
          {tabs.map((tab) => (
            <li
              key={tab.id}
              style={{
                listStyle: "none",
                marginBottom: "0.5rem",
                padding: "0.5rem",
                border: "1px solid var(--muted-border-color)",
                borderRadius: "var(--border-radius)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                }}
              >
                <div>
                  <strong>
                    {tab.instrument} ({tab.keysCount} keys)
                  </strong>
                  <div
                    style={{ fontSize: "0.8rem", color: "var(--muted-color)" }}
                  >
                    <small>
                      {t("option.labeltype")}{" "}
                      {tab.labelType === "Letter" ? "C" : "1"}
                    </small>
                  </div>
                  <div
                    style={{
                      maxHeight: "60px",
                      overflow: "hidden",
                      fontSize: "0.8rem",
                      color: "var(--muted-color)",
                    }}
                  >
                    {typeof tab.content === "string"
                      ? tab.content
                      : "JSON content"}
                  </div>
                </div>
                <div
                  style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}
                >
                  <button
                    className="outline"
                    style={{
                      padding: "0.2rem 0.6rem",
                      fontSize: "0.75rem",
                      width: "auto",
                    }}
                    onClick={() => togglePreview(tab.id)}
                  >
                    {t("tabs.preview")}
                  </button>

                  {playback.tabId === tab.id ? (
                    <button
                      className="outline contrast"
                      style={{
                        padding: "0.2rem 0.6rem",
                        fontSize: "0.75rem",
                        width: "auto",
                      }}
                      onClick={stopPlayback}
                    >
                      {t("tabs.stop")}
                    </button>
                  ) : (
                    <button
                      className="outline secondary"
                      style={{
                        padding: "0.2rem 0.6rem",
                        fontSize: "0.75rem",
                        width: "auto",
                      }}
                      onClick={() => handlePlayPreview(tab)}
                    >
                      {t("tabs.play")}
                    </button>
                  )}

                  {isOwner ? (
                    <>
                      <button
                        className="outline secondary"
                        style={{
                          padding: "0.2rem 0.6rem",
                          fontSize: "0.75rem",
                          width: "auto",
                        }}
                        onClick={() => handleEdit(tab)}
                      >
                        {t("songs.edit")}
                      </button>
                      <button
                        className="outline contrast"
                        style={{
                          padding: "0.2rem 0.6rem",
                          fontSize: "0.75rem",
                          width: "auto",
                        }}
                        onClick={() => handleDelete(tab.id)}
                      >
                        {t("songs.delete")}
                      </button>
                    </>
                  ) : null}
                </div>
              </div>

              {null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
