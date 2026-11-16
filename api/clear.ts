export default async function handler(request:Request):Promise<Response>{
 if(request.method!=='POST')return new Response(JSON.stringify({ok:false,error:'Method not allowed'}),{status:405,headers:{'content-type':'application/json'}});
 const target=new URL('/api/cache?clear=1',request.url);
 return Response.redirect(target,307);
}