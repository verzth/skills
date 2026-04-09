#!/bin/bash
# ============================================================
# verzth/skills — Installer
#
# Install all:   curl -fsSL https://raw.githubusercontent.com/verzth/skills/main/install.sh | bash
# Install one:   curl -fsSL https://raw.githubusercontent.com/verzth/skills/main/install.sh | bash -s -- humanoid-thinking
# Install many:  curl -fsSL https://raw.githubusercontent.com/verzth/skills/main/install.sh | bash -s -- humanoid-thinking another-skill
# ============================================================

set -e

REPO="verzth/skills"
REPO_URL="https://github.com/$REPO"
RAW_BASE="https://raw.githubusercontent.com/$REPO/main"

# All available skills (update this list when adding new skills)
ALL_SKILLS=(
    "humanoid-thinking"
)

# Parse arguments
REQUESTED_SKILLS=("$@")
if [ ${#REQUESTED_SKILLS[@]} -eq 0 ]; then
    REQUESTED_SKILLS=("${ALL_SKILLS[@]}")
    echo "📦 Installing ALL skills from $REPO..."
else
    echo "📦 Installing selected skills from $REPO..."
fi

# Detect target directory
if [ -d ".claude/skills" ]; then
    BASE_TARGET=".claude/skills"
elif [ -d "$HOME/.claude/skills" ]; then
    BASE_TARGET="$HOME/.claude/skills"
else
    BASE_TARGET=".claude/skills"
    mkdir -p "$BASE_TARGET"
fi

echo "   Target: $BASE_TARGET/"
echo ""

# Try git sparse checkout first (most efficient for mono-repo)
install_via_git() {
    local skill=$1
    local target="$BASE_TARGET/$skill"
    local tmp_dir=$(mktemp -d)

    cd "$tmp_dir"
    git init -q
    git remote add origin "$REPO_URL.git"
    git config core.sparseCheckout true
    echo "skills/$skill/" > .git/info/sparse-checkout
    git pull -q --depth 1 origin main 2>/dev/null

    if [ -d "skills/$skill" ]; then
        rm -rf "$target"
        cp -r "skills/$skill" "$target"
        rm -rf "$tmp_dir"
        return 0
    fi

    rm -rf "$tmp_dir"
    return 1
}

# Fallback: download via curl using manifest
install_via_curl() {
    local skill=$1
    local target="$BASE_TARGET/$skill"
    local manifest_url="$RAW_BASE/skills/$skill/MANIFEST"

    local manifest
    manifest=$(curl -fsSL "$manifest_url" 2>/dev/null) || {
        mkdir -p "$target/references"
        curl -fsSL "$RAW_BASE/skills/$skill/SKILL.md" -o "$target/SKILL.md" 2>/dev/null || return 1
        curl -fsSL "$RAW_BASE/skills/$skill/personality.md" -o "$target/personality.md" 2>/dev/null || true
        curl -fsSL "$RAW_BASE/skills/$skill/references/onboarding.md" -o "$target/references/onboarding.md" 2>/dev/null || true
        find "$target" -type d -empty -delete 2>/dev/null || true
        return 0
    }

    mkdir -p "$target"
    while IFS= read -r file; do
        [ -z "$file" ] && continue
        [[ "$file" == \#* ]] && continue
        local dir=$(dirname "$file")
        [ "$dir" != "." ] && mkdir -p "$target/$dir"
        curl -fsSL "$RAW_BASE/skills/$skill/$file" -o "$target/$file"
    done <<< "$manifest"

    return 0
}

# Backup personality files before install
backup_personality() {
    local skill=$1
    local target="$BASE_TARGET/$skill"
    if [ -f "$target/personality.md" ]; then
        local status=$(grep "^status:" "$target/personality.md" 2>/dev/null | head -1)
        if [[ "$status" == *"configured"* ]]; then
            cp "$target/personality.md" "/tmp/${skill}-personality-$(date +%s).md"
            echo "   💾 Backed up personality.md"
            return 0
        fi
    fi
    return 1
}

# Restore personality after install
restore_personality() {
    local skill=$1
    local target="$BASE_TARGET/$skill"
    local backup=$(ls -t /tmp/${skill}-personality-*.md 2>/dev/null | head -1)
    if [ -n "$backup" ] && [ -f "$backup" ]; then
        cp "$backup" "$target/personality.md"
        echo "   🔄 Restored personality settings"
    fi
}

# Install each skill
SUCCESS=0
FAIL=0
for skill in "${REQUESTED_SKILLS[@]}"; do
    echo "── $skill"

    if ! curl -fsSL "$RAW_BASE/skills/$skill/SKILL.md" -o /dev/null 2>/dev/null; then
        echo "   ❌ Skill not found in repo"
        FAIL=$((FAIL + 1))
        continue
    fi

    HAS_BACKUP=false
    backup_personality "$skill" && HAS_BACKUP=true

    if command -v git &> /dev/null && install_via_git "$skill" 2>/dev/null; then
        echo "   ✅ Installed (via git)"
    elif install_via_curl "$skill"; then
        echo "   ✅ Installed (via curl)"
    else
        echo "   ❌ Failed to install"
        FAIL=$((FAIL + 1))
        continue
    fi

    [ "$HAS_BACKUP" = true ] && restore_personality "$skill"

    SUCCESS=$((SUCCESS + 1))
done

echo ""
echo "════════════════════════════════════"
echo "  ✅ Installed: $SUCCESS"
[ $FAIL -gt 0 ] && echo "  ❌ Failed: $FAIL"
echo "  📁 Location: $BASE_TARGET/"
echo "════════════════════════════════════"
