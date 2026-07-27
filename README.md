# H5P Sort the Paragraphs (CFRD) 1.0

Fork CFRD de **H5P.SortParagraphs** (upstream 0.11.16, `coreApi` 1.23, Lumi).

| Campo | Valor |
|-------|-------|
| `machineName` | `H5P.SortParagraphsCFRD` |
| Versión actual | **1.0.42** |
| Constructor JS | `H5P.SortParagraphsCFRD` |
| Editor | `semantics.json` + widgets (`H5PEditor.RangeList`, `H5PEditor.ShowWhen`, `H5PEditor.ColorSelectorCFRD`) — sin editor dedicado |
| Rama git | `sort-paragraphs-cfrd-1.0.0` |

## Características CFRD (1.0.x)

- **Instructions** — intro o pestaña (`H5P.Instructions`)
- **Contexto lateral** — bloque `context` (texto + imagen); `upgrades.js` migra `media` / `taskDescription` / `l10n` legacy
- **Play area 16:9** — interacción escalable (`js/play-area-scale.js`); pie de evaluación fuera del play area
- **Overall feedback en popup** — `H5P.QuestionCFRD.resolveOverallFeedback` + botón “Ver retroalimentación”
- **Apariencia por actividad** — colores en `appearance` (`js/appearance.js`)
- **Contratos** — puntuación, `resetTask`, estado persistido, statements xAPI

Referencia de portación: `../h5p-sort-paragraphs-cfrd-1.1/` y `dev/multi-choice-cfrd/h5p-multi-choice-cfrd-1.0/`.

## Archivos clave

| Archivo | Rol |
|---------|-----|
| `dist/h5p-sort-paragraphs-cfrd.js` | Bundle del player (webpack) |
| `dist/h5p-sort-paragraphs-cfrd.css` | Estilos del player |
| `js/play-area-scale.js` | API `PlayArea` 16:9 |
| `js/appearance.js` | Variables CSS de apariencia |
| `semantics.json` | Formulario del autor |
| `upgrades.js` | Migración de contenidos |
| `presave.js` | `maxScore` al guardar |
| `language/es.json` | Traducciones del editor |

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

## Checklist de entrega

- [x] Identidad `H5P.SortParagraphsCFRD` 1.0.x, `coreApi` 1.23
- [x] Semantics CFRD + `language/.en.json` + `es.json`
- [x] Player QuestionCFRD: botones, score, reset, xAPI, estado
- [x] Instructions + contexto
- [x] Play area 16:9 + pie de evaluación fuera
- [x] Popup de overall feedback
- [x] Apariencia por actividad
- [x] `upgrades.js` + `presave.js`
- [x] Sync Lumi (`npm run build` + `npm run sync:lumi`)
- [ ] Prueba manual en Lumi: crear / guardar / reabrir / ejecutar (instructions, contexto, ordenar, comprobar, popup, retry)

## Prueba en Lumi

1. Ejecutar build + sync (arriba).
2. Confirmar que Lumi apunta a `nuevas-librerias-h5p/` como carpeta de libraries.
3. Crear actividad Sort the Paragraphs (CFRD) y validar el checklist pendiente.

## Licencia

MIT — ver `library.json`.
