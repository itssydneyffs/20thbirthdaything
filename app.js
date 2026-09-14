'use strict';
// Interface and game logic. Personal text lives in content.js.
let state={stage:0,completed:-1,checked:[false,false],inspection:false,quiz:0,answer:null,selected:[],done:false};
const $=s=>document.querySelector(s);
const main=$('#main');
const reward=$('#reward');
let rewardNext=null;
function chrome(){
 $('#stages').innerHTML=CASE.stages.map((name,i)=>`<button class="stage ${state.stage===i?'active':''}" data-stage="${i}" ${i>state.completed+1?'disabled':''} ${state.stage===i?'aria-current="step"':''}><span class="num">0${i}</span><span><strong><span class="desktop-name">${name}</span></strong><small>${i<=state.completed?'CLEARED':i===state.completed+1?'AWAITING CLEARANCE':'SEALED'}</small></span><span class="stage-icon">${i<=state.completed?'✓':i===state.completed+1?'—':'×'}</span></button>`).join('');
 $('#digits').innerHTML=[...CASE.vault].map((d,i)=>`<span class="${state.completed>=i?'found':''}" aria-label="Vault digit ${i+1}: ${state.completed>=i?d:'unknown'}">${state.completed>=i?d:'·'}</span>`).join('');
 $('#case-status').textContent=state.done?'Case closed. Happy birthday.':'Investigation open';
 document.querySelectorAll('[data-stage]').forEach(b=>b.onclick=()=>{state.stage=Number(b.dataset.stage);render(true)});
}
function title(n,sub){return `<div class="main-head"><span>CASE MW–0412 / FILE 0${n}</span><span class="live-label">${state.completed>=n?'CLEARANCE GRANTED':'ACTION REQUIRED'}</span></div><div class="chapter-title"><span class="big-num">0${n}</span><div><h2>${CASE.stages[n]}</h2><p>${sub}</p></div></div>`}
function teaser(title,note){return `<div class="reward-teaser"><span class="evidence-icon" aria-hidden="true">${title==='Access to the investigation'?'⌁':'◇'}</span><div><span class="meta">UPON COMPLETION</span><strong>${title}</strong></div><span class="sealed">${note||'SEALED'}</span></div>`}
function render(focus=false){chrome();[identity,numberSearch,trivia,vault][state.stage]();if(focus)main.focus({preventScroll:true})}
function identity(){main.innerHTML=title(0,'A birthday is no excuse to skip protocol.')+`<section class="paper"><div class="brief-head"><span class="meta">TO: MARWAN<br>FROM: HANDLER SYD</span><span class="stamp">CONFIDENTIAL</span></div><h3>Your birthday privileges are on hold.</h3><p>Syd has secured three classified gifts in your name. Before anything is released, we need to confirm that you look the part.</p><div class="checklist"><label class="task-check"><input type="checkbox" id="fit" ${state.checked[0]?'checked':''}><span><strong>Put on your birthday Roblox fit.</strong><small>Dress like the person this entire operation is about.</small></span></label><label class="task-check"><input type="checkbox" id="cake" ${state.checked[1]?'checked':''}><span><strong>Add 🎂 to your Discord status.</strong><small>Let the public record reflect the occasion.</small></span></label></div>${state.completed>=0?'<p class="success">Identity verified. Suspiciously birthday-shaped.</p><button class="primary" id="continue">Open case file 01</button>':`<button class="primary" id="inspect" ${state.checked.every(Boolean)?'':'disabled'}>Request inspection <span aria-hidden="true">↗</span></button><p class="fine-print">Bribery will be considered. Approval is not guaranteed.</p>${state.inspection?`<div class="inspection"><h3>Summon your handler.</h3><p>Message Syd on Discord: “Ready for inspection.” Once she checks your outfit and status, she’ll give you your approval code.</p><form id="approval"><label for="approval-input">HANDLER APPROVAL CODE</label><div class="code-row"><input id="approval-input" class="code-input" maxlength="12" autocomplete="off" autocapitalize="characters" required><button class="primary">Verify</button></div><p class="feedback" id="approval-feedback" role="status"></p></form></div>`:''}`}</section>`+teaser('Access to the investigation','+ FIRST DIGIT')+'<p class="note">Inspection happens with Syd on Discord. This file is patient. Mostly.</p>';
 ['#fit','#cake'].forEach((sel,i)=>$(sel).onchange=e=>{state.checked[i]=e.target.checked;if($('#inspect'))$('#inspect').disabled=!state.checked.every(Boolean)});
 if($('#inspect'))$('#inspect').onclick=()=>{state.inspection=true;identity();$('#approval-input').focus()};
 if($('#approval'))$('#approval').onsubmit=e=>{e.preventDefault();if(!state.checked.every(Boolean) || $('#approval-input').value.trim().toUpperCase()!==CASE.approvalCode){$('#approval-feedback').textContent='That code is not on file. Ask Syd for your approval code.';return}state.completed=0;chrome();showApproval()};
 if($('#continue'))$('#continue').onclick=()=>go(1);
}
function showApproval(){openModal(`<div class="gift-number">00</div><h2>Identity confirmed.<br>Birthday suspect located.</h2><p>Your outfit has passed inspection. Your Discord status has been entered into evidence.</p><div class="digit-discovery">VAULT DIGIT 1 <strong>7</strong></div><div class="actions"><button class="primary" id="modal-next">Open case file 01</button></div>`,()=>go(1))}
function numberSearch(){let cleared=state.completed>=1;main.innerHTML=title(1,'Somewhere in the noise, there is a way in.')+`<section class="paper"><div class="brief-head"><span class="meta">INTERCEPTED TRANSMISSION / 5 × 5</span><span class="stamp">DECIPHER</span></div><h3>Recover the three-digit sequence.</h3><p>The target is the last three digits of this case’s reference number: <strong>MW–0412</strong>. Find them in a straight line in the grid. Click the three cells in order.</p><div class="grid-layout"><div class="number-grid" role="group" aria-label="Number search grid">${CASE.grid.map((d,i)=>`<button class="cell ${state.selected.includes(i)?'selected':''}" data-cell="${i}" aria-label="Row ${Math.floor(i/5)+1}, column ${i%5+1}: ${d}" aria-pressed="${state.selected.includes(i)}">${d}</button>`).join('')}</div><div class="clue-note"><span class="meta">THE HANDLER’S NOTE</span><p>Look across, down, or diagonally. Three adjacent cells. One direction.</p><p>No calculator. No conspiracy board. Probably.</p><button class="text-button" id="hint">Request a hint</button><p id="hint-text" role="status"></p></div></div><div class="actions"><button class="secondary" id="clear-grid">Clear selection</button><span class="fine-print" id="selection-count" aria-live="polite">${state.selected.length} / 3 selected</span></div><p id="grid-feedback" class="feedback" role="status"></p>${cleared?'<button class="primary" id="view-video">Reopen memories video</button><button class="text-button" id="next-stage" style="margin-left:15px">Continue to file 02</button>':'<details><summary class="fine-print">Prefer typing the code?</summary><form id="number-code" class="code-form"><label for="number-input" style="margin-top:15px">RECOVERED THREE-DIGIT CODE</label><div class="code-row"><input class="code-input" id="number-input" inputmode="numeric" pattern="[0-9]{3}" maxlength="3" required><button class="primary">Submit code</button></div></form></details>'}</section>`+teaser('The memories video');
 document.querySelectorAll('[data-cell]').forEach(b=>b.onclick=()=>{if(state.selected.length===3)state.selected=[];let i=Number(b.dataset.cell);if(state.selected.includes(i)){state.selected=state.selected.filter(n=>n!==i)}else state.selected.push(i);numberSearch();if(state.selected.length===3){if(validSelection(state.selected)){unlockVideo()}else $('#grid-feedback').textContent='No match. Select three adjacent digits in one straight line. Try again.'}});
 $('#clear-grid').onclick=()=>{state.selected=[];numberSearch()};
 $('#hint').onclick=()=>{$('#hint-text').textContent='Start at row 2, column 2. Move diagonally down and right. The code is 412.'};
 if($('#number-code'))$('#number-code').onsubmit=e=>{e.preventDefault();if($('#number-input').value.trim()===CASE.target)unlockVideo();else $('#grid-feedback').textContent='That sequence is not on file. Check the final three digits of MW–0412.'};
 if($('#view-video'))$('#view-video').onclick=()=>showGift(0,()=>go(2));if($('#next-stage'))$('#next-stage').onclick=()=>go(2);
}
function validSelection(a){if(a.length!==3||a.map(i=>CASE.grid[i]).join('')!==CASE.target)return false;let r=a.map(i=>Math.floor(i/5)),c=a.map(i=>i%5),dr=r[1]-r[0],dc=c[1]-c[0];return Math.abs(dr)<=1&&Math.abs(dc)<=1&&(dr!==0||dc!==0)&&r[2]-r[1]===dr&&c[2]-c[1]===dc}
function unlockVideo(){state.completed=Math.max(state.completed,1);chrome();showGift(0,()=>go(2))}
function trivia(){if(state.completed>=2){main.innerHTML=title(2,'Your testimony has been accepted. Somehow.')+`<section class="paper"><span class="meta">INTERROGATION COMPLETE</span><h3>Certified expert in this friendship.</h3><p>Your answers have been reviewed, disputed, and accepted anyway. A flawless performance by extremely flexible standards.</p><div class="actions"><button class="primary" id="view-letter">Read the friendship letter</button><button class="secondary" id="final-stage">Open the final file</button></div></section>`;$('#view-letter').onclick=()=>showGift(1,()=>go(3));$('#final-stage').onclick=()=>go(3);return}
 const q=CASE.quiz[state.quiz];main.innerHTML=title(2,'Your memory will be tested. The scoring will not.')+`<section class="paper"><div class="brief-head"><span class="quiz-count">QUESTION 0${state.quiz+1} / 0${CASE.quiz.length}</span><span class="stamp">ON THE RECORD</span></div><h3 class="quiz-question">${q.q}</h3><div class="answers">${q.a.map((a,i)=>`<button class="answer ${state.answer===i?'chosen':''}" data-answer="${i}" ${state.answer!==null?'disabled':''}><span class="letter">${String.fromCharCode(65+i)}</span><span>${a}</span></button>`).join('')}</div>${state.answer!==null?`<div class="quiz-response" role="status">${q.r[state.answer]}<br><strong>+1 clearance point. Obviously.</strong></div><div class="actions"><button class="primary" id="next-question">${state.quiz===CASE.quiz.length-1?'Release the letter':'Next question'}</button></div>`:'<p class="fine-print" style="margin-top:20px">All testimony is final. Until the birthday department changes its mind.</p>'}</section>`+teaser('A friendship letter from Syd');
 document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{state.answer=Number(b.dataset.answer);trivia();$('#next-question').focus()});
 if($('#next-question'))$('#next-question').onclick=()=>{if(state.quiz<CASE.quiz.length-1){state.quiz++;state.answer=null;render(true)}else{state.completed=2;chrome();showGift(1,()=>go(3))}};
}
function vault(){if(state.done){main.innerHTML=title(3,'Case closed. Birthday officially celebrated.')+`<section class="paper"><span class="meta">FINAL VERDICT</span><div class="complete-mark" aria-hidden="true">✓</div><h3>Guilty of being worth all this effort.</h3><p>Three gifts recovered. One highly questionable investigation completed. No further questioning, Marwan.</p><p>Happy birthday. This whole little operation was for you.</p><p class="signature">— Syd</p><div class="gift-list">${CASE.gifts.map((g,i)=>`<button class="gift-button" data-gift="${i}"><span>0${i+1}</span><strong>${g.title}</strong><b aria-hidden="true">↗</b></button>`).join('')}</div></section>`;document.querySelectorAll('[data-gift]').forEach(b=>b.onclick=()=>showGift(Number(b.dataset.gift)));return}
 main.innerHTML=title(3,'Everything you need has already been given to you.')+`<section class="paper"><div class="brief-head"><span class="meta">FINAL EVIDENCE / RESTRICTED</span><span class="stamp">DO NOT LOSE</span></div><h3>One last lock.</h3><p>You recovered one vault digit after each clearance. Enter them in the order you received them: identity, access code, then trivia.</p><div class="vault-digits" aria-label="Three-digit vault lock"><span>?</span><span>?</span><span>?</span></div><form id="vault-form" class="code-form"><label for="vault-input">THREE-DIGIT VAULT CODE</label><div class="code-row"><input class="code-input" id="vault-input" inputmode="numeric" maxlength="3" pattern="[0-9]{3}" required autocomplete="off"><button class="primary">Unlock final evidence</button></div><p id="vault-feedback" class="feedback" role="status"></p></form><button class="text-button" id="vault-hint">The birthday brain needs a hint</button><p class="fine-print" id="vault-hint-text" role="status"></p></section>`+teaser('Your birthday Robux');
 $('#vault-form').onsubmit=e=>{e.preventDefault();if($('#vault-input').value.trim()!==CASE.vault){$('#vault-feedback').textContent='The vault remains unimpressed. Check your recovered digits.';return}state.done=true;state.completed=3;chrome();showGift(2,()=>render(true))};$('#vault-hint').onclick=()=>{$('#vault-hint-text').textContent='Your recovered digits are 7, then 2, then 9. Enter 729.'};
}
function go(stage){state.stage=stage;render(true)}
function openModal(html,next){$('#reward-body').innerHTML=html;rewardNext=next||null;if(!reward.open)reward.showModal();if($('#modal-next'))$('#modal-next').onclick=()=>reward.close()}

