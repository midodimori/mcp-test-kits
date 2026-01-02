# MCP Test Kits Makefile
.PHONY: all build test lint lint-fix spec-compare clean help

help:
	@echo "MCP Test Kits Commands"
	@echo ""
	@echo "  make build         - Build both Python and TypeScript"
	@echo "  make test          - Run tests for both implementations"
	@echo "  make lint          - Lint both implementations"
	@echo "  make lint-fix      - Auto-fix lint issues"
	@echo "  make spec-compare  - Verify specs match shared data"
	@echo "  make clean         - Clean build artifacts"
	@echo ""
	@echo "Python-specific:"
	@echo "  make py-build      - Build Python package"
	@echo "  make py-test       - Run Python tests"
	@echo "  make py-lint       - Lint Python code"
	@echo "  make py-lint-fix   - Auto-fix Python lint issues"
	@echo "  make py-spec       - Extract Python spec to stdout"
	@echo "  make py-clean      - Clean Python artifacts"
	@echo ""
	@echo "TypeScript-specific:"
	@echo "  make ts-build      - Build TypeScript package"
	@echo "  make ts-test       - Run TypeScript tests"
	@echo "  make ts-lint       - Lint TypeScript code"
	@echo "  make ts-lint-fix   - Auto-fix TypeScript lint issues"
	@echo "  make ts-spec       - Extract TypeScript spec to stdout"
	@echo "  make ts-clean      - Clean TypeScript artifacts"

# ============================================================
# All targets
# ============================================================

all: build test spec-compare

build: py-build ts-build

test: py-test ts-test

lint: py-lint ts-lint

lint-fix: py-lint-fix ts-lint-fix

spec-compare: py-spec-compare ts-spec-compare

clean: py-clean ts-clean

# ============================================================
# Python targets
# ============================================================

py-build:
	cd python && uv sync

py-test:
	cd python && uv run pytest

py-lint:
	cd python && uv run ruff check src/
	cd python && uv run mypy src/ --check-untyped-defs

py-lint-fix:
	cd python && find src -name "*.py" -type f -exec uv run pyupgrade --py311-plus {} + || true
	cd python && uv run autoflake --recursive --remove-all-unused-imports --remove-unused-variables --in-place src
	cd python && uv run isort src --profile black
	cd python && uv run black src
	cd python && uv run ruff check src/ --fix || true
	cd python && uv run mypy src/ --check-untyped-defs

py-spec:
	cd python && uv run python -m mcp_test_kits.extract_spec

py-spec-compare:
	@echo "Comparing Python spec..."
	@cd python && uv run python -m mcp_test_kits.extract_spec --compare >/dev/null && echo "✅ Python spec matches"

py-clean:
	rm -rf python/dist python/.venv python/__pycache__
	find python -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true

# ============================================================
# TypeScript targets
# ============================================================

ts-build:
	cd typescript && npm install && npm run build

ts-test:
	cd typescript && npm test

ts-lint:
	cd typescript && npm run lint
	cd typescript && npm run typecheck

ts-lint-fix:
	cd typescript && npm run lint -- --fix || true
	cd typescript && npx prettier --write src/
	cd typescript && npm run typecheck

ts-spec:
	cd typescript && node dist/extract-spec.js

ts-spec-compare:
	@echo "Comparing TypeScript spec..."
	@cd typescript && node dist/extract-spec.js --compare >/dev/null && echo "✅ TypeScript spec matches"

ts-clean:
	rm -rf typescript/dist typescript/node_modules

# ============================================================
# Publishing targets
# ============================================================

py-publish:
	cd python && uv build && uv publish

ts-publish:
	cd typescript && npm run build && npm publish

# ============================================================
# Setup & Pre-commit
# ============================================================

setup: install-hooks py-build ts-build
	@echo "✅ Setup complete! Run 'make precommit' before committing."

install-hooks:
	uv tool install pre-commit
	pre-commit install

precommit:
	make lint-fix
	make spec-compare
