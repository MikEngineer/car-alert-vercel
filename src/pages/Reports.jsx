import { useEffect, useMemo, useState } from "react";
import { supabase } from "../api/supabaseApi";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [modelFilter, setModelFilter] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data, error } = await supabase
          .from("reports")
          .select(
            "id, plate, brand, model, color, description, image_url, created_at"
          )
          .order("created_at", { ascending: false });

        if (error) throw error;
        setReports(data || []);
      } catch (err) {
        console.error("Errore caricamento annunci:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const brands = useMemo(() => {
    const uniqueBrands = new Set();

    reports.forEach((report) => {
      if (report.brand) {
        uniqueBrands.add(report.brand);
      }
    });

    return Array.from(uniqueBrands).sort((a, b) =>
      a.localeCompare(b, "it", { sensitivity: "base" })
    );
  }, [reports]);

  const models = useMemo(() => {
    const uniqueModels = new Set();

    reports.forEach((report) => {
      if (brandFilter && report.brand !== brandFilter) {
        return;
      }

      if (report.model) {
        uniqueModels.add(report.model);
      }
    });

    return Array.from(uniqueModels).sort((a, b) =>
      a.localeCompare(b, "it", { sensitivity: "base" })
    );
  }, [reports, brandFilter]);

  useEffect(() => {
    if (modelFilter && !models.includes(modelFilter)) {
      setModelFilter("");
    }
  }, [modelFilter, models]);

  const filteredReports = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return reports.filter((report) => {
      if (brandFilter && report.brand !== brandFilter) {
        return false;
      }

      if (modelFilter && report.model !== modelFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const haystack = [
        report.plate,
        report.brand,
        report.model,
        report.color,
        report.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [reports, searchTerm, brandFilter, modelFilter]);

  const handleBrandChange = (event) => {
    const value = event.target.value;
    setBrandFilter(value);
    setModelFilter("");
  };

  if (loading) {
    return (
      <div className="container text-center py-5">
        <p className="text-muted">Caricamento annunci in corso...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container text-center py-5">
        <div className="alert alert-danger">
          Errore nel caricamento: {error}
        </div>
      </div>
    );
  }

  if (!reports.length) {
    return (
      <div className="container text-center py-5">
        <p className="text-muted">Nessun annuncio presente nel database.</p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h3 className="text-center mb-4">Annunci segnalati</h3>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <form
            className="row g-3 align-items-end"
            onSubmit={(event) => event.preventDefault()}
          >
            <div className="col-md-6">
              <label htmlFor="reportSearch" className="form-label">
                Cerca
              </label>
              <input
                id="reportSearch"
                type="search"
                className="form-control"
                placeholder="Targa, descrizione, colore..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>

            <div className="col-md-3">
              <label htmlFor="brandFilter" className="form-label">
                Marca
              </label>
              <select
                id="brandFilter"
                className="form-select"
                value={brandFilter}
                onChange={handleBrandChange}
              >
                <option value="">Tutte</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label htmlFor="modelFilter" className="form-label">
                Modello
              </label>
              <select
                id="modelFilter"
                className="form-select"
                value={modelFilter}
                onChange={(event) => setModelFilter(event.target.value)}
                disabled={!models.length}
              >
                <option value="">Tutti</option>
                {models.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>
          </form>
        </div>
      </div>

      {filteredReports.length ? (
        <div className="row">
          {filteredReports.map((report) => (
            <div key={report.id} className="col-md-4 mb-4">
              <div className="card shadow-sm h-100">
                {report.image_url ? (
                  <img
                    src={report.image_url}
                    className="card-img-top"
                    alt="Veicolo segnalato"
                    style={{ objectFit: "cover", height: "200px" }}
                    onError={(event) => (event.target.style.display = "none")}
                  />
                ) : (
                  <div
                    className="bg-light d-flex align-items-center justify-content-center"
                    style={{ height: "200px" }}
                  >
                    <span className="text-muted">Nessuna immagine</span>
                  </div>
                )}

                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">
                    {report.plate ? report.plate.toUpperCase() : "Senza targa"}
                  </h5>

                  {(report.brand || report.model || report.color) && (
                    <ul className="list-unstyled small text-muted mb-3">
                      {report.brand && (
                        <li>
                          <strong>Marca:</strong> {report.brand}
                        </li>
                      )}
                      {report.model && (
                        <li>
                          <strong>Modello:</strong> {report.model}
                        </li>
                      )}
                      {report.color && (
                        <li>
                          <strong>Colore:</strong> {report.color}
                        </li>
                      )}
                    </ul>
                  )}

                  <p className="card-text mb-3">
                    {report.description || "Nessuna descrizione"}
                  </p>

                  <small className="text-muted mt-auto">
                    {new Date(report.created_at).toLocaleString("it-IT")}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5">
          <p className="text-muted mb-0">
            Nessun annuncio corrisponde ai filtri selezionati.
          </p>
        </div>
      )}
    </div>
  );
}