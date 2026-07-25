if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}

let menus = JSON.parse(localStorage.getItem('menus')) || [];
let masterIngredients = JSON.parse(localStorage.getItem('masterIngredients')) || [];

function sortMasterIngredients() {
  masterIngredients.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
}

function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  
  document.getElementById(tabId).classList.add('active');
  if (tabId === 'tab1') {
    document.getElementById('tabBtn1').classList.add('active');
    renderMenus();
    renderSelectableIngredients();
    updateSelectionSummary();
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

// サブタブ切り替え（献立から選ぶ / 食材一覧から選ぶ）
function switchSubTab(type) {
  const menuContent = document.getElementById('subTabMenuContent');
  const ingContent = document.getElementById('subTabIngContent');
  const menuBtn = document.getElementById('subTabMenuBtn');
  const ingBtn = document.getElementById('subTabIngBtn');

  if (type === 'menu') {
    menuContent.style.display = 'block';
    ingContent.style.display = 'none';
    menuBtn.classList.add('active');
    ingBtn.classList.remove('active');
  } else {
    menuContent.style.display = 'none';
    ingContent.style.display = 'block';
    menuBtn.classList.remove('active');
    ingBtn.classList.add('active');
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

  sortMasterIngredients();
  localStorage.setItem('masterIngredients', JSON.stringify(masterIngredients));

  menus.push({ id: Date.now(), name, ingredients });
  localStorage.setItem('menus', JSON.stringify(menus));

  document.getElementById('menuName').value = '';
  document.getElementById('ingredientInputs').innerHTML = '';
  addIngredientRow();
  
  renderMenus();
  renderManageMenus();
  renderSelectableIngredients();
  alert('献立と食材を保存しました！');
}

// 献立一覧の描画（右端に中央揃えボタン配置）
function renderMenus() {
  const list = document.getElementById('menuList');
  if (!list) return;
  list.innerHTML = '';
  if (menus.length === 0) {
    list.innerHTML = '<p style="color:#666;">登録された献立がありません。「📝 献立」タブから追加してください。</p>';
    return;
  }

  // ボタン中央揃え用共通CSS
  const btnStyleMinus = "width:28px; height:28px; border-radius:50%; border:1px solid #ccc; background:#fff; font-weight:bold; cursor:pointer; font-size:16px; display:inline-flex; align-items:center; justify-content:center; padding:0; line-height:1;";
  const btnStylePlus = "width:28px; height:28px; border-radius:50%; border:1px solid #4CAF50; background:#e8f5e9; color:#2e7d32; font-weight:bold; cursor:pointer; font-size:16px; display:inline-flex; align-items:center; justify-content:center; padding:0; line-height:1;";

  menus.forEach(menu => {
    const menuTotal = menu.ingredients.reduce((sum, ing) => sum + (ing.price || 0), 0);

    const div = document.createElement('div');
    div.className = 'menu-item-row';
    div.style.cssText = 'display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-bottom: 1px solid #eee; cursor: pointer; user-select: none;';

    div.innerHTML = `
      <div style="display: flex; align-items: center; flex: 1; overflow: hidden;" onclick="toggleRowSelect(this, 'menu')">
        <input type="checkbox" value="${menu.id}" class="menu-checkbox" style="margin-right: 10px; transform: scale(1.2); pointer-events: none;">
        <span style="font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${menu.name}</span>
        <span style="font-size: 0.85em; color: #777; margin-left: 6px;">（${menuTotal}円）</span>
      </div>
      <div class="qty-control" style="display: flex; align-items: center; gap: 6px; margin-left: 10px;">
        <button type="button" onclick="changeQty(this, -1, 'menu')" style="${btnStyleMinus}">-</button>
        <span class="qty-count" style="min-width: 18px; text-align: center; font-weight: bold; font-size: 0.95rem;">0</span>
        <button type="button" onclick="changeQty(this, 1, 'menu')" style="${btnStylePlus}">+</button>
      </div>
    `;

    list.appendChild(div);
  });
}

// 食材一覧の描画（右端に中央揃えボタン配置）
function renderSelectableIngredients() {
  const container = document.getElementById('selectIngList');
  if (!container) return;
  container.innerHTML = '';

  if (masterIngredients.length === 0) {
    container.innerHTML = '<p style="color:#666;">登録された食材がありません。「🥦 食材登録」タブから追加してください。</p>';
    return;
  }

  // ボタン中央揃え用共通CSS
  const btnStyleMinus = "width:28px; height:28px; border-radius:50%; border:1px solid #ccc; background:#fff; font-weight:bold; cursor:pointer; font-size:16px; display:inline-flex; align-items:center; justify-content:center; padding:0; line-height:1;";
  const btnStylePlus = "width:28px; height:28px; border-radius:50%; border:1px solid #4CAF50; background:#e8f5e9; color:#2e7d32; font-weight:bold; cursor:pointer; font-size:16px; display:inline-flex; align-items:center; justify-content:center; padding:0; line-height:1;";

  masterIngredients.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'ing-item-row';
    div.style.cssText = 'display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-bottom: 1px solid #eee; cursor: pointer; user-select: none;';

    div.innerHTML = `
      <div style="display: flex; align-items: center; flex: 1; overflow: hidden;" onclick="toggleRowSelect(this, 'ing')">
        <input type="checkbox" value="${index}" class="ing-checkbox" style="margin-right: 10px; transform: scale(1.2); pointer-events: none;">
        <span style="font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.name}</span>
        <span style="font-size: 0.85em; color: #777; margin-left: 6px;">（${item.price}円）</span>
      </div>
      <div class="qty-control" style="display: flex; align-items: center; gap: 6px; margin-left: 10px;">
        <button type="button" onclick="changeQty(this, -1, 'ing')" style="${btnStyleMinus}">-</button>
        <span class="qty-count" style="min-width: 18px; text-align: center; font-weight: bold; font-size: 0.95rem;">0</span>
        <button type="button" onclick="changeQty(this, 1, 'ing')" style="${btnStylePlus}">+</button>
      </div>
    `;

    container.appendChild(div);
  });
}

