/* Bike Anatomy ledger.
   The gallery (index.html) and each study page (bike.html) read this list.
   To add a motorcycle: create bikes/<slug>/ as README.md describes, then append
   one object here. Nothing is built or compiled.

   Sort is by `year` (first model year), then `name`. Set `order` to a number
   when two machines share a year and the name sort is wrong.

   Required: slug, name, years, year, blurb.
   slug: lowercase letters, digits, and hyphens. It must match the folder name.
   Optional: family, spec, order, posterAlt, mindmapAlt, infoAlt.
*/
window.BIKES = [
  {
    slug: "model-d",
    name: "Model D",
    family: "D-Series",
    years: "1929–1931",
    year: 1929,
    spec: "45 cu in Flathead Solo",
    blurb: "Olive-green solo with a 45-cubic-inch side-valve V-twin. Twin bullet headlights in 1929–30, a single 7-inch lamp in 1931.",
    posterAlt: "Olive-green 1930 Harley-Davidson Model D with twin bullet headlights and a fork toolbox, posed on a dark studio floor.",
    mindmapAlt: "NotebookLM mind map of the Model D, branching into engine, transmission, drive, frame, brakes, tanks, electrics, and variants.",
    infoAlt: "NotebookLM infographic of the Model D, 1929 to 1931, covering the flathead engine, rigid frame, drum brakes, bullet headlights, and the D, DL, DLD, and DS lineup."
  },
  {
    slug: "v-vl",
    name: "V / VL",
    family: "Big twin",
    years: "1930–1936",
    year: 1930,
    spec: "74 cu in Flathead big twin",
    blurb: "Blue-and-cream big twin with a 74-cubic-inch side-valve, and an 80-cubic-inch option in 1935–36.",
    posterAlt: "Blue-and-cream Harley-Davidson V with a single headlamp and an exposed flathead engine, posed on a dark studio floor.",
    mindmapAlt: "NotebookLM mind map of the V and VL, covering specifications, systems, model variants, and year-by-year changes from 1930 to 1936.",
    infoAlt: "NotebookLM infographic of the V-series Flathead, 1930 to 1936, with engine, transmission, frame, brakes, a production timeline, and the 74 versus 80 cubic inch specifications."
  },
  {
    slug: "model-c",
    name: "Model C",
    family: "Single",
    years: "1929–1934",
    year: 1929,
    spec: "30.50 cu in Flathead single",
    blurb: "Olive-green 500-class side-valve single with a Ricardo head, built for solo use only. Twin headlamps and a barrel toolbox in 1930, a single lamp after that.",
    posterAlt: "Olive-green Harley-Davidson Model C single with twin bullet headlamps, a barrel toolbox across the fork and an upright finned cylinder, posed on a dark studio floor.",
    mindmapAlt: "NotebookLM mind map of the Model C, branching into overview, engine and drivetrain, chassis and equipment, model variants, related models, and restoration.",
    infoAlt: "NotebookLM infographic of the 1929 to 1934 Model C, covering the 30.50 cubic inch flathead, 4,472 units produced, the shared Model D chassis, and comparisons with the Peashooter, the strap tank myth, and the Model A and B singles."
  },
  {
    slug: "model-r",
    name: "Model R",
    family: "R-Series",
    years: "1932–1936",
    year: 1932,
    spec: "45 cu in Flathead Solo",
    blurb: "Olive-green 45-cubic-inch side-valve V-twin that succeeded the Model D and led to the W and WL. The generator now lies horizontally in front of the crankcase.",
    posterAlt: "Olive-green 1932 Harley-Davidson Model R with a single headlamp, orange pinstriping and a horizontal generator ahead of the crankcase, posed on a dark studio floor.",
    mindmapAlt: "NotebookLM mind map of the Model R, RL and RLD, covering the Depression-era 45 flathead, its systems, year-by-year changes from 1932 to 1936, and the lineage to the W and WL.",
    infoAlt: "NotebookLM infographic of the 1932 to 1936 Model R series, covering the 45 cubic inch side-valve V-twin, the horizontal generator, the RL and RLD variants, and the platform's path to the W, WL and WLA."
  }
];
