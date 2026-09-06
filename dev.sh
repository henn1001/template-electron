#!/usr/bin/env bash
set -euo pipefail

install() {
  echo "Installing dependencies..."
  npm install --allow-git=all --no-audit --no-fund "$@"
}

update() {
  echo "Checking for updates (root + all workspaces)..."
  local before after
  before=$(find . -maxdepth 3 -name package.json -not -path '*/node_modules/*' | sort | xargs cat | sha256sum)
  npx npm-check-updates --workspaces --root --interactive --upgrade --format group "$@"
  after=$(find . -maxdepth 3 -name package.json -not -path '*/node_modules/*' | sort | xargs cat | sha256sum)

  echo "Checking for diverged versions across workspaces..."
  node -e '
    const fs = require("fs");
    const files = ["package.json", ...fs.globSync("{apps,packages}/*/package.json")];
    const seen = {};
    for (const f of files) {
      const pkg = JSON.parse(fs.readFileSync(f, "utf8"));
      for (const section of ["dependencies", "devDependencies", "optionalDependencies", "peerDependencies"]) {
        for (const [name, range] of Object.entries(pkg[section] || {})) {
          (seen[name] ??= {})[range] ??= [];
          seen[name][range].push(f);
        }
      }
    }
    let diverged = false;
    for (const [name, ranges] of Object.entries(seen)) {
      if (Object.keys(ranges).length > 1) {
        diverged = true;
        console.log(`- ${name}:`);
        for (const [range, fs_] of Object.entries(ranges)) console.log(`    ${range}  (${fs_.join(", ")})`);
      }
    }
    if (!diverged) console.log("All shared dependencies aligned.");
  '

  if [[ "$before" != "$after" ]]; then
    echo "package.json changed, syncing lockfile..."
    install
  else
    echo "No updates selected."
  fi
}

clean() {
  local reset=false
  case "${1:-}" in
  "") ;;
  reset | --reset | -r | --all) reset=true ;;
  *)
    echo "Unknown option: $1 (expected: reset)" >&2
    return 1
    ;;
  esac

  echo "Removing build output..."
  rm -rf apps/desktop/.vite apps/desktop/out apps/desktop/dist packages/ui/dist
  find . -path ./node_modules -prune -o -path '*/node_modules' -prune -o -type d \( -name dist -o -name out -o -name .vite -o -name coverage \) -exec rm -rf {} + 2>/dev/null || true
  find . -path ./node_modules -prune -o -path '*/node_modules' -prune -o -type f \( -name '*.tsbuildinfo' -o -name .eslintcache \) -delete 2>/dev/null || true

  if [[ "$reset" == true ]]; then
    echo "Removing node_modules..."
    find . -name node_modules -type d -prune -exec rm -rf {} +
    echo "Reset complete. Run './dev.sh install' to reinstall."
  else
    echo "Clean complete. Run './dev.sh clean reset' to also remove node_modules."
  fi
}

# Dynamically dispatch to functions
if false; then
  echo
elif declare -F "${1:-}" >/dev/null && [[ "${1:-}" != _* ]]; then
  "$@"
else
  echo "Usage: $(basename "$0") [OPTIONS]"
  echo
  echo -e "\033[1;4;32mOptions:\033[0;34m"
  compgen -A function | grep -v '^_'
  echo -e "\033[0m"
fi
