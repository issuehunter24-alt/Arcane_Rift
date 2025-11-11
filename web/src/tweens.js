/**
 * 간단한 트윈 애니메이션 시스템
 * requestAnimationFrame 기반
 */
// Easing 함수들
export const Easing = {
    linear: (t) => t,
    easeInQuad: (t) => t * t,
    easeOutQuad: (t) => t * (2 - t),
    easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
    easeInCubic: (t) => t * t * t,
    easeOutCubic: (t) => (--t) * t * t + 1,
    easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),
    easeInQuart: (t) => t * t * t * t,
    easeOutQuart: (t) => 1 - (--t) * t * t * t,
    easeInOutQuart: (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t),
    easeInElastic: (t) => {
        if (t === 0 || t === 1)
            return t;
        return -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI);
    },
    easeOutElastic: (t) => {
        if (t === 0 || t === 1)
            return t;
        return Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1;
    },
    easeOutBounce: (t) => {
        const n1 = 7.5625;
        const d1 = 2.75;
        if (t < 1 / d1) {
            return n1 * t * t;
        }
        else if (t < 2 / d1) {
            return n1 * (t -= 1.5 / d1) * t + 0.75;
        }
        else if (t < 2.5 / d1) {
            return n1 * (t -= 2.25 / d1) * t + 0.9375;
        }
        else {
            return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
    },
};
class Tween {
    constructor(options) {
        this.startTime = null;
        this.rafId = null;
        this.running = false;
        this.options = {
            from: options.from,
            to: options.to,
            duration: options.duration,
            easing: options.easing || Easing.easeOutQuad,
            onUpdate: options.onUpdate || (() => { }),
            onComplete: options.onComplete || (() => { }),
        };
    }
    start() {
        if (this.running)
            return this;
        this.running = true;
        this.startTime = null;
        const animate = (timestamp) => {
            if (!this.running)
                return;
            if (!this.startTime) {
                this.startTime = timestamp;
            }
            const elapsed = timestamp - this.startTime;
            const progress = Math.min(elapsed / this.options.duration, 1);
            const easedProgress = this.options.easing(progress);
            const currentValue = this.options.from + (this.options.to - this.options.from) * easedProgress;
            this.options.onUpdate(currentValue);
            if (progress < 1) {
                this.rafId = requestAnimationFrame(animate);
            }
            else {
                this.running = false;
                this.options.onComplete();
            }
        };
        this.rafId = requestAnimationFrame(animate);
        return this;
    }
    stop() {
        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
        this.running = false;
        return this;
    }
    isRunning() {
        return this.running;
    }
}
/**
 * 트윈 매니저 (여러 트윈 관리)
 */
class TweenManager {
    constructor() {
        this.tweens = new Set();
    }
    create(options) {
        const tween = new Tween(options);
        this.tweens.add(tween);
        // 완료 시 자동 제거
        const originalOnComplete = options.onComplete;
        tween['options'].onComplete = () => {
            if (originalOnComplete)
                originalOnComplete();
            this.tweens.delete(tween);
        };
        return tween;
    }
    stopAll() {
        this.tweens.forEach(tween => tween.stop());
        this.tweens.clear();
    }
    getActiveTweensCount() {
        return this.tweens.size;
    }
}
// 싱글톤 매니저
export const tweenManager = new TweenManager();
/**
 * 헬퍼 함수: 간단한 숫자 트윈
 */
export function tweenNumber(from, to, duration, onUpdate, options) {
    return tweenManager.create({
        from,
        to,
        duration,
        easing: options?.easing,
        onUpdate,
        onComplete: options?.onComplete,
    }).start();
}
/**
 * 헬퍼 함수: 지연 후 콜백
 */
export function tweenDelay(duration, onComplete) {
    return tweenManager.create({
        from: 0,
        to: 1,
        duration,
        onUpdate: () => { },
        onComplete,
    }).start();
}
/**
 * 헬퍼 함수: 순차 애니메이션
 */
export function tweenSequence(tweens) {
    if (tweens.length === 0)
        return;
    const runNext = (index) => {
        if (index >= tweens.length)
            return;
        const tween = tweens[index]();
        const originalOnComplete = tween['options'].onComplete;
        tween['options'].onComplete = () => {
            if (originalOnComplete)
                originalOnComplete();
            runNext(index + 1);
        };
    };
    runNext(0);
}
/**
 * 헬퍼 함수: 병렬 애니메이션
 */
export function tweenParallel(tweens, onAllComplete) {
    if (tweens.length === 0) {
        if (onAllComplete)
            onAllComplete();
        return;
    }
    let completedCount = 0;
    tweens.forEach(createTween => {
        const tween = createTween();
        const originalOnComplete = tween['options'].onComplete;
        tween['options'].onComplete = () => {
            if (originalOnComplete)
                originalOnComplete();
            completedCount++;
            if (completedCount === tweens.length && onAllComplete) {
                onAllComplete();
            }
        };
    });
}
