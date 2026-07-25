let masterIngredients = JSON.parse(localStorage.getItem('masterIngredients')) || [];
let eatOutStores = JSON.parse(localStorage.getItem('eatOutStores')) || [];
let menus = JSON.parse(localStorage.getItem('menus')) || [];
let shoppingList = JSON.parse(localStorage.getItem('shoppingList')) || [];
let stockList = JSON.parse(localStorage.getItem('stockList')) || [];

let fixedScheduleKeys = [
  { day: '月', time: '昼' }, { day: '月', time: '夜' },
  { day: '火', time: '昼' }, { day: '火', time: '夜' },
  { day: '水', time: '昼' }, { day: '水', time: '夜' },
  { day: '木', time: '昼' }, { day: '木', time: '夜' },
  { day: '金', time: '昼' }, { day: '金', time: '夜' },
  { day: '土', time: '昼' }, { day: '土', time: '夜' },
  { day: '日', time: '昼' }, { day: '日', time: '夜' }
];

let currentSchedules = JSON.parse(localStorage.getItem('currentSchedules')) || {};
let historyRecords = JSON.parse(localStorage.getItem('historyRecords')) || [];

let unitPrices = JSON.parse(localStorage.getItem('unitPrices')) || {};

let editingShoppingIndex = null;
let editingMasterIndex = null;
let editingEatOutIndex = null;
let editingMenuIndex = null;

function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  
  document.getElementById(tabId).classList.add('active');
  const btnMap = { tab1: 'tabBtn1', tab2: 'tabBtn2', tab5: 'tabBtn5', tab3: 'tabBtn3' };
  if (btnMap[tabId]) document.getElementById(btnMap[tabId]).classList.add('active');

  if (tabId === 'tab1') {
    renderSchedule();
    renderHistory();
  } else if (tabId === 'tab2') {
    renderShoppingListView();
    renderMenuSelect();
    renderSelectIngredients();
  } else if (tabId === 'tab3') {
    switchDbSubTab('ing');
  } else if (tabId === 'tab5') {
    renderStock();
  }
}

function switchDbSubTab(sub) {
  const isIng = sub === 'ing';
  const isMenu = sub === 'menu';
  const isEat = sub === 'eat';

  document.getElementById('dbSubTabIngContent').style.display = isIng ? 'block' : 'none';
  document.getElementById('dbSubTabMenuContent').style.display = isMenu ? 'block' : 'none';
  document.getElementById('dbSubTabEatContent').style.display = isEat ? 'block' : 'none';

  const ingBtn = document.getElementById('dbSubTabIngBtn');
  const menuBtn = document.getElementById('dbSubTabMenuBtn');
  const eatBtn = document.getElementById('dbSubTabEatBtn');

  [ingBtn, menuBtn, eatBtn].forEach(btn => {
    btn.style.background = '#f5f5f5';
    btn.style.color = '#666';
  });

  const activeBtn = isIng ? ingBtn : (isMenu ? menuBtn : eatBtn);
  activeBtn.style.background = '#4CAF50';
  activeBtn.style.color = 'white';

  if (isIng) renderMasterIngredients();
  if (isMenu) renderManageMenus();
  if (isEat) renderEatOutStores();
}

function switchSubTab(sub) {
  const isMenu = sub === 'menu';
  document.getElementById('subTabMenuContent').style.display = isMenu ? 'block' : 'none';
  document.getElementById('subTabIngContent').style.display = isMenu ? 'none' : 'block';
  document.getElementById('subTabMenuBtn').style.borderBottom = isMenu ? '3px solid #4CAF50' : 'none';
  document.getElementById('subTabMenuBtn').style.color = isMenu ? '#4CAF50' : '#666';
  document.getElementById('subTabIngBtn').style.borderBottom = !isMenu ? '3px solid #4CAF50' : 'none';
  document.getElementById('subTabIngBtn').style.color = !isMenu ? '#4CAF50' : '#666';
}

function renderMenuSelect() {
  const container = document.getElementById('menuList');
  if (!container) return;
  if (menus.length === 0) {
    container.innerHTML = '<p style="color:#888; text-align:center;">登録されている献立がありません。</p>';
    return;
  }
  container.innerHTML = menus.map((menu, mIdx) => `
    <div class="select-item">
      <label style="cursor:pointer; display:flex; align-items:center; flex:1; margin:0;">
        <input type="checkbox" class="menu-checkbox" value="${mIdx}" onchange="toggleQtyControls(this, 'menu-qty-${mIdx}')" style="width:auto; margin-right:8px;">
        <span style="font-weight:500;">${menu.name}</span>
        <span style="font-size:0.8rem; color:#666; margin-left:6px;">(${menu.ingredients.length}品)</span>
      </label>
      <div id="menu-qty-${mIdx}" class="qty-controls" style="display:none;">
        <button type="button" class="qty-btn" onclick="changeQty('menu-qty-num-${mIdx}', -1)">-</button>
        <span id="menu-qty-num-${mIdx}" class="qty-num">1</span>
        <button type="button" class="qty-btn" onclick="changeQty('menu-qty-num-${mIdx}', 1)">+</button>
      </div>
    </div>
  `).join('');
}

function renderSelectIngredients() {
  const container = document.getElementById('selectIngList');
  if (!container) return;
  if (masterIngredients.length === 0) {
    container.innerHTML = '<p style="color:#888; text-align:center;">登録されている食材がありません。</p>';
    return;
  }
  container.innerHTML = masterIngredients.map((ing, iIdx) => `
    <div class="select-item">
      <label style="cursor:pointer; display:flex; align-items:center; flex:1; margin:0;">
        <input type="checkbox" class="ing-checkbox" value="${iIdx}" onchange="toggleQtyControls(this, 'ing-qty-${iIdx}')" style="width:auto; margin-right:8px;">
        <span style="font-weight:500;">${ing.name}</span>
        <span style="font-size:0.85rem; color:#2e7d32; font-weight:bold; margin-left:6px;">${ing.price ? ing.price + '円' : ''}</span>
      </label>
      <div id="ing-qty-${iIdx}" class="qty-controls" style="display:none;">
        <button type="button" class="qty-btn" onclick="changeQty('ing-qty-num-${iIdx}', -1)">-</button>
        <span id="ing-qty-num-${iIdx}" class="qty-num">1</span>
        <button type="button" class="qty-btn" onclick="changeQty('ing-qty-num-${iIdx}', 1)">+</button>
      </div>
    </div>
  `).join('');
}

