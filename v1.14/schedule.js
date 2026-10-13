/* Pure date/task adapter. Monthly visits follow the original calendar-day anchor. */
const Schedule=(()=>{
 const iso=d=>d.toISOString().slice(0,10),parse=s=>new Date(s+'T12:00:00Z');
 function addDays(s,n){let d=parse(s);d.setUTCDate(d.getUTCDate()+n);return iso(d)}
 function month(s,n){let d=parse(s),y=d.getUTCFullYear(),m=d.getUTCMonth()+n,day=d.getUTCDate(),last=new Date(Date.UTC(y,m+1,0)).getUTCDate();return iso(new Date(Date.UTC(y,m,Math.min(day,last),12)))}
 const date=(s,d=s.day)=>s.stage===4&&s.treatmentStart?addDays(s.treatmentStart,(s.cycle-1)*28+d-1):s.firstDose?addDays(s.firstDose,d-1):null;
 const weekKey=(s,d=s.day)=>`weekly-C${s.cycle}-D${d}`;
 const restKey=(s,d=s.day)=>`rest-C${s.cycle}-D${d}`;
 function visits(s){return s.treatmentStart?Array.from({length:6},(_,i)=>({date:month(s.treatmentStart,i+1),n:i+1})):[]}
 function tasks(s,d=s.day){let out=[];if(s.stage<2||s.stage>4)return out;
 const meds=[{key:'let',name:'来曲唑'},...(s.stage===4&&[1,3].includes(s.arm)?[{key:'dal',name:'达尔西利'}]:[])];
 for(let m of meds)if(!(m.key==='dal'&&d>21))out.push({id:'med-'+m.key,title:m.name,action:'med',value:m.key,hint:'每天一次 · 按确认的处方',done:!!s.meds[TrialUI.medKey(s,m.key,d)]});
 if(s.stage===4&&[1,3].includes(s.arm)&&d>=22&&d<=28)out.push({id:restKey(s,d),title:'今天是达尔西利停药日',hint:'今天不服用达尔西利 · 来曲唑按处方继续',action:'restDay',value:d,rest:true,done:!!s.tasks[restKey(s,d)]});
 if(s.stage<4&&d===14){out.push({id:'biopsy',title:'第二次穿刺',action:'education',value:'biopsy',done:!!s.tasks.biopsy},{id:'slides',title:'借阅病理白片',action:'education',value:'slides',done:!!s.tasks.slides},{id:'assessment',title:'上传基因及二次病理',action:'assessmentReports',value:'',done:['gene','second'].every(k=>s.reports.some(r=>r.type===k))})}
 if(s.stage===4){if(d%7===0)out.push({id:weekKey(s,d),title:'每周身体情况随访',action:'weeklyChoice',value:'',done:!!s.tasks[weekKey(s,d)],weekly:true});
 if([3,6].includes(s.cycle)&&d===28)for(let k of ['A','B'])out.push({id:`C${s.cycle}-${k}`,title:`C${s.cycle} · QLQ 量表 ${k}`,action:'openQLQ',value:`C${s.cycle}-${k}`,done:!!s.qlq[`C${s.cycle}-${k}`]});
 if(s.cycle===1&&d===1&&s.risk==='高危')out.push({id:'blood-before',title:'治疗前 · 20 ml 科研血',action:'education',value:'blood',hint:'首次分层治疗前完成采集',done:!!s.tasks['blood-before']});
 if(s.cycle===6&&d===28)out.push({id:'blood-end',title:'治疗结束 · 20 ml 科研血',action:'education',value:'blood',done:!!s.tasks['blood-end']},{id:'surgery',title:'手术准备',action:'education',value:'surgery',done:!!s.tasks.surgery});
 for(let v of visits(s))if(v.date===date(s,d))out.push({id:'visit-'+v.date,title:'每月复查 · 第'+v.n+'次',action:'monthlyVisit',value:v.date,hint:'按首次治疗日的自然月同日预约',done:!!s.tasks['visit-'+v.date]});}
 return out}
 const complete=(s,d)=>{let t=tasks(s,d);return t.length>0&&t.every(x=>x.done)};
 const efsVisits=s=>s.treatmentStart?Array.from({length:8},(_,i)=>({month:(i+1)*3,date:month(s.treatmentStart,(i+1)*3)})):[];
 const qlqOpen=(s,key)=>key.startsWith('术后半年')?s.stage===5&&s.followNode==='postop':!!s.qlq[key]||(key.startsWith('基线')?s.stage>=1: s.stage===4&&s.cycle>=+key[1]&&(s.cycle>+key[1]||s.day===28));
 return{efsVisits,addDays,month,date,visits,tasks,complete,weekKey,restKey,qlqOpen};
})();
