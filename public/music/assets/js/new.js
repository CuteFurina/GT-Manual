import{_ as e}from"./SongList.js";import{_ as a}from"./Pagination.js";import{_ as u}from"./MainCover.js";import{a7 as l,r as s,w as r,e as t,g as n,G as o,k as v,j as d,T as m,aa as p,K as i,X as y,n as c,P as f,R as b,L as g,at as k}from"./vendor.js";import{_,a as w,w as h,q as j,x as q}from"./index.js";import"./album2.js";import"./dj2.js";const C={class:"dsc-new"},N={key:0,class:"new-album"},L={key:1,class:"new-song"},R=_({__name:"new",setup(_){const R=l(),P=w(),S=["新碟上架","新歌速递"],x=[{key:"ALL",num:0,value:"全部"},{key:"ZH",num:7,value:"华语"},{key:"EA",num:96,value:"欧美"},{key:"KR",num:16,value:"韩国"},{key:"JP",num:8,value:"日本"}],z=s(Number(R.currentRoute.value.query?.page)||1),A=s(Number(R.currentRoute.value.query?.type)||0),K=s(Number(R.currentRoute.value.query?.area)||0),E=s(0),G=s([]),H=s([]),I=(e=P.loadSize,a=0)=>{if(0===A.value){const u=x[K.value]?.key||"ALL";h(u,e,a).then((e=>{E.value=e.total,H.value.push(...j(e.albums,"album"))}))}else if(1===A.value){const e=x[K.value]?.num||0;q(e).then((e=>{G.value=[],G.value=j(e.data,"song")}))}(A.value>1||K.value>4)&&$message.error("传入参数错误")},J=e=>{H.value=[],R.push({path:"/discover/new",query:{type:A.value,area:K.value,page:e}})};return r((()=>R.currentRoute.value),(e=>{"dsc-new"===e.name&&(G.value=[],H.value=[],z.value=Number(e.query?.page)||1,A.value=Number(e.query?.type)||0,K.value=e.query?.area||0,I(P.loadSize,(z.value-1)*P.loadSize))})),t((()=>{I()})),(l,s)=>{const r=k,t=p,_=u,w=a,h=e;return n(),o("div",C,[v(t,{class:"menu",justify:"space-between"},{default:d((()=>[v(t,{class:"type"},{default:d((()=>[(n(),o(i,null,y(S,((e,a)=>v(r,{key:a,bordered:!1,type:a==c(A)?"primary":"default",class:"tag",round:"",onClick:e=>{return u=a,void R.push({path:"/discover/new",query:{type:u,area:K.value,...1===u&&{page:1}}});var u}},{default:d((()=>[f(b(e),1)])),_:2},1032,["type","onClick"]))),64))])),_:1}),v(t,{class:"area"},{default:d((()=>[(n(),o(i,null,y(x,((e,a)=>v(r,{key:a,bordered:!1,type:a==c(K)?"primary":"default",class:"tag",round:"",onClick:e=>{return u=a,void R.push({path:"/discover/new",query:{type:A.value,area:u,...1===A.value&&{page:1}}});var u}},{default:d((()=>[f(b(e.value),1)])),_:2},1032,["type","onClick"]))),64))])),_:1})])),_:1}),v(m,{name:"fade",mode:"out-in"},{default:d((()=>[0===c(A)?(n(),o("div",N,[v(_,{data:c(H)},null,8,["data"]),v(w,{totalCount:c(E),pageNumber:c(z),onPageNumberChange:J},null,8,["totalCount","pageNumber"])])):1===c(A)?(n(),o("div",L,[v(h,{data:c(G)},null,8,["data"])])):g("",!0)])),_:1})])}}},[["__scopeId","data-v-4bb6704d"]]);export{R as default};
