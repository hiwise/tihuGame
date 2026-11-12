const fs=require('node:fs'),p=require('node:path'), root=__dirname;
const read=n=>fs.readFileSync(p.join(root,'src',n),'utf8');
const sources=['config.js','renderer.js','vehicles.js','models.js','routes.js','cockpit.js','race.js','game.js','lobby.js','garage.js'];
let html=read('page.html').replace('<!-- STYLES -->',()=>'<style>\n'+read('game.css')+'\n</style>').replace('<!-- SCRIPTS -->',()=>'<script>\n'+sources.map(n=>'// '+n+'\n'+read(n).replace('__INLINE_YES_WAV__',()=>fs.readFileSync(p.join(root,'art','audio','yes.wav')).toString('base64'))).join('\n')+'\n</script>');
new (require('node:vm').Script)(html.match(/<script>([\s\S]*)<\/script>/)[1]);
fs.writeFileSync(p.join(root,'index.html'),html);console.log('Built index.html:',Buffer.byteLength(html),'bytes');



