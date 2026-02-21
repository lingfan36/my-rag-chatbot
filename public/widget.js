(function() {
  'use strict';

  var config = window.DocBotConfig || {};
  if (!config.siteId || !config.apiUrl) {
    console.warn('DocBot: Missing siteId or apiUrl in DocBotConfig');
    return;
  }

  // Defaults before config loads
  var primaryColor = config.primaryColor || '#4f5fd5';
  var position = config.position || 'bottom-right';
  var posCSS = position === 'bottom-left' ? 'left' : 'right';
  var aiName = config.title || 'AI Assistant';
  var welcomeMessage = 'Hello! How can I help you today? Ask me anything about our documentation.';

  // State
  var isOpen = false;
  var sessionId = null;
  var visitorId = 'v_' + Math.random().toString(36).substr(2, 9);
  var initialized = false;

  function buildStyles(color) {
    var styles = document.createElement('style');
    styles.id = 'docbot-styles';
    styles.textContent = [
      '#docbot-widget-container *{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",sans-serif}',
      '#docbot-fab{position:fixed;' + posCSS + ':24px;bottom:24px;width:56px;height:56px;border-radius:16px;background:linear-gradient(135deg,' + color + ',hsl(250,35%,52%));color:#fff;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 3px hsla(230,52%,52%,0.2),0 8px 24px hsla(230,52%,52%,0.2);z-index:999998;transition:all 0.3s cubic-bezier(0.4,0,0.2,1)}',
      '#docbot-fab:hover{transform:scale(1.06) translateY(-1px);box-shadow:0 4px 14px hsla(230,52%,52%,0.28),0 12px 32px hsla(230,52%,52%,0.18)}',
      '#docbot-fab svg{width:24px;height:24px}',
      '#docbot-panel{position:fixed;' + posCSS + ':24px;bottom:92px;width:380px;max-width:calc(100vw - 48px);height:540px;max-height:calc(100vh - 140px);border-radius:16px;overflow:hidden;z-index:999999;display:none;flex-direction:column;background:#fff;transition:all 0.3s cubic-bezier(0.4,0,0.2,1);opacity:0;transform:translateY(10px) scale(0.98);box-shadow:inset 0 1px 0 0 rgba(255,255,255,0.8),inset 0 0 0 1px rgba(0,0,0,0.04),0 20px 60px rgba(0,0,0,0.1),0 1px 3px rgba(0,0,0,0.06)}',
      '#docbot-panel.open{display:flex;opacity:1;transform:translateY(0) scale(1)}',
      '#docbot-header{background:linear-gradient(135deg,' + color + ',hsl(250,35%,52%));color:#fff;padding:18px 20px;flex-shrink:0;position:relative}',
      '#docbot-header h3{font-size:15px;font-weight:600;letter-spacing:-0.01em}',
      '#docbot-header p{font-size:12px;opacity:0.6;margin-top:2px;font-weight:400}',
      '#docbot-header-close{position:absolute;top:14px;right:14px;background:rgba(255,255,255,0.12);border:none;color:#fff;width:28px;height:28px;border-radius:8px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;transition:background 0.2s}',
      '#docbot-header-close:hover{background:rgba(255,255,255,0.22)}',
      '#docbot-messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:14px;background:hsl(40,15%,97%)}',
      '#docbot-messages::-webkit-scrollbar{width:3px}',
      '#docbot-messages::-webkit-scrollbar-track{background:transparent}',
      '#docbot-messages::-webkit-scrollbar-thumb{background:hsl(220,10%,85%);border-radius:3px}',
      '.docbot-msg{display:flex;gap:8px;max-width:88%}',
      '.docbot-msg.user{align-self:flex-end;flex-direction:row-reverse}',
      '.docbot-msg-avatar{width:28px;height:28px;border-radius:8px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700}',
      '.docbot-msg.assistant .docbot-msg-avatar{background:linear-gradient(135deg,hsl(230,30%,96%),hsl(250,20%,95%));color:' + color + '}',
      '.docbot-msg-bubble{padding:10px 14px;border-radius:12px;font-size:13px;line-height:1.6;white-space:pre-wrap;word-break:break-all;overflow-wrap:break-word;min-width:0}',
      '.docbot-msg.assistant .docbot-msg-bubble{background:#fff;color:hsl(220,20%,20%);border:1px solid hsl(220,10%,90%);border-bottom-left-radius:4px;box-shadow:inset 0 1px 0 0 rgba(255,255,255,0.8),0 1px 2px rgba(0,0,0,0.03)}',
      '.docbot-msg.user .docbot-msg-bubble{background:linear-gradient(135deg,' + color + ',hsl(250,35%,52%));color:#fff;border-bottom-right-radius:4px;box-shadow:0 1px 3px hsla(230,52%,52%,0.2)}',
      '.docbot-typing{display:flex;gap:4px;padding:10px 14px;background:#fff;border:1px solid hsl(220,10%,90%);border-radius:12px;border-bottom-left-radius:4px;width:fit-content;box-shadow:inset 0 1px 0 0 rgba(255,255,255,0.8),0 1px 2px rgba(0,0,0,0.03)}',
      '.docbot-typing span{width:6px;height:6px;background:hsl(220,8%,70%);border-radius:50%;animation:docbot-bounce 1.4s infinite ease-in-out both}',
      '.docbot-typing span:nth-child(1){animation-delay:-0.32s}',
      '.docbot-typing span:nth-child(2){animation-delay:-0.16s}',
      '@keyframes docbot-bounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}',
      '#docbot-input-area{border-top:1px solid hsl(220,10%,92%);padding:14px;display:flex;gap:8px;flex-shrink:0;background:#fff}',
      '#docbot-input{flex:1;border:1px solid hsl(220,10%,88%);border-radius:10px;padding:9px 14px;font-size:13px;outline:none;resize:none;min-height:38px;max-height:80px;font-family:inherit;transition:all 0.2s;background:hsl(40,15%,97%)}',
      '#docbot-input:focus{border-color:' + color + ';box-shadow:0 0 0 3px ' + color + '22;background:#fff}',
      '#docbot-input::placeholder{color:hsl(220,8%,60%)}',
      '#docbot-send{background:linear-gradient(135deg,' + color + ',hsl(250,35%,52%));color:#fff;border:none;border-radius:10px;width:38px;height:38px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all 0.2s;box-shadow:0 1px 3px hsla(230,52%,52%,0.2)}',
      '#docbot-send:hover{transform:scale(1.04);box-shadow:0 4px 12px hsla(230,52%,52%,0.28)}',
      '#docbot-send:disabled{opacity:0.4;cursor:not-allowed;transform:none;box-shadow:none}',
      '#docbot-send svg{width:16px;height:16px}',
      '#docbot-powered{text-align:center;padding:7px;font-size:10px;color:hsl(220,8%,60%);background:#fff;border-top:1px solid hsl(220,10%,95%)}'
    ].join('\n');
    return styles;
  }

  function initWidget(name, welcome, color) {
    if (initialized) return;
    initialized = true;

    // Remove old styles if any
    var old = document.getElementById('docbot-styles');
    if (old) old.remove();
    document.head.appendChild(buildStyles(color));

    // Container
    var container = document.createElement('div');
    container.id = 'docbot-widget-container';

    // FAB
    var fab = document.createElement('button');
    fab.id = 'docbot-fab';
    fab.setAttribute('aria-label', 'Open chat');
    fab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';

    // Panel
    var panel = document.createElement('div');
    panel.id = 'docbot-panel';
    panel.innerHTML = [
      '<div id="docbot-header">',
      '  <h3>' + escapeHtml(name) + '</h3>',
      '  <p>Ask anything about our docs</p>',
      '  <button id="docbot-header-close">&times;</button>',
      '</div>',
      '<div id="docbot-messages"></div>',
      '<div id="docbot-input-area">',
      '  <textarea id="docbot-input" placeholder="Type your question..." rows="1"></textarea>',
      '  <button id="docbot-send" aria-label="Send"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>',
      '</div>',
      '<div id="docbot-powered">Powered by DocBot</div>'
    ].join('');

    container.appendChild(panel);
    container.appendChild(fab);
    document.body.appendChild(container);

    var messagesEl = document.getElementById('docbot-messages');
    var inputEl = document.getElementById('docbot-input');
    var sendBtn = document.getElementById('docbot-send');
    var closeBtn = document.getElementById('docbot-header-close');

    // Welcome message
    addMessage('assistant', welcome, messagesEl, name);

    fab.addEventListener('click', function() {
      isOpen = !isOpen;
      if (isOpen) {
        panel.style.display = 'flex';
        requestAnimationFrame(function() { panel.className = 'open'; });
        inputEl.focus();
      } else {
        panel.className = '';
        setTimeout(function() { panel.style.display = 'none'; }, 300);
      }
    });
    closeBtn.addEventListener('click', function() {
      isOpen = false;
      panel.className = '';
      setTimeout(function() { panel.style.display = 'none'; }, 300);
    });

    sendBtn.addEventListener('click', function() { sendMessage(messagesEl, inputEl, sendBtn, name); });
    inputEl.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(messagesEl, inputEl, sendBtn, name);
      }
    });
    inputEl.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 80) + 'px';
    });
  }

  var sending = false;

  function sendMessage(messagesEl, inputEl, sendBtn, name) {
    var text = inputEl.value.trim();
    if (!text || sending) return;

    addMessage('user', text, messagesEl, name);
    inputEl.value = '';
    inputEl.style.height = 'auto';
    sending = true;
    sendBtn.disabled = true;

    var typingEl = document.createElement('div');
    typingEl.className = 'docbot-msg assistant';
    typingEl.innerHTML = '<div class="docbot-msg-avatar">' + escapeHtml(getInitials(name)) + '</div><div class="docbot-typing"><span></span><span></span><span></span></div>';
    messagesEl.appendChild(typingEl);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    fetch(config.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        site_id: config.siteId,
        session_id: sessionId,
        visitor_id: visitorId,
        message: text
      })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      messagesEl.removeChild(typingEl);
      if (data.error) {
        addMessage('assistant', 'Sorry, something went wrong. Please try again.', messagesEl, name);
      } else {
        sessionId = data.session_id;
        addMessage('assistant', data.answer, messagesEl, name);
      }
    })
    .catch(function() {
      messagesEl.removeChild(typingEl);
      addMessage('assistant', 'Sorry, I could not connect. Please try again later.', messagesEl, name);
    })
    .finally(function() {
      sending = false;
      sendBtn.disabled = false;
      inputEl.focus();
    });
  }

  function addMessage(role, text, messagesEl, name) {
    var div = document.createElement('div');
    div.className = 'docbot-msg ' + role;
    if (role === 'assistant') {
      div.innerHTML = '<div class="docbot-msg-avatar">' + escapeHtml(getInitials(name || aiName)) + '</div><div class="docbot-msg-bubble">' + escapeHtml(text) + '</div>';
    } else {
      div.innerHTML = '<div class="docbot-msg-bubble">' + escapeHtml(text) + '</div>';
    }
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function getInitials(name) {
    if (!name) return 'AI';
    var parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  function escapeHtml(str) {
    var el = document.createElement('span');
    el.textContent = str;
    return el.innerHTML;
  }

  // Fetch ai_config from site API, then init widget
  var baseUrl = config.apiUrl.replace(/\/api\/widget$/, '');
  fetch(baseUrl + '/api/sites/' + config.siteId + '/ai-config')
    .then(function(res) { return res.ok ? res.json() : null; })
    .then(function(data) {
      if (data) {
        if (data.ai_name) aiName = data.ai_name;
        if (data.welcome_message) welcomeMessage = data.welcome_message;
        if (data.brand_color) primaryColor = data.brand_color;
      }
      initWidget(aiName, welcomeMessage, primaryColor);
    })
    .catch(function() {
      initWidget(aiName, welcomeMessage, primaryColor);
    });
})();
