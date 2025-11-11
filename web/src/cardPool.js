import { Container, Sprite, Text, Graphics } from 'pixi.js';
class CardPool {
    constructor() {
        this.pool = [];
        this.poolSize = 0;
    }
    /**
     * 카드 컨테이너 생성 (새로 만들거나 풀에서 재사용)
     */
    acquire(cardWidth, cardHeight) {
        // 사용 가능한 카드 찾기
        let pooledCard = this.pool.find(c => !c.inUse);
        if (!pooledCard) {
            // 새로 생성
            const container = new Container();
            const sprite = new Graphics(); // Placeholder (sprite로 교체됨)
            const costText = new Container(); // 코스트 (배경 원 + 텍스트)
            const typeIcon = new Container(); // 타입 아이콘 (배경 원 + 심볼)
            const nameText = new Text({
                text: '',
                style: {
                    fontSize: 11,
                    fill: 0xFFFFFF,
                    wordWrap: true,
                    wordWrapWidth: cardWidth - 10,
                    align: 'center'
                }
            });
            nameText.anchor.set(0.5, 0);
            typeIcon.x = 15;
            typeIcon.y = 15;
            container.addChild(sprite);
            container.addChild(typeIcon);
            container.addChild(costText);
            container.addChild(nameText);
            pooledCard = { container, sprite, costText, typeIcon, nameText, inUse: false };
            this.pool.push(pooledCard);
            this.poolSize++;
        }
        pooledCard.inUse = true;
        return pooledCard;
    }
    /**
     * 카드 반환 (풀로 되돌림)
     */
    release(pooledCard) {
        pooledCard.inUse = false;
        pooledCard.container.visible = false;
        // 이벤트 리스너 제거
        pooledCard.container.removeAllListeners();
    }
    /**
     * 모든 사용 중인 카드 반환
     */
    releaseAll() {
        this.pool.forEach(card => {
            if (card.inUse) {
                this.release(card);
            }
        });
    }
    /**
     * 풀 통계
     */
    getStats() {
        return {
            total: this.poolSize,
            inUse: this.pool.filter(c => c.inUse).length,
            available: this.pool.filter(c => !c.inUse).length,
        };
    }
    /**
     * 스프라이트 교체 (Graphics → Sprite or vice versa)
     */
    replaceSprite(pooledCard, newSprite) {
        const container = pooledCard.container;
        const oldSprite = pooledCard.sprite;
        // 기존 스프라이트 제거 (메모리 해제)
        if (oldSprite && oldSprite.parent) {
            container.removeChild(oldSprite);
        }
        // 새 스프라이트 기본 상태 초기화 (크기 제외)
        newSprite.x = 0;
        newSprite.y = 0;
        newSprite.alpha = 1.0;
        newSprite.tint = 0xFFFFFF;
        newSprite.rotation = 0;
        // ⚠️ scale은 초기화하지 않음 - width/height 설정이 먼저 적용되어야 함
        // 새 스프라이트 추가 (첫 번째 자식으로)
        container.addChildAt(newSprite, 0);
        pooledCard.sprite = newSprite;
    }
    /**
     * 타입 아이콘 설정 (배경 원 + 심볼)
     */
    setupTypeIcon(pooledCard, backgroundColor, iconPath) {
        const container = pooledCard.container;
        const oldIcon = pooledCard.typeIcon;
        // 기존 아이콘 제거 (메모리 해제)
        if (oldIcon && oldIcon.parent) {
            container.removeChild(oldIcon);
        }
        // 새 Container 생성
        const typeIcon = new Container();
        typeIcon.x = 15;
        typeIcon.y = 15;
        // 배경 원 그리기
        const circle = new Graphics();
        circle.circle(0, 0, 14);
        circle.fill({ color: backgroundColor, alpha: 1.0 });
        typeIcon.addChild(circle);
        // 심볼 스프라이트 추가
        const iconSprite = Sprite.from(iconPath);
        iconSprite.width = 18;
        iconSprite.height = 18;
        iconSprite.anchor.set(0.5);
        iconSprite.x = 0;
        iconSprite.y = 0;
        iconSprite.tint = 0xFFFFFF; // 흰색으로 고정
        typeIcon.addChild(iconSprite);
        // 새 아이콘 추가 (position 2 = typeIcon 위치)
        container.addChildAt(typeIcon, 2);
        pooledCard.typeIcon = typeIcon;
    }
    /**
     * 코스트 텍스트 설정 (배경 원 + 텍스트)
     */
    setupCostText(pooledCard, cost, cardWidth, isAffordable) {
        const container = pooledCard.container;
        const oldCostText = pooledCard.costText;
        // 기존 코스트 텍스트 제거
        if (oldCostText && oldCostText.parent) {
            container.removeChild(oldCostText);
        }
        // 새 Container 생성
        const costText = new Container();
        costText.x = cardWidth - 15;
        costText.y = 15;
        // 배경 원 그리기 (검은색)
        const circle = new Graphics();
        circle.circle(0, 0, 12);
        circle.fill({ color: 0x000000, alpha: 0.8 });
        costText.addChild(circle);
        // 텍스트 추가
        const text = new Text({
            text: `${cost}`,
            style: {
                fontSize: 20,
                fontWeight: 'bold',
                fill: isAffordable ? 0xFFFFFF : 0xFF0000,
            }
        });
        text.anchor.set(0.5);
        text.x = 0;
        text.y = 0;
        costText.addChild(text);
        // 새 코스트 텍스트 추가 (position 3 = costText 위치)
        container.addChildAt(costText, 3);
        pooledCard.costText = costText;
    }
}
// 플레이어 핸드용 풀
export const playerHandPool = new CardPool();
// 적 핸드용 풀
export const enemyHandPool = new CardPool();
