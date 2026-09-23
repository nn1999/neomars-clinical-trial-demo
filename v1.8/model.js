/* NeoMARS demo domain state. No clinical services are contacted. */
const N=(()=>{
 const KEY='cx-pku-fanzq-neomars-v1.8';
 const stages=['筛选期 · Day−28','导入期 · 入组准备','来曲唑导入','两周评估','分层治疗','治疗结束 / 手术'];
 const arms={1:'来曲唑＋达尔西利',2:'来曲唑',3:'来曲唑＋达尔西利',4:'来曲唑'};
 const docs={record:'既往病理',baseline:'首次穿刺病理',gene:'EPclin基因报告',second:'第二次穿刺病理',outside:'外院处方 / 病历',lab:'化验报告',imaging:'影像报告',image:'症状照片',surgery:'术后病理',operation:'手术记录',discharge:'出院记录',followup:'复查资料'};
 const initial=()=>({version:1,patient:{name:'林女士',id:'NM-001',age:56},stage:0,day:1,cycle:1,screen:'待提交',screenReason:'',facts:false,consents:{project:null,epclin:null},qlq:{},qlqDraft:{},reports:[],meds:{},tasks:{},aes:[],calls:[],messages:[],logs:[],quality:{},favorite:[],risk:'低危',baseKi:30,nextKi:18,arm:null,groupConfirmed:false,randomNo:'',treatmentReady:false,weeklyDone:false,mode:'AI电话',started:false});
 let s;try{s=JSON.parse(localStorage.getItem(KEY))||initial()}catch{s=initial()}
 const save=()=>localStorage.setItem(KEY,JSON.stringify(s));
 const time=()=>new Date().toLocaleString('zh-CN',{hour12:false});
 const log=(text,role='研究系统')=>{s.logs.unshift({text,role,time:time()});save()};
 const reduction=(b,r)=>Number.isFinite(b)&&Number.isFinite(r)&&b>0&&b<=100&&r>=0&&r<=100?(b-r)/b*100:null;
 const stratify=(risk,b,r)=>{let n=reduction(b,r);return n===null?null:risk==='低危'&&n>=20?4:risk==='高危'&&n<20?1:'random'};
 const medPlan=()=>s.stage<2||s.stage>4?[]:[{key:'let',name:'来曲唑',rest:false},...(s.stage===4&&[1,3].includes(s.arm)?[{key:'dal',name:'达尔西利',rest:s.day>21}]:[])];
 const medKey=(drug)=>`${s.stage===3?2:s.stage}-${s.cycle}-${s.day}-${drug}`;
 const sampleReport=(type)=>({id:'R'+Date.now()+Math.random().toString(36).slice(2,5),type,name:docs[type]+'（模拟原文）',date:time(),sample:true,screeningEvidence:({record:[0],baseline:[1],imaging:[2,11],lab:[3,12]})[type]||[],confirmed:true});
 const cohort=[{id:'NM-001',name:'林女士',age:56,arm:3,stage:'C3',scores:{A:[68,74,79],B:[28,22,18]}},{id:'NM-002',studyStage:5,name:'赵女士',age:52,arm:1,stage:'C6',scores:{A:[62,68,73],B:[34,30,25]}},{id:'NM-003',name:'周女士',age:61,arm:2,stage:'C3',scores:{A:[74,78,null],B:[22,18,null]}},{id:'NM-004',name:'陈女士',age:48,arm:4,stage:'C6',scores:{A:[72,81,86],B:[25,17,12]}},{id:'NM-005',name:'李女士',age:58,arm:3,stage:'C6',scores:{A:[66,71,77],B:[32,27,22]}},{id:'NM-006',studyStage:2,name:'吴女士',age:54,arm:null,stage:'D7',scores:{A:[60,null,null],B:[38,null,null]}}];
 function scenario(type){let special=type;if(['ae','rest','chatAE','surgery','postop','efs'].includes(type))type='c3';let end=type.endsWith('end'),first=type==='c1';if(end)type=type.slice(0,-3);if(first)type='c3';s=initial();if(type!=='screen'){s.facts=true;s.screenAnswers={4:'有',5:'有',6:'无',7:'无',8:'无',9:'无',10:'无',13:'无'};s.screen='已入组';s.qlq={'基线-A':{answers:[2,2,1],date:time()},'基线-B':{answers:[2,1,2],date:time()}};s.reports=['record','baseline','lab','imaging'].map(sampleReport);s.stage=2;s.day=7;s.started=true;s.firstDose='2026-06-17';}
 if(['d14','c3','c6'].includes(type)){s.stage=3;s.day=14;if(type!=='d14')s.reports.push(sampleReport('gene'),sampleReport('second'));s.tasks.biopsy=type!=='d14';s.tasks.slides=type!=='d14';}
 if(['c3','c6'].includes(type)){s.stage=4;s.cycle=type==='c3'?3:6;s.day=7;s.risk='高危';s.arm=3;s.randomNo='DEMO-R-003';s.groupConfirmed=true;s.treatmentReady=true;s.treatmentStart='2026-07-01';if(type==='c6')s.qlq['C3-A']={answers:[2,1,1],date:time()};}
 if(end)s.day=28;if(s.stage===4&&s.cycle>1)s.tasks['blood-before']=true;if(first){s.cycle=1;s.day=1;delete s.tasks['blood-before'];}if(['surgery','postop','efs'].includes(special)){s.stage=5;s.cycle=6;s.day=28;s.followNode=special;s.followMonth=24;if(special!=='surgery'){s.tasks.surgery=true;s.tasks.surgeryDate='2027-01-15';s.surgeryConfirmed={role:'研究医生',date:s.tasks.surgeryDate};}}if(special==='rest')s.day=22;if(special==='prep'){s.qlq={};s.stage=1;s.started=false;delete s.firstDose;s.screen='预审通过';}log('载入演示场景：'+type,'演示控制');save();return s;}
 const today=()=>{let d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
 function syncIntro(now=today()){if(s.stage===1&&s.introConfirmed&&s.firstDose<=now){s.stage=2;s.day=Math.min(14,Math.max(1,Math.floor((Date.parse(now)-Date.parse(s.firstDose))/86400000)+1));s.started=true;s.screen='已入组';}}
 function confirmIntroDate(date,now=today()){if(s.stage!==1)return '当前不处于导入准备';if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date)return '请填写有效日期';s.firstDose=date;s.introConfirmed={date,at:time(),role:'研究医生'};syncIntro(now);save();return '';}
 return {today,syncIntro,confirmIntroDate,get s(){return s},KEY,stages,arms,docs,initial,save,log,time,reduction,stratify,medPlan,medKey,sampleReport,scenario,cohort};
})();
