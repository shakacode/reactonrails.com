# Agent Workflow Scripts

Standard entry points that portable agent-workflow skills call, so a skill can
run `.agents/bin/<name>` in any repo without knowing this repo's specific
commands. Each script is a thin, repo-owned wrapper. A script that is **absent**
means that capability is n/a here.

| Script | Purpose | This repo runs |
| --- | --- | --- |
| `setup` | Install dependencies | `npm ci` + `npm --prefix prototypes/docusaurus ci` |
| `validate` | Pre-push gate | `.agents/bin/build` + `.agents/bin/test` |
| `test` | Run tests | `npm run test:docs-layout -- "$@"` + `npm run test:prepare-prompts -- "$@"` |
| `lint` | Lint / format | n/a |
| `build` | Build / type-check | `npm run build` |
| `docs` | Docs checks | n/a |
| `ci-detect` | CI change detector | n/a |

Non-command policy lives in [`../agent-workflow.yml`](../agent-workflow.yml).