function toggleQtyControls(checkbox, controlId) {
  const controlBox = document.getElementById(controlId);
  if (controlBox) controlBox.style.display = checkbox.checked ? 'flex' : 'none';
  updateSummary();
}

function changeQty(numId, amount) {
  const numSpan = document.getElementById(numId);
  if (!numSpan) return;
  let current = parseInt(numSpan.textContent) || 1;
  current += amount;
  if (current < 1) current = 1;
  numSpan.textContent = current;
  updateSummary();
}

function updateSummary() {
  const summaryBox = document.getElementById('selectedItemsSummary');
  if (!summaryBox) return;
  const checkedMenus = Array.from(document.querySelectorAll('.menu-checkbox:checked'));
  const checkedIngs = Array.from(document.querySelectorAll('.ing-checkbox:checked'));

  if (checkedMenus.length === 0 && checkedIngs.length === 0) {
    summaryBox.innerHTML = '<p class="summary-empty" style="margin:0; color:#666; font-size:0.9rem;">選択中の項目はありません</p>';
    return;
  }

  let html = '<strong style="font-size:0.9rem; color:#2e7d32;">選択中:</strong><ul style="margin:4px 0 0 20px; padding:0; font-size:0.9rem;">';
  checkedMenus.forEach(el => {
    const m = menus[el.value];
    const qtyEl = document.getElementById(`menu-qty-num-${el.value}`);
    const qty = qtyEl ? qtyEl.textContent : 1;
    html += `<li>献立: ${m.name} × ${qty}</li>`;
  });
  checkedIngs.forEach(el => {
    const i = masterIngredients[el.value];
    const qtyEl = document.getElementById(`ing-qty-num-${el.value}`);
    const qty = qtyEl ? qtyEl.textContent : 1;
    html += `<li>食材: ${i.name} (${i.price || 0}円) × ${qty}</li>`;
  });
  html += '</ul>';
  summaryBox.innerHTML = html;
}

function generateShoppingListFromSchedule() {
  const scheduleRows = document.querySelectorAll('#currentScheduleTableBody tr');
  let rawItems = [];

  if (scheduleRows.length > 0) {
    scheduleRows.forEach(row => {
      const input = row.querySelector('input[type="text"], .menu-input');
      if (input && input.value.trim() !== "") {
        const menuName = input.value.trim();
        const matchedMenu = menus.find(m => m.name === menuName);
        if (matchedMenu && matchedMenu.ingredients) {
          matchedMenu.ingredients.forEach(i => {
            rawItems.push({ name: i.name, price: i.price ? Number(i.price) : 0 });
          });
        }
      }
    });
  } else {
    fixedScheduleKeys.forEach(keyObj => {
      const keyStr = `${keyObj.day}_${keyObj.time}`;
      const data = currentSchedules[keyStr];
      if (data && data.name && data.name.trim() !== "") {
        const matchedMenu = menus.find(m => m.name === data.name.trim());
        if (matchedMenu && matchedMenu.ingredients) {
          matchedMenu.ingredients.forEach(i => {
            rawItems.push({ name: i.name, price: i.price ? Number(i.price) : 0 });
          });
        }
      }
    });
  }

  if (rawItems.length === 0) {
    alert('予定に登録されている献立（材料付き）がありません。');
    return;
  }

  let map = {};
  unitPrices = {};
  rawItems.forEach(item => {
    if (!map[item.name]) {
      map[item.name] = { name: item.name, totalPrice: 0, qty: 0, completed: false };
      unitPrices[item.name] = item.price > 0 ? item.price : 0;
    } else {
      if (item.price > 0 && unitPrices[item.name] === 0) { unitPrices[item.name] = item.price; }
    }
    map[item.name].qty += 1;
  });

  Object.keys(map).forEach(name => {
    map[name].totalPrice = unitPrices[name] * map[name].qty;
  });

  shoppingList = Object.values(map);
  localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
  localStorage.setItem('unitPrices', JSON.stringify(unitPrices));
  
  renderShoppingListView();
}

function addSelectedItemsToShoppingList() {
  const checkedMenus = Array.from(document.querySelectorAll('.menu-checkbox:checked'));
  const checkedIngs = Array.from(document.querySelectorAll('.ing-checkbox:checked'));
  let rawItems = [];
  
  checkedMenus.forEach(el => {
    const m = menus[el.value];
    const qtyEl = document.getElementById(`menu-qty-num-${el.value}`);
    const qty = qtyEl ? (parseInt(qtyEl.textContent) || 1) : 1;
    for (let q = 0; q < qty; q++) {
      m.ingredients.forEach(i => {
        rawItems.push({ name: i.name, price: i.price ? Number(i.price) : 0 });
      });
    }
  });

  checkedIngs.forEach(el => {
    const i = masterIngredients[el.value];
    const qtyEl = document.getElementById(`ing-qty-num-${el.value}`);
    const qty = qtyEl ? (parseInt(qtyEl.textContent) || 1) : 1;
    for (let q = 0; q < qty; q++) {
      rawItems.push({ name: i.name, price: i.price ? Number(i.price) : 0 });
    }
  });

  if (rawItems.length === 0) { alert('アイテムが選択されていません。'); return; }

  rawItems.forEach(item => {
    let existing = shoppingList.find(s => s.name === item.name);
    if (existing) {
      existing.qty += 1;
      if (item.price > 0 && (!unitPrices[item.name] || unitPrices[item.name] === 0)) {
        unitPrices[item.name] = item.price;
      }
      existing.totalPrice = (unitPrices[item.name] || 0) * existing.qty;
    } else {
      unitPrices[item.name] = item.price > 0 ? item.price : 0;
      shoppingList.push({ name: item.name, qty: 1, totalPrice: unitPrices[item.name], completed: false });
    }
  });

  localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
  localStorage.setItem('unitPrices', JSON.stringify(unitPrices));
  
  backToShoppingMain();
}