// 行全体のタップ判定（0個なら1個選択、すでに1個以上選択済なら解除）
function toggleRowSelect(textDiv, type) {
  const row = textDiv.parentElement;
  const checkbox = row.querySelector('input[type="checkbox"]');
  const countSpan = row.querySelector('.qty-count');
  let currentQty = parseInt(countSpan.textContent) || 0;

  if (currentQty === 0) {
    currentQty = 1;
    checkbox.checked = true;
  } else {
    currentQty = 0;
    checkbox.checked = false;
  }

  countSpan.textContent = currentQty;
  updateSelectionSummary();
}

// ボタンによる数量変更 (+ / -)
function changeQty(btn, delta, type) {
  event.stopPropagation(); // 行全体のクリックイベント発火を防ぐ
  const row = btn.closest('div.menu-item-row, div.ing-item-row');
  const checkbox = row.querySelector('input[type="checkbox"]');
  const countSpan = row.querySelector('.qty-count');

  let currentQty = parseInt(countSpan.textContent) || 0;
  currentQty += delta;

  if (currentQty < 0) currentQty = 0;

  countSpan.textContent = currentQty;
  checkbox.checked = currentQty > 0;

  updateSelectionSummary();
}

// 選択状態と回数（個数）を取得して重なり合算
function getSelectedItemsData() {
  const selectedMenus = [];
  const selectedIngs = [];

  document.querySelectorAll('.menu-item-row').forEach(row => {
    const cb = row.querySelector('.menu-checkbox');
    const qty = parseInt(row.querySelector('.qty-count').textContent) || 0;
    if (cb.checked && qty > 0) {
      selectedMenus.push({ id: parseInt(cb.value), qty: qty });
    }
  });

  document.querySelectorAll('.ing-item-row').forEach(row => {
    const cb = row.querySelector('.ing-checkbox');
    const qty = parseInt(row.querySelector('.qty-count').textContent) || 0;
    if (cb.checked && qty > 0) {
      selectedIngs.push({ index: parseInt(cb.value), qty: qty });
    }
  });

  return { selectedMenus, selectedIngs };
}

// 重複の合算（回数倍率考慮）＋ 50音順ソート処理
function getConsolidatedIngredients() {
  const { selectedMenus, selectedIngs } = getSelectedItemsData();
  const ingMap = {}; // 食材名ごとの合計金額と個数を管理

  // 1. 選択された献立の材料を回数(qty)倍して集計
  selectedMenus.forEach(item => {
    const menu = menus.find(m => m.id === item.id);
    if (menu) {
      menu.ingredients.forEach(ing => {
        const name = ing.name;
        const price = ing.price || 0;
        if (!ingMap[name]) {
          ingMap[name] = { price: 0, count: 0 };
        }
        ingMap[name].price += price * item.qty;
        ingMap[name].count += item.qty;
      });
    }
  });

  // 2. 単体で直接選択された食材を回数(qty)倍して集計
  selectedIngs.forEach(item => {
    const ing = masterIngredients[item.index];
    if (ing) {
      const name = ing.name;
      const price = ing.price || 0;
      if (!ingMap[name]) {
        ingMap[name] = { price: 0, count: 0 };
      }
      ingMap[name].price += price * item.qty;
      ingMap[name].count += item.qty;
    }
  });

  // 連想配列を配列に変換
  const consolidatedList = Object.keys(ingMap).map(name => ({
    name: name,
    price: ingMap[name].price,
    count: ingMap[name].count
  }));

  // 3. 50音順（あいうえお順）に並べ替え
  consolidatedList.sort((a, b) => a.name.localeCompare(b.name, 'ja'));

  return consolidatedList;
}

