# Dependency upgrade notes

- TypeScript is pinned to `6.0.3`. The current `typescript-eslint@8.68.0`
  peer dependency supports TypeScript versions `>=4.8.4 <6.1.0`, so TypeScript
  7 cannot be adopted without leaving the supported linting toolchain range.
