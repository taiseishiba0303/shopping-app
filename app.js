if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}

let menus = JSON.parse(localStorage.getItem('menus')) || [];
let masterIngredients = JSON.parse(localStorage.getItem('masterIngredients')) || [];

function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  
  document.getElementById(tabId).classList.add('active');
  if (tabId === 'tab1') {
    document.getElementById('tabBtn1').classList.add('active');
    renderMenus();
  }
  if (tabId === 'tab2') {
    document.getElementById('tabBtn2').classList.add('active');
    renderMasterIngredients();
  }
  if (tabId === 'tab3') {
    document.getElementById('tabBtn3').classList.add('active');
    renderManageMenus();
  }
}

function getIngredientSelectOptions() {
  let options = '<option value="">(選択)</option>';
  masterIngredients.forEach((item, index) => {
    options += `<option value="${index}">${item.name} (${item.price}円)</option>`;
  });
  return options;
}

function addIngredientRow() {
  const container = document.getElementById('ingredientInputs');
  const div = document.createElement('div');
  div.className = 'ing-row';
  div.innerHTML = `
    <select onchange="selectMasterIngredient(this)">${getIngredientSelectOptions()}</select>
    <input type="text" class="ing-name" placeholder="材料">
    <input type="number" class="ing-price" placeholder="円">
  `;
  container.appendChild(div);
}

function selectMasterIngredient(selectEl) {
  const index = selectEl.value;
  const row = selectEl.parentElement;
  if (index !== "") {
    const item = masterIngredients[index];
    row.querySelector('.ing-name').value = item.name;
    row.querySelector('.ing-price').value = item.price;
  }
}

function saveMenu() {
  const name = document.getElementById('menuName').value;
  if (!name) return alert('献立名を入力してください');

  const names = document.querySelectorAll('#tab3 .ing-name');
  const prices = document.querySelectorAll('#tab3 .ing-price');
  const ingredients = [];

  names.forEach((input, index) => {
    const ingName = input.value.trim();
    const ingPrice = parseInt(prices[index].value) || 0;
    
    if (ingName) {
      ingredients.push({ name: ingName, price: ingPrice });

      const existsIndex = masterIngredients.findIndex(item => item.name === ingName);
      if (existsIndex === -1) {
        masterIngredients.push({ name: ingName, price: ingPrice });
      } else {
        masterIngredients[existsIndex].price = ingPrice;
      }
    }
  });

  localStorage.setItem('masterIngredients', JSON.stringify(masterIngredients));

  menus.push({ id: Date.now(), name, ingredients });
  localStorage.setItem('menus', JSON.stringify(menus));

  document.getElementById('menuName').value = '';
  document.getElementById('ingredientInputs').innerHTML = '';
  addIngredientRow();
  
  renderMenus();
  renderManageMenus();
  alert('献立と食材を保存しました！');
}

function renderMenus() {
  const list = document.getElementById('menuList');
  if (!list) return;
  list.innerHTML = '';
  if (menus.length === 0) {
    list.innerHTML = '<p style="color:#666;">登録された献立がありません。「📝 献立」タブから追加してください。</p>';
    return;
  }
  menus.forEach(menu => {
    const menuTotal = menu.ingredients.reduce((sum, ing) => sum + (ing.price || 0), 0);

    const label = document.createElement('label');
    label.className = 'menu-item';
    label.innerHTML = `
      <input type="checkbox" value="${menu.id}" class="menu-checkbox"> ${menu.name} <span style="font-size: 0.9em; color: #666;">（${menuTotal}円）</span>
    `;
    list.appendChild(label);
  });
}

function generateShoppingList() {
  const checkboxes = document.querySelectorAll('.menu-checkbox:checked');
  const selectedIds = Array.from(checkboxes).map(cb => parseInt(cb.value));
  
  if (selectedIds.length === 0) {
    return alert('献立を1つ以上選択してください');
  }

  const shoppingList = document.getElementById('shoppingList');
  shoppingList.innerHTML = '';

  selectedIds.forEach(id => {
    const menu = menus.find(m => m.id === id);
    if (menu) {
      menu.ingredients.forEach(ing => {
        const li = document.createElement('li');
        li.setAttribute('data-price', ing.price || 0);
        li.innerHTML = `<span>${ing.name}</span><span>${ing.price}円</span>`;
        
        li.onclick = function() {
          this.classList.toggle('purchased');
          updateShoppingTotals();
        };

        shoppingList.appendChild(li);
      });
    }
  });

  updateShoppingTotals();

  document.getElementById('menuSelectCard').style.display = 'none';
  document.getElementById('shoppingListCard').style.display = 'block';
}

// ------------------------------------
// リアルタイム再計算（8%消費税対応）
// ------------------------------------
function updateShoppingTotals() {
  const items = document.querySelectorAll('#shoppingList li');
  let totalPrice = 0;
  let purchasedPrice = 0;

  items.forEach(item => {
    const price = parseInt(item.getAttribute('data-price')) || 0;
    totalPrice += price;
    if (item.classList.contains('purchased')) {
      purchasedPrice += price;
    }
  });

  const remainingPrice = totalPrice - purchasedPrice;

  // 8%の消費税計算（端数切捨て）
  const purchasedTax = Math.floor(purchasedPrice * 1.08);
  const totalTax = Math.floor(totalPrice * 1.08);
  const remainingTax = Math.floor(remainingPrice * 1.08);

  // 画面に数値を反映
  document.getElementById('purchasedPrice').textContent = purchasedPrice.toLocaleString();
  document.getElementById('purchasedTax').textContent = purchasedTax.toLocaleString();
  
  document.getElementById('totalPrice').textContent = totalPrice.toLocaleString();
  document.getElementById('totalTax').textContent = totalTax.toLocaleString();
  
  document.getElementById('remainingPrice').textContent = remainingPrice.toLocaleString();
  document.getElementById('remainingTax').textContent = remainingTax.toLocaleString();
}

