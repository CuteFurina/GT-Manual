import{a as e,q as a,t as s,e as o}from"./index.js";import{_ as r}from"./Pagination.js";import{_ as t}from"./SongList.js";import{a7 as u,r as n,w as l,e as i,g,G as d,k as m,j as p,T as c,n as v,i as y,L as f,W as h,a0 as k}from"./vendor.js";const _={class:"search-songs"},q={key:0,class:"list"},z={__name:"songs",setup(z){const S=u(),b=e(),j=n([]),w=n(0),C=n(S.currentRoute.value.query?.keywords||""),N=n(Number(S.currentRoute.value.query?.page)||1),x=(e=C.value,o=b.loadSize,r=0,t=1)=>{try{j.value=[],s(e,o,r,t).then((e=>{if(w.value=e.result.songCount,0===e.result.songCount)return j.value="empty";j.value=a(e.result.songs,"song")}))}catch(u){console.error("搜索出现错误：",u),$message.error("搜索出现错误")}},P=e=>{S.push({path:"/search/songs",query:{keywords:C.value,page:e}})};return l((()=>S.currentRoute.value),(e=>{"sea-songs"==e.name&&(N.value=Number(e.query?.page)||1,C.value=e.query?.keywords||"",x(C.value,b.loadSize,(N.value-1)*b.loadSize))})),i((()=>{x(C.value,b.loadSize,(N.value-1)*b.loadSize)})),(e,a)=>{const s=t,u=r,n=o,l=h,i=k;return g(),d("div",_,[m(c,{name:"fade",mode:"out-in"},{default:p((()=>["empty"!==v(j)?(g(),d("div",q,[m(s,{data:v(j),showPagination:!1},null,8,["data"]),v(j)?.length?(g(),y(u,{key:0,totalCount:v(w),pageNumber:v(N),onPageNumberChange:P},null,8,["totalCount","pageNumber"])):f("",!0)])):(g(),y(i,{key:1,description:`很抱歉，未能找到与 ${v(C)} 相关的任何单曲`,style:{"margin-top":"60px"},size:"large"},{icon:p((()=>[m(l,null,{default:p((()=>[m(n,{icon:"search-off"})])),_:1})])),_:1},8,["description"]))])),_:1})])}}};export{z as default};
