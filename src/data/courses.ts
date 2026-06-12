import { WeChatArticle } from "../types";

export interface LessonPreset {
  id: string;
  name: string;
  shortDesc: string;
  outline: string;
  article: WeChatArticle;
}

export const LESSON_2_OUTLINE = `装备选购指南——选对工具事半功倍
基础装备：路亚竿（推荐直柄竿，ML或M调泛用性强）、渔轮（新手首选纺车轮，不易炸线）、钓线（PE线搭配碳素前导线，兼顾强度与隐蔽性）。
核心消耗品：拟饵的种类与选择（硬饵如米诺、亮片，软饵如卷尾蛆等）。
必备配件：路亚钳、控鱼器、偏光镜等。`;

export const LESSON_2_ARTICLE: WeChatArticle = {
  title: "【避坑指南】路亚新手首套装备怎么选？ML直柄竿+纺车轮，带你轻松入门！",
  subtitle: "拒绝交学费、告别炸线炒粉！资深钓友手把手教你配齐路亚第一套黄金装备。",
  intro: "嘿！各位钓友，我是你们的路亚老友。很多人防不胜防刚入坑就满腔热血买了一堆拉风装备，结果下水没抛两下就遇到疯狂炸线，只能坐在岸边绝望地解线，玩两次就气得直接退坑。其实，路亚是非常解压好玩的，只是你们走错了第一步！今天我们就来拆解一套“极高容错、闭眼不踩雷”的黄金基础装备，让你轻松起航！",
  sections: [
    {
      id: "rod",
      title: "01 基础装备：路亚竿（首选直柄竿，ML或M调）",
      subtitle: "新手黄金起步杆，泛用性与感知手感的完美桥梁",
      paragraphs: [
        "很多刚入行的朋友觉得手持枪柄钓竿配上水滴轮，往岸边一站帅气拉风，气势直接拉满。但作为资深老钓手，必须兜头给你泼一盆冷水——如果控制不好线杯转速，十发九中你会遇到疯狂缠线的噩梦（咱们戏称为“炒米粉”）。",
        "听老手一句劝，你的第一支生命之竿，强烈建议无脑选用【直柄路亚竿】！直柄竿配上纺车轮，其超高的抛投与出线容错率是让你不至于在第一天就崩溃退坑的底线。先能顺利把假饵扔出去，你才谈得上逗鱼和博鱼，对吧？",
        "在竿子硬度也就是调性选择上，极力推荐直接选【ML调（中偏软）】或者【M调（中等）】的泛用竿。这个规格对拟饵克重的兼容性极强，不论是丢几克重的小亮片，还是甩十几克的小米诺，腰力上都绰绰有余，而且水底的一草一木甚至鱼嘴的轻轻吸啄都能极敏锐地传递给你的手心。"
      ],
      proTips: "买竿时优先买两节插节式钓竿，便于携带。且买碳素含量在90%以上的，腰力充足，感知极其灵敏！",
      imagePrompt: "lure fishing casting rod"
    },
    {
      id: "reel",
      title: "02 稳健运转：纺车轮（推荐2000-2500型浅线杯）",
      subtitle: "出线零阻碍，彻底告别“炒粉”炸线尴尬",
      paragraphs: [
        "竿子既然定了直柄，那它的天生贵人【纺车轮】就必须紧随其后。纺车轮的出线原理是螺旋状自然脱出，完全依赖假饵飞行拉扯渔线，这在物理上就彻底消除了任何摩擦或失控逆转，可以说是真正的“炸线杀手”。",
        "它就像汽车里的自动挡，你只需要打开线挡，手指松开顺势一甩，就可以优雅地看着拟饵划出完美的抛物线。哪怕你是第一天摸路亚，也完全不用担心遇到线轴反卷。如果你用纺车轮还能炸得一塌糊涂，那只能建议回去多练习一下手指释放时机的视频了！",
        "新手挑轮子，建议闭眼入 2000型 或 2500型 的【浅线杯】。它的重量极其迎合ML竿的重心平衡，拿在手里很轻巧，甩一整天胳膊也不会酸。更棒的是，浅线杯不需要缠太多无用的底线，直接上百米PE线，抛投效率和手感最佳。"
      ],
      proTips: "每次作钓结束回家后，建议用清水冲洗主轴和轴承处，甩干水滴并点一滴润滑油，以持续保持纺车轮润滑无声的丝滑手感！",
      imagePrompt: "lure spinning reel 2000"
    },
    {
      id: "line",
      title: "03 隐形桥梁：主线（PE编织线） + 前导线（碳素线）",
      subtitle: "双线黄金搭档，兼顾拉力强度与水中完美隐蔽",
      paragraphs: [
        "主线是连接猎物的黄金纽带。新手的主线建议直接选用四编或八编的【PE编织线（0.8号或1.0号）】。PE线没有弹性，拉力极强，而且线径细能甩得更远，能将水下轻微的鱼口颤动瞬间百分百无损传递到你的指尖。",
        "为了防磨和隐形，你必须在前端绑一截一米左右的【碳素前导线】。碳素线耐磨防划，可以肆无忌惮地在枯木烂石树桩堆里投，而且最奇妙的是，碳素线在水中的折射率极其接近水，近似全隐形！这样那些老油条大鱼就会放松警惕，一口闷吞！",
        "不管是重障碍区打黑鱼，还是开阔水域追翘嘴，有了碳素外挂加码，至少在对线野生巨物时，能保你的主线绝不英年早断！多在家里练习打结绑法（如简易FG结或双套结），熟能生巧，这也算得上通向爆护极品钓手的高效内功心法了。"
      ],
      proTips: "主线与前导线的连接推荐使用“简易FG结”或“双套结”。虽然新手学习打结有点繁琐，但在搏击大翘嘴时，它能让你避免断线切线的遗憾！",
      imagePrompt: "braided fishing line"
    },
    {
      id: "lures",
      title: "04 致命诱惑：三大新手核心拟饵（米诺、亮片与卷尾软虫）",
      subtitle: "两硬一软黄金战术组合，全水层覆盖应对不同钓况",
      paragraphs: [
        "拟饵是路亚钓鱼的灵魂，不同的设计能够模仿不同水层和状态的小型生物。对于新手而言，市面上眼花缭乱的拟饵极易让人产生选择焦虑。其实，在入门阶段，你的假饵盒里只需要备齐三大经典款：经典硬饵【米诺】、全能广域搜索的金属【亮片】、以及主打伏击重障碍区底栖鱼类的【卷尾蛆软虫】。这三款主流设计已经足以帮你全方位覆盖不同水深、光照和目标钓况。",
        "在实战操控上，硬饵米诺适合在清澈的中上层水体通过“慢收、重刮、轻停顿”诱引黑鲈和翘嘴；金属亮片适合在浑浊未知的深水通过持续在底卷线来感知鱼讯、防拧阻滞；而卷尾蛆配上铅头钩或德州钓组，则是面对低温、低活性底栖鳜鱼和黑鱼的“终极大招”，通过轻挑抬竿逗底实现水下极富动感的生命展现。掌握这两硬一软三种基础操控手法，就能在全自然水域开启轻松爆护之旅。",
        "这也是许多老钓手极力推荐新手使用的“空军绝杀秘籍”。卷尾蛆在水底一蹦一跳尾巴摇摆个不停，哪怕平时不怎么有活力的那些底栖鳜鱼、鲇鱼也顶不住这波纯纯的生理刺激，会一咬咬个死，绝对是居家开荒神器！"
      ],
      proTips: "新手在有枯树枝、乱石、死桩等超复杂重组结构区作钓时，极容易挂底丢饵。推荐把铅头钩换成防挂效果极佳的【德州钓组（子弹铅 ✕ 挡珠 ✕ 宽腹曲柄钩）】，配上双尾小虾或卷尾蛆，钩尖藏在虫体内，防挂底通过性极佳，直捣黑鱼巢穴！",
      imagePrompt: "lure lures soft grubs hooks"
    },
    {
      id: "accessories",
      title: "05 必备配件：路亚钳、控鱼器与偏光镜",
      subtitle: "安全垂钓的刚需，保护爱鱼更保护我们自己",
      paragraphs: [
        "太多新手出门极其随性，连把钳子都不带，等费尽力气把一头十斤重的大鳜鱼大翘嘴遛到岸边，才发现自己根本没办法把深吞的鱼钩拔出来。你敢直接用手去伸进那布满锋利倒刺和牙齿的鱼嘴吗？稍微甩个头，你心爱的假饵和锋利的三叉钩就会挂在你的皮肉上，教你瞬间明白肉痛的真谛！",
        "在有经验的钓手眼里，【路亚钳】和【控鱼器】是人人随身佩戴的“安全双骄”。控鱼器能死死锁住大鱼下颌免受甩尾误伤，路亚钳不仅能让你快速开环换假饵，更能安全、干净利落地摘掉深喉鱼钩，让你在岸边举止体面，宛如一个优雅的专业玩家。",
        "最后，非常推荐购买一副帅气的【偏光太阳镜】。这不仅仅是为了在拍照发朋友圈时特别有范，它能帮你彻底过滤掉刺眼的水波反射，能让你在晴天清楚看清水面下的暗草、杂石甚至是黑鱼产卵形成的黑色鱼影，简直就像水下透视镜，安全实用两不误！"
      ],
      proTips: "钓鱼安全最重要！甩竿前，请务必回头看一下方圆两三米内是否有行人或钓友，保护自己也为他人负责。",
      imagePrompt: "fishing pliers grip glasses"
    }
  ],
  safetyTips: "【绿色路亚精神】适度留鱼，极力提倡放流（Catch & Release）小鱼与怀卵母鱼。随手带走垃圾，不乱丢塑料软饵，保持好水体。抛投作钓时注意周围环境，时刻戴好帽子与偏光镜，安全为主！",
  outro: "路亚钓法是一场与自然斗智斗勇的体育运动，选对第一套入门级装备，能让你少走大半年弯路。如果你已经按捺不住想要爆护的心，快配齐这套极简装备出发吧！如果你对轮子或者线号存有疑问，随时在评论区留言给本期作者，我们钓友们一起探讨！"
};

