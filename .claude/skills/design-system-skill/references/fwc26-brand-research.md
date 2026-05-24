# FWC26 Brand Research Notes

Last reviewed: 2026-05-23

## Primary Sources

1. FIFA World Cup 26 Official Brand launch article (FIFA, 2023-05-18):
https://www.fifa.com/fifaplus/en/articles/world-cup-2026-official-brand-unveiled-canada-mexico-usa-celebration-football-diversity

2. FIFA World Cup 26 IP Guidelines v2.0 (FIFA, June 2024):
https://digitalhub.fifa.com/m/3567360896991b48/original/FIFA-World-Cup-26-IP-Guidelines.pdf

3. Design Week report on FIFA identity rollout (2023-05-22), citing FIFA's design-system framing:
https://www.designweek.co.uk/issues/22-may-26-may-2023/2026-fifa-world-cup-identity/

## Facts Carried Into The Skill

- Official tournament custom display typeface exists as `FWC 26` / `FWC 2026` and is protected.
- `Noto Sans` is used as a secondary/supporting typeface in the identity system.
- Core brand language is neutral and adaptable: black + white + trophy gold, with host/city color customization.

## Palette Extraction Method

Because public FIFA docs state color behavior but do not publish an open hex table in the accessible text, color tokens were extracted from official visual assets embedded in FIFA's IP Guidelines PDF.

Local extraction steps used:

```bash
pdfimages -all FIFA-World-Cup-26-IP-Guidelines.pdf imgs/img
```

Then dominant color sampling on emblem and host/city example images:

- Core emblem sample image: `img-010.jpg`
- Host/city variant sample images: `img-024.jpg`, `img-025.jpg`, `img-026.jpg`

Representative hex values selected from repeated clusters in those images.

## Confidence And Limits

- Confidence is high for directional and practical UI usage.
- Exact trademark production specs (Pantone/CMYK/official digital swatches) may only be distributed via FIFA mark request / graphic guidelines package.
- If rights-holder precision is required for broadcast/print lockups, request official files directly via FIFA Digital Archive mark request workflow.