function openMenuSelect() {
  const menuSelectCard = document.getElementById('menuSelectCard');
  const shoppingListCard = document.getElementById('shoppingListCard');
  if (shoppingListCard) shoppingListCard.style.display = 'none';
  if (menuSelectCard) {
    menuSelectCard.style.display = 'block';
    menuSelectCard.scrollTop = 0;
  }
  renderMenuSelect();
  renderSelectIngredients();
}

function backToShoppingMain() {
  const menuSelectCard = document.getElementById('menuSelectCard');
  const shoppingListCard = document.getElementById('shoppingListCard');
  if (menuSelectCard) menuSelectCard.style.display = 'none';
  if (shoppingListCard) shoppingListCard.style.display = 'block';
  renderShoppingListView();
}

function renderShoppingListView() {
  unitPrices = JSON.parse(localStorage.getItem('unitPrices')) || {};
  const container = document.getElementById('shoppingList');
  if (!container) return;
  
  if (shoppingList.length === 0) {
    container.innerHTML = '<p style="color:#888; text-align:center; padding:15px 0;">お買い物リストは空です。「予定から読み込む」または「献立・食材を追加」ボタンから追加してください。</p>';
  } else {
    container.innerHTML = shoppingList.map((item, idx) => `
      <li class="list-item shopping-item ${item.completed ? 'completed' : ''}" data-index="${idx}">
        <div style="font-weight:500;">
          ${item.name} 
          <span style="font-size:0.85rem; color:#666; margin-left:6px;">(×${item.qty})</span>
        </div>
        <span style="color:#2e7d32; font-weight:bold;">${item.totalPrice.toLocaleString()}円</span>
      </li>
    `).join('');
  }

  document.querySelectorAll('.shopping-item').forEach(item => {
    let timer = null;
    let isLongPress = false;
    const idx = parseInt(item.getAttribute('data-index'));

    const startLongPress = () => {
      isLongPress = false;
      timer = setTimeout(() => { isLongPress = true; openShoppingModal(idx); }, 600);
    };
    const cancelLongPress = () => { if (timer) { clearTimeout(timer); timer = null; } };

    item.addEventListener('mousedown', startLongPress);
    item.addEventListener('mouseup', () => { cancelLongPress(); if (!isLongPress) toggleShoppingItem(idx); });
    item.addEventListener('mouseleave', cancelLongPress);
    item.addEventListener('touchstart', startLongPress, { passive: true });
    item.addEventListener('touchend', () => { cancelLongPress(); if (!isLongPress) toggleShoppingItem(idx); });
    item.addEventListener('touchcancel', cancelLongPress);
  });

  let total = 0, purchased = 0;
  shoppingList.forEach(i => {
    const p = i.totalPrice || 0;
    total += p;
    if (i.completed) purchased += p;
  });
  const remaining = total - purchased;

  const setElText = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };
  setElText('totalPrice', total.toLocaleString());
  setElText('totalTax', Math.floor(total * 1.1).toLocaleString());
  setElText('purchasedPrice', purchased.toLocaleString());
  setElText('purchasedTax', Math.floor(purchased * 1.1).toLocaleString());
  setElText('remainingPrice', remaining.toLocaleString());
  setElText('remainingTax', Math.floor(remaining * 1.1).toLocaleString());
}

function toggleShoppingItem(idx) {
  shoppingList[idx].completed = !shoppingList[idx].completed;
  localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
  renderShoppingListView();
}

function openShoppingModal(idx) {
  editingShoppingIndex = idx;
  const item = shoppingList[idx];
  const nameEl = document.getElementById('modalItemName');
  const qtyEl = document.getElementById('modalItemQty');
  const modalEl = document.getElementById('shoppingEditModal');
  if (nameEl) nameEl.textContent = item.name;
  if (qtyEl) qtyEl.textContent = item.qty;
  if (modalEl) modalEl.style.display = 'flex';
  if (navigator.vibrate) navigator.vibrate(50);
}

function closeShoppingModal() {
  const modalEl = document.getElementById('shoppingEditModal');
  if (modalEl) modalEl.style.display = 'none';
  editingShoppingIndex = null;
}

function modalChangeQty(amount) {
  if (editingShoppingIndex === null) return;
  let item = shoppingList[editingShoppingIndex];
  item.qty += amount;
  if (item.qty < 1) item.qty = 1;

  let unit = unitPrices[item.name] || 0;
  item.totalPrice = Math.round(unit * item.qty);

  const qtyEl = document.getElementById('modalItemQty');
  if (qtyEl) qtyEl.textContent = item.qty;
  localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
  renderShoppingListView();
}

function modalDeleteShoppingItem() {
  if (editingShoppingIndex === null) return;
  shoppingList.splice(editingShoppingIndex, 1);
  localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
  closeShoppingModal();
  renderShoppingListView();
}

function sendToStock() {
  if (shoppingList.length === 0) { alert('買い物リストに項目がありません。'); return; }
  
  shoppingList.forEach(item => {
    let existing = stockList.find(s => s.name === item.name);
    if (existing) { existing.qty += item.qty; } 
    else { stockList.push({ name: item.name, qty: item.qty }); }
  });
  localStorage.setItem('stockList', JSON.stringify(stockList));

  shoppingList = [];
  unitPrices = {};
  localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
  localStorage.setItem('unitPrices', JSON.stringify(unitPrices));

  alert('買い物リストのアイテムを在庫に追加し、お買い物リストをリセットしました！');
  switchTab('tab5');
}

