// Instagram OAuth 처리
// 사용자가 "Instagram으로 로그인" 버튼 누르면 여기로 연결됨

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://longchiri.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { code } = req.query;

  const APP_ID = process.env.META_APP_ID;
  const APP_SECRET = process.env.META_APP_SECRET;
  const REDIRECT_URI = process.env.REDIRECT_URI;

  if (!code) {
    // 로그인 URL로 리다이렉트
    const loginUrl = `https://api.instagram.com/oauth/authorize?client_id=${APP_ID}&redirect_uri=${REDIRECT_URI}&scope=user_profile,user_media,instagram_basic,instagram_manage_insights&response_type=code`;
    return res.redirect(loginUrl);
  }

  try {
    // 인증 코드 → 액세스 토큰 교환
    const tokenRes = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      body: new URLSearchParams({
        client_id: APP_ID,
        client_secret: APP_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
        code,
      }),
    });
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      return res.status(400).json({ error: '로그인 실패', detail: tokenData.error });
    }

    // 단기 토큰 → 장기 토큰으로 교환 (60일 유효)
    const longTokenRes = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${APP_SECRET}&access_token=${tokenData.access_token}`
    );
    const longToken = await longTokenRes.json();

    // 프론트엔드로 토큰 전달 (세션 방식)
    return res.status(200).json({
      access_token: longToken.access_token,
      token_type: longToken.token_type,
      expires_in: longToken.expires_in,
    });

  } catch (error) {
    return res.status(500).json({ error: '인증 처리 중 오류 발생', detail: error.message });
  }
}
