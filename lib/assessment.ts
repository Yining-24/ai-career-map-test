type Dimension = "digital" | "judgment" | "relation" | "onsite" | "experiment";
type Scores = Partial<Record<Dimension, number>>;
type Option = { text: string; scores?: Scores };
export type Question = { id: string; title: string; scene?: string; options: Option[] };
export type Answers = Record<string, string>;
export type Route = { title: string; why: string; gap: string; action: string };
export type Report = {
  version: 2;
  title: string;
  subtitle: string;
  signal: string;
  impactLine: string;
  valueLine: string;
  worryLine: string;
  evidence: string[];
  counterpoint: string;
  routes: Route[];
  sevenDay: string;
  caveat: string;
  generatedAt: string;
};

export const questions: Question[] = [
  { id:"role", title:"先选一个最接近你的工作场景", scene:"不用填公司、学历或收入。待业或转行中的你，可以按上一份工作回答。", options:[
    {text:"电商／内容／设计／运营"}, {text:"行政／人事／财务支持"}, {text:"销售／客服／客户服务"}, {text:"教育／医疗／照护／公共服务"}, {text:"制造／工程／门店／现场服务"}, {text:"其他／还没有工作经历"},
  ]},
  { id:"s1", title:"周一打开电脑，你最常被催交的是哪种东西？", scene:"选最像你日常的一项，不必统计工时。", options:[
    {text:"表格、资料、文案或初稿",scores:{digital:2}},
    {text:"把一个模糊要求变成可执行方案",scores:{judgment:2}},
    {text:"让客户、同事或供应商达成一致",scores:{relation:2}},
    {text:"处理现场的人、货、设备或突发事",scores:{onsite:2}},
  ]},
  { id:"s2", title:"AI 十分钟做出你过去半天才能交的初稿。你第一反应是？", scene:"假设它看起来很像样，但你还没检查。", options:[
    {text:"糟了，我最主要的工作就是做这份初稿",scores:{digital:2}},
    {text:"先查事实、规则和可能造成的后果",scores:{judgment:2,experiment:1}},
    {text:"先问使用这份东西的人到底要解决什么",scores:{relation:2,judgment:1}},
    {text:"它能写，但现实里还得有人把它做成",scores:{onsite:2}},
  ]},
  { id:"s3", title:"公司上线 AI 客服，常见问题可以秒回。你觉得最先剩下什么？", scene:"想一想你见过的真实客户或同事。", options:[
    {text:"我这边可能就没多少事了",scores:{digital:2}},
    {text:"政策边界、退款争议和需要担责的例外",scores:{judgment:2}},
    {text:"客户明明听懂了，却仍然不信任的时刻",scores:{relation:2}},
    {text:"线上说得通，门店或现场做不到的问题",scores:{onsite:2}},
  ]},
  { id:"s4", title:"领导只说「下周把这个项目搞好」，没有更多要求。你会先做什么？", scene:"没有标准答案，选你真的更可能采取的第一步。", options:[
    {text:"找过去的模板，先做出一版",scores:{digital:1,experiment:1}},
    {text:"追问目标、限制条件和怎么算成功",scores:{judgment:2}},
    {text:"先找要配合的人，确认各自的期待",scores:{relation:2}},
    {text:"去现场看一遍，找纸面上看不到的阻碍",scores:{onsite:2}},
  ]},
  { id:"s5", title:"一份 AI 生成的报告里，有一处数据似乎不对。明天就要发给客户。", scene:"时间紧，只能先做一件事。", options:[
    {text:"把可疑句子改掉，其他部分照发",scores:{digital:1}},
    {text:"追到原始来源，检查同一口径的其他数字",scores:{judgment:2,experiment:1}},
    {text:"先告诉客户或负责人哪部分尚未核实",scores:{relation:1,judgment:1}},
    {text:"拿实际交付情况对照，别只看文档",scores:{onsite:1,judgment:1}},
  ]},
  { id:"s6", title:"如果明年公司把重复工作大幅自动化，你最有把握留下哪一部分？", scene:"选你有过真实经历的一项；不确定也可以直接选。", options:[
    {text:"目前想不到，我的大部分工作确实偏重复",scores:{digital:2}},
    {text:"判断哪里不能照流程办，并承担结果",scores:{judgment:2}},
    {text:"弄清不同人的真实需求，推动他们配合",scores:{relation:2}},
    {text:"现场操作和处理临时变化",scores:{onsite:2}},
  ]},
  { id:"s7", title:"公司说可以试 AI，但客户资料和内部数据不能外传。你会怎么开始？", scene:"假设你只有一周时间。", options:[
    {text:"先不用，等公司培训和明确安排",scores:{}},
    {text:"用公开或虚构材料，测试一个小任务",scores:{experiment:2,judgment:1}},
    {text:"先问清批准的工具和数据范围，再做试验",scores:{experiment:2,judgment:2}},
    {text:"拿真实资料试才有意义，做完再说",scores:{experiment:1}},
  ]},
  { id:"s8", title:"每天只有半小时，连续两周。你会怎样应对 AI 带来的焦虑？", scene:"必须只选一件真的能做完的事。", options:[
    {text:"收藏更多 AI 课程和工具清单",scores:{}},
    {text:"选一个熟悉任务，比较 AI 前后质量和耗时",scores:{experiment:2,judgment:1}},
    {text:"找三个在目标岗位的人聊真实工作",scores:{relation:1,experiment:2}},
    {text:"做一份展示自己解决问题过程的小案例",scores:{experiment:2,judgment:1}},
  ]},
  { id:"s9", title:"你看到招聘写着「熟练使用 AI 工具」，但没说具体做什么。你会？", scene:"你还没有决定要不要投。", options:[
    {text:"先补一堆工具证书，越多越保险",scores:{}},
    {text:"拆解岗位交付物，问 AI 在哪一环真正有用",scores:{judgment:1,experiment:2}},
    {text:"拿自己的经历做一个人机协作小样例",scores:{experiment:2,judgment:1}},
    {text:"找人问清团队怎样验收、谁对错误负责",scores:{relation:1,judgment:2}},
  ]},
  { id:"s10", title:"同事用了 AI，速度突然比你快一倍。你最想争取的角色是？", scene:"只能选一条路，哪条让你愿意再练三个月？", options:[
    {text:"把我的熟练活也做得更快",scores:{digital:1,experiment:1}},
    {text:"决定哪些输出能用、哪些不能用",scores:{judgment:2}},
    {text:"把需求、团队和客户真正连起来",scores:{relation:2}},
    {text:"负责最后落地和现场问题",scores:{onsite:2}},
  ]},
  { id:"s11", title:"最后来抓一次 AI 的错误", scene:"AI 说：上周 100 人咨询、20 人下单；本周 80 人咨询、24 人下单。所以「本周转化率下降了」。哪项判断对？", options:[
    {text:"AI 对，咨询人数减少了",scores:{}},
    {text:"AI 错，本周转化率 30%，高于上周的 20%",scores:{judgment:2}},
    {text:"AI 对，因为下单人数不能代表收入",scores:{}},
    {text:"无法判断，必须先知道两周的营业额",scores:{}},
  ]},
];

