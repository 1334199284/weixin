import { useState } from "react";
import { Fish, BookOpen, Layers, Zap, AlertCircle, RefreshCw, Compass } from "lucide-react";
import { motion } from "motion/react";
import EditorSettings from "./components/EditorSettings";
import WeChatPreview from "./components/WeChatPreview";
import { GenerationSettings, WeChatArticle } from "./types";

const INITIAL_ARTICLE: WeChatArticle = {
  title: "【避坑指南】路亚新手首套装备怎么选？ML直柄竿+纺车轮，带你轻松入门！",
  subtitle: "拒绝交学费、告别炸线炒粉！资深钓友手把手教你配齐路亚第一套黄金装备。",
  intro: "嘿！各位钓友，我是你们在“鱼佬圈”的老伙计 LEG。很多人刚入坑就满腔热血买了一堆拉风装备，结果下水没抛两下就疯狂炸线，只能坐在岸边绝望地解线，玩两次就气得直接退坑。其实，路亚是非常解压好玩的，只是你们走错了第一步！今天LEG就带大家拆解一套“极高容错、闭眼不踩雷”的黄金基础装备，让你轻松起航！",
  sections: [
    {
      id: "rod",
      title: "01 基础装备：路亚竿（首选直柄竿，ML或M调）",
      subtitle: "新手黄金起步杆，泛用性与感知手感的完美桥梁",
      paragraphs: [
        "很多刚入行的朋友觉得手持枪柄钓竿配上水滴轮，往岸边一站帅气拉风，逼格直接拉满。但作为老钓手，鱼佬圈 LEG必须兜头给你泼一盆冷水——如果控制不好线杯转速，十发九中你会遇到疯狂缠线的噩梦（咱们戏称为“炒米粉”）。",
        "听LEG劝，你的第一支生命之竿，强烈建议无脑选用【直柄路亚竿】！直柄竿配上纺车轮，其超高的抛投与出线容错率是让你不至于在第一天就崩溃退坑的底线。先能顺利把假饵扔出去，你才谈得上逗鱼和爆护，对吧？",
        "在竿子硬度也就是调性选择上，LEG推荐直接选【ML调（中偏软）】或者【M调（中等）】的泛用竿。这个规格对拟饵克重的兼容性极强，不论是丢几克重的小亮片，还是甩十几克的小米诺，腰力上都绰绰有余，而且水底的一草一木甚至鱼嘴的轻轻吸啄都能极敏锐地传递给你的手心。"
      ],
      proTips: "买竿时优先买两节插节式钓竿，便于携带。且买碳素含量在90%以上的，腰力充足，感知极其灵敏！"
    },
    {
      id: "reel",
      title: "02 稳健运转：纺车轮（推荐2000-2500型浅线杯）",
      subtitle: "出线零阻碍，彻底告别“炒粉”炸线尴尬",
      paragraphs: [
        "竿子既然定了直柄，那它的天生贵人【纺车轮】就必须紧随其后。纺车轮的出线原理是螺旋状自然脱出，完全依赖假饵飞行拉扯渔线，这在物理上就彻底消除了任何摩擦或失控逆转，可以说是真正的“炸线杀手”。",
        "它就像汽车里的自动挡，你只需要打开线挡，手指松开顺势一甩，就可以优雅地看着拟饵划出完美的抛物线。哪怕你是第一天摸路亚，也完全不用担心遇到线轴反卷。如果你用纺车轮还能炸得一塌糊涂，LEG只能建议多看两遍教学，或者来讨论区找我领罚了！",
        "新手挑轮子，建议闭眼入 2000型 或 2500型 的【浅线杯】。它的重量极其迎合ML竿的重心平衡，拿在手里很轻巧，甩一整天胳膊也不会酸。更棒的是，浅线杯不需要缠太多无用的底线，直接上百米PE线，抛投效率和手感最佳。"
      ],
      proTips: "每次作钓结束回家后，建议用清水冲洗主轴和轴承处，甩干水滴并点一滴润滑油，以持续保持纺车轮润滑无声的丝滑手感！"
    },
    {
      id: "line",
      title: "03 隐形桥梁：主线（PE编织线） + 前导线（碳素线）",
      subtitle: "双线黄金搭档，兼顾拉力强度与水中完美隐蔽",
      paragraphs: [
        "主线是连接猎物的黄金纽带。新手的主线建议直接选用四编或八编的【PE编织线（0.8号或1.0号）】。PE线没有弹性，拉力极强，而且线径细能甩得更远，能将水下轻微的鱼口颤动瞬间百分百无损传递到你的指尖。",
        "为了防磨和隐形，你必须在前端绑一截一米左右的【碳素前导线】。碳素线耐磨防划，可以肆无忌惮地在枯木烂石树桩堆里投，而且最奇妙的是，碳素线在水中的折射率极其接近水，近似全隐形！这样那些老油条大鱼就会放松警惕，一口闷吞！",
        "不管是重障碍区打黑鱼，还是开阔水域追翘嘴，有了碳素外挂加码，至少在对线野生巨物时，能保你的主线绝不英年早断！多在家里练习打结绑法（如简易FG结或双套结），熟能生巧，这也是通向爆护极品男人的第一课。"
      ],
      proTips: "主线与前导线的连接推荐使用“简易FG结”或“双套结”。虽然新手学习打结有点繁琐，但在搏击大翘嘴时，它能让你避免断线切线的遗憾！"
    },
    {
      id: "lures",
      title: "04 致命诱惑：三大新手核心拟饵（米诺、亮片与卷尾软虫）",
      subtitle: "两硬一软黄金战术组合，全水层覆盖应对不同钓况",
      paragraphs: [
        "拟饵是路亚钓鱼的灵魂，不同的设计能够模仿不同水层和状态的小型生物。对于新手而言，市面上眼花缭乱的拟饵极易让人产生选择焦虑。其实，在入门阶段，你的假饵盒里只需要备齐三大经典款：经典硬饵【米诺】、全能广域搜索的金属【亮片】、以及主打伏击重障碍区底栖鱼类的【卷尾蛆软虫】。这三款主流设计已经足以帮你全方位覆盖不同水深、光照和目标钓况。",
        "在实战操控上，硬饵米诺适合在清澈的中上层水体通过“慢收、重刮、轻停顿”诱引黑鲈和翘嘴；金属亮片适合在浑浊未知的深水通过持续在底卷线来感知鱼讯、防拧阻滞；而卷尾蛆配上铅头钩或德州钓组，则是面对低温、低活性底栖鳜鱼和黑鱼的“终极大招”，通过轻挑抬竿逗底实现水下极富动感的生命展现。掌握这两硬一软三种基础操控手法，就能在全自然水域开启轻松爆护之旅。",
        "这也是鱼佬圈 LEG极力推荐新手使用的“空军绝杀秘籍”。卷尾蛆在水底一蹦一跳尾巴摇摆个不停，哪怕平时不怎么有活力的那些底栖鳜鱼、鲇鱼也顶不住这波纯纯的生理挑逗，会一咬咬个死，绝对是居家开荒神器！"
      ],
      proTips: "新手在有枯树枝、乱石、死桩等超复杂重组结构区作钓时，极容易挂底丢饵。推荐把铅头钩换成防挂效果极佳的【德州钓组（子弹铅 ✕ 挡珠 ✕ 宽腹曲柄钩）】，配上双尾小虾或卷尾蛆，钩尖藏在虫体内，防挂底通过性极佳，直捣黑鱼巢穴！"
    },
    {
      id: "accessories",
      title: "05 必备配件：路亚钳、控鱼器与偏光镜",
      subtitle: "安全垂钓的刚需，保护爱鱼更保护我们自己",
      paragraphs: [
        "太多新手出门极其随性，连把钳子都不带，等费尽力气把一头十斤重的大鳜鱼大翘嘴遛到岸边，才发现自己根本没办法把深吞的鱼钩拔出来。你敢直接用手去伸进那布满锋利倒刺和牙齿的鱼嘴吗？稍微甩个头，你心爱的假饵和锋利的三叉钩就会挂在你的皮肉上，教你瞬间明白肉痛的真谛！",
        "在鱼佬圈，【路亚钳】和【控鱼器】是人人随身佩戴的“安全双骄”。控鱼器能死死锁住大鱼下颌免受甩尾误伤，路亚钳不仅能让你快速开环换假饵，更能安全、干净利落地摘掉深喉鱼钩，让你在岸边举止体面，宛如一个优雅的牙医总监。",
        "最后，LEG强烈推荐购买一副帅气的【偏光太阳镜】。这不仅仅是为了在拍照发朋友圈时像一个老练的职业钓手，它能帮你彻底过滤掉刺眼的水波反射，能让你在晴天清楚看清水面下的暗草、杂石甚至是黑鱼产卵形成的黑色鱼影，简直就像物理透视外挂，安全实用两不误！"
      ],
      proTips: "钓鱼安全最重要！甩竿前，请务必回头看一下方圆两三米内是否有行人或钓友，保护自己也为他人负责。"
    }
  ],
  safetyTips: "【绿色路亚精神】适度留鱼，鱼佬圈 LEG极力提倡放流（Catch & Release）小鱼与怀卵母鱼。随手带走垃圾，不乱丢塑料软饵，保持好水土。抛投作钓时注意周围环境，时刻戴好帽子与偏光镜，遮盖钩尖安全为主！",
  outro: "路亚钓法是一场与自然斗智斗勇的体育运动，选对第一套入门级装备，能让你少走大半年弯路。如果你已经按捺不住想要爆护的心，快配齐这套极简装备出发吧！如果你还在犹豫哪款轮子更滑，或者对编织线号存有疑问，随时在评论区留言给LEG，我们钓友们一起探讨！"
};

