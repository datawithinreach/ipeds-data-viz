#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
TEMPLATES_DIR="${ROOT_DIR}/templates"
ARTICLES_DIR="${ROOT_DIR}/app/article"

if [[ -t 1 ]] && command -v tput >/dev/null 2>&1; then
  BOLD="$(tput bold)"
  RESET="$(tput sgr0)"
  BLUE="$(tput setaf 4)"
  GREEN="$(tput setaf 2)"
  YELLOW="$(tput setaf 3)"
  RED="$(tput setaf 1)"
else
  BOLD=""
  RESET=""
  BLUE=""
  GREEN=""
  YELLOW=""
  RED=""
fi

hr() {
  printf '%s============================================================%s\n' "${BOLD}" "${RESET}"
}

section_title() {
  printf '\n%s%s%s%s\n' "${BOLD}" "${BLUE}" "$1" "${RESET}"
  hr
}

info() {
  printf '%s\n' "$1"
}

warn() {
  printf '%s%s%s\n' "${YELLOW}" "$1" "${RESET}"
}

error() {
  printf '%s%s%s\n' "${RED}" "$1" "${RESET}" >&2
}

success() {
  printf '%s%s%s\n' "${GREEN}" "$1" "${RESET}"
}

normalize_slug() {
  printf '%s' "$1" \
    | tr '[:upper:]' '[:lower:]' \
    | sed -E 's/[[:space:]]+/-/g; s/[^a-z0-9-]//g; s/-+/-/g; s/^-+//; s/-+$//'
}

is_valid_slug() {
  local slug="$1"
  [[ ${#slug} -le 120 ]] && [[ "$slug" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]
}

templates=()
for dir in "${TEMPLATES_DIR}"/*; do
  [[ -d "$dir" ]] || continue
  [[ -f "${dir}/article.mdx" && -f "${dir}/page.tsx" ]] || continue
  templates+=("$(basename "$dir")")
done
if [[ ${#templates[@]} -gt 0 ]]; then
  templates_sorted=()
  while IFS= read -r line; do
    [[ -n "${line}" ]] && templates_sorted+=("${line}")
  done < <(printf '%s\n' "${templates[@]}" | LC_ALL=C sort)
  templates=("${templates_sorted[@]}")
fi

if [[ ${#templates[@]} -eq 0 ]]; then
  error "No templates found in ${TEMPLATES_DIR}"
  exit 1
fi

section_title "Create a new article from a template"

selected_template=""
info "Available templates:"
for i in "${!templates[@]}"; do
  idx=$((i + 1))
  printf '  %s%d.%s %s\n' "${BOLD}" "${idx}" "${RESET}" "${templates[i]}"
done
echo

while true; do
  read -r -p "Choose template (1-${#templates[@]}): " choice
  if [[ "$choice" =~ ^[0-9]+$ ]] && (( choice >= 1 && choice <= ${#templates[@]} )); then
    selected_template="${templates[choice-1]}"
    break
  fi
  warn "Please enter a number between 1 and ${#templates[@]}."
done

echo
success "Selected template: ${selected_template}"

section_title "Article slug"
info "URL-safe name (letters, numbers, hyphens). Example: tuition-trends-2024"
slug=""
while true; do
  read -r -p "Article slug: " raw_slug
  raw_slug_trimmed="$(printf '%s' "${raw_slug}" | sed -E 's/^[[:space:]]+//; s/[[:space:]]+$//')"
  slug="$(normalize_slug "${raw_slug}")"
  if [[ -z "${slug}" ]]; then
    warn "Slug cannot be empty."
    continue
  fi
  if ! is_valid_slug "${slug}"; then
    warn "Use lowercase letters, numbers, and single hyphens between words (max 120 chars)."
    continue
  fi
  if [[ "${raw_slug_trimmed}" != "${slug}" ]]; then
    warn "Adjusted to URL-friendly slug: ${slug}"
    read -r -p "Use this slug? [Y/n]: " confirm_slug
    if [[ -n "${confirm_slug}" && ! "${confirm_slug}" =~ ^[Yy]$ ]]; then
      continue
    fi
  fi
  if [[ -e "${ARTICLES_DIR}/${slug}" ]]; then
    warn "Slug already exists: app/article/${slug}. Choose a different slug."
    continue
  fi
  break
done

src_dir="${TEMPLATES_DIR}/${selected_template}"
dest_dir="${ARTICLES_DIR}/${slug}"

if [[ ! -f "${src_dir}/article.mdx" || ! -f "${src_dir}/page.tsx" ]]; then
  error "Error: ${selected_template} is missing article.mdx or page.tsx."
  exit 1
fi

mkdir -p "${dest_dir}"
cp "${src_dir}/article.mdx" "${dest_dir}/article.mdx"
cp "${src_dir}/page.tsx" "${dest_dir}/page.tsx"

perl -0pi -e "s|href: '/article/your-article-slug'|href: '/article/${slug}'|g" "${dest_dir}/article.mdx"

section_title "Done"
success "Created files:"
printf '  %sapp/article/%s/article.mdx%s\n' "${BOLD}" "${slug}" "${RESET}"
printf '  %sapp/article/%s/page.tsx%s\n' "${BOLD}" "${slug}" "${RESET}"

echo
info "Template used: ${selected_template}"
info "Public URL:    /article/${slug}"

section_title "Next steps"
printf '  %s1.%s Run %spnpm run dev%s (if not running) and open %shttp://localhost:3000/article/%s%s\n' "${BOLD}" "${RESET}" "${BOLD}" "${RESET}" "${BOLD}" "${slug}" "${RESET}"
printf '  %s2.%s Edit article.mdx (title, description, dates, tags, data, prose, source).\n' "${BOLD}" "${RESET}"
printf '  %s3.%s After content is ready, run: %spnpm generate:article-registry%s\n' "${BOLD}" "${RESET}" "${BOLD}" "${RESET}"
printf '  %s4.%s Confirm the story appears correctly on the home page.\n' "${BOLD}" "${RESET}"
