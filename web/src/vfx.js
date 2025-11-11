import { Graphics } from 'pixi.js';
class ParticleEmitter {
    constructor(container) {
        this.particles = [];
        this.container = container;
    }
    /**
     * 파티클 생성
     */
    createParticle(x, y, vx, vy, color, size, life, fadeOut = true) {
        const sprite = new Graphics();
        sprite.circle(0, 0, size);
        sprite.fill({ color, alpha: 1 });
        sprite.x = x;
        sprite.y = y;
        this.container.addChild(sprite);
        return {
            sprite,
            vx,
            vy,
            life,
            maxLife: life,
            scale: 1,
            fadeOut,
        };
    }
    /**
     * 폭발 이펙트
     */
    burst(x, y, count, color, options) {
        const speed = options?.speed ?? 2;
        const size = options?.size ?? 3;
        const life = options?.life ?? 30;
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            this.particles.push(this.createParticle(x, y, vx, vy, color, size, life));
        }
    }
    /**
     * 원뿔형 분출
     */
    spray(x, y, count, angle, spread, color, options) {
        const speed = options?.speed ?? 3;
        const size = options?.size ?? 3;
        const life = options?.life ?? 30;
        for (let i = 0; i < count; i++) {
            const randomAngle = angle + (Math.random() - 0.5) * spread;
            const randomSpeed = speed * (0.5 + Math.random() * 0.5);
            const vx = Math.cos(randomAngle) * randomSpeed;
            const vy = Math.sin(randomAngle) * randomSpeed;
            this.particles.push(this.createParticle(x, y, vx, vy, color, size, life));
        }
    }
    /**
     * 떨어지는 이펙트
     */
    rain(x, y, count, color, options) {
        const width = options?.width ?? 100;
        const speed = options?.speed ?? 1;
        const size = options?.size ?? 2;
        const life = options?.life ?? 60;
        for (let i = 0; i < count; i++) {
            const offsetX = (Math.random() - 0.5) * width;
            const vx = (Math.random() - 0.5) * 0.5;
            const vy = speed + Math.random() * speed;
            this.particles.push(this.createParticle(x + offsetX, y, vx, vy, color, size, life));
        }
    }
    /**
     * 번쩍임 효과
     */
    flash(x, y, color, size = 50) {
        const sprite = new Graphics();
        sprite.circle(0, 0, size);
        sprite.fill({ color, alpha: 0.8 });
        sprite.x = x;
        sprite.y = y;
        this.container.addChild(sprite);
        this.particles.push({
            sprite,
            vx: 0,
            vy: 0,
            life: 15,
            maxLife: 15,
            scale: 2,
            fadeOut: true,
        });
    }
    /**
     * 상승하는 이펙트 (회복, 버프 등)
     */
    rise(x, y, count, color, options) {
        const speed = options?.speed ?? 1.5;
        const size = options?.size ?? 4;
        const life = options?.life ?? 40;
        for (let i = 0; i < count; i++) {
            const offsetX = (Math.random() - 0.5) * 30;
            const vx = (Math.random() - 0.5) * 0.3;
            const vy = -speed - Math.random() * 0.5;
            this.particles.push(this.createParticle(x + offsetX, y, vx, vy, color, size, life));
        }
    }
    /**
     * 매 프레임 업데이트
     */
    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            // 위치 업데이트
            p.sprite.x += p.vx;
            p.sprite.y += p.vy;
            // 중력 효과 (아래로 가속)
            p.vy += 0.1;
            // 수명 감소
            p.life--;
            // 페이드 아웃
            if (p.fadeOut) {
                const alpha = p.life / p.maxLife;
                p.sprite.alpha = alpha;
            }
            // 스케일 변화 (번쩍임용)
            if (p.scale !== 1) {
                const scale = 1 + (p.scale - 1) * (p.life / p.maxLife);
                p.sprite.scale.set(scale);
            }
            // 수명 다하면 제거
            if (p.life <= 0) {
                this.container.removeChild(p.sprite);
                p.sprite.destroy();
                this.particles.splice(i, 1);
            }
        }
    }
    /**
     * 모든 파티클 제거
     */
    clear() {
        this.particles.forEach(p => {
            this.container.removeChild(p.sprite);
            p.sprite.destroy();
        });
        this.particles = [];
    }
}
/**
 * VFX 매니저 (싱글톤)
 */