const routeBank: Record<string, Route[]> = {
  digital:[
    {title:"AI 工作流改造",why:"你熟悉原本的材料和步骤，能找到重复环节。",gap:"只会生成初稿不够；还需证明质量、成本和返工如何变化。",action:"选一个重复任务，做一次 AI 前后对照，记下节省与返工。"},
    {title:"内容／数据质量把关",why:"离原岗位近，可以从初稿走向核查与验收。",gap:"需要建立可信来源、错误类型和验收标准。",action:"把最近一份交付物列成五条核查清单。"},
  ],
  judgment:[
    {title:"业务分析／质量与合规协同",why:"你在题目中多次选择界定问题、核对依据和承担后果。",gap:"要把判断过程变成别人可复核的证据，而非自称细心。",action:"挑一个出错代价高的案例，写清依据、取舍和结果。"},
    {title:"项目或流程负责人",why:"能把 AI 的初稿变成可验收的结果，是流程中的关键一环。",gap:"还需要跨环节推进和验收的真实经历。",action:"找一个小流程，画出谁提出需求、谁确认、谁担责。"},
  ],
  relation:[
    {title:"客户成功／商家或用户运营",why:"你关注需求差异、信任和多方配合。",gap:"需要持续跟进并证明问题被解决，不只是擅长聊天。",action:"记录一次从误解到达成一致的完整经过。"},
    {title:"跨团队项目协调",why:"AI 可以整理沟通材料，却无法替你争取承诺和处理分歧。",gap:"需要展示你推进过一个有阻力的具体事项。",action:"列出最近一次卡住的协作，找出真正的决策人。"},
  ],
  onsite:[
    {title:"现场运营／服务流程设计",why:"你注意到纸面方案和现实执行之间的落差。",gap:"需要把现场经验沉淀为规则，才更容易扩展影响力。",action:"记录三次同类突发情况，找出可以提前预防的一步。"},
    {title:"实施交付／设备或服务支持",why:"现场信息、操作和应变需要与实际环境结合。",gap:"仍需会用数字工具完成准备、记录和复盘。",action:"把一次现场问题整理成图文排障卡。"},
  ],
};

