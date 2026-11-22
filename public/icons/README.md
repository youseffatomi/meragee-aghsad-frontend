# PWA icons

The web manifest (`app/manifest.ts`) references these files. Drop them in here
and no code change is needed:

- `icon-192.png` — 192×192, the launcher icon
- `icon-512.png` — 512×512
- `icon-maskable-512.png` — 512×512 with the artwork inside the safe zone
  (roughly the centre 80%), for Android's maskable icon

Until they exist, the manifest loads but the install experience shows a
placeholder icon.