// Insert personal writing as text, never executable HTML.
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

function videoSource(value) {
  const url = String(value || '').trim();
  if (/^https:\/\//i.test(url)) return url;
  if (/^(?:\.\/)?assets\/[a-zA-Z0-9_./-]+$/.test(url) && !url.includes('..')) return url;
  return '';
}

function giftContent(index) {
  const gift = CASE.gifts[index];
  const video = videoSource(gift.videoUrl);
  if (index === 0 && video) {
    return '<video class="memories-video" controls playsinline preload="metadata" src="' + escapeHtml(video) + '">Your browser cannot play this video.</video>' +
      '<p><a href="' + escapeHtml(video) + '" target="_blank" rel="noopener">Open the memories video</a></p>';
  }
  if (index === 1 && gift.paragraphs && gift.paragraphs.length) {
    return '<div class="friendship-letter">' + gift.paragraphs.map(p => '<p>' + escapeHtml(p) + '</p>').join('') + '</div>';
  }
  if (index === 2 && !CASE.preview) {
    return '<div class="delivery-note">' + escapeHtml(gift.deliveryMessage) + '</div>';
  }
  return '<div class="pending-gift"><span class="meta">' + (CASE.preview ? 'WORKING DRAFT — GIFT IN PREPARATION' : 'A NOTE FROM YOUR HANDLER') +
    '</span><br>' + escapeHtml(CASE.preview ? gift.pending : 'Syd has this gift for you. Ask her to send it over on Discord.') + '</div>';
}

function showGift(index, next) {
  const gift = CASE.gifts[index];
  const digit = index < 2
    ? '<div class="digit-discovery">VAULT DIGIT ' + (index + 2) + '<strong>' + CASE.vault[index + 1] + '</strong></div>'
    : '<p>Happy birthday, Marwan.<br>Operation: make you smile. Complete.</p>';
  const buttonText = next ? (index === 2 ? 'Close the case' : 'Continue the investigation') : 'Back to the case';
  openModal('<div class="gift-number">' + gift.number + '</div><h2>' + escapeHtml(gift.title) + '</h2><p>' + escapeHtml(gift.text) +
    '</p>' + giftContent(index) + digit + '<div class="actions"><button class="primary" id="modal-next">' + buttonText + '</button></div>', next);
}

$('#close-reward').onclick=()=>reward.close();reward.addEventListener('close',()=>{let next=rewardNext;rewardNext=null;if(next)next();else render()});
$('#restart').onclick=()=>$('#reset').showModal();$('#cancel-reset').onclick=()=>$('#reset').close();$('#confirm-reset').onclick=()=>{state={stage:0,completed:-1,checked:[false,false],inspection:false,quiz:0,answer:null,selected:[],done:false};$('#reset').close();render(true)};
if (!CASE.preview) document.querySelector('.draft').hidden = true;
render();
