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
js/site.js          Renders the gallery and the study page.
favicon.svg
.nojekyll
bikes/<slug>/       One folder per motorcycle.
```

A study page shows the silent tour, the NotebookLM mind map and infographic (click to enlarge), and links into the viewer. Card actions:

- **Open 3D viewer** → `bikes/<slug>/index.html`
- **Watch tour** → the study page, at the film
- **Exploded view** → `bikes/<slug>/index.html?explode=1`

The study page also links to `?tour=1`, which plays the auto-tour inside the viewer. The viewers are stored unchanged; the gallery does not rewrite them.

On the Model C viewer, **Add yourself** places a PNG, JPG, or WebP in the frame beside the motorcycle. A full-length photo stands on the ground; a head-and-shoulders photo is set at rider height. Drag moves it, the wheel or a slider scales it, and the cutout is graded into the studio light. Save photo downloads the view as a PNG. The picture is processed only in the browser and is never uploaded or stored. That control is hidden for `?tour=1` and `&capture=1`, so the tour films stay as they are.

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

5. Reload. No build, no new HTML file.

The card and the study page are generated from that entry. `index.html`, `bike.html`, `css/site.css`, and `js/site.js` stay as they are.

## Credits

Research with NotebookLM. Built with HTML5, vanilla JS, CSS and raw WebGL, zero dependencies.

Source: https://github.com/rajeshradhakrishnanmvk/bike-anatomy
