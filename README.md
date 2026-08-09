# KCN Command Center

## Real merged app (Worldview + Cyber Security HQ + live flight data)

**`./app`** is the actual buildable, tested application that replaces the
Worldview and Cyber-Security-HQ static prototypes below with a real 3D
globe (high-res satellite textures, real day/night lighting), live
military flight tracking (OpenSky Network), and simulated cyber attack
trace arcs — all with toggleable, collapsible layers. See
[`app/README.md`](./app/README.md) for what's real vs. still planned
(satellites, live CCTV).

```bash
cd app
npm install
npm run server   # API on :4200
npm run dev       # separate terminal, app on :5173
```

Or via Docker: `cd app && docker compose up --build`, then open
`http://localhost:8080`.

---

# KCN Command Center — Four Independent Systems (original prototypes)

These four systems are being built as **separate projects**.  
They can later integrate under a unified KCN Command Center, but each stands alone as a fully functional platform.

**Owner access**: Fully free and unrestricted for the creator.

---

## Current Status

This repository currently contains **interactive static HTML prototypes** (with Three.js for 3D globe visualization where applicable).  

They are ready to open and explore immediately — no build step required.

| Project | Path | Status |
|---------|------|--------|
| Worldview | `./Worldview` | Prototype (3D globe + panels) |
| Cyber Security HQ | `./Cyber-Security-HQ` | Prototype |
| Nano Banana World Design | `./Nano-Banana-World-Design` | Prototype |
| Human AI Personal Growth | `./Human-AI-Personal-Growth` | Prototype |

The full prototypes live in `KCN-Command-Center.zip` and are **automatically extracted** when you open a Codespace.

Future work will expand these into full React / Vite applications.

---

## Quick Start (GitHub Codespaces)

1. Click **Code → Codespaces → Create codespace on Python-3** (or the default branch).
2. Wait for the container to start.  
   - The prototypes are extracted from the zip.  
   - A static server automatically launches on **port 8080**.
3. When prompted, open the forwarded port **8080** in the browser.
4. You will see the **KCN Command Center launcher**. Click any of the four cards to open that system.

Alternative (inside the Codespace terminal):

```bash
python3 -m http.server 8080
```

Or use the **Live Server** / **Live Preview** extension that is pre-installed.

---

## Quick Start (Local)

```bash
git clone https://github.com/Evank253/kcn-worldview-command-center.git
cd kcn-worldview-command-center
unzip -o KCN-Command-Center.zip -d /tmp/kcn
cp -r /tmp/kcn/KCN/Worldview/* Worldview/
cp -r /tmp/kcn/KCN/Cyber-Security-HQ/* Cyber-Security-HQ/
cp -r /tmp/kcn/KCN/Nano-Banana-World-Design/* Nano-Banana-World-Design/
cp -r /tmp/kcn/KCN/Human-AI-Personal-Growth/* Human-AI-Personal-Growth/
python3 -m http.server 8080
# Open http://localhost:8080
```

Or simply open `index.html` in a modern browser (some features work best via a local server).

---

## Project Structure

```
kcn-worldview-command-center/
├── index.html                          # Main launcher
├── README.md
├── CONTRIBUTING.md
├── KCN-Command-Center.zip              # Full prototypes (auto-extracted in Codespaces)
├── .devcontainer/
│   └── devcontainer.json               # Codespaces configuration
│
├── Worldview/
│   ├── README.md
│   ├── public/index.html               # Interactive prototype
│   └── src/                            # (future source)
│
├── Cyber-Security-HQ/
│   ├── README.md
│   ├── public/index.html
│   └── src/
│
├── Nano-Banana-World-Design/
│   ├── README.md
│   ├── public/index.html
│   └── src/
│
└── Human-AI-Personal-Growth/
    ├── README.md
    ├── public/index.html
    └── src/
```

---

## 1. KCN Worldview

**Path**: `./Worldview`  

Intelligence / knowledge-graph platform inspired by public recreations of Palantir-style systems.  
Interactive 3D globe, entity relationships, multi-source data fusion.  
Can display cyber events as one of its layers.

## 2. KCN Cyber Security Headquarters

**Path**: `./Cyber-Security-HQ`  

Dedicated cyber intelligence platform.  
Own globe view, live event list, systems health, attack & anomaly tracking, OSINT awareness.

## 3. KCN Nano Banana World Design

**Path**: `./Nano-Banana-World-Design`  

Full virtual architecture + interior/exterior + landscape design platform.  
AI design swarm concepts, materials, costing, code compliance, job tracking.

## 4. KCN Human AI Personal Growth & Development

**Path**: `./Human-AI-Personal-Growth`  

Self-discovery layer: personal profile, career & skills map, resume/portfolio builder, proof-of-skill system, privacy-first AI companion.

---

## Development Notes

- Current prototypes are pure HTML + CSS + JavaScript (Three.js loaded from CDN).
- No `npm install` is required yet.
- When the projects graduate to React/Vite, each folder will receive its own `package.json`, and the Codespaces config will be updated accordingly.

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## License

Owner / creator access is unrestricted. Additional licensing will be added as the projects mature.
