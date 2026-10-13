import type { Report } from "./assessment";
type LegacyReport = { title:string; subtitle:string; impactLine:string; valueLine:string; routes:{title:string;why:string;gap:string;action:string}[]; sevenDay:string; caveat:string; coveredHours:number; totalHours:number; unknownHours:number; tasks:{label:string;hours:number;mode:string;explanation:string}[] };

function lines(ctx: CanvasRenderingContext2D, text: string, width: number) {
  const out: string[]=[];let line="";
  for(const c of text){if(line&&ctx.measureText(line+c).width>width){out.push(line);line=c;}else line+=c;}
  if(line)out.push(line);return out;
}

export async function makeLongImage(report: Report | LegacyReport): Promise<Blob> {
  const canvas=document.createElement("canvas");canvas.width=1080;
  const ctx=canvas.getContext("2d");if(!ctx)throw new Error("当前浏览器无法生成图片");
  const blocks:{text:string;size:number;bold:boolean;color:string;gap:number}[]=[];
  const add=(text:string,size=32,bold=false,color="#24354a",gap=24)=>blocks.push({text,size,bold,color,gap});
  add("明日工作  /  NEXT WORK",26,true,"#0d8b80",26);
  add("AI 会淘汰我吗？",36,true,"#5b6a7b",20);
  add(report.title,68,true,"#172a42",18);
  add(report.subtitle,30,false,"#536478",56);
  add("01  工作环节会怎样变化",37,true,"#172a42",20);
  add(report.impactLine,31,false,"#24354a",22);
  if(!("tasks" in report)){
    add(`工作变化信号：${report.signal}`,27,true,"#0d8b80",26);
    report.evidence.forEach(item=>add(item,27,false,"#536478",9));
    add(report.counterpoint,26,false,"#718094",35);
  }else{
    add(`已盘点 ${report.coveredHours}/${report.totalHours} 小时；${report.unknownHours} 小时未分类`,26,false,"#718094",38);
    report.tasks.forEach((t,i)=>{add(`${i+1}. ${t.label} · 每周${t.hours}小时`,32,true,"#0d8b80",10);add(`${t.mode} / ${t.explanation}`,29,false,"#24354a",24);});
  }
  add("02  你已有的价值",37,true,"#172a42",20);add(report.valueLine,31,false,"#24354a",42);
  add("03  值得验证的方向",37,true,"#172a42",20);
  if(!report.routes.length)add("目前先不强行推荐转岗。先把现有工作里需要判断与协作的证据做实。",31,false,"#24354a",22);
  report.routes.forEach((r,i)=>{add(`${i+1}. ${r.title}`,33,true,"#0d8b80",12);add(`接得上：${r.why}`,29,false,"#24354a",9);add(`还缺：${r.gap}`,29,false,"#24354a",9);add(`先试：${r.action}`,29,false,"#24354a",26);});
  add("未来七天，先做这件事",37,true,"#172a42",18);add(report.sevenDay,31,false,"#24354a",48);
  add(report.caveat,25,false,"#778495",10);
  let y=110;const prepared=blocks.map(b=>{ctx.font=`${b.bold?"700":"400"} ${b.size}px "PingFang SC","Microsoft YaHei",sans-serif`;const ls=lines(ctx,b.text,930);y+=ls.length*b.size*1.55+b.gap;return {...b,ls};});
  canvas.height=Math.ceil(y+100);ctx.fillStyle="#f7f5f0";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle="#0d8b80";ctx.fillRect(0,0,canvas.width,15);
  y=110;for(const b of prepared){ctx.font=`${b.bold?"700":"400"} ${b.size}px "PingFang SC","Microsoft YaHei",sans-serif`;ctx.fillStyle=b.color;for(const line of b.ls){ctx.fillText(line,75,y);y+=b.size*1.55;}y+=b.gap;}
  return await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error("图片生成失败")),"image/png"));
}
