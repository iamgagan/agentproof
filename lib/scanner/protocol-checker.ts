// lib/scanner/protocol-checker.ts
// Checks for UCP, ACP, MCP protocol endpoints (20 pts)

import type { CategoryResult, DetectedPlatform } from '../types';
import { createIssue } from './scoring';

const CATEGORY = 'protocolReadiness' as const;

async function checkEndpoint(url: string): Promise<{ found: boolean; status: number | null }> {
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000),
      redirect: 'follow',
    });
    // Also try GET if HEAD returns 405
    if (res.status === 405) {
      const getRes = await fetch(url, { signal: AbortSignal.timeout(5000), redirect: 'follow' });
      return { found: getRes.ok, status: getRes.status };
    }
    return { found: res.ok, status: res.status };
  } catch {
    return { found: false, status: null };
  }
}

export async function checkProtocols(
  baseUrl: string,
  platform: DetectedPlatform | null,
  homepageHtml?: string,
): Promise<CategoryResult> {
  let score = 0;
  const issues: CategoryResult['issues'] = [];

  // --- Check 1: UCP manifest (6 pts) ---
  const ucpPaths = ['/.well-known/ucp.json', '/ucp.json'];
  let ucpFound = false;

  for (const path of ucpPaths) {
    const result = await checkEndpoint(`${baseUrl}${path}`);
    if (result.found) {
      ucpFound = true;
      score += 6;
      break;
    }
  }

  if (!ucpFound) {
    issues.push(
      createIssue(
        CATEGORY,
        'critical',
        'No UCP (Universal Commerce Protocol) manifest found',
        'Google\'s Universal Commerce Protocol enables AI agents in Google AI Mode and Gemini to discover, compare, and purchase your products directly. Without a UCP manifest, your store is invisible to Google\'s agentic commerce.',
        'You cannot sell through Google AI Mode, Gemini, or any UCP-compatible AI shopping agent. This is the primary protocol for agentic commerce in 2026.',
        'Implement a UCP manifest at /.well-known/ucp.json. If on Shopify, enable Agentic Storefronts in your admin. For other platforms, see developers.google.com/merchant/ucp.',
        6
      )
    );
  }

  // --- Check 2: ACP feed (6 pts) ---
  const acpPaths = ['/agentic-feed', '/.well-known/agentic-commerce'];
  let acpFound = false;

  for (const path of acpPaths) {
    const result = await checkEndpoint(`${baseUrl}${path}`);
    if (result.found) {
      acpFound = true;
      score += 6;
      break;
    }
  }

  // Shopify stores may have ACP via platform — give partial credit
  if (!acpFound && platform === 'shopify') {
    score += 2;
    issues.push(
      createIssue(
        CATEGORY,
        'warning',
        'Shopify detected but ACP may not be activated',
        'Your store runs on Shopify which supports the Agentic Commerce Protocol (ACP) for ChatGPT Shopping. However, we couldn\'t detect an active ACP feed — you may need to enable Agentic Storefronts in your Shopify admin.',
        'ChatGPT users cannot purchase your products directly within the chat interface.',
        'Go to Shopify Admin → Settings → Agentic Storefronts and toggle on ChatGPT/OpenAI. Ensure your product data is complete in Shopify Catalog.',
        4
      )
    );
  } else if (!acpFound) {
    issues.push(
      createIssue(
        CATEGORY,
        'critical',
        'No ACP (Agentic Commerce Protocol) endpoint found',
        'OpenAI\'s Agentic Commerce Protocol enables purchases directly within ChatGPT and Microsoft Copilot. Without ACP, your store cannot participate in conversational commerce on these platforms.',
        'Your products cannot be purchased through ChatGPT Shopping or Microsoft Copilot checkout — channels processing 50M+ shopping queries daily.',
        'Implement an ACP-compliant /agentic-feed endpoint. Apply as a merchant at chatgpt.com/merchants. If on Shopify, enable Agentic Storefronts.',
        6
      )
    );
  }

  // --- Check 3: MCP server (4 pts) ---
  const mcpPaths = ['/.well-known/mcp.json', '/mcp.json'];
  let mcpFound = false;

  for (const path of mcpPaths) {
    const result = await checkEndpoint(`${baseUrl}${path}`);
    if (result.found) {
      mcpFound = true;
      score += 4;
      break;
    }
  }

  if (!mcpFound) {
    issues.push(
      createIssue(
        CATEGORY,
        'warning',
        'No MCP (Model Context Protocol) server detected',
        'MCP servers allow AI agents to securely query your product catalog, check inventory, and complete transactions programmatically. This is the foundational protocol for agent-to-store communication.',
        'Enterprise AI purchasing agents and tool-using AI assistants cannot interact with your store programmatically.',
        'Deploy an MCP server that exposes your product catalog. FastMCP (Python) or the official MCP TypeScript SDK can get you started in hours.',
        4
      )
    );
  }

  // --- Check 4: A2A Agent Card (2 pts) ---
  const agentCardResult = await checkEndpoint(`${baseUrl}/.well-known/agent.json`);
  if (agentCardResult.found) {
    score += 2;
  } else {
    issues.push(
      createIssue(
        CATEGORY,
        'info',
        'No A2A Agent Card found',
        'The Agent-to-Agent (A2A) protocol uses agent.json at /.well-known/agent.json to describe your store\'s agent capabilities. This enables AI agents to discover how to interact with your store programmatically.',
        'AI agents using the A2A protocol cannot discover your store\'s capabilities for automated purchasing.',
        'Create a /.well-known/agent.json file describing your store\'s agent interaction capabilities. See the Google A2A specification.',
        2
      )
    );
  }

  // --- Check 5: Agent-related link tags in HTML (2 pts) ---
  let agentLinkFound = false;
  if (homepageHtml) {
    const linkPatterns = [
      /rel\s*=\s*["'][^"']*mcp[^"']*["']/i,
      /rel\s*=\s*["'][^"']*agent[^"']*["']/i,
      /rel\s*=\s*["'][^"']*ai-plugin[^"']*["']/i,
    ];
    agentLinkFound = linkPatterns.some((p) => p.test(homepageHtml));
  }

  if (agentLinkFound) {
    score += 2;
  } else {
    issues.push(
      createIssue(
        CATEGORY,
        'info',
        'No agent-related link tags found in HTML',
        'Modern agentic protocols use <link> tags (e.g., rel="mcp", rel="agent") to advertise agent endpoints. These help AI agents discover how to interact with your store without guessing endpoint URLs.',
        'AI agents must rely on well-known URL conventions rather than explicit discovery, which reduces the chance of successful interaction.',
        'Add <link rel="mcp" href="/.well-known/mcp.json"> or similar agent discovery link tags to your HTML <head>.',
        2
      )
    );
  }

  return {
    score,
    maxScore: 20,
    percentage: Math.round((score / 20) * 100),
    issues,
  };
}
