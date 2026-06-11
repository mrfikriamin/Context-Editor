"use strict";
// Catalog of selectable, local-only context tools. The app never runs these —
// it embeds the chosen tool's name, URL, and command into the generated files
// so the implementation agent (and the user) know exactly what to use.
Object.defineProperty(exports, "__esModule", { value: true });
exports.LINT_TOOLS = exports.GRAPH_TOOLS = exports.DOC_INGESTION_TOOLS = void 0;
exports.resolveContextTool = resolveContextTool;
exports.DOC_INGESTION_TOOLS = [
    {
        id: "markitdown",
        label: "MarkItDown (Microsoft)",
        url: "https://github.com/microsoft/markitdown",
        command: "pip install markitdown && markitdown doc.pdf > doc.md",
    },
    {
        id: "pandoc",
        label: "Pandoc",
        url: "https://pandoc.org",
        command: "pandoc doc.docx -t gfm -o doc.md",
    },
    {
        id: "docling",
        label: "Docling (IBM)",
        url: "https://github.com/docling-project/docling",
        command: "pip install docling && docling doc.pdf",
    },
];
exports.GRAPH_TOOLS = [
    {
        id: "auto",
        label: "Auto — match project type",
        url: "",
        command: "",
    },
    {
        id: "graphify",
        label: "Graphify",
        url: "https://graphify.net",
        command: "Generate a repository graph report and export the relevant view",
    },
    {
        id: "madge",
        label: "madge (JS/TS)",
        url: "https://github.com/pahen/madge",
        command: "npx madge --image graph.svg src/",
    },
    {
        id: "dependency-cruiser",
        label: "dependency-cruiser (JS/TS)",
        url: "https://github.com/sverweij/dependency-cruiser",
        command: "npx dependency-cruiser src",
    },
    {
        id: "pydeps",
        label: "pydeps (Python)",
        url: "https://github.com/thebjorn/pydeps",
        command: "pydeps src --max-bacon 2",
    },
    {
        id: "terraform-graph",
        label: "terraform graph",
        url: "https://developer.hashicorp.com/terraform/cli/commands/graph",
        command: "terraform graph | dot -Tsvg > graph.svg",
    },
];
exports.LINT_TOOLS = [
    {
        id: "markdownlint",
        label: "markdownlint-cli2",
        url: "https://github.com/DavidAnson/markdownlint-cli2",
        command: 'npx markdownlint-cli2 "*.md"',
    },
    {
        id: "remark",
        label: "remark-lint",
        url: "https://github.com/remarkjs/remark-lint",
        command: "npx remark . --use remark-preset-lint-recommended",
    },
    {
        id: "mdformat",
        label: "mdformat",
        url: "https://github.com/hukkin/mdformat",
        command: "pipx run mdformat *.md",
    },
];
function resolveContextTool(options, id, custom) {
    if (id === "custom") {
        return { id: "custom", label: custom.trim() || "Custom tool", url: "", command: "" };
    }
    return options.find((o) => o.id === id) ?? options[0];
}
