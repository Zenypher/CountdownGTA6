# GTA VI Countdown

A fan-made countdown built with HTML, CSS, and browser JavaScript modules.
Express serves the static files locally. The final hour automatically displays a vector logo mask and music-driven
countdown sequence.

## Run locally

Use Node.js 24.x and npm.

```bash
npm ci
npm start
```

Open <http://localhost:5000>. Use `npm run dev` for automatic server restarts
while editing server files; refresh the browser after frontend changes.

To choose another port:

```bash
PORT=8080 npm start
```

## Countdown behavior

The target is configured in `public/js/config.mjs`:

```javascript
export const release = Object.freeze({
  target: "2026-11-19T00:00:00Z",
  sourceUrl: "https://www.rockstargames.com/VI",
});
```

This is an explicit midnight UTC target, not a claim that the launch time has
been confirmed. Update it from an official announcement when appropriate.

The timer renders immediately and shows days, hours, minutes, and seconds.
Zero-value units are omitted; non-breaking spaces keep each value beside its
label. The calculation uses the current clock on each update rather than
subtracting seconds from a counter. Invalid targets show an unavailable message.

At zero, the headings change to “The wait is over” and “Welcome to Vice City,”
and the timer becomes a multiline completion message with a smaller font.
The completion wording is configured near the top of `public/js/main.js`.

## Final-hour sequence

The finale activates automatically when the configured release target is one hour
away, including when the page is opened during that hour. There are no preview
controls, simulated targets, or query parameters to activate a test mode.

### Current timeline

| Time remaining | Behavior |
| --- | --- |
| One hour | Black layer and gradient logo cutout appear |
| 12 seconds | Music starts once, from the beginning of the MP3 |
| 8 seconds | Zoom starts, after the four-second hold |
| 3 seconds | Gradient begins fading to reveal the normal artwork |
| Zero | Overlay disappears, completion text appears, entrance animations replay |

Audio is created and loaded only within the countdown's final minute; ordinary
visits do not request the MP3 immediately. Music plays without looping and may continue after zero until the file ends.
The audio and animation share a countdown trigger; this implementation does not
seek to the end of the track or synchronize individual musical beats. Browser
autoplay rules may block playback, especially without a prior user interaction.

Timing constants live in `public/js/finale.mjs`:

```javascript
export const FINAL_HOUR_MS = 60 * 60 * 1000;
export const MUSIC_LEAD_MS = 12 * 1000;
export const TRANSITION_DELAY_MS = 4 * 1000;
export const TRANSITION_MS = MUSIC_LEAD_MS - TRANSITION_DELAY_MS;
```

Keep the music window
longer than the hold when changing these values. The gradient fade duration is
three seconds in the scene renderer.

### Rendering and styling

The mask uses inline SVG paths in `public/index.html`. Each frame updates a
vector transformation matrix rather than enlarging a filtered image. The camera
zooms through the hole in the “e” in “theft,” with an endpoint calculated to cover
the viewport. Unchanged geometry and opacity values are skipped, and the frame
loop owns scene rendering while the one-second timer updates text.

`artwork/gta-vi-logo.svg` is the canonical source for both logo variants. To edit
the logo, update that source and run:

```bash
python3 scripts/prepare-assets.py
```

This developer-only step requires Python 3 with its standard library. It generates
`public/assets/gta-vi-logo.v1.svg` and the inline mask, removing unused styles,
unreferenced SVG definitions, and editor metadata from the header asset. Normal
startup and hosting do not need Python. The header loads the generated SVG as a
cacheable image; the custom element no longer embeds the whole asset in JavaScript.
Increment the output asset version and update its reference in `logo.js` and the
generator when publishing changed artwork with immutable caching.

Edit `public/css/layout.css` for the gradient colors, entrance durations, timer
styles, and black-layer opacity (`#finale-portal > rect`, currently `0.98`). The
background switches between mobile, tablet, and desktop WebP assets at 768px and
1024px. Reduced-motion preferences disable entrance animations and the zoom;
the finale uses a fade instead. Entrance animations use opacity and movement
without blur filters.

## Project structure

```text
app.js                         Local Express static server
public/index.html              Page markup and inline vector mask
public/css/layout.css          Layout, backgrounds, and animations
public/js/config.mjs           Release target and official link
public/js/countdown.mjs        Pure remaining-time calculation
public/js/main.js              Countdown UI and animation scheduling
public/js/finale.mjs            Finale state, geometry, and entrance replay
public/js/finale-audio.mjs      One-shot audio playback and reset
public/js/logo.js              Lightweight logo image custom element
artwork/gta-vi-logo.svg         Canonical logo source
scripts/prepare-assets.py       Rebuilds optimized SVG and inline mask
public/assets/                 Artwork, music, and SVG reference
tests/                        Countdown, timing, geometry, audio, frame-loop tests
```

## Validation

```bash
npm test
```

Tests cover countdown boundaries, invalid dates, finale phases, vector camera
geometry, one-shot playback, and animation-loop scheduling/reset. Timing
expectations derive from the configuration constants.

Also check the page in a browser at mobile and desktop widths, with zoom and
reduced motion enabled. Audio playback depends on browser autoplay permissions. The project
targets current browsers supporting JavaScript modules, SVG masks, CSS `clamp()`,
and the `inert` property; old browser version guarantees are not provided.

## Hosting and caching

Deploy `public/` to a static host, or run `npm start` on a Node host. Static hosting
needs no frontend build step. Google Fonts is an external dependency; fallback
fonts remain available when its requests fail.

The local server revalidates ordinary assets with `Cache-Control: no-cache`.
Images named with a `.v<number>.webp`, `.v<number>.avif`, or `.v<number>.svg` suffix get a one-year
immutable cache policy. The backgrounds and generated header logo use versioned filenames. Their content
and dimensions are unchanged by the filename versioning. Change the version and
update references whenever publishing new image contents. Configure
production headers through your static hosting provider when Express is bypassed.

## License and third-party assets

The project's original code is available under the [MIT License](LICENSE),
copyright 2026 Sebastian Iosif.

This repository also contains GTA artwork, logos, and music. The project's MIT
license does not establish permission to reuse third-party material. Their
owners retain their rights. Asset source URLs, authorship, and redistribution
permissions have not been documented here; verify and record those separately
before redistributing the assets. Google Fonts and npm dependencies have their
own licenses.

This is an unofficial fan project, unaffiliated with Rockstar Games or Take-Two
Interactive. Grand Theft Auto names and logos belong to their respective owners.
