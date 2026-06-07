# GroundLevel · UK Legal Research

> Obsidian plugin · search the bundled UK case database, run the 7-strand weave engine, score legal risk, draft court-ready documents, and audit compliance — all from inside Obsidian. Citations inserted at your cursor. Zero network calls by default.

```
attorneys live in Obsidian for case research
this plugin gives them the GroundLevel engines on hotkey
search → cite → draft → audit · without leaving the editor
```

---

## Install

### From the Community Plugins browser

> Once approved by the Obsidian team. Until then use the manual install below.

### Manual install

1. Open Settings → Community plugins → Turn **on** "Browse community plugins"
2. Open your vault's `.obsidian/plugins/` directory
3. Create folder `groundlevel/`
4. Download these three files into it from the [latest release](https://github.com/sjgant80-hub/groundlevel-obsidian/releases) (or from the repo root):
   - `manifest.json`
   - `main.js`
   - `styles.css`
5. Settings → Community plugins → reload list → enable **GroundLevel · UK Legal Research**

You should now see a ⚖ scale icon in the left ribbon.

### From source

```bash
cd /path/to/your-vault/.obsidian/plugins
git clone https://github.com/sjgant80-hub/groundlevel-obsidian groundlevel
# reload obsidian → enable
```

No build step required — the plugin is plain JS.

---

## Commands

Run via `Ctrl/Cmd + P` → "GroundLevel: ..."

| Command | What it does |
|---|---|
| **Search UK cases · insert at cursor** | Modal · type query · pick one or more cases (checkbox) · markdown inserted at the cursor |
| **Run 7-strand weave** | Modal · query + optional pattern · drops a 7-strand table at the cursor |
| **Score legal risk on selection / query** | Modal · query + optional pattern · drops a STRONG/MODERATE/WEAK/INADVISABLE badge |
| **Draft court document** | Modal · pick type (particulars / witness / skeleton / brief / etc.) + facts → court-ready draft inserted |
| **Run compliance audit** | Modal · posture form (UK GDPR / EU AI Act / ERA 1996 / CRA 2015 / H&S / cyber) → gaps table inserted |
| **Insert case by ID (quick pick)** | Fuzzy-search any of the 28 bundled cases by ID and drop it at the cursor |

### Suggested hotkeys

Settings → Hotkeys → search "GroundLevel":

- Search cases: `Ctrl/Cmd + Shift + L`
- Run weave: `Ctrl/Cmd + Shift + W`
- Risk score: `Ctrl/Cmd + Shift + R`
- Draft document: `Ctrl/Cmd + Shift + D`

---

## What gets inserted

### Search cases · `caseToMarkdown`
```markdown
> **Tiensia v Vision Enterprises Ltd [2010] EWCA Civ 1224** · Court of Appeal · 2010
> *housing/deposit* — Strict liability for non-protection of deposit.
> Statute: Housing Act 2004 ss.213-215
```

### Run weave
```markdown
## ◊ Weave · employer dismissed me without process

| Strand | Weight | Top authority |
|---|---|---|
| ⚖ MAGNA | 0.0 | — |
| 🕊 LIBERTY | 0.4 | Lloyd v Google LLC [2021] UKSC 50 — GDPR Art 82 needs individualised damage. |
| 👑 CROWN | 0.7 | R (Bridges) v Chief Constable SWP [2020] EWCA Civ 1058 — Biometric processing needs clear legal basis. |
| ⚪ EQUITY | 0.9 | Polkey v AE Dayton Services Ltd [1988] ICR 142 — Procedural fairness · Polkey reduction. |
| 🏠 HEARTH | 0.0 | — |
| ⚒ GUILD | 1.0 | Polkey v AE Dayton Services Ltd [1988] ICR 142 — Procedural fairness · Polkey reduction. |
| ⚓ ADMIRALTY | 0.0 | — |
```

### Risk score
```markdown
> **Risk: WEAK · 25%** — *employer dismissed me without process*
> Uphill battle. ADR preferred over litigation. Estimated success 15-35%.
```

### Compliance audit
```markdown
## ◊ Compliance Audit · Score 47/100

| Severity | Framework | Gap | Remedy |
|---|---|---|---|
| high | UK GDPR / DPA 2018 | No DPAs with sub-processors · Art 28 UK GDPR breach. | Execute DPA with all sub-processors. |
| high | EU AI Act Art 12 | AI in production with EU users, no Art 12 audit logging chain. Required Aug 2 2026. | Install fall-euaiact audit-shim. |
| high | UK GDPR · DPA 2018 | No data breach response plan · 72-hour reporting at risk. | Build breach playbook. |
```

---

## What's bundled

- **28 landmark UK cases** spanning housing, employment, data, consumer, money, court procedure, public law, international
- **10 weave patterns** · unfair_dismissal, deposit_dispute, gdpr_breach, consumer_refund, whistleblowing, platform_unpaid, frozen_account, illegal_eviction, discrimination, subscription_trap
- **7 weave strands** · MAGNA · LIBERTY · CROWN · EQUITY · HEARTH · GUILD · ADMIRALTY
- **13 compliance rules** covering UK GDPR, EU AI Act, ERA 1996, ACAS Code, CRA 2015, CCRs 2013, H&S Act 1974, cyber posture
- **7 document templates** · particulars of claim, witness statement, skeleton argument, position statement, legal brief, compliance report, due diligence

The data + engines are inlined into `main.js` so the plugin works on a laptop with no internet. Zero network calls by default.

---

## Privacy

- **No telemetry.** The plugin never phones home.
- **No data leaves your vault.** Searches, weaves, drafts, audits all run in-process.
- **No accounts.** Nothing to sign up for.

---

## Sister packages

The engines used here come from the [GroundLevel package](https://github.com/sjgant80-hub):

- [`@sjgant80-hub/groundlevel-sdk`](https://github.com/sjgant80-hub/groundlevel-sdk) · the engines (Node + browser · npm/esm)
- [`@sjgant80-hub/groundlevel-worker`](https://github.com/sjgant80-hub/groundlevel-worker) · Cloudflare Worker REST API
- [`@sjgant80-hub/groundlevel-shim`](https://github.com/sjgant80-hub/groundlevel-shim) · CDN drop-in `<script>` for any site
- [`@sjgant80-hub/groundlevel-mcp`](https://github.com/sjgant80-hub/groundlevel-mcp) · MCP server for Claude Code / Cursor
- [GroundLevel Pro](https://github.com/sjgant80-hub/groundlevel) · the full single-file PWA

When the SDK gets new cases, this plugin gets a release with the same. One source of truth.

---

## Test

```bash
git clone https://github.com/sjgant80-hub/groundlevel-obsidian
cd groundlevel-obsidian
node --test test/plugin.test.js
```

12 assertions covering the inlined engines + markdown formatters.

---

## Caveats

- **Not legal advice.** Information and templates only. A solicitor reviews before any irreversible step.
- **UK-focused.** Most of the bundled DB is England & Wales. Adjust for Scotland / NI / other jurisdictions before sending.
- **No mobile parity yet.** `isDesktopOnly` is `false` in the manifest but the modals were designed for keyboard + screen. Mobile testing PRs welcome.

---

## Licence

MIT · the law is public · the templates are simple · the jargon is the paywall.

**◊·κ=φ⁴**
