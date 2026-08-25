// 音乐分析引擎：歌曲标注 + 统计 + 大五人格/MBTI + 音乐人格匹配

export type TrackInput = {
  name: string;
  artists: string;
  album?: string;
  duration?: number;
  addedAt?: number;
};

export type AnnotatedTrack = TrackInput & {
  genre: string;
  mood: string;
  language: string;
  era: string;
  bpm: string;
  scene: string;
};

export type AnalysisResult = {
  total: number;
  artists: number;
  genres: Record<string, number>;
  moods: Record<string, number>;
  languages: Record<string, number>;
  eras: Record<string, number>;
  bpms: Record<string, number>;
  scenes: Record<string, number>;
  topArtists: Array<{ name: string; count: number }>;
  // 大五人格 OCEAN (0-100)
  bigFive: {
    openness: number;      // 开放性
    conscientiousness: number; // 尽责性
    extraversion: number;  // 外向性
    agreeableness: number; // 宜人性
    neuroticism: number;   // 神经质
  };
  // MBTI 四维度倾向 (0-100, 偏向第二个字母)
  mbti: {
    EI: number; // E-I, >50偏I
    SN: number; // S-N, >50偏N
    TF: number; // T-F, >50偏F
    JP: number; // J-P, >50偏P
    type: string;
  };
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
  journey: JourneyStage[];
  journeySummary: string;
  aiStory?: string;
  aiDeepDive?: string;
  aiEnabled?: boolean;
};

export type JourneyStage = {
  label: string;
  timeRange: string;
  genre: string;
  mood: string;
  topArtists: string[];
  representativeTrack: string;
  description: string;
  trackCount: number;
};