export const LESSON_3_OUTLINE = `实战技巧精进——扎实起步，循序渐进
抛投技巧：安全与精准并重。重点练习过头抛（适合开阔水域）和侧抛（适合障碍物环境），新手切忌暴力抛投。
控饵手法：通过快收线、抽停结合、跳底慢拖等“视觉与触觉骗术”，模仿猎物动态。`;

export const LESSON_3_ARTICLE: WeChatArticle = {
  title: "【新手必看】路亚抛投控饵全攻略！两招过海，手法拉满，轻松撬开巨物鱼嘴！",
  subtitle: "解锁过头抛与侧抛两项核心姿势，依靠抽停、跳底等视觉骗术，不做岸边解线狂人！",
  intro: "嘿，各位钓友，我是你们的路亚老朋友！咱们上一步刚刚精选配齐了一套超级抗炸容错的黄金直柄装备，今天我们终于迎来了路亚最让人热血澎湃的阶段——下水作钓！不少新手兴冲冲拿着竿子，没摇两下就切线挂底干吹一整天。今天我们就来拆解两套最高效的“核心抛投技巧与控饵心法”，让路亚拟饵在水底彻底演活，一击中鱼！",
  sections: [
    {
      id: "casting",
      title: "01 抛投技巧：安全与精准并重（开阔过头抛 ✕ 障碍侧平抛）",
      subtitle: "重心后蓄力顺势释放，好落点让钓况事半功倍",
      paragraphs: [
        "第一招也是最稳固的基础是【过头抛（Overhead Cast）】。抛投前留出10-15公分的前导线，将竿子举过肩膀，使假饵呈钟摆状静止。利用大臂带动小臂，竿梢向后挥动直至竿身弓起蓄力，随即顺势向前一荡，在钟表大约十点钟的位置松开食指。拟饵就能顺着极其精准的笔直轨迹划过长空。这一招是开阔水体进行大范围定位搜索的绝佳选择！",
        "而一旦当你走到岸边树林、枯生灌木堆、或是浮萍密布的重障碍区时，过头抛就会被树梢勾死。此时你必须使用【侧抛（Side Cast）】。通过水平或斜向摆动钓竿，让假饵贴着水面实现精准平射飞入树荫根部。侧抛由于飞行曲线极低，不容易被空中风势吹偏，且假饵落水的水花极其柔和。对那些守在树荫下避暑睡觉的老游条大鱼来说，它简直毫无声息！",
        "听老钓友一句劝：玩抛投永远用的是【手腕柔力】与【竿子自重蓄力】，新手最忌讳像抡铁棒一样用全身爆发生死暴力！暴力抛投对落点的精准度没有任何帮助，反而会在出线瞬间打破线杯惯性，制造出一两团完美的炸线米粉，让你蹲着解一下午，彻底丧失乐趣。"
      ],
      proTips: "钓鱼安全永远最大！抛竿前请100%回头，确认方圆2米没有行人或钓友！同时出线落水前一瞬间，用手指轻轻抚控线杯边缘进行手动微制动，能让拟饵落水声音极其微弱，大大提升鳜鱼或黑鱼的咬钩概率！",
      imagePrompt: "lure fishing casting technique"
    },
    {
      id: "actions",
      title: "02 控饵手法：快收、抽停、跳底等“视觉与触觉骗术”",
      subtitle: "模仿重伤小鱼与底栖活饵的挣扎，激起潜伏巨物的疯咬本能",
      paragraphs: [
        "路亚路亚，灵魂就在于“动起来”。假饵落水只是第一步，收线控饵才是让木头和塑料变成活物的终极灵魂！首推招式是【快慢收线 ✕ 抽停结合】。当你甩出硬饵米诺或金属亮片时，收线几圈，手腕猛一“抽”钓竿顶端，然后再瞬间停顿半秒钟。在突然抽动的力量下，水中的米诺会像一只受到极度惊吓、游得左摇右摆、身负重伤的小鱼。在“抽”完停顿的半秒，九成以上潜伏的鲈鱼会再也憋不住警戒，疯狂的一大口直接吸入！",
        "而如果此时你处于温度低、气压闷、鱼活性低的糟糕时刻，那就要派上在底栖活动的无敌武器——【跳底慢拖（Jigging & Crawling）】。使用德州钓组、铅头钩挂卷尾蛆，让其充分沉底。微微向上轻轻挑起竿尖，让小虫在水底乱石、沙土上“一蹦一蹦”地跳，每次离底十公分。跃起后，顺势慢收半圈线，保持线紧绷自然跌落。尾巴在起落晃动间极易引人注目，连守在避光缝隙里的老鳜鱼都会被挑逗得按捺不住，上去就是一口死咬！",
        "在水中演好这场欺骗大鱼智商的戏法并不困难，核心要领就是：不要匀速死板收线！通过有规律的轻挑、重抖、短暂停歇，在水底给那些鱼儿带来最富真实感的视觉暴击。你不仅要做文章的读者，更要做拟饵在水深处的导演！"
      ],
      proTips: "控饵时主线必须时刻处于拉紧微张的状态，这样鱼嘴轻轻碰饵的震动才能瞬间透过PE线送达您的竿柄。当你感觉到手中有极微小的沉重拉扯、或者主线突然横向移动时，二话不说，直接大力扬竿刺鱼，保你的大鱼牢牢中钩！",
      imagePrompt: "lure fish retrieve action detail"
    }
  ],
  safetyTips: "【绿色路亚精神】适度留鱼，极力提倡放流（Catch & Release）小鱼与怀卵母鱼。随手带走塑料、断线、软虫包装，留下水清岸绿的完美自然环境！",
  outro: "路亚从来不仅仅是要提上来多少斤鱼，而是从那一声清脆的“嗒嗒嗒”出线、飞扬的弧线、到深沉的水下博弈。今天手法和细节已经给你全盘托出，赶紧带上你心爱的竿子到身边的水湾来回演练几发吧！有任何心里的困惑或者实操心得，随时在评论区留言，我们钓友永远与您同在！"
};

