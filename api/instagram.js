// Instagram Graph API 프록시
// 토큰은 서버 환경변수에만 저장 → 사용자에게 절대 노출 안 됨

export default async function handler(req, res) {
  // CORS 허용 (GitHub Pages 프론트엔드에서 호출 가능하게)
  res.setHeader('Access-Control-Allow-Origin', 'https://longchiri.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { user_id } = req.query;

  // 환경변수에서 토큰 가져오기 (Vercel 대시보드에서 설정)
  const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!ACCESS_TOKEN) {
    return res.status(500).json({ error: 'API 토큰이 설정되지 않았습니다.' });
  }

  try {
    // ① 기본 계정 정보
    const profileRes = await fetch(
      `https://graph.instagram.com/me?fields=id,username,account_type,followers_count,follows_count,media_count,biography,website&access_token=${ACCESS_TOKEN}`
    );
    const profile = await profileRes.json();

    // ② 최근 게시물 (좋아요, 댓글, 저장 수, 도달률 포함)
    const mediaRes = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,like_count,comments_count,timestamp,insights.metric(reach,impressions,saved)&access_token=${ACCESS_TOKEN}`
    );
    const media = await mediaRes.json();

    // ③ 계정 인사이트 (팔로워 증감, 도달률)
    const insightRes = await fetch(
      `https://graph.instagram.com/me/insights?metric=follower_count,reach,impressions,profile_views&period=day&access_token=${ACCESS_TOKEN}`
    );
    const insights = await insightRes.json();

    // 데이터 가공
    const posts = media.data || [];
    const totalLikes = posts.reduce((sum, p) => sum + (p.like_count || 0), 0);
    const totalComments = posts.reduce((sum, p) => sum + (p.comments_count || 0), 0);
    const reelsCount = posts.filter(p => p.media_type === 'VIDEO').length;

    const result = {
      // 기본 정보
      username: profile.username,
      followers: profile.followers_count,
      following: profile.follows_count,
      totalPosts: profile.media_count,
      bio: profile.biography || '',
      hasLink: !!profile.website,

      // 콘텐츠 분석
      avgLikes: posts.length > 0 ? Math.round(totalLikes / posts.length) : 0,
      avgComments: posts.length > 0 ? Math.round(totalComments / posts.length) : 0,
      reelsRatio: posts.length > 0 ? Math.round((reelsCount / posts.length) * 100) : 0,

      // 인사이트 (비즈니스/크리에이터 계정만)
      insights: insights.data || [],

      // 원본 데이터 (추가 분석용)
      recentPosts: posts.slice(0, 12),
    };

    return res.status(200).json(result);

  } catch (error) {
    return res.status(500).json({ error: '데이터를 가져오는 중 오류가 발생했습니다.', detail: error.message });
  }
}
