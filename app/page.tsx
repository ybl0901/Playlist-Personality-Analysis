"use client";

import { useMemo, useState } from "react";

type Track = { name: string; artists: string; album?: string; duration?: number };

type AnalysisResult = {
  total: number;
  artists: number;
  genres: Record<string, number>;
  moods: Record<string, number>;
  languages: Record<string, number>;
  eras: Record<string, number>;
  bpms: Record<string, number>;
  scenes: Record<string, number>;
  topArtists: Array<{ name: string; count: number }>;
  bigFive: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  mbti: { EI: number; SN: number; TF: number; JP: number; type: string };
  archetype: string;
  archetypeDesc: string;
  line: string;
  trait: string;
  energy: number;
  warmth: number;
  taste: number;
  labels: string[];
  xhsTitle: string;
  xhsBody: string;
  xhsTags: string[];
  journey: Array<{
    label: string;
    timeRange: string;
    genre: string;
    mood: string;
    topArtists: string[];
    representativeTrack: string;
    description: string;
    trackCount: number;
  }>;
  journeySummary: string;
  aiStory?: string;
  aiDeepDive?: string;
  aiEnabled?: boolean;
};

const examples = `周杰伦 - 晴天
告五人 - 披星戴月的想你
Taylor Swift - cardigan
林宥嘉 - 成全
Frank Ocean - Pink + White`;

function linkInfo(value: string) {
  const url = value.match(/https?:\/\/[^\s]+/i)?.[0];
  if (!url) return null;
  const lower = url.toLowerCase();
  const platform = lower.includes("spotify")
    ? "Spotify"
    : lower.includes("music.apple")
    ? "Apple Music"
    : lower.includes("music.163") || lower.includes("netease")
    ? "网易云音乐"
    : lower.includes("y.qq") || lower.includes("qq.com")
    ? "QQ 音乐"
    : lower.includes("kugou")
    ? "酷狗音乐"
    : "音乐平台";
  return { url, platform };
}

function pct(obj: Record<string, number>, key: string, total: number) {
  return Math.round(((obj[key] ?? 0) / total) * 100);
}

function radarPoints(values: number[], radius = 86, center = 100) {
  return values
    .map((value, index) => {
      const angle = -Math.PI / 2 + (index * Math.PI * 2) / values.length;
      const distance = (Math.max(0, Math.min(100, value)) / 100) * radius;
      return `${center + Math.cos(angle) * distance},${center + Math.sin(angle) * distance}`;
    })
    .join(" ");
}

function journeyInsight(
  stage: AnalysisResult["journey"][number],
  index: number,
  total: number
) {
  const position = index === 0 ? "起点" : index === total - 1 ? "此刻" : "转折";
  return `${position}：从「${stage.genre}」的声音密度里，${stage.mood}成为了这一阶段最明显的情绪线索。`;
}

function avatarVariant(result: AnalysisResult) {
  const seed = result.archetype.length + result.topArtists.length + result.total;
  return seed % 4;
}

function makeFullProfile(result: AnalysisResult) {
  const topGenre = Object.entries(result.genres).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "流行";
  const topMood = Object.entries(result.moods).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "中性/复杂";
  const relationship = result.bigFive.agreeableness >= 58
    ? "先照顾对方，再慢慢说出自己。你需要的是有回应的关系，不是单方面的热闹。"
    : result.bigFive.neuroticism >= 58
    ? "靠近之前会先观察很久。你不是冷淡，而是要确认这段关系值得交出情绪。"
    : "喜欢有边界的亲密：可以一起沉默，也可以各自保留一间不被打扰的房间。";
  const clothing = topGenre === "电子" || topGenre === "摇滚"
    ? "黑色、金属感和一点不合群的亮色。你穿衣服不是为了融入，是为了给自己留一个出口。"
    : topGenre === "民谣" || topGenre === "古典"
    ? "低饱和、舒服、有质地。比起追赶流行，你更在意一件衣服能不能陪你久一点。"
    : "基础色打底，再用一个小细节表达今天的心情。看似克制，实际上每一处都经过选择。";
  const refill = result.energy >= 65
    ? `你靠行动回血：走出去、换个场景、让${topMood}的情绪有出口。`
    : `你靠独处回血：戴上耳机，把外界音量调低，允许自己沉进${topMood}里。`;
  return { topGenre, relationship, clothing, refill };
}