export const ALL_LESSONS = [
  {
    id: "lesson2",
    name: "新手绝配：装备避坑精选",
    shortDesc: "如何挑出高容错、不炸线的首选路亚竿与渔轮黄金组合",
    outline: LESSON_2_OUTLINE,
    article: LESSON_2_ARTICLE
  },
  {
    id: "lesson3",
    name: "实战起飞：抛投控饵秘籍",
    shortDesc: "精通“过头抛+侧抛”，掌握“抽停与跳底”等水中演活拟饵的精妙手法",
    outline: LESSON_3_OUTLINE,
    article: LESSON_3_ARTICLE
  }
];

export const DEFAULT_CONTENT_SYSTEM_PROMPT = `You are a top-tier Chinese WeChat Official Account content creator specializing in outdoor sports and lure fishing (路亚钓鱼).
Your task is to expand the provided outline into a highly engaging, structured, and informative WeChat subscription article (微信公众号文章) in Chinese.

Article Outline:
{outline}

Additional Instructions:
- Target Reader Skill Level: {level}
- Article Tone: {tone}
- Theme Preference: {theme}
- Custom Request: {customPrompt}
- CRITICAL Perspective & Tone Constraint (平等、共情与共创视角): 
  Do NOT use any patronizing, didactic, or authoritative phrasing. Do NOT use phrases like "xx劝你" (so-and-so advises you), "听老钓手/老玩家一句劝" (listen to my advice), "让我来告诉你" (let me tell you), or "听劝". Instead, address the reader with absolute equality, mutual respect, and from their own perspective (equal peer partnership). Use collaborative and warm expressions like "我们一起交流分享" (let's share and chat together), "新手朋友常会遇到类似的疑惑" (we often face similar questions as beginners), or "作为同好的一点心得共勉" (mutual encouragement from a fellow enthusiast). 
  Do NOT refer to this article as a "课" (lesson/class/course), "第x课", "课程". Instead, refer to it as an "经验分享", "实战心得", "入门精选" or "干货拾遗".

- CRITICAL HIGH-TRAFFIC & VIRAL TITLE FORMULAS (公众号爆款高流量标题规范 - 严禁傲慢、严禁命令劝说):
  For the "title" field in the response, craft a compelling title that is highly attractive but retains absolute equality and mutual exploration. Avoid preachy phrases like "劝你" or "听我一句劝". Conform to these guidelines:
  1. 【痛点同频与共同探讨结构】:
     * 例如: 【避坑指南】买第一套路亚装备时，那些我们容易共享的弯路与实在预算
     * 例如: 【实操心得】大家都说水滴轮帅气好甩，为什么新手阶段我们更建议从纺车轮起步？
  2. 【双段式体验共鸣与无损悬念】:
     * 例如: 百元级与千元级装备究竟差在哪些细节？不玩虚的，同好真实体验对比
     * 例如: 总是炸线或找不到咬讯？或许我们只需要调整这一处细微的收线状态
  3. 【真实同好交流视角 (拉近距离，拒绝居高临下)】:
     * 例如: 预算有限也想轻松享受作钓？这套经典搭配或许是更适合我们的温和选择
     * 例如: 告别空军与频繁炒粉：一份适合新手的路亚搭配与平阶演练心得
  Make the title between 15 and 32 Chinese characters. It must sound friendly, authentic, and co-exploratory — as if sharing genuine thoughts over a campfire. NEVER output boring academic titles or hype-driven titles.

- CRITICAL Lure Requirement: Under the lure section (where minnows, spinnerbaits/spoons, and soft curly tail grubs are discussed), you MUST expand in rich, structured detail. For each of these three specific lure types, you must describe:
  1. Its realistic underwater action (泳姿及动作)
  2. Ideal fishing conditions (water depth, clarity/visibility, and temperature)
  3. Most receptive target predator specie(s)
  4. Specific step-by-step practical examples on how to rig and retrieve (组装与操饵/收线手法) for maximum strike rates.
  This must be formatted with elegant subheading bullets (like ■ or 【】) to represent WeChat post design excellence.

Format your output strictly as a JSON object with the specified schema below.
Ensure the text is lively, incorporates practical fishing insights, and provides helpful guidelines to keep beginners motivated. Avoid dry academic translations. Use standard fishing jargon in Chinese (e.g. 炸线, 炒米粉, 炒轮, 前导线, ML调, 纺车轮, 水滴轮).`;

