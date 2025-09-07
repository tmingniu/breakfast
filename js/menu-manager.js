// 菜单管理功能
class MenuManager {
    constructor() {
        this.currentMenu = [];
        this.importBtn = document.getElementById('import-btn');
        this.exportBtn = document.getElementById('export-btn');
        this.resetMenuBtn = document.getElementById('reset-menu-btn');
        this.templateBtn = document.getElementById('template-btn');
        this.fileInput = document.getElementById('file-input');
        this.menuStatus = document.getElementById('menu-status');
        this.menuInfo = document.getElementById('menu-info');
        this.menuCount = document.getElementById('menu-count');
        this.menuDate = document.getElementById('menu-date');
        this.init();
    }

    init() {
        this.loadMenu();
        this.setupEventListeners();
    }

    loadMenu() {
        const savedMenu = localStorage.getItem('currentMenu');
        const savedMenuName = localStorage.getItem('menuName') || '默认菜单';

        if (savedMenu) {
            this.currentMenu = JSON.parse(savedMenu);
            this.menuStatus.textContent = savedMenuName;
            this.menuInfo.textContent = `当前菜单: ${savedMenuName}`;
        } else {
            this.currentMenu = defaultMenu;
            this.menuStatus.textContent = '默认菜单';
            this.menuInfo.textContent = '当前菜单: 默认早餐菜单';
        }

        this.updateMenuStats();
    }

    updateMenuStats() {
        this.menuCount.textContent = `菜品数量: ${this.currentMenu.length}`;
        this.menuDate.textContent = `加载时间: ${new Date().toLocaleTimeString()}`;
    }

    setupEventListeners() {
        this.importBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileImport(e));
        this.exportBtn.addEventListener('click', () => this.exportMenu());
        this.resetMenuBtn.addEventListener('click', () => this.resetToDefaultMenu());
        this.templateBtn.addEventListener('click', () => this.showTemplateMenu());
    }

    handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                let importedMenu;

                if (file.name.endsWith('.json')) {
                    importedMenu = JSON.parse(content);
                } else {
                    importedMenu = content.split('\n')
                        .filter(line => line.trim())
                        .map(line => line.trim());
                }

                if (Array.isArray(importedMenu) && importedMenu.length > 0) {
                    this.currentMenu = importedMenu;
                    this.saveMenu(file.name.replace(/\.[^/.]+$/, ""));
                    alert(`成功导入 ${importedMenu.length} 个菜品！`);

                    // 重置文件输入，允许再次选择同一文件
                    this.fileInput.value = '';

                    // 通知主程序重新洗牌
                    if (window.breakfastApp) {
                        window.breakfastApp.reshuffleCombos();
                    }
                } else {
                    throw new Error('无效的菜单格式');
                }
            } catch (error) {
                alert('导入失败：' + error.message);
                // 出错时也重置文件输入
                this.fileInput.value = '';
            }
        };
        reader.readAsText(file);
    }

    exportMenu() {
        const menuData = JSON.stringify(this.currentMenu, null, 2);
        const blob = new Blob([menuData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = '早餐菜单.json';
        a.click();

        URL.revokeObjectURL(url);
    }

    resetToDefaultMenu() {
        if (confirm('确定要重置为默认菜单吗？')) {
            this.currentMenu = defaultMenu;
            this.saveMenu('默认菜单');
            alert('已重置为默认菜单');

            // 通知主程序重新洗牌
            if (window.breakfastApp) {
                window.breakfastApp.reshuffleCombos();
            }
        }
    }

    showTemplateMenu() {
        alert('示例菜单功能将在完整版中提供');
    }

    saveMenu(name) {
        localStorage.setItem('currentMenu', JSON.stringify(this.currentMenu));
        localStorage.setItem('menuName', name);
        this.menuStatus.textContent = name;
        this.menuInfo.textContent = `当前菜单: ${name}`;
        this.updateMenuStats();
    }

    getCurrentMenu() {
        return this.currentMenu;
    }
}

// 初始化菜单管理器
let menuManager;