class VFXManager {
    constructor() {
        this.emitter = null;
        this.container = null;
    }
    init(container) {
        this.container = container;
        this.emitter = new ParticleEmitter(container);
    }
    update() {
        this.emitter?.update();
    }
    // === 카드 효과 이펙트 ===
    /**
     * 피해 이펙트 (빨간 번쩍임 + 폭발) 💥 강화!
     */
    playDamageEffect(x, y, value) {
        if (!this.emitter)
            return;
        // 큰 빨간 충격파
        this.emitter.flash(x, y, 0xff0000, 80);
        // 주황색 내부 폭발
        this.emitter.flash(x, y, 0xff6600, 50);
        // 빨간 파티클 폭발 (3배 증가)
        const count = Math.min(60, 30 + Math.floor(value / 5));
        this.emitter.burst(x, y, count, 0xff4444, { speed: 5, size: 6, life: 35 });
        // 어두운 연기 효과
        this.emitter.burst(x, y, 15, 0x882222, { speed: 2, size: 8, life: 40 });
        // 외곽 충격파 (지연)
        setTimeout(() => {
            this.emitter?.burst(x, y, 20, 0xff8888, { speed: 6, size: 4, life: 25 });
        }, 50);
    }
    /**
     * 회복 이펙트 (초록 반짝임 + 상승) ✨ 강화!
     */
    playHealEffect(x, y, value) {
        if (!this.emitter)
            return;
        // 황금빛 중심 섬광
        this.emitter.flash(x, y, 0xffff00, 70);
        // 초록 외곽 섬광
        this.emitter.flash(x, y, 0x00ff00, 90);
        // 황금 반짝이 상승 (별처럼)
        const count = Math.min(40, 20 + Math.floor(value / 5));
        this.emitter.rise(x, y, count, 0xffff44, { speed: 2, size: 7, life: 50 });
        // 초록 치유 오라
        this.emitter.rise(x, y, count, 0x44ff44, { speed: 1.8, size: 6, life: 45 });
        // 에메랄드 파티클 상승 (지연)
        setTimeout(() => {
            this.emitter?.rise(x, y, 15, 0x00ffaa, { speed: 2.5, size: 5, life: 40 });
        }, 100);
    }
    /**
     * 보호막 이펙트 (파란 폭발) 🛡️ 강화!
     */
    playShieldEffect(x, y) {
        if (!this.emitter)
            return;
        // 밝은 청록 중심
        this.emitter.flash(x, y, 0x00ffff, 100);
        // 파란 외곽 링
        this.emitter.flash(x, y, 0x4444ff, 80);
        // 청록 파티클 폭발
        this.emitter.burst(x, y, 40, 0x66bbff, { speed: 4, size: 7, life: 40 });
        // 하늘색 빙결 파티클
        this.emitter.burst(x, y, 25, 0xaaeeff, { speed: 3, size: 5, life: 35 });
        // 방어막 링 확장 (3단계)
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                this.emitter?.burst(x, y, 20, 0x88ddff, { speed: 2 + i, size: 4, life: 30 });
            }, i * 100);
        }
    }
    /**
     * 에너지 획득 이펙트 (노란 번쩍임) ⚡ 강화!
     */
    playEnergyEffect(x, y) {
        if (!this.emitter)
            return;
        // 밝은 노란 섬광
        this.emitter.flash(x, y, 0xffff00, 80);
        // 황금 빛줄기 상승
        this.emitter.rise(x, y, 30, 0xffdd44, { speed: 2.5, size: 7, life: 50 });
        // 주황 에너지 상승
        this.emitter.rise(x, y, 20, 0xffaa00, { speed: 2, size: 6, life: 45 });
        // 하얀 섬광 파티클
        this.emitter.burst(x, y, 15, 0xffffaa, { speed: 3, size: 5, life: 35 });
    }
    /**
     * 드로우 이펙트 (청록 번쩍임) 🃏 강화!
     */
    playDrawEffect(x, y) {
        if (!this.emitter)
            return;
        // 밝은 청록 섬광
        this.emitter.flash(x, y, 0x00ffff, 70);
        // 청록 분사 (위로)
        this.emitter.spray(x, y, 35, -Math.PI / 2, Math.PI / 3, 0x44dddd, { speed: 4, size: 6, life: 40 });
        // 하늘색 파티클
        this.emitter.spray(x, y, 25, -Math.PI / 2, Math.PI / 3, 0x88eeff, { speed: 3.5, size: 5, life: 35 });
        // 반짝임 효과
        this.emitter.burst(x, y, 15, 0xaaffff, { speed: 2, size: 4, life: 30 });
    }
    // === 상태이상 이펙트 ===
    /**
     * 화상 이펙트 (불꽃) 🔥 강화!
     */
    playBurnEffect(x, y) {
        if (!this.emitter)
            return;
        // 폭발적인 불꽃
        this.emitter.flash(x, y, 0xff6600, 60);
        // 진한 빨간 불꽃 상승
        this.emitter.rise(x, y, 25, 0xff3300, { speed: 2.5, size: 8, life: 45 });
        // 주황 불꽃 상승
        this.emitter.rise(x, y, 20, 0xff6600, { speed: 2, size: 7, life: 40 });
        // 노란 불꽃 상승 (가장 밝음)
        this.emitter.rise(x, y, 15, 0xffaa00, { speed: 1.8, size: 6, life: 35 });
        // 검은 연기 효과
        setTimeout(() => {
            this.emitter?.rise(x, y, 10, 0x442222, { speed: 1.2, size: 10, life: 50 });
        }, 100);
    }
    /**
     * 빙결 이펙트 (얼음 조각) ❄️ 강화!
     */
    playFreezeEffect(x, y) {
        if (!this.emitter)
            return;
        // 밝은 하얀 섬광
        this.emitter.flash(x, y, 0xffffff, 70);
        // 청록 얼음 섬광
        this.emitter.flash(x, y, 0xaaeeff, 90);
        // 얼음 조각 폭발
        this.emitter.burst(x, y, 35, 0x88ddff, { speed: 4, size: 6, life: 50 });
        // 하늘색 서리 파티클
        this.emitter.burst(x, y, 30, 0xccffff, { speed: 3, size: 5, life: 45 });
        // 파란 얼음 결정
        this.emitter.burst(x, y, 20, 0x4488ff, { speed: 2, size: 7, life: 40 });
        // 눈송이 낙하
        setTimeout(() => {
            this.emitter?.rain(x, y, 15, 0xeeffff, { width: 80, speed: 1.5, size: 4, life: 55 });
        }, 100);
    }
    /**
     * 감전 이펙트 (번개) ⚡ 강화!
     */
    playShockEffect(x, y) {
        if (!this.emitter)
            return;
        // 강렬한 흰색 섬광
        this.emitter.flash(x, y, 0xffffff, 90);
        // 노란 전기 섬광
        this.emitter.flash(x, y, 0xffff00, 70);
        // 전기 스파크 폭발 (빠르고 밝게)
        this.emitter.burst(x, y, 50, 0xffff44, { speed: 8, size: 4, life: 20 });
        // 파란 전기 아크
        this.emitter.burst(x, y, 30, 0x88ffff, { speed: 6, size: 3, life: 18 });
        // 보라색 번개 (지연)
        setTimeout(() => {
            this.emitter?.burst(x, y, 20, 0xaa88ff, { speed: 7, size: 3, life: 15 });
        }, 50);
        // 추가 전기 펄스
        setTimeout(() => {
            this.emitter?.flash(x, y, 0xffff44, 50);
            this.emitter?.burst(x, y, 15, 0xffffaa, { speed: 5, size: 2, life: 12 });
        }, 120);
    }
    /**
     * 취약 이펙트 (보라색 오라) 💀 강화!
     */
    playVulnerableEffect(x, y) {
        if (!this.emitter)
            return;
        // 어두운 보라 섬광
        this.emitter.flash(x, y, 0x8800aa, 80);
        // 보라색 독 오라
        this.emitter.flash(x, y, 0xaa44aa, 60);
        // 진한 보라 파티클 폭발
        this.emitter.burst(x, y, 30, 0xdd66dd, { speed: 3, size: 7, life: 45 });
        // 분홍 독 파티클
        this.emitter.burst(x, y, 20, 0xff88ff, { speed: 2, size: 6, life: 40 });
        // 어두운 보라 연기
        setTimeout(() => {
            this.emitter?.rise(x, y, 15, 0x662288, { speed: 1.5, size: 8, life: 50 });
        }, 100);
    }
    /**
     * 버프 이펙트 (금색 반짝임) ⭐ 강화!
     */
    playBuffEffect(x, y) {
        if (!this.emitter)
            return;
        // 밝은 흰색 섬광
        this.emitter.flash(x, y, 0xffffff, 90);
        // 황금 섬광
        this.emitter.flash(x, y, 0xffd700, 70);
        // 황금 별 상승
        this.emitter.rise(x, y, 40, 0xffee44, { speed: 2.5, size: 8, life: 50 });
        // 주황 반짝임
        this.emitter.rise(x, y, 30, 0xffaa00, { speed: 2, size: 7, life: 45 });
        // 노란 빛 폭발
        this.emitter.burst(x, y, 20, 0xffffaa, { speed: 3, size: 6, life: 40 });
    }
    // === 게임 상태 이펙트 ===
    /**
     * 승리 이펙트 (금색 불꽃놀이) 🎉 강화!
     */
    playVictoryEffect(x, y) {
        if (!this.emitter)
            return;
        // 거대한 황금 폭발
        this.emitter.flash(x, y, 0xffffff, 120);
        this.emitter.flash(x, y, 0xffd700, 100);
        this.emitter.burst(x, y, 60, 0xffd700, { speed: 6, size: 10, life: 60 });
        // 2단계: 주황/빨강 폭발
        setTimeout(() => {
            this.emitter?.flash(x, y - 50, 0xff6600, 80);
            this.emitter?.burst(x, y - 50, 40, 0xff6600, { speed: 5, size: 8, life: 50 });
            this.emitter?.burst(x + 50, y, 30, 0xff4444, { speed: 4, size: 7, life: 45 });
        }, 200);
        // 3단계: 초록/파랑 폭발
        setTimeout(() => {
            this.emitter?.flash(x, y + 50, 0x44ff44, 80);
            this.emitter?.burst(x, y + 50, 40, 0x44ff44, { speed: 5, size: 8, life: 50 });
            this.emitter?.burst(x - 50, y, 30, 0x4444ff, { speed: 4, size: 7, life: 45 });
        }, 400);
        // 4단계: 무지개 별 폭발
        setTimeout(() => {
            this.emitter?.burst(x, y, 50, 0xffffff, { speed: 7, size: 6, life: 55 });
        }, 600);
    }
    /**
     * 패배 이펙트 (회색 낙하) 💀 강화!
     */
    playDefeatEffect(x, y) {
        if (!this.emitter)
            return;
        // 어두운 섬광
        this.emitter.flash(x, y, 0x000000, 100);
        this.emitter.flash(x, y, 0x444444, 80);
        // 회색 재 낙하
        this.emitter.rain(x, y, 50, 0x666666, { width: 200, speed: 2, size: 6, life: 80 });
        // 어두운 연기 상승
        this.emitter.rise(x, y, 30, 0x333333, { speed: 1, size: 10, life: 70 });
        // 검은 파티클 폭발
        this.emitter.burst(x, y, 25, 0x222222, { speed: 3, size: 8, life: 60 });
    }
    /**
     * 카드 사용 트레일 (궤적) ✨ 강화!
     */
    playCardTrailEffect(x, y, color) {
        if (!this.emitter)
            return;
        // 밝은 섬광
        this.emitter.flash(x, y, color, 60);
        // 메인 색상 분사
        this.emitter.spray(x, y, 25, Math.PI / 2, Math.PI / 2, color, { speed: 3, size: 6, life: 35 });
        // 밝은 색상 분사
        const brightColor = color | 0x888888; // 밝게
        this.emitter.spray(x, y, 15, Math.PI / 2, Math.PI / 3, brightColor, { speed: 2.5, size: 5, life: 30 });
        // 반짝임 폭발
        this.emitter.burst(x, y, 10, 0xffffff, { speed: 2, size: 4, life: 25 });
    }
    clear() {
        this.emitter?.clear();
    }
}
// 싱글톤 인스턴스
export const vfxManager = new VFXManager();
