import { WeChatArticle } from "../types";

export interface LessonPreset {
  id: string;
  name: string;
  shortDesc: string;
  outline: string;
  article: WeChatArticle;
}

export const LESSON_2_OUTLINE = `装备选购指南——选对工具事半功倍
基础装备：路亚竿（推荐直柄竿，ML或M调泛用性强）、渔轮（新手首选纺车轮，不易炸线）、主线与前导线配置选择。`;

export const LESSON_2_ARTICLE: WeChatArticle = {
  title: "【避坑指南】选对第一套路亚竿线轮：适合咱们起步的泛用组合推荐",
  subtitle: "告别频繁炸线！咱们一同聊透第一套合适、顺手的黄金搭配。",
  intro: "哈罗，各位路友！我是咱们【鱼佬圈】的LEG。在刚接触路亚或者去新钓位时，我们难免会对竿、线、轮的使用感到疑惑。很多人买了一堆酷炫装备，结果下水抛两下就遭遇频繁炸线，只能耐着性子在岸边解线，确实很影响兴致。其实路亚特别让人松弛、解压，今天LEG就和各位同好一起，从最贴合咱们起步实操的角度，聊聊这套“极其温和、高容错”的黄金基础装备，能闭眼上手、越钓越顺手！",
  sections: [
    {
      id: "rod",
      title: "01 基础装备：路亚竿（直柄竿，ML或M调）",
      subtitle: "泛用性与感知手感的巧妙平衡，咱们的得力帮手",
      paragraphs: [
        "刚接触路亚时，有些朋友可能会觉得手持枪柄钓竿配上水滴轮非常帅气。但如果刚开始还不太习惯控制线杯转速，出线时稍有不慎就容易遇到线轴反卷缠绕的困扰（也就是我们常说的“炒米粉”）。",
        "在实际尝试中，大家可以优先考虑【直柄路亚竿】。直柄竿配合纺车轮，其出线容错率高、抛投上手快，能大大平复我们在练习期的焦虑心态。做到能顺利稳定地将拟饵抛投出去，咱们才有信心 and 兴趣在水面去开展后续的各种探寻，对吧？",
        "在竿子硬度（调性）选择上，建议多关注【ML调（中偏软）】或者【M调（中等）】的泛用竿。这个规格对拟饵克重的兼容性特别强。不论是丢几克重的小亮片，还是甩十几克的小米诺，它的腰力回弹都恰到好处，能精准地把水底的细腻反馈传递回咱们指尖。"
      ],
      proTips: "竿子选择时优先考虑两节插节式，这样我们出行携带会方便很多。选择碳素含量在90%以上，能帮我们更清晰地感知水下微小的咬讯 and 暗草碰撞手感！",
      imagePrompt: "lure fishing casting rod"
    },
    {
      id: "reel",
      title: "02 稳健运转：纺车轮（推荐 2000-2500型 浅线杯）",
      subtitle: "出线阻力低，稳妥告别炸线炒粉烦恼",
      paragraphs: [
        "竿子既然定了直柄，那它的好搭档【纺车轮】也就自然到位了。纺车轮的出线原理是螺旋状自然脱出，完全依靠拟饵飞行的重力拉扯渔线向前。在物理层面上它不容易产生主轴逆转抓线，可以说是大家的“避风港”。",
        "它在操作上轻松简便，只要打开线挡，手指扣住线轻轻一甩，就能看到拟饵在空中画出漂亮的弧线而稳稳落水。即使是起步摸索阶段，也省去了总得小心控线轴的麻烦。这能让我们把注意力更专一地放在观口 and 选点上。",
        "在渔轮规格方面，推荐首选 2000型 或 2500型 的【浅线杯】纺车轮。这类中轻型轮子跟ML调或M调的直柄竿搭配起来，手感重心恰到好处，整套装备拿在手里十分轻巧，挥舞一整天手腕也不会感到沉重酸痛。同时，浅线杯不需要缠过多的底线，出线和收线都更加顺畅。"
      ],
      proTips: "作钓结束后，建议咱们用干净的常温淡水冲洗主轴等关键缝隙，晾干后可以滴上一两滴润滑保养油，长久维持顺滑的出线与转动质感！",
      imagePrompt: "lure spinning reel 2000"
    },
    {
      id: "line",
      title: "03 隐形桥梁：主线（PE编织线） + 前导线（碳素线）",
      subtitle: "双线黄金搭档，兼顾拉力强度与水中完美隐蔽",
      paragraphs: [
        "主线是连接咱们和水下鱼儿最直接的纽带。在新手阶段，咱们的主线建议直接考虑选用四编或八编的【PE编织线（0.8号或1.0号）】。PE线没有弹性，拉力极强，而且线径细能甩得更远。",
        "为了应对下潜处的乱石、硬障碍防划和实现水中的完美隐身，建议大家千万要在前端绑定一截一米左右的【碳素前导线】。碳素线耐磨防划性能绝佳，可以让我们在水底枯木、乱石堆等重障碍区域更为从容。"
      ],
      proTips: "主线与前导线的连接掌握好“双套结”或“简易FG结”。虽然连结前导线刚上手有些考验精细手感，但在遭遇碎石磨洗或大个体疯狂洗鳃挣扎时，它绝对能给咱们十足的防切线保障！",
      imagePrompt: "braided fishing line"
    },
    {
      id: "lures",
      title: "04 新手探路：精选假饵（亮片、米诺与卷尾软虫组合）",
      subtitle: "极简三剑客，涵盖不同水层与活性探查",
      paragraphs: [
        "有了竿线轮，咱们就可以在收条路亚包里安排这三款经典好使、容错率超强的看家拟饵了。首先是【旋转亮片（Spoon）】。亮片对操作手法要求最少：扔出去匀速收回，它在水里旋转闪烁出的光芒和震动便能吸引活性极高的翘嘴、马口。这也是绝好的探水、探点工具。",
        "其次是浅水层的【米诺（Minnow）】。米诺自带塑料舌板，匀速慢收时能扭动身姿，稍微抽一下竿梢还会呈现重心失调的濒死游姿，非常适合在清澈、开阔的表层狙击攻击欲望满满的黑鱼、鲈鱼。只要把握好简单的抽停节奏，大鱼很难抵挡这份诱惑。",
        "最后是【卷尾蛆软虫搭配铅头钩 (curly tail grubs & jig heads)】。用软虫配铅头钩是我们了解水深、感知底层活性、针对底层鱼群（如鳜鱼、鲶鱼）的可靠极佳手段。卷尾软虫在水底匀速摇摆着小尾摆，即使鱼活性不高，也会被它自然的生物动态勾起探索意向。希望大家通过对这三款基础饵的练习，能够慢慢建立起对水层与控饵的细腻手感。"
      ],
      proTips: "在水底枯树枝、乱石等容易挂钩的重障碍区域，我们可以把铅头钩更换成极佳防挂底的【德州钓组】。把钩尖巧妙隐藏在软虫体内，可以让拟饵在错落有致的废弃树枝中顺畅滑行，大大降低丢饵概率！",
      imagePrompt: "lure lures soft grubs hooks"
    },
    {
      id: "accessories",
      title: "05 效率配件：路亚钳、控鱼器与偏光镜",
      subtitle: "安全护航与便捷摘钩，享受舒心规范的钓游体验",
      paragraphs: [
        "有时候大家出门可能只带了竿子，等好不容易把一尾大鱼遛到跟前，才惊觉由于鱼吞钩过深，根本没办法空手安全解开。如果直接用手指伸去拿，不仅不方便，也极其容易在鱼甩尾挣扎时被尖锐的三叉倒刺误伤皮肉。这不仅扫兴，也会产生不小的安全隐患。",
        "在熟络的同好包里，【路亚钳】和【控鱼器】往往是不可或缺的便携组合。控鱼器能安全稳固地锁定大鱼的下颌，而多用途的路亚钳则能快速开双环、快速给吞饵较深的大鱼干净利落地摘掉钩子，保持咱们整个作钓和放流的过程都舒心而安全。",
        "此外，还推荐大家出门配戴一副【偏光镜】。这不仅仅能帮助我们在烈日下抵御刺眼的水面杂光反射、保护视力，更神奇的是它能帮我们看清水下模糊的暗草、深浅错落石块甚至鱼身暗影，让我们在抛投定位时能多一份了解与踏实。"
      ],
      proTips: "钓友安全永远第一！在挥竿前，一定要习惯性地回头观察身后方圆数米内是否有人通行，安全规范挥竿是咱们共同享受这一爱好的美好前提！",
      imagePrompt: "fishing pliers grip glasses"
    }
  ],
  safetyTips: "【绿色路亚精神】适度留鱼，极力提倡爱护生态，对小体型及怀卵母鱼主动放流。随手顺带走身边的塑料纸壳、断线及软虫胶带包装，将干净的水清绿岸留给未来。抛投作钓时多留意周围，戴好帽子眼镜安全第一！",
  outro: "路亚更像是一场舒心的体育运动。选对了入门的泛用装备，能叫咱们少走很多不必要的弯路。如果您最近也有升级装备或初尝路亚的打算，咱们不如带上心爱的竿子 and 这一套极简装备共同去附近的钓点试一试！如果在轮子大小或者线号搭配上还有新的念头，欢迎随时在文章后方交流探讨，咱们共同精进！"
};

