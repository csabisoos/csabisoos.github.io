---
title: Mederi
subtitle: "Clinical Safety Net — Post-Diagnostic AI Guardian"
award: "Bosch x Richter Ipari Innovációs Díj (Industrial Innovation Award)"
awardShort: "Bosch × Richter Innovation Award"
badge: "Silent Safety Net"
role: "Sole Author & Architect"
period: "2025"
status: poc
featured: true
tags:
  - Python
  - HL7 FHIR R4
  - RAG
  - FAISS
  - LangChain
  - FastAPI
  - SQLite
  - Ollama (Llama 3)
  - On-Premise AI
  - Healthcare Systems
  - GDPR Compliant
  - EU AI Act
githubUrl: "https://github.com/csabisoos/Mederi"
description: >
  Mederi is an invisible, post-diagnostic safety layer for clinicians.
  After a physician finalises a diagnosis and treatment plan, Mederi
  silently cross-references it against the patient's full medical history
  and validated clinical guidelines — and raises a color-coded alert only
  when a dangerous contradiction is found. All inference runs locally
  using Ollama + Llama 3; no patient data ever leaves the institution.
architecturePillars:
  - icon: "🧠"
    title: "Hallucination-Free Local RAG"
    description: "LangChain RetrievalQA chain backed by a per-request FAISS in-memory vector index over evidence-based clinical guidelines. Every LLM output is grounded in retrieved source chunks — zero hallucination surface area."
    tags: ["FAISS", "LangChain", "Ollama Llama 3", "Embeddings"]
  - icon: "🔗"
    title: "Native HL7 FHIR R4 Interoperability"
    description: "FastAPI + Uvicorn FHIR integration layer that validates and ingests Patient, Condition, Observation, MedicationRequest, and AllergyIntolerance resources. One standard HTTP call from any hospital EHR brings a patient live into Mederi."
    tags: ["FastAPI", "fhir.resources", "FHIR R4", "REST API"]
  - icon: "🔒"
    title: "100% Air-Gapped On-Premise Privacy"
    description: "Zero external API calls. Ollama runs fully offline after model download. All patient data lives in a local SQLite database. FAISS index is rebuilt in-memory per request and never persisted to disk. GDPR and EU AI Act compliant by architecture."
    tags: ["Ollama", "SQLite", "On-Premise", "GDPR", "EU AI Act"]
metrics:
  - label: "External API calls"
    value: "0"
  - label: "Patient data transmission"
    value: "0 bytes"
  - label: "Alert latency"
    value: "< 3s"
  - label: "FHIR resources supported"
    value: "4+"
scenarios:
  - id: "drug-allergy"
    title: "Penicillin → Amoxicillin cross-reactivity"
    outcome: "alert"
    summary: "Anna Kovács (P001) has documented anaphylaxis-grade Penicillin allergy since 2018. Mederi immediately flags Amoxicillin (a β-lactam) as contraindicated, escalating to Status: Alert with a one-sentence rationale and actionable recommendation."
  - id: "dvt-risk"
    title: "Multi-signal DVT / pulmonary embolism risk"
    outcome: "alert"
    summary: "Béla Tóth (P002) presents with unilateral leg swelling and elevated D-dimer. Mederi correlates four independent signals — symptoms, labs, history, and guideline thresholds — and raises a combined DVT risk alert before the doctor finalises anticoagulation."
  - id: "fhir-ingestion"
    title: "Live FHIR R4 patient ingestion"
    outcome: "clear"
    summary: "A single HL7 FHIR R4 Patient POST to /api/v1/fhir/Patient validates the payload, persists to SQLite, and makes the patient available in the Streamlit UI without any restart. Demonstrates zero-downtime EHR integration."
---

## The Problem: Data-Driven Medicine's Paradox

Modern medicine's greatest threat is not the lack of data — it is the impossibility of processing it. The global medical knowledge base **doubles every 73 days**. This creates two compounding crises:

1. **Cognitive overload & diagnostic error** — clinicians cannot keep pace with evolving contraindication lists, drug interaction databases, and guideline updates.
2. **The Privacy-Innovation Deadlock** — cloud-based AI systems (GPT-4, etc.) that could help are legally barred from clinical workflows under strict GDPR and EU AI Act requirements, because processing sensitive patient data on external servers constitutes a data protection violation.

The result: a technological gap between what AI can offer and what hospitals can legally deploy.

## Solution: Mederi — The "Silent Safety Net"

Mederi is a **post-diagnostic clinical safety layer**. It does not replace the physician. It operates invisibly in the background and intervenes with color-coded alerts *only* when the finalized diagnosis or treatment plan contradicts established clinical guidelines or patient-specific contraindications (allergies, current medications, lab results, chronic conditions).

The alert format is deliberately minimal — not a wall of warnings:

```
Status:         Alert
Reason:         Amoxicillin is contraindicated — patient has anaphylactic Penicillin allergy (cross-reactivity, β-lactam class).
Recommendation: Switch to Azithromycin 500mg OD for 3 days (non-β-lactam alternative).
```

## Technical Architecture

### Execution Stack

| Layer | Technology |
|---|---|
| Clinical Dashboard | Streamlit (EN 🇬🇧 + HU 🇭🇺 localisation) |
| FHIR Integration API | FastAPI + Uvicorn |
| FHIR Schema Validation | `fhir.resources` (FHIR R4) |
| Persistence Layer | SQLite + SQLAlchemy 2.x ORM |
| RAG Orchestration | LangChain (`langchain-community`) |
| LLM Inference | Ollama — Llama 3 (local, air-gapped) |
| Embeddings | Ollama — Llama 3 (local) |
| Vector Search | FAISS (in-memory, per-request) |
| Safety Guidelines | `data/guidelines.json` — curated clinical protocols |

