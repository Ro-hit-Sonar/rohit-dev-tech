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
        'The display-size statement, one line per block — break the sentence where you want it to break on screen. Select a word and press Hollow to draw it as an outline instead of solid; the section uses that on "answers", because the statement is about not having them. The first line is set quieter than the rest automatically.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{title: 'Normal', value: 'normal'}],
          lists: [],
          marks: {
            // One decorator, deliberately. Bold or italic inside display type
            // this large reads as a mistake rather than as emphasis, and this
            // field exists to say exactly one thing.
            decorators: [{title: 'Hollow', value: 'hollow'}],
            annotations: [],
          },
        }),
      ],
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
