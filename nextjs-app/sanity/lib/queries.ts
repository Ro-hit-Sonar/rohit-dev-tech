import { defineQuery } from "next-sanity";

export const settingsQuery = defineQuery(`*[_type == "settings"][0]`);

const postFields = /* groq */ `
  _id,
  "status": select(_originalId in path("drafts.**") => "draft", "published"),
  "title": coalesce(title, "Untitled"),
  "slug": slug.current,
  excerpt,
  coverImage,
  "date": coalesce(date, _updatedAt),
  "author": author->{firstName, lastName, picture},
`;

const linkReference = /* groq */ `
  _type == "link" => {
    "page": page->slug.current,
    "post": post->slug.current
  }
`;

const linkFields = /* groq */ `
  link {
      ...,
      ${linkReference}
      }
`;

export const getPageQuery = defineQuery(`
  *[_type == 'page' && slug.current == $slug][0]{
    _id,
    _type,
    name,
    slug,
    heading,
    subheading,
    "pageBuilder": pageBuilder[]{
      ...,
      _type == "callToAction" => {
        ${linkFields},
      },
      _type == "infoSection" => {
        content[]{
          ...,
          markDefs[]{
            ...,
            ${linkReference}
          }
        }
      },
    },
  }
`);

const revealReference = /* groq */ `
  _type == "reveal" => {
    "slug": post->slug.current,
    "title": post->title,
    "coverImage": post->coverImage
  }
`;

export const homePageQuery = defineQuery(`
  *[_type == "homePage"][0]{
    _id,
    _type,
    figuringOut{
      heading,
      leadLines,
      body[]{
        ...,
        markDefs[]{
          ...,
          ${linkReference}
        }
      }
    },
    featured{
      heading,
      "posts": posts[]->{
        _id,
        title,
        "slug": slug.current,
        category,
        coverImage,
        date,
        "readingMinutes": round(length(pt::text(content)) / 5 / 200)
      }
    },
    community{
      label,
      heading,
      body,
      ctaLabel,
      ctaHref,
      imageLight,
      imageDark
    },
    maintenant{
      heading,
      stem,
      items[]{
        _key,
        word,
        body[]{
          ...,
          markDefs[]{
            ...,
            ${linkReference},
            ${revealReference}
          }
        }
      }
    },
  }
`);

export const sitemapData = defineQuery(`
  *[_type == "page" || _type == "post" && defined(slug.current)] | order(_type asc) {
    "slug": slug.current,
    _type,
    _updatedAt,
  }
`);

export const allPostsQuery = defineQuery(`
  *[_type == "post" && defined(slug.current)] | order(date desc, _updatedAt desc) {
    ${postFields}
  }
`);

export const morePostsQuery = defineQuery(`
  *[_type == "post" && _id != $skip && defined(slug.current)] | order(date desc, _updatedAt desc) [0...$limit] {
    ${postFields}
  }
`);

export const postQuery = defineQuery(`
  *[_type == "post" && slug.current == $slug] [0] {
    content[]{
    ...,
    markDefs[]{
      ...,
      ${linkReference}
    }
  },
    category,
    "readingMinutes": round(length(pt::text(content)) / 5 / 200),
    ${postFields}
  }
`);

/**
 * The metadata head, without the body.
 *
 * `generateMetadata` and the page render are already two separate requests —
 * they differ on \`stega\`, so they were never deduped — and the metadata one
 * had no business paying to fetch and serialise a whole article.
 */
export const postMetaQuery = defineQuery(`
  *[_type == "post" && slug.current == $slug] [0] {
    "title": coalesce(title, "Untitled"),
    excerpt,
    coverImage,
    "author": author->{firstName, lastName},
  }
`);

/**
 * The rows under an article. Projects exactly what `BlogEntry` renders, so the
 * hand-off reads as an excerpt of /blogs rather than a second rendering of it.
 *
 * Excluded on slug rather than `_id`: a draft's `_id` is `drafts.<id>`, so an
 * `_id != $skip` filter would leave the published copy of the very post you are
 * reading sitting in its own "more blogs" list while you preview the draft.
 */
export const moreBlogsQuery = defineQuery(`
  *[_type == "post" && defined(slug.current) && slug.current != $slug]
    | order(date desc, _updatedAt desc) [0...$limit] {
    _id,
    "title": coalesce(title, "Untitled"),
    "slug": slug.current,
    category,
    "date": coalesce(date, _updatedAt),
    "readingMinutes": round(length(pt::text(content)) / 5 / 200)
  }
`);

export const postPagesSlugs = defineQuery(`
  *[_type == "post" && defined(slug.current)]
  {"slug": slug.current}
`);

export const pagesSlugs = defineQuery(`
  *[_type == "page" && defined(slug.current)]
  {"slug": slug.current}
`);

/**
 * The /blogs index. A dedicated projection rather than `postFields` so the
 * cheap list queries don't pay for `pt::text(content)`, and so the fields this
 * page never shows — excerpt, author, draft status, cover image — aren't
 * fetched at all. The rows are typographic; there is no image on this page.
 */
export const blogsIndexQuery = defineQuery(`
  *[_type == "post" && defined(slug.current)] | order(date desc, _updatedAt desc) {
    _id,
    "title": coalesce(title, "Untitled"),
    "slug": slug.current,
    category,
    "date": coalesce(date, _updatedAt),
    "readingMinutes": round(length(pt::text(content)) / 5 / 200)
  }
`);

/**
 * The community journey at /community, newest first — the order the page
 * reads in, and the same order the Studio list uses.
 */
export const communityEventsQuery = defineQuery(`
  *[_type == "communityEvent" && defined(date)] | order(date desc) {
    _id,
    title,
    kind,
    date,
    venue,
    note,
    photos
  }
`);
