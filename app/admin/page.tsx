"use client";

import { useState } from "react";
import { ArrowRight, Copy, Download, Gift, KeyRound, RefreshCw, ShieldCheck } from "lucide-react";
import { apiUrl, siteBase } from "../../lib/api";

type Claim={id:string;result_id:string;status:string;created_at:string};
type CodeRow={id:string;password:string|null;remaining:number;createdAt:string;batchId:string|null;status:"available"|"used"};
type Batch={id:string;note:string;count:number;created_at:string};
type CodeData={batches:Batch[];selectedBatchId:string;codes:CodeRow[];totals:{total:number;available:number}};
async function data(response:Response):Promise<any>{const result:any=await response.json();if(!response.ok)throw new Error(result.error||"操作失败");return result;}
const date=(value:string)=>new Date(value).toLocaleString("zh-CN",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"});

export default function Admin(){
  const [key,setKey]=useState("");
  const [unlocked,setUnlocked]=useState(false);
  const [count,setCount]=useState(10);
  const [note,setNote]=useState("");
  const [batchFilter,setBatchFilter]=useState("latest");
  const [codeData,setCodeData]=useState<CodeData|null>(null);
  const [claims,setClaims]=useState<Claim[]>([]);
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);
  const [imageUrl,setImageUrl]=useState("");
  const headers={"x-admin-key":key};

  async function load(filter=batchFilter){
    setBusy(true);setMessage("");
    try{
      const [passwords,reviews]=await Promise.all([
        data(await fetch(apiUrl(`/api/admin/codes?batch=${encodeURIComponent(filter)}`),{headers})),
        data(await fetch(apiUrl("/api/admin/reviews"),{headers})),
      ]);
      setCodeData(passwords);setClaims(reviews.reviews);setUnlocked(true);setBatchFilter(filter);
    }catch(e){setMessage((e as Error).message);setUnlocked(false);}finally{setBusy(false);}
  }
  async function generate(){
    setBusy(true);setMessage("");
    try{
      const result=await data(await fetch(apiUrl("/api/admin/codes"),{method:"POST",headers:{...headers,"Content-Type":"application/json"},body:JSON.stringify({count,note})}));
      const filter=result.batchId as string;
      const [passwords,reviews]=await Promise.all([
        data(await fetch(apiUrl(`/api/admin/codes?batch=${encodeURIComponent(filter)}`),{headers})),
        data(await fetch(apiUrl("/api/admin/reviews"),{headers})),
      ]);
      setCodeData(passwords);setClaims(reviews.reviews);setBatchFilter(filter);setNote("");
      setMessage(`已生成 ${result.codes.length} 个密码，并保存为一个批次。可随时回来查看或导出。`);
    }catch(e){setMessage((e as Error).message);}finally{setBusy(false);}
  }
  async function review(id:string,decision:"approved"|"rejected"){
    setBusy(true);setMessage("");
    try{
      await data(await fetch(apiUrl("/api/admin/review-decision"),{method:"POST",headers:{...headers,"Content-Type":"application/json"},body:JSON.stringify({id,decision})}));
      const [passwords,reviews]=await Promise.all([
        data(await fetch(apiUrl(`/api/admin/codes?batch=${encodeURIComponent(batchFilter)}`),{headers})),
        data(await fetch(apiUrl("/api/admin/reviews"),{headers})),
      ]);
      setCodeData(passwords);setClaims(reviews.reviews);
      setMessage(decision==="approved"?"已通过，原密码增加 1 次。":"已拒绝申请。");
    }catch(e){setMessage((e as Error).message);}finally{setBusy(false);}
  }
  async function showImage(id:string){
    try{const response=await fetch(apiUrl(`/api/admin/review-image?id=${id}`),{headers});if(!response.ok)throw new Error("无法读取图片");const url=URL.createObjectURL(await response.blob());if(imageUrl)URL.revokeObjectURL(imageUrl);setImageUrl(url);}
    catch(e){setMessage((e as Error).message);}
  }
  async function copy(password:string){
    try{await navigator.clipboard.writeText(password);setMessage("密码已复制。");}
    catch{setMessage("复制失败，请手动选择密码。");}
  }
  function download(){
    const rows=(codeData?.codes||[]).filter(row=>row.password);
    if(!rows.length){setMessage("当前列表没有可导出的明文密码。");return;}
    const csv="\uFEFFpassword,remaining_uses,status\r\n"+rows.map(row=>`${row.password},${row.remaining},${row.status}`).join("\r\n");
    const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});
    const url=URL.createObjectURL(blob),anchor=document.createElement("a");
    anchor.href=url;anchor.download=`测评密码-${new Date().toISOString().slice(0,10)}.csv`;anchor.click();
    setTimeout(()=>URL.revokeObjectURL(url),10000);
  }
  function changeKey(value:string){setKey(value);setUnlocked(false);setCodeData(null);setClaims([]);setMessage("");}

  return <main className="admin-wrap">
    <a href={siteBase} className="brand"><span className="brand-mark">↗</span>明日工作 <small>/ 管理后台</small></a>
    <div className="admin-heading"><div><span className="quiz-eyebrow">SITE CONTROL</span><h1>密码管理后台</h1><p>批量生成测评密码，查看使用状态，处理评价奖励。</p></div><div className="admin-heading-icon"><KeyRound size={26}/></div></div>
    <section className="admin-card admin-login"><div className="admin-section-head"><div className="card-icon"><ShieldCheck size={23}/></div><div><h2>管理员验证</h2><p>只有持有管理密钥的人可以查看和生成密码。密钥仅保留在此页面，不写入浏览器存储。</p></div></div><div className="admin-login-row"><input type="password" value={key} onChange={event=>changeKey(event.target.value)} onKeyDown={event=>{if(event.key==="Enter"&&key&&!busy)load();}} placeholder="输入管理密钥" aria-label="管理密钥"/><button className="main-button" disabled={!key||busy} onClick={()=>load()}>{busy?"请稍候…":unlocked?"刷新后台":"进入后台"}<ArrowRight size={17}/></button></div>{message&&<p className="notice" role="status">{message}</p>}</section>
    {unlocked&&codeData&&<>
      <div className="admin-stats"><div><span>密码总数</span><strong>{codeData.totals.total}</strong></div><div><span>仍可使用</span><strong>{codeData.totals.available}</strong></div><div><span>已建批次</span><strong>{codeData.batches.length}</strong></div></div>
      <section className="admin-card"><div className="admin-section-head"><div className="card-icon"><KeyRound size={23}/></div><div><h2>批量生成密码</h2><p>每个新密码默认可开始 3 次测评。新批次会保存在数据库中。</p></div></div><div className="admin-form"><label htmlFor="generate-count">生成数量</label><input id="generate-count" type="number" min={1} max={200} value={count} onChange={event=>setCount(Number(event.target.value))}/><small>每批 1—200 个；随机密码不含易混淆字符。</small><label htmlFor="batch-note">批次备注 <span>可选</span></label><input id="batch-note" value={note} maxLength={60} onChange={event=>setNote(event.target.value)} placeholder="例如：10月新客 / 小红书"/><button className="main-button" disabled={busy||!Number.isInteger(count)||count<1||count>200} onClick={generate}>生成并保存密码 <ArrowRight size={18}/></button></div></section>
      <section className="admin-card"><div className="admin-list-head"><div><h2>密码列表</h2><p>显示当前筛选的最近 200 个密码；旧批次只存哈希，不能恢复明文。</p></div><div className="admin-list-actions"><select value={batchFilter} onChange={event=>load(event.target.value)} aria-label="选择密码批次"><option value="latest">最近生成</option><option value="all">全部密码</option>{codeData.batches.map(batch=><option value={batch.id} key={batch.id}>{batch.note||date(batch.created_at)} · {batch.count} 个</option>)}</select><button className="outline-button" onClick={download} disabled={!codeData.codes.some(row=>row.password)}><Download size={17}/> 导出当前列表</button><button className="icon-button" aria-label="刷新密码列表" onClick={()=>load()} disabled={busy}><RefreshCw size={18}/></button></div></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>测评密码</th><th>剩余次数</th><th>状态</th><th>生成时间</th></tr></thead><tbody>{codeData.codes.map(row=><tr key={row.id}><td><div className="code-cell"><code>{row.password||"旧密码 · 明文不可恢复"}</code>{row.password&&<button className="icon-button" aria-label={`复制密码 ${row.password}`} onClick={()=>copy(row.password!)}><Copy size={15}/></button>}</div></td><td><b>{row.remaining}</b> 次</td><td><span className={`status-pill ${row.status}`}>{row.status==="available"?"可使用":"已用完"}</span></td><td>{date(row.createdAt)}</td></tr>)}</tbody></table>{!codeData.codes.length&&<p className="admin-empty">这个筛选下还没有密码。</p>}</div></section>
      <section className="admin-card"><div className="admin-section-head"><div className="card-icon"><Gift size={23}/></div><div><h2>评价奖励审核</h2><p>核对真实评价截图后，给原密码增加 1 次测评机会。</p></div></div>{claims.length?claims.map(claim=><div className="admin-claim" key={claim.id}><div><b>{claim.status==="pending"?"待审核":claim.status==="approved"?"已通过":"已拒绝"}</b><small>{date(claim.created_at)}</small></div><button className="outline-button" onClick={()=>showImage(claim.id)}>查看截图</button>{claim.status==="pending"&&<><button className="main-button" onClick={()=>review(claim.id,"approved")} disabled={busy}>通过 +1 次</button><button className="secondary-button" onClick={()=>review(claim.id,"rejected")} disabled={busy}>拒绝</button></>}</div>):<p className="admin-empty">暂无评价申请。</p>}{imageUrl&&<img className="admin-image" src={imageUrl} alt="用户提交的评价截图"/>}</section>
    </>}
  </main>;
}