// ============ 歌手风格库 ============
const ARTIST_GENRE: Record<string, string> = {
  // 嘻哈/说唱
  "王以太": "嘻哈/说唱", "艾热": "嘻哈/说唱", "艾志恒Asen": "嘻哈/说唱", "Asen": "嘻哈/说唱",
  "杨和苏": "嘻哈/说唱", "功夫胖": "嘻哈/说唱", "Melo": "嘻哈/说唱", "谢帝": "嘻哈/说唱",
  "GAI": "嘻哈/说唱", "Jony J": "嘻哈/说唱", "Tizzy T": "嘻哈/说唱", "满舒克": "嘻哈/说唱",
  "派克特": "嘻哈/说唱", "盛宇": "嘻哈/说唱", "刘聪": "嘻哈/说唱", "大傻": "嘻哈/说唱",
  "连麻": "嘻哈/说唱", "隼": "嘻哈/说唱", "阿拉梅": "嘻哈/说唱", "GALI": "嘻哈/说唱",
  "马思唯": "嘻哈/说唱", "Higher Brothers": "嘻哈/说唱", "KnowKnow": "嘻哈/说唱",
  "Psy.P": "嘻哈/说唱", "Ty.": "嘻哈/说唱", "AnsrJ": "嘻哈/说唱", "邓典果": "嘻哈/说唱",
  "Ice Paper": "嘻哈/说唱", "福克斯": "嘻哈/说唱", "刘柏辛": "嘻哈/说唱", "VaVa": "嘻哈/说唱",
  "万妮达": "嘻哈/说唱", "黄旭": "嘻哈/说唱", "鬼卞": "嘻哈/说唱", "Capper": "嘻哈/说唱",
  "布瑞吉": "嘻哈/说唱", "Bridge": "嘻哈/说唱", "欧阳靖": "嘻哈/说唱", "热狗": "嘻哈/说唱",
  "MC HotDog": "嘻哈/说唱", "顽童": "嘻哈/说唱", "瘦子": "嘻哈/说唱", "法老": "嘻哈/说唱",
  "弹壳": "嘻哈/说唱", "Danko": "嘻哈/说唱", "Kanye": "嘻哈/说唱", "Drake": "嘻哈/说唱",
  "Travis Scott": "嘻哈/说唱", "Roddy Ricch": "嘻哈/说唱", "Quavo": "嘻哈/说唱",
  "Eminem": "嘻哈/说唱", "Kendrick Lamar": "嘻哈/说唱", "J. Cole": "嘻哈/说唱",
  "Jay-Z": "嘻哈/说唱", "Nas": "嘻哈/说唱", "Tupac": "嘻哈/说唱", "Snoop Dogg": "嘻哈/说唱",
  "Future": "嘻哈/说唱", "Metro Boomin": "嘻哈/说唱", "21 Savage": "嘻哈/说唱",
  "Offset": "嘻哈/说唱", "Migos": "嘻哈/说唱", "Playboi Carti": "嘻哈/说唱",
  "Lil Uzi Vert": "嘻哈/说唱", "Lil Baby": "嘻哈/说唱", "Gunna": "嘻哈/说唱",
  "Young Thug": "嘻哈/说唱", "Tyler": "嘻哈/说唱", "Kid Cudi": "嘻哈/说唱",
  "Chance": "嘻哈/说唱", "Childish Gambino": "嘻哈/说唱", "Mac Miller": "嘻哈/说唱",
  "Logic": "嘻哈/说唱", "50 Cent": "嘻哈/说唱", "Pop Smoke": "嘻哈/说唱",
  "Central Cee": "嘻哈/说唱", "Dave": "嘻哈/说唱", "Stormzy": "嘻哈/说唱",
  "Polo G": "嘻哈/说唱", "Rod Wave": "嘻哈/说唱", "Lil Durk": "嘻哈/说唱",
  "Jack Harlow": "嘻哈/说唱", "DaBaby": "嘻哈/说唱", "Megan Thee Stallion": "嘻哈/说唱",
  "Cardi B": "嘻哈/说唱", "Nicki Minaj": "嘻哈/说唱", "Tyler, The Creator": "嘻哈/说唱",
  "Kanye West": "嘻哈/说唱", "A$AP": "嘻哈/说唱", "Walk off the Earth": "流行",
  "James Blake": "R&B/灵魂", "KING": "电子",
  // 流行
  "周杰伦": "流行", "林俊杰": "流行", "陈奕迅": "流行", "薛之谦": "流行",
  "李荣浩": "流行", "邓紫棋": "流行", "G.E.M.": "流行", "毛不易": "流行",
  "华晨宇": "流行", "Taylor Swift": "流行", "Dua Lipa": "流行", "Ariana Grande": "流行",
  "Bruno Mars": "流行", "Ed Sheeran": "流行", "Billie Eilish": "流行",
  "Olivia Rodrigo": "流行", "Sabrina Carpenter": "流行", "Adele": "流行",
  "Lady Gaga": "流行", "Beyoncé": "流行", "Rihanna": "流行", "Justin Bieber": "流行",
  "The Weeknd": "R&B/灵魂", "Lana Del Rey": "流行", "Frank Ocean": "R&B/灵魂",
  "SZA": "R&B/灵魂", "Doja Cat": "流行", "Post Malone": "嘻哈/说唱",
  "Michael Jackson": "流行", "Madonna": "流行", "Prince": "流行",
  "Whitney Houston": "流行", "Mariah Carey": "流行", "Celine Dion": "流行",
  "王菲": "流行", "张学友": "流行", "刘德华": "流行", "张国荣": "流行",
  "孙燕姿": "流行", "蔡依林": "流行", "五月天": "摇滚", "告五人": "摇滚",
  "林宥嘉": "流行", "张惠妹": "流行", "刘若英": "流行", "莫文蔚": "流行",
  // 摇滚
  "许巍": "摇滚", "汪峰": "摇滚", "崔健": "摇滚", "郑钧": "摇滚", "朴树": "摇滚",
  "万能青年旅店": "摇滚", "草东没有派对": "摇滚", "痛仰": "摇滚", "新裤子": "摇滚",
  "刺猬": "摇滚", "反光镜": "摇滚", "棱镜": "摇滚", "落日飞车": "摇滚",
  "Radiohead": "摇滚", "Nirvana": "摇滚", "Pink Floyd": "摇滚", "The Beatles": "摇滚",
  "Arctic Monkeys": "摇滚", "Coldplay": "摇滚", "Imagine Dragons": "摇滚",
  "OneRepublic": "摇滚", "Linkin Park": "摇滚", "Green Day": "摇滚",
  "Oasis": "摇滚", "Blur": "摇滚", "U2": "摇滚", "Queen": "摇滚",
  "Led Zeppelin": "摇滚", "The Rolling Stones": "摇滚", "Guns N' Roses": "摇滚",
  "Metallica": "摇滚", "Red Hot Chili Peppers": "摇滚", "Foo Fighters": "摇滚",
  "Muse": "摇滚", "The Killers": "摇滚", "The Strokes": "摇滚",
  // 民谣
  "赵雷": "民谣", "陈粒": "民谣", "宋冬野": "民谣", "郝云": "民谣", "马頔": "民谣",
  "尧十三": "民谣", "贰佰": "民谣", "房东的猫": "民谣", "陈鸿宇": "民谣",
  "谢春花": "民谣", "花粥": "民谣", "Jam": "民谣", "李志": "民谣",
  "Bob Dylan": "民谣", "Bon Iver": "民谣", "Sufjan Stevens": "民谣",
  "Simon & Garfunkel": "民谣", "Don McLean": "民谣", "Leonard Cohen": "民谣",
  "刀郎": "民谣", "莫西子诗": "民谣", "张玮玮": "民谣", "郭龙": "民谣",
  "赵牧阳": "民谣",
  // 电子
  "Avicii": "电子", "David Guetta": "电子", "Calvin Harris": "电子",
  "Martin Garrix": "电子", "The Chainsmokers": "电子", "Marshmello": "电子",
  "Alan Walker": "电子", "Skrillex": "电子", "Deadmau5": "电子",
  "Disclosure": "电子", "ODESZA": "电子", "Tycho": "电子", "Daft Punk": "电子",
  "Deadmau5": "电子", "Zedd": "电子", "Tiësto": "电子", "Hardwell": "电子",
  "Armin van Buuren": "电子", "Above & Beyond": "电子",
  // R&B/灵魂
  "Chris Brown": "R&B/灵魂", "Usher": "R&B/灵魂", "Daniel Caesar": "R&B/灵魂",
  "Giveon": "R&B/灵魂", "H.E.R.": "R&B/灵魂", "Jorja Smith": "R&B/灵魂",
  "Khalid": "R&B/灵魂", "Steve Lacy": "R&B/灵魂", "Summer Walker": "R&B/灵魂",
  "Jhené Aiko": "R&B/灵魂", "Kehlani": "R&B/灵魂", "Brent Faiyaz": "R&B/灵魂",
  "陶喆": "R&B/灵魂", "方大同": "R&B/灵魂", "袁娅维": "R&B/灵魂",
  "BIBI": "R&B/灵魂", "王嘉尔": "流行",
  // 古典/纯音乐
  "巴赫": "古典", "贝多芬": "古典", "莫扎特": "古典", "肖邦": "古典",
  "李斯特": "古典", "舒伯特": "古典", "柴可夫斯基": "古典", "瓦格纳": "古典",
  "久石让": "古典", "坂本龙一": "古典", "Hans Zimmer": "古典",
  "Ludwig Göransson": "古典", "George Winston": "古典",
  // 古风
  "银临": "古风", "河图": "古风", "音频怪物": "古风", "HITA": "古风",
  "少司命": "古风", "双笙": "古风",
  // 二次元
  "米津玄師": "二次元", "米津玄师": "二次元", "YOASOBI": "二次元",
  "LiSA": "二次元", "Aimer": "二次元", "蓝井艾露": "二次元",
  "ClariS": "二次元", "GARNiDELiA": "二次元", "ReoNa": "二次元",
  "RADWIMPS": "摇滚", "ONE OK ROCK": "摇滚", "King Gnu": "流行",
  "Vaundy": "流行", "藤井风": "流行", "宇多田光": "流行",
  "椎名林檎": "流行", "吉俣良": "纯音乐",
  // 爵士/蓝调
  "Norah Jones": "爵士", "Louis Armstrong": "爵士", "Miles Davis": "爵士",
  "John Coltrane": "爵士", "Billie Holiday": "爵士", "Ella Fitzgerald": "爵士",
  "B.B. King": "爵士", "Eric Clapton": "摇滚",
};