function renderStock() {
  const container = document.getElementById('stockListContainer');
  if (!container) return;
  if (stockList.length === 0) {
    container.innerHTML = '<p style="color:#888; text-align:center; padding:20px 0;">現在、在庫はありません。</p>';
    return;
  }
  let sortedStock = stockList.map((item, originalIndex) => ({ ...item, originalIndex })).sort((a, b) => {
    if (a.qty > 0 && b.qty === 0) return -1;
    if (a.qty === 0 && b.qty > 0) return 1;
    return 0;
  });

  container.innerHTML = sortedStock.map((item) => {
    const isEmpty = item.qty === 0;
    return `
      <div class="list-item stock-item ${isEmpty ? 'empty' : ''}">
        <span style="font-weight:500;">${item.name}</span>
        <div class="qty-controls">
          <button type="button" class="qty-btn" onclick="updateStockQty(${item.originalIndex}, -1)">-</button>
          <span class="qty-num">${item.qty}</span>
          <button type="button" class="qty-btn" onclick="updateStockQty(${item.originalIndex}, 1)">+</button>
        </div>
      </div>
    `;
  }).join('');
}

function updateStockQty(idx, amount) {
  stockList[idx].qty += amount;
  if (stockList[idx].qty < 0) stockList[idx].qty = 0;
  localStorage.setItem('stockList', JSON.stringify(stockList));
  renderStock();
}

function saveMasterIngredient() {
  const nameEl = document.getElementById('masterIngName');
  const priceEl = document.getElementById('masterIngPrice');
  if (!nameEl) return;
  const name = nameEl.value.trim();
  const price = priceEl ? priceEl.value.trim() : '';
  if (!name) { alert('食材名を入力してください'); return; }
  masterIngredients.push({ name, price: price ? Number(price) : null });
  localStorage.setItem('masterIngredients', JSON.stringify(masterIngredients));
  nameEl.value = '';
  if (priceEl) priceEl.value = '';
  renderMasterIngredients();
}

function saveBulkIngredients() {
  const textEl = document.getElementById('bulkIngInput');
  if (!textEl) return;
  const text = textEl.value.trim();
  if (!text) { alert('テキストを入力してください'); return; }
  text.split('\n').forEach(line => {
    const parts = line.trim().split(/\s+/);
    if (parts.length > 0 && parts[0]) {
      const name = parts[0];
      const price = parts[1] && !isNaN(parts[1]) ? Number(parts[1]) : null;
      masterIngredients.push({ name, price });
    }
  });
  localStorage.setItem('masterIngredients', JSON.stringify(masterIngredients));
  textEl.value = '';
  renderMasterIngredients();
  alert('一括登録しました！');
}

function renderMasterIngredients() {
  const container = document.getElementById('masterIngList');
  if (!container) return;
  if (masterIngredients.length === 0) {
    container.innerHTML = '<p style="color:#888; text-align:center;">登録食材はありません。</p>';
    return;
  }
  container.innerHTML = masterIngredients.map((ing, idx) => `
    <div class="list-item master-ing-item" data-index="${idx}">
      <span style="font-weight:500;">${ing.name}</span>
      <span style="color:#2e7d32; font-weight:bold;">${ing.price ? ing.price + '円' : '価格未設定'}</span>
    </div>
  `).join('');

  document.querySelectorAll('.master-ing-item').forEach(item => {
    let timer = null;
    const idx = parseInt(item.getAttribute('data-index'));
    const startLongPress = () => { timer = setTimeout(() => { openMasterIngModal(idx); }, 600); };
    const cancelLongPress = () => { if (timer) { clearTimeout(timer); timer = null; } };

    item.addEventListener('mousedown', startLongPress);
    item.addEventListener('mouseup', cancelLongPress);
    item.addEventListener('mouseleave', cancelLongPress);
    item.addEventListener('touchstart', startLongPress, { passive: true });
    item.addEventListener('touchend', cancelLongPress);
    item.addEventListener('touchcancel', cancelLongPress);
  });
}

function openMasterIngModal(idx) {
  editingMasterIndex = idx;
  const ing = masterIngredients[idx];
  const nameEl = document.getElementById('editMasterName');
  const priceEl = document.getElementById('editMasterPrice');
  const modalEl = document.getElementById('masterIngEditModal');
  if (nameEl) nameEl.value = ing.name;
  if (priceEl) priceEl.value = ing.price !== null ? ing.price : '';
  if (modalEl) modalEl.style.display = 'flex';
  if (navigator.vibrate) navigator.vibrate(50);
}
function closeMasterIngModal() {
  const modalEl = document.getElementById('masterIngEditModal');
  if (modalEl) modalEl.style.display = 'none';
  editingMasterIndex = null;
}
function updateMasterIngredient() {
  if (editingMasterIndex === null) return;
  const nameEl = document.getElementById('editMasterName');
  const priceEl = document.getElementById('editMasterPrice');
  const name = nameEl ? nameEl.value.trim() : '';
  const price = priceEl ? priceEl.value.trim() : '';
  if (!name) { alert('食材名を入力してください'); return; }
  masterIngredients[editingMasterIndex] = { name, price: price ? Number(price) : null };
  localStorage.setItem('masterIngredients', JSON.stringify(masterIngredients));
  closeMasterIngModal();
  renderMasterIngredients();
}
function deleteMasterIngredientFromModal() {
  if (editingMasterIndex === null) return;
  if (confirm(`「${masterIngredients[editingMasterIndex].name}」を削除しますか？`)) {
    masterIngredients.splice(editingMasterIndex, 1);
    localStorage.setItem('masterIngredients', JSON.stringify(masterIngredients));
    closeMasterIngModal();
    renderMasterIngredients();
  }
}

function saveEatOutStore() {
  const nameEl = document.getElementById('eatOutStoreName');
  const priceEl = document.getElementById('eatOutStorePrice');
  if (!nameEl) return;
  const name = nameEl.value.trim();
  const price = priceEl ? priceEl.value.trim() : '';
  if (!name) { alert('店舗名を入力してください'); return; }
  eatOutStores.push({ name, price: price ? Number(price) : null });
  localStorage.setItem('eatOutStores', JSON.stringify(eatOutStores));
  nameEl.value = '';
  if (priceEl) priceEl.value = '';
  renderEatOutStores();
}

