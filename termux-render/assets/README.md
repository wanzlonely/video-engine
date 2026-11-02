# Assets — Image Layers for Parallax Motion Graphics

Drop your images here. Recommended format: **WebP** or **PNG** (transparent where needed).

## Suggested files for Zanzibar story

| Filename                    | Used in scene     | Notes                                      |
|----------------------------|-------------------|--------------------------------------------|
| `sky-night.webp`           | hook, closing     | Dark starry / gradient sky                 |
| `sky-dusk.webp`            | setting, britain  | Warm dusk / colonial atmosphere            |
| `palace-front.png`         | setting           | Zanzibar palace / stone building           |
| `palace-ruins.png`         | bombardment, cost | Damaged version of palace                  |
| `warship.png`              | bombardment       | British warship silhouette / side view     |
| `sea-texture.webp`         | setting, bombardment | Optional sea overlay                    |
| `smoke.png`                | bombardment       | Soft smoke / fire particle (transparent)   |
| `flag-sultan.png`          | britain, closing  | Red flag                                   |
| `flag-britain.png`         | britain           | Union Jack / British flag                  |
| `crown.png`                | sultan-dies       | Golden crown (transparent bg)              |
| `clock-face.png`           | ultimatum         | Optional ornate clock                      |
| `ash.png`                  | cost              | Floating ash / dust                        |

## How layers work

In `zanzibar.json` each scene can have a `layers` array:

```json
"layers": [
  {
    "type": "image",
    "src": "assets/sky-night.webp",
    "parallax": 0.12,     // 0 = far (almost still), 1 = near (moves a lot)
    "scale": 1.15,
    "kenBurns": true
  },
  {
    "type": "procedural",
    "name": "sea",
    "parallax": 0.8
  },
  {
    "type": "particles",
    "kind": "dust",
    "parallax": 0.95
  }
]
```

### Layer types
- **image** → real PNG/WebP file
- **procedural** → built-in drawing (`sea`, `palace`, `stars`)
- **particles** → `dust` or `embers`

If an image is missing, the engine silently skips it and continues with procedural layers. So the video always looks good even before you add assets.

## Tips
- Size images roughly 1200–1600px wide for 1080×1920 output.
- Keep important subjects centered (Ken Burns will gently pan).
- Transparent PNG for foreground elements (palace, ships, crown, flags).
