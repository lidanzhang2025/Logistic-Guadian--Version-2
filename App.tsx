
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Box, 
  FileText, 
  MessageSquare, 
  AlertTriangle, 
  AlertOctagon,
  ChevronRight, 
  Zap, 
  Ship, 
  Truck, 
  CheckCircle2, 
  Cpu, 
  Terminal, 
  Search, 
  Database, 
  BrainCircuit, 
  Award, 
  TrendingUp, 
  RefreshCw,
  Power,
  Activity,
  Orbit,
  Wind,
  Volume2,
  VolumeX,
  Sparkles,
  BarChart3,
  Dna,
  ShieldCheck,
  Siren,
  Factory,
  ArrowRight,
  Scan,
  Binary,
  Share2,
  Copy,
  Check,
  Play,
  Square,
  Loader2
} from 'lucide-react';
import { GoogleGenAI, Modality } from "@google/genai";

// --- 音频解码工具函数 ---
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodePCMToAudioBuffer(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// --- 高科技音效引擎 ---
class CyberSoundEngine {
  private ctx: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private cache = new Map<string, AudioBuffer>();
  private preloading = new Map<string, Promise<void>>();

  private init() {
    if (!this.ctx) this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  stopAll() {
    if (this.currentSource) {
      try { 
        this.currentSource.onended = null;
        this.currentSource.stop(); 
      } catch (e) {}
      this.currentSource = null;
    }
  }

  playClick() {
    const ctx = this.init();
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.type = 'sine'; osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.1);
  }

  playClack() {
    const ctx = this.init();
    const bufferSize = ctx.sampleRate * 0.02; const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0); for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource(); noise.buffer = buffer;
    const filter = ctx.createBiquadFilter(); filter.type = 'bandpass'; filter.frequency.value = 1200;
    const gain = ctx.createGain(); gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);
    noise.connect(filter); filter.connect(gain); gain.connect(ctx.destination); noise.start();
  }

  playScan() {
    const ctx = this.init();
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(40, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 1);
    const filter = ctx.createBiquadFilter(); filter.frequency.value = 1000;
    gain.gain.setValueAtTime(0.05, ctx.currentTime); gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
    osc.connect(filter); filter.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 1);
  }

  playSuccess() {
    const ctx = this.init();
    [440, 554.37, 659.25, 880].forEach((freq, i) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'triangle'; osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + i * 0.1 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      osc.connect(gain); gain.connect(ctx.destination); osc.start(ctx.currentTime + i * 0.1); osc.stop(ctx.currentTime + 0.8);
    });
  }

  // 预加载音频以实现零延迟播放
  async preloadNarration(text: string) {
    if (this.cache.has(text) || this.preloading.has(text) || !process.env.API_KEY) return;

    const fetchPromise = (async () => {
      const ctx = this.init();
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-preview-tts",
          contents: [{ parts: [{ text: `Say calmly and professionally: ${text}` }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Zephyr' }, 
              },
            },
          },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
          const audioBuffer = await decodePCMToAudioBuffer(
            decodeBase64(base64Audio),
            ctx,
            24000,
            1,
          );
          this.cache.set(text, audioBuffer);
        }
      } catch (e) {
        console.error("TTS Preload Error:", e);
      } finally {
        this.preloading.delete(text);
      }
    })();

    this.preloading.set(text, fetchPromise);
    return fetchPromise;
  }

  async playNarration(text: string, onEnded?: () => void) {
    this.stopAll();
    const ctx = this.init();

    // 如果缓存中已有，立即播放
    if (this.cache.has(text)) {
      const buffer = this.cache.get(text)!;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.onended = () => {
        this.currentSource = null;
        if (onEnded) onEnded();
      };
      source.start();
      this.currentSource = source;
      return;
    }

    // 如果正在预加载，等待预加载完成再播放
    if (this.preloading.has(text)) {
      await this.preloading.get(text);
      return this.playNarration(text, onEnded);
    }

    // 如果既没缓存也没在预加载（极端情况），执行实时生成
    await this.preloadNarration(text);
    return this.playNarration(text, onEnded);
  }

  isCached(text: string) {
    return this.cache.has(text);
  }
}

const sfx = new CyberSoundEngine();

type StageKey = 'SALES' | 'DOCS' | 'RISK' | 'CS';
interface ThinkingStep { status: string; tech: string; }
interface StageConfig { 
  id: number; 
  key: StageKey; 
  title: string; 
  icon: React.ReactNode; 
  heroButtonText: string; 
  completedText: string; 
  techStack: string[]; 
  initialLog: string; 
  thinkingSteps: ThinkingStep[];
  hudTitle: string;
  hudDescription: string;
  nextButtonText: string;
  narration: string;
}