// ============ 情绪关键词 ============
const MOOD_KEYWORDS: Record<string, string[]> = {
  "欢快愉悦": ["快乐", "开心", "嗨", "甜", "幸福", "阳光", "笑", "欢乐", "愉快", "party", "happy", "fun", "dance", "fire in my soul", "alive", "call me", "summer", "good time", "celebrate", "dancing", "tonight", "beautiful", "wonderful", "sunshine", "better", "best", "love", "loved", "loving", "phoenix", "run away", "free"],
  "忧郁伤感": ["伤", "痛", "哭", "泪", "离", "别", "失", "孤单", "寂寞", "悲", "哀", "愁", "sad", "cry", "hurt", "pain", "blue", "rain", "goodbye", "gone", "alone", "broken", "tears", "sorry", "miss", "without you", "fade", "empty", "lost", "cold", "dark", "end", "leave", "forget", "remember when", "yesterday", "ghost", "liar", "hate", "enemy", "failure", "loser", "失败者"],
  "治愈温暖": ["治愈", "暖", "光", "希望", "陪", "守护", "温柔", "安", "heal", "warm", "light", "hope", "shine", "home", "when i'm home", "hold", "safe", "peace", "dream", "dreams", "angel", "heaven", "breathe", "easy", "smile", "brave", "stronger", "rise", "四季予你"],
  "热血燃向": ["燃", "热血", "战", "勇", "极限", "fire", "fight", "power", "strong", "warrior", "rise", "survivor", "champion", "hero", "king", "queen", "victory", "burn", "thunder", "revolution", "march", "attack", "beast", "unstoppable", "fearless", "legends", "immortal", "the phoenix", "phoenix"],
  "丧/emo": ["丧", "emo", "绝望", "深渊", "黑", "暗", "dead", "die", "dark", "lost", "broken", "lonely at the top", "numb", "fade", "wither", "rot", "decay", "void", "abyss", "suffer", "agony", "curse", "demon", "nightmare", "shatter", "collapse", "drown", "suffocate"],
  "浪漫甜蜜": ["爱", "恋", "情", "喜欢", "心", "甜", "吻", "love", "romance", "sweet", "kiss", "forever", "you", "heart", "baby", "honey", "darling", "hold me", "stay with", "mine", "yours", "together", "married", "wedding", "valentine", "crush", "admire", "暧昧", "喜欢"],
  "孤独寂寞": ["孤", "独", "一个人", "空", "寂", "alone", "lonely", "empty", "nobody", "myself", "odyssey", "solo", "isolated", "stranger", "shadow", "silence", "quiet", "single", "only one", "by myself", "on my own", "solitude"],
  "励志向上": ["梦", "想", "坚持", "努力", "飞", "追", "rise", "dream", "believe", "fly", "champion", "winner", "精卫", "never give up", "keep going", "tomorrow", "future", "destiny", "faith", "trust", "overcome", "climb", "mountain", "sky", "star", "stars", "infinite", "journey", "begin", "start"],
  "宁静放松": ["静", "眠", "安", "轻", "慢", "calm", "peace", "sleep", "relax", "soft", "gentle", "breathe", "rain", "ocean", "waves", "forest", "wind", "snow", "moon", "night", "evening", "sunset", "dawn", "morning", "coffee", "tea", "book", "window", "lullaby", "serene", "tranquil"],
};