const titles: Record<string,string> = {
  digital:"模板赛道上的换挡者",
  judgment:"AI 初稿的总编辑",
  relation:"人和系统之间的翻译官",
  onsite:"现实世界的最后一公里",
};
const roleRoutes:Record<string,Partial<Record<Dimension,{title:string;action:string}>>> = {
  "电商／内容／设计／运营":{
    digital:{title:"内容与运营工作流改造",action:"拿一份活动文案或周报，记录 AI 起草后你实际核改了什么。"},
    judgment:{title:"运营分析／内容质量把关",action:"挑一份活动复盘，核对数据口径和结论是否真能被数据支持。"},
    relation:{title:"商家／用户需求运营",action:"记录一次商家或用户真实诉求怎样改变了原方案。"},
    onsite:{title:"活动落地与履约协调",action:"复盘一次线上方案在执行中遇到的具体阻碍。"},
  },
  "行政／人事／财务支持":{
    digital:{title:"内部流程与知识库运营",action:"挑一个重复问答，测试 AI 初稿与人工核查各花多少时间。"},
    judgment:{title:"流程审核与风险把关",action:"写下一个审批或数据错误的识别依据和可能后果。"},
    relation:{title:"员工服务与跨部门协同",action:"记录一个员工需求怎样在多个部门之间被真正解决。"},
    onsite:{title:"办公现场与流程实施",action:"找出一条书面流程与现场执行不一致的地方。"},
  },
  "销售／客服／客户服务":{
    digital:{title:"服务知识库与质检",action:"用一类高频咨询试做答复草稿，并标出需要人工判断的例外。"},
    judgment:{title:"复杂客诉与服务质量",action:"拆解一次争议案例：事实、规则、授权和最终决定分别是谁负责。"},
    relation:{title:"客户成功／重点客户运营",action:"记录一次客户信任从动摇到恢复的关键动作。"},
    onsite:{title:"服务交付与现场问题处理",action:"写下一个线上承诺到线下交付时出现的落差。"},
  },
  "教育／医疗／照护／公共服务":{
    digital:{title:"资料与服务流程支持",action:"选一份非敏感公开材料，测试 AI 初稿需要哪些专业核查。"},
    judgment:{title:"专业信息核验与质量支持",action:"找一个不能只看 AI 摘要就下结论的案例，列出核验步骤。"},
    relation:{title:"服务对象沟通与需求协调",action:"记录一次标准答案没能解决真实顾虑的场景。"},
    onsite:{title:"一线服务与现场协作",action:"整理一次现场变化如何影响原本的服务安排。"},
  },
  "制造／工程／门店／现场服务":{
    digital:{title:"作业记录与流程数字化",action:"找一张常用记录表，区分可自动整理与必须现场确认的内容。"},
    judgment:{title:"质量判断与异常处理",action:"复盘一个异常：什么证据让你决定停下或继续。"},
    relation:{title:"交付协调与客户需求对接",action:"记录一次客户要求与现场约束冲突时的解决过程。"},
    onsite:{title:"现场实施与排障",action:"把一个常见现场问题做成步骤清楚的排障卡。"},
  },
};

export function validateAnswers(input: unknown): input is Answers {
  if (!input || typeof input !== "object" || Array.isArray(input)) return false;
  const a=input as Record<string,unknown>;
  return questions.every(q=>typeof a[q.id]==="string" && q.options.some(o=>o.text===a[q.id]));
}