### Data Flow

```
EHR System
    │
    ▼  HL7 FHIR R4 POST
FastAPI FHIR Bridge (fhir_api.py)
    │  Validates with fhir.resources
    │  Extracts: Patient, Condition, Observation, MedicationRequest
    ▼
SQLite Database (database.py / SQLAlchemy ORM)
    │
    ▼  load patient context
RAG Engine (rag_engine.py)
    │  LangChain RetrievalQA
    │  FAISS vector index (in-memory, per-request)
    │  over data/guidelines.json
    ▼
Ollama Llama 3 (local LLM)
    │
    ▼
Safety Decision
    ├── Status: Clear  ✅  (no output shown to clinician)
    └── Status: Alert  🔴  (structured alert surfaced in Streamlit UI)
```

### RAG Pipeline Detail

The `rag_engine.py` module constructs a fresh FAISS vector store for every safety check:

1. **Document preparation** — Clinical guidelines from `guidelines.json` are split into overlapping chunks via `RecursiveCharacterTextSplitter`.
2. **Embedding** — Each chunk is embedded using Ollama's local Llama 3 embedding endpoint — zero external calls.
3. **FAISS indexing** — An in-memory FAISS index is built and immediately searched for the top-k most relevant guideline chunks.
4. **RetrievalQA chain** — The retrieved context is assembled with the patient record and submitted to the Llama 3 chat model via a strict system prompt that enforces the `Status: Clear / Alert` output format.
5. **Index disposal** — The FAISS index is garbage-collected at the end of the request. No embeddings are persisted.

### FHIR API Endpoints

```
POST /api/v1/fhir/Patient             # Ingest & persist a FHIR R4 Patient resource
POST /api/v1/fhir/Condition           # Ingest clinical conditions
POST /api/v1/fhir/Observation         # Ingest lab observations
POST /api/v1/fhir/MedicationRequest   # Ingest medication prescriptions
GET  /docs                            # Interactive OpenAPI documentation (Swagger UI)
```

## Clinical Case Studies

### Case 1: Drug Allergy Cross-Reactivity

**Patient:** Anna Kovács (ID: P001) — 45 years old, documented **Penicillin anaphylaxis** since 2018 (severity: SEVERE, reaction: anaphylaxis requiring epinephrine).

**Doctor's input:** Suspected streptococcal pharyngitis → prescribes Amoxicillin 500mg TID.

**Mederi output:**
```
Status:         Alert
Reason:         Amoxicillin is a β-lactam antibiotic with ~10% cross-reactivity with
                Penicillin. Patient has documented anaphylactic reaction to Penicillin.
                Life-threatening risk.
Recommendation: Prescribe Azithromycin 500mg OD for 3 days (macrolide, non-β-lactam).
```

### Case 2: Multi-Signal DVT Risk

**Patient:** Béla Tóth (ID: P002) — 62 years old, chronic atrial fibrillation, currently on Warfarin.

**Doctor's input:** Unilateral left leg swelling + dyspnea → suspects muscular strain → prescribes NSAIDs.

**Mederi correlates:**
- Symptom pattern (Wells score territory: unilateral swelling + dyspnea)
- Elevated D-dimer (lab: 1.8 μg/mL, threshold: 0.5)
- Patient already on anticoagulation (Warfarin — implies known thromboembolic risk)
- NSAIDs can potentiate bleeding risk on anticoagulants

**Mederi output:**
```
Status:         Alert
Reason:         Clinical picture is consistent with DVT/PE. D-dimer markedly elevated.
                NSAIDs contraindicated with concurrent Warfarin (bleeding risk).
Recommendation: Urgent CT pulmonary angiography. Hold NSAIDs. Review anticoagulation.
```

## Economic & Social Impact

- **Direct cost reduction** — Medical error liability in Hungary reaches **4–11 billion HUF annually**. Mederi's automated contradiction detection provides a documented safety audit trail.
- **Guideline retrieval** — Reduced from minutes of manual search to **sub-second** automated RAG retrieval.
- **Physician burnout** — Removes the cognitive burden of cross-referencing the entire patient record against all guideline updates.
- **Bosch × Richter ecosystem scalability** — Bosch smart sensors (autonomous patient transport, vitals monitoring) + Richter drug interaction database integration → personalized medicine roadmap.

## Privacy & Compliance Architecture

- ✅ **Zero external API calls** — Ollama runs fully offline after initial model download (~4.7 GB).
- ✅ **No telemetry** — No usage data transmitted anywhere.
- ✅ **Local SQLite** — All patient data stored in `data/mederi.db` on the institution's machine.
- ✅ **In-memory vector store** — FAISS index rebuilt per-request, never written to disk.
- ✅ **Patient-scoped retrieval** — Each safety check only loads the selected patient's record.
- ✅ **EU AI Act compliance** — Every alert includes source attribution (retrieved guideline chunk). Physician retains full override authority (Human-in-the-Loop architecture).
- ✅ **GDPR compliant by design** — Sensitive data never leaves the institution's network boundary.

## Award Context

Mederi was submitted to the **Bosch × Richter Ipari Innovációs Díj** (Bosch × Richter Industrial Innovation Award) 2026 — Hungary's premier industrial innovation competition, sponsored by Robert Bosch Kft. and Gedeon Richter Plc. The submission demonstrates how AI can be deployed in regulated clinical environments without compromising on data sovereignty, legal compliance, or clinical safety.

> *"Mederi is not a replacement for doctors — it is the silent co-pilot that makes sure nothing falls through the cracks."*
> — Csaba Soós, Author