// ============ 推断函数 ============
function inferGenre(name: string, artists: string, album: string): string {
  const text = `${name} ${artists} ${album}`.toLowerCase();
  for (const [artist, genre] of Object.entries(ARTIST_GENRE)) {
    if (artists.toLowerCase().includes(artist.toLowerCase())) return genre;
  }
  if (/remix|mix|电音|edm|house|techno|dubstep|phonk/.test(text)) return "电子";
  if (/摇滚|rock|metal|punk|乐队|band/.test(text)) return "摇滚";
  if (/民谣|folk|acoustic/.test(text)) return "民谣";
  if (/rap|hip hop|hip-hop|说唱|trap|drill/.test(text)) return "嘻哈/说唱";
  if (/r&b|rnb|soul|灵魂/.test(text)) return "R&B/灵魂";
  if (/jazz|爵士/.test(text)) return "爵士";
  if (/classical|古典|交响曲|奏鸣曲|concerto|symphony|piano concerto/.test(text)) return "古典";
  if (/古风|辞|赋|中国风/.test(text)) return "古风";
  if (/country|乡村/.test(text)) return "乡村";
  if (/anime|动画|op|ed|ost|ピアノ|instrumental/.test(text)) return "二次元";
  if (/纯音乐|instrumental|piano version/.test(text)) return "纯音乐";
  if (/blues|蓝调|布鲁斯/.test(text)) return "爵士";
  return "流行";
}

function inferMood(name: string, artists: string): string {
  const text = `${name} ${artists}`.toLowerCase();
  let bestMood = "中性/复杂";
  let bestScore = 0;
  for (const [mood, keywords] of Object.entries(MOOD_KEYWORDS)) {
    const score = keywords.reduce((n, kw) => n + (text.includes(kw.toLowerCase()) ? 1 : 0), 0);
    if (score > bestScore) { bestScore = score; bestMood = mood; }
  }
  return bestMood;
}

function inferLanguage(name: string, artists: string): string {
  const text = `${name} ${artists}`;
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) return "日语";
  if (/[\uAC00-\uD7AF]/.test(text)) return "韩语";
  if (/[\u4e00-\u9fff]/.test(text)) {
    if (/粤|广东话|cantonese/.test(text)) return "粤语";
    return "国语";
  }
  if (/[a-zA-Z]/.test(text)) return "英语";
  return "其他";
}

function inferEra(name: string, artists: string, album: string): string {
  const oldArtists = ["邓丽君", "张国荣", "Beyond", "谭咏麟", "张学友", "罗大佑", "李宗盛", "周华健", "王菲", "崔健", "黑豹", "唐朝", "陈百强", "梅艳芳"];
  if (oldArtists.some(a => artists.includes(a))) return "90年代";
  const artists00s = ["周杰伦", "林俊杰", "陈奕迅", "王力宏", "陶喆", "蔡依林", "孙燕姿", "梁静茹", "S.H.E", "潘玮柏", "罗志祥", "萧敬腾", "林宥嘉"];
  if (artists00s.some(a => artists.includes(a))) return "00年代";
  const yearMatch = `${name} ${album}`.match(/(19|20)\d{2}/);
  if (yearMatch) {
    const y = parseInt(yearMatch[0]);
    if (y < 1990) return "80年代及以前";
    if (y < 2000) return "90年代";
    if (y < 2010) return "00年代";
    if (y < 2020) return "10年代";
    return "20年代";
  }
  return "未知";
}

function inferBpm(genre: string, name: string): string {
  if (genre === "电子" || genre === "嘻哈/说唱") return "快歌(120-160)";
  if (genre === "摇滚") return "快歌(120-160)";
  if (genre === "古典" || genre === "民谣" || genre === "纯音乐") return "慢歌(<80)";
  if (genre === "R&B/灵魂" || genre === "爵士") return "中速(80-120)";
  if (/慢|抒情|ballad|slow|soft/.test(name.toLowerCase())) return "慢歌(<80)";
  if (/快|嗨|dance|fast|upbeat/.test(name.toLowerCase())) return "快歌(120-160)";
  return "中速(80-120)";
}

