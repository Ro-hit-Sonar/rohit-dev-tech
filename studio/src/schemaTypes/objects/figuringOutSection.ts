import {defineArrayMember, defineField, defineType} from 'sanity'
import {CircleIcon} from '@sanity/icons/Circle'

import {portableTextLinkAnnotation} from './blockContent'

/**
 * The "What I'm figuring out" section on the home page.
 *
 * The body deliberately does NOT use the shared `blockContent` type. That one
 * leaves `styles` and `lists` unspecified, so Sanity falls back to its defaults
 * and hands editors H1-H6, blockquotes and lists — all of which would break this
 * section's layout, where every paragraph is rendered with a numbered marker.
 * Restricting it here follows the same approach as `settings.description`.
 */
export const figuringOutSection = defineType({
  name: 'figuringOutSection',
  title: 'Figuring Out Section',
  type: 'object',
  icon: CircleIcon,
  fields: [
    defineField({
      name: 'heading',
      title: 'Label',
      description: 'Small tracked label above the statement, e.g. "What I\u2019m figuring out".',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'leadLines',
      title: 'Statement',
      description:
        'The display-size statement, one line per entry. Each line arrives in sequence and lands brighter than the last, so put the turn of the sentence on its own line.',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      validation: (Rule) => Rule.max(4),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      description: 'Supporting prose, set smaller and narrower than the statement above.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{title: 'Normal', value: 'normal'}],
          lists: [],
          marks: {
            decorators: [
              {title: 'Bold', value: 'strong'},
              {title: 'Italic', value: 'em'},
            ],
            annotations: [portableTextLinkAnnotation],
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'heading'},
    prepare({title}) {
      return {
        title: title || 'Untitled',
        subtitle: 'Figuring Out Section',
      }
    },
  },
})
