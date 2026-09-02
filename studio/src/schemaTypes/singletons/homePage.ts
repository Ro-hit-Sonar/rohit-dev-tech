import {HomeIcon} from '@sanity/icons/Home'
import {defineField, defineType} from 'sanity'

/**
 * Home page schema Singleton. Holds the content for the editable sections of the
 * home page — currently just "What I'm figuring out". The hero and approach
 * sections are still hardcoded in `nextjs-app/app/components/circle/`; they can
 * move in here as further fields when they need to be editable.
 *
 * Learn more: https://www.sanity.io/docs/create-a-link-to-a-single-edit-page-in-your-main-document-type-list
 */
export const homePage = defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  icon: HomeIcon,
  fields: [
    defineField({
      name: 'figuringOut',
      title: 'Figuring Out',
      type: 'figuringOutSection',
    }),
    defineField({
      name: 'maintenant',
      title: 'Maintenant',
      type: 'maintenantSection',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'featuredSection',
    }),
    defineField({
      name: 'community',
      title: 'In Community',
      type: 'communitySection',
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Home Page',
      }
    },
  },
})
