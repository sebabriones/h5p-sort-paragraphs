# H5P Sort the Paragraphs (CFRD) 1.0

Fork CFRD de **H5P.SortParagraphs** (upstream 0.11.16, `coreApi` 1.23, Lumi).

| Campo | Valor |
|-------|-------|
| `machineName` | `H5P.SortParagraphsCFRD` |
| Versión actual | **1.0.3** |
| Constructor JS | `H5P.SortParagraphsCFRD` |
| Editor | `semantics.json` + widgets upstream — sin editor dedicado |
| Rama git | `sort-paragraphs-cfrd-1.0.0` |

## Estado (1.0.3)

Etapa 3 — `H5P.Instructions.attach` (intro/pestaña) y layout de contexto (texto + imagen en columna lateral). Pendiente: play area 16:9, popup de feedback y apariencia por actividad (etapas 4+).

Referencia de portación: `../h5p-sort-paragraphs-cfrd-1.1/` y `dev/multi-choice-cfrd/h5p-multi-choice-cfrd-1.0/`.

## Desarrollo y sync

Build con webpack (`src/` → `dist/`). Ejecutar **`npm run build`** antes de sync.

```powershell
cd dev/sort-paragraphs-cfrd/h5p-sort-paragraphs-cfrd-1.0
npm run build
npm run sync:lumi
```

El script `../scripts/sync-lumi.ps1` publica en este orden:

1. `H5P.Instructions`
2. `H5P.JoubelUICFRD-1.0`
3. `H5P.QuestionCFRD-1.0`
4. `H5P.SortParagraphsCFRD-1.0` → `nuevas-librerias-h5p/H5P.SortParagraphsCFRD-1.0/`

Guía central de sync: [docs/sync-lumi.md](../../../docs/sync-lumi.md).

## Licencia

MIT — ver `library.json`.
