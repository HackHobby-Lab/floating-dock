const nameInput = document.getElementById('linkName');
const urlInput = document.getElementById('linkURL');
const addBtn = document.getElementById('addBtn');
const saveBtn = document.getElementById('saveBtn');
const linksList = document.getElementById('linksList');

let links = [];
let editIndex = -1;

function validateURL(u) {
  try { new URL(u); return true } catch { return false }
}

function render() {
  linksList.innerHTML = '';
  links.forEach((l, i) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div>
        <strong>${l.name}</strong><div style="font-size:12px;color:#555">${l.url}</div>
      </div>
      <div class="item-actions">
        <button data-i="${i}" class="edit">Edit</button>
        <button data-i="${i}" class="del">Delete</button>
      </div>
    `;
    linksList.appendChild(li);
  });
  attachItemHandlers();
}

function attachItemHandlers() {
  document.querySelectorAll('.edit').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const i = Number(btn.dataset.i);
      nameInput.value = links[i].name;
      urlInput.value = links[i].url;
      editIndex = i;
    });
  });
  document.querySelectorAll('.del').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const i = Number(btn.dataset.i);
      links.splice(i,1);
      render();
    });
  });
}

addBtn.addEventListener('click', () => {
  const name = nameInput.value.trim();
  const url = urlInput.value.trim();
  if (!name || !url) return alert('Enter both name and URL');
  if (!validateURL(url)) return alert('Enter a valid URL (include https://)');

  if (editIndex >= 0) {
    links[editIndex] = { name, url };
    editIndex = -1;
  } else {
    links.push({ name, url });
  }
  nameInput.value = '';
  urlInput.value = '';
  render();
});

saveBtn.addEventListener('click', () => {
  // send to main
  window.settingsAPI.saveLinks(links);
  alert('Links saved');
});

// load existing links
window.settingsAPI.getLinks().then(saved => {
  links = saved || [];
  render();
});