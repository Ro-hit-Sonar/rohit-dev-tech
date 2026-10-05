import {CogIcon} from '@sanity/icons/Cog'
import {HomeIcon} from '@sanity/icons/Home'
import {UsersIcon} from '@sanity/icons/Users'
import type {StructureBuilder, StructureResolver} from 'sanity/structure'
import pluralize from 'pluralize-esm'

/**
 * Structure builder is useful whenever you want to control how documents are grouped and
 * listed in the studio or for adding additional in-studio previews or content to documents.
 * Learn more: https://www.sanity.io/docs/structure-builder-introduction
 */

// `communityEvent` is pulled out of the auto-generated list so it can be
// re-added below with an explicit newest-first ordering — the journey page
// reads in that order, and a Studio list that disagrees with the page makes
// re-ordering events needlessly confusing.
const DISABLED_TYPES = [
  'settings',
  'homePage',
  'communityEvent',
  'assist.instruction.context',
]

export const structure: StructureResolver = (S: StructureBuilder) =>
  S.list()
    .title('Website Content')
    .items([
      ...S.documentTypeListItems()
        // Remove the "assist.instruction.context" and "settings" content  from the list of content types
        .filter((listItem: any) => !DISABLED_TYPES.includes(listItem.getId()))
        // Pluralize the title of each document type.  This is not required but just an option to consider.
        .map((listItem) => {
          return listItem.title(pluralize(listItem.getTitle() as string))
        }),
      // Community Events, newest first — the order the /community page tells them in.
      S.listItem()
        .title('Community Events')
        .icon(UsersIcon)
        .child(
          S.documentTypeList('communityEvent')
            .title('Community Events')
            .defaultOrdering([{field: 'date', direction: 'desc'}]),
        ),
      // Home Page Singleton — content for the editable sections of the home page.
      S.listItem()
        .title('Home Page')
        .child(S.document().schemaType('homePage').documentId('homePage'))
        .icon(HomeIcon),
      // Settings Singleton in order to view/edit the one particular document for Settings.  Learn more about Singletons: https://www.sanity.io/docs/create-a-link-to-a-single-edit-page-in-your-main-document-type-list
      S.listItem()
        .title('Site Settings')
        .child(S.document().schemaType('settings').documentId('siteSettings'))
        .icon(CogIcon),
    ])
