import React, { useEffect, useMemo, useState } from "react";
import "../styles/PublishBook.css";
import api from "../api";

export default function PublishBook({ clientId, titlesBase = "/api/v1/titles", booksBase = "/api/v1/books" }) {
  const [defs, setDefs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [stateText, setStateText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // ---------------------- Fetch book_definition ----------------------
  useEffect(() => {
    let ignore = false;
    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get(`${titlesBase}`);
        if (!ignore) setDefs(Array.isArray(data) ? data : data.items ?? []);
      } catch (e) {
        if (!ignore) setError("No fue posible cargar los libros guardados (book_definition).");
        console.error(e);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    run();
    return () => {
      ignore = true;
    };
  }, [titlesBase]);


  // ---------------------- Filter/search ----------------------
  const filtered = useMemo(() => {
    if (!query.trim()) return defs;
    const q = query.toLowerCase();
    return defs.filter((d) => {
      const title = (d.title ?? "").toLowerCase();
      const author = (d.author ?? "").toLowerCase();
      const editorial = (d.editorial ?? "").toLowerCase();
      const isbn = (d.isbn ?? "").toLowerCase();
      return title.includes(q) || author.includes(q) || editorial.includes(q) || isbn.includes(q);
    });
  }, [defs, query]);

  // ---------------------- Submit ----------------------
    const canSubmit = selectedId && stateText.trim() && !submitting;

        const onSubmit = async (e) => {
            e.preventDefault();
            if (!canSubmit) return;
            setSubmitting(true);
            setSuccessMsg("");
            setError("");

            try {
                // Buscar la definición seleccionada para adjuntarla en el payload
                const selectedDef = defs.find((d) => {
                    const id = d.id ?? d.idBookDefinition ?? d.id_book_definition;
                    return String(id) === String(selectedId);
                }) || {};

                const resolvedClientId = String(clientId || window.localStorage.getItem("user-id") || "").trim();

                const payload = {
                    state: stateText.trim(),
                    stateRequest: null,
                    bookDefinitionID: String(selectedId),
                    ...(resolvedClientId ? { clientId: resolvedClientId } : {}),
                    bookDefinition: {
                        id: selectedDef.id ?? selectedDef.idBookDefinition ?? selectedDef.id_book_definition ?? String(selectedId),
                        title: selectedDef.title,
                        author: selectedDef.author,
                        editorial: selectedDef.editorial,
                        isbn: selectedDef.isbn,
                    },
                };

                const res = await api.post(`${booksBase}`, payload);

                if (!(res && res.status >= 200 && res.status < 300)) {
                    throw new Error(`HTTP ${res?.status}`);
                }

                setSuccessMsg("¡Libro publicado correctamente!");
                setSelectedId("");
                setStateText("");
            } catch (e) {
                console.error(e);
                const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || "No se pudo publicar el libro. Revisa el backend o los datos enviados.";
                setError(msg);
            } finally {
                setSubmitting(false);
            }
        };


  // ---------------------- UI ----------------------
  return (
  <div className="publish-page">
    <h1 className="page-title">Publicar libro</h1>

    <div className="card">
      <form onSubmit={onSubmit} className="form-grid">
        {/* Buscador */}
        <div className="field">
          <label className="label">Buscar en libros guardados (book_definition)</label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filtra por título, autor, editorial o ISBN"
            className="input"
          />
        </div>

        {/* Selector */}
        <div className="field">
          <label className="label">Selecciona el libro</label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="select"
            disabled={loading || !filtered.length}
          >
            <option value="" disabled>
              {loading ? "Cargando…" : filtered.length ? "Elige una opción" : "No hay resultados"}
            </option>
            {filtered.map((d) => {
              const id = d.id ?? d.idBookDefinition ?? d.id_book_definition;
              return (
                <option key={id} value={id}>
                  {(d.title ?? "Sin título")} — {(d.author ?? "Autor desconocido")}
                  {d.isbn ? ` (${d.isbn})` : ""}
                </option>
              );
            })}
          </select>
          <div className="helper">Fuente: tabla <code>book_definition</code> en PostgreSQL</div>
        </div>

        {/* Estado */}
        <div className="field">
          <label className="label">Estado</label>
          <input
            type="text"
            value={stateText}
            onChange={(e) => setStateText(e.target.value)}
            placeholder="Ej: disponible, usado como nuevo, buen estado, con subrayados, etc."
            className="input"
            maxLength={120}
          />
        </div>

        {/* Mensajes */}
        {error && <div className="alert alert-error">{error}</div>}
        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        {/* Acciones */}
        <div className="actions">
          <button type="submit" disabled={!canSubmit} className="btn btn-primary">
            {submitting ? "Publicando…" : "Publicar"}
          </button>
          <button type="button" onClick={() => { setSelectedId(""); setStateText(""); }} className="btn btn-ghost">
            Limpiar
          </button>
          <span className="helper">
            Se creará un registro en <code>book</code> asociado a <code>bookDefinition</code>
            {clientId ? " y al cliente actual" : ""} con el <code>state</code> indicado.
          </span>
        </div>
      </form>
    </div>
  </div>
);
}