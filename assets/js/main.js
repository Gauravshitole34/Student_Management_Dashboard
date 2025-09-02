
const LS_KEY = 'students-data-v1';
let students = [];

const $ = (sel, root=document) => root.querySelector(sel);

function loadData(){
  const raw = localStorage.getItem(LS_KEY);
  if(raw){
    students = JSON.parse(raw);
  } else {
    students = [
      {id: crypto.randomUUID(), name:'John Doe', regno:'REG1001', dept:'Computer Science', year:3, marks:85},
      {id: crypto.randomUUID(), name:'Sara Khan', regno:'REG1002', dept:'Mechanical', year:2, marks:78},
      {id: crypto.randomUUID(), name:'David Lee', regno:'REG1003', dept:'Electrical', year:4, marks:90},
      {id: crypto.randomUUID(), name:'Priya Patel', regno:'REG1004', dept:'Information Technology', year:1, marks:72},
      {id: crypto.randomUUID(), name:'Aarav Mehta', regno:'REG1005', dept:'Electronics', year:2, marks:88},
    ];
    saveData();
  }
}

function saveData(){ localStorage.setItem(LS_KEY, JSON.stringify(students)); }

function renderStats(){
  document.getElementById('statTotal').textContent = students.length;
  const avg = students.length ? (students.reduce((a,b)=>a+b.marks,0)/students.length).toFixed(1) : 0;
  document.getElementById('statAvg').textContent = avg;
  const depts = new Set(students.map(s=>s.dept));
  document.getElementById('statDept').textContent = depts.size;
}

function renderTable(filter=''){
  const tbody = document.querySelector('#studentsTable tbody');
  tbody.innerHTML = '';
  const f = filter.trim().toLowerCase();
  const rows = students.filter(s => !f ||
    s.name.toLowerCase().includes(f) ||
    s.dept.toLowerCase().includes(f) ||
    String(s.year).includes(f));
  rows.forEach((s, i)=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i+1}</td>
      <td>${s.name}</td>
      <td>${s.regno}</td>
      <td>${s.dept}</td>
      <td>${s.year}</td>
      <td>${s.marks}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary me-2" data-id="${s.id}" data-action="edit"><i class="bi bi-pencil-square"></i></button>
        <button class="btn btn-sm btn-outline-danger" data-id="${s.id}" data-action="delete"><i class="bi bi-trash"></i></button>
      </td>`;
    tbody.appendChild(tr);
  });
}

function addStudent(e){
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const regno = document.getElementById('regno').value.trim();
  const dept = document.getElementById('dept').value;
  const year = parseInt(document.getElementById('year').value,10);
  const marks = parseFloat(document.getElementById('marks').value);
  if(!name || !regno || !dept || isNaN(year) || isNaN(marks)) return;
  if(year<1 || year>4 || marks<0 || marks>100) return alert('Check Year (1-4) and Marks (0-100).');
  if(students.some(s => s.regno.toLowerCase()===regno.toLowerCase())) return alert('Registration number already exists.');
  students.push({id: crypto.randomUUID(), name, regno, dept, year, marks});
  saveData(); renderStats(); renderTable(document.getElementById('searchInput').value);
  document.getElementById('studentForm').reset();
}

function openEditModal(id){
  const s = students.find(x=>x.id===id);
  if(!s) return;
  document.getElementById('editId').value = s.id;
  document.getElementById('editName').value = s.name;
  document.getElementById('editRegno').value = s.regno;
  document.getElementById('editDept').value = s.dept;
  document.getElementById('editYear').value = s.year;
  document.getElementById('editMarks').value = s.marks;
  new bootstrap.Modal(document.getElementById('editModal')).show();
}

function updateStudent(){
  const id = document.getElementById('editId').value;
  const name = document.getElementById('editName').value.trim();
  const regno = document.getElementById('editRegno').value.trim();
  const dept = document.getElementById('editDept').value;
  const year = parseInt(document.getElementById('editYear').value,10);
  const marks = parseFloat(document.getElementById('editMarks').value);
  if(!name || !regno || !dept || isNaN(year) || isNaN(marks)) return;
  if(year<1 || year>4 || marks<0 || marks>100) return alert('Check Year (1-4) and Marks (0-100).');
  if(students.some(s => s.regno.toLowerCase()===regno.toLowerCase() && s.id!==id)) return alert('Another student already has this registration number.');
  const idx = students.findIndex(s=>s.id===id);
  if(idx>-1){
    students[idx] = {id, name, regno, dept, year, marks};
    saveData(); renderStats(); renderTable(document.getElementById('searchInput').value);
    bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
  }
}

function deleteStudent(id){
  if(!confirm('Delete this record?')) return;
  students = students.filter(s=>s.id!==id);
  saveData(); renderStats(); renderTable(document.getElementById('searchInput').value);
}

function exportJSON(){
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(students, null, 2));
  const a = document.createElement('a'); a.href = dataStr; a.download = 'students.json'; a.click();
}

// Delegated actions on table
document.querySelector('#studentsTable tbody').addEventListener('click', (e)=>{
  const btn = e.target.closest('button[data-action]'); if(!btn) return;
  const id = btn.getAttribute('data-id'); const action = btn.getAttribute('data-action');
  if(action==='edit') openEditModal(id);
  if(action==='delete') deleteStudent(id);
});

document.getElementById('studentForm').addEventListener('submit', addStudent);
document.getElementById('updateBtn').addEventListener('click', updateStudent);
document.getElementById('exportBtn').addEventListener('click', exportJSON);
document.getElementById('searchInput').addEventListener('input', (e)=> renderTable(e.target.value));

// Scroll to top
const toTop = document.getElementById('toTop');
window.addEventListener('scroll', ()=>{ toTop.style.display = window.scrollY>300 ? 'inline-block' : 'none'; });
toTop.addEventListener('click', ()=> window.scrollTo({top:0,behavior:'smooth'}));

loadData(); renderStats(); renderTable();
