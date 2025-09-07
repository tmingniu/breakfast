// 增强的存储工具
class StorageManager {
    static setItem(key, value) {
        try {
            // 优先使用localStorage
            localStorage.setItem(key, JSON.stringify(value));

            // 备用：使用sessionStorage（会话期间有效）
            sessionStorage.setItem(key, JSON.stringify(value));

            // 备用：使用IndexedDB（更稳定）
            this.saveToIndexedDB(key, value);

        } catch (error) {
            console.warn('存储失败:', error);
        }
    }

    static getItem(key) {
        try {
            // 先从localStorage尝试
            let item = localStorage.getItem(key);
            if (item) return JSON.parse(item);

            // 再从sessionStorage尝试
            item = sessionStorage.getItem(key);
            if (item) return JSON.parse(item);

            // 最后从IndexedDB尝试
            return this.getFromIndexedDB(key);

        } catch (error) {
            console.warn('读取存储失败:', error);
            return null;
        }
    }

    static saveToIndexedDB(key, value) {
        // 简单的IndexedDB备用方案
        if (!window.indexedDB) return null;

        return new Promise((resolve) => {
            const request = indexedDB.open('BreakfastApp', 1);

            request.onupgradeneeded = function(event) {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('appData')) {
                    db.createObjectStore('appData');
                }
            };

            request.onsuccess = function(event) {
                const db = event.target.result;
                const transaction = db.transaction(['appData'], 'readwrite');
                const store = transaction.objectStore('appData');
                const putRequest = store.put(value, key);

                putRequest.onsuccess = function() {
                    resolve(true);
                };

                putRequest.onerror = function() {
                    resolve(false);
                };
            };

            request.onerror = function() {
                resolve(false);
            };
        });
    }

    static getFromIndexedDB(key) {
        return new Promise((resolve) => {
            if (!window.indexedDB) {
                resolve(null);
                return;
            }

            const request = indexedDB.open('BreakfastApp', 1);

            request.onsuccess = function(event) {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('appData')) {
                    resolve(null);
                    return;
                }

                const transaction = db.transaction(['appData'], 'readonly');
                const store = transaction.objectStore('appData');
                const getRequest = store.get(key);

                getRequest.onsuccess = function() {
                    resolve(getRequest.result || null);
                };

                getRequest.onerror = function() {
                    resolve(null);
                };
            };

            request.onerror = function() {
                resolve(null);
            };
        });
    }

    static clear() {
        try {
            localStorage.clear();
            sessionStorage.clear();
            this.clearIndexedDB();
        } catch (error) {
            console.warn('清理存储失败:', error);
        }
    }

    static clearIndexedDB() {
        if (!window.indexedDB) return;

        const request = indexedDB.deleteDatabase('BreakfastApp');
        request.onsuccess = function() {
            console.log('IndexedDB数据库已删除');
        };
        request.onerror = function() {
            console.warn('删除IndexedDB数据库失败');
        };
    }
}

// URL状态管理
class URLStateManager {
    static saveToURL(state) {
        try {
            const stateString = btoa(encodeURIComponent(JSON.stringify(state)));
            if (window.history && window.history.replaceState) {
                // 使用replaceState避免添加历史记录
                const newUrl = window.location.origin + window.location.pathname + '#' + stateString;
                window.history.replaceState(null, '', newUrl);
            } else {
                // 回退方案
                window.location.hash = stateString;
            }
        } catch (error) {
            console.warn('保存到URL失败:', error);
        }
    }

    static loadFromURL() {
        try {
            if (window.location.hash) {
                const stateString = window.location.hash.substring(1);
                return JSON.parse(decodeURIComponent(atob(stateString)));
            }
        } catch (error) {
            console.warn('从URL加载状态失败:', error);
        }
        return null;
    }

    static clearURL() {
        if (window.history && window.history.replaceState) {
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
        } else {
            window.location.hash = '';
        }
    }
}

// 主应用程序
class BreakfastApp {
    constructor() {
        this.currentIndex = 0;
        this.shuffledCombos = [];
        this.viewedCombos = [];
        this.isInitialized = false;
        this.init();
    }

    async init() {
        this.setupDOMReferences();
        this.setupEventListeners();
        await this.loadProgress();

        // 如果没有 shuffledCombos 或者菜单有变化，重新洗牌
        if (this.shuffledCombos.length === 0 ||
            this.shuffledCombos.length !== menuManager.getCurrentMenu().length) {
            this.reshuffleCombos();
        } else {
            this.showCurrentCombo();
            this.updateProgress();
            this.updateHistoryList();
        }

        this.isInitialized = true;
        console.log('早餐助手初始化完成');
    }

    setupDOMReferences() {
        this.comboText = document.getElementById('combo-text');
        this.comboPrice = document.getElementById('combo-price');
        this.progressText = document.getElementById('progress-text');
        this.percentText = document.getElementById('percent-text');
        this.progressBar = document.getElementById('progress-bar');
        this.nextBtn = document.getElementById('next-btn');
        this.historyList = document.getElementById('history-list');
        this.sidebarToggle = document.getElementById('sidebar-toggle');
        this.sidebarOverlay = document.getElementById('sidebar-overlay');
        this.sidebar = document.getElementById('sidebar');
    }