function renderEatOutStores() {
  const container = document.getElementById('eatOutStoreList');
  if (!container) return;
  if (eatOutStores.length === 0) {
    container.innerHTML = '<p style="color:#888; text-align:center;">登録されている外食店舗はありません。</p>';
    return;
  }
  container.innerHTML = eatOutStores.map((store, idx) => `
    <div class="list-item eatout-store-item" data-index="${idx}">
      <span style="font-weight:500;">${store.name}</span>
      <span style="color:#2e7d32; font-weight:bold;">${store.price ? store.price + '円' : '価格未設定'}</span>
    </div>
  `).join('');

  document.querySelectorAll('.eatout-store-item').forEach(item => {
    let timer = null;
    const idx = parseInt(item.getAttribute('data-index'));
    const startLongPress = () => { timer = setTimeout(() => { openEatOutStoreModal(idx); }, 600); };
    const cancelLongPress = () => { if (timer) { clearTimeout(timer); timer = null; } };

    item.addEventListener('mousedown', startLongPress);
    item.addEventListener('mouseup', cancelLongPress);
    item.addEventListener('mouseleave', cancelLongPress);
    item.addEventListener('touchstart', startLongPress, { passive: true });
    item.addEventListener('touchend', cancelLongPress);
    item.addEventListener('touchcancel', cancelLongPress);
  });
}

function openEatOutStoreModal(idx) {
  editingEatOutIndex = idx;
  const store = eatOutStores[idx];
  const nameEl = document.getElementById('editEatOutStoreName');
  const priceEl = document.getElementById('editEatOutStorePrice');
  const modalEl = document.getElementById('eatOutStoreEditModal');
  if (nameEl) nameEl.value = store.name;
  if (priceEl) priceEl.value = store.price !== null ? store.price : '';
  if (modalEl) modalEl.style.display = 'flex';
  if (navigator.vibrate) navigator.vibrate(50);
}
function closeEatOutStoreModal() {
  const modalEl = document.getElementById('eatOutStoreEditModal');
  if (modalEl) modalEl.style.display = 'none';
  editingEatOutIndex = null;
}
function updateEatOutStore() {
  if (editingEatOutIndex === null) return;
  const nameEl = document.getElementById('editEatOutStoreName');
  const priceEl = document.getElementById('editEatOutStorePrice');
  const name = nameEl ? nameEl.value.trim() : '';
  const price = priceEl ? priceEl.value.trim() : '';
  if (!name) { alert('店舗名を入力してください'); return; }
  eatOutStores[editingEatOutIndex] = { name, price: price ? Number(price) : null };
  localStorage.setItem('eatOutStores', JSON.stringify(eatOutStores));
  closeEatOutStoreModal();
  renderEatOutStores();
}
function deleteEatOutStoreFromModal() {
  if (editingEatOutIndex === null) return;
  if (confirm(`「${eatOutStores[editingEatOutIndex].name}」を削除しますか？`)) {
    eatOutStores.splice(editingEatOutIndex, 1);
    localStorage.setItem('eatOutStores', JSON.stringify(eatOutStores));
    closeEatOutStoreModal();
    renderEatOutStores();
  }
}

function exportBackupData() {
  const data = { masterIngredients, eatOutStores, menus, shoppingList, stockList, currentSchedules, historyRecords, unitPrices };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'kondate_backup.json'; a.click();
}

function importBackupData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data.masterIngredients) masterIngredients = data.masterIngredients;
      if (data.eatOutStores) eatOutStores = data.eatOutStores;
      if (data.menus) menus = data.menus;
      if (data.shoppingList) shoppingList = data.shoppingList;
      if (data.stockList) stockList = data.stockList;
      if (data.currentSchedules) currentSchedules = data.currentSchedules;
      if (data.historyRecords) historyRecords = data.historyRecords;
      if (data.unitPrices) unitPrices = data.unitPrices;
      
      localStorage.setItem('masterIngredients', JSON.stringify(masterIngredients));
      localStorage.setItem('eatOutStores', JSON.stringify(eatOutStores));
      localStorage.setItem('menus', JSON.stringify(menus));
      localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
      localStorage.setItem('stockList', JSON.stringify(stockList));
      localStorage.setItem('currentSchedules', JSON.stringify(currentSchedules));
      localStorage.setItem('historyRecords', JSON.stringify(historyRecords));
      localStorage.setItem('unitPrices', JSON.stringify(unitPrices));
      
      alert('データを正常に読み込みました！');
      switchTab('tab1');
    } catch(err) { alert('ファイルの読み込みに失敗しました。'); }
  };
  reader.readAsText(file);
}

function initIngredientInputs() {
  const container = document.getElementById('ingredientInputs');
  if (!container) return;
  container.innerHTML = `
    <div class="edit-row">
      <input type="text" placeholder="材料名" class="row-ing-name" style="width:55%; margin:0;">
      <input type="number" placeholder="価格" class="row-ing-price" style="width:45%; margin:0;">
    </div>
  `;
}

function addIngredientRow() {
  const container = document.getElementById('ingredientInputs');
  if (!container) return;
  const div = document.createElement('div');
  div.className = 'edit-row'; div.style.marginTop = '6px';
  div.innerHTML = `
    <input type="text" placeholder="材料名" class="row-ing-name" style="width:55%; margin:0;">
    <input type="number" placeholder="価格" class="row-ing-price" style="width:45%; margin:0;">
  `;
  container.appendChild(div);
}

function saveMenu() {
  const nameEl = document.getElementById('menuName');
  if (!nameEl) return;
  const name = nameEl.value.trim();
  if (!name) { alert('献立名を入力してください'); return; }
  const names = document.querySelectorAll('.row-ing-name');
  const prices = document.querySelectorAll('.row-ing-price');
  let ingredients = [];
  for (let i = 0; i < names.length; i++) {
    if (names[i].value.trim()) {
      ingredients.push({ name: names[i].value.trim(), price: prices[i].value.trim() ? Number(prices[i].value.trim()) : null });
    }
  }
  menus.push({ name, ingredients });
  localStorage.setItem('menus', JSON.stringify(menus));
  nameEl.value = '';
  initIngredientInputs();
  renderManageMenus();
  alert('献立を保存しました！');
}

