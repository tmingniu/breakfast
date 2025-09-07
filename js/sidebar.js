// 侧边栏样式
const sidebarStyle = `
.sidebar {
    position: fixed;
    left: -300px;
    top: 0;
    width: 300px;
    height: 100vh;
    background: var(--card-bg);
    box-shadow: 2px 0 10px rgba(0,0,0,0.1);
    transition: left 0.3s ease;
    z-index: 1000;
    overflow-y: auto;
    padding: 20px;
}

.sidebar.open {
    left: 0;
}

.sidebar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    z-index: 999;
    display: none;
}

.sidebar-overlay.active {
    display: block;
}

.menu-btn {
    position: fixed;
    top: 20px;
    left: 20px;
    z-index: 1001;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    font-size: 20px;
    cursor: pointer;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.sidebar-header {
    text-align: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 2px solid rgba(0,0,0,0.1);
}

.sidebar-title {
    color: var(--primary-color);
    font-size: 20px;
    margin-bottom: 10px;
}

.menu-management {
    margin-bottom: 25px;
}

.menu-section {
    margin-bottom: 20px;
}

.section-title {
    font-size: 16px;
    color: var(--primary-color);
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.menu-buttons {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.menu-btn-small {
    padding: 12px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s ease;
    text-align: left;
    background: var(--secondary-color);
    color: white;
}

.menu-btn-small:hover {
    transform: translateX(5px);
    opacity: 0.9;
}

.current-menu-info {
    background: rgba(0,0,0,0.05);
    padding: 15px;
    border-radius: 10px;
    margin-top: 20px;
}

.menu-info {
    font-size: 14px;
    margin-bottom: 10px;
    color: var(--text-color);
}

.menu-stats {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.stat-item {
    background: rgba(0,0,0,0.1);
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    color: var(--text-light);
}

@media (max-width: 768px) {
    .sidebar {
        width: 280px;
        left: -280px;
    }
}
`;

// 添加侧边栏样式到文档
const styleSheet = document.createElement('style');
styleSheet.textContent = sidebarStyle;
document.head.appendChild(styleSheet);