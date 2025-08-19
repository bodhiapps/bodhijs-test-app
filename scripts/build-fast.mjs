#!/usr/bin/env node

import { createHash } from 'crypto';
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname, normalize } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);

/**
 * Calculate MD5 hash for a file
 */
function hashFile(filePath) {
  try {
    const content = readFileSync(filePath);
    return createHash('md5').update(content).digest('hex');
  } catch (error) {
    console.warn(`Warning: Could not hash file ${filePath}: ${error.message}`);
    return null;
  }
}

/**
 * Calculate MD5 hash for a directory (recursive)
 */
function hashDirectory(dirPath) {
  try {
    const files = [];

    function collectFiles(currentPath) {
      const items = readdirSync(currentPath);

      for (const item of items) {
        const fullPath = join(currentPath, item);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          // Skip node_modules, .git, .next, dist, and other build/cache directories
          if (!item.startsWith('.') && item !== 'node_modules' && item !== 'dist') {
            collectFiles(fullPath);
          }
        } else if (stat.isFile()) {
          // Only include source files, skip build artifacts and cache files
          if (!item.startsWith('.') && !item.endsWith('.log')) {
            files.push(fullPath);
          }
        }
      }
    }

    collectFiles(dirPath);

    // Sort files for consistent hashing
    files.sort();

    // Create combined hash from all file paths and their individual hashes
    const hasher = createHash('md5');

    for (const file of files) {
      const relativePath = file.replace(dirPath + '/', '');
      const fileHash = hashFile(file);
      if (fileHash) {
        hasher.update(`${relativePath}:${fileHash}`);
      }
    }

    return hasher.digest('hex');
  } catch (error) {
    console.warn(`Warning: Could not hash directory ${dirPath}: ${error.message}`);
    return null;
  }
}

/**
 * Calculate hash for a path (file or directory)
 */
function hashPath(path, projectDir) {
  const fullPath = join(projectDir, path);

  if (!existsSync(fullPath)) {
    console.warn(`Warning: Path ${path} does not exist`);
    return null;
  }

  const stat = statSync(fullPath);

  if (stat.isFile()) {
    return hashFile(fullPath);
  } else if (stat.isDirectory()) {
    return hashDirectory(fullPath);
  }

  return null;
}

/**
 * Load cached hashes
 */
function loadCache(cacheFile) {
  if (!existsSync(cacheFile)) {
    return {};
  }

  try {
    const content = readFileSync(cacheFile, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.warn(`Warning: Could not load cache file: ${error.message}`);
    return {};
  }
}

/**
 * Save hashes to cache
 */
function saveCache(hashes, cacheFile) {
  try {
    // Ensure dist directory exists
    const distDir = dirname(cacheFile);
    if (!existsSync(distDir)) {
      execSync('mkdir -p ' + distDir);
    }

    writeFileSync(cacheFile, JSON.stringify(hashes, null, 2));
  } catch (error) {
    console.warn(`Warning: Could not save cache file: ${error.message}`);
  }
}

/**
 * Check if build is needed
 */
function checkBuildNeeded(watchPaths, cacheFile, projectDir) {
  console.log('🔍 Checking for changes...');

  const cachedHashes = loadCache(cacheFile);
  const currentHashes = {};
  const changedPaths = [];

  // Calculate current hashes
  for (const path of watchPaths) {
    console.log(`   Hashing ${path}...`);
    const hash = hashPath(path, projectDir);
    if (hash) {
      currentHashes[path] = hash;

      // Check if changed
      if (cachedHashes[path] !== hash) {
        changedPaths.push(path);
      }
    }
  }

  return { currentHashes, changedPaths };
}

/**
 * Run the build process
 */
function runBuild(buildCommand, projectDir) {
  console.log('🔨 Running build...');
  try {
    execSync(buildCommand, { stdio: 'inherit', cwd: projectDir });
    console.log('✅ Build completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    return false;
  }
}

/**
 * Main function
 */
function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error('Usage: build-fast.mjs <project-relative-path> [build-command] [watch-paths...]');
    console.error('Example: build-fast.mjs bodhi-browser-ext "npm run build" src public src-ext package.json next.config.ts');
    process.exit(1);
  }

  // Determine project root from script location
  const scriptDir = dirname(__filename);
  const projectRoot = dirname(scriptDir);

  // Resolve project directory relative to project root
  const projectDir = normalize(join(projectRoot, args[0]));
  const buildCommand = args[1] || 'npm run build';
  const watchPaths = args.slice(2);

  // Default watch paths if none provided
  const defaultWatchPaths = ['src', 'public', 'package.json'];
  const finalWatchPaths = watchPaths.length > 0 ? watchPaths : defaultWatchPaths;

  const cacheFile = join(projectDir, 'dist', '.build-cache.json');

  console.log(`🚀 Fast build check starting for ${projectDir}...`);

  const { currentHashes, changedPaths } = checkBuildNeeded(finalWatchPaths, cacheFile, projectDir);

  if (changedPaths.length === 0) {
    console.log('✨ No changes detected, skipping build');
    return;
  }

  console.log('📝 Changes detected in:');
  for (const path of changedPaths) {
    console.log(`   - ${path}`);
  }

  const buildSuccess = runBuild(buildCommand, projectDir);

  if (buildSuccess) {
    console.log('💾 Updating build cache...');
    saveCache(currentHashes, cacheFile);
    console.log('✅ Fast build completed successfully');
  } else {
    console.error('❌ Fast build failed');
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
} 