function renderManageMenus() {
  const container = document.getElementById('manageMenuList');
  if (!container) return;
  if (menus.length === 0) {
    container.innerHTML = '<p style="color:#888; text-align:center;">登録されている献立はありません。</p>';
    return;
  }
  container.innerHTML = menus.map((menu, idx) => `
    <div class="list-item menu-manage-item" data-index="${idx}">
      <div>
        <strong>${menu.name}</strong>
        <div style="font-size:0.8rem; color:#666;">材料: ${menu.ingredients.map(i => i.name).join(', ')}</div>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('.menu-manage-item').forEach(item => {
    let timer = null;
    const idx = parseInt(item.getAttribute('data-index'));
    const startLongPress = () => { timer = setTimeout(() => { openMenuModal(idx); }, 600); };
    const cancelLongPress = () => { if (timer) { clearTimeout(timer); timer = null; } };

    item.addEventListener('mousedown', startLongPress);
    item.addEventListener('mouseup', cancelLongPress);
    item.addEventListener('mouseleave', cancelLongPress);
    item.addEventListener('touchstart', startLongPress, { passive: true });
    item.addEventListener('touchend', cancelLongPress);
    item.addEventListener('touchcancel', cancelLongPress);
  });
}

function openMenuModal(idx) {
  editingMenuIndex = idx;
  const menu = menus[idx];
  const nameEl = document.getElementById('editMenuName');
  const container = document.getElementById('editIngredientInputs');
  const modalEl = document.getElementById('menuEditModal');
  if (nameEl) nameEl.value = menu.name;
  if (container) {
    container.innerHTML = '';
    if (menu.ingredients && menu.ingredients.length > 0) {
      menu.ingredients.forEach(ing => {
        const div = document.createElement('div');
        div.className = 'edit-row'; div.style.marginTop = '6px';
        div.innerHTML = `
          <input type="text" placeholder="材料名" class="edit-row-ing-name" value="${ing.name}" style="width:55%; margin:0;">
          <input type="number" placeholder="価格" class="edit-row-ing-price" value="${ing.price !== null ? ing.price : ''}" style="width:45%; margin:0;">
        `;
        container.appendChild(div);
      });
    } else { addEditIngredientRow(); }
  }
  if (modalEl) modalEl.style.display = 'flex';
  if (navigator.vibrate) navigator.vibrate(50);
}
function closeMenuModal() {
  const modalEl = document.getElementById('menuEditModal');
  if (modalEl) modalEl.style.display = 'none';
  editingMenuIndex = null;
}
function addEditIngredientRow() {
  const container = document.getElementById('editIngredientInputs');
  if (!container) return;
  const div = document.createElement('div');
  div.className = 'edit-row'; div.style.marginTop = '6px';
  div.innerHTML = `
    <input type="text" placeholder="材料名" class="edit-row-ing-name" style="width:55%; margin:0;">
    <input type="number" placeholder="価格" class="edit-row-ing-price" style="width:45%; margin:0;">
  `;
  container.appendChild(div);
}
function updateMenu() {
  if (editingMenuIndex === null) return;
  const nameEl = document.getElementById('editMenuName');
  const name = nameEl ? nameEl.value.trim() : '';
  if (!name) { alert('献立名を入力してください'); return; }
  const names = document.querySelectorAll('.edit-row-ing-name');
  const prices = document.querySelectorAll('.edit-row-ing-price');
  let ingredients = [];
  for (let i = 0; i < names.length; i++) {
    if (names[i].value.trim()) {
      ingredients.push({ name: names[i].value.trim(), price: prices[i].value.trim() ? Number(prices[i].value.trim()) : null });
    }
  }
  menus[editingMenuIndex] = { name, ingredients };
  localStorage.setItem('menus', JSON.stringify(menus));
  closeMenuModal();
  renderManageMenus();
}
function duplicateMenuFromModal() {
  if (editingMenuIndex === null) return;
  const target = menus[editingMenuIndex];
  const duplicated = JSON.parse(JSON.stringify(target));
  duplicated.name = target.name + 'のコピー';
  menus.splice(editingMenuIndex + 1, 0, duplicated);
  localStorage.setItem('menus', JSON.stringify(menus));
  closeMenuModal();
  renderManageMenus();
}
function deleteMenuFromModal() {
  if (editingMenuIndex === null) return;
  if (confirm(`「${menus[editingMenuIndex].name}」を削除しますか？`)) {
    menus.splice(editingMenuIndex, 1);
    localStorage.setItem('menus', JSON.stringify(menus));
    closeMenuModal();
    renderManageMenus();
  }
}

function isEatOutItem(name) {
  if (!name) return false;
  return eatOutStores.some(s => s.name === name);
}

function getMenuPrice(menuName) {
  if (!menuName) return 0;
  const foundMenu = menus.find(m => m.name === menuName);
  if (foundMenu) {
    let sum = 0;
    foundMenu.ingredients.forEach(i => { if (i.price) sum += Number(i.price); });
    return sum;
  }
  const foundStore = eatOutStores.find(s => s.name === menuName);
  if (foundStore && foundStore.price) {
    return Number(foundStore.price);
  }
  return 0;
}

function renderSchedule() {
  const container = document.getElementById('currentScheduleTableBody');
  if (!container) return;
  let totalScheduleSum = 0;

  container.innerHTML = fixedScheduleKeys.map((keyObj, index) => {
    const keyStr = `${keyObj.day}_${keyObj.time}`;
    // localStorage から確実に最新データを復元
    const data = currentSchedules[keyStr] || { name: '', completed: false, excludePrice: false };
    
    const basePrice = getMenuPrice(data.name);
    const effectivePrice = data.excludePrice ? 0 : basePrice;
    totalScheduleSum += effectivePrice;

    let dayColor = '#333';
    if (keyObj.day === '日') {
      dayColor = '#d32f2f';
    } else if (keyObj.day === '土') {
      dayColor = '#03A9F4';
    }

    const isEatOut = isEatOutItem(data.name);
    const inputClass = isEatOut ? 'schedule-input is-eatout' : 'schedule-input';

    const priceDisplay = basePrice > 0 
      ? (data.excludePrice ? `<span style="text-decoration: line-through; color: #ccc;">${basePrice.toLocaleString()}円</span> <span style="font-size:0.75rem; color:#999;">(除外)</span>` : basePrice.toLocaleString() + '円')
      : '-';

    return `
      <tr class="schedule-row ${data.completed ? 'completed' : ''}" id="sched-row-${index}">
        <td style="font-weight: bold; color: ${dayColor};">${keyObj.day}(${keyObj.time})</td>
        <td>
          <div class="schedule-input-container">
            <input type="text" class="${inputClass}" id="sched-input-${index}" value="${(data.name || '').replace(/"/g, '&quot;')}" placeholder="タップして入力..." oninput="onScheduleInput('${keyObj.day}', '${keyObj.time}', ${index})" onfocus="onScheduleInput('${keyObj.day}', '${keyObj.time}', ${index})" autocomplete="off">
            <div class="suggest-box" id="suggest-box-${index}" onmousedown="event.preventDefault()"></div>
          </div>
        </td>
        <td style="text-align: right; font-weight: bold; cursor: pointer; color: ${basePrice > 0 && !data.excludePrice ? '#2e7d32' : '#888'};" onclick="toggleSchedulePrice('${keyObj.day}', '${keyObj.time}')" title="タッチして金額の含める/除外を切り替え">
          ${priceDisplay}
        </td>
        <td style="text-align: center;">
          <button style="background: #4CAF50; color: white; border: none; border-radius: 4px; width: 28px; height: 28px; font-size: 0.85rem; cursor: pointer;" title="食べたことにする" onclick="toggleCompleteSchedule('${keyObj.day}', '${keyObj.time}', ${index})">✓</button>
        </td>
      </tr>
    `;
  }).join('');

  const totalPriceEl = document.getElementById('totalSchedulePrice');
  if (totalPriceEl) {
    totalPriceEl.textContent = totalScheduleSum.toLocaleString();
  }
}

function toggleSchedulePrice(day, time) {
  const keyStr = `${day}_${time}`;
  if (!currentSchedules[keyStr]) currentSchedules[keyStr] = { name: '', completed: false, excludePrice: false };
  
  currentSchedules[keyStr].excludePrice = !currentSchedules[keyStr].excludePrice;
  localStorage.setItem('currentSchedules', JSON.stringify(currentSchedules));
  
  renderSchedule();
}

function resetAllSchedules() {
  if (confirm('今週のスケジュール（入力内容やチェック状態）をすべてリセットしますか？この操作は元に戻せません。')) {
    localStorage.removeItem('currentSchedules');
    currentSchedules = {};
    renderSchedule();
  }
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.schedule-input-container')) {
    document.querySelectorAll('.suggest-box').forEach(box => box.style.display = 'none');
  }
});

function toHiragana(str) {
  return str.replace(/[\u30a1-\u30f6]/g, match => {
    return String.fromCharCode(match.charCodeAt(0) - 0x60);
  });
}

function onScheduleInput(day, time, index) {
  const inputEl = document.getElementById(`sched-input-${index}`);
  const suggestBox = document.getElementById(`suggest-box-${index}`);
  if (!inputEl) return;
  const val = inputEl.value.trim();

  const keyStr = `${day}_${time}`;
  if (!currentSchedules[keyStr]) currentSchedules[keyStr] = { name: '', completed: false, excludePrice: false };
  
  // 入力値を確実に保存する
  currentSchedules[keyStr].name = inputEl.value;
  localStorage.setItem('currentSchedules', JSON.stringify(currentSchedules));

  if (isEatOutItem(inputEl.value)) {
    inputEl.classList.add('is-eatout');
  } else {
    inputEl.classList.remove('is-eatout');
  }

  let totalScheduleSum = 0;
  fixedScheduleKeys.forEach((kObj) => {
    const kStr = `${kObj.day}_${kObj.time}`;
    const d = currentSchedules[kStr] || { name: '', completed: false, excludePrice: false };
    const p = getMenuPrice(d.name);
    if (!d.excludePrice) totalScheduleSum += p;
  });
  
  const totalPriceEl = document.getElementById('totalSchedulePrice');
  if (totalPriceEl) {
    totalPriceEl.textContent = totalScheduleSum.toLocaleString();
  }
  
  const priceCell = document.querySelector(`#sched-row-${index} td:nth-child(3)`);
  const currentPrice = getMenuPrice(inputEl.value);
  const isExcluded = currentSchedules[keyStr].excludePrice;
  
  if (priceCell) {
    if (currentPrice > 0) {
      priceCell.innerHTML = isExcluded 
        ? `<span style="text-decoration: line-through; color: #ccc;">${currentPrice.toLocaleString()}円</span> <span style="font-size:0.75rem; color:#999;">(除外)</span>` 
        : currentPrice.toLocaleString() + '円';
      priceCell.style.color = isExcluded ? '#888' : '#2e7d32';
    } else {
      priceCell.textContent = '-';
      priceCell.style.color = '#888';
    }
  }

  if (!suggestBox) return;
  let candidates = [];
  menus.forEach(m => candidates.push(m.name));
  eatOutStores.forEach(s => candidates.push(s.name));

  const normalizedVal = toHiragana(val).toLowerCase();

  const matches = val === '' 
    ? candidates 
    : candidates.filter(name => {
        const normalizedName = toHiragana(name).toLowerCase();
        return normalizedName.includes(normalizedVal);
      });

  if (matches.length > 0) {
    suggestBox.innerHTML = matches.map(name => `
      <div class="suggest-item" onclick="selectSuggest('${day}', '${time}', ${index}, '${name.replace(/'/g, "\\'")}')">${name}</div>
    `).join('');
    suggestBox.style.display = 'block';
  } else {
    suggestBox.style.display = 'none';
  }
}

