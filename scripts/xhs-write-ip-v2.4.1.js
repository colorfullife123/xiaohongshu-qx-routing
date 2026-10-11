const P="📤 小红书上传";
const D="direct";
function vars(){try{return $environment.variables||{}}catch(e){return{}}}
function clean(h){h=Object.assign({},h||{});for(const k of Object.keys(h)){if(["content-length","transfer-encoding","connection","host"].includes(k.toLowerCase()))delete h[k]}return h}
function path(){if($request.path)return String($request.path).split("?")[0];return String($request.url||"").replace(/^https?:\/\/[^/]+/i,"").split("?")[0]||"/"}
function kind(m,p,b){
 p=p.toLowerCase();b=(b||"").toLowerCase();
 if(["GET","HEAD","OPTIONS"].includes(m))return["read","safe-method"];
 if(/\/api\/media\/v\d+\/upload\/capa\/permit(?:\/|$)/.test(p))return["write","upload-permit"];
 if(/\/api\/sns\/v\d+\/note\/?$/.test(p))return["write","note-submit"];
 if(/\/(?:comment|note\/comment)\/(?:post|create|reply|send|submit)(?:\/|$)/.test(p))return["write","comment-path"];
 if(/\/(?:publish|post|create|reply|send|submit)(?:\/|$)/.test(p))return["write","write-path"];
 if(/comment/.test(p)&&/"(?:content|comment_content|text)"\s*:/.test(b)&&/"(?:note_id|target_comment_id|comment_id|root_comment_id)"\s*:/.test(b))return["write","comment-body"];
 if(/\/(?:page|list|query|detail|feed|search|recommend|messages?|history|status|count|unread|collect|batch|get|info)(?:\/|$)/.test(p)||/\/api\/im\//.test(p))return["read","read-path"];
 return["read","unknown-direct"];
}
function status(n){return "HTTP/1.1 "+n}
const v=vars(),m=($request.method||"POST").toUpperCase(),p=path(),b=typeof $request.body==="string"?$request.body:"",k=kind(m,p,b),policy=k[0]==="write"?(v.policy||P):D;
const req={url:$request.url,method:m,headers:clean($request.headers),opts:{policy}};
if(typeof $request.body==="string")req.body=$request.body;
console.log("[XHS-QX v2.4.1] "+k[0].toUpperCase()+" "+m+" "+p+" reason="+k[1]+" via "+policy);
$task.fetch(req).then(r=>$done({status:status(Number(r.statusCode||200)),headers:clean(r.headers),body:r.body||""}),e=>$done({status:"HTTP/1.1 502 Bad Gateway",headers:{"Content-Type":"application/json"},body:JSON.stringify({ok:false,error:String(e)})}));
