import type { CampaignStage, DialogueLine } from '../types/campaign';

export const campaignStageData = [
    {
      id: 1, name: '새벽의 회귀', theme: 'Neutral', recommendedPower: 100,
      firstReward: { gold: 200, shards: 2 }, repeatReward: { gold: 100, shards: 1 }, cleared: false,
      story: {
        description: '벨몬트 저택의 새벽, 회귀한 세라피나가 루시안과 미라 앞에서 덱을 재정비하며 새로운 다짐을 세운다.',
        backgroundImage: 'backgrounds/stage_01_training_1.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/lucian_rosegarden.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Seraphina',
            text: '(속삭임) 다시... 돌아왔다.',
            emotion: 'normal',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Mira',
            text: '아가씨? 악몽이라도 보셨어요?',
            emotion: 'sad',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Seraphina',
            text: '괜찮아, 미라. 이번에는 더 좋아. [빛 카드: 미세 점등]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Mira',
            text: '손등 문양이... 살아나요.',
            emotion: 'surprised',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Seraphina',
            text: '내 마력 회로가 깨어났다는 신호야. 오늘부터 규칙을 다시 세울 거야.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '은빛 새벽에 계획을 세우는 자가 결국 이긴다. 네 말이었지, 세라피나.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '초심자 덱은 핵 카드를 유지하고, 보조 슬롯은 증언 봉인, 정서 정렬, 문양 봉합으로 바꿔.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '전생의 약혼 서약은 어떻게 할 건가요?',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '내가 끊어. 내 흐름은 내가 지킨다. [어둠 카드: 기억 봉인]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Mira',
            text: '두려우시면...',
            emotion: 'sad',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Seraphina',
            text: '두려움은 남겨둬야 해. 경계가 되어주니까.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '덱 이름은 정했습니까?',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '이 덱의 이름은 해일. 작은 물결부터 모아 큰 파동을 만든다.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Seraphina',
            text: '마력 충전 두 번, 진실 시전 한 번. 첫 다짐은 나 자신에게.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '그럼 훈련장으로 가시죠.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          }
        ],
        postVictory: [
          {
            speaker: 'Lucian',
            text: '회로 안정 확인. 첫 실험 성공이야, 세라피나.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Mira',
            text: '카드 문양이 맑아요... 정말 살아난 것 같아요!',
            emotion: 'happy',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Seraphina',
            text: '(조용히) 회귀의 시작은 복수가 아니라 균형이야.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '맞아. 이제 네 마력은 널 단죄하던 세계를 바꾸기 시작했어.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '오늘의 새벽은, 나의 첫 승리야.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postDefeat: [
          {
            speaker: 'Lucian',
            text: '처음에는 누구나 발이 꼬이곤 합니다. 어디에서 리듬이 흐트러졌는지 확인해 봅시다.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '카드를 던지는 타이밍을 서두르다가 순서를 놓쳤어. 다음에는 호흡을 길게 잡을게.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '방금 전투를 차근차근 복기하면 금세 안정을 되찾을 거예요.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '실수를 바로잡을 수 있다면 몇 번이고 다시 도전할 수 있어.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '언제든 제가 곁에서 리듬을 맞춰드리겠습니다. 다시 호흡을 가다듬고 도전해 봅시다.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          }
        ]
      }
    },
    {
      id: 2, name: '안개 시험', theme: 'Fog', recommendedPower: 120,
      firstReward: { gold: 0, shards: 2 }, repeatReward: { gold: 0, shards: 2 }, cleared: false,
      story: {
        description: '벨몬트 안개 훈련장에서 세라피나가 루시안, 가렌, 마르쿠스와 함께 속성 전환을 조율하며 경계심과 믿음을 다듬는다.',
        backgroundImage: 'backgrounds/stage_01_training_2.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/garen_stone.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Lucian',
            text: '안개는 기억을 흐린다. 흐리면... 넘겨짚게 되지.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '(호흡을 고르며) 그러니 먼저 가른다. [바람 카드: 기류 탐지]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Mira',
            text: '앞머리가... 살짝 흔들려요.',
            emotion: 'surprised',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Seraphina',
            text: '바람, 불, 얼음으로 삼연계를 돌려. 기회, 증폭, 결말. 시작한다.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Seraphina',
            text: '[바람 카드: 길 트기] [불 카드: 열기 상승] [얼음 카드: 서리 정밀]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Garen',
            text: '그녀의 박자, 전과 다르다.',
            emotion: 'surprised',
            characterImage: 'characters/garen_stone.png',
          },
          {
            speaker: 'Marcus',
            text: '초침처럼 정확해.',
            emotion: 'normal',
            characterImage: 'characters/marcus_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '속성 피로가 쌓이기 전에 전환. 대지로 식혀.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '[대지 카드: 맥박 안정] 좋아. 안개 너머 함정 문양 해제 완료.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Garen',
            text: '보호는 이제 과잉이겠군.',
            emotion: 'normal',
            characterImage: 'characters/garen_stone.png',
          },
          {
            speaker: 'Seraphina',
            text: '보호는 필요해. 방식만 바뀐 거야. 함께 서요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Marcus',
            text: '그 말, 작전 명단에 기록하지.',
            emotion: 'happy',
            characterImage: 'characters/marcus_belmont.png',
          },
          {
            speaker: 'Mira',
            text: '(작게 환호) 해냈어요, 아가씨!',
            emotion: 'happy',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Seraphina',
            text: '다음은 화산 지대. 열과 두려움을 대비로 바꾸자.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postVictory: [
          {
            speaker: 'Garen',
            text: '(검을 거두며) 완벽했다. 안개가 아니라 마음을 걷어냈군.',
            emotion: 'happy',
            characterImage: 'characters/garen_stone.png',
          },
          {
            speaker: 'Lucian',
            text: '속성 피로 해제 완료. 감정 흐름은 맑습니다.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Mira',
            text: '이제 정말 자신을 믿으실 수 있겠죠?',
            emotion: 'happy',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Seraphina',
            text: '믿음은 늘 불안과 함께 오지만, 오늘은 믿어볼게.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Garen',
            text: '훈련 완료. 안개 시험 합격이다.',
            emotion: 'happy',
            characterImage: 'characters/garen_stone.png',
          },
          {
            speaker: 'Seraphina',
            text: '두려움을 걷어내면 안개 속에도 길이 있다.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postDefeat: [
          {
            speaker: 'Garen',
            text: '괜찮나? 바람이 마음대로 불어서 놀랐지? 처음엔 누구나 흔들린다.',
            emotion: 'normal',
            characterImage: 'characters/garen_stone.png',
          },
          {
            speaker: 'Seraphina',
            text: '몸이 가벼워지는 걸 즐기다가 중심을 잃었어. 다시 자세를 다듬어야겠어.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Mira',
            text: '제가 옆에서 바람을 잡아드릴게요!',
            emotion: 'happy',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Garen',
            text: '무릎을 굽히고 손바닥으로 기류를 느껴라. 균형을 잡으면 폭풍도 길들인다.',
            emotion: 'determined',
            characterImage: 'characters/garen_stone.png',
          },
          {
            speaker: 'Seraphina',
            text: '다시 리듬을 맞춰서 돌아올게. 도와줘서 고마워.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ]
      }
    },
    {
      id: 3, name: '불의 예고', theme: 'Fire', recommendedPower: 140,
      firstReward: { gold: 250, shards: 3 }, repeatReward: { gold: 120, shards: 2 }, cleared: false,
      story: {
        description: '화산 훈련장에서 세라피나가 과거의 기억을 도구로 삼아 열기를 제압하며 대비를 다듬는다.',
        backgroundImage: 'backgrounds/stage_02_fire_1.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/ariana_drake.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Seraphina',
            text: '(손끝이 떨리며) 이 열기, 그날의 재판장을 떠올리게 해.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '기억을 도구로 써. [얼음 카드: 감정 냉각]',
            emotion: 'determined',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '불로 의지를 세우고, 바람으로 분산하고, 얼음으로 봉인한다.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Seraphina',
            text: '[불 카드: 결단 점화] [바람 카드: 기류 분산] [얼음 카드: 봉인 정밀]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: '기사단원',
            text: '용암 기류가... 잠잠해진다?',
            emotion: 'surprised',
          },
          {
            speaker: '기사단원',
            text: '속도와 판단이 맞물렸어. 번개 적성도 있겠는걸.',
            emotion: 'surprised',
          },
          {
            speaker: 'Lucian',
            text: '화산 에센스 봉인 카드다. 필요할 때만 개방해.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '과열 방지 장치와 쌍으로 묶어둘게. [보조 카드: 문양 봉합 연동]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Mira',
            text: '손끝, 괜찮으세요?',
            emotion: 'sad',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Seraphina',
            text: '남아 있는 떨림은 경고야. 기록해. 오버체인은 금지, 속성 피로를 풀고 재시전한다.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Garen',
            text: '이번엔 불길을 등지지 않았군. 정면으로 다뤘어.',
            emotion: 'happy',
            characterImage: 'characters/garen_stone.png',
          },
          {
            speaker: 'Seraphina',
            text: '두려움은 대비로 바꾸면 내 편이 되니까.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postVictory: [
          {
            speaker: 'Lucian',
            text: '마력 게이지 안정. 과열 없음.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Garen',
            text: '(웃으며) 이번엔 네가 불을 지배했군.',
            emotion: 'happy',
            characterImage: 'characters/garen_stone.png',
          },
          {
            speaker: '기사단원',
            text: '전생의 악역이 아니라 전장의 조율자 같았습니다.',
            emotion: 'happy',
          },
          {
            speaker: 'Seraphina',
            text: '(불빛을 바라보며) 불은 언제나 나를 삼키려 했지. 이제는 내가 다뤄서 세상을 비출 거야.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '그게 진짜 회귀자의 불꽃이지.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          }
        ],
        postDefeat: [
          {
            speaker: 'Lucian',
            text: '과열을 허용하면 감정이 타버립니다. 냉각 루틴부터 다시 정리합시다.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '열기를 견디지 못했어. 기억이 흔들리면 손이 따라주지 않네.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Mira',
            text: '초기화 장치를 준비할게요. 다시 시도해요!',
            emotion: 'happy',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Garen',
            text: '불을 등지지 말고 정면으로 바라봐라. 공기의 흐름을 먼저 읽어라.',
            emotion: 'determined',
            characterImage: 'characters/garen_stone.png',
          },
          {
            speaker: 'Seraphina',
            text: '경고 고마워. 과열 장치를 점검하고 다시 돌아올게.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ]
      }
    },
    {
      id: 4, name: '얼음의 이름', theme: 'Ice', recommendedPower: 160,
      firstReward: { gold: 0, shards: 2 }, repeatReward: { gold: 0, shards: 2 }, cleared: false,
      story: {
        description: '윈터스 가의 빙결 성채에서 세라피나와 세라핀 윈터스가 투명한 체인을 맺으며 신뢰를 서약한다.',
        backgroundImage: 'backgrounds/stage_03_ice_1.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/seraphine_winters.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Seraphine Winters',
            text: '벨몬트의 문이 여기까지 닿다니. 무슨 일이지?',
            emotion: 'normal',
            characterImage: 'characters/seraphine_winters.png',
          },
          {
            speaker: 'Seraphina',
            text: '이번 생엔 서로를 믿고 싶어. 증거로 말할게. [빛 카드: 진실 비춤] [얼음 카드: 투명 서명]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Seraphine Winters',
            text: '진실 문양이... 탁하지 않아.',
            emotion: 'surprised',
            characterImage: 'characters/seraphine_winters.png',
          },
          {
            speaker: 'Mira',
            text: '(작게) 아가씨의 감정이 맑을수록 문양이 곧게 열려요.',
            emotion: 'happy',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Seraphina',
            text: '정보 공유 체인을 제안할게. 우리만의 차가운 통로야.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Seraphine Winters',
            text: '조건은 간단하다. 거짓을 쓰면 균열이 난다.',
            emotion: 'normal',
            characterImage: 'characters/seraphine_winters.png',
          },
          {
            speaker: 'Seraphina',
            text: '좋아. 그 규칙이 오히려 좋아. 손을 내민다.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Seraphine Winters',
            text: '(손을 맞잡으며) 얼음은 차갑지만 깨끗해. 그 위에 꽃이 피지.',
            emotion: 'happy',
            characterImage: 'characters/seraphine_winters.png',
          },
          {
            speaker: 'Seraphina',
            text: '그 꽃을 음모의 조각 위에 얹자. 블랙우드를 추적하려면 네 차가움이 필요해.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Seraphine Winters',
            text: '합의다, 세라피나 벨몬트.',
            emotion: 'happy',
            characterImage: 'characters/seraphine_winters.png',
          },
          {
            speaker: 'Seraphina',
            text: '고마워, 세라핀 윈터스.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postVictory: [
          {
            speaker: 'Seraphine Winters',
            text: '체인 안정. 거짓 반응 0%.',
            emotion: 'happy',
            characterImage: 'characters/seraphine_winters.png',
          },
          {
            speaker: 'Mira',
            text: '서리 문양이 꽃처럼 빛나요.',
            emotion: 'happy',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Seraphina',
            text: '진심은 온도를 바꾸지 않아도 전해지는 법이야.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Seraphine Winters',
            text: '네가 그걸 깨닫는 데 몇 생이 걸렸지?',
            emotion: 'happy',
            characterImage: 'characters/seraphine_winters.png',
          },
          {
            speaker: 'Seraphina',
            text: '단 한 번이면 충분했어.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Seraphine Winters',
            text: '이번 생에는 신뢰부터 새로 쌓자.',
            emotion: 'determined',
            characterImage: 'characters/seraphine_winters.png',
          },
          {
            speaker: 'Seraphina',
            text: '차가운 손끝에도 약속은 피어난다.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postDefeat: [
          {
            speaker: 'Seraphine Winters',
            text: '감정이 탁해졌어. 문양이 갈라졌다.',
            emotion: 'normal',
            characterImage: 'characters/seraphine_winters.png',
          },
          {
            speaker: 'Seraphina',
            text: '얼음 위에서도 마음이 흔들리면 금이 가는구나.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Mira',
            text: '다시 감정을 정리할 시간을 드릴게요.',
            emotion: 'happy',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Seraphine Winters',
            text: '차갑게 숨을 들이쉬고, 내쉬면서 진실만 남겨라.',
            emotion: 'determined',
            characterImage: 'characters/seraphine_winters.png',
          },
          {
            speaker: 'Seraphina',
            text: '차분히 정리해서 다시 오겠어.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ]
      }
    },
    {
      id: 5, name: '번개의 박자와 바람의 웃음', theme: 'Lightning', recommendedPower: 180,
      firstReward: { gold: 300, shards: 3 }, repeatReward: { gold: 150, shards: 2 }, cleared: false,
      story: {
        description: '번개 탑 회랑에서 세라피나와 레온이 거리를 둔 채 박동을 맞추며 협력의 리듬을 만든다.',
        backgroundImage: 'backgrounds/stage_04_lightning_1.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/leon_ardenia.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Leon Ardenia',
            text: '벨몬트. 지난 생의 빚을 이번 생에서 갚게 하지.',
            emotion: 'normal',
            characterImage: 'characters/leon_ardenia.png',
          },
          {
            speaker: 'Seraphina',
            text: '(고개 숙이며) 정치적 약속엔 감사해. 하지만 내 마력 흐름을 지키려면 거리가 필요해. [바람 카드: 거리 유지] [번개 카드: 박자 정렬]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Leon Ardenia',
            text: '거리를 둔다면서 동맹을 말하나?',
            emotion: 'surprised',
            characterImage: 'characters/leon_ardenia.png',
          },
          {
            speaker: 'Seraphina',
            text: '검과 카드가 부딪히지 않도록 호흡만 맞추자.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Leon Ardenia',
            text: '(검집에 손을 올리며) 솔직해서 더 낫군.',
            emotion: 'happy',
            characterImage: 'characters/leon_ardenia.png',
          },
          {
            speaker: 'Mira',
            text: '(작게) 심장 뛰는 소리가 탑과 맞춰져요.',
            emotion: 'surprised',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Seraphina',
            text: '(미라에게) 박동을 번개 박자에 싱크. 과열 금지.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Leon Ardenia',
            text: '그럼 검의 길 대신 협력의 길을 걷자.',
            emotion: 'happy',
            characterImage: 'characters/leon_ardenia.png',
          },
          {
            speaker: 'Seraphina',
            text: '(카드를 내밀며) [번개 카드: 동맹 문양 각인]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Leon Ardenia',
            text: '오늘의 결투는 미루자. 대신 증거의 결투를 준비하지.',
            emotion: 'normal',
            characterImage: 'characters/leon_ardenia.png',
          },
          {
            speaker: 'Seraphina',
            text: '(미소) 그 결투는 내가 원하는 무대야. 진실이 심판하는 무대.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postVictory: [
          {
            speaker: 'Leon Ardenia',
            text: '(검집에 검을 꽂으며) 완패는 아니겠지? 박자만큼은 맞았으니까.',
            emotion: 'happy',
            characterImage: 'characters/leon_ardenia.png',
          },
          {
            speaker: 'Seraphina',
            text: '(미소) 맞아, 이건 결투가 아니라 조율이었어.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Mira',
            text: '(웃으며) 탑의 공기가 달라졌어요.',
            emotion: 'happy',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Leon Ardenia',
            text: '(엄숙히) 오늘의 협력, 잊지 않겠다.',
            emotion: 'determined',
            characterImage: 'characters/leon_ardenia.png',
          },
          {
            speaker: 'Seraphina',
            text: '번개는 충돌하지 않아도 울리지. 그게 협력의 리듬이야.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Leon Ardenia',
            text: '서로 다른 박동이 같은 하늘을 울릴 때, 그것이 승리다.',
            emotion: 'determined',
            characterImage: 'characters/leon_ardenia.png',
          }
        ],
        postDefeat: [
          {
            speaker: 'Leon Ardenia',
            text: '박동이 흐트러졌다. 번개는 기다려주지 않는다.',
            emotion: 'normal',
            characterImage: 'characters/leon_ardenia.png',
          },
          {
            speaker: 'Seraphina',
            text: '거리를 맞추다 보니 박자를 놓쳤어.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Mira',
            text: '호흡을 다시 맞춰봐요!',
            emotion: 'happy',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Leon Ardenia',
            text: '심장 박동을 세 번 세고, 네 번째에 번개를 붙여라.',
            emotion: 'determined',
            characterImage: 'characters/leon_ardenia.png',
          },
          {
            speaker: 'Seraphina',
            text: '리듬을 새로 잡아서 돌아올게.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ]
      }
    },
    {
      id: 6, name: '열과 냉의 무게', theme: 'Balance', recommendedPower: 210,
      firstReward: { gold: 320, shards: 3 }, repeatReward: { gold: 160, shards: 2 }, cleared: false,
      story: {
        description: '벨몬트 저택 연회장에서 세라피나가 아리아나와의 대화를 균형 잡힌 감정으로 이끌며 열과 냉을 동시에 조율한다.',
        backgroundImage: 'backgrounds/stage_06_fire_ice_1.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/ariana_drake.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Seraphina',
            text: '(속으로) 여긴 전생의 무대였지. 내 오만이 시작된 곳.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Mira',
            text: '아가씨, 긴장되시죠?',
            emotion: 'sad',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Seraphina',
            text: '이번엔 감정이 아니라 균형으로 답하겠어.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Ariana',
            text: '또다시 무대의 중심에 서셨네요, 벨몬트 영애.',
            emotion: 'angry',
            characterImage: 'characters/ariana_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '중심이 아니라 균형 위에 서는 거야.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Seraphina',
            text: '[불 카드: 감정 점화] [얼음 카드: 냉정 확립]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Ariana',
            text: '불과 얼음? 상극이라 했잖아.',
            emotion: 'angry',
            characterImage: 'characters/ariana_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '상극이라서 안정돼. 감정과 진실이 서로를 지탱해. 대화, 가능할까?',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Ariana',
            text: '네 화염이 식었다면, 해보지.',
            emotion: 'normal',
            characterImage: 'characters/ariana_drake.png',
          },
          {
            speaker: 'Lucian',
            text: '전생의 열기가 아니라 조율의 불꽃... 훌륭하군.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '이번엔, 무게를 잴 줄 알게 됐으니까.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postVictory: [
          {
            speaker: 'Ariana',
            text: '이번엔 내가 졌어. 불길이 아니라 균형이라니.',
            emotion: 'sad',
            characterImage: 'characters/ariana_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '지고 이길 문제가 아니야. 오늘은 서로 다치지 않았잖아.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '감정 진폭 0, 정서 안정 100%. 완벽한 승리야.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '뜨거운 말 대신 차가운 침묵으로 평화를 얻었어. 이게 진짜 승리야.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postDefeat: [
          {
            speaker: 'Ariana',
            text: '아직 불과 얼음이 서로를 찢고 있어. 균형이 부족했어.',
            emotion: 'angry',
            characterImage: 'characters/ariana_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '감정을 제대로 다듬지 못했어. 다시 균형을 연습할게.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '열을 두 번, 냉기를 한 번 호흡해. 균형부터 다시 맞추자.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Ariana',
            text: '준비되면 다시 맞붙자. 이번엔 내가 균형을 시험할 거야.',
            emotion: 'determined',
            characterImage: 'characters/ariana_drake.png',
          }
        ]
      }
    },
    {
      id: 7, name: '폭풍 노트', theme: 'Storm', recommendedPower: 240,
      firstReward: { gold: 330, shards: 3 }, repeatReward: { gold: 170, shards: 2 }, cleared: false,
      story: {
        description: '폭풍 훈련장에서 세라피나가 기사단과 호흡을 맞추며 바람과 번개, 대지의 리듬을 하나의 합주로 엮는다.',
        backgroundImage: 'backgrounds/stage_07_storm_1.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/garen_stone.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Garen Stone',
            text: '기사단 대열, 세라피나 측에 합류!',
            emotion: 'angry',
            characterImage: 'characters/garen_stone.png',
          },
          {
            speaker: 'Seraphina',
            text: '좋아, 리듬을 잡아! [바람 카드: 기류 제어] [번개 카드: 가속 루프] [대지 카드: 방어 공명]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '폭풍 속성 3연계, 안정률 82%.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '조금 더. 이건 단순한 훈련이 아니라 신뢰의 시험이야.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Mira',
            text: '가렌님, 좌측 방패라인 불안정!',
            emotion: 'surprised',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Seraphina',
            text: '내가 막을게. [대지 카드: 보호문양 각성]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Garen Stone',
            text: '이번엔 내가 아니라 네가 우리를 지켜줬군.',
            emotion: 'happy',
            characterImage: 'characters/garen_stone.png',
          },
          {
            speaker: 'Seraphina',
            text: '신뢰의 폭풍은 함께 맞을 때 안정되지.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postVictory: [
          {
            speaker: 'Garen Stone',
            text: '훈련 종료. 대열 유지율 100%. 완벽했어.',
            emotion: 'happy',
            characterImage: 'characters/garen_stone.png',
          },
          {
            speaker: 'Seraphina',
            text: '이번 폭풍은 나 혼자 이긴 게 아니야.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '집단 공명 성공. 전생엔 없던 데이터야.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Mira',
            text: '폭풍이 잦아드니까 하늘이 맑아요.',
            emotion: 'happy',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Seraphina',
            text: '폭풍이 지나가면 남는 건 믿음뿐이야.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postDefeat: [
          {
            speaker: 'Garen Stone',
            text: '대열이 흔들렸다. 중심을 놓치면 폭풍에 휩쓸린다.',
            emotion: 'angry',
            characterImage: 'characters/garen_stone.png',
          },
          {
            speaker: 'Seraphina',
            text: '폭풍을 버티지 못했어. 내가 리듬을 흘렸나 봐.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Mira',
            text: '다시 불러볼게요. 바람이 우리 편이 되도록!',
            emotion: 'happy',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Lucian',
            text: '공명 수치를 조정하자. 호흡을 맞추고 다시 연결해.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '응, 폭풍과 다시 친구가 되어올게.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ]
      }
    },
    {
      id: 8, name: '어둠의 복도', theme: 'Shadow', recommendedPower: 280,
      firstReward: { gold: 340, shards: 3 }, repeatReward: { gold: 170, shards: 2 }, cleared: false,
      story: {
        description: '벨몬트 지하 서고에서 세라피나가 숨겨진 문양과 기록을 밝혀내며 과거의 단죄 진실을 손에 넣는다.',
        backgroundImage: 'backgrounds/stage_09_corridor_1.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/darius_blackwood.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Seraphina',
            text: '(촛불을 들며) 여긴... 한 번도 온 적 없는 곳이야.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '전생엔 네가 여길 두려워했지.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '이번엔 빛을 두려워하지 않아. [빛 카드: 조사] [어둠 카드: 흔적 추적]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Mira',
            text: '문양이 반응해요! 이건... 블랙우드의 인장이에요!',
            emotion: 'surprised',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Seraphina',
            text: '그렇다면 진실을 꺼내자. [감정 역추적 카드 발동]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '전생의 단죄 명령서... 원본이다.',
            emotion: 'surprised',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '(손을 움켜쥔다) 이걸로 모든 걸 다시 쓸 수 있어.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postVictory: [
          {
            speaker: 'Lucian',
            text: '증거 확보 완료. 네 손으로 진실을 밝혔어.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '어둠은 무섭지 않아. 이제 나는 그 언어를 읽을 수 있어.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Mira',
            text: '그럼 전생의 단죄도 오늘로 끝이겠네요.',
            emotion: 'happy',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Seraphina',
            text: '그래. 이번엔 진실이 판결을 내릴 차례야.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postDefeat: [
          {
            speaker: 'Lucian',
            text: '문양이 닫혔어. 감정이 흔들리면 길이 숨는다.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '빛을 두려워하지 않겠다면서... 아직 흔들리는구나.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Mira',
            text: '천천히 다시 해봐요. 촛불부터 높이 들게요.',
            emotion: 'happy',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Seraphina',
            text: '그래. 감정을 다시 정리해서 진실을 찾아올게.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ]
      }
    },
    {
      id: 9, name: '정원의 약속', theme: 'Garden', recommendedPower: 320,
      firstReward: { gold: 360, shards: 4 }, repeatReward: { gold: 180, shards: 2 }, cleared: false,
      story: {
        description: '벨몬트 정원에서 세라피나와 카이가 정직한 약속을 나누며 신뢰를 새롭게 재정의한다.',
        backgroundImage: 'backgrounds/stage_29_wind_final.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/kai_drake.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Seraphina',
            text: '(손바닥에 흙을 쥐며) 여긴... 마지막으로 웃던 곳이야.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Mira',
            text: '정원이 다시 살아났어요.',
            emotion: 'happy',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Seraphina',
            text: '[빛 카드: 성장 자극] [대지 카드: 영양 순환]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Kai Drake',
            text: '정원에서 다시 만나게 될 줄이야.',
            emotion: 'happy',
            characterImage: 'characters/kai_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '이번엔 거래보다 신뢰로 시작하고 싶어.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Kai Drake',
            text: '정략이 아닌 협력이라... 흥미롭군.',
            emotion: 'normal',
            characterImage: 'characters/kai_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '그리고 정직으로 끝내고 싶어. [정원 카드: 서명 문양 활성화]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Kai Drake',
            text: '정직한 약속이라... 쉽지 않겠지만 아름답군.',
            emotion: 'happy',
            characterImage: 'characters/kai_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '아름답기에 위험하지. 하지만 그게 나의 길이야.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postVictory: [
          {
            speaker: 'Kai Drake',
            text: '정원에 남은 건 향기와 신뢰뿐이군.',
            emotion: 'happy',
            characterImage: 'characters/kai_drake.png',
          },
          {
            speaker: 'Mira',
            text: '감정 안정 수치, 완벽해요!',
            emotion: 'happy',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Seraphina',
            text: '사랑보다 깊은 게 있다면 아마도 믿음일 거야.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Kai Drake',
            text: '오늘의 약속은 내일의 동맹보다 값지다.',
            emotion: 'determined',
            characterImage: 'characters/kai_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '이건 단순한 회복이 아니라 시작이야.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postDefeat: [
          {
            speaker: 'Kai Drake',
            text: '아직 마음이 흔들린다. 정직한 약속을 준비해와.',
            emotion: 'normal',
            characterImage: 'characters/kai_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '정원의 향기에 취해 집중을 놓쳤어. 다시 차분히 준비할게.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Mira',
            text: '정원 기록을 정리해둘게요. 다음엔 더 안정적으로 시작해요!',
            emotion: 'happy',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Seraphina',
            text: '그래. 신뢰를 제대로 만들고 돌아올게.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ]
      }
    },
    {
      id: 10, name: '중급의 문', theme: 'Trial', recommendedPower: 200,
      firstReward: { gold: 380, shards: 4 }, repeatReward: { gold: 190, shards: 2 }, cleared: false,
      story: {
        description: '왕립 시험장에서 세라피나가 연동 제한 속에서도 침착하게 검증을 통과하며 책임의 무게를 받아든다.',
        backgroundImage: 'backgrounds/stage_11_training_advanced.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/marcus_belmont.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Lucian',
            text: '규정 확인. 연동 제한 10장.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '전생엔 자만했지. 이번엔 철저하게 검증받을 거야.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Seraphina',
            text: '[불 카드: 긴장 완화] [바람 카드: 순응 회로 정렬] [빛 카드: 집중 강화]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Examiner',
            text: '마력 흐름 안정 확인. 다음 과제—위기 시뮬레이션.',
            emotion: 'normal',
          },
          {
            speaker: 'Seraphina',
            text: '준비됐어. [대지 카드: 방어막 전개] [번개 카드: 판단력 상승]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Marcus Belmont',
            text: '(감탄) 동생이 아니라 동료로서 인정해야겠군.',
            emotion: 'surprised',
            characterImage: 'characters/marcus_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '시험형 연동 체계 완성. 훌륭해.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '시험이 공포가 아니라 검증이 되는 순간을 만들 거야.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postVictory: [
          {
            speaker: 'Examiner',
            text: '만점. 완벽한 연동이었다.',
            emotion: 'happy',
          },
          {
            speaker: 'Marcus Belmont',
            text: '이제 넌 우리 중 하나야, 세라피나.',
            emotion: 'happy',
            characterImage: 'characters/marcus_belmont.png',
          },
          {
            speaker: 'Mira',
            text: '드디어 정규 작전 명단이에요!',
            emotion: 'happy',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Seraphina',
            text: '이번엔 자격이 아니라 책임으로 오른 자리야.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '검증을 통과한 자는 두 번 쓰러지지 않는다.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '이 문을 통과한 이상, 다시는 뒤돌아가지 않겠어.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postDefeat: [
          {
            speaker: 'Examiner',
            text: '연동이 끊겼다. 다시 준비하고 오도록.',
            emotion: 'normal',
          },
          {
            speaker: 'Seraphina',
            text: '집중이 흐트러지면 시험은 다시 공포가 되지... 더 준비할게.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Marcus Belmont',
            text: '실패를 기록으로 남겨라. 다음엔 그 기록이 너를 지켜줄 것이다.',
            emotion: 'determined',
            characterImage: 'characters/marcus_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '데이터를 정리해줄게. 균형을 맞춰서 다시 도전하자.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '응, 검증을 두려워하지 않도록 더 연습할게.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ]
      }
    },
    {
      id: 11, name: '불꽃과 균형', theme: 'Performance', recommendedPower: 220,
      firstReward: { gold: 400, shards: 4 }, repeatReward: { gold: 200, shards: 2 }, cleared: false,
      story: {
        description: '왕립 원소 시연장에서 세라피나가 전속성 연동을 균형 있게 조율하며 관중 앞에서 새로운 온도를 증명한다.',
        backgroundImage: 'backgrounds/stage_12_fire_master.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/elena_drake.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Seraphina',
            text: '(심호흡) 전생엔 이 무대에서 오만했지. 이번엔 마음부터 정돈해야 해.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '시연 체계 완료. 네 번째 속성 연동 준비 됐어.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '좋아. [불 카드: 집중 점화] [얼음 카드: 균형 진동] [빛 카드: 시야 정렬] [바람 카드: 마력 분산]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Elena Drake',
            text: '...저 표정, 전엔 본 적이 없었는데.',
            emotion: 'surprised',
            characterImage: 'characters/elena_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '(속삭이며) 이번 불꽃은 증명이 아니라 평정이야.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '연동 성공률 98%. 피로도 1중첩, 안정적이야!',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '불꽃이 춤추는 건 더 이상 두려움 때문이 아니야.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postVictory: [
          {
            speaker: 'Lucian',
            text: '전속성 오버체인 성공, 에너지 낭비 0%.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Elena Drake',
            text: '축하해. 이제 넌 불이 아닌 평화를 다루는 자야.',
            emotion: 'happy',
            characterImage: 'characters/elena_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '이건 전생엔 얻지 못한, 진짜 온도야.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '균형 위에서 타오르는 불은 세계를 태우지 않는다.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          }
        ],
        postDefeat: [
          {
            speaker: 'Lucian',
            text: '연동이 흔들렸어. 균형이 잡히지 않으면 폭주한다.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '불꽃이 다시 날 삼켜버렸어... 마음부터 정리해야겠어.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Elena Drake',
            text: '숨을 고르고 다시 시작해. 이번 무대는 네가 선택한 거잖아.',
            emotion: 'determined',
            characterImage: 'characters/elena_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '응, 평정부터 되찾고 돌아올게.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ]
      }
    },
    {
      id: 12, name: '땅의 마력 조율', theme: 'Earth', recommendedPower: 240,
      firstReward: { gold: 450, shards: 4 }, repeatReward: { gold: 220, shards: 2 }, cleared: false,
      story: {
        description: '기사단 훈련장에서 세라피나가 대지의 파동을 동료들과 공유하며 함께 버티는 방패를 완성한다.',
        backgroundImage: 'backgrounds/stage_16_earth_master.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/garen_stone.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Garen Stone',
            text: '오늘은 방어의 날이다. 마력의 흐름을 공유하는 걸 잊지 마.',
            emotion: 'angry',
            characterImage: 'characters/garen_stone.png',
          },
          {
            speaker: 'Seraphina',
            text: '알겠어. 이번엔 나 혼자가 아니니까.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Seraphina',
            text: '[대지 카드: 맥박 개방] [빛 카드: 팀 공명] [바람 카드: 리듬 조율]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Mira',
            text: '대지의 결이 모두 이어졌어요.',
            emotion: 'happy',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Garen Stone',
            text: '전엔 불안정하던 파동이 지금은 하나야.',
            emotion: 'happy',
            characterImage: 'characters/garen_stone.png',
          },
          {
            speaker: 'Seraphina',
            text: '마력은 나의 것이 아니라 모두의 것이니까.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Garen Stone',
            text: '오늘부로 이 방패에 네 이름을 새긴다. [대지 카드: 동료 보호 문양 각인]',
            emotion: 'happy',
            characterImage: 'characters/garen_stone.png',
          },
          {
            speaker: 'Seraphina',
            text: '그 믿음, 절대 잃지 않을게.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postVictory: [
          {
            speaker: 'Garen Stone',
            text: '방패의 색이 변했다. 이제 우리도 네 흐름 안에 있군.',
            emotion: 'happy',
            characterImage: 'characters/garen_stone.png',
          },
          {
            speaker: 'Mira',
            text: '대지 안정률 100%. 모두 살아남았어요.',
            emotion: 'happy',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Seraphina',
            text: '혼자 이기면 고독이 남지만, 함께 이기면 평화가 남아.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '오늘의 승리는 단단함의 정의를 새로 썼다.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '대지는 나를 지탱하고, 나는 모두를 지켜.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postDefeat: [
          {
            speaker: 'Garen Stone',
            text: '파동이 끊겼다. 공유를 잊으면 방패가 무너진다.',
            emotion: 'angry',
            characterImage: 'characters/garen_stone.png',
          },
          {
            speaker: 'Seraphina',
            text: '내가 모든 결을 감당하려 했어... 함께 나눠야 하는데.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Mira',
            text: '다시 연결해봐요. 우리가 옆에 있어요!',
            emotion: 'happy',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Seraphina',
            text: '응. 이번엔 처음부터 함께 호흡 맞춰 돌아올게.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ]
      }
    },
    {
      id: 13, name: '불의 도전', theme: 'Challenge', recommendedPower: 260,
      firstReward: { gold: 500, shards: 5 }, repeatReward: { gold: 250, shards: 3 }, cleared: false,
      story: {
        description: '불꽃 서클 결투장에서 세라피나가 복수 대신 치유를 선택하며 아리아나와의 관계를 다시 쌓는다.',
        backgroundImage: 'backgrounds/stage_17_fire_challenge.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/ariana_drake.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Ariana',
            text: '또 도망치진 않겠지, 세라피나 벨몬트?',
            emotion: 'angry',
            characterImage: 'characters/ariana_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '아니. 이번엔 맞서서, 다르게 끝낼 거야. [불 카드: 결의 점화] [바람 카드: 회피 궤도] [빛 카드: 치유 잔류]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Ariana',
            text: '왜 반격하지 않아?!',
            emotion: 'angry',
            characterImage: 'characters/ariana_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '증오로는 아무것도 얻지 못해. 나는 이 싸움을 이기지 않겠어. [얼음 카드: 상처 봉합]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Ariana',
            text: '치료했다고? 날 이기고 싶지 않은 거야?',
            emotion: 'surprised',
            characterImage: 'characters/ariana_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '이제 우리 둘 다 패배하지 않길 바랄 뿐이야.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postVictory: [
          {
            speaker: 'Ariana',
            text: '언제 이렇게 강해졌지, 너?',
            emotion: 'surprised',
            characterImage: 'characters/ariana_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '강함은 싸움이 아니라 선택에서 생기니까.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '분노 해제 성공. 피로도 0.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Ariana',
            text: '언젠가 진짜 친구가 될지도 모르겠네.',
            emotion: 'happy',
            characterImage: 'characters/ariana_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '불을 이겼다는 건 나 자신을 이겼다는 뜻이야.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postDefeat: [
          {
            speaker: 'Ariana',
            text: '아직도 불꽃을 증오로 쓰고 있어? 그럼 싸움은 계속 될 거야.',
            emotion: 'angry',
            characterImage: 'characters/ariana_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '미안... 다시 마음을 다잡고 올게.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Ariana',
            text: '다시 도전해. 이번엔 정말 친구가 될 기회일지도 몰라.',
            emotion: 'determined',
            characterImage: 'characters/ariana_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '그래. 선택을 바꿔서 돌아올게.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ]
      }
    },
    {
      id: 14, name: '우정의 서약', theme: 'Bond', recommendedPower: 280,
      firstReward: { gold: 550, shards: 5 }, repeatReward: { gold: 280, shards: 3 }, cleared: false,
      story: {
        description: '벨몬트 시녀실에서 세라피나가 하인들과 감정 네트워크를 공유하며 서로를 지키는 우정을 선언한다.',
        backgroundImage: 'backgrounds/stage_18_friendship.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/mira.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Seraphina',
            text: '이 작전 이후, 여러분을 방패로 쓰지 않겠습니다.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Mira',
            text: '그러면 누가 전선을 막아요?',
            emotion: 'surprised',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Seraphina',
            text: '우리가 함께 막아요. 우정으로요. [감정 공유 카드: 전체 전송] [정보 보호 카드: 봉인 설정]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Servant',
            text: '모두의 카드가 반응해요!',
            emotion: 'happy',
          },
          {
            speaker: 'Mira',
            text: '우리 이름을 카드에 새길게요. [우정 촉매 카드: 모든 이름 각인]',
            emotion: 'happy',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Seraphina',
            text: '그 말, 기억할게.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postVictory: [
          {
            speaker: 'Mira',
            text: '감정 공명률 99%. 성공이에요!',
            emotion: 'happy',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Seraphina',
            text: '내 이름보다 여러분의 이름이 더 빛나.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '정보망은 어떤 마법보다 단단하다.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '서로의 마음을 엮으면 그것이 진짜 마력이야.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Mira',
            text: '오늘의 승리는 우리 모두의 이름이었어요.',
            emotion: 'happy',
            characterImage: 'characters/mira.png',
          }
        ],
        postDefeat: [
          {
            speaker: 'Mira',
            text: '감정이 흔들렸어요. 다시 손을 잡을까요?',
            emotion: 'sad',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Seraphina',
            text: '내가 너무 앞서갔어. 함께 해야 하는데.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Servant',
            text: '다시 시도해요! 이번엔 우리가 먼저 손을 내밀게요.',
            emotion: 'happy',
          },
          {
            speaker: 'Seraphina',
            text: '응. 우정부터 다시 맞추자.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ]
      }
    },
    {
      id: 15, name: '그림자와 이름', theme: 'Revelation', recommendedPower: 300,
      firstReward: { gold: 600, shards: 5 }, repeatReward: { gold: 300, shards: 3 }, cleared: false,
      story: {
        description: '벨몬트 비밀 극장에서 세라피나가 다리우스의 음모 기록을 복원하고 엘레나와 함께 진실을 선언한다.',
        backgroundImage: 'backgrounds/stage_37_ancient.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/darius_blackwood.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Lucian',
            text: '감정 흔적 감지. 다리우스의 흔적이야.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '그 이름, 아직 남아 있었구나. [빛 카드: 진실 비춤] [어둠 카드: 그림자 기록 복원]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Elena Drake',
            text: '이건... 전생의 약혼식 전날 회의잖아.',
            emotion: 'surprised',
            characterImage: 'characters/elena_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '다리우스가 조종했어. 단죄는 조작이었어. [증언 봉인 카드: 증거 저장]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Elena Drake',
            text: '난 그때 널 믿지 못했지. 미안해.',
            emotion: 'sad',
            characterImage: 'characters/elena_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '미안함 대신 진실을 선택해줘. 그게 나의 구원이야.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postVictory: [
          {
            speaker: 'Elena Drake',
            text: '이제, 나도 네 편이야.',
            emotion: 'happy',
            characterImage: 'characters/elena_drake.png',
          },
          {
            speaker: 'Lucian',
            text: '데이터 복원 100%. 감정 왜곡 해제.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '어둠의 이름을 밝혀냈으니 이제 우리는 같은 하늘 아래야.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Elena Drake',
            text: '진실은 늦게 오지만 결코 길을 잃지 않지.',
            emotion: 'determined',
            characterImage: 'characters/elena_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '그리고 그 길 끝엔 용서가 기다리고 있어.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postDefeat: [
          {
            speaker: 'Lucian',
            text: '기록이 흐릿해졌어. 감정을 정리하지 않으면 진실이 숨는다.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '망설임이 남았어... 하지만 다시 기록을 복원할 거야.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Elena Drake',
            text: '천천히 해도 돼. 이번엔 내가 기다릴 테니.',
            emotion: 'happy',
            characterImage: 'characters/elena_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '고마워. 준비를 마치고 다시 돌아올게.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ]
      }
    },
    {
      id: 16, name: '정예의 문지기', theme: 'Elite', recommendedPower: 320,
      firstReward: { gold: 650, shards: 6 }, repeatReward: { gold: 325, shards: 3 }, cleared: false,
      story: {
        description: '왕립 정예 기사단 오디션장에서 세라피나가 전술과 진실 판별을 동시에 수행하며 정문을 두드린다.',
        backgroundImage: 'backgrounds/stage_20_elite_advanced.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/garen_stone.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Garen Stone',
            text: '정예 기사단의 문은 쉽게 열리지 않는다.',
            emotion: 'angry',
            characterImage: 'characters/garen_stone.png',
          },
          {
            speaker: 'Seraphina',
            text: '그래서 두드리러 왔죠. 이번엔 정면으로요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Seraphina',
            text: '[불 카드: 에너지 집중] [대지 카드: 충격 완화] [번개 카드: 반응 속도 강화]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Examiner A',
            text: '속도와 안정이 동시에? 흥미롭군.',
            emotion: 'surprised',
          },
          {
            speaker: 'Examiner B',
            text: '균형 감각이 탁월해. 마지막 절차로 거짓 판별을 진행한다.',
            emotion: 'normal',
          },
          {
            speaker: 'Seraphina',
            text: '[어둠 카드: 거짓 분해] 진실 외엔 통과시키지 않겠습니다.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '완벽해. 거짓 신호 제로.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Garen Stone',
            text: '통과다. 이제 문 밖이 아니라 문을 지키는 자다.',
            emotion: 'happy',
            characterImage: 'characters/garen_stone.png',
          }
        ],
        postVictory: [
          {
            speaker: 'Examiner A',
            text: '정예 배치 승인. 훌륭한 검증이었다.',
            emotion: 'happy',
          },
          {
            speaker: 'Lucian',
            text: '기록 완료. 벨몬트 세라피나, 합격.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Garen Stone',
            text: '문을 열었으니 이제 등을 맡길 수 있겠군.',
            emotion: 'happy',
            characterImage: 'characters/garen_stone.png',
          },
          {
            speaker: 'Seraphina',
            text: '지키는 건 가장 어려운 전투니까요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Mira',
            text: '문을 연 자가 세상을 바꿉니다!',
            emotion: 'happy',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Seraphina',
            text: '오늘의 승리는 문이 아니라 신뢰를 통과한 거예요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postDefeat: [
          {
            speaker: 'Examiner A',
            text: '연동이 끊겼다. 다시 준비하고 오도록.',
            emotion: 'normal',
          },
          {
            speaker: 'Seraphina',
            text: '긴장을 못 이겨 손이 떨렸어요. 기록을 정리하고 돌아올게요.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Garen Stone',
            text: '문은 준비된 자만 통과한다. 훈련을 반복해라.',
            emotion: 'angry',
            characterImage: 'characters/garen_stone.png',
          },
          {
            speaker: 'Lucian',
            text: '데이터는 남아있어. 균형을 조정하고 다시 도전하자.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '네, 다음 번엔 떨림 대신 결심을 들고 오겠습니다.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ]
      }
    },
    {
      id: 17, name: '연동 예고', theme: 'Signal', recommendedPower: 340,
      firstReward: { gold: 700, shards: 6 }, repeatReward: { gold: 350, shards: 3 }, cleared: false,
      story: {
        description: '왕립 공연장 리허설에서 세라피나가 음악과 빛에 진실을 숨겨 다가올 폭로를 예고한다.',
        backgroundImage: 'backgrounds/stage_21_fusion.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/leon_ardenia.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Lucian',
            text: '블랙우드 정보를 무대 암호로 숨긴다... 참 대담하군.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '진실은 사람들 앞에서 밝힐 때 가장 빛나니까.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Seraphina',
            text: '[빛 카드: 무대 조명 제어] [바람 카드: 음향 흐름 동기화] [번개 카드: 타이밍 보정]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Elena Drake',
            text: '리허설이라지만 긴장되네.',
            emotion: 'sad',
            characterImage: 'characters/elena_drake.png',
          },
          {
            speaker: 'Leon Ardenia',
            text: '오늘은 적이 아니라 파트너로 호흡하지.',
            emotion: 'happy',
            characterImage: 'characters/leon_ardenia.png',
          },
          {
            speaker: 'Seraphina',
            text: '좋아요. 그 말, 무대 위에서 꼭 지켜줘요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Seraphina',
            text: '이건 단순한 공연이 아니라 진실을 보낼 신호야.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postVictory: [
          {
            speaker: 'Elena Drake',
            text: '암호 해석 확인. 완벽했어요.',
            emotion: 'happy',
            characterImage: 'characters/elena_drake.png',
          },
          {
            speaker: 'Leon Ardenia',
            text: '연동 예행 연습, 전부 매끄러웠다.',
            emotion: 'happy',
            characterImage: 'characters/leon_ardenia.png',
          },
          {
            speaker: 'Lucian',
            text: '진실을 음악으로 숨기는 자... 천재군.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '음악은 진실을 가장 조용히 전하는 언어니까요.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Elena Drake',
            text: '오늘의 리허설은 내일의 폭로다.',
            emotion: 'determined',
            characterImage: 'characters/elena_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '예고는 이미 승리의 서막이었어.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postDefeat: [
          {
            speaker: 'Lucian',
            text: '조명이 흔들렸어. 암호가 노출될 뻔했다.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '내 박자가 흐트러졌어... 다시 균형을 맞출게.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Leon Ardenia',
            text: '연습이니까 괜찮다. 다음엔 내 검으로 박자를 잡아주지.',
            emotion: 'happy',
            characterImage: 'characters/leon_ardenia.png',
          },
          {
            speaker: 'Seraphina',
            text: '고마워. 진실을 숨길 악보를 다시 꿰매서 돌아올게.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ]
      }
    },
    {
      id: 18, name: '약혼자의 대련', theme: 'Dance', recommendedPower: 360,
      firstReward: { gold: 720, shards: 7 }, repeatReward: { gold: 360, shards: 4 }, cleared: false,
      story: {
        description: '궁정 무도회장에서 세라피나와 레온이 검과 카드로 화해의 춤을 추며 악몽을 음악으로 바꾼다.',
        backgroundImage: 'backgrounds/stage_39_cooperation.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/leon_ardenia.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Leon Ardenia',
            text: '이번엔 내가 단죄자가 아닌, 검무의 파트너로 서겠다.',
            emotion: 'normal',
            characterImage: 'characters/leon_ardenia.png',
          },
          {
            speaker: 'Seraphina',
            text: '검은 검답게, 카드는 카드답게 춤춰볼까요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Seraphina',
            text: '[번개 카드: 리듬 동기화] [바람 카드: 회피 궤도 조율]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '동기화율 97%. 충돌 없음.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Mira',
            text: '전생의 악몽이... 춤으로 바뀌었어요.',
            emotion: 'happy',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Leon Ardenia',
            text: '오늘은 승부가 아니라 존중이다.',
            emotion: 'happy',
            characterImage: 'characters/leon_ardenia.png',
          }
        ],
        postVictory: [
          {
            speaker: 'Leon Ardenia',
            text: '이번 무도회, 진짜 아름다웠다.',
            emotion: 'happy',
            characterImage: 'characters/leon_ardenia.png',
          },
          {
            speaker: 'Seraphina',
            text: '악몽을 무용으로 바꿀 수 있다면, 회귀도 가치가 있어요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '전생 데이터와 감정 패턴 완전 분리 확인.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '검은 이제 심판의 상징이 아니라 화해의 악보야.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Leon Ardenia',
            text: '오늘의 춤, 기억하겠어. 진심으로.',
            emotion: 'determined',
            characterImage: 'characters/leon_ardenia.png',
          }
        ],
        postDefeat: [
          {
            speaker: 'Leon Ardenia',
            text: '박자가 엇나갔다. 심호흡부터 다시.',
            emotion: 'normal',
            characterImage: 'characters/leon_ardenia.png',
          },
          {
            speaker: 'Seraphina',
            text: '과거가 잠깐 끼어들었어... 하지만 다시 춤출 수 있어.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '동기화 데이터를 조정해 둘게. 다음엔 더 매끄럽게 연결하자.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '응. 화해의 악보를 완성해서 돌아올게.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ]
      }
    },
    {
      id: 19, name: '기사단 종결', theme: 'Command', recommendedPower: 380,
      firstReward: { gold: 800, shards: 8 }, repeatReward: { gold: 400, shards: 4 }, cleared: false,
      story: {
        description: '기사단 훈련장의 밤, 세라피나가 지휘 카드로 전원을 묶어 블랙우드 작전의 마지막 단락을 선언한다.',
        backgroundImage: 'backgrounds/stage_08_elite_2.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/garen_stone.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Seraphina',
            text: '이 자리는 전생의 재판장이었지. 이번엔 단죄가 아니라 협력의 자리로 만들 거야. [지휘 카드: 대열 정렬]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Seraphina',
            text: '[감정 공유 카드: 전체 전송] 블랙우드 작전, 지금부터 공유한다.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '작전 정보 전파 완료.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Garen Stone',
            text: '기사단 전원, 세라피나 명령에 따른다!',
            emotion: 'angry',
            characterImage: 'characters/garen_stone.png',
          },
          {
            speaker: 'Mira',
            text: '전생엔 누가 아가씨를 단죄했는데... 이제는 모두가 따르고 있어요.',
            emotion: 'happy',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Seraphina',
            text: '세상은 반복되지 않아. 우리가 변했으니까.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postVictory: [
          {
            speaker: 'Garen Stone',
            text: '명예 인장 수여! 기사단, 전원 생존!',
            emotion: 'happy',
            characterImage: 'characters/garen_stone.png',
          },
          {
            speaker: 'Soldiers',
            text: '벨몬트 경 만세!',
            emotion: 'happy',
          },
          {
            speaker: 'Seraphina',
            text: '영광은 나의 것이 아니라 모두의 이름으로 남아요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '역사는 단죄로 끝나지 않는다. 오늘은 연대의 서사다.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '이 밤은 전생의 마지막 장이 아니라 새로운 서문이야.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postDefeat: [
          {
            speaker: 'Garen Stone',
            text: '대열이 흐트러졌다. 지휘를 다시 세워라.',
            emotion: 'angry',
            characterImage: 'characters/garen_stone.png',
          },
          {
            speaker: 'Seraphina',
            text: '단죄가 아닌 연대를 보여주고 싶었는데... 아직 부족하구나.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '데이터를 남겨둘게. 한 번 더 조율하면 된다.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '응. 다시 대열을 정렬해서 돌아올게.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ]
      }
    },
    {
      id: 20, name: '석화의 틈', theme: 'Petrify', recommendedPower: 400,
      firstReward: { gold: 900, shards: 9 }, repeatReward: { gold: 450, shards: 5 }, cleared: false,
      story: {
        description: '석화 지대의 균열 속에서 세라피나가 블랙우드의 봉인 흔적을 찾아 진실을 흡수한다.',
        backgroundImage: 'backgrounds/stage_24_petrification.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/darius_blackwood.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Lucian',
            text: '다리우스의 봉인 마법 잔재가 남아 있어.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '그럼 부수자. 이번엔 두려움 없이. [대지 카드: 진동 탐지] [바람 카드: 균열 해체]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Seraphina',
            text: '[빛 카드: 치유 봉합] [얼음 카드: 안정화]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Mira',
            text: '이건... 전생의 단죄 기록이에요!',
            emotion: 'surprised',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Seraphina',
            text: '블랙우드의 조작 흔적이군. [봉인 카드: 증거 흡수]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '완료. 이걸로 진실이 완전히 드러났어.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          }
        ],
        postVictory: [
          {
            speaker: 'Seraphina',
            text: '거짓의 돌도 결국 금이 가면 무너지는 법이지.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '봉인 해제 완료. 진실 복원 100%.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Mira',
            text: '석화 해제 성공! 모두 움직여요!',
            emotion: 'happy',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Seraphina',
            text: '이제 거짓의 돌벽은 완전히 무너졌어.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postDefeat: [
          {
            speaker: 'Lucian',
            text: '균열을 잡지 못했다. 봉인이 재생 중이야.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '손끝이 다시 굳어버렸어... 조금만 더 연습하면 될 거야.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Mira',
            text: '다음엔 제가 먼저 균열을 밝혀드릴게요!',
            emotion: 'happy',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Seraphina',
            text: '응. 이번엔 거짓을 남김없이 흡수해서 돌아올게.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ]
      }
    },
    // Chapter 3: 최종 시련 (Stage 21-29) - TODO: Stage 30은 이미 추가됨
    {
      id: 21, name: '원소 연동의 밤', theme: 'Harmony', recommendedPower: 420,
      firstReward: { gold: 950, shards: 9 }, repeatReward: { gold: 475, shards: 5 }, cleared: false,
      story: {
        description: '벨몬트 돔에서 세라피나가 일곱 속성을 합주처럼 조율하며 진실을 암호화한다.',
        backgroundImage: 'backgrounds/stage_21_fusion.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/lucian_rosegarden.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Lucian',
            text: '(흥분) 일곱 속성 전 연동이라니... 실전에서 성공한 적은 없었어.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '(눈을 감고) 이번엔 음악처럼 조율할 거야. 불은 리듬, 얼음은 템포, 빛은 멜로디.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Seraphina',
            text: '[불 카드: 공명 진동] [얼음 카드: 파형 정렬] [바람 카드: 순환 루프] [대지 카드: 중심 고정] [번개 카드: 리듬 상승] [빛 카드: 화음 확장] [어둠 카드: 잔향 필터]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Mira',
            text: '와... 마력이 노래처럼 들려요!',
            emotion: 'happy',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Lucian',
            text: '(기록하며) 이건 마력 조율을 넘어선 감정 합주야.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '암호 삽입 완료. 진실은 이 곡 안에 숨었어.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postVictory: [
          {
            speaker: 'Lucian',
            text: '(숨을 고르며) 연동율 100%. 폭주 제로.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Elena Drake',
            text: '감정 동조까지 완벽했어.',
            emotion: 'happy',
            characterImage: 'characters/elena_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '진실은 큰소리로 외치지 않아도 돼. 이렇게 조용히 스며드는 게 좋아.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Mira',
            text: '아가씨의 노래는 모두를 하나로 만들었어요.',
            emotion: 'happy',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Seraphina',
            text: '오늘의 곡명은 평화. 그리고 그것이 나의 첫 연동 승리야.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postDefeat: [
          {
            speaker: 'Lucian',
            text: '파형이 흔들렸어. 다시 악보를 정리하자.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '속성이 서로 충돌했어... 다시 리듬을 맞출게.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Elena Drake',
            text: '차분히. 이번엔 내가 호흡을 맞춰줄게.',
            emotion: 'happy',
            characterImage: 'characters/elena_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '고마워. 다시 곡을 완성해서 돌아올게.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ]
      }
    },
    {
      id: 22, name: '정예 본대 담판', theme: 'Alliance', recommendedPower: 450,
      firstReward: { gold: 1000, shards: 10 }, repeatReward: { gold: 500, shards: 6 }, cleared: false,
      story: {
        description: '왕립 회의실에서 각 가문 대표와 여론을 조율하며 정예 본대 연합을 성사시킨다.',
        backgroundImage: 'backgrounds/stage_26_elite_final.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/marcus_belmont.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Elena Drake',
            text: '각 가문은 모두 신뢰를 원하지만 먼저 의심부터 하지.',
            emotion: 'normal',
            characterImage: 'characters/elena_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '그래서 오늘은 의심부터 정리하죠.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Seraphina',
            text: '[협상 카드: 감정 안정화] [정보 코덱스 카드: 진술 정리] [신뢰 봉인 카드: 서명 활성화]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Kai Drake',
            text: '네 방식은 부드럽지만 강하군.',
            emotion: 'happy',
            characterImage: 'characters/kai_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '부드러움은 결심을 가리지 않아요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Leon Ardenia',
            text: '복수가 아닌 생존이라면 나도 동참하겠다.',
            emotion: 'determined',
            characterImage: 'characters/leon_ardenia.png',
          },
          {
            speaker: 'Elena Drake',
            text: '드레이크 가도 서명할게.',
            emotion: 'happy',
            characterImage: 'characters/elena_drake.png',
          },
          {
            speaker: 'Lucian',
            text: '정예 본대 공조 승인.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '좋아요. 오늘부로 진실 작전 시작이에요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postVictory: [
          {
            speaker: 'Leon Ardenia',
            text: '전쟁 대신 회의로 결론 내다니, 이게 진짜 힘이지.',
            emotion: 'happy',
            characterImage: 'characters/leon_ardenia.png',
          },
          {
            speaker: 'Seraphina',
            text: '검보다 카드가 세상을 바꿀 수도 있잖아요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '협상 카드 효율 102%. 역사적인 수치야.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Elena Drake',
            text: '오늘의 담판은 피 한 방울 흘리지 않은 전투였어.',
            emotion: 'determined',
            characterImage: 'characters/elena_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '이건 전쟁의 종이 아니라 새로운 시작의 서명이에요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postDefeat: [
          {
            speaker: 'Marcus Belmont',
            text: '의심을 지우지 못했다. 다시 준비해라.',
            emotion: 'angry',
            characterImage: 'characters/marcus_belmont.png',
          },
          {
            speaker: 'Seraphina',
            text: '아직 감정이 뒤엉켰어. 정리해서 돌아올게.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Leon Ardenia',
            text: '자료를 더 모아라. 담판은 정보가 무기다.',
            emotion: 'normal',
            characterImage: 'characters/leon_ardenia.png',
          },
          {
            speaker: 'Seraphina',
            text: '응. 다시 설득의 자리로 돌아오겠어.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ]
      }
    },
    {
      id: 23, name: '드레이크 자매 결속', theme: 'Sisterhood', recommendedPower: 470,
      firstReward: { gold: 1050, shards: 10 }, repeatReward: { gold: 525, shards: 6 }, cleared: false,
      story: {
        description: '드레이크 구름 정원에서 세라피나와 엘레나가 두려움과 사과를 나누며 용서를 맺는다.',
        backgroundImage: 'backgrounds/stage_27_sisters.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/elena_drake.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Elena Drake',
            text: '지난 생의 일들, 아직도 네 눈을 보면 떠올라.',
            emotion: 'sad',
            characterImage: 'characters/elena_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '나도 그래. 하지만 이번엔 그 기억을 심장에 묻어둘게. [빛 카드: 감정 정화] [바람 카드: 대화 채널 개방]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Elena Drake',
            text: '무서웠어. 내가 널 단죄하던 순간조차 두려웠지.',
            emotion: 'sad',
            characterImage: 'characters/elena_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '이제 두려움을 나눴으니 용서도 나눌 수 있겠지? [감정 공유 카드: 서명 결속]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Elena Drake',
            text: '“누구도 혼자 단죄받지 않는다.” 이 문장, 네가 쓴 거지?',
            emotion: 'surprised',
            characterImage: 'characters/elena_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '그리고 이제 우리가 함께 완성했어.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postVictory: [
          {
            speaker: 'Lucian',
            text: '감정 회복률 100%. 완전 공명 성공.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Elena Drake',
            text: '오늘은 처음으로 편히 숨 쉴 수 있었어.',
            emotion: 'happy',
            characterImage: 'characters/elena_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '이 공기는 우리가 만든 용서의 바람이야.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Elena Drake',
            text: '오늘의 승리는 화해 그 자체였어.',
            emotion: 'determined',
            characterImage: 'characters/elena_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '용기는 칼날이 아니라 손끝에서 피어난다.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postDefeat: [
          {
            speaker: 'Elena Drake',
            text: '아직 마음이 굳어 있네. 조금만 더 천천히 갈까?',
            emotion: 'normal',
            characterImage: 'characters/elena_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '응... 마음을 다시 가다듬고 올게.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '감정 데이터를 정리해둘게. 다음엔 더 부드럽게 연결하자.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '고마워. 이번엔 진짜 화해를 완성해볼게.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ]
      }
    },
    {
      id: 24, name: '다중 전술 전선', theme: 'Strategy', recommendedPower: 490,
      firstReward: { gold: 1100, shards: 11 }, repeatReward: { gold: 550, shards: 6 }, cleared: false,
      story: {
        description: '왕립 지휘 센터에서 여러 전선을 하나의 악보처럼 묶어 혼돈 속 질서를 만든다.',
        backgroundImage: 'backgrounds/stage_28_multi_tactics.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/marcus_belmont.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Lucian',
            text: '다중 전선 링크 준비 완료. 오버로드 주의.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '각 부대의 흐름을 하나의 리듬으로 묶자. [패턴 노트 카드: 흐름 설계] [보호막 오케스트라 카드: 방어 공유]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Seraphina',
            text: '[마력 리셋 카드: 피로 해소] 전선에 숨 쉴 틈을 만들어.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Garen Stone',
            text: '명령 확인!',
            emotion: 'angry',
            characterImage: 'characters/garen_stone.png',
          },
          {
            speaker: 'Elena Drake',
            text: '전선 안정!',
            emotion: 'happy',
            characterImage: 'characters/elena_drake.png',
          },
          {
            speaker: 'Kai Drake',
            text: '보급 라인 확보 완료!',
            emotion: 'happy',
            characterImage: 'characters/kai_drake.png',
          },
          {
            speaker: 'Lucian',
            text: '다중 전선이 하나의 흐름처럼 움직인다.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '전쟁도 음악처럼, 조율이 중요하니까.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postVictory: [
          {
            speaker: 'Lucian',
            text: '전체 동기율 100%.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Garen Stone',
            text: '전선 피해 0%. 완벽한 승리야.',
            emotion: 'happy',
            characterImage: 'characters/garen_stone.png',
          },
          {
            speaker: 'Seraphina',
            text: '혼돈 속에서도 질서를 만들 수 있다는 걸 보여줬어.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Elena Drake',
            text: '오늘의 악보는 전쟁이 아닌 조율이었어.',
            emotion: 'determined',
            characterImage: 'characters/elena_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '혼돈을 이겼다는 건 마음을 이겼다는 뜻이야.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postDefeat: [
          {
            speaker: 'Marcus Belmont',
            text: '우선순위가 무너졌다. 전선을 다시 정렬해라.',
            emotion: 'angry',
            characterImage: 'characters/marcus_belmont.png',
          },
          {
            speaker: 'Seraphina',
            text: '한 곳에 집중하다 다른 전술을 놓쳤어.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '데이터를 다시 정리하고 카드 순환 시뮬레이션을 하자.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '응. 이번엔 모든 전선을 같은 악보 위에 올려볼게.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ]
      }
    },
    {
      id: 25, name: '정예 재편 회의', theme: 'Logistics', recommendedPower: 510,
      firstReward: { gold: 1150, shards: 11 }, repeatReward: { gold: 575, shards: 6 }, cleared: false,
      story: {
        description: '왕립 회의실에서 세라피나가 인력·정보·여론을 재정비해 동맹 구조를 완성한다.',
        backgroundImage: 'backgrounds/stage_32_politics.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/marcus_belmont.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Seraphina',
            text: '이제 각 동맹 구조를 재정비해야 해요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '인력 분배, 정보 공유, 여론 대비... 세 축이 필요하죠.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '[협상 카드: 균형 수치 조정] [보증 표 카드: 신뢰 강화] [언론 스케치 카드: 여론 예측]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Kai Drake',
            text: '이제야 진짜 리더가 된 것 같군.',
            emotion: 'happy',
            characterImage: 'characters/kai_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '리더가 아니라 조율자일 뿐이에요. 다만 책임은 기꺼이 질게요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Elena Drake',
            text: '그 말이야말로 리더의 언어야.',
            emotion: 'happy',
            characterImage: 'characters/elena_drake.png',
          },
          {
            speaker: 'Lucian',
            text: '회의 결과, 벨몬트 체계 중심 유지. 동맹 강화 완료.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '더 이상 각자의 길이 아니야. 함께 걸을 시간이지.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postVictory: [
          {
            speaker: 'Lucian',
            text: '구조 재정비 완료. 여론 안정률 상승.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Kai Drake',
            text: '드디어 완성됐군, 벨몬트 네트워크.',
            emotion: 'happy',
            characterImage: 'characters/kai_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '구조를 고치는 건 전투보다 어렵네요. 하지만...',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Elena Drake',
            text: '그래도 당신은 즐기고 있잖아.',
            emotion: 'happy',
            characterImage: 'characters/elena_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '정비 끝의 고요는 다음 도약의 신호야.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '오늘의 회의는 내일의 평화를 설계했다.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          }
        ],
        postDefeat: [
          {
            speaker: 'Marcus Belmont',
            text: '전선 정비가 미흡했다. 다시 구조를 짜라.',
            emotion: 'angry',
            characterImage: 'characters/marcus_belmont.png',
          },
          {
            speaker: 'Seraphina',
            text: '자료가 부족했어... 더 모아서 돌아올게.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Kai Drake',
            text: '필요하면 내 상단에서 지원할게.',
            emotion: 'happy',
            characterImage: 'characters/kai_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '고마워. 다음엔 흔들리지 않는 회의를 만들게.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ]
      }
    },
    {
      id: 26, name: '결혼식 시뮬', theme: 'Ceremony', recommendedPower: 530,
      firstReward: { gold: 1200, shards: 12 }, repeatReward: { gold: 600, shards: 7 }, cleared: false,
      story: {
        description: '왕립 웨딩홀 시뮬레이션에서 세라피나가 단죄 없는 의식을 연습하며 축복과 안전 절차를 검증한다.',
        backgroundImage: 'backgrounds/stage_31_wedding.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/ariana_drake.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Lucian',
            text: '(점검) 이번 실험은 단죄 없는 의식을 검증하는 게 목적이지.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '(고개 끄덕이며) 전생의 악몽을 끝낼 거야. 이번엔 축복만 남기자.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Seraphina',
            text: '[축복 시퀀스 카드: 진동 설정] [안전 설계 카드: 긴급 루트 확보] [비상 루트 카드: 방출 통로 생성]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Mira',
            text: '감정 포화 0%. 정서 안정 유지 중이에요!',
            emotion: 'happy',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Seraphina',
            text: '(속삭임) 이번 생엔 단죄가 아닌 축복이 울리게 하겠어.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Seraphina',
            text: '[빛 카드: 치유 확장] [감정 앵커 카드: 중심 고정]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Iris Belmont',
            text: '연동 안전 매뉴얼 완성. 이제 어떤 결혼식도 폭주하지 않아요.',
            emotion: 'happy',
            characterImage: 'characters/iris_belmont.png',
          },
          {
            speaker: 'Ariana',
            text: '...이건 진짜 아름다운 전투네.',
            emotion: 'happy',
            characterImage: 'characters/ariana_drake.png',
          }
        ],
        postVictory: [
          {
            speaker: 'Lucian',
            text: '시뮬 결과, 전 항목 안정. 성공률 100%.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Iris Belmont',
            text: '단죄 루프가 완전히 사라졌어요.',
            emotion: 'happy',
            characterImage: 'characters/iris_belmont.png',
          },
          {
            speaker: 'Seraphina',
            text: '이제 결혼식은 두려움의 무대가 아니야.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Ariana',
            text: '당신이 만든 매뉴얼, 사랑보다 따뜻하네요.',
            emotion: 'happy',
            characterImage: 'characters/ariana_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '축복이 안전할 때 사랑도 진짜로 존재해요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postDefeat: [
          {
            speaker: 'Lucian',
            text: '앵커가 미끄러졌어. 축복 회로를 다시 맞추자.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '전생의 기억이 잠깐 날 끌어당겼어... 조율하고 다시 올게.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Ariana',
            text: '괜찮아. 리허설은 모든 실수를 품고 있어.',
            emotion: 'happy',
            characterImage: 'characters/ariana_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '고마워. 축복이 단단해지면 다시 설게.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ]
      }
    },
    {
      id: 27, name: '지도 위의 음모', theme: 'Investigation', recommendedPower: 550,
      firstReward: { gold: 1250, shards: 12 }, repeatReward: { gold: 625, shards: 7 }, cleared: false,
      story: {
        description: '왕립 전술실에서 세라피나가 블랙우드의 이동 경로를 추적해 음모를 증거로 전환한다.',
        backgroundImage: 'backgrounds/stage_35_conspiracy.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/leon_ardenia.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Lucian',
            text: '지도 위의 모든 경로가 한 지점으로 모이고 있어.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '(궤적을 짚으며) 이 노선, 블랙우드의 이동 루트야.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Seraphina',
            text: '[정보 실타래 카드: 경로 추적] [경로 실루엣 카드: 지도 투사] [음모 추적 카드: 감정 반응 분석]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Mira',
            text: '약혼식장으로 이어지네요!',
            emotion: 'surprised',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Seraphina',
            text: '역시... 전생의 단죄는 연출이었어. 루시안, 봉인해.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '[봉인 카드: 증거 보존] 완료. 데이터 잠금 유지.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Leon',
            text: '바로 특수부대에 전달하겠다.',
            emotion: 'determined',
            characterImage: 'characters/leon_ardenia.png',
          },
          {
            speaker: 'Seraphina',
            text: '이 지도, 이제 음모가 아니라 정의의 설계도가 될 거야.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postVictory: [
          {
            speaker: 'Lucian',
            text: '증거 봉인 완료. 모든 경로 기록 확보.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Leon',
            text: '분석이 완벽해. 블랙우드의 동선을 틀어막았어.',
            emotion: 'happy',
            characterImage: 'characters/leon_ardenia.png',
          },
          {
            speaker: 'Seraphina',
            text: '이제 이 지도는 거짓이 아니라 미래를 위한 표식이야.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Mira',
            text: '거짓의 길 위에서도 결국 진실은 방향을 잃지 않네요.',
            emotion: 'happy',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Seraphina',
            text: '오늘의 승리는 나침반이 아니라 우리의 마음이 알려줬어.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postDefeat: [
          {
            speaker: 'Lucian',
            text: '투사 값이 흔들렸어. 데이터가 더 필요해.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '내가 망설여서 길이 닫혔어... 증거를 더 모아 돌아올게.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Leon',
            text: '추가 보고를 확보하겠다. 그때 다시 경로를 열자.',
            emotion: 'determined',
            characterImage: 'characters/leon_ardenia.png',
          },
          {
            speaker: 'Seraphina',
            text: '알겠어. 모든 선이 분명해지면 다시 오지.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ]
      }
    },
    {
      id: 28, name: '하인 연대', theme: 'Support', recommendedPower: 570,
      firstReward: { gold: 1300, shards: 13 }, repeatReward: { gold: 650, shards: 7 }, cleared: false,
      story: {
        description: '벨몬트 하인 회의실에서 세라피나가 정보 공유와 응급 지원 네트워크를 구축한다.',
        backgroundImage: 'backgrounds/stage_18_friendship.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/mira.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Mira',
            text: '작전용 다과회 개시! 오늘은 우리도 감시자예요.',
            emotion: 'happy',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Seraphina',
            text: '좋아, 이번엔 내 대신 너희가 눈과 귀가 되어줘.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Seraphina',
            text: '[은신 메모 카드: 관찰 모드 활성화] [지원 채널 카드: 통신 연동] [응급 회복 차 카드: 긴급 회복 준비]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Servant',
            text: '정보 수집 완료! 내통자 반응 없음!',
            emotion: 'happy',
          },
          {
            speaker: 'Servant',
            text: '감정 파형 정상입니다!',
            emotion: 'happy',
          },
          {
            speaker: 'Seraphina',
            text: '역시 내 사람들이야. 벨몬트의 힘은 화려함이 아니라 진심이었지.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Mira',
            text: '그럼 이번에도 우리가 승리예요!',
            emotion: 'happy',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Seraphina',
            text: '인정. 오늘은 하인 연대의 이름으로 남겠군.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postVictory: [
          {
            speaker: 'Lucian',
            text: '연대 시스템 정상 작동. 침투 흔적 없음.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Mira',
            text: '내통자 탐지율 100%! 완벽해요!',
            emotion: 'happy',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Seraphina',
            text: '이 집이 나를 지켜주는 게 아니라, 우리가 서로를 지켜주는 거야.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Servants',
            text: '벨몬트의 이름 아래, 함께 웃는다!',
            emotion: 'happy',
          },
          {
            speaker: 'Seraphina',
            text: '바로 이것이 진짜 가문의 방패야.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postDefeat: [
          {
            speaker: 'Mira',
            text: '회의 기록을 조금 더 정리해볼까요?',
            emotion: 'normal',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Seraphina',
            text: '조금 흔들렸네... 하지만 곧 다시 맞춰볼 수 있어.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Servant',
            text: '다음엔 우리가 먼저 체크리스트를 준비할게요!',
            emotion: 'happy',
          },
          {
            speaker: 'Seraphina',
            text: '그래. 연대는 반복할수록 더 단단해지니까.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ]
      }
    },
    {
      id: 29, name: '갈등 공개 회의', theme: 'Forum', recommendedPower: 590,
      firstReward: { gold: 1400, shards: 14 }, repeatReward: { gold: 700, shards: 8 }, cleared: false,
      story: {
        description: '왕립 공개 회의장에서 각 파벌의 감정을 표면 위로 끌어올리고 해결안을 기록한다.',
        backgroundImage: 'backgrounds/stage_32_politics.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/leon_ardenia.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Leon Ardenia',
            text: '(낮은 목소리) 여기서 모든 감정이 터질 거야. 준비됐나?',
            emotion: 'normal',
            characterImage: 'characters/leon_ardenia.png',
          },
          {
            speaker: 'Seraphina',
            text: '감추지 말아야 해. 진실은 시끄럽게 태어나니까.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Seraphina',
            text: '[감정 이름표 카드: 감정 식별] [공감 시트 카드: 감정 흐름 공유] [해결 설계 카드: 의견 교차]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Noble',
            text: '당신 때문에 가문이 위험에 빠졌소!',
            emotion: 'angry',
          },
          {
            speaker: 'Seraphina',
            text: '그래요, 제 책임이었어요. 인정하는 순간이 시작이에요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Garen Stone',
            text: '솔직한 답변이다. 그게 새로운 신뢰의 초석이지.',
            emotion: 'happy',
            characterImage: 'characters/garen_stone.png',
          },
          {
            speaker: 'Seraphina',
            text: '모든 감정을 기록으로 남겨요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postVictory: [
          {
            speaker: 'Lucian',
            text: '여론 안정 지수가 올라갔어. 감정 폭주 없음.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Leon Ardenia',
            text: '오늘은 말이 무기가 아니었지.',
            emotion: 'happy',
            characterImage: 'characters/leon_ardenia.png',
          },
          {
            speaker: 'Seraphina',
            text: '말은 상처를 줄 수도 있지만, 오늘은 서로를 꿰맸어요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Elena Drake',
            text: '감정의 무게를 나누는 건 어떤 결투보다 어려운 용기야.',
            emotion: 'determined',
            characterImage: 'characters/elena_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '그 용기가 오늘의 승리를 만들었죠.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postDefeat: [
          {
            speaker: 'Noble',
            text: '회의장이 폭발했네! 준비가 덜 된 거야!',
            emotion: 'angry',
          },
          {
            speaker: 'Seraphina',
            text: '내가 목소리를 제대로 이끌지 못했어요... 사실을 다시 정리해서 돌아올게요.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Leon Ardenia',
            text: '필요하면 내가 중재 인원을 더 붙이겠다.',
            emotion: 'determined',
            characterImage: 'characters/leon_ardenia.png',
          },
          {
            speaker: 'Seraphina',
            text: '고마워요. 다음엔 모두가 들을 수 있게 할게요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ]
      }
    },
    {
      id: 30, name: '음모 개시', theme: 'Counterplot', recommendedPower: 650,
      firstReward: { gold: 1500, shards: 15 }, repeatReward: { gold: 750, shards: 9 }, cleared: false,
      story: {
        description: '왕도 중앙 광장에서 세라피나가 언론을 상대로 사실을 공표하며 블랙우드의 음모를 되돌린다.',
        backgroundImage: 'backgrounds/stage_35_conspiracy.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/leon_ardenia.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Lucian',
            text: '(긴급) 여론이 폭주 중이야! 기자들이 몰려오고 있어!',
            emotion: 'angry',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '좋아, 진실로 상대하자.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Seraphina',
            text: '[언론 대응 카드: 사실 공표] [마력 큐 카드: 연설 박자 조정] [보호망 명령 카드: 네트워크 재정렬]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Seraphina',
            text: '진실은 늦게 와도 거짓보다 오래 남아.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Seraphina',
            text: '[빛 카드: 공명 확장]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postVictory: [
          {
            speaker: 'Lucian',
            text: '여론 반전 완료. 긍정 반응 80포인트 상승.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Elena Drake',
            text: '이제 모두가 당신 말을 듣고 있어.',
            emotion: 'happy',
            characterImage: 'characters/elena_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '진실은 어떤 공포보다 빠르게 사람을 움직여.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Leon Ardenia',
            text: '오늘의 연설은 전투보다 강력했어.',
            emotion: 'determined',
            characterImage: 'characters/leon_ardenia.png',
          },
          {
            speaker: 'Seraphina',
            text: '오늘 진실이 세상을 설득했어요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postDefeat: [
          {
            speaker: 'Lucian',
            text: '군중이 우리 목소리를 덮었어. 더 명확한 자료가 필요해.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '내 목소리가 흔들렸어... 사실을 다시 정렬해서 돌아올게.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Leon Ardenia',
            text: '증인을 더 모으자. 광장을 다시 열 준비를 해두겠다.',
            emotion: 'determined',
            characterImage: 'characters/leon_ardenia.png',
          },
          {
            speaker: 'Seraphina',
            text: '고마워. 다음엔 진실이 잡음 없이 도착하게 할게.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ]
      }
    },
    {
      id: 31, name: '마법 사고', theme: 'Accident', recommendedPower: 680,
      firstReward: { gold: 1500, shards: 15 }, repeatReward: { gold: 750, shards: 9 }, cleared: false,
      story: {
        description: '왕립 연구소에서 폭주한 마법 에너지를 세라피나가 진정시키며 책임의 무게를 확인한다.',
        backgroundImage: 'backgrounds/stage_36_magic_lab.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/lucian_rosegarden.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Researcher',
            text: '폭주 반응입니다! 블랙우드가 남긴 장치가 다시 가동하고 있어요!',
            emotion: 'angry',
          },
          {
            speaker: 'Lucian',
            text: '코어 반응 속도 초당 12%. 위험 수치입니다!',
            emotion: 'angry',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '진정해. 공명 구조를 분리하면 돼. [마력 스위치 카드: 순환 분리] [상승 제어 카드: 반응 억제]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Seraphina',
            text: '[에너지 증폭 카드: 제어 안정화]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Researcher',
            text: '폭주 억제 확인!',
            emotion: 'happy',
          },
          {
            speaker: 'Lucian',
            text: '폭발 위험 해제. 정말 아슬아슬했어.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '진짜 위험한 건 두려움이야. 우리는 침착하게 다룰 수 있어.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postVictory: [
          {
            speaker: 'Lucian',
            text: '시스템 안정. 피해자 없음.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Researcher',
            text: '악역이라는 소문이 전부 틀렸네요... 감사합니다.',
            emotion: 'happy',
          },
          {
            speaker: 'Seraphina',
            text: '나는 평판이 아니라 책임을 선택했을 뿐이야.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Mira',
            text: '오늘 사고가 아가씨 이름을 신뢰로 다시 썼어요.',
            emotion: 'happy',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Seraphina',
            text: '이번엔 그 신뢰가 오래 남을 거야.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postDefeat: [
          {
            speaker: 'Lucian',
            text: '제어 루틴이 미끄러졌어. 처음부터 다시 맞추자.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '잠시 두려움에 흔들렸어... 손을 다시 안정시키고 돌아올게.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ]
      }
    },
    {
      id: 32, name: '고대 연동', theme: 'Ancient', recommendedPower: 700,
      firstReward: { gold: 1600, shards: 16 }, repeatReward: { gold: 800, shards: 9 }, cleared: false,
      story: {
        description: '고대 도서관에서 세라피나가 선조들의 연동석을 해석해 역마력의 약점을 찾아낸다.',
        backgroundImage: 'backgrounds/stage_37_ancient.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/lucian_rosegarden.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Lucian',
            text: '이 기록석은 수백 년 전 건데 아직도 맥동하고 있어.',
            emotion: 'surprised',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '마력의 언어는 변하지 않아. 박자를 읽으면 답이 보여.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Seraphina',
            text: '[악보 해석 카드: 리듬 분석] [공동 마력동조 카드: 협력 연동] [박자석 카드: 고대 패턴 복원]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '봐! 블랙우드 역마력의 약점이야!',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphine Winters',
            text: '차가움을 느끼면서 흐름을 붙잡아. 감정은 따라올 거야.',
            emotion: 'happy',
            characterImage: 'characters/seraphine_winters.png',
          },
          {
            speaker: 'Seraphina',
            text: '[빛 카드: 감정 정화] 고마워요, 선조님들.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postVictory: [
          {
            speaker: 'Lucian',
            text: '공명 완료. 기록석이 잠들었어.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '해독한 약점을 모든 동맹에게 보내. 과거가 다음 승리를 줬어.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Seraphine Winters',
            text: '잊힌 노래도 누군가 들어주면 돌아오죠.',
            emotion: 'happy',
            characterImage: 'characters/seraphine_winters.png',
          },
          {
            speaker: 'Seraphina',
            text: '그리고 나는 계속 들을 거야.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postDefeat: [
          {
            speaker: 'Lucian',
            text: '패턴이 무너졌어. 박자를 다시 맞추자.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '리듬을 놓쳤어... 정렬해서 다시 올게.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ]
      }
    },
    {
      id: 33, name: '라이벌 화해', theme: 'Reconciliation', recommendedPower: 720,
      firstReward: { gold: 1700, shards: 17 }, repeatReward: { gold: 850, shards: 9 }, cleared: false,
      story: {
        description: '불꽃 서클 경기장에서 세라피나와 아리아나가 서로의 마음을 공개하며 진정한 라이벌로 거듭난다.',
        backgroundImage: 'backgrounds/stage_17_fire_challenge.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/ariana_drake.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Ariana',
            text: '여전히 네가 싫다고 말하고 싶지만... 솔직히 이제 모르겠어.',
            emotion: 'sad',
            characterImage: 'characters/ariana_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '그럼 그냥 "싫지 않다"고만 해. 그게 시작이야.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Seraphina',
            text: '[감정 채널 강화 카드: 교감 개방] [기류 공유 카드: 호흡 동기화] [화해 인장 카드: 감정 봉인]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Ariana',
            text: '불과 얼음이 함께 춤추는 건 처음이야.',
            emotion: 'happy',
            characterImage: 'characters/ariana_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '다르다고 멀어질 필요는 없어. 다른 빛이 세상을 더 환하게 하니까.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Seraphina',
            text: '[불·얼 체인: 동행 문양 형성]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postVictory: [
          {
            speaker: 'Ariana',
            text: '네가 이렇게 멋있게 바뀔 줄 누가 알았겠어.',
            emotion: 'happy',
            characterImage: 'characters/ariana_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '라이벌이 칭찬하니까 기분이 묘하네.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '감정 채널 안정. 긴장도 완전히 해소됐어.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Ariana',
            text: '다음엔 적이 아니라 친구로 만나자.',
            emotion: 'determined',
            characterImage: 'characters/ariana_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '그래. 이번 생엔 경쟁보다 동행이 먼저야.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postDefeat: [
          {
            speaker: 'Ariana',
            text: '이봐, 주저앉지 마. 여긴 우리 둘만의 무대야.',
            emotion: 'surprised',
            characterImage: 'characters/ariana_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '아직 가면을 쓰려 했어... 부수고 다시 올게.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ]
      }
    },
    {
      id: 34, name: '협력 듀오', theme: 'Duet', recommendedPower: 740,
      firstReward: { gold: 1800, shards: 18 }, repeatReward: { gold: 900, shards: 10 }, cleared: false,
      story: {
        description: '궁정 무도회장에서 세라피나와 카이가 칼과 카드로 호흡을 맞추며 연합 선봉 듀오로 탄생한다.',
        backgroundImage: 'backgrounds/stage_39_cooperation.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/kai_drake.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Kai',
            text: '네가 이 추위 속에서도 이렇게 침착할 줄은 몰랐군.',
            emotion: 'determined',
            characterImage: 'characters/kai_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '상단 정보 덕분이죠. 이번엔 정말 쓸모가 있었어요.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Seraphina',
            text: '[공전 링크 카드: 동기화 강화] [전술 공유판 카드: 명령 일체화] [협공 신호 카드: 연계 활성화]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '(무전) 전선 안정! 1차 돌파 성공!',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Kai',
            text: '사랑이 아니어도, 우정만으로도 충분하네.',
            emotion: 'happy',
            characterImage: 'characters/kai_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '우정이 더 오래 남죠. 사랑은 계절이고, 신뢰는 땅이니까요.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postVictory: [
          {
            speaker: 'Kai',
            text: '파트너로서 완벽했어.',
            emotion: 'happy',
            characterImage: 'characters/kai_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '거래 성립, 동맹 갱신이에요.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '협공 효율 110%. 실전 최고치 기록.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '마음의 형태가 달라도 박자는 맞출 수 있어요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Kai',
            text: '그게 우리식 연동이지.',
            emotion: 'determined',
            characterImage: 'characters/kai_drake.png',
          }
        ],
        postDefeat: [
          {
            speaker: 'Kai',
            text: '또 혼자서 날 지키려 했잖아.',
            emotion: 'sad',
            characterImage: 'characters/kai_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '오래된 습관이라서 그래... 듀오를 믿고 다시 맞춰볼게.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ]
      }
    },
    {
      id: 35, name: '교단 전초전', theme: 'Vanguard', recommendedPower: 760,
      firstReward: { gold: 1900, shards: 19 }, repeatReward: { gold: 950, shards: 11 }, cleared: false,
      story: {
        description: '왕립 전초기지에서 세라피나가 레온과 함께 역마력 교단의 전진 기점을 차단한다.',
        backgroundImage: 'backgrounds/stage_40_cult.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/leon_ardenia.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Garen',
            text: '이번이 시작이자 예고다. 방심하지 마라.',
            emotion: 'angry',
            characterImage: 'characters/garen_stone.png',
          },
          {
            speaker: 'Seraphina',
            text: '첫 신호탄은 내가 쏠게. [연동 신호탄 카드: 전면 개시]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '정보 흐름 확보! 방어 격자 가동!',
            emotion: 'determined',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '[감정 역추적 카드: 기록 복원]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Elena',
            text: '이게 다리우스의 서명이야... 전부 계획된 거였군!',
            emotion: 'angry',
            characterImage: 'characters/elena_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '이제 증거를 봉인해. [봉인 카드: 결정적 증거 저장]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postVictory: [
          {
            speaker: 'Lucian',
            text: '작전 성공. 장부 회수 완료.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Garen',
            text: '첫 전투, 완벽한 출발이다.',
            emotion: 'happy',
            characterImage: 'characters/garen_stone.png',
          },
          {
            speaker: 'Seraphina',
            text: '전생의 어둠을 이제 정면으로 바라볼 수 있네요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Elena',
            text: '오늘의 불길은 진실의 횃불이었어.',
            emotion: 'determined',
            characterImage: 'characters/elena_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '이제 교단의 그림자도 두렵지 않아요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postDefeat: [
          {
            speaker: 'Lucian',
            text: '정보가 부족했어. 링크를 다시 맞추자.',
            emotion: 'angry',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '자료를 더 모으고 전략을 재정비할게.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ]
      }
    },
    {
      id: 36, name: '침공 개시', theme: 'Assault', recommendedPower: 780,
      firstReward: { gold: 2000, shards: 20 }, repeatReward: { gold: 1000, shards: 12 }, cleared: false,
      story: {
        description: '블랙우드 요새 외곽. 세라피나가 전군을 연동해 심장을 향한 총공격을 개시한다.',
        backgroundImage: 'backgrounds/stage_41_invasion.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/darius_blackwood.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Garen',
            text: '목표, 블랙우드 요새! 모든 부대 대기 완료!',
            emotion: 'determined',
            characterImage: 'characters/garen_stone.png',
          },
          {
            speaker: 'Seraphina',
            text: '이번엔 우리가 심장을 노린다. [전선 지도 카드: 위치 동기화] [연동 호출 카드: 전군 연결] [마력 중계 카드: 통신 확장]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '(무전) 전선 간섭률 0%! 완전 동기화 성공!',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Elena',
            text: '너의 명령을 기다린다, 세라피나!',
            emotion: 'determined',
            characterImage: 'characters/elena_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '전진!',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postVictory: [
          {
            speaker: 'Lucian',
            text: '요새 외벽 붕괴. 초기 돌입 성공!',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Garen',
            text: '부상자 없음. 타이밍 완벽했어.',
            emotion: 'happy',
            characterImage: 'characters/garen_stone.png',
          },
          {
            speaker: 'Seraphina',
            text: '전생의 두려움 대신 이번엔 리듬이 있었어.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Elena',
            text: '오늘의 함성은 복수가 아니라 진실이었어.',
            emotion: 'determined',
            characterImage: 'characters/elena_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '우린 전쟁을 춤으로 바꾸고 있어.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postDefeat: [
          {
            speaker: 'Lucian',
            text: '동기화가 풀렸어. 그리드를 다시 짜야 해.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '두려움이 잠깐 스며들었어... 박자를 다시 맞추고 돌아올게.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ]
      }
    },
    {
      id: 37, name: '석화 타락 정화', theme: 'Purification', recommendedPower: 800,
      firstReward: { gold: 2100, shards: 21 }, repeatReward: { gold: 1050, shards: 12 }, cleared: false,
      story: {
        description: '블랙우드 성 내부. 타락과 석화가 번진 기사들을 세라피나가 연동 정화로 되살린다.',
        backgroundImage: 'backgrounds/stage_42_corrupted_stone.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/garen_stone.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Lucian',
            text: '이건 단순한 마법이 아니야... 타락과 석화가 동시에 진행 중이야.',
            emotion: 'surprised',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Garen',
            text: '내 팔이... 다시 굳어간다!',
            emotion: 'sad',
            characterImage: 'characters/garen_stone.png',
          },
          {
            speaker: 'Seraphina',
            text: '절대 잃게 두지 않아. [정화 물결 카드: 타락 제거] [심장 공명 카드: 맥동 복원] [석화 해동 강화 카드: 조직 회복]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Garen',
            text: '움직여! 내 팔이 살아났다!',
            emotion: 'happy',
            characterImage: 'characters/garen_stone.png',
          },
          {
            speaker: 'Seraphina',
            text: '그래서 함께 싸워야 한다고 했잖아요. [대지 카드: 보호 결계]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postVictory: [
          {
            speaker: 'Lucian',
            text: '타락 반응 0%. 석화 완전 해제.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Garen',
            text: '이젠 네가 나를 지켜줬군.',
            emotion: 'happy',
            characterImage: 'characters/garen_stone.png',
          },
          {
            speaker: 'Seraphina',
            text: '서로를 지킬 수 있다면 그게 진짜 전우죠.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Elena',
            text: '오늘의 정화는 승리보다 깊은 빛이었어.',
            emotion: 'determined',
            characterImage: 'characters/elena_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '우린 함께 살아남는 법을 배웠어요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postDefeat: [
          {
            speaker: 'Lucian',
            text: '타락 수치가 급등했어. 정화 파동을 다시 세팅해.',
            emotion: 'angry',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '흐름이 엇나갔어... 다시 정렬해서 돌아올게.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Elena',
            text: '박자를 같이 세자. 다음엔 맞출 수 있어.',
            emotion: 'determined',
            characterImage: 'characters/elena_drake.png',
          }
        ]
      }
    },
    {
      id: 38, name: '그림자 공명', theme: 'ShadowCore', recommendedPower: 820,
      firstReward: { gold: 2200, shards: 22 }, repeatReward: { gold: 1100, shards: 13 }, cleared: false,
      story: {
        description: '블랙우드 본관 그림자 홀. 세라피나가 공명 전투로 다리우스의 거짓 그림자를 찢는다.',
        backgroundImage: 'backgrounds/stage_43_absolute_darkness.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/darius_blackwood.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Darius',
            text: '또 회귀자 놀음인가? 이번엔 누굴 속이려 하지?',
            emotion: 'angry',
            characterImage: 'characters/darius_blackwood.png',
          },
          {
            speaker: 'Seraphina',
            text: '감춘 진실을 드러내러 왔어. [공명 고리 강화 카드: 주파수 통제] [감정 필터 업그레이드 카드: 왜곡 차단] [그림자 싱크 카드: 거짓 파동 분리]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '감정 왜곡 60% 해제! 조금만 더!',
            emotion: 'determined',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '[빛 카드: 진실 방출]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Darius',
            text: '이게... 불가능한데...',
            emotion: 'surprised',
            characterImage: 'characters/darius_blackwood.png',
          }
        ],
        postVictory: [
          {
            speaker: 'Lucian',
            text: '증거 확보. 음성 재현 완료.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Elena',
            text: '그가 단죄의 주범이었어.',
            emotion: 'sad',
            characterImage: 'characters/elena_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '이제 그림자도 거짓말을 멈췄네요.',
            emotion: 'determined',
            characterImage: 'characters/seraphина_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '진실은 빛으로도, 그림자로도 울린다.',
            emotion: 'determined',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '이건 복수가 아니라 해방이에요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postDefeat: [
          {
            speaker: 'Darius',
            text: '그림자가 널 붙잡고 있다. 끊어내지 못하겠군.',
            emotion: 'angry',
            characterImage: 'characters/darius_blackwood.png',
          },
          {
            speaker: 'Seraphina',
            text: '공명이 흔들렸어... 파동을 다시 나눠서 돌아올게.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '필터 값을 재계산하고 다시 들어가자.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden.png',
          }
        ]
      }
    },
    {
      id: 39, name: '엘레나 구출', theme: 'Rescue', recommendedPower: 840,
      firstReward: { gold: 2300, shards: 23 }, repeatReward: { gold: 1150, shards: 13 }, cleared: false,
      story: {
        description: '교단 지하 감옥. 세라피나가 엘레나를 감정 공명과 생명 연동으로 되찾는다.',
        backgroundImage: 'backgrounds/stage_44_corruption_prison.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/darius_blackwood.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Darius',
            text: '진실을 원했지? 그럼 함께 묻혀라!',
            emotion: 'angry',
            characterImage: 'characters/darius_blackwood.png',
          },
          {
            speaker: 'Seraphina',
            text: '엘레나! 버텨요! [감정 노래 카드: 심리 공명] [회복 화환 카드: 생명 흐름 연결] [안정 고리 카드: 결박 해제]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Elena',
            text: '...세라피나... 네가 나를 구했어.',
            emotion: 'sad',
            characterImage: 'characters/elena_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '이번 생에선, 내가 네 편이에요. 끝까지.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '(기록) 감정 회복률 95%. 생명 흐름 안정.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          }
        ],
        postVictory: [
          {
            speaker: 'Lucian',
            text: '대상 생명 안정. 모든 지표 정상.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Elena',
            text: '넌 나의 빛이야, 세라피나.',
            emotion: 'happy',
            characterImage: 'characters/elena_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '그리고 당신은 나의 증거예요.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '오늘의 구출은 단죄보다 위대했다.',
            emotion: 'determined',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '이제 우린, 진실로 서로를 구했어요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postDefeat: [
          {
            speaker: 'Darius',
            text: '쇠사슬이 다시 잠긴다. 못 빠져나간다.',
            emotion: 'angry',
            characterImage: 'characters/darius_blackwood.png',
          },
          {
            speaker: 'Seraphina',
            text: '연결이 흔들렸어... 생명 흐름을 다시 이어서 올게.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '안정도가 떨어졌어. 첫 박자부터 다시 맞추자.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Elena',
            text: '난 기다릴게. 꼭 돌아와.',
            emotion: 'determined',
            characterImage: 'characters/elena_drake.png',
          }
        ]
      }
    },
    {
      id: 40, name: '교단 심장', theme: 'Sanctum', recommendedPower: 860,
      firstReward: { gold: 2500, shards: 25 }, repeatReward: { gold: 1250, shards: 15 }, cleared: false,
      story: {
        description: '교단 중심부의 심장석 방. 세라피나가 심장 맥동을 봉인해 거짓의 혈류를 끊는다.',
        backgroundImage: 'backgrounds/stage_45_cult_final.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/darius_blackwood.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Lucian',
            text: '이게 교단의 핵심 장치야. 시간이 없어!',
            emotion: 'angry',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '이제 맥박을 멈추자. [심장 봉인 카드: 박동 억제] [연동 증폭 카드: 마력 집중] [시간 지휘 카드: 흐름 역전]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Elena',
            text: '조심해! 과부하가—!',
            emotion: 'surprised',
            characterImage: 'characters/elena_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '[증거 채록 카드: 기록 완전 보존]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postVictory: [
          {
            speaker: 'Lucian',
            text: '심장석 붕괴 확인. 감정 오염률 0%.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Elena',
            text: '네가 교단의 심장을 멈추다니...',
            emotion: 'happy',
            characterImage: 'characters/elena_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '이번엔 죽음이 아니라 정화를 택했어요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '오늘의 박동은 끝났고, 내일의 리듬이 시작된다.',
            emotion: 'determined',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '심장이 멎어야 세계가 다시 숨을 쉬죠.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postDefeat: [
          {
            speaker: 'Lucian',
            text: '반동이 거세! 장치가 우리를 역공격해!',
            emotion: 'angry',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '흐름이 역전됐어... 다시 봉인하고 돌아올게.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Elena',
            text: '우리가 둘러서 지킬게. 잠깐만 정비해.',
            emotion: 'determined',
            characterImage: 'characters/elena_drake.png',
          }
        ]
      }
    },
    // Chapter 5: 어둠의 전쟁 (Stage 41-50)
    {
      id: 41, name: '주동자 재판', theme: 'Judgment', recommendedPower: 880,
      firstReward: { gold: 2600, shards: 26 }, repeatReward: { gold: 1300, shards: 15 }, cleared: false,
      story: {
        description: '왕립 재판장에서 세라피나가 잰더의 계략을 증거로 무너뜨려 정의를 세운다.',
        backgroundImage: 'backgrounds/stage_46_mastermind.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Xander',
            text: '넌 정의를 외치지만 결국 감정의 노예일 뿐이야.',
            emotion: 'angry',
          },
          {
            speaker: 'Seraphina',
            text: '감정이 없었다면 진실도 없었겠죠. 이제 끝내요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Seraphina',
            text: '[설계 붕괴 카드: 구조 역전] [감정 역추적 카드: 동기 복원] [연동 역박 카드: 패턴 반전]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '증거 교차 완료! 허위 기록 전부 해제!',
            emotion: 'determined',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '[빛 카드: 진술 고정]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Xander',
            text: '거짓이다! 난 계획대로 했을 뿐이야!',
            emotion: 'angry',
          }
        ],
        postVictory: [
          {
            speaker: 'Lucian',
            text: '판결문 완성. 주동자 구속 완료.',
            emotion: 'determined',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Elena',
            text: '끝났어.',
            emotion: 'happy',
            characterImage: 'characters/elena_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '진실은 아무리 늦어도 반드시 증거를 찾아오죠.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '오늘의 법정은 복수가 아닌 정의였다.',
            emotion: 'determined',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '그리고 정의는 결국 빛으로 귀환해요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postDefeat: [
          {
            speaker: 'Xander',
            text: '네 빛이 흔들린다. 내 설계는 아직 무너지지 않았다.',
            emotion: 'happy',
          },
          {
            speaker: 'Seraphina',
            text: '증거 배치가 흐트러졌어... 다시 정리해서 올게.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '기록을 다시 교차 검증하자. 곧 뒤집을 수 있어.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden.png',
          }
        ]
      }
    },
    {
      id: 42, name: '타락 잔재 정화', theme: 'Restoration', recommendedPower: 920,
      firstReward: { gold: 2800, shards: 28 }, repeatReward: { gold: 1400, shards: 17 }, cleared: false,
      story: {
        description: '전투가 끝난 도시에서 세라피나가 남은 타락을 정화해 시민에게 평온을 되찾아준다.',
        backgroundImage: 'backgrounds/stage_28_multi_tactics.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Lucian',
            text: '남은 타락 파동 다수. 감정 오염이 심각해.',
            emotion: 'angry',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '이젠 싸움이 아니라 정화의 시간이에요. [정화 회로 카드: 광역 해방] [감정 동시 카드: 공명 회복] [연동 방패 카드: 마력 차단]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Resident',
            text: '따뜻해요... 이건 벌이 아니라 위로네요.',
            emotion: 'happy',
          },
          {
            speaker: 'Seraphina',
            text: '우리가 지키고 싶었던 세상이 바로 이거야.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postVictory: [
          {
            speaker: 'Lucian',
            text: '정화율 100%. 도심 완전 복원.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Garen',
            text: '마침내 이 도시가 살아 숨 쉰다.',
            emotion: 'happy',
            characterImage: 'characters/garen_stone.png',
          },
          {
            speaker: 'Seraphina',
            text: '폭풍이 지나간 자리엔 늘 꽃이 피어요.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Elena',
            text: '오늘의 평화는 피가 아닌 정화로 얻었어.',
            emotion: 'determined',
            characterImage: 'characters/elena_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '우리가 선택한 온도는 따뜻함이었죠.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postDefeat: [
          {
            speaker: 'Lucian',
            text: '타락 수치가 다시 오르고 있어. 정화 순서를 재정렬해.',
            emotion: 'angry',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '흐름을 다시 정리해서 돌아올게.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ]
      }
    },
    {
      id: 43, name: '가문 연합 선언', theme: 'Heritage', recommendedPower: 960,
      firstReward: { gold: 3000, shards: 30 }, repeatReward: { gold: 1500, shards: 18 }, cleared: false,
      story: {
        description: '벨몬트 대회의실에서 세라피나가 각 가문과 감정을 연동해 새로운 연합을 선포한다.',
        backgroundImage: 'backgrounds/stage_48_elder_cooperation.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Elder Belmont',
            text: '오늘의 승리는 개인이 아닌 가문의 것이다. 새 연합을 선언하겠다.',
            emotion: 'determined',
            characterImage: 'characters/elder_belmont.png',
          },
          {
            speaker: 'Seraphina',
            text: '그 선언의 무게, 제가 짊어질게요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Seraphina',
            text: '[유산 공명 카드: 전통 공진] [가문 지휘봉 카드: 명령 일체화] [연동 문장 카드: 서약 각인]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '가문 간 감정 연동이라니, 전례가 없어!',
            emotion: 'surprised',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Elder Belmont',
            text: '해냈구나, 세라피나. 이제 벨몬트의 뜻이 가문을 이끈다.',
            emotion: 'happy',
            characterImage: 'characters/elder_belmont.png',
          }
        ],
        postVictory: [
          {
            speaker: 'Lucian',
            text: '연합 문장 발효 완료.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Elder Belmont',
            text: '넌 이제 진정한 후계자다.',
            emotion: 'happy',
            characterImage: 'characters/elder_belmont.png',
          },
          {
            speaker: 'Seraphina',
            text: '제 이름보다 소중한 건 가문의 신뢰예요.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Garen',
            text: '오늘의 서약은 피보다 강한 마력이었다.',
            emotion: 'determined',
            characterImage: 'characters/garen_stone.png',
          },
          {
            speaker: 'Seraphina',
            text: '이제 벨몬트의 이름은 모두의 이름이에요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postDefeat: [
          {
            speaker: 'Lucian',
            text: '문장이 흔들렸다. 연동을 다시 정렬해.',
            emotion: 'angry',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '전통을 더 단단히 붙잡고 돌아올게.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ]
      }
    },
    {
      id: 44, name: '가족 연합 결전', theme: 'Unity', recommendedPower: 1000,
      firstReward: { gold: 3200, shards: 32 }, repeatReward: { gold: 1600, shards: 20 }, cleared: false,
      story: {
        description: '블랙우드 잔당의 마지막 방어선에서 모든 가족이 연동 결전을 펼친다.',
        backgroundImage: 'backgrounds/stage_30_final_boss.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Elder Belmont',
            text: '모든 가족, 전선 진입!',
            emotion: 'determined',
            characterImage: 'characters/elder_belmont.png',
          },
          {
            speaker: 'Seraphina',
            text: '이건 복수가 아니라 해방이에요. [가족 연동 악보 카드: 전체 연계] [전선 교대 카드: 마력 흐름 교환] [감정 지휘 카드: 집단 강화]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '(분석) 모든 가족 연동 성공! 마력 손실 0%!',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Elena',
            text: '이건 음악이야. 전투의 화음.',
            emotion: 'happy',
            characterImage: 'characters/elena_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '마지막 박자—완결!',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postVictory: [
          {
            speaker: 'Lucian',
            text: '적 세력 전멸. 피해율 최소.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Elder Belmont',
            text: '오늘의 승리는 역사로 남을 것이다.',
            emotion: 'happy',
            characterImage: 'characters/elder_belmont.png',
          },
          {
            speaker: 'Seraphina',
            text: '가족의 힘이 이렇게 따뜻할 줄, 전생엔 몰랐어요.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Elena',
            text: '오늘의 전투는 혈통이 아닌 신념이었지.',
            emotion: 'determined',
            characterImage: 'characters/elena_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '가족이란, 끝까지 나를 믿어주는 이름이에요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postDefeat: [
          {
            speaker: 'Lucian',
            text: '연동 라인이 흔들렸어. 전선을 재정비해.',
            emotion: 'angry',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '다시 호흡을 맞춰서 돌아올게.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ]
      }
    },
    {
      id: 45, name: '정치 재정비', theme: 'Reform', recommendedPower: 1050,
      firstReward: { gold: 3600, shards: 36 }, repeatReward: { gold: 1800, shards: 22 }, cleared: false,
      story: {
        description: '왕립 회의실에서 세라피나가 모든 세력의 복구 계획을 조율해 평화를 제도화한다.',
        backgroundImage: 'backgrounds/stage_32_politics.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Lucian',
            text: '이제 각 세력의 복구 계획을 조율해야 해.',
            emotion: 'angry',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '전쟁의 끝은 행정이죠. [재정비 선언 카드: 제도 리셋] [동맹 지침 카드: 권한 조율] [언론 조율 카드: 여론 균형]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Leon',
            text: '오늘은 그 누구도 단죄를 외치지 않았군.',
            emotion: 'happy',
            characterImage: 'characters/leon_ardenia.png',
          },
          {
            speaker: 'Elena',
            text: '모두가 각자의 책임을 인정했으니까.',
            emotion: 'happy',
            characterImage: 'characters/elena_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '진짜 평화는 죄를 묻지 않는 데서 시작해요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postVictory: [
          {
            speaker: 'Leon',
            text: '전쟁보다 회의가 더 피곤하군.',
            emotion: 'happy',
            characterImage: 'characters/leon_ardenia.png',
          },
          {
            speaker: 'Seraphina',
            text: '그래도 오늘은 피 대신 웃음으로 마무리했잖아요.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '여론 안정률 98%. 역사적인 수치야.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Elena',
            text: '오늘의 합의는 단 한 줄의 법보다 강했다.',
            emotion: 'determined',
            characterImage: 'characters/elena_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '정치는 결국 마음을 다스리는 마법이에요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postDefeat: [
          {
            speaker: 'Lucian',
            text: '협상이 무너졌어. 다시 의제를 잡자.',
            emotion: 'angry',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '틀어진 구조를 고쳐서 다시 시작할게.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ]
      }
    },
    {
      id: 46, name: '결혼식 본편', theme: 'Blessing', recommendedPower: 1100,
      firstReward: { gold: 3900, shards: 39 }, repeatReward: { gold: 1950, shards: 24 }, cleared: false,
      story: {
        description: '왕립 대성당에서 세라피나가 진짜 축복의 결혼식을 지휘하며 감정 앵커를 안정화한다.',
        backgroundImage: 'backgrounds/stage_31_wedding.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/lucian_rosegarden.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Lucian',
            text: '모든 안전 설계 완료. 감정 앵커도 안정적이야.',
            emotion: 'determined',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '이번엔 축복이 진짜 의미로 울리게 하자. [축복 연동 카드: 감정 순환] [안전 초점 카드: 안정 유지] [감정 앵커 카드: 중심 조율]',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Bride',
            text: '손이 떨려요...',
            emotion: 'surprised',
          },
          {
            speaker: 'Seraphina',
            text: '괜찮아요. 사랑은 원래 조금 불안정하니까요. 그게 살아 있다는 증거예요.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Seraphina',
            text: '[빛 카드: 치유 확장]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '완벽한 성공. 왜곡 없음.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          }
        ],
        postVictory: [
          {
            speaker: 'Lucian',
            text: '모든 회로 정상 종료. 감정 안정률 100%.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Elena',
            text: '오늘의 빛, 정말 따뜻했어요.',
            emotion: 'happy',
            characterImage: 'characters/elena_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '전생의 결혼식은 단죄였지만 이번엔 축복이었네요.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '사랑을 지킨 마법은 세상에서 가장 강한 주문이야.',
            emotion: 'determined',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '오늘의 승리는 누군가의 행복이에요.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postDefeat: [
          {
            speaker: 'Lucian',
            text: '앵커가 흔들린다. 합창 전에 리셋해야 해.',
            emotion: 'angry',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '리듬이 미끄러졌어... 다시 안정시키고 시작할게.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ]
      }
    },
    {
      id: 47, name: '평화의 협약', theme: 'Accord', recommendedPower: 1150,
      firstReward: { gold: 4200, shards: 42 }, repeatReward: { gold: 2100, shards: 28 }, cleared: false,
      story: {
        description: '왕국 평화 협약식에서 세라피나가 각국 대표와 마음을 연동해 새 연합을 완성한다.',
        backgroundImage: 'backgrounds/stage_29_wind_final.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/leon_ardenia.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Leon',
            text: '검 대신 과일바구니라니, 이런 협약식은 처음이군.',
            emotion: 'happy',
            characterImage: 'characters/leon_ardenia.png',
          },
          {
            speaker: 'Seraphina',
            text: '평화는 거창할 필요 없죠. [평화 조약 카드: 상호 서명] [재건 연합 카드: 구조 동기화] [위기 대응 프로토콜 카드: 공동 방어]',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '역사적 순간이야. 일곱 개국이 한 덱으로 연결됐어.',
            emotion: 'surprised',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Elena',
            text: '오늘은 마력이 아닌 마음으로 연동됐네요.',
            emotion: 'happy',
            characterImage: 'characters/elena_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '마음의 합주가 제일 강한 마법이죠.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Seraphina',
            text: '[빛 카드: 하모니 확장]',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postVictory: [
          {
            speaker: 'Lucian',
            text: '협약 체결 완료. 모든 서명 유효.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Leon',
            text: '전쟁 대신 건배라니, 이게 진짜 승리지.',
            emotion: 'happy',
            characterImage: 'characters/leon_ardenia.png',
          },
          {
            speaker: 'Seraphina',
            text: '피 대신 웃음, 칼 대신 약속. 그게 우리가 만든 새로운 규칙이에요.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Elena',
            text: '오늘의 협약은 문장보다 웃음이 많았어.',
            emotion: 'happy',
            characterImage: 'characters/elena_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '이게 진짜 평화의 형태예요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postDefeat: [
          {
            speaker: 'Leon',
            text: '회의가 깨졌다. 감정이 격해지기 전에 다시 정비하자.',
            emotion: 'angry',
            characterImage: 'characters/leon_ardenia.png',
          },
          {
            speaker: 'Seraphina',
            text: '약속을 다시 엮어서 초대하자고 전할게.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ]
      }
    },
    {
      id: 48, name: '새로운 박동', theme: 'Dawn', recommendedPower: 1200,
      firstReward: { gold: 4600, shards: 46 }, repeatReward: { gold: 2300, shards: 30 }, cleared: false,
      story: {
        description: '새벽 정원에서 세라피나가 친구와 가족과 함께 새 덱 ‘해일’을 열어 새로운 시작을 다짐한다.',
        backgroundImage: 'backgrounds/stage_27_sisters.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/mira.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Mira',
            text: '이제 정말 끝이네요, 아가씨.',
            emotion: 'happy',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Seraphina',
            text: '아니, 이제 시작이에요. [감정 노트 카드: 기록 개시] [해일 카드: 공명 시험]',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Elena',
            text: '이번 생, 후회 없지?',
            emotion: 'happy',
            characterImage: 'characters/elena_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '후회가 있으면 또 회귀하겠지만... 오늘은 그냥 감사해요.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '새 덱 해일. 감정값 100%, 희망 지수 최고치.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '마력 충전은 희망, 마력 방출은 조화. 이 흐름이 이어지는 한 어둠은 돌아오지 않아.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postVictory: [
          {
            speaker: 'Lucian',
            text: '모든 스토리지 정리 완료.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Mira',
            text: '정원 회복 완료! 향기가 달라요.',
            emotion: 'happy',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Elena',
            text: '이제는 정말 평화로 건배하자.',
            emotion: 'happy',
            characterImage: 'characters/elena_drake.png',
          },
          {
            speaker: 'Seraphina',
            text: '이 마력의 마지막 페이지는 희망이에요.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont.png',
          },
          {
            speaker: 'Lucian',
            text: '그리고 이건 새로운 서막이지.',
            emotion: 'determined',
            characterImage: 'characters/lucian_rosegarden.png',
          },
          {
            speaker: 'Seraphina',
            text: '맞아요. 새벽의 박동은 다시 시작됐어요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ],
        postDefeat: [
          {
            speaker: 'Mira',
            text: '마음이 아직 떨리세요? 멜로디부터 다시 맞춰요.',
            emotion: 'happy',
            characterImage: 'characters/mira.png',
          },
          {
            speaker: 'Seraphina',
            text: '희망이 잠깐 흔들렸어... 조율하고 돌아올게.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont.png',
          }
        ]
      }
    },
  ] satisfies CampaignStage[];

export function createInitialCampaignStages() {
  return campaignStageData.map<CampaignStage>(stage => ({
    ...stage,
    firstReward: {
      ...stage.firstReward,
      cards:
        'cards' in stage.firstReward && Array.isArray(stage.firstReward.cards)
          ? [...stage.firstReward.cards]
          : undefined,
    },
    repeatReward: {
      ...stage.repeatReward,
      cards:
        'cards' in stage.repeatReward && Array.isArray(stage.repeatReward.cards)
          ? [...stage.repeatReward.cards]
          : undefined,
    },
    story: stage.story ? { ...stage.story } : undefined,
    cutscene: stage.cutscene
      ? {
          preBattle: stage.cutscene.preBattle?.map(mapDialogueLine),
          postVictory: stage.cutscene.postVictory?.map(mapDialogueLine),
          postDefeat: stage.cutscene.postDefeat?.map(mapDialogueLine),
        }
      : undefined,
  }));
}

function mapDialogueLine(line: DialogueLine): DialogueLine {
  return { ...line };
}