function selectSuggest(day, time, index, menuName) {
  const inputEl = document.getElementById(`sched-input-${index}`);
  if (inputEl) inputEl.value = menuName;
  const box = document.getElementById(`suggest-box-${index}`);
  if (box) box.style.display = 'none';

  const keyStr = `${day}_${time}`;
  if (!currentSchedules[keyStr]) currentSchedules[keyStr] = { name: '', completed: false, excludePrice: false };
  currentSchedules[keyStr].name = menuName;
  localStorage.setItem('currentSchedules', JSON.stringify(currentSchedules));
  renderSchedule();
}

function toggleCompleteSchedule(day, time, index) {
  const keyStr = `${day}_${time}`;
  if (!currentSchedules[keyStr]) currentSchedules[keyStr] = { name: '', completed: false, excludePrice: false };
  const item = currentSchedules[keyStr];
  if (!item.name || item.name.trim() === '') return;

  const matchedMenu = menus.find(m => m.name === item.name);

  if (!item.completed) {
    item.completed = true;
    if (matchedMenu && matchedMenu.ingredients) {
      matchedMenu.ingredients.forEach(ing => {
        let stockItem = stockList.find(s => s.name === ing.name);
        if (stockItem) { stockItem.qty -= 1; if (stockItem.qty < 0) stockItem.qty = 0; }
      });
      localStorage.setItem('stockList', JSON.stringify(stockList));
    }

    const now = new Date();
    historyRecords.unshift({
      id: Date.now() + Math.random(),
      name: item.name,
      day: day,
      time: time,
      date: `${now.getMonth() + 1}/${now.getDate()}`,
      group: `${now.getFullYear()}年${now.getMonth() + 1}月 第${Math.ceil(now.getDate() / 7)}週`
    });
    localStorage.setItem('historyRecords', JSON.stringify(historyRecords));
  } else {
    item.completed = false;
    if (matchedMenu && matchedMenu.ingredients) {
      matchedMenu.ingredients.forEach(ing => {
        let stockItem = stockList.find(s => s.name === ing.name);
        if (stockItem) { stockItem.qty += 1; }
      });
      localStorage.setItem('stockList', JSON.stringify(stockList));
    }

    const hIdx = historyRecords.findIndex(h => h.name === item.name && h.day === day && h.time === time);
    if (hIdx !== -1) {
      historyRecords.splice(hIdx, 1);
      localStorage.setItem('historyRecords', JSON.stringify(historyRecords));
    }
  }

  localStorage.setItem('currentSchedules', JSON.stringify(currentSchedules));
  renderSchedule();
  renderHistory();
}

