import { pathToFileURL } from "node:url";
import fs from "node:fs/promises";
const artifactUrl = pathToFileURL("C:/Users/tatya/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs").href;
const { Presentation, column, panel, text, fill, hug, fixed } = await import(artifactUrl);
for (const br of [undefined, 16, 'rounded', 'rounded-md', 'rounded-full']) {
 const deck=Presentation.create({slideSize:{width:500,height:200}}); const s=deck.slides.add();
 s.compose(column({width:fill,height:fill,padding:20},[panel({fill:'#E8F6F0',borderRadius:br,padding:20,width:fixed(300)},text(`br ${br}`,{width:fill,height:hug,style:{fontSize:30,color:'#111827'}}))]),{frame:{left:0,top:0,width:500,height:200},baseUnit:8});
 const png=await s.export({format:'png'}); await fs.writeFile(`C:/Users/tatya/AndroidStudioProjects/finmap-clone/finvy_deck_work/scratch/br_${String(br).replace(/[^a-z0-9]/gi,'_')}.png`, Buffer.from(await png.arrayBuffer()));
}
