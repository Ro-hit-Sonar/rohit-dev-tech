import {StarIcon} from '@sanity/icons/Star'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * The featured-posts index on the home page.
 *
 * `posts` is an ordered array of references, and the order is load-bearing: the
 * first entry is rendered as the lead at a larger size, so rearranging them in
 * the Studio changes the emphasis on the page.
 */
export const featuredSection = defineType({
  name: 'featuredSection',
  title: 'Featured Section',
  type: 'object',
  icon: StarIcon,
  fields: [
    defineField({
      name: 'heading',
      title: 'Label',
      description: 'Small tracked label above the list, e.g. "Start here".',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'posts',
      title: 'Posts',
      description:
        'Up to five, in the order you want them read. The first is set larger than the rest.',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'post'}]})],
      validation: (Rule) => Rule.max(5).unique(),
    }),
  ],
  preview: {
    select: {title: 'heading'},
    prepare({title}) {
      return {title: title || 'Untitled', subtitle: 'Featured Section'}
    },
  },
})
