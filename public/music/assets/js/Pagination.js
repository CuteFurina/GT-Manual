import{r as a,w as e,f as t,g as s,i as o,j as n,n as u,Y as p,U as r,L as m,T as i,b5 as l}from"./vendor.js";import{_ as g,a as d}from"./index.js";const c=g({__name:"Pagination",props:{totalCount:{type:Number,default:0},pageNumber:{type:Number,default:1}},emits:["pageNumberChange"],setup(g,{emit:c}){const b=d(),f=g,N=c,_=a(1);return e((()=>_.value),(a=>{N("pageNumberChange",a)})),e((()=>f.pageNumber),(a=>_.value=a)),t((()=>{_.value=f.pageNumber})),(a,e)=>{const t=l;return s(),o(i,{name:"fade",mode:"out-in"},{default:n((()=>[g.totalCount>u(b).loadSize?(s(),o(t,{key:0,page:u(_),"onUpdate:page":e[0]||(e[0]=a=>p(_)?_.value=a:null),class:r(["pagination"]),"item-count":g.totalCount,"page-sizes":[u(b).loadSize]},null,8,["page","item-count","page-sizes"])):m("",!0)])),_:1})}}},[["__scopeId","data-v-cb39dc8c"]]);export{c as _};