// ボタン下のプレビュー表示
function updateSelectionSummary() {
  const container = document.getElementById('selectedItemsSummary');
  if (!container) return;

  const items = getConsolidatedIngredients();

  if (items.length === 0) {
    container.innerHTML = '<p class="summary-empty">選択中の項目はありません</p>';
    return;
  }

  let totalPrice = 0;
  items.forEach(item => {
    totalPrice += item.price;
  });

  const taxPrice = Math.floor(totalPrice * 1.08);

  let html = `<div class="summary-header">🛒 選択中: ${items.length}種類 (税込 ${taxPrice.toLocaleString()}円 / 税抜 ${totalPrice.toLocaleString()}円)</div><ul class="summary-list">`;
  items.forEach(item => {
    const countText = item.count > 1 ? ` (${item.count})` : '';
    html += `<li><span>• ${item.name}${countText}</span><span>${item.price}円</span></li>`;
  });
  html += '</ul>';

  container.innerHTML = html;
}

// 買い物リスト生成
function generateShoppingList() {
  const consolidatedList = getConsolidatedIngredients();

  if (consolidatedList.length === 0) {
    return alert('献立または食材を1つ以上選択してください');
  }

  const shoppingList = document.getElementById('shoppingList');
  shoppingList.innerHTML = '';

  consolidatedList.forEach(item => {
    addShoppingListItem(item.name, item.price, item.count);
  });

  updateShoppingTotals();

  document.getElementById('menuSelectCard').style.display = 'none';
  document.getElementById('shoppingListCard').style.display = 'block';
}

function addShoppingListItem(name, price, count) {
  const shoppingList = document.getElementById('shoppingList');
  const li = document.createElement('li');
  li.setAttribute('data-price', price || 0);

  const displayName = count > 1 ? `${name} (${count})` : name;

  li.innerHTML = `<span>${displayName}</span><span>${price}円</span>`;
  
  li.onclick = function() {
    this.classList.toggle('purchased');
    updateShoppingTotals();
  };

  shoppingList.appendChild(li);
}

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

  const purchasedTax = Math.floor(purchasedPrice * 1.08);
  const totalTax = Math.floor(totalPrice * 1.08);
  const remainingTax = Math.floor(remainingPrice * 1.08);

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

  sortMasterIngredients();
  localStorage.setItem('masterIngredients', JSON.stringify(masterIngredients));

  document.getElementById('masterIngName').value = '';
  document.getElementById('masterIngPrice').value = '';

  renderMasterIngredients();
  renderSelectableIngredients();
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

  sortMasterIngredients();
  localStorage.setItem('masterIngredients', JSON.stringify(masterIngredients));
  document.getElementById('bulkIngInput').value = '';
  renderMasterIngredients();
  renderSelectableIngredients();
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
      <div class="edit-row" style="flex: 1; margin-bottom: 0;">
        <input type="text" value="${item.name}" onchange="updateMasterIngredient(${index}, 'name', this.value)" style="width: 50%;">
        <input type="number" value="${item.price}" onchange="updateMasterIngredient(${index}, 'price', this.value)" style="width: 35%;"> 円
      </div>
      <button class="danger-btn" onclick="deleteMasterIngredient(${index})" style="width: auto; padding: 6px 10px; margin: 0 0 0 8px; font-size: 0.8rem;">削除</button>
    `;
    container.appendChild(div);
  });
}

function updateMasterIngredient(index, field, value) {
  if (field === 'price') value = parseInt(value) || 0;
  masterIngredients[index][field] = value;
  
  sortMasterIngredients();
  localStorage.setItem('masterIngredients', JSON.stringify(masterIngredients));
  renderMasterIngredients();
  renderSelectableIngredients();
  updateSelectionSummary();
}

function deleteMasterIngredient(index) {
  if (confirm('この食材を削除しますか？')) {
    masterIngredients.splice(index, 1);
    localStorage.setItem('masterIngredients', JSON.stringify(masterIngredients));
    renderMasterIngredients();
    renderSelectableIngredients();
    updateSelectionSummary();
  }
}

sortMasterIngredients();
addIngredientRow();
renderMenus();
renderSelectableIngredients();
updateSelectionSummary();