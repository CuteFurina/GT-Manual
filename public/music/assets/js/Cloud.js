import{u as e,g as a,_ as s}from"./SongList.js";import{_ as t,e as l,E as o,q as n,B as u,d as i,F as r}from"./index.js";import{r as c,g as d,G as f,am as p,al as g,J as m,k as _,j as y,n as h,P as v,L as k,T as w,K as C,i as b,R as z,X as x,Y as U,W as $,a1 as j,O as B,ao as M,b2 as S,af as D,ag as F,ai as G,ac as I,f as L,aX as P,aa as R,ad as q,a0 as X}from"./vendor.js";import"./Pagination.js";const A={class:"progress"},E=t({__name:"UpCloudSong",emits:["getUserCloudData"],setup(a,{expose:s,emit:t}){const o=c(!1),n=c(null),u=c([]),i=t,r=e=>{if(!e)return!1;let a=Array.from(e.target.files);a.length>5&&(a=a.slice(0,5),$message.warning("最多只能同时上传 5 首歌曲")),u.value=[],o.value=!0,a.map((e=>{u.value.push({file:e,name:e.name,path:e.path,size:(e.size/1048576).toFixed(2),status:"wait"})})),L(u.value),n.value.value=null},L=async a=>{try{if(!a)return!1;const s=(e,a)=>{const{loaded:s,total:t}=e,l=Math.round(100*s/t);a.status=Number(l)};let t=0;for(const l of a)if(l&&l.file){l.file;const a=await e(l.file,(e=>s(e,l)));200===a.code&&t++,l.status=200===a.code?"success":"error"}a.length,0===t?$message.error("全部歌曲上传失败"):t<a.length?$message.warning("歌曲上传已完成，部分歌曲上传失败"):$message.success("全部歌曲上传已完成"),0!==t&&i("getUserCloudData",!0)}catch(s){console.error("上传歌曲出现错误:",s),$message.error("上传歌曲出现错误，请重试")}};return s({openUpSongModal:()=>{n.value.click()}}),(e,a)=>{const s=l,t=$,i=j,c=B,P=M,R=S,q=D,X=F,E=G,J=I;return d(),f(C,null,[p(m("input",{ref_key:"fileChooseRef",ref:n,type:"file",accept:"audio/*",multiple:"",onChange:r},null,544),[[g,!1]]),_(w,{name:"fade",mode:"out-in"},{default:y((()=>[h(u)?.length?(d(),f("div",{key:0,class:"open-list",onClick:a[0]||(a[0]=e=>o.value=!0)},[_(P,{trigger:"hover",placement:"right"},{trigger:y((()=>[_(i,{size:"large",round:"",strong:"",secondary:""},{icon:y((()=>[_(t,null,{default:y((()=>[_(s,{icon:"cloud-clock"})])),_:1})])),_:1})])),default:y((()=>[_(c,null,{default:y((()=>[v("上传列表")])),_:1})])),_:1})])):k("",!0)])),_:1}),_(J,{show:h(o),"onUpdate:show":a[1]||(a[1]=e=>U(o)?o.value=e:null),"auto-focus":!1,"mask-closable":!1,bordered:!1,"close-on-esc":!1,class:"up-song",title:"上传歌曲",preset:"card","transform-origin":"center"},{default:y((()=>[_(E,{class:"up-songs-list",hoverable:"",clickable:""},{default:y((()=>[(d(!0),f(C,null,x(h(u),((e,a)=>(d(),b(X,{key:a,class:"song"},{prefix:y((()=>[_(t,{size:"20"},{default:y((()=>[_(s,{icon:"music-note"})])),_:1})])),suffix:y((()=>[_(w,{name:"fade",mode:"out-in"},{default:y((()=>["error"===e.status?(d(),b(i,{key:0,quaternary:"",onClick:a=>L([e])},{icon:y((()=>[_(t,{size:"20"},{default:y((()=>[_(s,{icon:"refresh"})])),_:1})])),_:2},1032,["onClick"])):k("",!0)])),_:2},1024)])),default:y((()=>[_(q,{title:e.name},{description:y((()=>[_(c,{depth:"3",class:"size"},{default:y((()=>[v(z(e.size)+"MB",1)])),_:2},1024)])),default:y((()=>[m("div",A,[_(w,{name:"fade",mode:"out-in"},{default:y((()=>["wait"===e.status?(d(),b(c,{key:0,depth:"3"},{default:y((()=>[v("等待上传")])),_:1})):"number"==typeof e.status&&100!==e.status?(d(),b(R,{key:1,percentage:e.status,"indicator-placement":"inside",type:"line",processing:""},null,8,["percentage"])):100===e.status?(d(),b(c,{key:2,type:"info",depth:"3"},{default:y((()=>[v(" 正在校验及转码 ")])),_:1})):(d(),b(c,{key:3,type:e.status,depth:"3"},{default:y((()=>[v(z("success"===e.status?"上传成功":"上传失败"),1)])),_:2},1032,["type"]))])),_:2},1024)])])),_:2},1032,["title"])])),_:2},1024)))),128))])),_:1})])),_:1},8,["show"])],64)}}},[["__scopeId","data-v-d5dab296"]]),J={class:"cloud"},K={class:"tip"},N={key:0,class:"list"},O=t({__name:"Cloud",setup(e){const t=o(),p=c([]),g=c([]),C=c(null),x=c(null),M=c([]),D=async()=>{const e=await t.getfilesDB("userCloudList");g.value=e},F=async(e=!1)=>{try{let s=0,l=null,o=[];for(;null===l||s<l;){const t=await a(100,s);if(o.push(n(t.data,"song")),s+=100,l=t.count,p.value=[(t.size/Math.pow(1024,3)).toFixed(2),(t.maxSize/Math.pow(1024,3)).toFixed(0)],0===t.count)return g.value="empty",!1;if(e)break}const u=o.flat();g.value=u,await t.setfilesDB("userCloudList",u.slice())}catch(s){console.error("云盘数据加载失败：",s),$message.error("云盘数据加载失败")}},G=i((e=>{const a=e?.trim();if(!a||""===a)return!0;const s=r(a,g.value);M.value=s}),300),I=()=>{window.open("https://music.163.com/#/store/product/detail?id=34001")};return L((async()=>{await D(),await F()})),L((()=>{window.$refreshCloudCatch=D})),(e,a)=>{const t=P,o=B,n=S,i=l,r=$,c=j,D=E,L=R,A=q,O=s,T=X;return d(),f("div",J,[_(t,{class:"title"},{default:y((()=>[v("我的云盘")])),_:1}),_(n,{percentage:100/(h(p)[1]/h(p)[0]),class:"status",type:"line"},{default:y((()=>[m("div",K,[_(o,{class:"space",depth:"3"},{default:y((()=>[v(" 云盘容量 "+z(h(p)[0]??0)+"GB / "+z(h(p)[1]??0)+"GB ",1)])),_:1}),_(o,{class:"buy",onClick:I},{default:y((()=>[v(" 扩容 ")])),_:1})])])),_:1},8,["percentage"]),_(L,{class:"menu",justify:"space-between"},{default:y((()=>[_(L,{class:"left"},{default:y((()=>[_(c,{disabled:0===h(g)?.length,focusable:!1,type:"primary",class:"play",tag:"div",circle:"",strong:"",secondary:"",onClick:a[0]||(a[0]=e=>h(u)(h(g)))},{icon:y((()=>[_(r,{size:"32"},{default:y((()=>[_(i,{icon:"play-arrow-rounded"})])),_:1})])),_:1},8,["disabled"]),_(c,{size:"large",round:"",strong:"",secondary:"",onClick:a[1]||(a[1]=e=>h(C)?.openUpSongModal())},{icon:y((()=>[_(r,null,{default:y((()=>[_(i,{icon:"cloud-arrow-up"})])),_:1})])),default:y((()=>[v(" 上传歌曲 ")])),_:1}),_(D,{ref_key:"upCloudSongRef",ref:C,onGetUserCloudData:F},null,512)])),_:1}),_(L,{class:"right"},{default:y((()=>[_(w,{name:"fade",mode:"out-in"},{default:y((()=>[h(g)?.length?(d(),b(A,{key:0,value:h(x),"onUpdate:value":a[2]||(a[2]=e=>U(x)?x.value=e:null),"input-props":{autoComplete:!1},class:"search",placeholder:"模糊搜索",clearable:"",onInput:h(G)},{prefix:y((()=>[_(r,{size:"18"},{default:y((()=>[_(i,{icon:"search-rounded"})])),_:1})])),_:1},8,["value","onInput"])):k("",!0)])),_:1})])),_:1})])),_:1}),_(w,{name:"fade",mode:"out-in"},{default:y((()=>["empty"!==h(g)?(d(),f("div",N,[_(w,{name:"fade",mode:"out-in"},{default:y((()=>[h(x)?h(M)?.length?(d(),b(O,{key:1,data:h(M),showPrivilege:!1},null,8,["data"])):(d(),b(T,{key:2,description:`搜不到关于 ${h(x)} 的任何歌曲呀`,style:{"margin-top":"60px"},size:"large"},{icon:y((()=>[_(r,null,{default:y((()=>[_(i,{icon:"search-off"})])),_:1})])),_:1},8,["description"])):(d(),b(O,{key:0,data:h(g),showPrivilege:!1},null,8,["data"]))])),_:1})])):(d(),b(T,{key:1,class:"empty",description:"你还有任何歌曲，快去上传吧"}))])),_:1})])}}},[["__scopeId","data-v-66e1cd6a"]]);export{O as default};
