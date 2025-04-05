// script.js
document.addEventListener('DOMContentLoaded', () => {
    // --- 資料模擬 & Local Storage ---
    let users = JSON.parse(localStorage.getItem('listAppUsers')) || {
        'awa990226': { password: 'iamminecrafterror422', role: 'admin' }
        // 'restaurant_user': { password: 'password123', role: 'restaurant', email: 'res@gmail.com' }
    };
    let restaurants = JSON.parse(localStorage.getItem('listRestaurants')) || [
        { id: 1, name: "好吃雞排", rating: 4.8, image: "https://images.unsplash.com/photo-1562967914-01efa7e87832?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80", menu: [{ name: "招牌雞排", price: 80 }, { name: "甜不辣", price: 30 }, { name: "紅茶", price: 25 }] },
        { id: 2, name: "美味牛肉麵", rating: 4.6, image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80", menu: [{ name: "紅燒牛肉麵", price: 150 }, { name: "清燉牛肉麵", price: 150 }, { name: "小菜", price: 40 }] },
        { id: 3, name: "幸福便當店", rating: 4.9, image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80", menu: [{ name: "雞腿飯", price: 95 }, { name: "排骨飯", price: 90 }, { name: "每日例湯", price: 30 }] },
        { id: 4, name: "清爽沙拉吧", rating: 4.5, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80", menu: [{ name: "凱薩沙拉", price: 120 }, { name: "希臘沙拉", price: 130 }, { name: "水果優格", price: 80 }] },
    ];
    // 為確保資料一致，每次啟動時都將記憶體中的 restaurants 存回 localStorage
    localStorage.setItem('listRestaurants', JSON.stringify(restaurants));

    let sharedOrders = JSON.parse(localStorage.getItem('listSharedOrders')) || {};
    let loggedInUser = null;
    let pendingRestaurantAccount = null;

    // --- DOM 元素參照 ---
    const loginRegisterBtn = document.getElementById('login-register-btn');
    const userInfoDiv = document.getElementById('user-info');
    const usernameDisplay = document.getElementById('username-display');
    const logoutBtn = document.getElementById('logout-btn');
    const adminActionsBtn = document.getElementById('admin-actions-btn');

    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginError = document.getElementById('login-error');
    const registerError = document.getElementById('register-error');
    const registerSuccess = document.getElementById('register-success');

    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const restaurantListDiv = document.getElementById('restaurant-list');
    const resultsContainerDiv = document.getElementById('results-container');

    const resDetailSection = document.getElementById('restaurant-detail');
    const resDetailName = document.getElementById('res-detail-name');
    const resMenuDiv = document.getElementById('res-menu');
    const shareLinkInput = document.getElementById('share-link-input');
    const copyLinkBtn = document.getElementById('copy-link-btn');
    const viewOrderSummaryBtn = document.getElementById('view-order-summary-btn');
    const socialShareButtonsContainer = document.querySelector('.social-share-buttons');

    const orderFormView = document.getElementById('order-form-view');
    const sharerNameDisplay = document.getElementById('sharer-name-display');
    const orderFormResName = document.getElementById('order-form-res-name');
    const friendOrderForm = document.getElementById('friend-order-form');
    const orderFormMenuRef = document.getElementById('order-form-menu-ref');

    const orderSummaryView = document.getElementById('order-summary');
    const summaryResName = document.getElementById('summary-res-name');
    const summaryListDiv = document.getElementById('summary-list');

    const adminPanel = document.getElementById('admin-panel');
    const addRestaurantForm = document.getElementById('add-restaurant-form');
    const addRestaurantAccountForm = document.getElementById('add-restaurant-account-form');
    const verificationStepDiv = document.getElementById('verification-step');
    const verifyingEmailSpan = document.getElementById('verifying-email');
    const simulatedCodeSpan = document.getElementById('simulated-code-display');
    const verificationCodeInput = document.getElementById('verification-code');
    const verifyAccountBtn = document.getElementById('verify-account-btn');
    const cancelVerificationBtn = document.getElementById('cancel-verification-btn');
    const addAccError = document.getElementById('add-acc-error');
    const verifyError = document.getElementById('verify-error');
    const addAccSuccess = document.getElementById('add-acc-success');

    // --- 基礎函數 ---
    window.openModal = (modalId) => { document.getElementById(modalId).style.display = 'block'; }
    window.closeModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = 'none';
        if (modalId === 'login-modal') loginError.textContent = '';
        if (modalId === 'register-modal') { registerError.textContent = ''; registerSuccess.textContent = ''; }
    }

    window.showSection = (sectionId) => {
        document.querySelectorAll('.page-section').forEach(section => {
            section.classList.remove('active');
        });
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            // 權限檢查
            if (sectionId === 'admin-panel' && (!loggedInUser || loggedInUser.role !== 'admin')) {
                 console.warn("Access denied: Admin panel requires admin privileges.");
                 showSection('homepage'); return;
            }
            if (sectionId === 'restaurant-panel' && (!loggedInUser || loggedInUser.role !== 'restaurant')) {
                 console.warn("Access denied: Restaurant panel requires restaurant privileges.");
                 showSection('homepage'); return;
            }

            targetSection.classList.add('active');
            // 確保列表在切換時是正確的
            if (sectionId === 'homepage') {
                renderRestaurantList(JSON.parse(localStorage.getItem('listRestaurants')) || restaurants, restaurantListDiv);
            } else if (sectionId === 'search-results') {
                // 搜尋結果的渲染由 performSearch 觸發
            }
            // 隱藏 "檢視揪團資訊" 按鈕，除非在店家詳情頁
            if (sectionId !== 'restaurant-detail' && viewOrderSummaryBtn) {
                 viewOrderSummaryBtn.style.display = 'none';
            }

        } else {
            console.error("Section not found:", sectionId);
            showSection('homepage'); // Fallback
        }
        // 清除非訂單相關的 hash
        if (!sectionId.startsWith('order-') && !sectionId.startsWith('summary-') && window.location.hash) {
             // 只有在 hash 不是 order 或 summary 相關時才清除
             if (!window.location.hash.startsWith('#order/') && !window.location.hash.startsWith('#summary/')) {
                 history.replaceState(null, '', window.location.pathname + window.location.search);
             }
        }
    }

    window.goBack = () => {
        // 檢查 search-results 是否有內容且正在顯示
        const searchResultsActive = document.getElementById('search-results').classList.contains('active');
        const resultsNotEmpty = resultsContainerDiv.innerHTML.trim() !== '' && !resultsContainerDiv.querySelector('p'); // 檢查是否有卡片而非"找不到"訊息

        if (searchResultsActive && resultsNotEmpty) {
            showSection('search-results');
        } else {
            showSection('homepage');
        }
         // 返回時也清除 hash
         history.replaceState(null, '', window.location.pathname + window.location.search);
    }

    // --- 認證 & UI 更新 ---
    function updateLoginStateUI() {
        const savedUser = sessionStorage.getItem('listLoggedInUser');
        loggedInUser = savedUser ? JSON.parse(savedUser) : null;

        if (loggedInUser) {
            usernameDisplay.textContent = loggedInUser.username;
            loginRegisterBtn.style.display = 'none';
            userInfoDiv.style.display = 'flex';
            logoutBtn.style.display = 'inline-block';
            adminActionsBtn.style.display = (loggedInUser.role === 'admin' || loggedInUser.role === 'restaurant') ? 'inline-block' : 'none';
        } else {
            loginRegisterBtn.style.display = 'inline-block';
            userInfoDiv.style.display = 'none';
            logoutBtn.style.display = 'none';
            adminActionsBtn.style.display = 'none';
        }
        // 重新渲染當前可見的列表以更新 admin 功能 (如刪除按鈕)
        if (document.getElementById('homepage').classList.contains('active')) {
            renderRestaurantList(JSON.parse(localStorage.getItem('listRestaurants')) || restaurants, restaurantListDiv);
        } else if (document.getElementById('search-results').classList.contains('active')) {
             // 如果在搜尋結果頁，可能需要重新執行搜尋以保持結果，或者簡單地渲染所有
             // 這裡先簡單渲染所有，使用者登入/登出後可能需要重新搜尋
             renderRestaurantList(JSON.parse(localStorage.getItem('listRestaurants')) || restaurants, resultsContainerDiv);
        }
        // 檢查 Hash
        handleHashChange();
    }

    // --- 渲染函數 ---
    function renderRestaurantCard(restaurant) {
        const card = document.createElement('div');
        card.className = 'restaurant-card';
        card.dataset.id = restaurant.id;

        const img = document.createElement('img');
        img.src = restaurant.image || 'https://via.placeholder.com/300x180/E0E0E0/AAAAAA?text=No+Image';
        img.alt = restaurant.name;
        img.onerror = function() { this.onerror=null; this.src='https://via.placeholder.com/300x180/E0E0E0/AAAAAA?text=Image+Error'; }

        const content = document.createElement('div');
        content.className = 'card-content';
        const nameH4 = document.createElement('h4');
        nameH4.textContent = restaurant.name;
        const ratingDiv = document.createElement('div');
        ratingDiv.className = 'rating';
        const ratingValue = parseFloat(restaurant.rating) || 0;
        const fullStars = Math.floor(ratingValue);
        const halfStar = ratingValue % 1 >= 0.4;
        ratingDiv.innerHTML = '<i class="fas fa-star"></i>'.repeat(fullStars) +
                             (halfStar ? '<i class="fas fa-star-half-alt"></i>' : '') +
                             '<i class="far fa-star"></i>'.repeat(Math.max(0, 5 - fullStars - (halfStar ? 1 : 0))) +
                             ` ${ratingValue.toFixed(1)}`;
        content.appendChild(nameH4);
        content.appendChild(ratingDiv);
        card.appendChild(img);
        card.appendChild(content);

        if (loggedInUser && loggedInUser.role === 'admin') {
            card.classList.add('admin-view');
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-res-btn';
            deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
            deleteBtn.title = '刪除店家';
            deleteBtn.onclick = (event) => {
                event.stopPropagation();
                const resId = parseInt(card.dataset.id);
                const resName = restaurant.name;
                 if (confirm(`確定要刪除店家 "${resName}" 嗎？此操作無法復原！`)) {
                    deleteRestaurant(resId, card);
                }
            };
            card.appendChild(deleteBtn);
        } else {
             card.classList.remove('admin-view');
        }

        card.addEventListener('click', (e) => {
             if (!e.target.closest('.delete-res-btn')) {
                showRestaurantDetail(restaurant.id)
             }
        });
        return card;
     }

    function renderRestaurantList(list, container) {
        if (!container) {
             console.error("Target container for renderRestaurantList is missing.");
             return;
        }
        container.innerHTML = '';
         const currentRestaurants = JSON.parse(localStorage.getItem('listRestaurants')) || [];
         const listToRender = list || currentRestaurants;

         if (!Array.isArray(listToRender) || listToRender.length === 0) {
            container.innerHTML = '<p>目前沒有符合條件的店家。</p>';
            return;
        }
        // 保持評分排序
        const sortedList = [...listToRender].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        sortedList.forEach(restaurant => {
             if (restaurant && restaurant.id != null) {
                container.appendChild(renderRestaurantCard(restaurant));
             } else {
                 console.warn("Skipping invalid restaurant data:", restaurant);
             }
        });
    }

    // *** 實作 renderMenu ***
    function renderMenu(menu, container) {
        if (!container) {
            console.error("Menu container not found for rendering.");
            return;
        }
        container.innerHTML = ''; // 清空舊菜單
        if (!menu || menu.length === 0) {
            container.innerHTML = '<p>此店家尚未提供菜單。</p>';
            return;
        }
        const ul = document.createElement('ul');
        ul.className = 'menu-list';
        menu.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="menu-item-name">${item.name}</span>
                <span class="menu-item-price">$${item.price}</span>
            `;
            ul.appendChild(li);
        });
        container.appendChild(ul);
    }

    // *** 實作 renderOrderSummary ***
    function renderOrderSummary(orderData) {
        if (!summaryListDiv) return;
        summaryListDiv.innerHTML = ''; // 清空

        if (!orderData || !orderData.orders || orderData.orders.length === 0) {
            summaryListDiv.innerHTML = '<p>目前還沒有人提交訂單。</p>';
            return;
        }

        orderData.orders.forEach((order, index) => {
            const orderDiv = document.createElement('div');
            orderDiv.innerHTML = `
                <p><strong>訂購人 ${index + 1}:</strong> ${order.name}</p>
                <p><strong>餐點內容:</strong></p>
                <pre>${order.order}</pre> <!-- 使用 pre 保持換行 -->
                <p style="font-size: 0.8em; color: #666;">提交時間: ${new Date(order.timestamp).toLocaleString()}</p>
            `;
            summaryListDiv.appendChild(orderDiv);
        });
    }


    // --- 核心功能：店家詳細、分享、複製 ---

    // *** 實作 generateShareId ***
    function generateShareId() {
        return Math.random().toString(36).substring(2, 10); // 生成 8 位隨機字串
    }

    // *** 實作 showRestaurantDetail (修正版) ***
    function showRestaurantDetail(restaurantId) {
        console.log("Showing details for restaurant ID:", restaurantId);
        const currentRestaurants = JSON.parse(localStorage.getItem('listRestaurants')) || restaurants;
        const restaurant = currentRestaurants.find(r => r.id === parseInt(restaurantId));

        if (!restaurant) {
            console.error(`Restaurant with ID ${restaurantId} not found.`);
            alert("找不到該店家資訊！");
            showSection('homepage'); return;
        }

        resDetailName.textContent = restaurant.name;
        renderMenu(restaurant.menu, resMenuDiv); // 渲染主菜單
        renderMenu(restaurant.menu, orderFormMenuRef); // 渲染訂單表單的菜單參考

        const shareId = generateShareId();
        // *** 修正分享連結格式 ***
        const shareLink = `${window.location.origin}${window.location.pathname}#order/${shareId}`;
        shareLinkInput.value = shareLink;

        // 準備儲存分享訂單的初始資料
        let currentSharedOrders = JSON.parse(localStorage.getItem('listSharedOrders')) || {};
        if (!currentSharedOrders[shareId]) {
             currentSharedOrders[shareId] = {
                shareId: shareId, // 將 shareId 也存入，方便查找
                restaurantId: restaurant.id,
                restaurantName: restaurant.name,
                sharer: loggedInUser ? loggedInUser.username : '訪客', // 使用 "訪客" 替代 "朋友"
                orders: []
            };
            localStorage.setItem('listSharedOrders', JSON.stringify(currentSharedOrders));
            sharedOrders = currentSharedOrders; // 更新記憶體
            console.log("Created new shared order entry with ID:", shareId, currentSharedOrders[shareId]);
        } else {
             console.log("Using existing shared order entry with ID:", shareId);
        }


        // 顯示"檢視揪團點餐資訊"按鈕 (如果登入者是分享者)
        const orderInfo = currentSharedOrders[shareId];
         if (loggedInUser && orderInfo && orderInfo.sharer === loggedInUser.username) {
             viewOrderSummaryBtn.style.display = 'inline-block';
             viewOrderSummaryBtn.onclick = () => {
                 window.location.hash = `#summary/${shareId}`; // 設定點擊跳轉到彙總頁的 hash
             };
         } else {
             viewOrderSummaryBtn.style.display = 'none';
         }

        showSection('restaurant-detail');
        console.log("Restaurant details displayed for:", restaurant.name);
    }

    // *** 實作 copyShareLink (修正版) ***
    function copyShareLink() {
        if (!shareLinkInput || !shareLinkInput.value) {
            console.error("Share link input not found or is empty.");
            alert("無法複製連結：連結不存在。");
            return;
        }
        const linkToCopy = shareLinkInput.value;

        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(linkToCopy).then(() => {
                const originalText = copyLinkBtn.innerHTML;
                copyLinkBtn.innerHTML = '<i class="fas fa-check"></i> 已複製';
                copyLinkBtn.disabled = true;
                setTimeout(() => {
                    copyLinkBtn.innerHTML = originalText; // 恢復原始 HTML (包含 icon)
                    copyLinkBtn.disabled = false;
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy link using Clipboard API:', err);
                tryCopyExecCommand(linkToCopy);
            });
        } else {
            console.warn("Clipboard API not available or context is not secure. Trying execCommand.");
            tryCopyExecCommand(linkToCopy);
        }
    }

    function tryCopyExecCommand(textToCopy) {
        try {
            shareLinkInput.select();
            shareLinkInput.setSelectionRange(0, 99999);
            const successful = document.execCommand('copy');
            if(successful) {
                const originalText = copyLinkBtn.innerHTML;
                copyLinkBtn.innerHTML = '<i class="fas fa-check"></i> 已複製';
                copyLinkBtn.disabled = true;
                setTimeout(() => {
                    copyLinkBtn.innerHTML = originalText;
                    copyLinkBtn.disabled = false;
                }, 2000);
            } else {
                 console.error('Fallback copy command failed.');
                 alert('複製失敗！您的瀏覽器可能不支援此功能，請嘗試手動選取並複製連結。');
            }
            // Deselect
             window.getSelection().removeAllRanges();
             // Or: shareLinkInput.blur();


        } catch (err) {
            console.error('Error during fallback execCommand copy:', err);
            alert('複製過程中發生錯誤，請嘗試手動選取並複製連結。');
        }
    }


    // --- Hash 處理 (處理分享連結跳轉) ---
    // *** 修正 handleHashChange ***
    function handleHashChange() {
        const hash = window.location.hash;
        console.log("Hash changed:", hash);

        if (hash.startsWith('#order/')) {
            const parts = hash.split('/'); // ["#order", "SHARE_ID"]
            if (parts.length === 2 && parts[1]) {
                const shareId = parts[1];
                console.log("Detected order form request with shareId:", shareId);
                const currentSharedOrders = JSON.parse(localStorage.getItem('listSharedOrders')) || {};
                const orderData = currentSharedOrders[shareId];

                if (orderData) {
                    console.log("Found shared order data:", orderData);
                    sharerNameDisplay.textContent = orderData.sharer || '朋友';
                    orderFormResName.textContent = orderData.restaurantName || '未知店家';

                    const currentRestaurants = JSON.parse(localStorage.getItem('listRestaurants')) || restaurants;
                    const restaurantForMenu = currentRestaurants.find(r => r.id === orderData.restaurantId);
                     if(restaurantForMenu && restaurantForMenu.menu) {
                         renderMenu(restaurantForMenu.menu, orderFormMenuRef);
                     } else {
                         orderFormMenuRef.innerHTML = '<p>無法載入菜單參考。</p>';
                         console.warn(`Menu not found for restaurant ID ${orderData.restaurantId} in order form ref.`);
                     }

                    friendOrderForm.dataset.shareId = shareId; // *** 關鍵：將 shareId 存到表單上 ***
                    showSection('order-form-view');
                } else {
                    console.error("No shared order data found for shareId:", shareId);
                    alert("無效的訂單連結！");
                    window.location.hash = '';
                    showSection('homepage');
                }
            } else {
                 console.warn("Invalid order hash format:", hash);
                 window.location.hash = '';
                 showSection('homepage');
            }

        } else if (hash.startsWith('#summary/')) {
            const parts = hash.split('/'); // ["#summary", "SHARE_ID"]
            if(parts.length === 2 && parts[1]) {
                const shareId = parts[1];
                console.log("Detected order summary request with shareId:", shareId);
                const currentSharedOrders = JSON.parse(localStorage.getItem('listSharedOrders')) || {};
                const orderData = currentSharedOrders[shareId];

                 if (orderData) {
                      console.log("Found shared order data for summary:", orderData);
                      // 可選: 檢查權限，只有分享者能看彙總
                      if (!loggedInUser || loggedInUser.username !== orderData.sharer) {
                          alert("您沒有權限查看此訂單彙總。");
                          window.location.hash = '';
                          showSection('homepage');
                          return;
                      }
                     summaryResName.textContent = orderData.restaurantName || '未知店家';
                     renderOrderSummary(orderData); // 渲染訂單列表
                     showSection('order-summary');
                 } else {
                     console.error("No shared order data found for summary shareId:", shareId);
                     alert("找不到訂單彙總資訊！");
                     window.location.hash = '';
                     showSection('homepage');
                 }
            } else {
                 console.warn("Invalid summary hash format:", hash);
                 window.location.hash = '';
                 showSection('homepage');
            }

        } else if (hash === '' || hash === '#') {
              // 如果 hash 清空了，檢查是否在特定頁面，否則回首頁
              const activeNonHomepage = document.querySelector('.page-section.active:not(#homepage)');
              // 如果當前顯示的不是首頁，且 hash 被清空了，則跳回首頁
              if (activeNonHomepage) {
                   console.log("Hash cleared, returning to homepage from:", activeNonHomepage.id);
                   showSection('homepage');
              }
        }
    }


    // --- 事件監聽器 ---

    // 登入/註冊/登出
    loginRegisterBtn.addEventListener('click', () => { openModal('login-modal'); });
    loginForm.addEventListener('submit', (e) => { /* ... 同前 ... */
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        loginError.textContent = '';
        const currentUsers = JSON.parse(localStorage.getItem('listAppUsers')) || users;
        if (currentUsers[username] && currentUsers[username].password === password) {
            loggedInUser = { username: username, role: currentUsers[username].role };
            sessionStorage.setItem('listLoggedInUser', JSON.stringify(loggedInUser));
            closeModal('login-modal');
            updateLoginStateUI();
            loginForm.reset();
        } else { loginError.textContent = '帳號或密碼錯誤'; }
     });
    registerForm.addEventListener('submit', (e) => { /* ... 同前 ... */
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        registerError.textContent = ''; registerSuccess.textContent = '';
        let currentUsers = JSON.parse(localStorage.getItem('listAppUsers')) || users;

        if (password !== confirmPassword) { registerError.textContent = '兩次輸入的密碼不一致'; return; }
        if (currentUsers[username]) { registerError.textContent = '此帳號名稱已被註冊'; return; }
        if (!username || !password) { registerError.textContent = '帳號和密碼不能為空'; return; }
        if (username === 'awa990226' || username.startsWith('res_')) {
            registerError.textContent = '此帳號名稱為保留字或格式'; return;
        }

        currentUsers[username] = { password: password, role: 'user' };
        localStorage.setItem('listAppUsers', JSON.stringify(currentUsers));
        users = currentUsers; // 更新記憶體中的 users
        registerSuccess.textContent = '註冊成功！請返回登入。';
        registerForm.reset();
    });
    logoutBtn.addEventListener('click', () => { /* ... 同前 ... */
        loggedInUser = null;
        sessionStorage.removeItem('listLoggedInUser');
        updateLoginStateUI();
        showSection('homepage');
        history.replaceState(null, '', window.location.pathname + window.location.search); // 清除 hash
     });

    // 管理按鈕
    adminActionsBtn.addEventListener('click', () => { /* ... 同前 ... */
        if (!loggedInUser) return;
        if (loggedInUser.role === 'admin') { showSection('admin-panel'); }
        else if (loggedInUser.role === 'restaurant') { alert("店家專屬後台功能開發中！"); showSection('homepage'); }
     });

    // 搜尋
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') performSearch(); });
    function performSearch() { /* ... 同前，使用 localStorage 最新資料 ... */
         const searchTerm = searchInput.value.toLowerCase().trim();
         const currentRestaurants = JSON.parse(localStorage.getItem('listRestaurants')) || restaurants;

        if (!searchTerm) {
            // 如果搜尋框清空且當前在搜尋結果頁，返回首頁
             if (document.getElementById('search-results').classList.contains('active')) {
                showSection('homepage');
             }
            return;
        }
        resultsContainerDiv.innerHTML = ''; // 清空之前的結果
        const results = currentRestaurants.filter(r =>
            r.name.toLowerCase().includes(searchTerm) ||
            (r.menu && r.menu.some(item => item.name.toLowerCase().includes(searchTerm)))
        );
        renderRestaurantList(results, resultsContainerDiv); // 渲染搜尋結果到 results container
        showSection('search-results'); // 顯示搜尋結果區塊
    }


    // 複製連結按鈕
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', copyShareLink); // *** 確保綁定事件 ***
    } else {
        console.error("Copy link button not found!");
    }

    // 社群分享按鈕 (示例，實際功能需對接 SDK 或 URL Scheme)
    if (socialShareButtonsContainer) {
        socialShareButtonsContainer.addEventListener('click', (e) => {
            const button = e.target.closest('.btn-social');
            if (!button) return;

            const platform = button.dataset.platform;
            const shareUrl = shareLinkInput.value;
            const text = `一起來點 "${resDetailName.textContent}" 吧！ `;
            let platformUrl = '';

            switch(platform) {
                case 'line':
                    platformUrl = `https://line.me/R/msg/text/?${encodeURIComponent(text + shareUrl)}`;
                    break;
                case 'messenger':
                    // Messenger 需要 App ID，用網頁版分享較複雜，這裡僅示意
                     // platformUrl = `fb-messenger://share?link=${encodeURIComponent(shareUrl)}`; // 效果不穩定
                    alert("Messenger 分享請手動複製連結。"); return; // 暫時用提示
                case 'discord':
                     alert("Discord 分享請手動複製連結貼上。"); return; // Discord 沒有簡單的 URL Scheme
                case 'instagram':
                     alert("Instagram 分享請手動複製連結到限時動態或私訊。"); return; // IG 不支援直接分享連結貼文
                default:
                    return; // 不支援的平台
            }
            if (platformUrl) {
                 window.open(platformUrl, '_blank');
            }
        });
    }


    // 朋友填寫訂單表單提交
    // *** 修正 friendOrderForm 提交事件 ***
    friendOrderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const shareId = e.target.dataset.shareId; // *** 從 dataset 獲取 shareId ***
        if (!shareId) {
            alert("發生錯誤，無法確定訂單歸屬，請重新透過分享連結進入。");
            console.error("Missing shareId in friendOrderForm dataset");
            return;
        }

        const friendName = document.getElementById('friend-name').value.trim();
        const friendOrderText = document.getElementById('friend-order').value.trim();

        if (!friendName || !friendOrderText) {
            alert('請填寫你的名字和想點的餐點！');
            return;
        }

        let currentSharedOrders = JSON.parse(localStorage.getItem('listSharedOrders')) || {};
        if (currentSharedOrders[shareId]) {
             if (!Array.isArray(currentSharedOrders[shareId].orders)) {
                 currentSharedOrders[shareId].orders = [];
             }
            currentSharedOrders[shareId].orders.push({
                name: friendName,
                order: friendOrderText,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('listSharedOrders', JSON.stringify(currentSharedOrders));
            sharedOrders = currentSharedOrders; // 更新記憶體

            alert('訂單已送出！感謝您！');
            friendOrderForm.reset();
            window.location.hash = ''; // 清除 hash
            showSection('homepage'); // 返回首頁

        } else {
            alert('發生錯誤：找不到對應的揪團訂單。請確認連結是否正確。');
            console.error("Failed to find shared order data for shareId during submission:", shareId);
        }
    });


    // Hash 變化監聽
    window.addEventListener('hashchange', handleHashChange);

    // Modal 相關
    window.onclick = function(event) { if (event.target.classList.contains('modal')) closeModal(event.target.id); }
    document.addEventListener('keydown', function(event) { if (event.key === "Escape" || event.key === "Esc") { /* ... 關閉所有 modal ... */ } });

    // --- 管理員功能 ---
    // 刪除店家
    function deleteRestaurant(restaurantId, cardElement) { /* ... 同前 ... */
        if (!loggedInUser || loggedInUser.role !== 'admin') { alert("權限不足"); return; }
        let currentRestaurants = JSON.parse(localStorage.getItem('listRestaurants')) || [];
        const updatedRestaurants = currentRestaurants.filter(r => r.id !== restaurantId);
        localStorage.setItem('listRestaurants', JSON.stringify(updatedRestaurants));
        restaurants = updatedRestaurants;

        if (cardElement && cardElement.parentNode) {
             cardElement.remove();
        } else {
            // 如果不在列表頁面刪除，需要重新渲染當前列表
            const activeListContainer = document.querySelector('.page-section.active .card-container');
              if (activeListContainer) {
                  renderRestaurantList(restaurants, activeListContainer);
              } else {
                   renderRestaurantList(restaurants, restaurantListDiv); // Fallback
              }
        }
        alert("店家已成功刪除！");
    }

    // 新增店家表單
    addRestaurantForm.addEventListener('submit', (e) => { /* ... 同前，確保更新 localStorage 和記憶體 ... */
        e.preventDefault();
        const currentUser = JSON.parse(sessionStorage.getItem('listLoggedInUser'));
        if (!currentUser || currentUser.role !== 'admin') { alert('權限不足'); return; }
        const name = document.getElementById('admin-res-name').value.trim();
        const ratingInput = document.getElementById('admin-res-rating').value;
        const image = document.getElementById('admin-res-image').value.trim();
        const menuString = document.getElementById('admin-res-menu').value.trim();
        const rating = parseFloat(ratingInput);
        if (!name || isNaN(rating) || rating < 1 || rating > 5) { alert('請填寫有效的店家名稱和 1-5 之間的評分'); return; }
        const menu = menuString.split(';').map(item => item.trim()).filter(item => item)
            .map(item => {
                 const parts = item.split(',');
                 if (parts.length === 2) {
                     const itemName = parts[0].trim();
                     const itemPrice = parseInt(parts[1].trim(), 10);
                     if (itemName && !isNaN(itemPrice) && itemPrice >= 0) return { name: itemName, price: itemPrice };
                 } return null;
            }).filter(item => item !== null);
        if(menu.length === 0 && menuString !== '') {
            alert('菜單格式可能有誤，請使用 "品項1,價格1;品項2,價格2" 格式'); return;
        }

        let currentRestaurants = JSON.parse(localStorage.getItem('listRestaurants')) || [];
        const newId = currentRestaurants.length > 0 ? Math.max(...currentRestaurants.map(r => r.id)) + 1 : 1;
        const newRestaurant = { id: newId, name, rating, image: image || undefined, menu }; // image 為空則不存

        currentRestaurants.push(newRestaurant);
        localStorage.setItem('listRestaurants', JSON.stringify(currentRestaurants));
        restaurants = currentRestaurants; // 更新記憶體

        alert('店家新增成功！');
        addRestaurantForm.reset();
        // 不需要手動渲染，showSection 會處理
        showSection('homepage');
    });

    // 新增店家帳號 (步驟一)
    addRestaurantAccountForm.addEventListener('submit', (e) => { /* ... 同前 ... */
        e.preventDefault();
        addAccError.textContent = ''; addAccSuccess.textContent = '';
        verificationStepDiv.style.display = 'none';
        const username = document.getElementById('res-acc-username').value.trim();
        const password = document.getElementById('res-acc-password').value;
        const email = document.getElementById('res-acc-email').value.trim();
        if (!username || !password || !email) { addAccError.textContent = '請填寫所有欄位。'; return; }
        if (!email.endsWith('@gmail.com')) { addAccError.textContent = '請輸入有效的 Gmail 地址。'; return; }
        const currentUsers = JSON.parse(localStorage.getItem('listAppUsers')) || users;
        if (currentUsers[username]) { addAccError.textContent = '此用戶名已被使用。'; return; }

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`[模擬] 發送驗證碼 ${verificationCode} 到 ${email}`);
        pendingRestaurantAccount = { username, password, email, role: 'restaurant', verificationCode };
        verifyingEmailSpan.textContent = email;
        simulatedCodeSpan.textContent = verificationCode;
        verificationCodeInput.value = ''; verifyError.textContent = '';
        addRestaurantAccountForm.style.display = 'none';
        verificationStepDiv.style.display = 'block';
        verificationCodeInput.focus();
    });
    // 新增店家帳號 (步驟二 - 驗證)
    verifyAccountBtn.addEventListener('click', () => { /* ... 同前 ... */
        verifyError.textContent = '';
        const enteredCode = verificationCodeInput.value;
        if (!pendingRestaurantAccount) { verifyError.textContent = '發生錯誤，請重新操作。'; return; }
        if (enteredCode === pendingRestaurantAccount.verificationCode) {
            let currentUsers = JSON.parse(localStorage.getItem('listAppUsers')) || users;
            const { verificationCode, ...accountToCreate } = pendingRestaurantAccount;
            currentUsers[accountToCreate.username] = accountToCreate;
            localStorage.setItem('listAppUsers', JSON.stringify(currentUsers));
            users = currentUsers; // 更新記憶體
            addAccSuccess.textContent = `店家帳號 "${accountToCreate.username}" 已成功建立！`;
            pendingRestaurantAccount = null;
            verificationStepDiv.style.display = 'none';
            addRestaurantAccountForm.reset();
            addRestaurantAccountForm.style.display = 'block';
            addAccError.textContent = '';
        } else {
            verifyError.textContent = '驗證碼錯誤，請重新輸入。';
            verificationCodeInput.focus();
            verificationCodeInput.select();
        }
    });
    // 取消驗證
    cancelVerificationBtn.addEventListener('click', () => { /* ... 同前 ... */
        pendingRestaurantAccount = null;
        verificationStepDiv.style.display = 'none';
        addRestaurantAccountForm.reset();
        addRestaurantAccountForm.style.display = 'block';
        addAccError.textContent = ''; verifyError.textContent = ''; addAccSuccess.textContent = '';
    });

    // --- 初始化 ---
    updateLoginStateUI(); // 包含讀取 sessionStorage, 初始渲染, 和首次 hash 檢查

}); // End DOMContentLoaded