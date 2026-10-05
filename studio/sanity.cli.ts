/**
 * Sanity CLI Configuration
 * This file configures the Sanity CLI tool with project-specific settings
 * and customizes the Vite bundler configuration.
 * Learn more: https://www.sanity.io/docs/cli
 */

import {defineCliConfig} from 'sanity/cli'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || '<your project ID>'
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
  studioHost: process.env.SANITY_STUDIO_STUDIO_HOST || '', // Visit https://www.sanity.io/docs/environment-variables to learn more about using environment variables for local & production.
  deployment: {
    autoUpdates: true,
    // The Studio this project deploys to, named explicitly. Without it the CLI
    // falls back to `studioHost` above, which is empty, and reports "No studio
    // hostname configured" — even though the app has existed since 2025 and
    // carries the host `rohitdevtech` on Sanity's side. That error reads as
    // "nothing is deployed" when the truth is "this config cannot see what is
    // deployed", which is a slow thing to work out from the message alone.
    appId: 'nthc0t4wnmk4c791z66r00vo',
  },
})
