export async function onRequest(context) {
  const params = new URLSearchParams({
    client_id: context.env.GITHUB_CLIENT_ID,
    redirect_uri: `${new URL(context.request.url).origin}/api/callback`,
    scope: 'repo',
  });
  return Response.redirect(`https://github.com/login/oauth/authorize?${params}`);
}