export function buildReport(a: Answers): Report {
  const scores:Record<Dimension,number>={digital:0,judgment:0,relation:0,onsite:0,experiment:0};
  const evidence:string[]=[];
  for (const q of questions.slice(1)) {
    const chosen=q.options.find(o=>o.text===a[q.id])!;
    for(const [key,value] of Object.entries(chosen.scores||{}))scores[key as Dimension]+=value;
  }
  const human=(["judgment","relation","onsite"] as Dimension[]).sort((x,y)=>scores[y]-scores[x])[0];
  const dominant=scores[human]>=4?human:"digital";
  const exposure=scores.digital>=5?"较高":scores.digital>=3?"中等":"尚不明显";
  const trial=scores.experiment>=5?"已经倾向于用小实验找答案":scores.experiment>=2?"有尝试的起点":"现在更需要一个低成本的起点";
  const core:Record<string,string>={
    digital:"你选中的工作画面更多指向可复制的材料和初稿。AI 对这些环节的影响可能来得较快；这不等于整个岗位会消失。关键是把自己从“完成一份东西”移向“决定它为什么做、是否可信、怎样被采用”。",
    judgment:"你多次把注意力放在目标、事实来源和出错后果上。AI 能给候选答案，但业务边界、证据与责任链仍需人来建立。你的机会是把隐性的判断经验做成可复核的方法。",
    relation:"你多次选择先理解人、处理信任和协调分歧。AI 可以帮你准备话术与记录，但利益冲突和关系维护仍发生在真实互动中。价值不在“会沟通”四个字，而在推动过什么结果。",
    onsite:"你的选择集中在现场限制、实物和临时变化。生成内容不能直接替代现实执行，但计划、排查和记录环节仍会被 AI 改写。把现场经验整理出来，比单纯排斥工具更有优势。",
  };
  const direction=routeBank[dominant].map(route=>({...route}));
  const roleRoute=roleRoutes[a.role]?.[dominant];
  if(roleRoute)direction[0]={...direction[0],...roleRoute};
  evidence.push(`日常交付：${a.s1}`,`AI 初稿出现时：${a.s2}`,`重复工作缩减后：${a.s6}`);
  evidence.push(a.s11==="AI 错，本周转化率 30%，高于上周的 20%"?"识错挑战：你抓到了分母变化。下单数增加、咨询数减少，本周转化率从 20% 升到 30%。":"识错挑战：AI 的结论错了。上周转化率 20/100＝20%，本周 24/80＝30%；看比例时别只看咨询人数。");
  const caution=scores.digital>=4 && scores[human]>=4
    ?"你同时选到了容易被 AI 加速的环节和较难标准化的环节。职业风险不能取两者平均；要看公司未来还愿不愿意为后者付费。"
    :scores.digital>=4?"如果你的主要产出仍按数量和速度计价，工具普及会压低这一部分的议价能力。"
    :"不要把“现在较难自动化”理解成长期安全；工具、流程和组织方式仍会改变。";
  const privacy=a.s7==="拿真实资料试才有意义，做完再说"?"你选了先拿真实资料试 AI。先确认公司批准的工具和数据范围；未经许可输入客户或内部数据，可能带来新的风险。":"";
  return {
    version:2,title:titles[dominant],subtitle:`你的工作变化信号：${exposure} · ${trial}`,signal:exposure,
    impactLine:core[dominant],
    valueLine:dominant==="digital"?"你当前最该争取的是验收权：从只交付初稿，逐步接近定义需求、核查质量和解释结果的环节。":`你的可迁移线索是「${a.s6}」。这只是自我报告的线索；最好用一件真实做过的事证明它。`,
    worryLine:`${caution}${privacy}`,evidence,counterpoint:a.role==="其他／还没有工作经历"?"如果你还没有工作经历，这份结果只是对未来工作情境的偏好推演，不能判断现任岗位风险。":"另一种可能：你在题目里会选择的做法，不一定等于你目前在工作中已有权限或能力做到。下一步要用真实案例验证。",
    routes:direction,sevenDay:direction[0].action,
    caveat:"这是依据情境选择生成的探索性画像，不是经过信效度验证的心理量表，也不能计算个人岗位被替代、失业或转岗成功的概率。结果适合用来提出下一步要验证的问题。",
    generatedAt:new Date().toISOString(),
  };
}