    setupEventListeners() {
        this.nextBtn.addEventListener('click', () => this.nextCombo());
        this.sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        this.sidebarOverlay.addEventListener('click', () => this.toggleSidebar());

        // 添加页面卸载前的保存
        window.addEventListener('beforeunload', () => this.saveProgress());
        window.addEventListener('pagehide', () => this.saveProgress());
    }

    toggleSidebar() {
        this.sidebar.classList.toggle('open');
        this.sidebarOverlay.classList.toggle('active');
        document.body.classList.toggle('sidebar-open');
    }

    async loadProgress() {
        console.log('正在加载进度...');

        // 1. 首先尝试从URL加载（最可靠）
        const urlState = URLStateManager.loadFromURL();
        if (urlState) {
            console.log('从URL加载进度');
            this.currentIndex = urlState.currentIndex || 0;
            this.viewedCombos = urlState.viewedCombos || [];
            this.shuffledCombos = urlState.shuffledCombos || [];
            return;
        }

        // 2. 从存储加载
        try {
            const savedIndex = await StorageManager.getItem('currentIndex');
            const viewedCombos = await StorageManager.getItem('viewedCombos');
            const shuffledCombos = await StorageManager.getItem('breakfastCombos');

            if (savedIndex !== null) this.currentIndex = savedIndex;
            if (viewedCombos) this.viewedCombos = viewedCombos;
            if (shuffledCombos) this.shuffledCombos = shuffledCombos;

            console.log('从存储加载进度:', {
                index: this.currentIndex,
                viewed: this.viewedCombos.length,
                shuffled: this.shuffledCombos.length
            });

        } catch (error) {
            console.error('加载进度失败:', error);
        }
    }

    saveProgress() {
        if (!this.isInitialized) return;

        const state = {
            currentIndex: this.currentIndex,
            viewedCombos: this.viewedCombos,
            shuffledCombos: this.shuffledCombos,
            saveTime: new Date().toISOString()
        };

        // 保存到多种存储方式
        StorageManager.setItem('currentIndex', this.currentIndex);
        StorageManager.setItem('viewedCombos', this.viewedCombos);
        StorageManager.setItem('breakfastCombos', this.shuffledCombos);

        // 保存到URL（最可靠）
        URLStateManager.saveToURL(state);

        console.log('进度已保存:', state);
    }

    reshuffleCombos() {
        const currentMenu = menuManager ? menuManager.getCurrentMenu() : defaultMenu;
        this.shuffledCombos = [...currentMenu];

        // 随机打乱
        for (let i = this.shuffledCombos.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.shuffledCombos[i], this.shuffledCombos[j]] = [this.shuffledCombos[j], this.shuffledCombos[i]];
        }

        this.currentIndex = 0;
        this.viewedCombos = [];
        this.historyList.innerHTML = '<div class="history-item">暂无浏览记录</div>';

        this.saveProgress();
        this.showCurrentCombo();
        this.updateProgress();

        console.log('菜单已重新洗牌');
    }

    showCurrentCombo() {
        if (this.currentIndex < this.shuffledCombos.length) {
            const combo = this.shuffledCombos[this.currentIndex];
            const [comboName, price] = combo.split(' = ');

            this.comboText.textContent = comboName;
            this.comboPrice.textContent = price;
        } else {
            this.comboText.textContent = "已完成所有搭配！";
            this.comboPrice.textContent = "点击侧边栏重置菜单";
        }
    }

    updateProgress() {
        const percent = Math.round((this.currentIndex / this.shuffledCombos.length) * 100);
        this.progressText.textContent = `${this.currentIndex}/${this.shuffledCombos.length}`;
        this.percentText.textContent = `${percent}%`;
        this.progressBar.style.width = `${percent}%`;
    }

    updateHistoryList() {
        if (this.viewedCombos.length === 0) {
            this.historyList.innerHTML = '<div class="history-item">暂无浏览记录</div>';
            return;
        }

        this.historyList.innerHTML = '';
        this.viewedCombos.slice().reverse().forEach(combo => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.textContent = combo;
            this.historyList.appendChild(historyItem);
        });
    }

    nextCombo() {
        if (this.currentIndex < this.shuffledCombos.length) {
            this.viewedCombos.push(this.shuffledCombos[this.currentIndex]);
            this.updateHistoryList();

            this.currentIndex++;
            this.saveProgress(); // 每次点击都保存

            if (this.currentIndex < this.shuffledCombos.length) {
                this.showCurrentCombo();
            } else {
                this.comboText.textContent = "已完成所有搭配！";
                this.comboPrice.textContent = "点击侧边栏重置菜单";
            }

            this.updateProgress();
        }
    }

    // 添加重置方法
    resetProgress() {
        this.currentIndex = 0;
        this.viewedCombos = [];
        this.saveProgress();
        this.showCurrentCombo();
        this.updateProgress();
        this.updateHistoryList();
    }
}

// 初始化应用程序
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM加载完成，开始初始化...');

    // 等待所有组件加载完成
    try {
        // 初始化各个模块
        themeSwitcher = new ThemeSwitcher();
        menuManager = new MenuManager();
        window.breakfastApp = new BreakfastApp();

        console.log('应用程序初始化成功');
    } catch (error) {
        console.error('应用程序初始化失败:', error);
        alert('应用程序初始化失败，请刷新页面重试');
    }
});

// 添加错误处理
window.addEventListener('error', function(event) {
    console.error('全局错误:', event.error);
});

window.addEventListener('unhandledrejection', function(event) {
    console.error('未处理的Promise拒绝:', event.reason);
});