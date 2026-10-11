const P="📤 小红书上传";
const D="direct";

function vars(){try{return $environment.variables||{}}catch(e){return{}}}
function clean(h){
  h=Object.assign({},h||{});
  for(const k of Object.keys(h)){
    if(["content-length","transfer-encoding","connection","host"].includes(k.toLowerCase())) delete h[k];
  }
  return h;
}
function path(){
  if($request.path) return String($request.path).split("?")[0];
  return String($request.url||"").replace(/^https?:\/\/[^/]+/i,"").split("?")[0]||"/";
}
function kind(m,p,b){
  p=String(p||"").toLowerCase();
  b=String(b||"").toLowerCase();

  if(["GET","HEAD","OPTIONS"].includes(m)) return ["read","safe-method"];

  // Confirmed from iOS device log: POST /api/sns/v4/note/comment = publish comment.
  if(/\/api\/sns\/v\d+\/note\/comment\/?$/.test(p))
    return ["write","confirmed-note-comment"];

  // Known comment-reading POST endpoints must remain DIRECT.
  if(
    /\/comment(?:s)?\/(?:page|list|query|detail|sub_comments?|more|cursor|tree|get|info|count)(?:\/|$)/.test(p) ||
    /\/note\/comment\/(?:page|list|query|detail|sub_comments?|more|cursor|tree|get|info|count)(?:\/|$)/.test(p)
  ) return ["read","comment-read"];

  // Final note publish.
  if(/\/api\/sns\/v\d+\/note\/?$/.test(p))
    return ["write","note-submit"];

  // Upload authorization.
  if(/\/api\/media\/v\d+\/upload\/capa\/permit(?:\/|$)/.test(p))
    return ["write","upload-permit"];

  // Explicit comment write verbs across App revisions.
  if(/\/(?:comment|note\/comment)\/(?:post|create|reply|send|submit)(?:\/|$)/.test(p))
    return ["write","comment-write-verb"];

  // After read paths are excluded, remaining non-safe comment calls are writes.
  if(/\/comment(?:s)?(?:\/|$)/.test(p))
    return ["write","comment-nonsafe"];

  // Common generic write verbs.
  if(/\/(?:publish|post|create|reply|send|submit)(?:\/|$)/.test(p))
    return ["write","write-verb"];

  // Explicit browse/read APIs.
  if(
    /\/(?:page|list|query|detail|feed|search|recommend|messages?|history|status|count|unread|collect|batch|get|info)(?:\/|$)/.test(p) ||
    /\/api\/im\//.test(p)
  ) return ["read","read-path"];

  // Body fallback for private write endpoints.
  const hasText=/"(?:content|comment_content|text|reply_content)"\s*:/.test(b);
  const hasTarget=/"(?:note_id|target_comment_id|comment_id|root_comment_id|reply_comment_id|target_id)"\s*:/.test(b);
  if(hasText&&hasTarget) return ["write","write-body"];

  return ["read","unknown-direct"];
}
function status(n){return "HTTP/1.1 "+n}

const v=vars();
const m=($request.method||"POST").toUpperCase();
const p=path();
const b=typeof $request.body==="string"?$request.body:"";
const k=kind(m,p,b);
const policy=k[0]==="write"?(v.policy||P):D;

const req={url:$request.url,method:m,headers:clean($request.headers),opts:{policy}};
if(typeof $request.body==="string") req.body=$request.body;

console.log("[XHS-QX v2.4.3] "+k[0].toUpperCase()+" "+m+" "+p+" reason="+k[1]+" via "+policy);

$task.fetch(req).then(
  r=>$done({status:status(Number(r.statusCode||200)),headers:clean(r.headers),body:r.body||""}),
  e=>$done({status:"HTTP/1.1 502 Bad Gateway",headers:{"Content-Type":"application/json"},body:JSON.stringify({ok:false,error:String(e)})})
);
