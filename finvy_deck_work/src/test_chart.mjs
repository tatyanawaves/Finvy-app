import { pathToFileURL } from "node:url";
import fs from "node:fs/promises";
const artifactUrl = pathToFileURL("C:/Users/tatya/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs").href;
const { Presentation, column, text, chart, fill, hug, fixed } = await import(artifactUrl);
const deck=Presentation.create({slideSize:{width:1000,height:600}}); const s=deck.slides.add();
s.compose(column({width:fill,height:fill,padding:40,gap:20},[
 text('Рынок', {height:hug,width:fill,style:{fontFamily:'Inter',fontSize:46,bold:true,color:'#111827'}}),
 chart({name:'c',chartType:'bar',width:fill,height:fixed(400),config:{categories:['TAM','SAM','SOM'],series:[{name:'млрд ₸ / год',values:[135,36,3.6]}]}})
]),{frame:{left:0,top:0,width:1000,height:600},baseUnit:8});
const png=await s.export({format:'png'}); await fs.writeFile('C:/Users/tatya/AndroidStudioProjects/finmap-clone/finvy_deck_work/scratch/test_chart.png', Buffer.from(await png.arrayBuffer()));
