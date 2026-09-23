---
custom_edit_url: null
---

# Documentation Guide

React on Rails is one product with two tiers: open source for Rails + React integration, and Pro when you need higher SSR throughput, deeper RSC support, or maintainer-backed help.

## Choose the path that matches your app

### Starting a new Rails + React app

- [Create a new app](./getting-started/create-react-on-rails-app.md)
- [Quick Start](./getting-started/quick-start.md)
- [Tutorial — build a complete app](./getting-started/tutorial.md)

### Adding React to an existing Rails app

- [Install into an existing Rails app](./getting-started/installation-into-an-existing-rails-app.md)
- [Render your first component](./getting-started/using-react-on-rails.md)

### Already using React on Rails OSS?

- [Compare OSS and Pro](./getting-started/oss-vs-pro.md)
- [Upgrade to Pro](./pro/upgrading-to-pro.md)

### Evaluating Rails + React options

- [Examples and migration references](/examples)
- [Compare with alternatives](./getting-started/comparing-react-on-rails-to-alternatives.md) — decision guide covering Hotwire, Inertia, Next.js, and more
- [Migrate from react-rails](./migrating/migrating-from-react-rails.md)
- [Published migration example repo (Rails 7)](https://github.com/shakacode/react-on-rails-migration-example)

## Dive deeper when you need it

- [Introduction](./introduction.md)
- [Core Concepts](./core-concepts/how-react-on-rails-works.md)
- [API Reference](./api-reference/view-helpers-api.md)
- [Deployment and troubleshooting](./deployment/README.md)
- [Configuration](./configuration/README.md)
- [Changelog](https://github.com/shakacode/react_on_rails/blob/main/CHANGELOG.md)

## Pro features

Start at [React on Rails Pro](./pro/react-on-rails-pro.md) for the canonical Pro route map, then choose the feature family you need:

- [React Server Components](./pro/react-server-components/tutorial.md) - RSC tutorial and deep dive
- [Streaming SSR](./pro/streaming-ssr.md) - Progressive server rendering
- [Node Renderer](./pro/node-renderer.md) - Dedicated Node.js rendering server
- [Fragment Caching](./pro/fragment-caching.md) - Cache rendered components
- [Upgrading to Pro](./pro/upgrading-to-pro.md) - Switch from OSS to Pro in three steps
- [Node Renderer: Container Deployment](./building-features/node-renderer/container-deployment.md) (Pro) - Sidecar vs. separate workloads, memory tuning, troubleshooting

## ShakaCode Trust-Based Commercial Licensing

- Free to learn, evaluate, demo, and use for qualifying open-source projects.
- Paid when React on Rails Pro creates private business value in production.
- No token is required for development, test, CI/CD, and staging; Pro logs license status instead of blocking evaluation.
- Production use remains governed by the React on Rails Pro EULA. See [Pro pricing and sign up](https://pro.reactonrails.com/) for current options. If your organization is budget-constrained, [contact us](mailto:justin@shakacode.com) about free or low-cost licenses.


## Packages

React on Rails ships as a Ruby gem with companion npm packages. Versions are pulled live from each registry.

| Package | Version | Registry | Description |
| --- | --- | --- | --- |
| [`react_on_rails`](https://rubygems.org/gems/react_on_rails) | [![react_on_rails version](https://img.shields.io/gem/v/react_on_rails?label=)](https://rubygems.org/gems/react_on_rails) | RubyGems | Rails integration gem for React on Rails open source. |
| [`react-on-rails`](https://www.npmjs.com/package/react-on-rails) | [![react-on-rails version](https://img.shields.io/npm/v/react-on-rails?label=)](https://www.npmjs.com/package/react-on-rails) | npm | JavaScript runtime and helpers for the open source gem. |
| [`react_on_rails_pro`](https://rubygems.org/gems/react_on_rails_pro) | [![react_on_rails_pro version](https://img.shields.io/gem/v/react_on_rails_pro?label=)](https://rubygems.org/gems/react_on_rails_pro) | RubyGems | Pro Rails gem for SSR, RSC, streaming, and Node Renderer integration. |
| [`react-on-rails-pro`](https://www.npmjs.com/package/react-on-rails-pro) | [![react-on-rails-pro version](https://img.shields.io/npm/v/react-on-rails-pro?label=)](https://www.npmjs.com/package/react-on-rails-pro) | npm | Pro client package for higher-throughput SSR and related integrations. |
| [`react-on-rails-pro-node-renderer`](https://www.npmjs.com/package/react-on-rails-pro-node-renderer) | [![react-on-rails-pro-node-renderer version](https://img.shields.io/npm/v/react-on-rails-pro-node-renderer?label=)](https://www.npmjs.com/package/react-on-rails-pro-node-renderer) | npm | Dedicated Node.js renderer used by React on Rails Pro. |
| [`react-on-rails-rsc`](https://www.npmjs.com/package/react-on-rails-rsc) | [![react-on-rails-rsc version](https://img.shields.io/npm/v/react-on-rails-rsc?label=)](https://www.npmjs.com/package/react-on-rails-rsc) | npm | React Server Components support package. |
| [`create-react-on-rails-app`](https://www.npmjs.com/package/create-react-on-rails-app) | [![create-react-on-rails-app version](https://img.shields.io/npm/v/create-react-on-rails-app?label=)](https://www.npmjs.com/package/create-react-on-rails-app) | npm | CLI for scaffolding a new Rails and React app. |

## Need more help?

- [Historical Reference](./archive/README.md)
- [GitHub Discussions](https://github.com/shakacode/react_on_rails/discussions)