function inferScene(genre: string, mood: string, bpm: string): string {
  if (mood === "忧郁伤感" || mood === "孤独寂寞" || mood === "丧/emo") return "深夜独处";
  if ((bpm === "快歌(120-160)") && (mood === "热血燃向" || mood === "欢快愉悦")) return "运动健身";
  if (genre === "古典" || genre === "纯音乐" || mood === "宁静放松") return "工作专注";
  if (mood === "浪漫甜蜜") return "恋爱约会";
  if (bpm === "慢歌(<80)" || mood === "宁静放松") return "睡前放松";
  if (mood === "欢快愉悦") return "朋友聚会";
  return "通勤路上";
}

// ============ 音乐人格模型 ============
const ARCHETYPES = [
  { name: "嘻哈态度表达者", cond: (g: Record<string, number>) => (g["嘻哈/说唱"] ?? 0) > 0.25,
    desc: "你是一个真实而自信的人，说唱的节奏和flow是你表达自我的方式。你不喜欢伪装，有什么说什么，你的音乐列表里全是态度和立场。",
    line: "你用beat说话，用歌词表态，在规则世界里保持棱角。",
    trait: "真实自信的态度表达者", labels: ["态度", "真实", "flow人生"] },
  { name: "电子派对动物", cond: (g: Record<string, number>) => (g["电子"] ?? 0) > 0.20,
    desc: "你是天生的氛围制造者，节奏是你的语言，鼓点是你的心跳。你热爱鲜活的生命力，喜欢在音乐中释放所有压力。",
    line: "你把日常过成一场有节拍的出走。",
    trait: "外放而有选择的能量体", labels: ["感官优先", "能量补给", "节拍人生"] },
  { name: "热血摇滚青年", cond: (g: Record<string, number>) => (g["摇滚"] ?? 0) > 0.20,
    desc: "你骨子里带着倔强，摇滚的嘶吼和吉他的失真是你对抗平庸的武器。你不相信宿命，只相信拳头和汗水。",
    line: "你的耳机里永远住着一个不妥协的少年。",
    trait: "倔强而热烈的理想主义者", labels: ["不妥协", "热血", "自由"] },
  { name: "深夜民谣诗人", cond: (g: Record<string, number>) => (g["民谣"] ?? 0) > 0.15,
    desc: "你内心丰富而敏感，习惯在深夜与自己对话。民谣的质朴和诗意是你情绪的出口，你在别人的故事里流自己的泪。",
    line: "你的歌单不是歌，是一本写满心事的日记。",
    trait: "高敏感的浪漫主义者", labels: ["情绪存档", "克制浪漫", "夜行者"] },
  { name: "治愈系聆听者", cond: (_g: Record<string, number>, m: Record<string, number>) => (m["治愈温暖"] ?? 0) + (m["宁静放松"] ?? 0) > 0.25,
    desc: "你温柔而有力量，音乐是你自我疗愈的方式。你偏爱能让人安静下来的旋律，在喧嚣世界里为自己保留一片柔软角落。",
    line: "你的温柔不是软弱，是历经世事后的选择。",
    trait: "温柔而有力量的治愈者", labels: ["自我疗愈", "温柔", "内心安定"] },
  { name: "都市夜晚漫步者", cond: (g: Record<string, number>) => (g["R&B/灵魂"] ?? 0) + (g["爵士"] ?? 0) > 0.15,
    desc: "你属于夜晚，城市霓虹和R&B的慵懒是你的标配。你喜欢在深夜街头漫无目的地走，让音乐和夜色包裹自己。",
    line: "你把耳机当作一座移动的私人房间。",
    trait: "清醒而不冷漠的都市灵魂", labels: ["低饱和", "慢热", "氛围感"] },
  { name: "古典优雅品鉴者", cond: (g: Record<string, number>) => (g["古典"] ?? 0) + (g["纯音乐"] ?? 0) > 0.15,
    desc: "你有深度和品味，古典音乐的复杂和精妙让你着迷。你能在交响乐里听到宇宙浩瀚，在钢琴独奏里听到人生百态。",
    line: "你的审美超越了时代，灵魂住着一个老派绅士。",
    trait: "深度思考的审美主义者", labels: ["深度", "品味", "精神富足"] },
  { name: "多元音乐探索家", cond: (g: Record<string, number>) => Object.values(g).filter(v => v > 0.05).length >= 5,
    desc: "你永远保持好奇心，音乐的边界对你不存在。从东方到西方，从古典到电子，你都能找到欣赏的角度。",
    line: "你不接受被推荐，你在主动定义自己的世界。",
    trait: "边界感极强的探索者", labels: ["反标准答案", "新鲜感", "自我驱动"] },
  { name: "流行音乐达人", cond: (g: Record<string, number>) => (g["流行"] ?? 0) > 0.40,
    desc: "你紧跟潮流，音乐列表就是流行音乐风向标。你不排斥大众，因为你知道流行之所以流行，一定有它的道理。",
    line: "你在热门歌里找到真正打动自己的旋律。",
    trait: "开放而接地气的潮流感知者", labels: ["潮流", "共鸣", "当下"] },
];

