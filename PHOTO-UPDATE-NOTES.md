# EternaTurf website: photo-forward update

## What's new

**New files**
- `projects.html`: the full portfolio page. It has 54 photos you can filter by project type and by area, a full-screen lightbox, and 17 before/after sliders. The Projects link in every page's nav and footer now opens this page.
- `images/projects/`: optimized project photos. These are full-size images (1600 px), thumbnails (720 px), hero images (2200 px), before/after pairs, and four process-step photos.
- `js/projects-data.js`: the list of every photo, with its title, area, categories and alt text. **Add, remove, retitle or re-tag photos here.**
- `js/et-gallery.js` and `css/et-gallery.css`: the shared gallery components (masonry grid, bento grid, horizontal rail, filmstrip, lightbox, before/after slider, area cards).

**Homepage**
- The hero slideshow now shows 7 real installs, with a lighter overlay and a "REAL INSTALL · project · area" caption.
- A filmstrip of 18 installs scrolls under the stats bar.
- The service cards are now photo cards and link to their service pages. Before this update they weren't clickable.
- New "Recent Work" bento gallery.
- New interactive Before & After section with 10 projects.
- "How it works" now shows one job's photos from excavation to finished yard.
- New "Work by Area" photo cards under the map.
- The final call-to-action section has a photo background.

**Service and location pages**
- Where a matching real photo exists, it replaces the AI hero image.
- Each page has a gallery of related or local work. Several also have before/after sliders.
- Pages without matching photos (pet, playground, rubber mulch and surfacing, shade, pine straw, hardscaping) keep their original hero image and get a "Recent installs" photo rail.

**Fixes**
- On phones, the service card grid on several service and location pages was wider than the screen and caused sideways scrolling. It now stacks in one column.
- The homepage hero text sat flush against the screen edge on phones. It now has side padding.

## Adding a photo later
1. Save three JPEGs with the same name, such as `my-job.jpg`:
   - `images/projects/my-job.jpg`, about 1600 px on the long side
   - `images/projects/thumb/my-job.jpg`, about 720 px
2. Add a line to `ET_PROJECTS` in `js/projects-data.js`:
   `{"id":"my-job","title":"My Job","region":"louisville","place":"Greater Louisville, KY","cats":["lawn"],"alt":"Describe the photo","w":1600,"h":1200}`
3. The photo then appears automatically on the Projects page and in any gallery that filters by its area or category.

Area codes: `louisville`, `sindiana`, `toledo`, `sarasota`, `tampa`, `florida`.
Category codes: `lawn`, `putting`, `living`, `pool`, `front`, `side`, `commercial`.

## Privacy
- All camera and GPS metadata has been removed from the images.
- Areas are shown at city or region level only, never as a street or address.
