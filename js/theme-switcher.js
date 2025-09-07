// 主题切换功能
class ThemeSwitcher {
    constructor() {
        this.themeToggle = document.getElementById('theme-toggle');
        this.themePanel = document.getElementById('theme-panel');
        this.body = document.body;
        this.init();
    }

    init() {
        this.loadSavedTheme();
        this.setupEventListeners();
    }

    loadSavedTheme() {
        const savedTheme = localStorage.getItem('theme') || 'default';
        this.body.setAttribute('data-theme', savedTheme);

        // 激活当前主题的选项
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('active');
            if (option.dataset.theme === savedTheme) {
                option.classList.add('active');
            }
        });
    }

    setupEventListeners() {
        // 主题切换按钮事件
        this.themeToggle.addEventListener('click', () => {
            this.themePanel.classList.toggle('open');
        });

        // 主题选择事件
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', () => {
                this.switchTheme(option.dataset.theme);
            });
        });

        // 点击外部关闭主题面板
        document.addEventListener('click', (e) => {
            if (!this.themeToggle.contains(e.target) && !this.themePanel.contains(e.target)) {
                this.themePanel.classList.remove('open');
            }
        });
    }

    switchTheme(theme) {
        // 先保存主题设置
        localStorage.setItem('theme', theme);

        // 立即刷新页面，不等待任何过渡效果
        window.location.reload();
    }
}

// 初始化主题切换器
let themeSwitcher;