const STAGES: StageConfig[] = [
  { 
    id: 0, 
    key: 'SALES', 
    title: '销售策略 - 合规降本', 
    icon: <Box size={32} />, 
    heroButtonText: '评估合规降本方案', 
    completedText: '降本方案已生成：已激活限量豁免协议，危品费率降低 20%',
    techStack: ['计算机视觉', '多模态合规', '成本模拟'],
    initialLog: "李经理: '老规矩。200箱清洁剂。帮我看看运费能不能再降点。'",
    thinkingSteps: [
      { status: "视觉审计：扫描产品照片，识别内置包装规格为 1.0L 铝瓶...", tech: "计算机视觉" },
      { status: "编码探测：识别 UN 1993 标识及物理包装形态...", tech: "多模态识别" },
      { status: "条款匹配：检索 IMDG 第 3.4 章，判定符合【限量】豁免条件...", tech: "合规引擎" },
      { status: "价格重算：自动扣除危险品附加费 (DG Surcharge)...", tech: "成本优化" }
    ],
    hudTitle: "多模态视觉模型已锁定 ‘降本关键点’：识别到货物为 1L 小包装，自动匹配 IMDG ‘有限数量’(LQ) 豁免条款。",
    hudDescription: "优化结果：免除危品附加费，运费直降 20%，实现利润与合规的双赢",
    nextButtonText: "同步数据至单证",
    narration: "正在执行多模态视觉审计。通过实物图像识别，系统锁定货物为一升铝瓶包装。匹配国际海运危险品规则第三点四章限量条款。决策建议：激活限量豁免协议。预计运费降本百分之二十。合规性验证已通过。"
  },
  { 
    id: 1, 
    key: 'DOCS', 
    title: '单证环节 - 数据清洗', 
    icon: <FileText size={32} />, 
    heroButtonText: '执行 AI 数据清洗', 
    completedText: '数据零差错：已自动修正 21°C/PG II 逻辑冲突，规避海关风险',
    techStack: ['IDP 智能文档', '知识图谱', '自愈算法'],
    initialLog: "IDP 系统警报：检测到 SDS 报告与订舱申报存在数据冲突，闪点参数不一致...",
    thinkingSteps: [
      { status: "IDP 提取：解析 SDS 文本，确认物理特性闪点值为 21°C...", tech: "文档处理" },
      { status: "图谱比对：知识图谱校验“23°C = PG III”规则逻辑冲突...", tech: "知识图谱" },
      { status: "冲突判定：检测到申报数据低报闪点，存在 Packing Group 错误...", tech: "合规审计" },
      { status: "数据自愈：自动重构 Booking Entry，修正为 21°C/PG II...", tech: "自动清洗" }
    ],
    hudTitle: "IDP 知识图谱已完成‘数据逻辑对齐’：自动修正 SDS 闪点与申报等级冲突。",
    hudDescription: "优化结果：实现单证零差错流转，规避 100% 海关逻辑查验风险。",
    nextButtonText: "同步数据至风控",
    narration: "启动单证一致性审计。IDP 引擎检测到 SDS 原始报告与申报报文存在闪点参数冲突。正在调用逻辑知识图谱进行数据自愈。修正完成。当前 Packing Group 已对齐至合规等级，海关查验风险降至最低。"
  },
  { 
    id: 2, 
    key: 'RISK', 
    title: '风控环节 - 安全屏障', 
    icon: <Shield size={32} />, 
    heroButtonText: '激活库区作业重排', 
    completedText: '动态风险阻断：Class 5.1 货车已安全重定向至 Zone B 隔离区',
    techStack: ['物联边缘计算', '隔离矩阵算法', '视觉识别'],
    initialLog: "库区监控：Zone A 正在装载易燃液体 (Class 3)，检测到强氧化剂货车即将驶入...",
    thinkingSteps: [
      { status: "IoT 感知：摄像头识别货车 Class 5.1 标签...", tech: "视觉算法" },
      { status: "隔离匹配：检索 IMDG 禁忌矩阵，确认严禁混存...", tech: "边缘计算" },
      { status: "逻辑拦截：锁定物理闸机，下发【禁止通行】强制指令...", tech: "逻辑重排" },
      { status: "路径重构：指引货车重排至 50m 外的 Zone B 安全区...", tech: "调度引擎" }
    ],
    hudTitle: "IoT 边缘节点已执行‘物理禁忌阻断’：强制拦截 Class 5.1 氧化剂进入 Class 3 区。",
    hudDescription: "防护结果：动态重构库区作业路径，消除重大消防安全隐患。",
    nextButtonText: "同步数据至履约",
    narration: "IoT 边缘感知系统发布预警。监测到五点一类强氧化剂货车即将驶入三类易燃液体作业区。触碰 IMDG 物理禁忌红线。正在执行强制拦截指令。引导货车重排至 B 区安全隔离点。物理风险已阻断。"
  },
  { 
    id: 3, 
    key: 'CS', 
    title: '履约环节 - 韧性保障', 
    icon: <MessageSquare size={32} />, 
    heroButtonText: '激活陆运加速补偿', 
    completedText: '交付时效已通过动态路由升级完成，产线风险解除',
    techStack: ['数字孪生', '预测性仿真', '动态路由'],
    initialLog: "气象预警：台风“烟花”导致母港延误 72 小时，工厂产线面临停工风险...",
    thinkingSteps: [
      { status: "仿真预测：数字孪生预测“Late Arrival > 72h”...", tech: "数字孪生" },
      { status: "动态路线优化：替代原定‘驳船+集卡’多式联运链路，激活‘VIP集卡直提’抢时方案。", tech: "动态路由" },
      { status: "韧性校核：重计算交付节点，时效成功追回 60 小时...", tech: "时效对冲" },
      { status: "执行同步：派车指令已下发，VIP 车队已就位...", tech: "实时履约" }
    ],
    hudTitle: "数字孪生引擎已激活‘时空对冲协议’：切换至 VIP 陆运补偿路径，绕过台风延误。",
    hudDescription: "履约结果：交付确定性追回 60 小时，成功解除客户停产危机。",
    nextButtonText: "生成最终守护报告",
    narration: "数字孪生引擎正在进行时空对冲预测。台风影响导致母港延误七十二小时。模拟结果显示客户产线面临停工风险。正在重构动态路由，切换至 VIP 陆运直提模式。时效已追回六十小时。供应链韧性达成。"
  }
];

const INTRO_NARRATION = "欢迎进入‘货代智脑’全链路指挥中心。正在初始化神经元网络，扫描全球航运态势，准备载入智能决策引擎。系统已就绪，等待管理员授权进入。";
const SUMMARY_NARRATION = "全链路守护任务圆满达成。通过智脑核心算法，我们实现了百分之二十四点五的成本优化，以及百分之百的风险拦截。系统已进入稳态监控模式。正在生成最终荣誉勋章。";

