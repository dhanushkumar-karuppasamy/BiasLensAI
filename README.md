# BiasLens AI

BiasLens AI is an explainable fairness-auditing project built on the Adult Income dataset.

It currently supports:

- **React frontend** (`frontend/`) for the investigative report UX
- **FastAPI bridge backend** (`api.py`) serving model metrics/SHAP payloads to React
- **Legacy Streamlit app** (`app.py`) kept intact for side-by-side validation and fallback demos

The modeling layer compares:

- **Model A (Overt Bias)**
- **Model B (Proxy Bias)**
- **Model C (Mitigated Bias)** via sample reweighting

---

## Current architecture

- `src/data_processing.py` → dataset load/clean
- `src/modeling.py` → training, fairness metrics, SHAP feature impact extraction
- `api.py` → JSON endpoint for frontend (`/api/model-metrics`)
- `frontend/src/pages/BiasLensInvestigativeReport.tsx` → Section 3 fetches live data with strict fallback to local constants
- `app.py` + `src/dashboard.py` → Streamlit dashboard (unchanged)

---

## Project structure

```text
BiasLensAI/
├─ api.py
├─ app.py
├─ requirements.txt
├─ README.md
├─ scripts/
│  ├─ dev_up.sh
│  └─ dev_down.sh
├─ data/
│  ├─ adult-training.csv
│  └─ adult-test.csv
├─ src/
│  ├─ __init__.py
│  ├─ data_processing.py
│  ├─ modeling.py
│  └─ dashboard.py
└─ frontend/
   ├─ package.json
   └─ src/
```

---

## Setup

### Python deps

```bash
pip install -r requirements.txt
```

### Frontend deps

```bash
cd frontend
npm install
```

---

## One-command dev run (recommended)

From repo root:

```bash
bash scripts/dev_up.sh
```

Starts:

- Frontend: `http://localhost:5173`
- FastAPI: `http://localhost:8000`

### Fallback-mode run (API intentionally off)

```bash
bash scripts/dev_up.sh --fallback
```

Use this to validate React fallback behavior in Section 3.

### Optional: include legacy Streamlit

```bash
bash scripts/dev_up.sh --with-streamlit
```

Streamlit will be available on `http://localhost:8502`.

### Stop all dev processes

```bash
bash scripts/dev_down.sh
```

> Note: in restricted environments where execute-bit changes are blocked, always run scripts with `bash scripts/...`.

---

## API endpoint used by frontend

- `GET /api/model-metrics`

Returns:

- `section3ComparisonRows`
- `featureImpact.modelA`
- `featureImpact.modelB`
- `featureImpact.modelC`

---

## Quick verification checklist

1. Open frontend at `http://localhost:5173`
2. Confirm backend endpoint at `http://localhost:8000/api/model-metrics`
3. In browser DevTools → Network, verify `model-metrics` returns `200`
4. Compare Section 3 values against API response

For fallback check:

1. Run `bash scripts/dev_up.sh --fallback`
2. Refresh frontend
3. Confirm Section 3 still renders with local fallback data

---

## Known non-blocking warnings

- XGBoost may warn that `use_label_encoder` is unused.
- Running Streamlit-decorated code in bare Python/FastAPI may show Streamlit context warnings.

These warnings are expected and do not block API/frontend functionality.
