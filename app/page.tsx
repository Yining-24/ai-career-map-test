"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Copy, Download, Gift, LockKeyhole, RotateCcw, Sparkles, Upload } from "lucide-react";
import { questions, type Answers, type Report, type Route } from "../lib/assessment";
import { makeLongImage } from "../lib/long-image";
import { apiUrl, siteBase } from "../lib/api";

type LegacyReport = { title:string; subtitle:string; impactLine:string; valueLine:string; worryLine:string; routes:Route[]; sevenDay:string; caveat:string; coveredHours:number; totalHours:number; unknownHours:number; tasks:{label:string;hours:number;mode:string;impact:string;explanation:string;nextStep:string}[] };
type AnyReport = Report | LegacyReport;
type Stage = "welcome" | "quiz" | "result";
const isNew = (r:AnyReport):r is Report => "version" in r && r.version===2;
async function getJson(response:Response):Promise<any>{const data:any=await response.json();if(!response.ok)throw new Error(data.error||"操作失败");return data;}

export default function Home(){
  const [stage,setStage]=useState<Stage>("welcome");
  const [code,setCode]=useState("");
  const [remaining,setRemaining]=useState<number|null>(null);
  const [attemptId,setAttemptId]=useState("");
  const [resultId,setResultId]=useState("");
  const [report,setReport]=useState<AnyReport|null>(null);
  const [answers,setAnswers]=useState<Answers>({});
  const [step,setStep]=useState(0);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const [giftOpen,setGiftOpen]=useState(false);
  const [image,setImage]=useState<File|null>(null);
  const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const question=questions[step];
  const shareUrl=typeof window!=="undefined"&&resultId?`${window.location.origin}${siteBase}?r=${resultId}`:"";

  useEffect(()=>{
    const id=new URLSearchParams(window.location.search).get("r");
    const draft=sessionStorage.getItem("ai-career-draft");
    const last=sessionStorage.getItem("ai-career-last");
    if(draft&&!id){try{
      const saved=JSON.parse(draft);
      if(saved.attemptId){
        setCode(saved.code||"");setRemaining(saved.remaining??null);setAttemptId(saved.attemptId);
        setAnswers(saved.version===2?saved.answers||{}:{});
        setStep(saved.version===2?Math.min(saved.step||0,questions.length-1):0);
        setStage("quiz");
      }
    }catch{}}
    if(id){
      if(last){try{const saved=JSON.parse(last);if(saved.resultId===id){setCode(saved.code||"");setAttemptId(saved.attemptId||"");setRemaining(saved.remaining??null);}}catch{}}
      fetch(apiUrl(`/api/result/${id}`)).then(getJson).then(data=>{setReport(data.report);setResultId(id);setStage("result");}).catch(e=>setMessage(e.message));
    }
  },[]);
  useEffect(()=>{if(attemptId&&stage==="quiz")sessionStorage.setItem("ai-career-draft",JSON.stringify({version:2,code,remaining,attemptId,answers,step}));},[code,remaining,attemptId,answers,step,stage]);
  useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);

  async function check(){setBusy(true);setMessage("");try{const data=await getJson(await fetch(apiUrl("/api/code/check"),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code})}));setRemaining(data.remaining);if(!data.remaining)setMessage("此密码的测评次数已用完");}catch(e){setMessage((e as Error).message);}finally{setBusy(false);}}
  async function start(){setBusy(true);setMessage("");try{
    const data=await getJson(await fetch(apiUrl("/api/test/start"),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code})}));
    setAttemptId(data.attemptId);setRemaining(data.remaining);setAnswers({});setStep(0);setResultId("");setReport(null);setStage("quiz");history.replaceState(null,"",siteBase);
  }catch(e){setMessage((e as Error).message);}finally{setBusy(false);}}
  function choose(value:string){
    if(timer.current)clearTimeout(timer.current);
    setAnswers(previous=>({...previous,[question.id]:value}));
    setMessage("");
    if(step<questions.length-1)timer.current=setTimeout(()=>{setStep(current=>current+1);window.scrollTo(0,0);},250);
  }
  function back(){
    if(timer.current)clearTimeout(timer.current);
    setMessage("");
    if(step)setStep(step-1);else setStage("welcome");
    window.scrollTo(0,0);
  }
  async function finish(){
    if(!questions.every(q=>q.options.some(o=>o.text===answers[q.id])))return;
    setBusy(true);setMessage("");
    try{
      const data=await getJson(await fetch(apiUrl("/api/test/submit"),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({attemptId,answers})}));
      setReport(data.report);setResultId(data.resultId);setStage("result");
      sessionStorage.removeItem("ai-career-draft");
      sessionStorage.setItem("ai-career-last",JSON.stringify({code,attemptId,remaining,resultId:data.resultId}));
      history.replaceState(null,"",`${siteBase}?r=${data.resultId}`);window.scrollTo(0,0);
    }catch(e){setMessage((e as Error).message);}finally{setBusy(false);}
  }
  async function save(){
    if(!report)return;setBusy(true);setMessage("");
    try{
      const blob=await makeLongImage(report),file=new File([blob],`AI岗位测评-${new Date().toISOString().slice(0,10)}.png`,{type:"image/png"});
      const isMobile=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if(isMobile&&navigator.canShare?.({files:[file]})&&navigator.share)await navigator.share({files:[file],title:"我的AI岗位测评结果"});
      else{const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);setMessage("长图已下载。手机上可从下载文件中保存到相册。");}
    }catch(e){if((e as Error).name!=="AbortError")setMessage((e as Error).message);}finally{setBusy(false);}
  }
  async function copy(){try{await navigator.clipboard.writeText(shareUrl);setMessage("结果链接已复制，可以直接发给朋友。");}catch{setMessage("复制失败，请复制浏览器地址栏中的链接。");}}
  async function submitGift(){
    if(!image||!attemptId||!resultId){setMessage("请用完成测评的设备提交评价截图。");return;}
    setBusy(true);setMessage("");
    try{const form=new FormData();form.append("image",image);form.append("attemptId",attemptId);form.append("resultId",resultId);await getJson(await fetch(apiUrl("/api/review/submit"),{method:"POST",body:form}));setGiftOpen(false);setMessage("已提交审核。通过后原密码自动增加 1 次机会。");}
    catch(e){setMessage((e as Error).message);}finally{setBusy(false);}
  }

  return <div className="site-shell">
    <header className="topbar"><a className="brand" href={siteBase}><span className="brand-mark">↗</span>明日工作 <small>/ NEXT WORK</small></a><span className="top-note">关于 AI 与你的工作，做一次有用的推演</span><span className="top-pill">内测版 · 中文</span></header>
    <main>
      {stage==="welcome"&&<section className="hero wrap"><div className="hero-copy"><div className="eyebrow"><Sparkles size={16}/> 12 道单选题 · 约 3 分钟</div><h1>AI 会动到我的工作吗？<br/><em>来走一遍真实处境。</em></h1><p className="lead">AI 十分钟写完初稿、客服机器人接手常见问题、招聘突然要求会用 AI……你会怎么选？做完后看看工作里最可能变化的环节，以及下一步值得验证的方向。</p><div className="hero-points"><span>① 情境选择</span><span>② 工作变化画像</span><span>③ 一步可做的转向尝试</span></div><p className="hero-foot">无需填写学历、收入、工时或公司资料。结果不计算个人失业概率。</p></div><div className="entry-card"><div className="card-icon"><LockKeyhole size={24}/></div><p className="card-kicker">你的专属入口</p><h2>输入测评密码</h2><p className="muted">每个密码可开始 3 次。返回修改答案不会额外扣次数。</p><label className="input-label" htmlFor="access-code">测评密码</label><input id="access-code" value={code} onChange={e=>{setCode(e.target.value.toUpperCase());setRemaining(null);setMessage("");}} placeholder="例如 AI-XXXXX-XXXXX" autoComplete="off"/><button className="main-button" onClick={remaining===null?check:start} disabled={busy||!code.trim()||remaining===0}>{busy?"请稍候…":remaining===null?"验证密码":"开始测评"}<ArrowRight size={18}/></button>{remaining!==null&&<div className="remaining">还可开始 <b>{remaining}</b> 次</div>}{message&&<p className="notice" role="status">{message}</p>}<div className="card-bottom"><span>手机与电脑均可用</span><span>结果支持长图与分享</span></div></div></section>}
      {stage==="quiz"&&<section className="quiz-wrap"><div className="quiz-top"><button className="text-button" onClick={back}><ArrowLeft size={17}/> {step?"上一题":"返回首页"}</button><span>第 {step+1} / {questions.length} 题</span></div><div className="progress"><div style={{width:`${Math.round((step+1)/questions.length*100)}%`}}/></div><div className="quiz-card"><div className="quiz-eyebrow">如果是你 · 职场情境 {String(step+1).padStart(2,"0")}</div><h2>{question.title}</h2>{question.scene&&<p className="scene-line">{question.scene}</p>}<div className="choice-list">{question.options.map((option,index)=><button type="button" className={`choice scenario-choice ${answers[question.id]===option.text?"chosen":""}`} key={option.text} onClick={()=>choose(option.text)}><span className="choice-letter">{String.fromCharCode(65+index)}</span><span>{option.text}</span><i>{answers[question.id]===option.text?<Check size={15}/>:<ArrowRight size={15}/>}</i></button>)}</div>{message&&<p className="notice" role="status">{message}</p>}<div className="quiz-actions"><button className="secondary-button" onClick={back}><ArrowLeft size={17}/> 上一步</button>{step===questions.length-1?<button className="main-button" disabled={!answers[question.id]||busy} onClick={finish}>{busy?"生成中…":"查看我的结果"}<ArrowRight size={18}/></button>:<span className="quiz-hint">选一项，自动进入下一题</span>}</div></div><div className="quiz-aside"><b>答题提醒</b><p>选择你更可能真的会做的事；答案可以随时返回修改。</p></div></section>}
      {stage==="result"&&report&&<section className="result-wrap"><div className="result-banner"><div className="eyebrow light"><Sparkles size={15}/> 你的 AI 职场画像</div><h1>{report.title}</h1><p>{report.subtitle}</p><div className="result-meta">{isNew(report)?<><span>工作变化信号：{report.signal}</span><span>根据 11 个情境选择生成</span></>:<><span>已盘点 {report.coveredHours}/{report.totalHours} 小时工作</span><span>还有 {report.unknownHours} 小时未分类</span></>}</div></div><div className="result-grid"><div className="result-main"><article className="result-panel"><div className="section-label">01 / 工作会怎么变</div><h2>{isNew(report)?"不是猜裁员概率，而是看你站在哪一环":"先看工作环节，别猜裁员概率"}</h2><p className="body-large">{report.impactLine}</p>{isNew(report)?<div className="evidence-box"><b>你的选择与一道识错挑战</b>{report.evidence.map(line=><p key={line}>{line}</p>)}</div>:<div className="task-results">{report.tasks.map((task,index)=><div className="task-result" key={index}><div className="task-head"><span>{String(index+1).padStart(2,"0")}</span><b>{task.label}</b><em>{task.hours}小时／周</em></div><div className="task-tags"><span>{task.mode}</span><span>{task.impact}</span></div><p>{task.explanation}</p><small>可以先做：{task.nextStep}</small></div>)}</div>}</article><article className="result-panel"><div className="section-label">02 / 意外的提醒</div><h2>最值得保留的，不一定是你现在最忙的</h2><p className="body-large">{report.valueLine}</p><p className="muted">{report.worryLine}</p>{isNew(report)&&<p className="hint">{report.counterpoint}</p>}</article><article className="result-panel"><div className="section-label">03 / 可以试的方向</div><h2>先验证相邻工作，不急着辞职重来</h2>{report.routes.length?report.routes.map((route,index)=><div className="route-card" key={route.title}><div className="route-number">0{index+1}</div><div><h3>{route.title}</h3><p><b>为什么接得上：</b>{route.why}</p><p><b>还缺什么：</b>{route.gap}</p><p><b>先试一步：</b>{route.action}</p></div></div>):<p className="body-large">目前先不强行推荐转岗。可以先在现有岗位积累需要判断或协调的具体案例。</p>}</article><article className="action-panel"><span>未来七天</span><h2>先做这一件小事</h2><p>{report.sevenDay}</p></article><p className="disclaimer">{report.caveat}</p></div><aside className="result-sidebar"><div className="save-card"><div className="card-icon"><Download size={22}/></div><h3>把这份答案带走</h3><p>保存完整长图，或复制链接给朋友。</p><button className="main-button" onClick={save} disabled={busy}><Download size={18}/> 保存结果长图</button><button className="outline-button" onClick={copy}><Copy size={18}/> 复制结果链接</button><div className="save-note">手机支持系统分享时可选“存储图像”；否则下载 PNG 文件。</div></div><div className="more-card"><h3>还想再测一次？</h3><p>换一个阶段，或按另一份工作的经历重新回答。</p><div className="more-count">当前密码剩余 <b>{remaining??"—"}</b> 次</div><button className="outline-button" onClick={()=>{if(!code){setStage("welcome");setMessage("请重新输入原密码");return;}start();}} disabled={busy||remaining===0}><RotateCcw size={18}/> 再测一次</button><button className="gift-link" onClick={()=>setGiftOpen(true)}><Gift size={18}/> 好评有礼 · 赠送 1 次</button></div></aside></div>{message&&<div className="toast" role="status">{message}<button onClick={()=>setMessage("")}>×</button></div>}</section>}
    </main><footer className="footer"><span>明日工作 / NEXT WORK</span><span>请勿填写公司机密或客户资料。</span></footer>
    {giftOpen&&<div className="modal-backdrop" onClick={()=>setGiftOpen(false)}><div className="modal" onClick={event=>event.stopPropagation()}><button className="modal-close" onClick={()=>setGiftOpen(false)}>×</button><div className="card-icon"><Gift size={23}/></div><h2>好评有礼</h2><p>发布真实评价后，上传评价截图。人工审核通过，当前密码增加 1 次机会。每个密码限领一次。</p><div className="upload-zone"><Upload size={20}/><label htmlFor="gift-image">选择评价截图</label><input id="gift-image" type="file" accept="image/png,image/jpeg,image/webp" onChange={event=>setImage(event.target.files?.[0]||null)}/><small>{image?image.name:"JPG、PNG 或 WebP，最大 5MB"}</small></div><button className="main-button" onClick={submitGift} disabled={!image||busy}>{busy?"提交中…":"提交审核"}<ArrowRight size={18}/></button><p className="modal-note">请遮挡私人资料。评价应真实，审核不要求好评措辞。</p></div></div>}
  </div>;
}
