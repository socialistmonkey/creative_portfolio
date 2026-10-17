/* ===========================================================
   data.js — the list of works, in display order.

   The channel bar (the numbered buttons under the screen) is built from
   this list. Each work's text and media live in its own page,
   works/NN-slug.html, where NN is the work's position and "slug" matches
   the slug below.

   To add a work:
     1. add a line here
     2. add a row for it in portfolio.html
     3. copy an existing page in works/ and rename it NN-slug.html
     4. update the "13" in the page text ("13 selected works", "NN / 13", …)
   =========================================================== */
const PROJECTS = [
  { slug: "digital-decay",            title: "Digital Decay" },
  { slug: "city-17-dezerter-bazaar",  title: "City 17: Dezerter Bazaar" },
  { slug: "silk-road-forum",          title: "Tbilisi Silk Road Forum Motion Design" },
  { slug: "afghan-literacy-posters",  title: "A Movement for Literacy and Equality Buried by Empires and Extremism" },
  { slug: "cinema-edit-series",       title: "Cinema Edit Series" },
  { slug: "gorbachev-x-louis-vuitton", title: "Gorbachev x Louis Vuitton" },
  { slug: "media-offline",            title: "Media Offline" },
  { slug: "smokers-body",             title: "The Smoker's Body" },
  { slug: "spacex-commercial",        title: "SpaceX Commercial" },
  { slug: "tbilisian-reality",        title: "Tbilisian Reality" },
  { slug: "terminal-reality",         title: "Terminal Reality" },
  { slug: "unireviews",               title: "UniReviews" },
  { slug: "wach-auf",                 title: "“Wach Auf” (Work in Progress)" },
];