function renderHistory() {
  const container = document.getElementById('historyListContainer');
  if (!container) return;
  if (historyRecords.length === 0) {
    container.innerHTML = '<p style="color:#888; text-align:center; padding:10px 0;">まだ食べた記録はありません。</p>';
    return;
  }

  const grouped = {};
  historyRecords.forEach((r, originalIdx) => {
    const g = r.group || 'そのほか';
    if (!grouped[g]) grouped[g] = [];
    grouped[g].push({ ...r, originalIdx });
  });

  container.innerHTML = Object.keys(grouped).map(gName => `
    <div class="accordion-group">
      <div class="accordion-header" onclick="this.nextElementSibling.classList.toggle('open')">
        📂 ${gName} <span style="font-size:0.8rem; background:#fff; padding:2px 8px; border-radius:10px; color:#2e7d32;">${grouped[gName].length}件 ▼</span>
      </div>
      <div class="accordion-content open">
        ${grouped[gName].map(item => `
          <div class="history-row history-item" data-index="${item.originalIdx}" title="長押しするとこの記録を削除できます">
            <span>${item.name} (<span style="color:#2e7d32;">${item.day}</span> <span style="color:#e65100;">${item.time}</span>)</span>
            <span style="font-size:0.75rem; color:#888;">${item.date}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  document.querySelectorAll('.history-item').forEach(item => {
    let timer = null;
    const idx = parseInt(item.getAttribute('data-index'));
    const startLongPress = () => {
      timer = setTimeout(() => {
        if (confirm(`「${historyRecords[idx].name}」の履歴を削除しますか？`)) {
          historyRecords.splice(idx, 1);
          localStorage.setItem('historyRecords', JSON.stringify(historyRecords));
          renderHistory();
          if (navigator.vibrate) navigator.vibrate(50);
        }
      }, 600);
    };
    const cancelLongPress = () => { if (timer) { clearTimeout(timer); timer = null; } };

    item.addEventListener('mousedown', startLongPress);
    item.addEventListener('mouseup', cancelLongPress);
    item.addEventListener('mouseleave', cancelLongPress);
    item.addEventListener('touchstart', startLongPress, { passive: true });
    item.addEventListener('touchend', cancelLongPress);
    item.addEventListener('touchcancel', cancelLongPress);
  });
}

function exportHistoryTxt() {
  if (historyRecords.length === 0) { alert('出力する履歴がありません。'); return; }
  let textContent = '【 食べた記録（履歴） 】\n\n';
  const grouped = {};
  historyRecords.forEach(r => {
    const g = r.group || 'そのほか';
    if (!grouped[g]) grouped[g] = [];
    grouped[g].push(r);
  });
  Object.keys(grouped).forEach(gName => {
    textContent += `--- ${gName} ---\n`;
    grouped[gName].forEach(item => {
      textContent += `[${item.date}] ${item.day}(${item.time}): ${item.name}\n`;
    });
    textContent += '\n';
  });
  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'kondate_history.txt'; a.click();
}

function clearHistory() {
  if (confirm('食べた記録をすべてリセットしますか？')) {
    historyRecords = [];
    localStorage.setItem('historyRecords', JSON.stringify(historyRecords));
    renderHistory();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  masterIngredients = JSON.parse(localStorage.getItem('masterIngredients')) || [];
  eatOutStores = JSON.parse(localStorage.getItem('eatOutStores')) || [];
  menus = JSON.parse(localStorage.getItem('menus')) || [];
  shoppingList = JSON.parse(localStorage.getItem('shoppingList')) || [];
  stockList = JSON.parse(localStorage.getItem('stockList')) || [];
  currentSchedules = JSON.parse(localStorage.getItem('currentSchedules')) || {};
  historyRecords = JSON.parse(localStorage.getItem('historyRecords')) || [];
  unitPrices = JSON.parse(localStorage.getItem('unitPrices')) || {};

  initIngredientInputs();
  renderSchedule();
  renderHistory();
});

function resetAllStock() {
  if (confirm('在庫リストをすべて削除してまっすぐにしますか？')) {
    stockList = [];
    localStorage.setItem('stockList', JSON.stringify(stockList));
    renderStock();
  }
}