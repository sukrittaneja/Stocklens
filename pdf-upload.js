// StockLens PDF Upload Feature
async function handlePdfUpload(input) {
  const file = input.files[0];
  if (!file) return;
  const label = document.getElementById('pdf-upload-label');
  label.textContent = 'Reading PDF...';
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
    const ab = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
    let txt = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const pg = await pdf.getPage(i);
      const tc = await pg.getTextContent();
      txt += tc.items.map(x => x.str).join(' ') + '
';
    }
    const s = txt.indexOf('=== STOCKLENS DATA ===');
    const e = txt.indexOf('=== END DATA ===');
    if (s === -1 || e === -1) { showToast('No data block found'); label.innerHTML = '📄 Upload StockLens Analysis PDF'; return; }
    const lines = txt.substring(s+22,e).trim().split('
').map(l=>l.trim()).filter(l=>l);
    let n = 0; window.aiFilledItems = {};
    for (const line of lines) {
      if (line.startsWith('STOCK:'))    { document.getElementById('cl-stock').value=line.replace('STOCK:','').trim(); continue; }
      if (line.startsWith('SECTOR:'))   { const v=line.replace('SECTOR:','').trim(); const sel=document.getElementById('cl-sector'); for (const o of sel.options) { if(o.value&&v.toLowerCase().includes(o.value.toLowerCase().split('/')[0].trim())){sel.value=o.value;renderChecklistPhases();break;} }; continue; }
      if (line.startsWith('BIZ_MODEL:')){document.getElementById('cl-biz-model').value=line.replace('BIZ_MODEL:','').trim();continue;}
      if (line.startsWith('MAIN_RISK:')){document.getElementById('cl-biz-risk').value=line.replace('MAIN_RISK:','').trim();continue;}
      const m=line.match(/^(pd+_d+|hsd+_d+):/); if(!m)continue;
      const id=m[1]; const parts=line.slice(id.length+1).split('|').map(s=>s.trim());
      const ans=parts[0]; const conf=parts[1]||'medium'; const ev=parts.slice(2).join('|').trim();
      const cl=(!ans||ans==='null')?null:ans;
      if(id.startsWith('hs')&&clHardStopState.hasOwnProperty(id)&&cl){clHardStopState[id]=cl;if(cl==='yes'){clHardStopTriggered=true;const h=CL_HARD_STOPS.find(x=>x.id===id);clHardStopText=h?h.text:'Hard stop.';}}
      else if(clState.hasOwnProperty(id)&&cl){clState[id]=cl;window.aiFilledItems[id]={confidence:conf,evidence:ev};n++;}
    }
    renderChecklistPhases();updateCLScore();
    label.innerHTML=n+' items filled - review before saving';
    showToast(n+' items filled from PDF');
  } catch(e){showToast('Error: '+e.message);label.innerHTML='📄 Upload StockLens Analysis PDF';}
  input.value='';
}