// ============ 主分析函数 ============
export function analyzeTracks(tracks: TrackInput[]): AnalysisResult {
  // 标注
  const annotated: AnnotatedTrack[] = tracks.map(t => {
    const genre = inferGenre(t.name, t.artists, t.album ?? "");
    const mood = inferMood(t.name, t.artists);
    const language = inferLanguage(t.name, t.artists);
    const era = inferEra(t.name, t.artists, t.album ?? "");
    const bpm = inferBpm(genre, t.name);
    const scene = inferScene(genre, mood, bpm);
    return { ...t, genre, mood, language, era, bpm, scene };
  });

  const total = annotated.length;
  const count = (key: keyof AnnotatedTrack) => {
    const c: Record<string, number> = {};
    annotated.forEach(t => { c[t[key] as string] = (c[t[key] as string] ?? 0) + 1; });
    return Object.fromEntries(Object.entries(c).sort((a, b) => b[1] - a[1]));
  };

  const genres = count("genre");
  const moods = count("mood");
  const languages = count("language");
  const eras = count("era");
  const bpms = count("bpm");
  const scenes = count("scene");

  // 歌手统计
  const artistCount: Record<string, number> = {};
  annotated.forEach(t => {
    t.artists.split(" / ").forEach(a => {
      const name = a.trim();
      if (name) artistCount[name] = (artistCount[name] ?? 0) + 1;
    });
  });
  const topArtists = Object.entries(artistCount).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, count]) => ({ name, count }));

  const pct = (obj: Record<string, number>, key: string) => (obj[key] ?? 0) / total;
  const pctG = (k: string) => pct(genres, k);
  const pctM = (k: string) => pct(moods, k);

  // 大五人格
  const bigFive = {
    openness: Math.round(50 + pctG("电子") * 60 + pctG("古典") * 40 + pctG("爵士") * 30 + pctG("二次元") * 20 + (Object.values(genres).filter(v => v / total > 0.05).length - 3) * 8),
    conscientiousness: Math.round(50 + pctG("古典") * 50 + pctG("纯音乐") * 30 + pctM("宁静放松") * 30 - pctG("电子") * 20),
    extraversion: Math.round(50 + pctG("电子") * 70 + pctG("嘻哈/说唱") * 40 + pctG("摇滚") * 50 + pctM("欢快愉悦") * 40 - pctG("民谣") * 40 - pctG("古典") * 30 - pctM("忧郁伤感") * 25),
    agreeableness: Math.round(50 + pctM("治愈温暖") * 50 + pctM("浪漫甜蜜") * 40 + pctG("民谣") * 30 - pctG("嘻哈/说唱") * 15 - pctM("丧/emo") * 20),
    neuroticism: Math.round(50 + pctM("忧郁伤感") * 50 + pctM("丧/emo") * 60 + pctM("孤独寂寞") * 40 - pctM("欢快愉悦") * 30 - pctM("治愈温暖") * 25),
  };
  // clamp 0-100
  (Object.keys(bigFive) as Array<keyof typeof bigFive>).forEach(k => {
    bigFive[k] = Math.max(5, Math.min(95, bigFive[k]));
  });

  // MBTI
  const EI = 100 - bigFive.extraversion; // >50 偏I
  const SN = 100 - bigFive.openness; // >50 偏S
  const TF = 100 - bigFive.agreeableness; // >50 偏T
  const JP = bigFive.openness > 60 ? 35 : 55; // 开放性高偏P
  const mbtiType =
    (EI > 50 ? "I" : "E") +
    (SN > 50 ? "S" : "N") +
    (TF > 50 ? "T" : "F") +
    (JP > 50 ? "J" : "P");

  // 人格匹配（cond 接收百分比 0-1）
  const genresPct = Object.fromEntries(
    Object.entries(genres).map(([k, v]) => [k, v / total])
  );
  const moodsPct = Object.fromEntries(
    Object.entries(moods).map(([k, v]) => [k, v / total])
  );
  let archetype = ARCHETYPES[ARCHETYPES.length - 1];
  for (const a of ARCHETYPES) {
    if (a.cond(genresPct, moodsPct)) { archetype = a; break; }
  }

  // 三维分数（兼容旧版）
  const energy = bigFive.extraversion;
  const warmth = bigFive.agreeableness;
  const taste = Math.round(50 + pctG("古典") * 30 + pctG("爵士") * 25 + pctG("电子") * 20 + (Object.values(genres).length - 3) * 5);

  // 小红书文案
  const topGenre = Object.entries(genres)[0]?.[0] ?? "流行";
  const topMood = Object.entries(moods)[0]?.[0] ?? "中性";

  // 心路历程辅助函数
  const overallGenrePct: Record<string, number> = {};
  Object.entries(genres).forEach(([k, v]) => { overallGenrePct[k] = v / total; });

  function countGenreInSlice(slice: AnnotatedTrack[]): Array<[string, number]> {
    const c: Record<string, number> = {};
    slice.forEach((t) => { c[t.genre] = (c[t.genre] ?? 0) + 1; });
    return Object.entries(c).sort((a, b) => b[1] - a[1]);
  }
  function countMoodInSlice(slice: AnnotatedTrack[]): Array<[string, number]> {
    const c: Record<string, number> = {};
    slice.forEach((t) => { c[t.mood] = (c[t.mood] ?? 0) + 1; });
    return Object.entries(c).sort((a, b) => b[1] - a[1]);
  }
  function countArtistInSlice(slice: AnnotatedTrack[]): Array<[string, number]> {
    const c: Record<string, number> = {};
    slice.forEach((t) => {
      t.artists.split(" / ").forEach((a) => {
        const name = a.trim();
        if (name) c[name] = (c[name] ?? 0) + 1;
      });
    });
    return Object.entries(c).sort((a, b) => b[1] - a[1]);
  }

  // ============ 心路历程分析 ============
  // 按添加时间排序（从早到晚）
  const withTime = annotated.filter((t) => t.addedAt && t.addedAt > 0);
  const hasTimeData = withTime.length >= total * 0.5; // 超过一半有时间数据才用时间分段

  let journey: JourneyStage[] = [];

  if (hasTimeData) {
    // 按年份分组
    const byYear: Record<number, AnnotatedTrack[]> = {};
    const chronological = [...withTime].sort((a, b) => (a.addedAt ?? 0) - (b.addedAt ?? 0));
    chronological.forEach((t) => {
      const year = new Date(t.addedAt!).getFullYear();
      if (!byYear[year]) byYear[year] = [];
      byYear[year].push(t);
    });

    const years = Object.keys(byYear).map(Number).sort((a, b) => a - b);

    // 如果年份太多，合并相邻年份使段数不超过5
    let yearGroups: Array<{ years: number[]; tracks: AnnotatedTrack[] }> = years.map((y) => ({
      years: [y],
      tracks: byYear[y],
    }));

    while (yearGroups.length > 5) {
      // 找歌曲最少的相邻两组合并
      let minIdx = 0;
      let minCount = Infinity;
      for (let i = 0; i < yearGroups.length - 1; i++) {
        const combined = yearGroups[i].tracks.length + yearGroups[i + 1].tracks.length;
        if (combined < minCount) {
          minCount = combined;
          minIdx = i;
        }
      }
      yearGroups[minIdx] = {
        years: [...yearGroups[minIdx].years, ...yearGroups[minIdx + 1].years],
        tracks: [...yearGroups[minIdx].tracks, ...yearGroups[minIdx + 1].tracks],
      };
      yearGroups.splice(minIdx + 1, 1);
    }

    const stageLabels = ["最初", "后来", "再后来", "近期", "现在"];
    yearGroups.forEach((group, i) => {
      const slice = group.tracks;
      const sortedGenres = countGenreInSlice(slice);
      const sortedMoods = countMoodInSlice(slice);
      const sArtists = countArtistInSlice(slice);

      const stageTopGenre = sortedGenres[0]?.[0] ?? "流行";
      const stageGenrePct: Record<string, number> = {};
      sortedGenres.forEach(([k, v]) => { stageGenrePct[k] = v / slice.length; });
      const distinctiveGenre = sortedGenres.find(([g]) =>
        g !== "流行" && (stageGenrePct[g] ?? 0) > (overallGenrePct[g] ?? 0) * 1.3 && (stageGenrePct[g] ?? 0) > 0.08
      )?.[0];
      const displayGenre = distinctiveGenre ?? stageTopGenre;

      const stageTopMood = sortedMoods[0]?.[0] ?? "中性";
      const stageTopArtists = sArtists.slice(0, 3).map(([name]) => name);
      const repTrack = slice[Math.floor(slice.length / 2)];

      const yearLabel = group.years.length === 1
        ? `${group.years[0]}`
        : `${group.years[0]}-${group.years[group.years.length - 1]}`;

      journey.push({
        label: stageLabels[i] ?? `阶段${i + 1}`,
        timeRange: yearLabel,
        genre: displayGenre,
        mood: stageTopMood,
        topArtists: stageTopArtists,
        representativeTrack: `${repTrack.artists} - ${repTrack.name}`,
        description: "",
        trackCount: slice.length,
      });
    });
  } else {
    // 没有时间数据，按顺序均分
    const chronological = [...annotated].reverse();
    const stageCount = Math.min(5, Math.max(3, Math.ceil(total / 80)));
    const stageSize = Math.ceil(chronological.length / stageCount);
    const stageLabels = ["最初", "后来", "再后来", "近期", "现在"];

    for (let i = 0; i < stageCount; i++) {
      const slice = chronological.slice(i * stageSize, (i + 1) * stageSize);
      if (slice.length === 0) continue;

      const sortedGenres = countGenreInSlice(slice);
      const sortedMoods = countMoodInSlice(slice);
      const sArtists = countArtistInSlice(slice);

      const stageTopGenre = sortedGenres[0]?.[0] ?? "流行";
      const stageGenrePct: Record<string, number> = {};
      sortedGenres.forEach(([k, v]) => { stageGenrePct[k] = v / slice.length; });
      const distinctiveGenre = sortedGenres.find(([g]) =>
        g !== "流行" && (stageGenrePct[g] ?? 0) > (overallGenrePct[g] ?? 0) * 1.3 && (stageGenrePct[g] ?? 0) > 0.08
      )?.[0];
      const displayGenre = distinctiveGenre ?? stageTopGenre;

      const stageTopMood = sortedMoods[0]?.[0] ?? "中性";
      const stageTopArtists = sArtists.slice(0, 3).map(([name]) => name);
      const repTrack = slice[Math.floor(slice.length / 2)];

      journey.push({
        label: stageLabels[i] ?? `阶段${i + 1}`,
        timeRange: "",
        genre: displayGenre,
        mood: stageTopMood,
        topArtists: stageTopArtists,
        representativeTrack: `${repTrack.artists} - ${repTrack.name}`,
        description: "",
        trackCount: slice.length,
      });
    }
  }

  // 为每个阶段生成描述
  const genreMoodDesc: Record<string, string> = {
    "嘻哈/说唱": "用节奏表达态度",
    "电子": "在节拍中释放能量",
    "摇滚": "带着倔强和热血",
    "民谣": "在质朴旋律里与自己对话",
    "R&B/灵魂": "沉浸在慵懒的氛围里",
    "古典": "在深度和精妙中寻找安宁",
    "古风": "在东方意境中流连",
    "二次元": "在二次元世界里热血与感动",
    "爵士": "享受即兴和慵懒",
    "流行": "被直击人心的旋律吸引",
    "纯音乐": "用纯音乐安放情绪",
    "乡村": "在质朴叙事中找到共鸣",
  };

  journey.forEach((stage, idx) => {
    const genreDesc = genreMoodDesc[stage.genre] ?? "在音乐中寻找共鸣";
    const moodText = stage.mood !== "中性/复杂" ? `，${stage.mood}是你的主色调` : "";
    if (idx === 0) {
      stage.description = `那时候的你，${genreDesc}${moodText}。`;
    } else if (idx === journey.length - 1) {
      const prev = journey[idx - 1];
      if (prev.genre !== stage.genre) {
        stage.description = `而现在，你的口味转向了${stage.genre}，${genreDesc}${moodText}。`;
      } else {
        stage.description = `现在的你依然热爱${stage.genre}，但更多了一份沉淀${moodText}。`;
      }
    } else {
      const prev = journey[idx - 1];
      if (prev.genre !== stage.genre) {
        stage.description = `你开始从${prev.genre}转向${stage.genre}，${genreDesc}。`;
      } else {
        const next = journey[idx + 1];
        if (next && next.genre !== stage.genre) {
          stage.description = `${stage.genre}是这段时期的主线，但你已经开始向${next.genre}试探。`;
        } else {
          stage.description = `${stage.genre}依然陪伴着你，听歌的心情在悄悄变化。`;
        }
      }
    }
  });

  // 整体心路历程总结
  const firstGenre = journey[0]?.genre ?? "流行";
  const lastGenre = journey[journey.length - 1]?.genre ?? "流行";
  const allGenres = new Set(journey.map((j) => j.genre));
  let journeySummary = "";
  if (allGenres.size === 1) {
    journeySummary = `从一开始到现在，${firstGenre}始终是你的音乐底色。变的是心情，不变的是品味。`;
  } else if (firstGenre === lastGenre && allGenres.size > 1) {
    journeySummary = `你的音乐旅程从${firstGenre}出发，中途探索过${[...allGenres].filter((g) => g !== firstGenre).join("、")}，最终又回到了${firstGenre}。离开是为了更好地回来。`;
  } else {
    journeySummary = `你的音乐旅程从${firstGenre}出发，一路走到了${lastGenre}。歌单记录的不只是歌，更是你这些年的心境变迁。`;
  }
  const xhsTitle = `我的音乐人格是「${archetype.name}」，准到离谱`;
  const xhsBody = `把歌单丢进「听见你」测了一下，结果是：${archetype.name}\n\n最扎心的一句：${archetype.line}\n\n听了${total}首歌，${topGenre}占比最高，情绪底色是${topMood}。MBTI倾向：${mbtiType}。\n\n歌单真的比自我介绍诚实。你会是什么？\n\n#听见你 #音乐人格 #歌单人格测试 #MBTI #歌单分享 #听歌品味 #自我探索`;
  const xhsTags = ["听见你", "音乐人格", "歌单人格测试", "MBTI", "歌单分享", "听歌品味", "自我探索"];

  return {
    total,
    artists: Object.keys(artistCount).length,
    genres, moods, languages, eras, bpms, scenes,
    topArtists,
    bigFive,
    mbti: { EI, SN, TF, JP, type: mbtiType },
    archetype: archetype.name,
    archetypeDesc: archetype.desc,
    line: archetype.line,
    trait: archetype.trait,
    energy, warmth, taste,
    labels: archetype.labels,
    xhsTitle,
    xhsBody,
    xhsTags,
    journey,
    journeySummary,
  };
}
