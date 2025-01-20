import homepage from "./index.html";
import advancedTopics from "./advanced-topics.html";
import apiReference from "./api-reference.html";
import bestPracticesPatterns from "./best-practices-patterns.html";
import changelogVersioning from "./changelog-versioning.html";
import contributingDevelopment from "./contributing-development.html";
import coreConcepts from "./core-concepts.html";
import detailedWalkthrough from "./detailed-walkthrough.html";
import examplesRecipes from "./examples-recipes.html";
import installationSetup from "./installation-setup.html";
import licensingCredits from "./licensing-credits.html";
import troubleshootingFAQs from "./troubleshooting-faqs.html";

Bun.serve({
  // Add HTML imports to `static`
  static: {
    // Bundle & route index.html to "/"
    "/index.html": homepage,
    "/advanced-topics.html": advancedTopics,
    "/api-reference.html": apiReference,
    "/best-practices-patterns.html": bestPracticesPatterns,
    "/changelog-versioning.html": changelogVersioning,
    "/contributing-development.html": contributingDevelopment,
    "/core-concepts.html": coreConcepts,
    "/detailed-walkthrough.html": detailedWalkthrough,
    "/examples-recipes.html": examplesRecipes,
    "/installation-setup.html": installationSetup,
    "/licensing-credits.html": licensingCredits,
    "/troubleshooting-faqs.html": troubleshootingFAQs,
  },

  // Enable development mode for:
  // - Detailed error messages
  // - Rebuild on request
  development: true,

  // Handle API requests
  async fetch(req) {
    // ...your API code
    /* if (req.url.endsWith("/api/users")) {
      const users = await Bun.sql`SELECT * FROM users`;
      return Response.json(users);
    } */

    // Return 404 for unmatched routes
    return new Response("Not Found", { status: 404 });
  },
});
