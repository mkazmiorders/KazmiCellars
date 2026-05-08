export async function onRequest(context) {
  const { searchParams } = new URL(context.request.url);
  const code = searchParams.get('code');

  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      client_id: context.env.GITHUB_CLIENT_ID,
      client_secret: context.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const data = await response.json();
  const token = data.access_token;
  const payload = JSON.stringify({ token, provider: 'github' });

  const html = `<!doctype html>
<html>
<body style="font-family: sans-serif; padding: 20px;">
<h2>Auth Status</h2>
<div id="status">Loading...</div>
<script>
(() => {
  const s = document.getElementById('status');
  if (!window.opener) { s.innerText = 'ERROR: No opener window'; return; }
  s.innerText = 'Step 1: Sending authorizing:github to opener...';
  window.addEventListener('message', (e) => {
    s.innerText += '\\nStep 2: Received from ' + e.origin + ': ' + e.data;
    if (e.data === 'authorizing:github') {
      window.opener.postMessage('authorization:github:success:${payload}', e.origin);
      s.innerText += '\\nStep 3: Token sent to ' + e.origin;
    }
  });
  window.opener.postMessage('authorizing:github', '*');
})();
<\/script>
</body>
</html>`;

  return new Response(html, { headers: { 'Content-Type': 'text/html' } });
}
