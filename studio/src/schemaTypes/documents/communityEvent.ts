import {UsersIcon} from '@sanity/icons/Users'
import {format, parseISO} from 'date-fns'
import {defineField, defineType} from 'sanity'

/**
 * One stop on the community journey shown at /community.
 *
 * The page tells these as a road: a line meanders down through every event in
 * date order, and each one is either a moment Rohit helped build or one he
 * simply attended. Read the `kind` note below before changing it — it is the
 * only field here that never renders as itself.
 */

export const communityEvent = defineType({
  name: 'communityEvent',
  title: 'Community Event',
  icon: UsersIcon,
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'kind',
      title: 'Kind',
      description:
        'Core = you helped make it happen (organising, speaking, teaching). Attended = you were in the room. This never appears as a label on the page — it only sets how much weight the entry carries, so a smaller moment reads as connective tissue between the bigger ones.',
      type: 'string',
      options: {
        list: [
          {title: 'Core — I helped build it', value: 'core'},
          {title: 'Attended — I was there', value: 'attended'},
        ],
        layout: 'radio',
      },
      initialValue: 'core',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Date',
      description:
        'Orders the journey and sets the date shown beside the entry. For something ongoing, use the month it started and say so in the Venue line.',
      type: 'date',
      options: {dateFormat: 'DD MMM YYYY'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'venue',
      title: 'Venue line',
      description:
        'The small line under the title — where it was, and anything the date alone does not say. For example "Next.js Summit · Scaler School of Technology, Bengaluru · 13 Sep 2025" or "Community organising · Ongoing".',
      type: 'string',
    }),
    defineField({
      name: 'note',
      title: 'Note',
      description: 'One short paragraph. What it was, or what you took from it.',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'photos',
      title: 'Photos',
      description:
        'Up to four. The layout changes with the count, so three photos read differently from one — pick the number that suits the moment rather than filling the space.',
      type: 'array',
      of: [
        defineField({
          name: 'photo',
          type: 'image',
          options: {
            hotspot: true,
            aiAssist: {imageDescriptionField: 'alt'},
          },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative text',
              description: 'Important for SEO and accessibility.',
              validation: (rule) =>
                // `context.parent` is the image object this alt belongs to.
                // The single-image fields elsewhere in this studio reach for
                // `context.document?.coverImage` instead, which is a fixed path
                // and cannot work inside an array — every item would validate
                // against the first one.
                rule.custom((alt, context) => {
                  if ((context.parent as any)?.asset?._ref && !alt) {
                    return 'Required'
                  }
                  return true
                }),
            },
          ],
        }),
      ],
      validation: (rule) => rule.max(4),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      kind: 'kind',
      date: 'date',
      media: 'photos.0',
    },
    prepare({title, kind, date, media}) {
      const subtitles = [
        date && format(parseISO(date), 'LLL yyyy'),
        kind === 'attended' ? 'attended' : 'core',
      ].filter(Boolean)

      return {title, media, subtitle: subtitles.join(' · ')}
    },
  },
})
