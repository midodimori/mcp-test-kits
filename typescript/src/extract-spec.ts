#!/usr/bin/env node
/**
 * Extract specification from MCP Test Kits server.
 *
 * This script extracts the tools, resources, and prompts specification
 * from the TypeScript implementation and outputs JSON that can be compared
 * against the shared specification.
 *
 * Usage:
 *   node dist/extract-spec.js > extracted_spec.json
 *   node dist/extract-spec.js --compare
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { Config } from "./config.js";
import { createServer } from "./server.js";
import { extractSpec } from "./introspection.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

interface ToolSpec {
  name: string;
  description: string;
}

interface ResourceSpec {
  name: string;
  uri: string;
  description?: string;
  mimeType?: string;
}

interface PromptSpec {
  name: string;
  description: string;
  arguments?: Array<{ name: string; description?: string; required?: boolean }>;
}

interface Spec {
  tools: ToolSpec[];
  resources: ResourceSpec[];
  prompts: PromptSpec[];
}

/**
 * Load shared specification from JSON files
 */
function loadSharedSpec(): Spec {
  // Navigate from dist/ to project root, then to shared/
  const projectRoot = join(__dirname, "..", "..");
  const sharedDir = join(projectRoot, "shared", "test-data");

  const tools: ToolSpec[] = [];
  const resources: ResourceSpec[] = [];
  const prompts: PromptSpec[] = [];

  const toolsFile = join(sharedDir, "tools.json");
  if (existsSync(toolsFile)) {
    const data = JSON.parse(readFileSync(toolsFile, "utf-8"));
    tools.push(...(data.tools || []));
  }

  const resourcesFile = join(sharedDir, "resources.json");
  if (existsSync(resourcesFile)) {
    const data = JSON.parse(readFileSync(resourcesFile, "utf-8"));
    resources.push(...(data.resources || []));
  }

  const promptsFile = join(sharedDir, "prompts.json");
  if (existsSync(promptsFile)) {
    const data = JSON.parse(readFileSync(promptsFile, "utf-8"));
    prompts.push(...(data.prompts || []));
  }

  return {
    tools: tools.sort((a, b) => a.name.localeCompare(b.name)),
    resources: resources.sort((a, b) => a.uri.localeCompare(b.uri)),
    prompts: prompts.sort((a, b) => a.name.localeCompare(b.name)),
  };
}

interface ComparisonResult {
  match: boolean;
  missing: string[];
  extra: string[];
}

/**
 * Compare extracted spec against shared spec
 */
function compareSpecs(
  extracted: Spec,
  shared: Spec,
): {
  tools: ComparisonResult;
  resources: ComparisonResult;
  prompts: ComparisonResult;
} {
  const results = {
    tools: { match: true, missing: [] as string[], extra: [] as string[] },
    resources: { match: true, missing: [] as string[], extra: [] as string[] },
    prompts: { match: true, missing: [] as string[], extra: [] as string[] },
  };

  // Compare tools by name
  const extractedToolNames = new Set(extracted.tools.map((t) => t.name));
  const sharedToolNames = new Set(shared.tools.map((t) => t.name));

  results.tools.missing = [...sharedToolNames].filter(
    (n) => !extractedToolNames.has(n),
  );
  results.tools.extra = [...extractedToolNames].filter(
    (n) => !sharedToolNames.has(n),
  );
  results.tools.match =
    results.tools.missing.length === 0 && results.tools.extra.length === 0;

  // Compare resources by URI
  const extractedResourceUris = new Set(extracted.resources.map((r) => r.uri));
  const sharedResourceUris = new Set(shared.resources.map((r) => r.uri));

  results.resources.missing = [...sharedResourceUris].filter(
    (u) => !extractedResourceUris.has(u),
  );
  results.resources.extra = [...extractedResourceUris].filter(
    (u) => !sharedResourceUris.has(u),
  );
  results.resources.match =
    results.resources.missing.length === 0 &&
    results.resources.extra.length === 0;

  // Compare prompts by name
  const extractedPromptNames = new Set(extracted.prompts.map((p) => p.name));
  const sharedPromptNames = new Set(shared.prompts.map((p) => p.name));

  results.prompts.missing = [...sharedPromptNames].filter(
    (n) => !extractedPromptNames.has(n),
  );
  results.prompts.extra = [...extractedPromptNames].filter(
    (n) => !sharedPromptNames.has(n),
  );
  results.prompts.match =
    results.prompts.missing.length === 0 && results.prompts.extra.length === 0;

  return results;
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      compare: { type: "boolean" },
      output: { type: "string", short: "o" },
    },
    allowPositionals: true,
  });

  // Create server instance with default config
  const config = new Config();
  const server = createServer(config);

  // Extract specifications automatically via introspection
  const extracted = extractSpec(server);

  if (values.compare) {
    const shared = loadSharedSpec();
    const results = compareSpecs(extracted, shared);

    const allMatch =
      results.tools.match && results.resources.match && results.prompts.match;

    const output = {
      status: allMatch ? "pass" : "fail",
      comparison: results,
    };

    console.log(JSON.stringify(output, null, 2));
    process.exit(allMatch ? 0 : 1);
  } else {
    console.log(JSON.stringify(extracted, null, 2));
  }
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
