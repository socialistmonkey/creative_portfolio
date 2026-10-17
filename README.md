# Creative Portfolio

Portfolio website of Luka Biniashvili, styled as a retro CRT terminal.
Plain HTML, CSS and JavaScript. There is no build step and no dependencies.

Live site: https://binicreative.art

## Structure

```
index.html          cover page (boot sequence + title screen)
portfolio.html      index of all works
works/              one HTML page per work (01-digital-decay.html, 02-…)
css/style.css       all styles
js/data.js          list of works (order, slug, title)
js/main.js          navigation, keyboard, channel bar (every page)
js/player.js        video / image player (work pages)
js/crt.js           scanlines and power-on effect (every page)
media/              videos and images, one folder per work
assets/             favicons and the link-preview image
```

## Run locally

Open `index.html` in a browser, or serve the folder:

```
python3 -m http.server 8000
```

then visit http://localhost:8000.

## Add a work

See the comment at the top of `js/data.js`.

## Deploy

Static site. On Netlify (or any static host): no build command, publish directory is the repository root.

## License

- **Code** (HTML, CSS, JavaScript): [MIT](LICENSE).
- **Media and text** (everything in `media/` and `assets/`, and the written
  descriptions of the works): © 2026 Luka Biniashvili, all rights reserved.
  Please do not copy or reuse without permission.
- Some works contain footage, music or imagery owned by third parties. Those
  rights stay with their owners and are not covered by anything above.
