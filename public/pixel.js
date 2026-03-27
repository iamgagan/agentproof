// AgentProof AI Agent Traffic Pixel — lightweight tracker for AI bot visits
// Usage: <script src="https://agent-proof.com/pixel.js" data-site="SITE_ID" async></script>
(function() {
  'use strict';
  var AI_AGENTS = [
    { pattern: /gptbot/i, type: 'gptbot' },
    { pattern: /chatgpt-user/i, type: 'chatgpt' },
    { pattern: /claudebot/i, type: 'claudebot' },
    { pattern: /anthropic-ai/i, type: 'claudebot' },
    { pattern: /google-extended/i, type: 'google-extended' },
    { pattern: /perplexitybot/i, type: 'perplexitybot' },
    { pattern: /amazonbot/i, type: 'amazonbot' },
    { pattern: /cohere-ai/i, type: 'cohere' },
    { pattern: /meta-externalagent/i, type: 'meta' },
    { pattern: /bingbot/i, type: 'bingbot' }
  ];

  var ua = navigator.userAgent || '';
  var scripts = document.getElementsByTagName('script');
  var siteId = '';
  for (var i = 0; i < scripts.length; i++) {
    if (scripts[i].src && scripts[i].src.indexOf('pixel.js') !== -1) {
      siteId = scripts[i].getAttribute('data-site') || '';
      break;
    }
  }
  if (!siteId) return;

  var agentType = null;
  for (var j = 0; j < AI_AGENTS.length; j++) {
    if (AI_AGENTS[j].pattern.test(ua)) {
      agentType = AI_AGENTS[j].type;
      break;
    }
  }

  // Always send a page view (even non-bot) for analytics; the server filters
  var payload = JSON.stringify({
    s: siteId,
    u: window.location.href,
    a: ua,
    t: agentType,
    r: document.referrer || null,
    ts: new Date().toISOString()
  });

  var endpoint = 'https://agent-proof.com/api/pixel';
  // Use relative URL if same origin
  if (window.location.hostname === 'agent-proof.com' || window.location.hostname === 'localhost') {
    endpoint = '/api/pixel';
  }

  if (navigator.sendBeacon) {
    navigator.sendBeacon(endpoint, payload);
  } else {
    var img = new Image();
    img.src = endpoint + '?s=' + encodeURIComponent(siteId) +
      '&u=' + encodeURIComponent(window.location.href) +
      '&a=' + encodeURIComponent(ua) +
      '&t=' + encodeURIComponent(agentType || '') +
      '&r=' + encodeURIComponent(document.referrer || '');
  }
})();
