import {ClockIcon} from '@sanity/icons/Clock'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {portableTextLinkAnnotation} from './blockContent'
import {revealAnnotation} from './revealAnnotation'

/**
 * One row of the "Maintenant" section: a heading, and a short body in which one
 * span carries a `reveal` annotation — the answer the sentence sets up.
 *
 * As with `figuringOutSection`, the body is restricted to plain paragraphs.
 * Headings and lists would break the numbered-row layout, and Sanity's `block`
 * defaults would otherwise allow both.
 */
export const maintenantItem = defineType({
  name: 'maintenantItem',
  title: 'Maintenant Item',
  type: 'object',
  icon: ClockIcon,
  fields: [
    defineField({
      name: 'word',
      title: 'Word',
      description:
        'Just the word that changes \u2014 "built", "understood", "followed". The shared stem is set once on the section.',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      description:
        'Select the words that are the answer and apply the Reveal annotation to link them to a post.',
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
            annotations: [revealAnnotation, portableTextLinkAnnotation],
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'word'},
    prepare({title}) {
      return {
        title: title || 'Untitled',
        subtitle: 'Maintenant Item',
      }
    },
  },
})

export const maintenantSection = defineType({
  name: 'maintenantSection',
  title: 'Maintenant Section',
  type: 'object',
  icon: ClockIcon,
  fields: [
    defineField({
      name: 'heading',
      title: 'Label',
      description: 'The section name, e.g. "Maintenant".',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'stem',
      title: 'Stem',
      description:
        'The phrase every item shares, e.g. "Something currently being". Written once because it is said once \u2014 only the final word changes per item.',
      type: 'string',
    }),
    defineField({
      name: 'items',
      title: 'Items',
      description: 'Each item supplies one changing word and its body.',
      type: 'array',
      of: [defineArrayMember({type: 'maintenantItem'})],
    }),
  ],
  preview: {
    select: {title: 'heading'},
    prepare({title}) {
      return {
        title: title || 'Untitled',
        subtitle: 'Maintenant Section',
      }
    },
  },
})
