const STORAGE_KEY="ai-academy-safety-checklist";
const checklist=document.querySelector("#checklist");
const boxes=[...checklist.querySelectorAll('input[type="checkbox"]')];
const progressLabel=document.querySelector("#progress-label");
const progressBar=document.querySelector("#progress-bar");
const progressPercent=document.querySelector("#progress-percent");
const completeMessage=document.querySelector("#complete-message");

function render(){
  const checked=boxes.filter(box=>box.checked).length;
  const percent=Math.round(checked/boxes.length*100);
  progressLabel.textContent=`${checked} / ${boxes.length}`;
  progressBar.style.width=`${percent}%`;
  progressPercent.textContent=`${percent}%`;
  completeMessage.hidden=checked!==boxes.length;
  localStorage.setItem(STORAGE_KEY,JSON.stringify(boxes.map(box=>box.checked)));
}

try{
  const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");
  boxes.forEach((box,index)=>{box.checked=Boolean(saved[index])});
}catch{}

checklist.addEventListener("change",render);
document.querySelector("#reset-button").addEventListener("click",()=>{
  boxes.forEach(box=>{box.checked=false});
  render();
  window.scrollTo({top:0,behavior:"smooth"});
});
render();
