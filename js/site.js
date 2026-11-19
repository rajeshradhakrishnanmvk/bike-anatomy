"use strict";

/* Renders index.html and bike.html from window.BIKES. No network calls. */
(function () {
  var SLUG = /^[a-z0-9-]+$/;

  function el(tag, attrs, kids) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        if (attrs[key] != null && attrs[key] !== false) {
          node.setAttribute(key, String(attrs[key]));
        }
      });
    }
    (kids || []).forEach(function (kid) {
      if (kid == null || kid === false) return;
      node.appendChild(typeof kid === "string" ? document.createTextNode(kid) : kid);
    });
    return node;
  }

  function paths(slug) {
    var base = "bikes/" + slug + "/";
    return {
      viewer: base + "index.html",
      tour3d: base + "index.html?tour=1",
      explode: base + "index.html?explode=1",
      poster: base + "poster.jpg",
      posterPng: base + "poster.png",
      video: base + "tour.mp4",
      mindmap: base + "mindmap.jpg",
      mindmapPng: base + "mindmap.png",
      info: base + "infographic.jpg",
      infoPng: base + "infographic.png",
      study: "bike.html?slug=" + encodeURIComponent(slug),
      tour: "bike.html?slug=" + encodeURIComponent(slug) + "#tour",
      chat: "bike.html?slug=" + encodeURIComponent(slug) + "#chat"
    };
  }

  function ordered() {
    return window.BIKES.slice().sort(function (a, b) {
      var ay = a.order != null ? Number(a.order) : Number(a.year) || 0;
      var by = b.order != null ? Number(b.order) : Number(b.year) || 0;
      if (ay !== by) return ay - by;
      var an = String(a.name || "");
      var bn = String(b.name || "");
      if (an < bn) return -1;
      if (an > bn) return 1;
      return 0;
    });
  }

  function valid(bike) {
    return !!(bike && SLUG.test(String(bike.slug || "")) && bike.name && bike.years && bike.blurb);
  }

  function actions(bike, p, tourHref, tourLabel) {
    return el("ul", { class: "actions", "aria-label": bike.name + " links" }, [
      el("li", null, [
        el("a", { class: "btn btn-primary", href: p.viewer }, ["Open 3D viewer"])
      ]),
      el("li", null, [
        el("a", { class: "btn", href: tourHref }, [tourLabel])
      ]),
      el("li", null, [
        el("a", { class: "btn", href: p.explode }, ["Exploded view"])
      ]),
      el("li", null, [
        el("a", { class: "btn btn-chat", href: p.chat, "data-chat-open": bike.slug }, ["Chat with the bike"])
      ])
    ]);
  }

  function renderCatalog() {
    var grid = document.getElementById("catalog");
    var count = document.getElementById("count");
    if (!grid) return;
    if (!window.BIKES || !window.BIKES.slice) {
      if (count) count.textContent = "The shop ledger (bikes.js) did not load.";
      return;
    }
    var list = ordered();
    var shown = 0;
    grid.textContent = "";
    list.forEach(function (bike) {
      if (!valid(bike)) {
        grid.appendChild(el("article", { class: "card card-error" }, [
          el("p", null, ["A ledger entry needs a name, years, a one-line blurb, and a slug of lowercase letters, digits, and hyphens."])
        ]));
        return;
      }
      var p = paths(bike.slug);
      var num = shown < 9 ? "0" + (shown + 1) : String(shown + 1);
      shown += 1;
      var imgAttrs = {
        src: p.poster,
        width: "1600",
        height: "900",
        alt: bike.posterAlt || ("Cover art for the " + bike.name + ", " + bike.years + ".")
      };
      if (shown === 1) imgAttrs.fetchpriority = "high";
      var article = el("article", { class: "card" }, [
        el("a", { class: "cover", href: p.study }, [
          el("img", imgAttrs)
        ]),
        el("div", { class: "card-body" }, [
          el("p", { class: "kicker" }, ["No. " + num + (bike.family ? " · " + bike.family : "")]),
          el("h3", null, [el("a", { href: p.study }, [String(bike.name)])]),
          el("p", { class: "years" }, [String(bike.years)]),
          bike.spec ? el("p", { class: "spec" }, [String(bike.spec)]) : null,
          el("p", { class: "blurb" }, [String(bike.blurb)]),
          actions(bike, p, p.tour, "Watch tour")
        ])
      ]);
      grid.appendChild(article);
    });
    if (count) {
      count.textContent = shown === 1
        ? "1 motorcycle, earliest first."
        : shown + " motorcycles, earliest first.";
    }
  }

  var lastFocus = null;

  function openLightbox(src, title, alt, png) {
    var dialog = document.getElementById("lightbox");
    if (!dialog || typeof dialog.showModal !== "function") {
      window.location.href = png;
      return;
    }
    lastFocus = document.activeElement;
    document.getElementById("lightbox-title").textContent = title;
    var img = document.getElementById("lightbox-img");
    img.alt = alt;
    img.src = src;
    document.getElementById("lightbox-original").href = png;
    dialog.showModal();
    dialog.focus();
  }

  function wireLightbox() {
    var dialog = document.getElementById("lightbox");
    if (!dialog || dialog.dataset.wired === "1") return;
    dialog.dataset.wired = "1";
    document.getElementById("lightbox-close").addEventListener("click", function () {
      dialog.close();
    });
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener("close", function () {
      document.getElementById("lightbox-img").removeAttribute("src");
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    });
  }

  function plate(title, preview, png, alt) {
    var button = el("button", { type: "button", class: "zoom" }, [
      el("img", { src: preview, alt: alt, loading: "lazy" }),
      el("span", { class: "visually-hidden" }, ["Enlarge"])
    ]);
    button.addEventListener("click", function () {
      openLightbox(preview, title, alt, png);
    });
    return el("figure", { class: "plate" }, [
      button,
      el("figcaption", null, [
        el("span", null, [title]),
        el("a", { href: png }, ["Original PNG"])
      ])
    ]);
  }

  function makeVideo(poster, src) {
    var video = document.createElement("video");
    video.controls = true;
    video.preload = "metadata";
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.poster = poster;
    video.defaultMuted = true;
    video.setAttribute("muted", "");
    video.muted = true;
    var source = document.createElement("source");
    source.src = src;
    source.type = "video/mp4";
    video.appendChild(source);
    video.appendChild(document.createTextNode("This browser cannot play the tour film."));
    return video;
  }

  function renderStudy() {
    var root = document.getElementById("study");
    if (!root) return;
    wireLightbox();
    root.textContent = "";
    if (!window.BIKES || !window.BIKES.slice) {
      root.appendChild(el("h1", null, ["Ledger missing"]));
      root.appendChild(el("p", null, ["bikes.js did not load."]));
      return;
    }
    var slug = "";
    try {
      slug = new URLSearchParams(window.location.search).get("slug") || "";
    } catch (err) {
      slug = "";
    }
    var bike = null;
    ordered().some(function (item) {
      if (valid(item) && item.slug === slug) {
        bike = item;
        return true;
      }
      return false;
    });
    if (!bike) {
      document.title = "Not on the rack — Bike Anatomy";
      root.appendChild(el("h1", null, ["Not on the rack"]));
      root.appendChild(el("p", { class: "deck" }, ["No motorcycle is filed under that name."]));
      var list = el("ul", { class: "missing-list" });
      ordered().forEach(function (item) {
        if (!valid(item)) return;
        var p = paths(item.slug);
        list.appendChild(el("li", null, [
          el("a", { href: p.study }, [item.name + " (" + item.years + ")"])
        ]));
      });
      root.appendChild(list);
      return;
    }

    var p = paths(bike.slug);
    document.title = bike.name + ", " + bike.years + " — Bike Anatomy";
    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", bike.blurb);

    var facts = el("dl", { class: "facts" });
    facts.appendChild(el("div", null, [
      el("dt", null, ["Years"]),
      el("dd", null, [String(bike.years)])
    ]));
    if (bike.spec) {
      facts.appendChild(el("div", null, [
        el("dt", null, ["Designation"]),
        el("dd", null, [String(bike.spec)])
      ]));
    }

    root.appendChild(el("p", { class: "kicker" }, [bike.family || "Harley-Davidson"]));
    root.appendChild(el("h1", null, [String(bike.name)]));
    root.appendChild(facts);
    root.appendChild(el("p", { class: "deck" }, [String(bike.blurb)]));
    root.appendChild(actions(bike, p, p.tour3d, "Play 3D tour"));
    root.appendChild(el("section", { id: "tour", class: "block" }, [
      el("h2", null, ["Auto-tour"]),
      el("p", { class: "note" }, [
        "Silent auto-tour, about one minute. ",
        el("a", { href: p.posterPng }, ["Original poster PNG"])
      ]),
      el("div", { class: "stage" }, [makeVideo(p.poster, p.video)])
    ]));
    root.appendChild(el("section", { id: "studio", class: "block" }, [
      el("h2", null, ["NotebookLM Studio"]),
      el("p", { class: "note" }, ["Click a plate to enlarge it. The PNG originals stay linked under each image."]),
      el("div", { class: "plates" }, [
        plate(
          "Mind map",
          p.mindmap,
          p.mindmapPng,
          bike.mindmapAlt || ("NotebookLM mind map for the " + bike.name + ".")
        ),
        plate(
          "Infographic",
          p.info,
          p.infoPng,
          bike.infoAlt || ("NotebookLM infographic for the " + bike.name + ".")
        )
      ])
    ]));

    if (window.location.hash === "#tour" || window.location.hash === "#studio") {
      var target = document.getElementById(window.location.hash.slice(1));
      if (target && target.scrollIntoView) {
        requestAnimationFrame(function () {
          target.scrollIntoView();
        });
      }
    }
  }

  renderCatalog();
  renderStudy();
})();
