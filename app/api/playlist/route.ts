import { NextResponse } from "next/server";

type Track = {
  name: string;
  artists: string;
  album?: string;
  duration?: number;
  addedAt?: number; // 添加时间戳（毫秒）
};

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  Referer: "https://music.163.com/",
  "Accept": "application/json, text/plain, */*",
};

// 单次批量获取歌曲详情的最大数量（接口实测上限约200）
const BATCH_SIZE = 200;
// 并发请求数
const CONCURRENCY = 5;

function isNeteaseHost(hostname: string) {
  return hostname === "music.163.com" || hostname.endsWith(".music.163.com");
}

function isQQMusicHost(hostname: string) {
  return hostname === "y.qq.com" || hostname.endsWith(".qq.com");
}

function isKugouHost(hostname: string) {
  return hostname === "www.kugou.com" || hostname.endsWith(".kugou.com");
}

function playlistIdFrom(url: URL) {
  const directId = url.searchParams.get("id");
  if (directId) return directId;
  // 网易云桌面端分享链接常把参数放在 #/playlist?id=... 里。
  return url.hash.match(/[?&]id=(\d{3,30})(?:[&#]|$)/)?.[1] ?? null;
}

function qqPlaylistIdFrom(url: URL) {
  // https://y.qq.com/n/ryqq/playlist/806898079
  const match = url.pathname.match(/playlist\/(\d+)/);
  if (match) return match[1];
  const directId = url.searchParams.get("id");
  if (directId) return directId;
  return null;
}

function normalizeNeteaseTracks(
  songs: Array<{
    id?: number;
    name?: string;
    artists?: Array<{ name?: string }>;
    album?: { name?: string };
    duration?: number;
  }> = [],
  addedAtMap?: Map<number, number>
): Track[] {
  return songs
    .map((track) => ({
      name: track.name?.trim() ?? "",
      artists: (track.artists ?? [])
        .map((artist) => artist.name?.trim())
        .filter(Boolean)
        .join(" / "),
      album: track.album?.name?.trim() ?? "",
      duration: track.duration ? Math.round(track.duration / 1000) : 0,
      addedAt: track.id ? addedAtMap?.get(track.id) : undefined,
    }))
    .filter((track) => track.name);
}

/**
 * 使用 v6 接口获取歌单信息和全部 trackIds，然后分批获取歌曲详情。
 * 这是当前最可靠的网易云公开歌单读取方式。
 */
async function fetchNeteasePlaylist(
  id: string
): Promise<{ title: string; tracks: Track[]; total: number }> {
  // 第一步：获取歌单信息和全部 trackIds
  const detailUrl = `https://music.163.com/api/v6/playlist/detail?id=${id}`;
  const detailRes = await fetch(detailUrl, {
    headers: HEADERS,
    signal: AbortSignal.timeout(10000),
  });
  if (!detailRes.ok) {
    throw new Error(`网易云歌单接口返回 ${detailRes.status}`);
  }
  const detailJson = (await detailRes.json()) as {
    playlist?: {
      name?: string;
      trackCount?: number;
      trackIds?: Array<{ id: number }>;
      tracks?: Array<Record<string, unknown>>;
    };
  };
  const playlist = detailJson.playlist;
  if (!playlist) {
    throw new Error("未找到歌单信息");
  }
  const title = playlist.name?.trim() || "网易云歌单";
  const totalTracks = playlist.trackCount ?? 0;

  // v6 接口返回的 tracks 通常只有前 6 首，需要用 trackIds 批量获取
  // 同时保留 at（添加时间戳）
  const trackIdList: Array<{ id: number; at: number }> = (playlist.trackIds ?? [])
    .map((t) => ({ id: t.id, at: t.at ?? 0 }));

  let trackIds: number[] = trackIdList.map((t) => t.id);

  // 如果 trackIds 为空，尝试从 tracks 中提取
  if (trackIds.length === 0 && playlist.tracks?.length) {
    const extracted = playlist.tracks
      .map((t) => {
        const item = t as { id?: number; at?: number };
        return item.id ? { id: item.id, at: item.at ?? 0 } : null;
      })
      .filter((x): x is { id: number; at: number } => x !== null);
    trackIdList.push(...extracted);
    trackIds = extracted.map((t) => t.id);
  }

  if (trackIds.length === 0) {
    throw new Error("歌单中没有歌曲");
  }

  // 构建 id → 添加时间戳 映射
  const addedAtMap = new Map<number, number>();
  trackIdList.forEach((t) => addedAtMap.set(t.id, t.at));

  // 分批并发获取全部歌曲详情
  const allTracks: Track[] = [];
  const batches: number[][] = [];
  for (let i = 0; i < trackIds.length; i += BATCH_SIZE) {
    batches.push(trackIds.slice(i, i + BATCH_SIZE));
  }

  // 并发执行，每批 CONCURRENCY 个请求
  for (let i = 0; i < batches.length; i += CONCURRENCY) {
    const chunk = batches.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      chunk.map(async (batch) => {
        const idsParam = encodeURIComponent(JSON.stringify(batch));
        try {
          const songRes = await fetch(
            `https://music.163.com/api/song/detail?ids=${idsParam}`,
            {
              headers: HEADERS,
              signal: AbortSignal.timeout(15000),
            }
          );
          if (songRes.ok) {
            const songJson = (await songRes.json()) as {
              songs?: Array<{
                name?: string;
                artists?: Array<{ name?: string }>;
                album?: { name?: string };
                duration?: number;
              }>;
            };
            return normalizeNeteaseTracks(songJson.songs, addedAtMap);
          }
        } catch {
          console.warn(`批次获取失败`);
        }
        return [];
      })
    );
    results.forEach((tracks) => allTracks.push(...tracks));
  }

  if (allTracks.length === 0) {
    throw new Error("未能获取到歌曲详情");
  }

  return { title, tracks: allTracks, total: totalTracks };
}

/**
 * 降级方案：从公开网页提取可见歌曲。
 */
async function readVisibleTracks(
  id: string
): Promise<{ title: string; tracks: Track[] } | null> {
  const page = await fetch(`https://music.163.com/playlist?id=${id}`, {
    headers: HEADERS,
    signal: AbortSignal.timeout(8000),
  });
  if (!page.ok) return null;
  const html = await page.text();

  // 尝试从页面内嵌的 JSON 数据中提取
  const jsonMatch = html.match(
    /window\.__INITIAL_STATE__\s*=\s*({[\s\S]*?});/
  );
  if (jsonMatch) {
    try {
      const state = JSON.parse(jsonMatch[1]);
      const tracks = state?.playlist?.tracks ?? [];
      if (Array.isArray(tracks) && tracks.length > 0) {
        const title =
          state?.playlist?.name ??
          html.match(/<title>(.*?) - 歌单 - 网易云音乐<\/title>/)?.[1] ??
          "网易云歌单";
        return {
          title,
          tracks: normalizeNeteaseTracks(tracks).slice(0, 100),
        };
      }
    } catch {
      // JSON 解析失败，继续尝试正则
    }
  }

  // 正则提取歌曲链接
  const ids = [...html.matchAll(/\/song\?id=(\d+)/g)]
    .map((match) => match[1])
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 20);
  if (!ids.length) return null;

  const songs = await fetch(
    `https://music.163.com/api/song/detail?ids=${encodeURIComponent(
      JSON.stringify(ids.map(Number))
    )}`,
    { headers: HEADERS, signal: AbortSignal.timeout(8000) }
  );
  if (!songs.ok) return null;
  const data = (await songs.json()) as {
    songs?: Array<{
      name?: string;
      artists?: Array<{ name?: string }>;
      album?: { name?: string };
      duration?: number;
    }>;
  };
  const tracks = normalizeNeteaseTracks(data.songs);
  const title =
    html.match(/<title>(.*?) - 歌单 - 网易云音乐<\/title>/)?.[1] ??
    "网易云歌单";
  return tracks.length ? { title, tracks } : null;
}

export async function GET(request: Request) {
  const requestedUrl = new URL(request.url).searchParams.get("url");
  if (!requestedUrl) {
    return NextResponse.json({ error: "缺少歌单链接。" }, { status: 400 });
  }

  let playlistUrl: URL;
  try {
    playlistUrl = new URL(requestedUrl);
  } catch {
    return NextResponse.json(
      { error: "这不是有效的歌单链接。" },
      { status: 400 }
    );
  }

  // 网易云音乐
  if (isNeteaseHost(playlistUrl.hostname)) {
    const id = playlistIdFrom(playlistUrl);
    if (!id || !/^\d{3,30}$/.test(id)) {
      return NextResponse.json(
        { error: "未能从链接中识别网易云歌单 ID。" },
        { status: 400 }
      );
    }

    try {
      const result = await fetchNeteasePlaylist(id);
      return NextResponse.json({
        platform: "网易云音乐",
        title: result.title,
        tracks: result.tracks,
        total: result.total,
        fetched: result.tracks.length,
      });
    } catch (error) {
      // 主接口失败，尝试降级读取公开网页
      try {
        const fallback = await readVisibleTracks(id);
        if (fallback) {
          return NextResponse.json({
            platform: "网易云音乐",
            title: fallback.title,
            tracks: fallback.tracks,
            total: fallback.tracks.length,
            fetched: fallback.tracks.length,
            notice:
              "网易云限制了完整曲目读取，已使用当前公开可见的歌曲生成报告。",
          });
        }
      } catch {
        // 降级也失败
      }
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? `读取失败：${error.message}。请稍后重试，或直接粘贴歌名。`
              : "暂时无法读取这份公开歌单，请稍后重试或直接粘贴歌名。",
        },
        { status: 502 }
      );
    }
  }

  // QQ音乐
  if (isQQMusicHost(playlistUrl.hostname)) {
    const id = qqPlaylistIdFrom(playlistUrl);
    if (!id) {
      return NextResponse.json(
        { error: "未能从链接中识别 QQ 音乐歌单 ID。" },
        { status: 400 }
      );
    }
    // QQ音乐需要特殊的请求头和参数
    try {
      const qqRes = await fetch(
        `https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg?type=1&json=1&utf8=1&onlysong=0&new_format=1&disstid=${id}&format=json`,
        {
          headers: {
            "User-Agent": HEADERS["User-Agent"],
            Referer: "https://y.qq.com/",
          },
          signal: AbortSignal.timeout(10000),
        }
      );
      if (qqRes.ok) {
        const qqJson = (await qqRes.json()) as {
          cdlist?: Array<{
            dissname?: string;
            songlist?: Array<{
              songname?: string;
              singer?: Array<{ name?: string }>;
              albumname?: string;
              interval?: number;
            }>;
          }>;
        };
        const cd = qqJson.cdlist?.[0];
        if (cd?.songlist?.length) {
          const tracks: Track[] = cd.songlist
            .map((s) => ({
              name: s.songname?.trim() ?? "",
              artists: (s.singer ?? [])
                .map((a) => a.name?.trim())
                .filter(Boolean)
                .join(" / "),
              album: s.albumname?.trim() ?? "",
              duration: s.interval ?? 0,
            }))
            .filter((t) => t.name);
          return NextResponse.json({
            platform: "QQ音乐",
            title: cd.dissname?.trim() || "QQ音乐歌单",
            tracks,
            total: cd.songlist.length,
            fetched: tracks.length,
          });
        }
      }
    } catch {
      // QQ音乐接口失败，返回提示
    }
    return NextResponse.json(
      {
        error:
          "QQ音乐歌单暂时无法自动读取，请在QQ音乐中全选歌曲复制后粘贴到输入框。",
      },
      { status: 502 }
    );
  }

  // 酷狗音乐
  if (isKugouHost(playlistUrl.hostname)) {
    return NextResponse.json(
      {
        error:
          "酷狗音乐歌单暂时无法自动读取，请在酷狗音乐中全选歌曲复制后粘贴到输入框。",
      },
      { status: 502 }
    );
  }

  return NextResponse.json(
    {
      error:
        "当前支持网易云音乐、QQ音乐歌单链接。其他平台请直接粘贴歌名（每行一首：歌手 - 歌名）。",
    },
    { status: 400 }
  );
}