export const LESSON_3_OUTLINE = `实战技巧精进——扎实起步，循序渐进
抛投技巧：安全与精准并重。重点练习过头抛（适合开阔水域）和侧抛（适合障碍物环境），新手切忌暴力抛投。
控饵手法：通过快收线、抽停结合、跳底慢拖等“视觉与触觉骗术”，模仿猎物动态。`;

export const LESSON_3_ARTICLE: WeChatArticle = {
  title: "【新手必看】路亚抛投控饵全攻略！两招过海，手法拉满，轻松撬开巨物鱼嘴！",
  subtitle: "解锁过头抛与侧抛两项核心姿势，依靠抽停、跳底等视觉骗术，不做岸边解线狂人！",
  intro: "嘿，各位深爱着水边的路友，我是你们的老友LEG！咱们上一步刚刚精选配齐了一套极其省心抗炸的黄金直柄装备，今天咱们终于迎来了路亚最好玩、最热血的时刻——下水实战！很多新手兴冲冲刚到岸边，抛两下就切线挂底，难免有些失落。今天LEG就带大家拆解两项最重要的基本功——抛投和控饵。只要掌握这两项，新手也能让拟饵在水中更自然，慢慢提升中鱼率。",
  sections: [
    {
      id: "casting",
      title: "01 抛投技巧：安全与精准并重（开阔过头抛 ✕ 障碍侧平抛）",
      subtitle: "重心后蓄力顺势释放，好落点让钓况事半功倍",
      paragraphs: [
        "第一招也是最稳固的基础是【过头抛（Overhead Cast）】。抛投前留出10-15公分的前导线，将竿子举过肩膀，使假饵呈钟摆状静止。抛投时由大臂带动小臂，最后利用手腕自然释放，让竿身充分完成回弹。拟饵会沿着稳定的抛物线飞向目标，而不是靠蛮力“甩”出去。在钟表大约十点钟的位置松开食指，拟饵就能顺着极其精准的笔直轨迹划过长空。这一招是开阔水体进行大范围定位搜索的绝佳选择！",
        "而一旦当你走到岸边树林、枯生灌木堆、或是浮萍密布的重障碍区时，过头抛就会被树梢勾死。此时你必须使用【侧抛（Side Cast）】。通过水平或斜向摆动钓竿，让假饵贴着水面实现精准平射飞入树荫根部。侧抛由于飞行曲线极低，不容易被空中风势吹偏，且假饵落水的水花极其柔和。落水声音更轻，更适合惊扰较小的目标鱼。",
        "咱们在练习抛投时，真正的发力来自竿身的弹性，而不是手臂用力挥甩。整个动作以身体、手臂和手腕自然连贯完成，最后由手腕轻轻释放力量即可。很多新手一开始喜欢用蛮力猛甩，结果不仅距离没有增加，还容易炸线、挂树甚至损伤装备。过度的蛮力不仅容易损坏竿子，更容易因瞬间失速导致缠线“炸粉”，极度影响咱们的钓鱼心情。"
      ],
      proTips: "钓鱼安全永远最大！抛竿前请100%回头，确认方圆2米没有行人或钓友！同时出线落水前一瞬间，用手指轻轻抚控线杯边缘进行手动微制动，能让拟饵落水声音极其微弱，大大提升鳜鱼或黑鱼的咬钩概率！",
      imagePrompt: "lure fishing casting technique"
    },
    {
      id: "actions",
      title: "02 控饵手法：快收、抽停、跳底等“视觉与触觉骗术”",
      subtitle: "模仿重伤小鱼与底栖活饵的挣扎，激起潜伏巨物的疯咬本能",
      paragraphs: [
        "路亚最大的魅力，就是让拟饵“活”起来。假饵落水只是第一步，收线控饵才是让木头 and 塑料变成活物的终极灵魂！首推招式是【快慢收线 ✕ 抽停结合】。当你甩出硬饵米诺或金属亮片时，收线几圈，手腕猛一“抽”钓竿顶端，然后再瞬间停顿半秒钟。在突然抽动的力量下，水中的米诺会像一只受到极度惊吓、游得左摇右摆、身负重伤的小鱼。很多鲈鱼都会选择在停顿的一瞬间发动攻击，因此停顿往往比连续收线更容易迎来咬口。",
        "而如果此时你处于温度低、气压闷、鱼活性低的时刻，那就要派上深入底栖活动的经典技巧——【跳底慢拖（Jigging & Crawling）】。使用德州钓组或铅头钩挂卷尾蛆，让其充分沉底。每次轻轻挑离底部约10厘米左右，再缓慢收紧余线，让拟饵自然回落。保持线始终略微绷紧，才能第一时间感受到轻微的咬口。这时候可一定要集中注意力，一旦有细微咬讯传来就可沉稳操作。",
        "在水中演好这场欺骗大鱼智商的戏法并不困难，核心要领就是：不要匀速死板收线！通过有规律的轻挑、重抖、短暂停歇，在水底给那些鱼儿带来最富真实感的视觉暴击。你不仅要做文章的读者，更要做拟饵在水深处的导演！"
      ],
      proTips: "控饵时主线必须时刻处于拉紧微张的状态，这样鱼嘴轻轻碰饵的震动才能瞬间透过PE线送达您的竿柄。当感觉到明显的顿口、重量变化或主线异常移动时，应迅速扬竿刺鱼，动作干脆有力即可，不必刻意用尽全力。轻轻一个提刺，就能让鱼钩稳稳打穿，避免因动作猛烈导致鱼嘴被拉豁或断线爆竿。",
      imagePrompt: "lure fish retrieve action detail"
    }
  ],
  safetyTips: "【绿色路亚精神】适度留鱼，极力提倡放流（Catch & Release）小鱼与怀卵母鱼。随手带走塑料、断线、软虫包装，留下水清岸绿的完美自然环境！",
  outro: "路亚的乐趣，从来不只是鱼获本身。每一次精准的抛投、每一次拟饵在水中的动作、每一次突然传来的咬口，都值得慢慢体会。希望今天分享的技巧，能帮助大家少走一些弯路，在下一次出钓时收获更多乐趣。如果还有想了解的内容，欢迎留言交流，我们水边见！"
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
You MUST write as the persona of "LEG", a close friend and fellow enthusiast on the road, publishing on your WeChat Official Account "鱼佬圈".

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

- CRITICAL Lure Fishing Action Realism Rules (极致真实路亚核心动作规范 - 严禁夸大、必须专业严谨):
  1. 【抛投动作规范】: 必须描述“抛投时由大臂带动小臂，最后利用手腕自然释放，让竿身充分完成回弹。拟饵会沿着稳定的抛物线飞向目标，而不是靠蛮力‘甩’出去。”真正的发力来自竿身的弹性，整个动作由身体、手臂和手腕自然连贯完成，杜绝蛮力猛甩。
  2. 【侧抛落水声响】: 侧抛的落水水花应描述为“落水声音更轻，更适合惊扰较小的目标鱼”，严禁使用“毫无声息”或夸张修辞。
  3. 【控饵魅力与停顿】: 必须使用“路亚最大的魅力，就是让拟饵‘活’起来”这类自然表达。描述抽停时，要讲明“很多鲈鱼都会选择在停顿的一瞬间发动攻击，因此停顿往往比连续收线更容易迎来咬口”，避免绝对、太绝对化的统计口吻（如“九成以上”）。
  4. 【跳底慢拖要领】: 描述跳底手法时，应准确写为“每次轻轻挑离底部约10厘米左右，再缓慢收紧余线，让拟饵自然回落。保持线始终略微绷紧，才能第一时间感受到轻微的咬口。”
  5. 【扬竿刺鱼力度】: 杜绝描述为“大力扬竿”或“大力刺鱼”。必须描述为：“当感觉到明显的顿口、重量变化或主线异常移动时，应迅速扬竿刺鱼，动作干脆有力即可，不必刻意用尽全力（避免因动作猛烈导致鱼嘴被拉豁或断线爆竿）。”
  6. 【文章正能量收尾】: 文章结尾风格必须升华为：“路亚的乐趣，从来不只是鱼获本身。每一次精准的抛投、每一次拟饵在水中的动作、每一次突然传来的咬口，都值得慢慢体会。希望今天分享的技巧，能帮助大家少走一些弯路，在下一次出钓时收获更多乐趣。如果还有想了解的内容，欢迎留言交流，我们水边见！”

Format your output strictly as a JSON object with the specified schema below.
Ensure the text is lively, incorporates practical fishing insights, and provides helpful guidelines to keep beginners motivated. Avoid dry academic translations. Use standard fishing jargon in Chinese (e.g. 炸线, 炒米粉, 炒轮, 前导线, ML调, 纺车轮, 水滴轮).`;
