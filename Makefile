.PHONY: all clean build build-fast setup install lint lint-fix help

# Default target
all: setup lint build ## Default target, builds everything

# Setup - install dependencies
setup: ## Install dependencies with exact versions (using npm ci)
	@echo "Installing dependencies for bodhijs-test-app..."
	npm ci
	@echo "bodhijs-test-app dependencies installed successfully"

# Install - install dependencies
install: ## Install dependencies (using npm install)
	@echo "Installing dependencies for bodhijs-test-app..."
	npm install
	@echo "bodhijs-test-app dependencies installed successfully"

# Clean build artifacts
clean: ## Clean build artifacts
	@echo "Cleaning build artifacts..."
	npm run clean
	@echo "Build artifacts cleaned"

# Build the app
build: ## Build bodhijs-test-app
	npm run build
	@echo "bodhijs-test-app built successfully"

# Fast build - only if sources changed
build-fast: ## Fast build bodhijs-test-app (only if sources changed)
	npm run build:fast
	@echo "bodhijs-test-app fast build completed"

# Serve the app
serve: ## Serve the app
	npm run serve
	@echo "bodhijs-test-app served successfully"

# Run ESLint
lint: ## Run ESLint checks
	@echo "Running ESLint checks..."
	npm run lint
	@echo "ESLint checks completed"

# Fix ESLint issues automatically
lint-fix: ## Fix ESLint issues automatically
	@echo "Fixing ESLint issues..."
	npm run lint:fix
	@echo "ESLint fixes completed"

.PHONY: help
help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z0-9._-]+:.*?## / {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)