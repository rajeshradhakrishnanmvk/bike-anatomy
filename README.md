# Bike Anatomy

Harley-Davidson Bike Anatomy: part-by-part studies of the early Flatheads. Each machine is researched in NotebookLM, then drawn as a single-file 3D viewer in raw WebGL, with zero dependencies.

The gallery is static HTML, CSS, and vanilla JavaScript. GitHub Pages serves this repository from the `main` branch at the site root:

https://rajeshradhakrishnanmvk.github.io/bike-anatomy/

There is no build step and no package install. `.nojekyll` is present so Pages publishes every file as-is.

## Preview locally

From the repository root:

```bash
python3 -m http.server 8080
```

Open `http://127.0.0.1:8080/`. Use a local server rather than a `file://` URL if you want the pages to behave the way Pages does. Paths are relative, so the same files work at the project-site prefix `/bike-anatomy/`.

## Layout

```
index.html          Gallery. Reads bikes.js.
bike.html           One study page for every motorcycle (?slug=).
bikes.js            The only list you edit when a bike is added.
css/site.css        Workshop styling. System fonts only.
css/chat.css        Chat panel styling.
js/site.js          Renders the gallery and the study page.
js/chat.js          Chat with the bike (study page).
favicon.svg
.nojekyll
bikes/<slug>/       One folder per motorcycle.
```

A study page shows the silent tour, the NotebookLM mind map and infographic (click to enlarge), and links into the viewer. Card actions:

- **Open 3D viewer** → `bikes/<slug>/index.html`
- **Watch tour** → the study page, at the film
- **Exploded view** → `bikes/<slug>/index.html?explode=1`

The study page also links to `?tour=1`, which plays the auto-tour inside the viewer. The viewers are stored unchanged; the gallery does not rewrite them.

## Add a motorcycle

1. Pick a slug of lowercase letters, digits, and hyphens, for example `wla`.
2. Create `bikes/<slug>/` and copy the single-file viewer to `bikes/<slug>/index.html`. Leave that file as its own page. It should honor `?tour=1` and `?explode=1`, the way the Model D and V / VL viewers do.
3. Add the research files next to the viewer, using these names:

   | File | Role |
   | --- | --- |
   | `poster.png` | Original cover art. 16:9 looks right on the card. |
   | `poster.jpg` | Compressed cover, used on the card and as the video poster. |
   | `tour.mp4` | Silent auto-tour, about one minute. |
   | `mindmap.png` | Original NotebookLM Studio mind map. |
   | `mindmap.jpg` | Compressed mind map for the page. |
   | `infographic.png` | Original NotebookLM Studio infographic. |
   | `infographic.jpg` | Compressed infographic for the page. |

   Keep the PNGs. The study page links them as “Original PNG”. The JPEGs are what the gallery loads first. A plain export is enough; ImageMagick, Preview, or ffmpeg all work. Example, from inside the new folder, for an opaque PNG:

   ```bash
   ffmpeg -y -i poster.png -vf "scale='min(1600,iw)':-2:flags=lanczos" -q:v 3 poster.jpg
   ffmpeg -y -i mindmap.png -vf "scale='min(2400,iw)':-2:flags=lanczos" -q:v 4 mindmap.jpg
   ffmpeg -y -i infographic.png -vf "scale='min(2400,iw)':-2:flags=lanczos" -q:v 4 infographic.jpg
   ```

   If a PNG has a transparent edge, flatten it onto white before saving the JPEG so the fringe does not turn black.

4. Append one object to the `BIKES` array in `bikes.js`:

   ```js
   {
     slug: "wla",
     name: "WLA",
     family: "45 cu in Flathead",
     years: "1940–1952",
     year: 1940,
     spec: "45 cu in Flathead solo",
     blurb: "One sentence for the card."
   }
   ```

   `year` is the first model year and controls shop order (earliest first). `years` is the label. Optional `order` replaces `year` for sorting when two machines start together. Optional `posterAlt`, `mindmapAlt`, and `infoAlt` are the image descriptions; without them the page uses the name.

5. Add `bikes/<slug>/persona.json` (see Chat with the bike below) so the bike can talk.
6. Reload. No build, no new HTML file.

The card and the study page are generated from that entry. `index.html`, `bike.html`, `css/site.css`, and `js/site.js` stay as they are.

## Chat with the bike

Every study page has a **Chat with your bike** button, and every card has a **Chat with the bike** link. The motorcycle answers in the first person from `bikes/<slug>/persona.json`, a short list of facts taken from that bike's NotebookLM report.

- Live answers come from `https://chat.srv1536099.hstgr.cloud/bike/v1/chat/completions`, a small proxy on the VPS. It adds the model key on the server, accepts requests only from this Pages site, rate limits each visitor, caps reply length, and builds the system prompt from the persona file on `main`. There is no key anywhere in this repository or in the browser.
- If the live chat is slow (20 seconds with no reply), busy, rate limited or down, the page answers from the same facts with a keyword match and says it is in quick facts mode.
- The conversation is kept for the browser tab only (`sessionStorage`).
- Add `&chat=offline` to a study page URL to try quick facts mode.

`persona.json` fields:

| Field | Role |
| --- | --- |
| `slug`, `name`, `years` | Same as `bikes.js`. |
| `voice` | One sentence on how the bike talks about itself. |
| `greeting` | First message in the panel. |
| `starters` | Three or four starter questions. |
| `facts` | 10 to 15 items. `a` is one or two first-person sentences from the report; `k` is a list of lowercase keywords for quick facts mode. |
| `unknowns` | Source conflicts and gaps, so the bike says it doesn't know instead of guessing. |

Keep facts short. The model runs on a small CPU, and the whole prompt should stay under about 400 words.

## Credits

Research with NotebookLM. Built with HTML5, vanilla JS, CSS and raw WebGL, zero dependencies.

Source: https://github.com/rajeshradhakrishnanmvk/bike-anatomy
