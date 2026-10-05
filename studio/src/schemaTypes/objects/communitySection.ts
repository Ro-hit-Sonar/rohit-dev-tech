import {UsersIcon} from '@sanity/icons/Users'
import {defineField, defineType} from 'sanity'

/**
 * The "In Community" section on the home page.
 *
 * Two collage variants are needed rather than one because the artwork is tuned
 * per theme: the light collage vignettes to near-white and the dark one to
 * near-black, so each blends with its own background. The frontend fetches only
 * the variant the active theme needs.
 */
const collageImage = (name: string, title: string, description: string) =>
  defineField({
    name,
    title,
    description,
    type: 'image',
    options: {hotspot: true},
    fields: [
      defineField({
        name: 'alt',
        title: 'Alternative text',
        description: 'Describe the photographs for screen readers.',
        type: 'string',
      }),
    ],
  })

export const communitySection = defineType({
  name: 'communitySection',
  title: 'Community Section',
  type: 'object',
  icon: UsersIcon,
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      description: 'Small tracked label above the heading, e.g. "Community".',
      type: 'string',
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      description: 'The display line, e.g. "In Community".',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'ctaLabel',
      title: 'Button label',
      description: 'A single word reads best here.',
      type: 'string',
    }),
    defineField({
      name: 'ctaHref',
      title: 'Button link',
      type: 'string',
      initialValue: '/in-community',
    }),
    collageImage(
      'imageLight',
      'Collage — light mode',
      'Shown when the site is in light mode. Should fade toward white at its edges.',
    ),
    collageImage(
      'imageDark',
      'Collage — dark mode',
      'Shown when the site is in dark mode. Should fade toward black at its edges.',
    ),
  ],
  preview: {
    select: {title: 'heading', media: 'imageLight'},
    prepare({title, media}) {
      return {title: title || 'Untitled', subtitle: 'Community Section', media}
    },
  },
})