export default function App() {
  const [settings, setSettings] = useState<GenerationSettings>({
    outline: `第二课：装备入门——选对工具事半功倍
基础装备：路亚竿（推荐直柄竿，ML或M调泛用性强）、渔轮（新手首选纺车轮，不易炸线）、钓线（PE线搭配碳素前导线，兼顾强度与隐蔽性）。
核心消耗品：拟饵的种类与选择（硬饵如米诺、亮片，软饵如卷尾蛆等）。
必备配件：路亚钳、控鱼器、偏光镜等。`,
    theme: "green",
    level: "Beginner",
    tone: "Friendly",
    customPrompt: "加入更多避坑防炸线小窍门，提醒保护大自然。"
  });

  const [article, setArticle] = useState<WeChatArticle>(INITIAL_ARTICLE);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const handleUpdateArticle = (updated: WeChatArticle) => {
    setArticle(updated);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorText(null);
    try {
      const res = await fetch("/api/generate-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        throw new Error(`请求服务器失败: ${res.statusText}`);
      }

      const data = await res.json();
      if (data.title && data.sections) {
        setArticle(data);
      } else {
        throw new Error("AI 返回的数据包含未知的结构，请稍后重试");
      }
    } catch (e: any) {
      console.error(e);
      setErrorText(e.message || "请求 AI 服务失败，请重试");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Editorial Header */}
      <header className="bg-white border-b border-gray-100 py-6 px-8 shrink-0 relative overflow-hidden">
        {/* Subtle decorative background water patterns */}
        <div className="absolute top-1/2 right-10 -translate-y-1/2 opacity-5 pointer-events-none">
          <Fish className="h-48 w-48 text-emerald-800" />
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Fish className="h-6 w-6 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 tracking-tight">微信公众号文章排版与生成器</h1>
              <p className="text-xs text-gray-500">
                专为路亚初学者定制的《第二课：装备入门》公众号图文极速设计工具
              </p>
            </div>
          </div>

          <div className="flex gap-2 text-xs text-gray-500 bg-gray-100 p-2 rounded-lg items-center">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>智能排版引擎 & 微信剪贴盘已就绪</span>
          </div>
        </div>
      </header>

      {/* Main Content Layout Grid */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column Config Settings Form: 5 slots */}
        <div className="lg:col-span-5 h-full space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <EditorSettings
              settings={settings}
              onChange={(updates) => setSettings(p => ({ ...p, ...updates }))}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          </motion.div>

          {/* Prompt tips card for lure creators */}
          <div className="bg-emerald-500/5 text-emerald-900 border border-emerald-500/10 p-5 rounded-2xl text-xs space-y-2.5 leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800">
              <Compass className="h-4 w-4" />
              <span>为什么用它排版更懂读者？</span>
            </div>
            <p>
              传统的公众号推文，大段的纯 Markdown 很容易让新手眼花甚至炸裂。
              本排版器不仅支持 <b>AI 全自动内容扩写</b>，而且会按照公众号排版规则：
              <b>彩色醒目标签、斜体导言、亮色背景框（Pro tips）</b> 进行分层优化。
            </p>
            <p className="text-11px text-emerald-700 font-medium">
              💡 小提示：你可以试着在左侧修改大纲信息，添加特定型号，然后点击一键 AI 重写文章。
            </p>
          </div>

          {errorText && (
            <div className="bg-red-50 border border-red-100 text-red-800 rounded-xl p-4 flex gap-2.5 items-start text-xs leading-normal">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold mb-0.5">生成文章时遇到了一个问题</strong>
                <span>{errorText}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column Preview Panel Container */}
        <div className="lg:col-span-7 flex flex-col h-full">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex-1"
          >
            <WeChatPreview
              article={article}
              themeId={settings.theme}
              onUpdateArticle={handleUpdateArticle}
            />
          </motion.div>
        </div>

      </main>

      {/* Footer copyright */}
      <footer className="bg-white border-t border-gray-100 py-6 text-center text-xs text-gray-400 shrink-0">
        <p>© 2026 微信公众号助手. 基于首套容错极高直柄 ML 双节竿设计，选对工具事半功倍</p>
      </footer>
    </div>
  );
}
