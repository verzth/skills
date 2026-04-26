# pm-thinking

> **AI-First Product Management — opinionated workflow for tech-literate Product PMs.**

A bundle yang turns Claude into a virtual PM team. **One install** → langsung dapet 3 skill: `/pm-discover` (researcher), `/pm-works` (senior PM), `/pm-decide` (strategist).

Inspired by [gstack](https://github.com/garrytan/gstack) (Garry Tan, YC). Where gstack turns Claude into an engineering team for builders, **pm-thinking turns Claude into a PM team for product thinkers.**

## Philosophy

PM yang AI-First **bukan PM yang nulis lebih cepet pake AI**. PM yang AI-First adalah **orchestrator**: AI yang sintesis raw input, AI yang draft, AI yang challenge balik — PM yang ambil keputusan akhir.

Empat prinsip inti:

1. **Forcing questions, bukan template.** Setiap skill nge-push lo jawab pertanyaan tajam — gak kasih form kosong buat di-isi.
2. **Output Markdown yang feed skill berikutnya.** `discovery.md` jadi input `/pm-works`. `prd.md` jadi input `/pm-decide --review`. Gak ada yang kelewat.
3. **Tech-aware, bukan tech-decide.** PM harus ngerti dampak teknis (schema, API, backward compat) tapi gak ngambil keputusan engineering. Boundary jelas ke `engineer-manager` skill.
4. **Numbered questions, anti-ambiguity.** Setiap question ke user di-label (1/2/3 atau a/b/c). User respond "1a, 2c" — done. Hemat effort, audit trail bersih.

Detail lengkap di [ETHOS.md](./ETHOS.md).

## The 3 skills

| Skill | Peran spesialis | Sprint stage |
|-------|----------------|--------------|
| [`/pm-discover`](./pm-discover/SKILL.md) | **User Researcher + Strategist** — sintesis raw user input, reframe pain → hypothesis | Discover |
| [`/pm-works`](./pm-works/SKILL.md) | **Senior Product PM (tech-literate)** — tulis PRD lengkap dengan Tech Implications section, siap handoff ke engineer-manager | Define |
| [`/pm-decide`](./pm-decide/SKILL.md) | **Product Lead + Reviewer + Comms + Reflective PM** — `--prio` / `--review` / `--stakeholder` / `--retro` modes | Decide / Communicate / Reflect |

## Sprint flow

```
                                                           ┌──────────────────────────┐
                                                           │ /pm-decide --prio        │
                                                           │   (lintas item, kapan aja)│
                                                           └──────────────────────────┘
                                                                       ↑
/pm-discover ──→ /pm-works ──→ /pm-decide --review ──→ [HANDOFF ENG-MANAGER]
                                                                       ↓
                                                           ┌──────────────────────────┐
                                                           │ /pm-decide --stakeholder │
                                                           │   (selama build)          │
                                                           └──────────────────────────┘
                                                                       ↓
                                                                    [SHIP]
                                                                       ↓
                                                           ┌──────────────────────────┐
                                                           │ /pm-decide --retro       │
                                                           │   (post-launch)           │
                                                           └──────────────────────────┘
```

## Install — sekali, langsung dapet 3 skill

### Claude Code (per-user)

```bash
# Clone repo verzth/skills, taruh pm-thinking di skills directory Claude Code
git clone https://github.com/verzth/skills.git ~/.verzth-skills
ln -s ~/.verzth-skills/pm-thinking ~/.claude/skills/pm-thinking
```

Habis itu, restart Claude Code. Ketiga skill akan muncul:
- `/pm-discover`
- `/pm-works`
- `/pm-decide`

### Cowork (Claude desktop app)

Drop folder `pm-thinking/` ke `~/.claude/skills/`. Karena setiap subfolder yang punya `SKILL.md` dianggap satu skill oleh Claude, install pm-thinking otomatis dapet 3 skill di dalemnya.

### Per-project (tim sharing)

Dari root repo project lo:

```bash
mkdir -p .claude/skills && ln -s ~/.verzth-skills/pm-thinking .claude/skills/pm-thinking
git add .claude && git commit -m "add pm-thinking skill bundle"
```

Tim lo yang clone repo bakal otomatis dapet ketiga skill begitu mereka set up `.verzth-skills` lokal-nya.

### Update

```bash
cd ~/.verzth-skills && git pull
```

Sekali pull, ketiga skill ikut update.

## Tools integration

pm-thinking opportunistically calls connected MCP tools — **kalau ada, dipake; kalau gak ada, fallback ke manual**:

| Tool | Dipake oleh | Untuk apa |
|------|-------------|-----------|
| **Notion** | discover, works, decide | Read user research notes, write PRD/update/retro pages |
| **BigQuery** | discover, decide (--prio, --retro) | Query support tickets, NPS, post-launch metrics |
| **Pencil Dev** | works | Read mockup links, embed di PRD |

Skill gak akan minta lo connect tools yang gak ada — straight ke manual mode.

## Boundary: pm-thinking vs engineer-manager

pm-thinking **TIDAK** ngambil keputusan teknis dalam berikut:
- Pilih database / framework / arsitektur
- Trade-off performance vs cost
- Service boundary / API design (di-level implementasi)
- Infra / deployment strategy

Untuk semua itu, hand-off ke `engineer-manager` skill (separate, dibangun terpisah).

`pm-thinking` cukup **sadar** dampaknya (schema baru? backward compat? data privacy?) — biar engineer gak surprise pas kickoff. Detail di [references/handoff-to-eng-manager.md](./references/handoff-to-eng-manager.md).

## License

MIT.