const CartoonMetalCan = ({ isScanning }: { isScanning: boolean }) => (
  <div className="relative">
    <svg width="180" height="220" viewBox="0 0 140 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="50" y="10" width="40" height="15" rx="4" fill="#E2E8F0" />
      <rect x="55" y="25" width="30" height="15" fill="#CBD5E1" />
      <rect x="30" y="40" width="80" height="130" rx="12" fill="url(#metal_grad_v4)" stroke="#94A3B8" strokeWidth="2" />
      <rect x="40" y="45" width="8" height="120" rx="4" fill="white" fillOpacity="0.2" />
      <motion.g animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }}>
        <rect x="40" y="90" width="60" height="25" rx="2" fill="#F59E0B" />
        <text x="70" y="108" textAnchor="middle" fill="black" fontSize="14" fontWeight="900">UN 1993</text>
      </motion.g>
      <defs>
        <linearGradient id="metal_grad_v4" x1="30" y1="40" x2="110" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#94A3B8" /><stop offset="0.5" stopColor="#F8FAFC" /><stop offset="1" stopColor="#94A3B8" />
        </linearGradient>
      </defs>
    </svg>
    {isScanning && (
      <motion.div 
        initial={{ top: "0%" }}
        animate={{ top: "100%" }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 w-full h-[4px] bg-cyan-400 shadow-[0_0_20px_#22d3ee] z-10"
      />
    )}
    <AnimatePresence>
      {isScanning && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute -right-32 top-1/2 -translate-y-1/2 bg-cyan-500/30 border border-cyan-500/50 px-5 py-3 rounded-xl backdrop-blur-md shadow-2xl z-20"
        >
          <div className="text-[12px] text-cyan-400 font-black uppercase tracking-widest mb-1 whitespace-nowrap">AI 容器容量识别</div>
          <div className="text-2xl font-black text-white italic">1.0 Liters</div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const TechBadge = ({ tech, active }: { tech: string, active?: boolean }) => (
  <motion.span 
    animate={{ borderColor: active ? '#06b6d4' : 'rgba(255,255,255,0.1)' }}
    className={`px-4 py-1.5 border rounded-full text-[14px] font-black uppercase tracking-widest ${active ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'text-slate-500 bg-slate-900/50'}`}
  >
    {tech}
  </motion.span>
);

const LogConsole = ({ logs, currentStage, thinkingIndex, isAudioEnabled }: { logs: string[], currentStage: number, thinkingIndex: number, isAudioEnabled: boolean }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    if (isAudioEnabled && logs.length > 1) sfx.playClack();
  }, [logs, isAudioEnabled]);
  return (
    <div className="flex-1 bg-black/60 rounded-3xl border border-white/10 p-6 font-mono text-[16px] leading-relaxed overflow-y-auto shadow-inner" ref={scrollRef}>
      <div className="flex items-center gap-2 mb-4 text-cyan-500/70 border-b border-white/5 pb-2 uppercase tracking-[0.2em] text-[13px] font-black">
        <Terminal size={18} /><span>智脑进程实时监测中心</span>
      </div>
      {logs.map((log, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className={`mb-3 ${i === logs.length - 1 ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
          <span className="text-slate-600 mr-2">[{new Date().toLocaleTimeString([], { hour12: false, second: '2-digit' })}]</span>{log}
        </motion.div>
      ))}
      {thinkingIndex !== -1 && (
        <div className="mt-5 flex items-center gap-4">
           <div className="flex gap-1.5">
             {[1,2,3].map(d => <motion.div key={d} animate={{ height: [8, 24, 8] }} transition={{ repeat: Infinity, duration: 0.5, delay: d*0.1 }} className="w-2 bg-cyan-500 rounded-full" />)}
           </div>
           <span className="text-[16px] text-cyan-500 font-black animate-pulse uppercase tracking-widest">调用_{STAGES[currentStage].thinkingSteps[thinkingIndex].tech}_核心系统...</span>
        </div>
      )}
    </div>
  );
};

export default function LogisticsGuardian() {
  const [showIntro, setShowIntro] = useState(true);
  const [currentStage, setCurrentStage] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [logs, setLogs] = useState<string[]>([STAGES[0].initialLog]);
  const [thinkingIndex, setThinkingIndex] = useState(-1);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isNarrationPlaying, setIsNarrationPlaying] = useState(false);

  // --- 音频预加载策略 ---
  useEffect(() => {
    // 启动时预加载核心旁白，实现即时播放
    sfx.preloadNarration(INTRO_NARRATION);
    sfx.preloadNarration(SUMMARY_NARRATION);
    STAGES.forEach(s => sfx.preloadNarration(s.narration));
  }, []);

  // --- 深度链接支持 ---
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const stageMatch = hash.match(/stage=([A-Z]+)/);
      if (stageMatch) {
        const stageKey = stageMatch[1];
        const stageIdx = STAGES.findIndex(s => s.key === stageKey);
        if (stageIdx !== -1) {
          setCurrentStage(stageIdx);
          setShowIntro(false);
          setShowSummary(false);
          setIsApplied(false);
          setLogs([STAGES[stageIdx].initialLog]);
          sfx.stopAll();
          setIsNarrationPlaying(false);
        }
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const updateHash = (idx: number) => {
    window.location.hash = `stage=${STAGES[idx].key}`;
  };

  const stage = STAGES[currentStage];
  const playClick = () => isAudioEnabled && sfx.playClick();
  const playSuccess = () => isAudioEnabled && sfx.playSuccess();
  const playScan = () => isAudioEnabled && sfx.playScan();

  const handleStart = () => { 
    playClick(); 
    setShowIntro(false); 
    updateHash(0);
    sfx.stopAll();
    setIsNarrationPlaying(false);
    setTimeout(() => playSuccess(), 500); 
  };

  const handleToggleNarration = async (text: string) => {
    if (!isAudioEnabled) return;
    playClick();
    
    if (isNarrationPlaying) {
      sfx.stopAll();
      setIsNarrationPlaying(false);
    } else {
      setIsNarrationPlaying(true);
      // 由于已经预加载，这里几乎会立即执行
      await sfx.playNarration(text, () => {
        setIsNarrationPlaying(false);
      });
    }
  };

  const handleHeroAction = useCallback(async () => {
    playClick(); 
    setIsProcessing(true); 
    setThinkingIndex(0); 
    playScan();
    
    if (isNarrationPlaying) {
      sfx.stopAll();
      setIsNarrationPlaying(false);
    }

    for (let i = 0; i < stage.thinkingSteps.length; i++) {
      setThinkingIndex(i); 
      setLogs(prev => [...prev, `[${stage.thinkingSteps[i].tech}] ${stage.thinkingSteps[i].status}`]);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    setLogs(prev => [...prev, `[决策完成] 指令已正式同步：${stage.completedText}`]);
    setIsApplied(true); setIsProcessing(false); setThinkingIndex(-1); playSuccess();
  }, [currentStage, stage, isAudioEnabled, isNarrationPlaying]);

  const nextStage = () => {
    playClick();
    sfx.stopAll();
    setIsNarrationPlaying(false);
    if (currentStage < STAGES.length - 1) {
      const nextIdx = currentStage + 1;
      setCurrentStage(nextIdx); 
      setIsApplied(false); 
      setLogs([STAGES[nextIdx].initialLog]);
      updateHash(nextIdx);
    } else { 
      setShowSummary(true); 
      playSuccess(); 
      window.location.hash = "summary";
    }
  };

  const handleCopyReport = () => {
    const report = `
🚀 【Logistics Guardian】智脑战报已生成！
--------------------------------------
🎖️ 获得荣誉：智慧物流全链路守护者
💰 降本成果：运费直降 20%，LQ条款自动豁免
📄 单证表现：IDP 知识图谱自愈，海关风险归零
🛡️ 风控指标：IoT 边缘禁忌拦截，物理隔离 100%
🚚 履约韧性：VIP特快陆运对冲延误，追回 60 小时
--------------------------------------
🔗 立即体验货代未来：${window.location.origin}${window.location.pathname}
    `.trim();
    navigator.clipboard.writeText(report);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const renderStageVisual = () => {
    switch (stage.key) {
      case 'SALES': 
        return (
          <div className="flex-1 flex flex-col gap-4 min-h-0">
             <div className="h-10 shrink-0 flex items-center justify-center bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                <span className="text-[14px] font-black text-cyan-400 uppercase tracking-[0.4em]">核心技术：CV 多维识别 + 全球危险品合规知识图谱</span>
             </div>

             <div className="flex-1 flex gap-5 min-h-0">
                <div className="flex-1 glass border border-white/5 rounded-3xl p-6 flex flex-col gap-4">
                   <div className="flex justify-between items-center text-[13px] font-black text-slate-400 uppercase tracking-widest"><span>客户需求入口 (Inquiry Entry)</span><MessageSquare size={20} className="text-cyan-400" /></div>
                   <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                      <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 relative shrink-0">
                         <div className="flex items-center gap-4 mb-2">
                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-[16px] font-black text-white">李</div>
                            <span className="text-[16px] font-black text-slate-300">李经理</span>
                         </div>
                         <p className="text-[18px] text-slate-400 leading-relaxed italic font-medium">“200箱清洁剂。帮我看看运费能不能再降点。”</p>
                      </div>
                      <div className="flex-1 relative bg-slate-950 rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center shadow-inner">
                         <img src="https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=800&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale" />
                         <div className="absolute inset-0 bg-slate-950/70" />
                         <div className="z-10 flex flex-col items-center scale-90">
                            <CartoonMetalCan isScanning={isProcessing} />
                         </div>
                         {!isProcessing && !isApplied && (
                           <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20">
                             <div className="w-5 h-5 bg-cyan-400 rounded-full shadow-[0_0_20px_#06b6d4]" />
                             <span className="text-[12px] font-black text-cyan-400 uppercase bg-black/90 px-4 py-2 rounded-full border border-cyan-500/30">检测到物理包裹实拍</span>
                           </motion.div>
                         )}
                      </div>
                   </div>
                </div>

                <div className="flex-1 glass border border-cyan-500/20 rounded-3xl p-6 flex flex-col gap-4 relative overflow-hidden">
                   <div className="flex justify-between items-center text-[14px] font-black text-cyan-400 uppercase tracking-widest"><span>合规降本引擎 (Regulatory Optimizer)</span><TrendingUp size={20} /></div>
                   <div className="flex-1 bg-black/40 rounded-2xl border border-white/10 p-6 flex flex-col gap-6 overflow-hidden">
                      <div className="flex flex-col items-center justify-center p-6 bg-slate-900/60 rounded-3xl border border-white/10 relative overflow-hidden shrink-0 shadow-2xl">
                         <div className="text-[12px] text-slate-500 uppercase font-black mb-2 tracking-[0.3em]">实时动态报价看板</div>
                         <div className="flex items-center gap-8">
                            <div className={`text-4xl font-black italic transition-all ${isApplied ? 'text-slate-600 line-through scale-75' : 'text-white'}`}>$4,000</div>
                            {isApplied && <motion.div initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="text-6xl font-black text-cyan-400 drop-shadow-[0_0_25px_#06b6d4]">$3,200</motion.div>}
                         </div>
                         {isApplied && <div className="mt-4 text-[12px] bg-green-500/20 text-green-400 border border-green-500/40 px-4 py-1.5 rounded-full font-black uppercase shadow-lg">合规审计：危品附加费已剥离 (DG EXEMPT)</div>}
                      </div>
                      <div className="space-y-4 overflow-y-auto pr-2">
                         <div className="flex justify-between items-center text-[12px] font-black uppercase text-slate-500 tracking-widest"><span>IMDG 3.4 限量条款核验矩阵</span><Scan size={18} /></div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className={`p-4 rounded-2xl border transition-all ${isApplied ? 'bg-cyan-500/10 border-cyan-500/40' : 'bg-slate-900 border-white/5'}`}>
                               <div className="text-[11px] text-slate-500 font-black mb-1">识别规格参数</div>
                               <div className="text-2xl font-black text-white">{isApplied || isProcessing ? '1.0L / AL-Can' : '待处理'}</div>
                            </div>
                            <div className={`p-4 rounded-2xl border transition-all ${isApplied ? 'bg-cyan-500/10 border-cyan-500/40' : 'bg-slate-900 border-white/5'}`}>
                               <div className="text-[11px] text-slate-500 font-black mb-1">豁免条件匹配</div>
                               <div className={`text-2xl font-black ${isApplied ? 'text-green-400' : 'text-slate-600'}`}>限量合规通过</div>
                            </div>
                         </div>
                         <div className={`p-5 rounded-2xl border transition-all ${isApplied ? 'bg-cyan-500/10 border-cyan-500/40 shadow-lg' : 'bg-slate-900 border-white/5'}`}>
                            <p className={`text-[15px] leading-relaxed ${isApplied ? 'text-cyan-400 font-black' : 'text-slate-600 font-bold'}`}>
                               UN 1993, PG III, 容量 &le; 5.0L &rarr; <span className="underline decoration-cyan-500/50 decoration-2">Limited Quantity 限量豁免协议强制激活</span>
                            </p>
                         </div>
                      </div>
                      <div className="mt-auto flex justify-center shrink-0">
                         <div className="bg-cyan-500/10 px-6 py-2.5 rounded-full border border-cyan-500/40 flex items-center gap-3 shadow-xl">
                            <ShieldCheck size={20} className="text-cyan-400" />
                            <span className="text-[13px] font-black text-cyan-400 uppercase tracking-widest">降本决策确认：合规驱动溢价优化</span>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        );
      case 'DOCS':
        return (
          <div className="flex-1 flex flex-col gap-5 min-h-0">
            <div className="h-10 shrink-0 flex items-center justify-center bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
               <span className="text-[14px] font-black text-cyan-400 uppercase tracking-[0.4em]">CORE TECH: IDP INTELLECTUAL PROCESSING + LOGIC GRAPH</span>
            </div>
            <div className="flex-1 flex gap-6 min-h-0">
               <div className="flex-1 glass border border-white/5 rounded-3xl p-6 flex flex-col gap-5 overflow-hidden">
                  <div className="flex justify-between items-center text-[13px] font-black text-slate-400 uppercase tracking-widest"><span>单据一致性审计 (Doc Auditor)</span><Binary size={20} className="text-cyan-400" /></div>
                  <div className="flex-1 flex flex-col gap-5 overflow-hidden">
                     <div className="flex-1 bg-slate-900 border border-white/10 rounded-2xl p-6 relative flex flex-col justify-center shadow-lg">
                        <div className="flex justify-between text-[12px] text-slate-500 uppercase font-black mb-4"><span>SDS PDF 物理原件提取库</span><span className="text-cyan-400">IDP 解析就绪</span></div>
                        <div className="flex items-center gap-6">
                           <FileText size={48} className="text-cyan-400" />
                           <div className="flex flex-col">
                              <span className="text-[13px] text-slate-400 font-black uppercase mb-1">物理闪点参数监测:</span>
                              <span className="text-3xl font-black text-white italic tracking-wider">21.0 °C</span>
                           </div>
                        </div>
                     </div>
                     <div className={`flex-1 border rounded-2xl p-6 relative transition-all duration-700 flex flex-col justify-center shadow-lg ${isApplied ? 'bg-green-500/10 border-green-500/50' : 'bg-red-500/10 border-red-500/50'}`}>
                        <div className="flex justify-between text-[12px] text-slate-500 uppercase font-black mb-4"><span>申报系统接口 (TMS Dispatch)</span><span className={isApplied ? 'text-green-500 font-black' : 'text-red-400 font-black animate-pulse'}>{isApplied ? '已同步修正' : '逻辑参数冲突'}</span></div>
                        <div className="flex items-center gap-6">
                           <Database size={48} className={isApplied ? "text-green-400" : "text-red-400"} />
                           <div className="flex flex-col">
                              <span className="text-[13px] text-slate-400 font-black uppercase mb-1">当前录入申报值:</span>
                              <div className="flex items-baseline gap-4">
                                 <span className={`text-3xl font-black italic ${isApplied ? 'text-green-400' : 'text-red-400'}`}>{isApplied ? '21.0 °C' : '23.0 °C'}</span>
                                 {!isApplied && <span className="text-xl text-slate-700 line-through font-black">23.0 °C</span>}
                              </div>
                           </div>
                        </div>
                        {isApplied && <div className="absolute bottom-6 right-6"><CheckCircle2 size={32} className="text-green-500" /></div>}
                     </div>
                  </div>
               </div>
               <div className="flex-1 glass border border-cyan-500/20 rounded-3xl p-6 flex flex-col gap-5 overflow-hidden">
                  <div className="flex justify-between items-center text-[13px] font-black text-cyan-400 uppercase tracking-widest"><span>图谱自愈决策中心 (Graph Logic)</span><BrainCircuit size={20} /></div>
                  <div className="flex-1 bg-black/40 rounded-2xl border border-white/10 p-6 flex flex-col gap-6 overflow-hidden">
                     <div className="flex-1 flex flex-col gap-4 justify-center">
                        <div className={`p-5 rounded-2xl border transition-all shadow-xl ${isApplied ? 'opacity-20 grayscale' : 'bg-red-500/15 border-red-500/50'}`}>
                           <div className="text-[11px] font-black mb-2 uppercase text-slate-500 tracking-widest">Dirty State A &rarr; 23.0°C</div>
                           <p className="text-[16px] font-black text-slate-300">Flash Point &gt; 23°C &rarr; <span className="text-red-400 underline decoration-red-500/50 decoration-4">误判为 PG III [违规低报]</span></p>
                        </div>
                        <div className="flex justify-center"><ArrowRight size={24} className="text-slate-700 rotate-90" /></div>
                        <div className={`p-5 rounded-2xl border transition-all shadow-2xl ${isApplied ? 'bg-green-500/15 border-green-500/60 shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'bg-slate-900 border-white/10'}`}>
                           <div className="text-[11px] font-black mb-2 uppercase text-cyan-400 tracking-widest">Truth Source B &rarr; 21.0°C</div>
                           <p className={`text-[16px] font-black ${isApplied ? 'text-green-400' : 'text-slate-500'}`}>Flash Point &le; 23°C &rarr; <span className={isApplied ? 'text-green-400' : 'text-slate-600'}>强制修正为 PG II [合规路径]</span></p>
                        </div>
                     </div>
                     <div className={`p-5 rounded-2xl border transition-all shadow-inner shrink-0 ${isApplied ? 'bg-green-500/5 border-green-500/30' : 'bg-slate-900 border-white/10'}`}>
                        <div className="text-[12px] text-slate-500 uppercase font-black mb-2 tracking-widest">AI 自愈引擎日志:</div>
                        <p className={`text-[15px] font-black leading-relaxed ${isApplied ? 'text-green-400' : 'text-slate-500'}`}>
                           {isApplied ? '【自愈指令确认】订舱 EDI 报文已强制重构，海关风险因子已归零。' : '正在对齐 SDS 原件物理场... 监测到 Packing Group 降级逻辑冲突。'}
                        </p>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        );
      case 'RISK':
        return (
          <div className="flex-1 flex flex-col gap-5 min-h-0">
            <div className="h-10 shrink-0 flex items-center justify-center bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
               <span className="text-[14px] font-black text-cyan-400 uppercase tracking-[0.4em]">核心技术：IoT 边缘计算感知 + IMDG 隔离禁忌矩阵算法</span>
            </div>
            <div className="flex-1 flex gap-6 min-h-0">
               <div className="flex-1 glass border border-white/5 rounded-3xl p-6 flex flex-col gap-5 overflow-hidden">
                  <div className="flex justify-between items-center text-[13px] font-black text-slate-400 uppercase tracking-widest"><span>库区全景雷达 (Live WMS Status)</span><Activity size={20} className="text-green-500" /></div>
                  <div className="flex-1 relative flex flex-col gap-5 overflow-hidden">
                     <div className={`flex-1 rounded-3xl border flex flex-col justify-center p-6 transition-all duration-700 shadow-2xl ${!isApplied ? 'bg-red-500/10 border-red-500/60 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : 'opacity-20 grayscale'}`}>
                        <div className="flex justify-between items-center mb-3">
                           <span className="text-[13px] font-black text-red-500 uppercase tracking-widest">ZONE A - 高危危险品作业区</span>
                        </div>
                        <div className="flex items-center gap-6">
                           <Box size={56} className="text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                           <div className="flex flex-col">
                              <span className="text-[12px] text-slate-500 font-black uppercase mb-1">当前在库物质:</span>
                              <span className="text-[20px] font-black text-red-400 italic">Class 3 易燃液体 (Flammable)</span>
                           </div>
                        </div>
                     </div>
                     <div className={`flex-1 rounded-3xl border flex flex-col justify-center p-6 transition-all duration-700 shadow-2xl ${isApplied ? 'bg-green-500/15 border-green-500/60 shadow-[0_0_40px_rgba(34,197,94,0.3)]' : 'opacity-40'}`}>
                        <div className="flex justify-between items-center mb-3">
                           <span className={`text-[13px] font-black tracking-widest uppercase ${isApplied ? 'text-green-500' : 'text-slate-500'}`}>ZONE B - 安全隔离重定向区</span>
                        </div>
                        <div className="flex items-center gap-6">
                           <Box size={56} className={isApplied ? "text-green-400" : "text-slate-700"} />
                           <div className="flex flex-col">
                              <span className="text-[12px] text-slate-500 font-black uppercase mb-1">合规间距阻断:</span>
                              <span className={`text-[20px] font-black italic ${isApplied ? 'text-green-400' : 'text-slate-600'}`}>&gt; 50m 物理隔离已就绪</span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
               <div className="flex-1 glass border border-cyan-500/20 rounded-3xl p-6 flex flex-col gap-5 relative overflow-hidden shadow-2xl">
                  <div className="flex justify-between items-center text-[14px] font-black text-cyan-400 uppercase tracking-widest"><span>AI 安全隔离决策中心 (Control Hub)</span><Database size={20} /></div>
                  <div className="flex-1 bg-black/40 rounded-2xl border border-white/10 p-6 flex flex-col gap-8 overflow-hidden relative shadow-inner">
                     <div className="h-40 relative border-b border-white/10 pb-6 shrink-0">
                        <motion.div 
                          className="absolute z-30"
                          initial={{ left: "0px", top: "20px" }}
                          animate={isApplied ? { left: "260px", top: "90px", rotate: 0 } : { left: ["0px", "60px", "0px"], top: "20px", rotate: [0, -4, 4, 0] }}
                          transition={isApplied ? { duration: 2.5, ease: "easeInOut" } : { duration: 4, repeat: Infinity }}
                        >
                           <Truck size={64} className={isApplied ? "text-green-400" : "text-amber-500 shadow-amber-500/40"} />
                           <div className={`absolute -top-7 left-1/2 -translate-x-1/2 text-[12px] font-black px-4 py-1 rounded-full uppercase tracking-widest whitespace-nowrap shadow-2xl ${isApplied ? 'bg-green-500 text-black' : 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.6)]'}`}>Class 5.1 氧化剂卡车入场</div>
                        </motion.div>
                        {!isApplied && (
                           <motion.div animate={{ opacity: [0, 0.2, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="absolute inset-0 bg-red-500 flex items-center justify-center rounded-3xl" />
                        )}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                           <path d="M60,40 L300,40" stroke="#ef4444" strokeWidth="4" strokeDasharray="10 10" />
                           <path d="M60,40 Q180,40 300,100" stroke="#22c55e" strokeWidth="6" strokeDasharray="12 12" />
                        </svg>
                     </div>
                     <div className="space-y-6 overflow-y-auto">
                        <div className="flex justify-between items-center text-[12px] font-black uppercase tracking-[0.3em]">
                           <span className="text-slate-500">动态风险感知:</span>
                           <span className={isApplied ? 'text-green-400 font-black' : 'text-red-400 animate-pulse font-black'}>{isApplied ? '拦截方案已生效' : '禁忌隔离红线预警'}</span>
                        </div>
                        <div className={`p-5 rounded-2xl border transition-all shadow-xl ${isApplied ? 'bg-green-500/10 border-green-500/50' : 'bg-red-500/15 border-red-500/50'}`}>
                           <p className={`text-[16px] font-black leading-relaxed italic tracking-wide ${isApplied ? 'text-green-400' : 'text-red-400'}`}>
                              {isApplied ? '【隔离确认】货车已成功引导至 Zone B。物理间距逻辑实现强制隔离。' : '警告！检测到 Class 3 与 Class 5.1 严禁混存。爆炸概率预判 94.8%，正在紧急拦截重排...'}
                           </p>
                        </div>
                        <div className="flex justify-center mt-2">
                           <div className="bg-cyan-500/15 px-6 py-2 rounded-full border border-cyan-500/40 flex items-center gap-3 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                              <Shield size={20} className="text-cyan-400" />
                              <span className="text-[13px] font-black text-cyan-400 uppercase tracking-[0.2em]">全时边缘侧安全监控 (IoT-Guardian)</span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        );
      case 'CS':
        return (
          <div className="flex-1 flex flex-col gap-5 min-h-0">
            <div className="h-10 shrink-0 flex items-center justify-center bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
               <span className="text-[14px] font-black text-cyan-400 uppercase tracking-[0.4em]">CORE TECH: DIGITAL TWIN SIMULATION + PREDICTIVE DYNAMIC ROUTING</span>
            </div>
            <div className="flex-1 flex gap-6 min-h-0">
               <div className="flex-1 glass border border-white/5 rounded-3xl p-6 flex flex-col gap-5 overflow-hidden">
                  <div className="flex justify-between items-center text-[13px] font-black text-slate-400 uppercase tracking-widest"><span>供应链韧性雷达 (Live Resilience)</span><Wind size={20} className="text-red-500" /></div>
                  <div className="flex-1 relative flex flex-col gap-5 overflow-hidden">
                     <div className="bg-red-500/10 border border-red-500/40 rounded-3xl p-6 flex items-center gap-6 shadow-2xl shrink-0">
                        <Ship size={48} className="text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]" />
                        <div>
                           <div className="text-[12px] font-black text-red-500 uppercase tracking-widest mb-1">极端船期延误风险</div>
                           <div className="text-[20px] font-black text-white italic tracking-widest">台风“烟花”强对流：ETA +72h</div>
                        </div>
                     </div>
                     <div className="flex-1 bg-slate-900/80 border border-white/5 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-center shadow-xl">
                        <div className="flex items-center gap-4 mb-4">
                           <Factory size={32} className={isApplied ? "text-green-500" : "text-amber-500 animate-pulse"} />
                           <span className="text-[15px] font-black text-white uppercase tracking-[0.2em]">客户生产线核心物料水位分析</span>
                        </div>
                        <div className="space-y-6">
                           <div className="flex justify-between items-center">
                              <span className="text-[14px] text-slate-500 font-black uppercase tracking-widest">停产临界预警:</span>
                              <span className="text-[18px] font-black text-red-500 animate-pulse underline decoration-red-500/50 underline-offset-4">安全库存仅可维持 48 小时</span>
                           </div>
                           <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-white/10 shadow-inner">
                              <motion.div initial={{ width: "90%" }} animate={{ width: "15%", backgroundColor: "#ef4444" }} transition={{ duration: 15, repeat: Infinity }} className="h-full shadow-[0_0_20px_#ef4444]" />
                           </div>
                        </div>
                        <AnimatePresence>
                           {!isApplied && (
                              <div className="absolute inset-0 bg-red-500/5 flex items-center justify-center pointer-events-none opacity-30">
                                 <div className="text-red-500 text-[64px] font-black -rotate-12 uppercase tracking-[0.3em] italic">SUPPLY AT RISK</div>
                              </div>
                           )}
                        </AnimatePresence>
                     </div>
                  </div>
               </div>
               <div className="flex-1 glass border border-cyan-500/20 rounded-3xl p-6 flex flex-col gap-5 relative overflow-hidden shadow-2xl">
                  <div className="flex justify-between items-center text-[14px] font-black text-cyan-400 uppercase tracking-widest"><span>数字孪生优化机 (Resilience Engine)</span><Orbit size={20} className="animate-spin-slow" /></div>
                  <div className="flex-1 flex flex-col gap-8 bg-black/40 rounded-2xl border border-white/10 p-6 shadow-inner overflow-hidden">
                     <div className="relative h-40 flex flex-col justify-center gap-10 border-b border-white/10 pb-6 shrink-0">
                        <div className="flex items-center gap-6 opacity-40">
                           <Ship size={24} className="text-slate-500"/>
                           <div className="h-[2px] flex-1 bg-slate-700 relative">
                              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[12px] text-slate-500 font-black uppercase tracking-widest">常规海运路径 (Delayed Leg)</span>
                           </div>
                           <div className="text-[15px] text-slate-500 font-black italic">+72h ETA</div>
                        </div>
                        <div className="flex items-center gap-6">
                           <Truck size={36} className={isApplied ? 'text-cyan-400 drop-shadow-[0_0_10px_#22d3ee]' : 'text-slate-700'}/>
                           <div className="h-[3px] flex-1 bg-cyan-500/30 relative overflow-hidden rounded-full shadow-inner">
                              {isApplied && <motion.div initial={{ x: "-100%" }} animate={{ x: "100%" }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="absolute inset-0 bg-cyan-400 shadow-[0_0_15px_#22d3ee]" />}
                              <span className={`absolute -top-6 left-1/2 -translate-x-1/2 text-[12px] transition-all uppercase tracking-[0.3em] font-black ${isApplied ? 'text-cyan-400' : 'text-slate-600'}`}>动态纠偏：VIP 特快陆运协议激活</span>
                           </div>
                           <div className={`text-[15px] transition-all italic font-black ${isApplied ? 'text-green-400 drop-shadow-[0_0_10px_#22c55e]' : 'text-slate-600'}`}>{isApplied ? '追回 60h' : '预演中'}</div>
                        </div>
                     </div>
                     <div className="mt-auto space-y-5 overflow-y-auto">
                        <div className={`p-5 rounded-2xl border transition-all shadow-xl ${isApplied ? 'bg-green-500/10 border-green-500/60' : 'bg-slate-900 border-white/10'}`}>
                           <div className="text-[12px] text-slate-500 uppercase font-black mb-2 tracking-widest">动态路由自愈日志:</div>
                           <p className={`text-[17px] font-black leading-relaxed italic tracking-wide ${isApplied ? 'text-green-400' : 'text-slate-600'}`}>
                              {isApplied ? '【履约成功】VIP 陆运直提协议已正式上线。已成功对冲极端延迟，断供风险降至 0.04%。' : '正在分析气象物理场数据... 建议立即激活 VIP 运力进行交付确定性对冲。'}
                           </p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        );
    }
  };

  if (showIntro) {
    return (
      <div className="h-screen bg-slate-950 flex flex-col items-center justify-center p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#0f172a_3px,transparent_3px),linear-gradient(to_bottom,#0f172a_3px,transparent_3px)] bg-[size:100px_100px]" />
        <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 flex flex-col items-center text-center max-w-6xl">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="mb-12 p-10 glass rounded-full border border-cyan-500/40 shadow-[0_0_60px_rgba(6,182,212,0.3)]">
            <Dna size={90} className="text-cyan-400" />
          </motion.div>
          <h1 className="text-6xl md:text-[7rem] font-black tracking-tighter italic uppercase mb-6 text-white leading-none">货代智脑<br /><span className="text-cyan-400 drop-shadow-[0_0_40px_rgba(6,182,212,0.7)]">LOGISTICS GUARDIAN</span></h1>
          <div className="h-1.5 w-40 bg-cyan-500/50 mb-12 rounded-full shadow-2xl" />
          <p className="text-lg md:text-xl text-slate-400 font-black mb-12 uppercase tracking-[0.5em] max-w-4xl leading-relaxed">
            AI-DRIVEN FREIGHT FORWARDING ENGINE<br />
            <span className="text-[16px] font-bold text-slate-600 mt-6 block tracking-[1em]">新一代全链路货运履约智能决策中枢</span>
          </p>
          
          <div className="flex flex-col items-center gap-8">
            <button 
              onClick={() => handleToggleNarration(INTRO_NARRATION)} 
              disabled={!sfx.isCached(INTRO_NARRATION)}
              className={`px-10 py-4 border font-black text-lg uppercase tracking-[0.2em] rounded-2xl transition-all flex items-center gap-4 group disabled:opacity-50 ${isNarrationPlaying ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
            >
              {isNarrationPlaying ? (
                <Square size={28} className="fill-current" />
              ) : !sfx.isCached(INTRO_NARRATION) ? (
                <Loader2 size={28} className="animate-spin text-slate-600" />
              ) : (
                <Volume2 size={28} className="group-hover:scale-110 transition-transform" />
              )}
              <span>
                {isNarrationPlaying ? '停止语音介绍' : !sfx.isCached(INTRO_NARRATION) ? '音频生成中...' : '播放语音简介'}
              </span>
            </button>

            <button onClick={handleStart} className="group relative px-20 py-7 bg-cyan-500 text-slate-950 font-black text-2xl uppercase tracking-[0.3em] rounded-3xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_50px_rgba(6,182,212,0.4)] overflow-hidden flex items-center gap-6">
              <Power size={36} fill="currentColor" /><span>进入指挥驾驶舱</span>
              <motion.div className="absolute inset-0 bg-white/40" initial={{ x: "-100%" }} whileHover={{ x: "100%" }} transition={{ duration: 0.7 }} />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (showSummary) {
    return (
      <div className="h-screen bg-slate-950 flex flex-col items-center justify-center p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#083344_0%,_#020617_100%)] opacity-80" />
        <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl w-full relative z-10 space-y-12 text-center">
          <Award size={120} className="text-cyan-400 mx-auto drop-shadow-[0_0_40px_#06b6d4]" />
          <h2 className="text-7xl font-black tracking-tighter uppercase italic">荣誉勋章：智慧物流守护者</h2>
          
          <button 
            onClick={() => handleToggleNarration(SUMMARY_NARRATION)} 
            disabled={!sfx.isCached(SUMMARY_NARRATION)}
            className={`mx-auto px-10 py-4 border font-black text-lg uppercase tracking-[0.2em] rounded-2xl transition-all flex items-center gap-4 group disabled:opacity-50 ${isNarrationPlaying ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
          >
            {isNarrationPlaying ? (
              <Square size={28} className="fill-current" />
            ) : !sfx.isCached(SUMMARY_NARRATION) ? (
              <Loader2 size={28} className="animate-spin text-slate-600" />
            ) : (
              <Volume2 size={28} className="group-hover:scale-110 transition-transform" />
            )}
            <span>
              {isNarrationPlaying ? '停止总结旁白' : !sfx.isCached(SUMMARY_NARRATION) ? '音频生成中...' : '播放总结旁白'}
            </span>
          </button>

          <div className="grid grid-cols-2 gap-10 text-left">
            <div className="glass p-12 rounded-[3rem] border border-cyan-500/40 space-y-8 shadow-3xl">
              <h3 className="text-cyan-400 font-black text-2xl uppercase tracking-[0.2em] flex items-center gap-4"><TrendingUp size={36}/>智脑全链路技术收益报告</h3>
              <ul className="text-[18px] text-slate-400 space-y-5 font-black uppercase tracking-widest">
                <li className="flex justify-between border-b border-white/10 pb-3"><span>合规降本平均优化率:</span><span className="text-white italic">+24.5%</span></li>
                <li className="flex justify-between border-b border-white/10 pb-3"><span>核心文档自愈成功率:</span><span className="text-white italic">100%</span></li>
                <li className="flex justify-between"><span>时效损失对冲系数:</span><span className="text-white italic">60h/Shipment</span></li>
              </ul>
            </div>
            <div className="glass p-12 rounded-[3rem] border border-amber-500/40 space-y-8 shadow-3xl">
              <h3 className="text-amber-400 font-black text-2xl uppercase tracking-[0.2em] flex items-center gap-4"><Shield size={36}/>全域合规安全态势汇总</h3>
              <ul className="text-[18px] text-slate-400 space-y-5 font-black uppercase tracking-widest">
                <li className="flex justify-between border-b border-white/10 pb-3"><span>物理冲突拦截成功率:</span><span className="text-white italic">100%</span></li>
                <li className="flex justify-between border-b border-white/10 pb-3"><span>申报修复判定精度:</span><span className="text-white italic">Zero-Error</span></li>
                <li className="flex justify-between"><span>供应链确定性提升:</span><span className="text-white italic">4.2x Growth</span></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-6">
            <div className="flex gap-8">
              <button onClick={handleCopyReport} className="px-12 py-6 bg-cyan-500 text-slate-950 font-black text-lg uppercase tracking-[0.3em] rounded-full hover:scale-105 active:scale-95 transition-all flex items-center gap-4 shadow-[0_0_30px_rgba(6,182,212,0.4)]">
                {isCopied ? <Check size={28} /> : <Copy size={28} />}
                <span>{isCopied ? '战报已复制' : '复制智脑战报'}</span>
              </button>
              
              <button onClick={() => { playClick(); setShowSummary(false); setCurrentStage(0); setIsApplied(false); setLogs([STAGES[0].initialLog]); setShowIntro(true); window.location.hash = ""; sfx.stopAll(); setIsNarrationPlaying(false); }} className="px-12 py-6 bg-white/10 border border-white/20 text-white font-black text-lg uppercase tracking-[0.3em] rounded-full hover:bg-white/20 transition-all flex items-center gap-4">
                <RefreshCw size={28} />
                <span>重新开始体验</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-950 flex flex-col relative overflow-hidden text-slate-200 font-sans selection:bg-cyan-500 selection:text-white">
      <header className="w-full h-16 px-12 flex justify-between items-center border-b border-white/10 glass z-50 shrink-0 shadow-2xl">
        <div className="flex items-center gap-5">
          <Cpu className="text-cyan-400" size={36} />
          <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">货代智脑 <span className="text-cyan-400">Logistics Guardian</span> <span className="text-[12px] text-slate-500 font-mono ml-6 tracking-[0.5em] uppercase bg-slate-900/80 px-4 py-1.5 rounded-full border border-white/10 shadow-inner">KNL_V4.2.0_ULTRA</span></h1>
        </div>
        <div className="flex items-center gap-6">
           <div className="flex gap-4 shrink-0">{stage.techStack.map(t => <TechBadge key={t} tech={t} active={thinkingIndex !== -1} />)}</div>
           
           <div className="h-8 w-[1px] bg-white/10 mx-2" />

           <button 
             onClick={() => handleToggleNarration(stage.narration)} 
             disabled={!sfx.isCached(stage.narration)}
             className={`px-4 py-2 rounded-xl transition-all flex items-center gap-3 border shadow-lg disabled:opacity-50 ${isNarrationPlaying ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400' : 'bg-slate-900/60 border-white/10 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30'}`}
           >
             {isNarrationPlaying ? (
               <Square size={20} className="fill-current" />
             ) : !sfx.isCached(stage.narration) ? (
               <Loader2 size={20} className="animate-spin" />
             ) : (
               <Play size={20} />
             )}
             <span className="text-[13px] font-black uppercase tracking-widest">
               {isNarrationPlaying ? '停止任务旁白' : !sfx.isCached(stage.narration) ? '加载中...' : '播放任务旁白'}
             </span>
           </button>

           <button onClick={() => { 
             const newState = !isAudioEnabled;
             setIsAudioEnabled(newState); 
             if (!newState) {
               sfx.stopAll();
               setIsNarrationPlaying(false);
             }
             sfx.playClick(); 
           }} className={`p-3 rounded-full transition-all shadow-2xl ${isAudioEnabled ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'text-slate-600 bg-slate-900/60'}`}>{isAudioEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}</button>
        </div>
      </header>

      <main className="flex-1 flex flex-col p-6 gap-6 overflow-hidden container mx-auto max-w-[1700px]">
        {/* HUD 流程指示器 */}
        <div className="flex items-center justify-between w-full h-16 relative px-16 glass rounded-3xl border border-white/10 shrink-0 shadow-2xl">
          <div className="absolute top-1/2 left-28 right-28 h-[3px] bg-white/5 -translate-y-1/2" />
          {STAGES.map((s, idx) => (
            <div key={s.key} className={`relative z-10 flex flex-col items-center gap-3 ${idx <= currentStage ? 'text-cyan-400' : 'text-slate-700'}`}>
              <motion.div animate={{ scale: idx === currentStage ? 1.25 : 1 }} className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center transition-all bg-slate-900/95 ${idx === currentStage ? 'shadow-[0_0_30px_#06b6d4] bg-slate-800 border-cyan-500' : 'border-slate-800'}`}>
                {idx < currentStage ? <CheckCircle2 size={32} /> : s.icon}
              </motion.div>
              <span className="text-[12px] font-black uppercase tracking-[0.3em] italic">{s.title.split(' - ')[0]}</span>
            </div>
          ))}
        </div>

        <div className="flex-1 flex gap-6 min-h-0 overflow-hidden mb-1">
          {/* 核心业务主窗口 */}
          <div className="flex-[3] flex flex-col min-h-0 gap-3 overflow-hidden">
            <div className="flex items-center gap-4 text-slate-600 font-black uppercase tracking-[0.4em] text-[14px] shrink-0">
              <Search size={22} /><span>全息态势感知感知中心 (Strategic Sensing Hub)</span>
            </div>
            {renderStageVisual()}
          </div>

          {/* 逻辑执行核心 */}
          <div className="flex-[1.8] flex flex-col min-h-0 gap-3 overflow-hidden">
            <div className="flex items-center gap-4 text-slate-600 font-black uppercase tracking-[0.4em] text-[14px] shrink-0">
              <BrainCircuit size={22} /><span>智脑超脑推理引擎 (Logic Engine)</span>
            </div>
            <div className="flex-1 glass border border-cyan-500/20 rounded-[2.5rem] p-6 flex flex-col gap-6 overflow-hidden relative shadow-3xl">
               <LogConsole logs={logs} currentStage={currentStage} thinkingIndex={thinkingIndex} isAudioEnabled={isAudioEnabled} />
               {/* 性能指标卡片 */}
               <div className="p-6 bg-slate-900/80 rounded-3xl border border-white/10 space-y-4 shrink-0 shadow-inner">
                  <div className="flex justify-between items-center text-[13px] font-black uppercase text-slate-500 tracking-[0.3em]">
                    <div className="flex items-center gap-3"><BarChart3 size={20} className="text-cyan-500"/>AI 决策置信度指标</div>
                    <span className="text-cyan-400 text-lg font-black italic">{isApplied ? '99.8%' : (isProcessing ? 'CALCULATING...' : '65.2%')}</span>
                  </div>
                  <div className="h-3 bg-slate-800 rounded-full overflow-hidden shadow-inner border border-white/5">
                    <motion.div initial={{ width: "65%" }} animate={{ width: isApplied ? '98%' : (isProcessing ? '85%' : '65%') }} className="h-full bg-cyan-500 shadow-[0_0_20px_#06b6d4]" />
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-slate-600 font-black uppercase tracking-[0.4em]">
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />Proc Latency: 12ms</span>
                    <span className="flex items-center gap-2">Thread: {isApplied ? 'DE-RISKED' : 'MONITORING'}</span>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* 底部智慧指令操作栏 - 动态化阶段文案 */}
        <div className="h-28 shrink-0 flex items-center justify-between glass px-12 rounded-[2rem] border border-white/10 shadow-[0_-20px_60px_rgba(0,0,0,0.6)] relative overflow-hidden z-[60]">
          <div className="absolute inset-0 bg-cyan-500/5 pointer-events-none" />
          <div className="flex gap-10 items-center z-10 overflow-hidden">
             <div className="w-16 h-16 rounded-2xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-3xl shrink-0">
               {isApplied ? <CheckCircle2 size={40} /> : <Zap size={40} className="animate-pulse" />}
             </div>
             <div className="max-w-3xl overflow-hidden pr-8">
               <h3 className="text-xl font-black text-white mb-1.5 uppercase tracking-widest italic flex items-center gap-4">
                 {isApplied ? <><Sparkles size={20} className="text-cyan-400" />{stage.hudTitle}</> : <><AlertTriangle size={20} className="text-amber-500" />风险态势挂起：等待管理员最高授权</>}
               </h3>
               <p className="text-[14px] text-slate-400 font-black italic leading-tight tracking-wide line-clamp-2">
                 {isApplied ? stage.hudDescription : "正在并发解析多源海事规章、IoT 物联感知流与数字孪生预测数据。监测到严重交付确定性风险，正在请求执行智脑补偿协议。"}
               </p>
             </div>
          </div>
          <div className="flex gap-8 z-10 shrink-0">
            {!isApplied ? (
              <button disabled={isProcessing} onClick={handleHeroAction} className="relative px-16 py-5 bg-cyan-500 text-slate-950 font-black text-xl uppercase tracking-[0.3em] rounded-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-[0_0_40px_rgba(6,182,212,0.5)] overflow-hidden flex items-center gap-5">
                {isProcessing ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}><RefreshCw size={28} /></motion.div> : <Zap size={32} fill="currentColor" />}
                <span>{isProcessing ? '系统计算中...' : stage.heroButtonText}</span>
              </button>
            ) : (
              <button onClick={nextStage} className="px-16 py-5 bg-white text-slate-950 font-black text-xl uppercase tracking-[0.3em] rounded-2xl transition-all shadow-3xl flex items-center gap-5 hover:bg-cyan-400 hover:scale-110 active:scale-95">
                <span>{currentStage === STAGES.length - 1 ? '最终荣誉勋章' : stage.nextButtonText}</span><ChevronRight size={32} />
              </button>
            )}
          </div>
        </div>
      </main>
      
      <footer className="h-8 shrink-0 px-12 border-t border-white/10 flex justify-between items-center text-[12px] font-mono text-slate-600 uppercase tracking-[0.6em] font-black bg-slate-950/90 shadow-2xl">
        <div className="flex items-center gap-10">
          <span>Engine Kernel: Logistics Guardian X4 Ultra</span>
          <span>Security: AES-512 SECURE PROTECTED</span>
        </div>
        <div className="flex items-center gap-10">
          <span className="text-cyan-400 animate-pulse flex items-center gap-3 font-black"><div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />Global Mainframe Synchronized</span>
        </div>
      </footer>
    </div>
  );
}
