import { pathToFileURL } from "node:url";
import fs from "node:fs/promises";
const artifactUrl = pathToFileURL("C:/Users/tatya/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs").href;
const { Presentation, layers, shape, text, fill, fixed } = await import(artifactUrl);
const deck=Presentation.create({slideSize:{width:800,height:400}}); const s=deck.slides.add();
s.compose(layers({width:fill,height:fill},[
  shape({width:fill,height:fill, fill:'#0B1220'}),
  text('Привет', {width:fixed(400),height:fixed(100),style:{fontSize:60,bold:true,color:'#FFFFFF',fontFamily:'Inter'}})
]),{frame:{left:0,top:0,width:800,height:400},baseUnit:8});
const png=await s.export({format:'png'}); await fs.writeFile('C:/Users/tatya/AndroidStudioProjects/finmap-clone/finvy_deck_work/scratch/test_bg.png', Buffer.from(await png.arrayBuffer()));
