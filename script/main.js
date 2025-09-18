const listsContainer = document.getElementById('lists');
const addListBtn = document.getElementById('addListBtn');
const newListName = document.getElementById('newListName');
let noListsMsg = document.querySelector('.no-lists');

let lists = JSON.parse(localStorage.getItem('todoLists')) || [];

if (lists.length && noListsMsg) noListsMsg.remove();

const save = () => localStorage.setItem('todoLists', JSON.stringify(lists));

const updateSortSelect = (list, listNode, ul) => {
  let select = listNode.querySelector('select[name="sortSelect"]');
  if (list.tasks.length >= 2) {
    if (!select) {
      select = document.createElement('select');
      select.name = 'sortSelect';
      select.innerHTML = `
        <option value="default">Sort...</option>
        <option value="status">By Status</option>
        <option value="az">A–Z</option>
        <option value="za">Z–A</option>
      `;
      select.onchange = () => {
        if (select.value === 'status') list.tasks.sort((a, b) => a.done - b.done);
        else if (select.value === 'az') list.tasks.sort((a, b) => a.text.localeCompare(b.text));
        else if (select.value === 'za') list.tasks.sort((a, b) => b.text.localeCompare(a.text));
        ul.innerHTML = '';
        list.tasks.forEach(task => ul.appendChild(createTaskNode(list, task, listNode, ul)));
        save();
      };
      listNode.insertBefore(select, listNode.querySelector('input'));
    }
  } else if (select) select.remove();
};

const createTaskNode = (list, task, listNode, ul) => {
  const li = document.createElement('li');
  li.className = 'task' + (task.done ? ' done' : '');

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = task.done;
  checkbox.setAttribute('name', 'taskText');
  checkbox.onchange = () => {
    task.done = checkbox.checked;
    li.className = 'task' + (task.done ? ' done' : '');
    save();
  };

  const label = document.createElement('label');
  label.textContent = task.text;
  label.contentEditable = true;
  label.setAttribute('for', 'taskText');
  label.onblur = () => {
    task.text = label.textContent;
    save();
  };

  const removeBtn = document.createElement('button');
  removeBtn.textContent = '🗑️';
  removeBtn.className = 'remove-task-btn';
  removeBtn.onclick = () => {
    const index = list.tasks.indexOf(task);
    if (index !== -1) list.tasks.splice(index, 1);
    li.remove();
    updateSortSelect(list, listNode, ul);

    if (!list.tasks.length) {
      const listIndex = lists.indexOf(list);
      if (listIndex !== -1) lists.splice(listIndex, 1);
      listNode.remove();
      if (!lists.length) {
        noListsMsg = document.createElement('p');
        noListsMsg.className = 'no-lists';
        noListsMsg.textContent = 'There is no list yet.';
        listsContainer.appendChild(noListsMsg);
      }
    }
    save();
  };

  li.append(checkbox, label, removeBtn);
  return li;
};

const createListNode = (list) => {
  const listNode = document.createElement('div');
  listNode.className = 'list';

  const title = document.createElement('h2');
  title.textContent = list.name;
  title.contentEditable = true;
  title.onblur = () => {
    list.name = title.textContent;
    save();
  };
  listNode.appendChild(title);

  const input = document.createElement('input');
  input.placeholder = 'New Task Name';
  input.name = 'taskName';
  input.type = 'text';
  const addBtn = document.createElement('button');
  addBtn.textContent = 'Add Task';
  addBtn.className = 'add-btn';

  const ul = document.createElement('ul');
  list.tasks.forEach(task => ul.appendChild(createTaskNode(list, task, listNode, ul)));

  const addTask = () => {
    if (!input.value) return;
    const task = { text: input.value, done: false };
    list.tasks.push(task);
    input.value = '';
    ul.appendChild(createTaskNode(list, task, listNode, ul));
    updateSortSelect(list, listNode, ul);
    save();
  };

  addBtn.onclick = addTask;
  input.addEventListener('keydown', e => e.key === 'Enter' && addTask());

  listNode.append(input, addBtn, ul);

  const deleteListBtn = document.createElement('button');
  deleteListBtn.textContent = 'Remove List';
  deleteListBtn.className = 'remove-list-btn';
  deleteListBtn.onclick = () => {
    const index = lists.indexOf(list);
    if (index !== -1) lists.splice(index, 1);
    listNode.remove();
    if (!lists.length) {
      noListsMsg = document.createElement('p');
      noListsMsg.className = 'no-lists';
      noListsMsg.textContent = 'There is no list yet.';
      listsContainer.appendChild(noListsMsg);
    }
    save();
  };
  listNode.appendChild(deleteListBtn);

  updateSortSelect(list, listNode, ul);

  return listNode;
};

lists.forEach(list => {
  if (noListsMsg) noListsMsg.remove();
  listsContainer.appendChild(createListNode(list));
});

addListBtn.onclick = () => {
  if (!newListName.value) return;
  const newList = { name: newListName.value, tasks: [] };
  lists.push(newList);
  newListName.value = '';
  if (noListsMsg) noListsMsg.remove();
  listsContainer.appendChild(createListNode(newList));
  save();
};

newListName.addEventListener('keydown', e => e.key === 'Enter' && addListBtn.click());
