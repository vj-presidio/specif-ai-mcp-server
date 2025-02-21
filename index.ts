#!/usr/bin/env node
import { DocumentService } from './src/services/document.service'
import { ServerService } from './src/services/server.service'
import { resolve } from 'path'
import { logger } from './src/utils/logger'

// Version is injected during build
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      VERSION: string
    }
  }
}

/**
 * Print version information
 */
function printVersion() {
  console.log(process.env.VERSION || 'unknown')
}

/**
 * Print usage instructions
 */
function printHelp() {
  // Keep console.error for help output since it's CLI usage information
  console.error(`
specif-ai-mcp-server - v${process.env.VERSION}

Usage: specif-ai-mcp-server <project-path>

Arguments:
  project-path    Path to the project directory containing specification files

Options:
  -h, --help      Display this help message
  -v, --version   Display version information

Example:
  specif-ai-mcp-server ./my-project
  npx specif-ai-mcp-server ./my-project
  bunx specif-ai-mcp-server ./my-project
`)
}

/**
 * Main entry point for the Specif-ai MCP Server
 */
async function main() {
  try {
    logger.info({ version: process.env.VERSION }, 'Starting Specif-ai MCP Server')

    // Get project path from command line arguments
    const args = process.argv.slice(2)

    if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
      printHelp()
      process.exit(args.length === 0 ? 1 : 0)
    }

    if (args[0] === '--version' || args[0] === '-v') {
      printVersion()
      process.exit(0)
    }

    const projectPath = resolve(process.cwd(), args[0])
    logger.info({ projectPath }, 'Initializing with project path')

    // Initialize document service and load solution
    const documentService = new DocumentService()
    const solution = await documentService.loadSolution(projectPath)

    // Initialize and start server
    const serverService = new ServerService(solution)
    await serverService.start()

    logger.info('Specif-ai MCP Server running on stdio')
  } catch (error) {
    logger.error({ error: error instanceof Error ? error.message : String(error) }, 'Fatal error')
    process.exit(1)
  }
}

// Handle process signals
process.on('SIGINT', () => {
  logger.info('Received SIGINT. Shutting down...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM. Shutting down...')
  process.exit(0)
})

// Start the application
main()
