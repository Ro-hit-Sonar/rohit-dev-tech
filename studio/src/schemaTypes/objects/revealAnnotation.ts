import {SparklesIcon} from '@sanity/icons/Sparkles'
import {defineField} from 'sanity'

/**
 * The "reveal" annotation.
 *
 * Applied to a span of text inside a body — the words that are the *answer* to
 * the sentence around them. The frontend renders that span with a dotted
 * underline, links it to the referenced post, and shows the post's cover image
 * on hover.
 *
 * Deliberately a plain object literal rather than `defineType`, matching
 * `portableTextLinkAnnotation` in ./blockContent — that's what lets it be
 * inlined into more than one `marks.annotations` array without registering a
 * top-level schema type.
 */
export const revealAnnotation = {
  name: 'reveal',
  type: 'object',
  title: 'Reveal',
  icon: SparklesIcon,
  fields: [
    defineField({
      name: 'post',
      title: 'Post',
      description: 'The post this answer links to. Its cover image becomes the hover thumbnail.',
      type: 'reference',
      to: [{type: 'post'}],
      validation: (Rule) => Rule.required(),
    }),
  ],
}
