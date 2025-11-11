/**
 * 토스트 알림 시스템
 */
class ToastManager {
    constructor() {
        this.container = null;
        this.toastId = 0;
    }
    init() {
        this.container = document.getElementById('toast-container');
    }
    show(message, options = {}) {
        if (!this.container)
            return;
        const { type = 'info', duration = 3000, title = this.getDefaultTitle(type) } = options;
        const toastId = ++this.toastId;
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.setAttribute('data-toast-id', String(toastId));
        const icon = this.getIcon(type);
        toast.innerHTML = `
      <div class="toast-header">
        <span class="toast-icon">${icon}</span>
        <span>${title}</span>
        <button class="toast-close" aria-label="Close">✕</button>
      </div>
      <div class="toast-message">${message}</div>
    `;
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.onclick = () => this.close(toastId);
        this.container.appendChild(toast);
        // 자동 닫기
        if (duration > 0) {
            setTimeout(() => this.close(toastId), duration);
        }
        return toastId;
    }
    close(toastId) {
        if (!this.container)
            return;
        const toast = this.container.querySelector(`[data-toast-id="${toastId}"]`);
        if (toast) {
            toast.classList.add('fadeOut');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }
    }
    getDefaultTitle(type) {
        switch (type) {
            case 'success': return '✅ 성공';
            case 'error': return '❌ 오류';
            case 'warning': return '⚠️ 경고';
            case 'info': return 'ℹ️ 알림';
        }
    }
    getIcon(type) {
        switch (type) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            case 'info': return 'ℹ️';
        }
    }
    success(message, duration) {
        return this.show(message, { type: 'success', duration });
    }
    error(message, duration) {
        return this.show(message, { type: 'error', duration });
    }
    warning(message, duration) {
        return this.show(message, { type: 'warning', duration });
    }
    info(message, duration) {
        return this.show(message, { type: 'info', duration });
    }
}
// 싱글톤 인스턴스
export const toastManager = new ToastManager();
/**
 * 로딩 화면 관리
 */
class LoadingManager {
    constructor() {
        this.loadingScreen = null;
        this.loadingText = null;
        this.loadingProgress = null;
    }
    init() {
        this.loadingScreen = document.getElementById('loading-screen');
        this.loadingText = this.loadingScreen?.querySelector('.loading-text') || null;
        this.loadingProgress = document.getElementById('loading-progress');
    }
    show(text = 'Loading...') {
        if (!this.loadingScreen)
            return;
        this.loadingScreen.classList.remove('hidden');
        if (this.loadingText) {
            this.loadingText.textContent = text;
        }
    }
    hide() {
        if (!this.loadingScreen)
            return;
        this.loadingScreen.classList.add('hidden');
    }
    setProgress(percent, text) {
        if (this.loadingProgress) {
            this.loadingProgress.textContent = `${Math.round(percent)}%`;
        }
        if (text && this.loadingText) {
            this.loadingText.textContent = text;
        }
    }
}
// 싱글톤 인스턴스
export const loadingManager = new LoadingManager();
