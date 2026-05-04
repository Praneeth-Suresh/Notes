# Ubiquitous Language

| Business Term       | Technical Symbol       | Definition                                                                   | Constraints                                         | Avoid                         |
| ------------------- | ---------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------- | ----------------------------- |
| Design Concept      | `DesignConcept`      | The shared organizing model guiding architecture and implementation choices. | Must be coherent across contexts.                   | `Idea`, `GeneralModel`    |
| Design Tree         | `DesignTree`         | Living map of open and settled decisions.                                    | Updated when design moves.                          | `PlanDump`                  |
| Bounded Context     | `BoundedContext`     | A domain boundary with explicit ownership and language.                      | Owns its internal model and API.                    | `Module` (too generic)      |
| Ubiquitous Language | `UbiquitousLanguage` | Shared domain vocabulary in docs and code.                                   | Terms must be stable and explicit.                  | Ambiguous nouns like `Data` |
| Feedback Loop       | `FeedbackLoop`       | Generate-check-fix cycle using deterministic tools.                          | Must include real tool output.                      | `TryAgainLoop`              |
| Entropy Hotspot     | `EntropyHotspot`     | High-churn and high-complexity area likely to degrade maintainability.       | Used for targeted refactoring.                      | `MessyFile`                 |
| Vertical Slice      | `VerticalSlice`      | Smallest end-to-end behavior change through one boundary.                    | Must be testable in isolation.                      | `BigRefactor`               |
| Adapter             | `Adapter`            | Boundary object that isolates external systems from domain logic.            | Domain must not depend on vendor details.           | `ServiceHelper`             |
| Seam                | `Seam`               | Intentional change point for behavior substitution without invasive edits.   | Should be protected by tests.                       | `HackPoint`                 |
| ADR                 | `ADR`                | Architecture Decision Record for durable decisions.                          | Required for lasting boundary changes.              | `RandomNote`                |
| Topic               | `Topic`              | A subfield of Computer Science about which material is written.              | A topic contains 1 set of notes.                    | `idea`                      |
| Notes               | `Notes`              | The set of all the material about a particular topic.                        | It contains only HTML files, extracted from notion. | `Content`                   |
| Notion Ingestion Context | `NotionIngestionContext` | Context that pulls raw note structure from Notion and normalizes it. | Owns Notion API adapters and normalization only. | `Fetcher` |
| Notes Content Context | `NotesContentContext` | Context that transforms normalized topic data into publishable note artifacts. | Must consume only normalized inputs and emit sanitized outputs. | `RendererService` |
| Site Styling Context | `SiteStylingContext` | Context that owns visual tokens, typography, and layout primitives. | Must not depend on Notion or topic retrieval concerns. | `ThemeUtils` |
| Topic Manifest | `TopicManifest` | Registry mapping topic metadata to source and output routing. | Adding a topic should be manifest-first. | `RouteList` |
| Sanitized Notes HTML | `SanitizedNotesHtml` | HTML output that is cleaned through an allowlist before publishing. | Required for clean and safe rendering reliability. | `RawHtml` |
| Pages Publish Contract | `PagesPublishContract` | Explicit output contract consumed by Cloudflare Pages deployment. | Build artifacts must be deterministic and static-ready. | `DeployStuff` |
| Formatting Fidelity | `FormattingFidelity` | Requirement that Notion-authored formatting is preserved exactly in published output. | Takes precedence over convenience transformations. | `CloseEnoughFormatting` |
| LaTeX Fidelity | `LaTeXFidelity` | Preservation of mathematical expressions from Notion source to rendered output. | Must remain semantically and visually equivalent. | `ApproximateMath` |
| Code Block Fidelity | `CodeBlockFidelity` | Preservation of code block boundaries, language metadata, and indentation from source notes. | Must not alter executable meaning or readability. | `PrettyCodeRewrite` |
| Strict Fidelity Mode | `StrictFidelityMode` | Fail-fast mode where unsupported Notion block types are rejected instead of downgraded. | Prevents silent formatting loss at publish time. | `BestEffortRendering` |