export default function Home() {
  const [playlist, setPlaylist] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [xhsCopied, setXhsCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState("");
  const [importedTitle, setImportedTitle] = useState("");
  const [importNotice, setImportNotice] = useState("");
  const [importError, setImportError] = useState("");
  const [importedTracks, setImportedTracks] = useState<Track[]>([]);

  const count = useMemo(
    () => playlist.split("\n").filter(Boolean).length,
    [playlist]
  );
  const source = useMemo(() => linkInfo(playlist), [playlist]);

  async function importPlaylist(): Promise<Track[] | null> {
    if (!source?.url) return null;
    setLoadingStage("正在读取歌单…");
    setImportError("");
    try {
      const response = await fetch(
        `/api/playlist?url=${encodeURIComponent(source.url)}`
      );
      const data = (await response.json()) as {
        title?: string;
        tracks?: Track[];
        error?: string;
        notice?: string;
      };
      if (!response.ok || !data.tracks?.length)
        throw new Error(data.error || "读取失败");
      setImportedTitle(data.title || "歌单");
      setImportNotice(data.notice || "");
      setImportedTracks(data.tracks);
      const text = data.tracks
        .map((t) => `${t.artists} - ${t.name}`)
        .join("\n");
      setPlaylist(text);
      return data.tracks;
    } catch (error) {
      setImportError(
        error instanceof Error ? error.message : "暂时无法读取这份歌单。"
      );
      return null;
    }
  }

  async function analyse() {
    if (!playlist.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      let tracks: Track[] = importedTracks;

      // 如果是歌单链接且还没导入，先导入
      if (source?.platform && count <= 2 && importedTracks.length === 0) {
        const imported = await importPlaylist();
        if (!imported) {
          setLoading(false);
          return;
        }
        tracks = imported;
      }

      // 如果没有导入的tracks，从文本解析
      if (!tracks || tracks.length === 0) {
        setLoadingStage("正在解析歌曲…");
        tracks = playlist
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => {
            // 支持 "歌手 - 歌名" 和 "歌名 - 歌手"
            const parts = line.split(/\s+-\s+|\t/);
            if (parts.length >= 2) {
              return { name: parts[1].trim(), artists: parts[0].trim() };
            }
            return { name: line, artists: "未知歌手" };
          });
      }

      setLoadingStage("正在分析音乐人格…");
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tracks }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "分析失败");
      }

      const data = (await response.json()) as AnalysisResult;
      setResult(data);
      setUnlocked(false);
      setTimeout(
        () =>
          document
            .getElementById("report")
            ?.scrollIntoView({ behavior: "smooth", block: "start" }),
        100
      );
    } catch (error) {
      setImportError(
        error instanceof Error ? error.message : "分析失败，请重试。"
      );
    } finally {
      setLoading(false);
      setLoadingStage("");
    }
  }

  async function share() {
    if (!result) return;
    const message = `我在「听见你」测出了：${result.archetype}（MBTI: ${result.mbti.type}）。${result.line}`;
    await navigator.clipboard?.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  async function copyXiaohongshu() {
    if (!result) return;
    await navigator.clipboard?.writeText(result.xhsBody);
    setXhsCopied(true);
    setTimeout(() => setXhsCopied(false), 1800);
  }

  const bigFiveLabels: Array<{
    key: keyof AnalysisResult["bigFive"];
    label: string;
    left: string;
    right: string;
  }> = [
    { key: "openness", label: "开放性", left: "保守", right: "开放" },
    { key: "conscientiousness", label: "尽责性", left: "随性", right: "自律" },
    { key: "extraversion", label: "外向性", left: "内向", right: "外向" },
    { key: "agreeableness", label: "宜人性", left: "理性", right: "共情" },
    { key: "neuroticism", label: "情绪性", left: "稳定", right: "敏感" },
  ];

  return (
    <main>
      <section className="hero">
        <nav>
          <a className="brand" href="#top">
            听见你<span>· playlist</span>
          </a>
          <a href="#how">它怎么读懂你？</a>
        </nav>
        <div className="halo halo-one" />
        <div className="halo halo-two" />
        <div className="hero-copy" id="top">
          <p className="eyebrow">PLAYLIST PERSONALITY READING</p>
          <h1>
            你的歌单，
            <br />
            <em>比自我介绍诚实。</em>
          </h1>
          <p className="intro">
            把常听的歌丢进来。我们从你的旋律偏好、情绪浓度和审美轨迹里，读出那个没写在简介里的你。结合大五人格与
            MBTI，给你一份真正的音乐人格档案。
          </p>
          <a className="primary" href="#reader">
            开始读取我的歌单 <span>↓</span>
          </a>
          <p className="note">不需要登录 · 不保存你的歌单 · 约 30 秒</p>
        </div>
        <div className="hero-card card-tilt">
          <div className="vinyl">
            <i />
          </div>
          <p>NOW READING</p>
          <strong>
            那些你
            <br />
            反复播放的歌
          </strong>
          <small>并不是随机出现的。</small>
        </div>
      </section>

      <section className="reader" id="reader">
        <div className="section-kicker">01 / INPUT</div>
        <h2>
          给我一小段你的
          <br />
          <em>音乐痕迹</em>
        </h2>
        <div className="input-panel">
          <label htmlFor="playlist">
            粘贴网易云/QQ音乐歌单链接，或每行输入一首「歌手 - 歌名」
          </label>
          <textarea
            id="playlist"
            value={playlist}
            onChange={(e) => {
              setPlaylist(e.target.value);
              setImportedTracks([]);
              setImportedTitle("");
            }}
            placeholder={`例如：https://music.163.com/playlist?id=806898079\n\n也可以直接这样输入：\n${examples}`}
          />
          <div className="input-bottom">
            <button
              className="sample"
              onClick={() => {
                setPlaylist(examples);
                setImportedTitle("");
                setImportedTracks([]);
              }}
            >
              填入示例歌单
            </button>
            {source ? (
              <a
                className="source-link"
                href={source.url}
                target="_blank"
                rel="noreferrer"
              >
                已识别：{source.platform}，打开原歌单 ↗
              </a>
            ) : (
              <span>{count ? `${count} 首已捕捉` : "链接或至少 3 首歌，结果更准"}</span>
            )}
            <button
              className="analyse"
              onClick={analyse}
              disabled={!playlist.trim() || loading}
            >
              {loading
                ? loadingStage || "分析中…"
                : source?.platform && count <= 2
                ? `读取${source.platform}歌单`
                : "读取我的气质"}{" "}
              <b>→</b>
            </button>
          </div>
          {importedTitle && (
            <p className="import-success">
              已读取「{importedTitle}」全部 {count} 首歌曲
            </p>
          )}
          {importNotice && <p className="link-note">{importNotice}</p>}
          {source && !importedTitle && (
            <p className="link-note">
              网易云/QQ音乐公开歌单可直接读取；其他平台请直接粘贴歌名。
            </p>
          )}
          {importError && <p className="import-error">{importError}</p>}
        </div>
      </section>

      {loading && (
        <section className="loading-section">
          <div className="loading-vinyl">
            <i />
          </div>
          <p>{loadingStage || "正在分析…"}</p>
        </section>
      )}

      {result && (
        <section className="report-wrap" id="report">
          <div className="report-top">
            <p className="section-kicker">02 / YOUR REPORT</p>
            <button onClick={share} className="share">
              {copied ? "已复制分享文案" : "分享这份报告 ↗"}
            </button>
          </div>

          <article className="report">
            <div className="report-mark">
              T
              <br />J
            </div>
            <p className="report-label">
              {source
                ? `来自你的 ${source.platform} 歌单 · 音乐人格是`
                : "你的音乐人格是"}
            </p>
            <h2>{result.archetype}</h2>
            <p className="quote">“ {result.line} ”</p>
            <p className="archetype-desc">{result.archetypeDesc}</p>

            {/* 数据概览 */}
            <div className="stat-row">
              <div>
                <b>{result.total}</b>
                <span>首歌曲</span>
              </div>
              <div>
                <b>{result.artists}</b>
                <span>位歌手</span>
              </div>
              <div>
                <b>{result.mbti.type}</b>
                <span>MBTI倾向</span>
              </div>
            </div>

            <div className="visual-grid">
              <div className="visual-card radar-card">
                <div className="visual-heading">
                  <div>
                    <span className="visual-kicker">OCEAN PROFILE</span>
                    <h3>你的性格坐标</h3>
                  </div>
                  <span className="visual-badge">五维</span>
                </div>
                <div className="radar-layout">
                  <svg className="radar-chart" viewBox="0 0 200 200" role="img" aria-label="大五人格雷达图">
                    {[34, 58, 86].map((r) => (
                      <polygon key={r} points={radarPoints([100, 100, 100, 100, 100], r)} className="radar-grid" />
                    ))}
                    {[0, 1, 2, 3, 4].map((i) => {
                      const angle = -Math.PI / 2 + (i * Math.PI * 2) / 5;
                      return <line key={i} x1="100" y1="100" x2={100 + Math.cos(angle) * 86} y2={100 + Math.sin(angle) * 86} className="radar-axis" />;
                    })}
                    <polygon points={radarPoints(Object.values(result.bigFive))} className="radar-fill" />
                    <polygon points={radarPoints(Object.values(result.bigFive))} className="radar-line" />
                  </svg>
                  <div className="radar-legend">
                    {bigFiveLabels.map((item) => (
                      <div key={item.key}><i /> <span>{item.label}</span><b>{result.bigFive[item.key]}</b></div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="visual-card orbit-card">
                <div className="visual-heading">
                  <div>
                    <span className="visual-kicker">LISTENING DNA</span>
                    <h3>你的听歌引力</h3>
                  </div>
                  <span className="orbit-center">{result.mbti.type}</span>
                </div>
                <div className="orbit-visual">
                  {Object.entries(result.moods).slice(0, 5).map(([mood, value], i) => (
                    <span key={mood} className={`orbit-dot orbit-dot-${i}`} style={{ ["--orbit-size" as string]: `${Math.max(18, 22 + pct(result.moods, mood, result.total) / 2)}px` }}>
                      {mood}
                    </span>
                  ))}
                  <div className="orbit-ring orbit-ring-one" /><div className="orbit-ring orbit-ring-two" />
                  <strong>{result.energy}</strong><small>能量指数</small>
                </div>
                <p className="visual-caption">你的歌单不是一条直线，更像几股情绪相互拉扯后形成的轨道。</p>
              </div>
            </div>

            {/* 大五人格 */}
            <div className="block">
              <div className="block-title"><h3>大五人格画像</h3><span>偏好不是定论，是你反复选择的方向</span></div>
              <div className="bars colorful-bars">
                {bigFiveLabels.map((item, i) => (
                  <div key={item.key}>
                    <span>
                      {item.label}{" "}
                      <em>
                        {result.bigFive[item.key] > 50 ? item.right : item.left}
                      </em>
                    </span>
                    <b>
                      <i
                        className={`bar-color-${i}`}
                        style={{ width: `${result.bigFive[item.key]}%` }}
                      />
                    </b>
                    <em>{result.bigFive[item.key]}</em>
                  </div>
                ))}
              </div>
            </div>

            {/* 风格分布 */}
            <div className="block">
              <div className="block-title"><h3>音乐风格分布</h3><span>你把时间交给了哪些声音</span></div>
              <div className="genre-cloud">
                {Object.entries(result.genres)
                  .slice(0, 6)
                  .map(([genre, num], i) => (
                    <div key={genre} className={`genre-pill genre-pill-${i}`} style={{ flexGrow: Math.max(1, num) }}>
                      <span>{genre}</span><b>{pct(result.genres, genre, result.total)}%</b>
                    </div>
                  ))}
              </div>
            </div>

            {/* 情绪分布 */}
            <div className="block">
              <h3>情绪色彩</h3>
              <div className="mood-grid">
                {Object.entries(result.moods)
                  .slice(0, 6)
                  .map(([mood, num], i) => (
                    <span key={mood} className={`mood-tag mood-color-${i}`}>
                      {mood} {pct(result.moods, mood, result.total)}%
                    </span>
                  ))}
              </div>
            </div>

            {/* 高频歌手 */}
            <div className="block">
              <h3>你最常听的歌手 TOP5</h3>
              <div className="bars colorful-bars">
                {result.topArtists.slice(0, 5).map((a, i) => (
                  <div key={a.name}>
                    <span>
                      {i + 1}. {a.name}
                    </span>
                    <b>
                      <i
                        className={`bar-color-${i + 2}`}
                        style={{
                          width: `${(a.count / result.topArtists[0].count) * 100}%`,
                        }}
                      />
                    </b>
                    <em>{a.count}首</em>
                  </div>
                ))}
              </div>
            </div>

            {/* 心路历程 */}
            <div className="block journey-block">
              <div className="block-title"><h3>你的音乐心路历程</h3><span>按歌单添加顺序，回看审美如何移动</span></div>
              <p className="journey-summary">{result.journeySummary}</p>
              <div className="journey-timeline">
                {result.journey.map((stage, i) => (
                  <div key={i} className="journey-stage">
                    <div className="journey-index">0{i + 1}</div>
                    <div className="journey-dot" />
                    <div className="journey-content">
                      <div className="journey-label">
                        {stage.label}
                        {stage.timeRange && (
                          <span className="journey-time">{stage.timeRange}</span>
                        )}
                      </div>
                      <div className="journey-tags">
                        <span className="journey-genre">{stage.genre}</span>
                        <span className="journey-mood">{stage.mood}</span>
                        <span className="journey-count">{stage.trackCount}首</span>
                      </div>
                      <p className="journey-insight">{journeyInsight(stage, i, result.journey.length)}</p>
                      <p className="journey-desc">{stage.description}</p>
                      <p className="journey-track">♪ {stage.representativeTrack}</p>
                      {stage.topArtists.length > 0 && (
                        <p className="journey-artists">常听：{stage.topArtists.join("、")}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`music-avatar music-avatar-${avatarVariant(result)}`}>
              <div className="avatar-copy">
                <span className="visual-kicker">YOUR MUSIC PERSONA</span>
                <h3>这是你的音乐形象</h3>
                <p>同一个人格大类，也会因为歌手、情绪和年代的组合不同，长成完全不同的你。</p>
                <div className="avatar-tags"><span>{result.archetype}</span><span>{result.mbti.type}</span><span>{result.labels[0] ?? "独立审美"}</span></div>
              </div>
              <div className="avatar-stage" aria-label={`音乐人格形象：${result.archetype}`}>
                <div className="avatar-shadow" />
                <div className="avatar-halo" />
                <div className="avatar-figure"><div className="avatar-ear ear-left" /><div className="avatar-ear ear-right" /><div className="avatar-head"><i className="avatar-hair" /><i className="avatar-eye eye-left" /><i className="avatar-eye eye-right" /><i className="avatar-mouth" /></div><div className="avatar-body"><i className="avatar-scarf" /><i className="avatar-badge">♪</i></div><div className="avatar-leg leg-left" /><div className="avatar-leg leg-right" /></div>
                <div className="avatar-note note-one">♪</div><div className="avatar-note note-two">♫</div>
              </div>
            </div>

            <div className="tags">
              {result.labels.map((x) => (
                <span key={x}>#{x}</span>
              ))}
            </div>
            <p className="trait">
              你的底层气质：<strong>{result.trait}</strong>
            </p>

            {result.aiEnabled && result.aiStory && (
              <div className="ai-story">
                <h3>你的音乐故事</h3>
                <p>{result.aiStory}</p>
                {result.aiDeepDive && (
                  <>
                    <h3>深度解读</h3>
                    <p>{result.aiDeepDive}</p>
                  </>
                )}
              </div>
            )}

            {source && (
              <a
                className="report-source"
                href={source.url}
                target="_blank"
                rel="noreferrer"
              >
                回到原歌单继续听 ↗
              </a>
            )}
          </article>

          <aside className="xhs-share">
            <div>
              <span>小红书发布包</span>
              <p>截下上面的报告图，再复制这一段文案。</p>
            </div>
            <button onClick={copyXiaohongshu}>
              {xhsCopied ? "已复制，可去发布" : "复制小红书文案"} <b>↗</b>
            </button>
          </aside>

          {(() => {
            const profile = makeFullProfile(result);
            return (
              <section className="full-profile">
                <div className="full-profile-head"><span className="visual-kicker">OPEN PROFILE · FREE</span><h3>你的完整人格档案</h3><p>这个版本完全免费开放。它不把你塞进一个标签，而是把歌单里反复出现的倾向，翻译成生活里的样子。</p></div>
                <div className="profile-grid">
                  <article><span>关系模式</span><h4>你如何靠近别人</h4><p>{profile.relationship}</p></article>
                  <article><span>穿衣风格</span><h4>你如何把审美穿在身上</h4><p>{profile.clothing}</p></article>
                  <article><span>能量补给</span><h4>你如何把自己捡回来</h4><p>{profile.refill}</p></article>
                  <article><span>隐藏关键词</span><h4>{profile.topGenre} × {result.mbti.type}</h4><p>你最特别的地方，不在单一曲风，而在这些看似不相关的选择被你放进了同一个歌单。</p></article>
                </div>
              </section>
            );
          })()}

          <p className="disclaimer">
            结果用于娱乐与自我探索，不构成心理评估。
          </p>
        </section>
      )}

      <section className="how" id="how">
        <p className="section-kicker">WHY IT WORKS</p>
        <h2>
          不是算命。
          <br />
          是你的选择一直在说话。
        </h2>
        <div className="steps">
          <p>
            <b>01</b>
            曲风偏好
            <br />
            <span>你主动靠近的情绪与能量</span>
          </p>
          <p>
            <b>02</b>
            重复出现
            <br />
            <span>你长期不愿意放下的东西</span>
          </p>
          <p>
            <b>03</b>
            风格组合
            <br />
            <span>只属于你的审美坐标</span>
          </p>
        </div>
      </section>
      <footer>
        <span>听见你 · 2026</span>
        <span>结果用于娱乐与自我探索，不构成心理评估。</span>
      </footer>
    </main>
  );
}