function backToMenuSelect() {
  document.getElementById('menuSelectCard').style.display = 'block';
  document.getElementById('shoppingListCard').style.display = 'none';
}

function renderManageMenus() {
  const container = document.getElementById('manageMenuList');
  if (!container) return;
  
  if (menus.length === 0) {
    container.innerHTML = '<p style="color:#666;">登録された献立はありません。</p>';
    return;
  }

  container.innerHTML = '';
  menus.forEach((menu, menuIndex) => {
    const div = document.createElement('div');
    div.className = 'manage-card';

    let ingHtml = '';
    menu.ingredients.forEach((ing, ingIndex) => {
      ingHtml += `
        <div class="edit-row">
          <input type="text" value="${ing.name}" onchange="updateIngredient(${menuIndex}, ${ingIndex}, 'name', this.value)">
          <input type="number" value="${ing.price}" onchange="updateIngredient(${menuIndex}, ${ingIndex}, 'price', this.value)"> 円
        </div>
      `;
    });

    div.innerHTML = `
      <label style="font-size: 0.8rem; color: #666;">献立名:</label>
      <input type="text" value="${menu.name}" style="font-weight: bold; font-size: 1.1rem; margin-bottom: 8px;" onchange="updateMenuName(${menuIndex}, this.value)">
      <label style="font-size: 0.8rem; color: #666;">材料・価格:</label>
      ${ingHtml}
      <button class="danger-btn" onclick="deleteMenu(${menuIndex})">この献立を削除</button>
    `;
    container.appendChild(div);
  });
}

function updateMenuName(menuIndex, newName) {
  if (!newName) return alert('献立名を入力してください');
  menus[menuIndex].name = newName;
  localStorage.setItem('menus', JSON.stringify(menus));
  renderMenus();
}

function updateIngredient(menuIndex, ingIndex, field, value) {
  if (field === 'price') value = parseInt(value) || 0;
  menus[menuIndex].ingredients[ingIndex][field] = value;
  localStorage.setItem('menus', JSON.stringify(menus));
  renderMenus();
}

function deleteMenu(index) {
  if (confirm('本当にこの献立を削除しますか？')) {
    menus.splice(index, 1);
    localStorage.setItem('menus', JSON.stringify(menus));
    renderManageMenus();
    renderMenus();
  }
}

function saveMasterIngredient() {
  const name = document.getElementById('masterIngName').value.trim();
  const price = parseInt(document.getElementById('masterIngPrice').value) || 0;

  if (!name) return alert('食材名を入力してください');

  const existsIndex = masterIngredients.findIndex(item => item.name === name);
  if (existsIndex === -1) {
    masterIngredients.push({ name, price });
  } else {
    masterIngredients[existsIndex].price = price;
  }

  localStorage.setItem('masterIngredients', JSON.stringify(masterIngredients));

  document.getElementById('masterIngName').value = '';
  document.getElementById('masterIngPrice').value = '';

  renderMasterIngredients();
  alert('食材を登録しました！');
}

function saveBulkIngredients() {
  const text = document.getElementById('bulkIngInput').value.trim();
  if (!text) return alert('テキストを入力または貼り付けてください');

  const lines = text.split('\n');
  let addedCount = 0;

  lines.forEach(line => {
    const parts = line.trim().split(/[\s,:\t]+/);
    if (parts.length >= 2) {
      const name = parts[0];
      const price = parseInt(parts[1].replace(/[^0-9]/g, '')) || 0;
      if (name && !isNaN(price)) {
        const existsIndex = masterIngredients.findIndex(item => item.name === name);
        if (existsIndex === -1) {
          masterIngredients.push({ name, price });
        } else {
          masterIngredients[existsIndex].price = price;
        }
        addedCount++;
      }
    }
  });

  localStorage.setItem('masterIngredients', JSON.stringify(masterIngredients));
  document.getElementById('bulkIngInput').value = '';
  renderMasterIngredients();
  alert(`${addedCount}件の食材を登録・更新しました！`);
}

function renderMasterIngredients() {
  const container = document.getElementById('masterIngList');
  if (!container) return;

  if (masterIngredients.length === 0) {
    container.innerHTML = '<p style="color:#666;">登録された食材はありません。</p>';
    return;
  }

  container.innerHTML = '';
  masterIngredients.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'master-item';
    div.innerHTML = `
      <span><strong>${item.name}</strong> : ${item.price}円</span>
      <button class="danger-btn" onclick="deleteMasterIngredient(${index})">削除</button>
    `;
    container.appendChild(div);
  });
}

function deleteMasterIngredient(index) {
  masterIngredients.splice(index, 1);
  localStorage.setItem('masterIngredients', JSON.stringify(masterIngredients));
  renderMasterIngredients();
}

addIngredientRow();
renderMenus();