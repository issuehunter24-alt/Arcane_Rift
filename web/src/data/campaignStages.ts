import type { CampaignStage, DialogueLine } from '../types/campaign';

export const campaignStageData = [
    { 
      id: 1, name: '입문', theme: 'Neutral', recommendedPower: 100, 
      firstReward: { gold: 200, shards: 2 }, repeatReward: { gold: 100, shards: 1 }, cleared: false,
      story: {
        description: '세라피나가 벨몬트 가문의 전통 카드 배틀을 처음 배우는 날. 하인 Lucian이 친절하게 기본 규칙을 가르쳐준다.',
        backgroundImage: 'backgrounds/stage_01_training_1.png'
      },
      characterImage: 'characters/seraphina_belmont.png', // 주인공 세라피나
      enemyImage: 'characters/lucian_rosegarden.png', // 적 루시안
      cutscene: {
        preBattle: [
          {
            speaker: 'Lucian',
            text: '세라피나 아가씨, 벨몬트 가문의 훈련장에 오신 것을 진심으로 환영합니다.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden'
          },
          {
            speaker: 'Seraphina',
            text: '여기서 제가 어떤 시험을 치르게 될지 솔직히 조금 긴장돼요.',
            emotion: 'normal',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Lucian',
            text: '이곳은 가문의 전술을 몸에 익히는 첫 관문입니다. 카드 한 장, 움직임 한 번까지 모두 실전에 맞춰 설계돼 있죠.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden'
          },
          {
            speaker: 'Lucian',
            text: '안개, 지면, 장애물까지 완벽히 통제된 환경입니다. 여기서 안정적인 호흡을 만들어내면 그다음부터는 훨씬 수월해집니다.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden'
          },
          {
            speaker: 'Seraphina',
            text: '공기부터가 긴장감을 주네요. 하지만 이런 곳에서 시작한다면 금세 적응할 수 있을 것 같아요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Lucian',
            text: '카이 님도 이 훈련장에서 기초를 다졌습니다. 오늘은 그분이 걸었던 첫걸음을 그대로 밟아보는 셈이지요.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden'
          },
          {
            speaker: 'Seraphina',
            text: '그 길을 따라갈 수 있다면 더 바랄 것이 없겠네요. 어설프더라도 포기하지 않겠습니다.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Lucian',
            text: '좋습니다. 첫 스테이지에서는 카드 순환과 발놀림만 집중하세요. 승패보다 더 중요한 건 기본입니다.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden'
          },
          {
            speaker: 'Seraphina',
            text: '네. 오늘 목표는 호흡과 리듬, 그리고 다음 단계로 나아갈 자신감을 만드는 것.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Lucian',
            text: '바로 그 자세입니다. 이제 시작해볼까요?',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden'
          }
        ],
        postVictory: [
          {
            speaker: 'Lucian',
            text: '숨이 안정적이었습니다. 첫 승리치고는 자세가 매우 안정됐어요.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden'
          },
          {
            speaker: 'Seraphina',
            text: '초반엔 손이 떨렸는데, 호흡을 길게 가져가니 카드가 제자리를 찾더라고요.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Lucian',
            text: '다음 스테이지부터는 상대가 전술적으로 훨씬 날카로워집니다. 방금 익힌 템포를 잊지 마세요.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden'
          },
          {
            speaker: 'Seraphina',
            text: '전투를 다시 떠올리면서 움직임을 정리해 둘게요. 그럼 어떤 속도에도 흔들리지 않을 거예요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Lucian',
            text: '훌륭합니다. 지금의 집중력을 다음 스테이지에서도 이어가 봅시다.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden'
          }
        ],
        postDefeat: [
          {
            speaker: 'Lucian',
            text: '처음에는 누구나 발이 꼬이곤 합니다. 중요한 건 어디에서 리듬이 흐트러졌는지 확인하는 것이죠.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden'
          },
          {
            speaker: 'Seraphina',
            text: '카드를 던지는 타이밍을 서두르다가 순서를 놓쳤어요. 다음엔 호흡을 더 길게 잡아야겠어요.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Lucian',
            text: '방금 전투를 차근차근 복기해 봅시다. 다시 서 보면 금세 안정을 되찾게 될 겁니다.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden'
          },
          {
            speaker: 'Seraphina',
            text: '좋아요. 실수를 바로잡을 수 있다면 몇 번이고 다시 도전할 수 있어요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Lucian',
            text: '언제든 제가 곁에서 리듬을 맞춰드리겠습니다. 다시 호흡을 가다듬고 도전해 봅시다.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden'
          }
        ]
      }
    },
    { 
      id: 2, name: '불의 시련', theme: 'Fire', recommendedPower: 120, 
      firstReward: { gold: 0, shards: 2 }, repeatReward: { gold: 0, shards: 2 }, cleared: false,
      story: {
        description: '아리아나가 질투심으로 도전해온다. "카이 님의 약혼자라는 그 시골 소녀... 내 화염 카드의 힘을 봐!" 화산 지대에서 치열한 대결이 펼쳐진다.',
        backgroundImage: 'backgrounds/stage_02_fire_1.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/ariana_drake.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Ariana',
            text: '당신이 세라피나? 카이 님 곁에 선다는 그 시골 소녀가 맞는지 두 눈으로 확인하려고 왔어.',
            emotion: 'angry',
            characterImage: 'characters/ariana_drake'
          },
          {
            speaker: 'Seraphina',
            text: '맞아요. 저는 세라피나 벨몬트가 될 사람입니다. 당신이 아리아나인가요?',
            emotion: 'normal',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Ariana',
            text: '그래. 카이 님과 함께 성장한 나에게 약혼녀로서의 자격을 증명해보인다고? 말뿐이라면 바로 여기서 끝이야.',
            emotion: 'angry',
            characterImage: 'characters/ariana_drake'
          },
          {
            speaker: 'Seraphina',
            text: '카이가 어떤 사람인지 누구보다 잘 알고 싶어요. 그러기 위해서라면 당신과의 대결도 피하지 않을 겁니다.',
            emotion: 'angry',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Ariana',
            text: '좋아. 이 화산 지대는 나의 무대야. 뜨거운 기류에 집중하지 못하면 그대로 타버릴 거라고!',
            emotion: 'angry',
            characterImage: 'characters/ariana_drake'
          },
          {
            speaker: 'Seraphina',
            text: '숨을 깊게 들이쉬면 유황 향 속에서도 다른 향기를 느낄 수 있네요. 당신이 얼마나 연습했는지 알 것 같아요.',
            emotion: 'normal',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Ariana',
            text: '말은 그럴듯하네. 그럼 화염 장미를 피할 각오라도 되어 있는지 보여봐!',
            emotion: 'angry',
            characterImage: 'characters/ariana_drake'
          }
        ],
        postVictory: [
          {
            speaker: 'Ariana',
            text: '불꽃이 꺼져버리다니... 내가 졌다고 인정해야겠네.',
            emotion: 'sad',
            characterImage: 'characters/ariana_drake'
          },
          {
            speaker: 'Seraphina',
            text: '당신의 화염은 정말 아름다웠어요. 저도 그 열기에 사로잡힐 뻔했죠.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Ariana',
            text: '흥... 인정은 하지만 마음까지 내주진 않을 거야. 다음엔 더 뜨겁게 불태울 테니까.',
            emotion: 'angry',
            characterImage: 'characters/ariana_drake'
          },
          {
            speaker: 'Seraphina',
            text: '언제든 좋아요. 당신과 다시 맞붙을 수 있다면 저도 더 성장해 있을 테니까요.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Ariana',
            text: '그 말, 꼭 기억해. 카이 님 옆에 설 자격을 진짜 증명할 때까지 끝내주지 않을 거야.',
            emotion: 'angry',
            characterImage: 'characters/ariana_drake'
          }
        ],
        postDefeat: [
          {
            speaker: 'Ariana',
            text: '봐, 이게 나와 카이 님이 쌓아온 실력이야. 아직 불꽃에 몸을 맡길 준비가 안 된 거지.',
            emotion: 'happy',
            characterImage: 'characters/ariana_drake'
          },
          {
            speaker: 'Seraphina',
            text: '화염의 리듬을 따라가지 못했어요... 다시 연습해서 돌아오겠습니다.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Ariana',
            text: '그 용기가 있다면 언젠가 다시 만나겠지. 그때는 오늘보다 뜨거운 전장을 준비해둘게.',
            emotion: 'angry',
            characterImage: 'characters/ariana_drake'
          },
          {
            speaker: 'Seraphina',
            text: '기다려 주세요. 다음에는 저도 불꽃을 친구로 만들고 돌아올게요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          }
        ]
      }
    },
    { 
      id: 3, name: '얼음 요새', theme: 'Ice', recommendedPower: 140, 
      firstReward: { gold: 250, shards: 3 }, repeatReward: { gold: 120, shards: 2 }, cleared: false,
      story: {
        description: '얼음 속성 마법사 Seraphine Winters와의 대결. 거대한 빙결 성채에서 차가운 마법이 휘몰아친다. 전략적인 플레이가 필요하다.',
        backgroundImage: 'backgrounds/stage_03_ice_1.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/seraphine_winters.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Seraphine Winters',
            text: '빙결 성채에 온 것을 환영해요. 나는 Seraphine Winters, 얼음 마법의 수호자예요.',
            emotion: 'normal',
            characterImage: 'characters/elena_drake'
          },
          {
            speaker: 'Seraphina',
            text: '저도 Seraphine라는 이름인데, 이렇게 만나게 되다니 신기하네요.',
            emotion: 'surprised',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Seraphine Winters',
            text: '이름이 같다고 길을 내주진 않아요. 여기서는 감정까지 얼려두지 않으면 한순간에 패배하거든요.',
            emotion: 'normal',
            characterImage: 'characters/elena_drake'
          },
          {
            speaker: 'Seraphina',
            text: '화염 스테이지까지는 감정에 기대어 싸웠어요. 이번엔 조금 다르게 접근해볼게요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Seraphine Winters',
            text: '좋아요. 숨을 들이쉴 때마다 얼음이 폐를 스치고 지나갈 거예요. 그 차가움을 즐겨보세요.',
            emotion: 'normal',
            characterImage: 'characters/elena_drake'
          },
          {
            speaker: 'Seraphina',
            text: '차가움 속에 있는 고요를 느껴볼게요. 그 고요 속에서 제 전략을 찾겠습니다.',
            emotion: 'normal',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Seraphine Winters',
            text: '바로 그 태도예요. 얼음은 부드러움과 단단함을 동시에 품고 있으니까요. 준비됐다면 시작하죠.',
            emotion: 'happy',
            characterImage: 'characters/elena_drake'
          }
        ],
        postVictory: [
          {
            speaker: 'Seraphine Winters',
            text: '훌륭하네요. 당신의 전략은 얼음 위에서 춤추듯 유연했어요.',
            emotion: 'happy',
            characterImage: 'characters/elena_drake'
          },
          {
            speaker: 'Seraphina',
            text: '감사합니다. 차가움 속에서도 움직임을 멈추지 않는 게 중요하다는 걸 배웠어요.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Seraphine Winters',
            text: '얼음은 감정을 얼리는 것이 아니라, 감정을 투명하게 만드는 힘이랍니다. 그 투명함을 잊지 마세요.',
            emotion: 'normal',
            characterImage: 'characters/elena_drake'
          },
          {
            speaker: 'Seraphina',
            text: '네. 제 마음을 다시 돌아보게 되었어요. 다음 전투에서 꼭 활용할게요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          }
        ],
        postDefeat: [
          {
            speaker: 'Seraphine Winters',
            text: '얼음에 몸이 굳었군요. 아직 호흡이 얼음의 속도에 맞춰지지 않았어요.',
            emotion: 'normal',
            characterImage: 'characters/elena_drake'
          },
          {
            speaker: 'Seraphina',
            text: '차갑다는 느낌만 생각했더니 손끝이 움직이지 않았어요. 다시 감각을 익혀야겠네요.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Seraphine Winters',
            text: '물로 손을 적시고 다시 얼음 위에 올려보세요. 차가움에 익숙해지면 감정도 투명해질 겁니다.',
            emotion: 'happy',
            characterImage: 'characters/elena_drake'
          },
          {
            speaker: 'Seraphina',
            text: '조언 고마워요. 다음에는 고요 속에서 길을 찾아 다시 도전할게요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          }
        ]
      }
    },
    { 
      id: 4, name: '뇌전의 탑', theme: 'Lightning', recommendedPower: 160, 
      firstReward: { gold: 0, shards: 2 }, repeatReward: { gold: 0, shards: 2 }, cleared: false,
      story: {
        description: '왕국 기사단의 전기 마법사 Leon Ardenia. "벨몬트 가문의 새 아가씨라고? 흥미롭군. 나의 뇌전 마법을 막아보시지." 번개가 치는 폭풍우 탑에서 강력한 적수를 만난다.',
        backgroundImage: 'backgrounds/stage_04_lightning_1.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/leon_ardenia.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Leon Ardenia',
            text: '벨몬트 가문의 새 아가씨라... 소문이 궁금해 직접 내려왔지.',
            emotion: 'normal',
            characterImage: 'characters/leon_ardenia'
          },
          {
            speaker: 'Seraphina',
            text: '왕국 기사단의 Leon Ardenia 님, 뵙게 되어 영광입니다. 번개처럼 빠른 전술을 직접 보고 싶었어요.',
            emotion: 'normal',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Leon Ardenia',
            text: '이 탑은 번개구름이 하루에도 수십 번 지나가는 곳이다. 한 번 방심하면 바로 감전돼서 추락하지.',
            emotion: 'normal',
            characterImage: 'characters/leon_ardenia'
          },
          {
            speaker: 'Seraphina',
            text: '바람과 얼음을 지나온 지금, 번개의 속도에도 적응해보고 싶어요. 저를 시험해 주세요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Leon Ardenia',
            text: '좋다. 번개는 망설임을 용서하지 않는다. 카드 순서를 머릿속으로 세 번 외운 뒤 그대로 실행해라.',
            emotion: 'normal',
            characterImage: 'characters/leon_ardenia'
          },
          {
            speaker: 'Seraphina',
            text: '호흡을 맞추고, 마음을 가볍게... 번개의 박자를 따라가겠습니다.',
            emotion: 'normal',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Leon Ardenia',
            text: '그 의지를 번개보다 빠르게 보여줘라. 망설임이 보이면 바로 떨어뜨릴 것이다.',
            emotion: 'angry',
            characterImage: 'characters/leon_ardenia'
          }
        ],
        postVictory: [
          {
            speaker: 'Leon Ardenia',
            text: '...대단하군. 내 뇌전의 궤적을 정확히 읽어낸 자는 처음이네.',
            emotion: 'surprised',
            characterImage: 'characters/leon_ardenia'
          },
          {
            speaker: 'Seraphina',
            text: '손끝이 아직 찌릿하지만, 번개의 길을 머릿속으로 따라가니 보이더라고요.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Leon Ardenia',
            text: '벨몬트 가문이 좋은 선택을 했군. 다음에 만날 땐 기사단의 전술을 전부 가르쳐줄 수도 있겠다.',
            emotion: 'happy',
            characterImage: 'characters/leon_ardenia'
          },
          {
            speaker: 'Seraphina',
            text: '그날을 기대할게요. 오늘 배운 속도를 기억해 두겠습니다.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          }
        ],
        postDefeat: [
          {
            speaker: 'Leon Ardenia',
            text: '망설였군. 번개는 단 한 번의 주저도 허용하지 않는다.',
            emotion: 'normal',
            characterImage: 'characters/leon_ardenia'
          },
          {
            speaker: 'Seraphina',
            text: '속도를 따라가려다 보니 손이 먼저 움직여 버렸어요... 순서를 놓쳤습니다.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Leon Ardenia',
            text: '카드를 뽑기 전에 박자를 세어라. "하나, 둘, 번개." 그 리듬을 뼛속에 새기면 된다.',
            emotion: 'normal',
            characterImage: 'characters/leon_ardenia'
          },
          {
            speaker: 'Seraphina',
            text: '다시 리듬을 맞춰서 도전하겠습니다. 번개의 속도를 제 것으로 만들고 싶어요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          }
        ]
      }
    },
    { 
      id: 5, name: '바람의 신전', theme: 'Wind', recommendedPower: 180, 
      firstReward: { gold: 300, shards: 3 }, repeatReward: { gold: 150, shards: 2 }, cleared: false,
      story: {
        description: '구름 위에 떠있는 고대 천공 신전. 벨몬트 가문의 여동생 Iris가 언니의 실력을 테스트한다. 바람이 불고 하늘빛이 아름다운 환상적인 장소에서의 시험.',
        backgroundImage: 'backgrounds/stage_05_wind_1.png'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/iris_belmont.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Iris Belmont',
            text: '언니! 구름 위까지 올라온 거야? 여기까지 오는 걸 보고 싶었어!',
            emotion: 'happy',
            characterImage: 'characters/iris_belmont'
          },
          {
            speaker: 'Seraphina',
            text: 'Iris, 너다운 환영이네. 바람이 기분 좋게 불어와서 긴장이 조금 풀려.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Iris Belmont',
            text: '이 신전은 우리 집안에서 가장 자유로운 곳이야. 하지만 방심하면 바로 아래로 떨어지니까 집중해야 해!',
            emotion: 'normal',
            characterImage: 'characters/iris_belmont'
          },
          {
            speaker: 'Seraphina',
            text: '알겠어. 바람처럼 가볍게, 하지만 중심은 놓치지 않을게.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Iris Belmont',
            text: '언니가 가문에 와준 게 너무 좋아. 그래서 언니가 얼마나 멋진지 직접 확인하고 싶었어!',
            emotion: 'happy',
            characterImage: 'characters/iris_belmont'
          },
          {
            speaker: 'Seraphina',
            text: '그러면 언니가 얼마나 멋진지 보여줄 시간인가 보네? 기대해줘.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Iris Belmont',
            text: '좋아! 바람처럼 빠르게 움직여보자! 졸릴 틈도 없이 몰아붙일 거야!',
            emotion: 'angry',
            characterImage: 'characters/iris_belmont'
          }
        ],
        postVictory: [
          {
            speaker: 'Iris Belmont',
            text: '와... 역시 언니야! 바람을 가로질러 춤추는 것 같았어!',
            emotion: 'happy',
            characterImage: 'characters/iris_belmont'
          },
          {
            speaker: 'Seraphina',
            text: '너 덕분에 움직임이 더 부드러워졌어. 네가 만들어 준 공중의 흐름이 길을 보여주더라.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Iris Belmont',
            text: '그럼 다음에는 더 높이 날아보자! 언니가 점점 가벼워지는 느낌이 나!',
            emotion: 'happy',
            characterImage: 'characters/iris_belmont'
          },
          {
            speaker: 'Seraphina',
            text: '응. 언젠가 가족 모두가 같은 하늘을 보며 웃을 수 있도록 더 연습할게.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          }
        ],
        postDefeat: [
          {
            speaker: 'Iris Belmont',
            text: '괜찮아? 바람이 마음대로 불어서 놀랐지? 처음엔 누구나 흔들려.',
            emotion: 'surprised',
            characterImage: 'characters/iris_belmont'
          },
          {
            speaker: 'Seraphina',
            text: '몸이 가벼워지는 걸 즐기다가 중심을 잃어버렸어. 다시 자세를 다듬어야겠어.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Iris Belmont',
            text: '그럼 내가 옆에서 바람을 잡아줄게! 언니가 익숙해질 때까지 같이 연습하자!',
            emotion: 'happy',
            characterImage: 'characters/iris_belmont'
          },
          {
            speaker: 'Seraphina',
            text: '고마워, Iris. 다시 한 번 하늘을 가르는 느낌을 배우고 올게.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          }
        ]
      }
    },
    { 
      id: 6, name: '화염과 빙설', theme: 'FireIce', recommendedPower: 210,
      firstReward: { gold: 320, shards: 3 }, repeatReward: { gold: 160, shards: 2 }, cleared: false,
      story: {
        description: '화염 마법사 Ariana와 얼음 마법사 Seraphine이 동시에 설계한 이중 속성 훈련장. 반쪽은 불길이, 다른 반쪽은 얼음이 뒤덮어 급격한 온도 변화를 견뎌야 한다.',
        backgroundImage: 'backgrounds/stage_06_fire_ice_1.webp'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/ariana_drake.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Ariana',
            text: '드디어 두 속성을 동시에 다루는 시험이야. 반쪽은 내 화염, 반대편은 Seraphine이 얼려놨어.',
            emotion: 'happy',
            characterImage: 'characters/ariana_drake'
          },
          {
            speaker: 'Seraphina',
            text: '숨을 들이쉬면 뜨겁고, 내쉬면 얼어붙는 느낌이에요... 하지만 이 대비가 분명 도움이 되겠죠.',
            emotion: 'surprised',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Seraphine Winters',
            text: '목표는 단순 승리가 아니에요. 두 속성 사이에서 균형을 잡으며 카드 순서를 조정하는 감각을 익히는 겁니다.',
            emotion: 'normal',
            characterImage: 'characters/seraphine_winters'
          },
          {
            speaker: 'Ariana',
            text: '뜨거워졌다가 곧바로 차가워질 거야. 그때 망설이면 카드가 부서져버려. 온도뿐 아니라 마음의 속도도 함께 조절해봐.',
            emotion: 'angry',
            characterImage: 'characters/ariana_drake'
          },
          {
            speaker: 'Seraphina',
            text: '감정을 억누르지 않고 흐름에 맞추겠습니다. 두 분의 조언을 몸에 새겨서 균형을 잡아 볼게요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Seraphine Winters',
            text: '호흡을 절반마다 나눠 생각하세요. 들이쉬면서 화염을, 내쉬면서 얼음을 손에 얹는다고 상상하면 흐름을 잡을 수 있어요.',
            emotion: 'happy',
            characterImage: 'characters/seraphine_winters'
          },
          {
            speaker: 'Ariana',
            text: '좋아, 그럼 비밀 열기를 풀어볼까? 불꽃이 꺼지기 전에 따라와 봐.',
            emotion: 'happy',
            characterImage: 'characters/ariana_drake'
          }
        ],
        postVictory: [
          {
            speaker: 'Ariana',
            text: '화염이 얼음과 함께 춤췄어. 이제 네 에너지가 흔들리지 않고 이어지는 게 보이네.',
            emotion: 'happy',
            characterImage: 'characters/ariana_drake'
          },
          {
            speaker: 'Seraphine Winters',
            text: '열과 냉기를 번갈아 다루는 손놀림이 훨씬 매끄러워졌어요. 다음엔 그 흐름에 회복 카드도 섞어보죠.',
            emotion: 'happy',
            characterImage: 'characters/seraphine_winters'
          },
          {
            speaker: 'Seraphina',
            text: '화염이 달아오를 때마다 얼음이 바로 식혀주는 느낌이었어요. 두 분의 조언 덕분입니다.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Ariana',
            text: '우릴 상대로 버텨냈으니 앞으로 다른 속성 조합도 거뜬할 거야. 기념으로 불꽃차 한 잔 마시자.',
            emotion: 'happy',
            characterImage: 'characters/ariana_drake'
          }
        ],
        postDefeat: [
          {
            speaker: 'Ariana',
            text: '불길이 높아지면 얼음이 금방 녹아버려. 그 전에 온도를 낮춰야지.',
            emotion: 'angry',
            characterImage: 'characters/ariana_drake'
          },
          {
            speaker: 'Seraphina',
            text: '화염을 따라가느라 얼음의 호흡을 놓쳤어요. 두 흐름을 동시에 느끼는 게 쉽지 않네요.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Seraphine Winters',
            text: '먼저 손끝을 얼음에 담갔다가 불꽃에 가져다 대보세요. 감각을 번갈아 자극하면 균형이 쉬워집니다.',
            emotion: 'normal',
            characterImage: 'characters/seraphine_winters'
          },
          {
            speaker: 'Ariana',
            text: '다시 도전해. 얼음이 숨을 고르게 해줄 거야. 내가 바로 앞에서 지켜보고 있을게.',
            emotion: 'happy',
            characterImage: 'characters/ariana_drake'
          }
        ]
      }
    },
    { 
      id: 7, name: '폭풍의 전장', theme: 'Storm', recommendedPower: 240,
      firstReward: { gold: 330, shards: 3 }, repeatReward: { gold: 170, shards: 2 }, cleared: false,
      story: {
        description: '거대한 태풍의 눈을 재현한 전장. 사방에서 몰아치는 바람과 번개 사이에서 균형과 버티기를 동시에 시험한다.',
        backgroundImage: 'backgrounds/stage_07_storm_1.webp'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/garen_stone.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Garen Stone',
            text: '바람이 속삭이는군. 태풍의 중심에서 버틸 준비는 됐나?',
            emotion: 'normal',
            characterImage: 'characters/garen_stone'
          },
          {
            speaker: 'Iris Belmont',
            text: '언니, 여기서는 발끝까지 힘을 줘야 해! 바람이 장난 아니거든!',
            emotion: 'happy',
            characterImage: 'characters/iris_belmont'
          },
          {
            speaker: 'Seraphina',
            text: '공기가 끊임없이 흔들려요. 방금 배운 화염과 얼음의 호흡이 여기에서도 도움이 될까요?',
            emotion: 'surprised',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Garen Stone',
            text: '바람은 곧 균형이다. 앞뒤로 쏠리지 말고, 카드 한 장마다 중심을 다시 세워라.',
            emotion: 'angry',
            characterImage: 'characters/garen_stone'
          },
          {
            speaker: 'Iris Belmont',
            text: '바람에 몸을 맡기고 따라가면 돼. 그러다 중요한 순간에 힘을 주면 멋지게 날 수 있어!',
            emotion: 'happy',
            characterImage: 'characters/iris_belmont'
          },
          {
            speaker: 'Seraphina',
            text: '흔들리는 감정을 그대로 메모하겠습니다. 오늘은 바람과 친구가 되어볼게요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          }
        ],
        postVictory: [
          {
            speaker: 'Garen Stone',
            text: '폭풍 속에서 중심을 잃지 않았다. 대지 위에서도 버틸 힘이 생겼군.',
            emotion: 'surprised',
            characterImage: 'characters/garen_stone'
          },
          {
            speaker: 'Iris Belmont',
            text: '언니, 진짜 멋졌어! 바람이 언니 말을 듣는 것 같았어!',
            emotion: 'happy',
            characterImage: 'characters/iris_belmont'
          },
          {
            speaker: 'Seraphina',
            text: '폭풍 속에서도 마음을 적어두니까 두려움이 줄었어요. 다음은 땅에서 버티는 법을 다시 다져보겠습니다.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Garen Stone',
            text: '좋다. 곧 대지의 숨결을 다시 확인하게 될 것이다.',
            emotion: 'normal',
            characterImage: 'characters/garen_stone'
          }
        ],
        postDefeat: [
          {
            speaker: 'Garen Stone',
            text: '바람에 몸을 맡기기만 하면 안 된다. 중심이 없으면 바로 날아가 버린다.',
            emotion: 'angry',
            characterImage: 'characters/garen_stone'
          },
          {
            speaker: 'Seraphina',
            text: '순간적으로 흔들렸어요. 바람과 싸우려다 더 크게 밀렸습니다.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Iris Belmont',
            text: '다시 해보자! 내가 옆에서 바람을 읽는 법을 알려줄게!',
            emotion: 'happy',
            characterImage: 'characters/iris_belmont'
          },
          {
            speaker: 'Garen Stone',
            text: '무릎을 굽히고, 손바닥으로 기류를 느껴라. 균형을 잡으면 폭풍도 길들인다.',
            emotion: 'normal',
            characterImage: 'characters/garen_stone'
          }
        ]
      }
    },
    { 
      id: 8, name: '정예 부대', theme: 'Elite', recommendedPower: 280, 
      firstReward: { gold: 340, shards: 3 }, repeatReward: { gold: 170, shards: 2 }, cleared: false,
      story: {
        description: '벨몬트 가문의 정예 부대가 사용하는 비밀 훈련소. 전술, 협력, 리더십을 동시에 요구하는 고난도 시험이다.',
        backgroundImage: 'backgrounds/stage_08_elite_1.webp'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/marcus_belmont.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Marcus Belmont',
            text: '정예 부대를 지휘하려면 감정에 휘둘려선 안 된다. 네가 그 자격이 있는지 확인하겠다.',
            emotion: 'angry',
            characterImage: 'characters/marcus_belmont'
          },
          {
            speaker: 'Seraphina',
            text: 'Marcus 님, 이 시험을 통과해 벨몬트 가문의 신뢰를 더 얻고 싶습니다.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Lucian',
            text: '전투 도중에도 동료에게 명령을 내리고, 동시에 카드 순환을 예측해야 합니다. 머릿속에서 상황을 계속 정리하세요.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden'
          },
          {
            speaker: 'Marcus Belmont',
            text: '정예는 실패를 두려워하지 않지만, 이유 없는 패배도 용납하지 않는다. 한 장 한 장 목적을 가지고 쓰도록 해라.',
            emotion: 'normal',
            characterImage: 'characters/marcus_belmont'
          },
          {
            speaker: 'Seraphina',
            text: '카드마다 역할을 정의하고 전선을 지키겠습니다. 모두를 보호할 움직임을 찾을게요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Marcus Belmont',
            text: '좋다. 지금부터는 감정이 아닌 판단으로 싸워라.',
            emotion: 'normal',
            characterImage: 'characters/marcus_belmont'
          }
        ],
        postVictory: [
          {
            speaker: 'Marcus Belmont',
            text: '명령이 끊기지 않았다. 정예 병사들도 네 지휘를 따를 만하겠군.',
            emotion: 'surprised',
            characterImage: 'characters/marcus_belmont'
          },
          {
            speaker: 'Lucian',
            text: '방금 전투는 "전술 목표 → 카드 배치 → 후속 대응"이 또렷했습니다.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden'
          },
          {
            speaker: 'Seraphina',
            text: '이번엔 감정이 아닌 팀의 움직임에 집중했어요. 정말 큰 도움이 되었습니다.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Marcus Belmont',
            text: '다음에 다시 시험할 것이다. 그때도 방심하지 마라.',
            emotion: 'normal',
            characterImage: 'characters/marcus_belmont'
          }
        ],
        postDefeat: [
          {
            speaker: 'Marcus Belmont',
            text: '명령이 흐트러졌다. 정예 부대는 혼란을 용납하지 않는다.',
            emotion: 'angry',
            characterImage: 'characters/marcus_belmont'
          },
          {
            speaker: 'Seraphina',
            text: '전술을 미리 준비했는데 상황에 맞춰 수정하지 못했어요... 다시 구성하겠습니다.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Lucian',
            text: '방금 흔들렸던 지점을 다시 짚어보세요. 패턴을 찾으면 곧바로 개선됩니다.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden'
          },
          {
            speaker: 'Marcus Belmont',
            text: '다시 준비해 와라. 다음엔 내가 더 많은 변수를 던질 것이다.',
            emotion: 'normal',
            characterImage: 'characters/marcus_belmont'
          }
        ]
      }
    },
    { 
      id: 9, name: '보스 전초전', theme: 'Shadow Corridor', recommendedPower: 320,
      firstReward: { gold: 360, shards: 4 }, repeatReward: { gold: 180, shards: 2 }, cleared: false,
      story: {
        description: '최종 보스 방으로 이어지는 어두운 복도. 빛이 거의 들지 않는 긴 통로에서 집중력과 인내심을 시험한다.',
        backgroundImage: 'backgrounds/stage_09_corridor_1.webp'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/darius_blackwood.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Darius Blackwood',
            text: '마지막 문을 지키는 자로서 다시 한 번 묻지. 어둠을 지나갈 용기가 있는가?',
            emotion: 'normal',
            characterImage: 'characters/darius_blackwood'
          },
          {
            speaker: 'Seraphina',
            text: '심장이 빨리 뛰지만... 여기서 물러설 수는 없어요. 떨림을 인정하면서도 전진하겠습니다.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Darius Blackwood',
            text: '두려움이 생기면 이름을 붙여라. 이름 붙은 공포는 더 이상 괴물이 아니다.',
            emotion: 'normal',
            characterImage: 'characters/darius_blackwood'
          },
          {
            speaker: 'Seraphina',
            text: '이 감정을 "떨림"이라 부르겠습니다. 그 떨림이 저를 앞으로 밀어주는 힘이 되도록 하겠습니다.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Darius Blackwood',
            text: '좋다. 복도 끝에서 빛이 보일 때까지, 마음을 놓지 말아라.',
            emotion: 'angry',
            characterImage: 'characters/darius_blackwood'
          }
        ],
        postVictory: [
          {
            speaker: 'Darius Blackwood',
            text: '어둠 속에서 흔들리지 않았다. 네 안의 빛을 믿었군.',
            emotion: 'surprised',
            characterImage: 'characters/darius_blackwood'
          },
          {
            speaker: 'Seraphina',
            text: '두려움에 이름을 붙이니 흐려졌어요. 덕분에 마지막 문까지 도달할 수 있었습니다.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Darius Blackwood',
            text: '자, 다음은 드레이크 저택이다. 그곳에서 또 다른 시험을 맞이하게 될 것이다.',
            emotion: 'normal',
            characterImage: 'characters/darius_blackwood'
          }
        ],
        postDefeat: [
          {
            speaker: 'Darius Blackwood',
            text: '어둠이 고개를 들었다. 그때 넌 숨을 멈췄지.',
            emotion: 'normal',
            characterImage: 'characters/darius_blackwood'
          },
          {
            speaker: 'Seraphina',
            text: '맞아요... 호흡을 잊고 말았어요. 다시 어둠 속 호흡부터 다듬어 오겠습니다.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Darius Blackwood',
            text: '눈을 감고, 한 걸음마다 "빛"이라고 속삭여라. 어둠은 그 단어를 두려워한다.',
            emotion: 'normal',
            characterImage: 'characters/darius_blackwood'
          },
          {
            speaker: 'Darius Blackwood',
            text: '다시 오거라. 문은 언제나 여기서 기다릴 것이다.',
            emotion: 'happy',
            characterImage: 'characters/darius_blackwood'
          }
        ]
      }
    },
    { 
      id: 10, name: '드레이크 저택', theme: 'Estate', recommendedPower: 200,
      firstReward: { gold: 380, shards: 4 }, repeatReward: { gold: 190, shards: 2 }, cleared: false,
      story: {
        description: '드레이크 가문의 정원에서 치르는 친선 배틀. 따뜻한 환대 속에서 엘레나와의 호흡을 맞추며 신뢰를 쌓는다.',
        backgroundImage: 'backgrounds/stage_10_final_boss_1.webp'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/elena_drake.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Elena Drake',
            text: '세라피나, 드레이크 저택에 온 걸 환영해요. 정원에서 직접 실력을 보고 싶었어요.',
            emotion: 'happy',
            characterImage: 'characters/elena_drake'
          },
          {
            speaker: 'Seraphina',
            text: '엘레나 님, 이렇게 초대해 주셔서 감사합니다. 저도 가문의 일원이 되려면 더 많은 걸 배워야 하니까요.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Kai Drake',
            text: '둘 다 너무 긴장하지 마. 가족끼리 하는 연습일 뿐이니까.',
            emotion: 'happy',
            characterImage: 'characters/kai_drake'
          },
          {
            speaker: 'Elena Drake',
            text: '카이가 옆에 있으니 안심했겠지만, 난 너의 집중력을 시험할 거야. 정원은 온화하지만 전투는 다를 테니.',
            emotion: 'angry',
            characterImage: 'characters/elena_drake'
          },
          {
            speaker: 'Seraphina',
            text: '알겠습니다. 오늘 느낀 감정을 마음에 깊이 새겨두고 싶어요. 언젠가 이 순간을 떠올리며 미소 짓고 싶거든요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Kai Drake',
            text: '두 사람 모두 즐겁게 싸워줘. 내가 응원하고 있을게.',
            emotion: 'happy',
            characterImage: 'characters/kai_drake'
          }
        ],
        postVictory: [
          {
            speaker: 'Elena Drake',
            text: '생각보다 훨씬 강하네. 우리 가문에 잘 어울리는 열정이야.',
            emotion: 'surprised',
            characterImage: 'characters/elena_drake'
          },
          {
            speaker: 'Seraphina',
            text: '엘레나 님의 매너 덕분에 전투가 즐거웠어요. 오늘 승부를 "따뜻한 전투"로 기억하겠습니다.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Kai Drake',
            text: '두 사람 모두 정말 잘했어. 이런 장면을 더 자주 보고 싶다니까.',
            emotion: 'happy',
            characterImage: 'characters/kai_drake'
          },
          {
            speaker: 'Elena Drake',
            text: '다음에는 내가 준비한 티타임에서 전략을 이야기해보자. 가족이 될 사람에게 꼭 보여주고 싶은 게 많거든.',
            emotion: 'happy',
            characterImage: 'characters/elena_drake'
          }
        ],
        postDefeat: [
          {
            speaker: 'Elena Drake',
            text: '긴장이 아직 남아있네. 정원에서는 숨을 크게 쉬어도 괜찮아.',
            emotion: 'normal',
            characterImage: 'characters/elena_drake'
          },
          {
            speaker: 'Seraphina',
            text: '정원의 향기에 취해 집중을 놓쳤어요. 다시 한 번 차분하게 해보고 싶습니다.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Kai Drake',
            text: '실패도 괜찮아. 이 순간을 기억해두면 언젠가 웃으며 이야기할 수 있을 거야.',
            emotion: 'happy',
            characterImage: 'characters/kai_drake'
          },
          {
            speaker: 'Elena Drake',
            text: '다시 정원에 올 때까지 실력을 더 다듬어봐. 우리 저택은 언제든 환영이야.',
            emotion: 'happy',
            characterImage: 'characters/elena_drake'
          }
        ]
      }
    },
    { 
      id: 11, name: '중급 시험', theme: 'Lucian2', recommendedPower: 220, 
      firstReward: { gold: 400, shards: 4 }, repeatReward: { gold: 200, shards: 2 }, cleared: false,
      story: {
        description: '세라피나의 실력 향상을 확인하는 재검증 배틀. 첫 배틀보다 훨씬 강해진 Lucian과 싸워 중급 마법사 수준을 증명한다.',
        backgroundImage: 'backgrounds/stage_11_training_advanced.webp'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/lucian_rosegarden.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Lucian',
            text: '아가씨, 초급 시험 이후로 정말 빠르게 성장하고 계십니다. 이제는 중급 마법사 수준을 검증할 차례지요.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden'
          },
          {
            speaker: 'Seraphina',
            text: '그동안 배운 것들을 체계적으로 정리해봤어요. 오늘 그 결과를 보여드릴게요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Lucian',
            text: '이번 시험에서는 속성과 카드 순환, 그리고 위기 대처 능력을 동시에 보겠습니다. 마음가짐도 단단히 준비하세요.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden'
          },
          {
            speaker: 'Seraphina',
            text: '네. 어떤 감정이 오더라도 흔들리지 않도록 다잡겠습니다. 그것이 제가 성장하는 방법이니까요.',
            emotion: 'normal',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Lucian',
            text: '좋습니다. 제 손에 들린 이 카드는 가문 내에서도 위험하다고 알려진 기술입니다. 완벽히 대응해보세요.',
            emotion: 'angry',
            characterImage: 'characters/lucian_rosegarden'
          },
          {
            speaker: 'Seraphina',
            text: '기대하고 있을게요. 당신에게 배운 것을 실전으로 보여줄 수 있다면 더할 나위 없겠죠.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          }
        ],
        postVictory: [
          {
            speaker: 'Lucian',
            text: '대단합니다! 섬세한 카드 운용과 침착한 판단력... 이 정도면 중급 마법사로 인정해도 되겠네요.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden'
          },
          {
            speaker: 'Seraphina',
            text: '처음으로 전투 중에 감정이 흔들리지 않았어요. 대신 상황을 차분히 분석했죠.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Lucian',
            text: '그 집중력은 훗날 큰 자산이 될 겁니다. 다음 시험에서도 그 침착함을 기대하겠습니다.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden'
          },
          {
            speaker: 'Seraphina',
            text: '앞으로도 계속 성장하는 모습을 보여드릴게요. 그 다짐을 잊지 않겠습니다.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          }
        ],
        postDefeat: [
          {
            speaker: 'Lucian',
            text: '아직 약간의 흔들림이 보입니다. 특히 긴급 상황에서 카드 선택이 지연됐죠.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden'
          },
          {
            speaker: 'Seraphina',
            text: '맞아요... 머리로는 이해했는데 손이 따라주지 않았어요. 다시 반복해보겠습니다.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Lucian',
            text: '실패 또한 복기해 두세요. 두려움을 솔직히 인정하면 다음엔 더 빨리 극복할 수 있습니다.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden'
          },
          {
            speaker: 'Seraphina',
            text: '조언 고마워요. 감정을 정확히 다잡고 다시 도전하겠습니다.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          }
        ]
      }
    },
    { 
      id: 12, name: '화염 마스터', theme: 'Fire2', recommendedPower: 240, 
      firstReward: { gold: 450, shards: 4 }, repeatReward: { gold: 220, shards: 2 }, cleared: false,
      story: {
        description: '화염 마법의 정수를 담은 신성한 성소에서의 대결. 더욱 강렬하고 집중된 불의 에너지.',
        backgroundImage: 'backgrounds/stage_12_fire_master.webp'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/ariana_drake.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Ariana',
            text: 'Stage 11에서 보여준 성장, 정말 놀라웠어. 하지만 지금은 순수한 화염의 본질을 다루는 시험이야.',
            emotion: 'happy',
            characterImage: 'characters/ariana_drake'
          },
          {
            speaker: 'Seraphina',
            text: 'Lucian도 제 실력이 중급 마법사 수준이라고 인정해줬어요. 지금은 그걸 증명해야겠죠.',
            emotion: 'normal',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Ariana',
            text: '불꽃은 감정과 연결되어 있어. 집중하지 못하면 곧바로 폭주하지. 마음을 안정시키고 플로우를 느껴봐.',
            emotion: 'normal',
            characterImage: 'characters/ariana_drake'
          },
          {
            speaker: 'Seraphina',
            text: '카이와 약속했어요. 감정에 휩쓸리지 않고 끝까지 흔들리지 않겠다고.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Ariana',
            text: '좋아. 그리고 오늘은 단순한 공격만 시험하는 게 아니야. 화염으로 보호하고 치유하는 법도 익혀야 해.',
            emotion: 'normal',
            characterImage: 'characters/ariana_drake'
          },
          {
            speaker: 'Seraphina',
            text: '준비됐어요. 불꽃이 제 편이 되도록 만들어보겠습니다.',
            emotion: 'angry',
            characterImage: 'characters/seraphina_belmont'
          }
        ],
        postVictory: [
          {
            speaker: 'Ariana',
            text: '훌륭해. 공격과 방어, 회복까지 균형 있게 불을 다루기 시작했네.',
            emotion: 'happy',
            characterImage: 'characters/ariana_drake'
          },
          {
            speaker: 'Seraphina',
            text: '불의 흐름이 손끝까지 이어지는 게 느껴졌어요. 감정을 억누르는 대신 조화시키는 게 맞았네요.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Ariana',
            text: '이제 다른 속성 마스터들도 기다리고 있어. 그들과의 협력도 염두에 둬.',
            emotion: 'normal',
            characterImage: 'characters/ariana_drake'
          },
          {
            speaker: 'Seraphina',
            text: '네. 오늘 깨달은 균형을 잊지 않을게요.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          }
        ],
        postDefeat: [
          {
            speaker: 'Ariana',
            text: '감정이 조금 흔들렸어. 불길이 흐트러지는 게 보였지?',
            emotion: 'normal',
            characterImage: 'characters/ariana_drake'
          },
          {
            speaker: 'Seraphina',
            text: '맞아요... 마지막에 화염을 제어하지 못했어요.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Ariana',
            text: '괜찮아. 다시 한 번 호흡을 고르고 네 안의 불꽃과 협력해봐.',
            emotion: 'happy',
            characterImage: 'characters/ariana_drake'
          }
        ]
      }
    },
    { 
      id: 13, name: '얼음 마스터', theme: 'Ice2', recommendedPower: 260, 
      firstReward: { gold: 500, shards: 5 }, repeatReward: { gold: 250, shards: 3 }, cleared: false,
      story: {
        description: '얼음 마법의 극한을 보여주는 성전. 더욱 차가운 신비로운 얼음의 세계.',
        backgroundImage: 'backgrounds/stage_13_ice_master.webp'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/seraphine_winters.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Seraphine Winters',
            text: '불꽃을 다듬었다고 해서 얼음이 받아줄 거라고 생각하지 마. 차가운 집중력을 증명해봐.',
            emotion: 'normal',
            characterImage: 'characters/seraphine_winters'
          },
          {
            speaker: 'Seraphina',
            text: 'Ariana가 균형을 배우라고 했어요. 이번엔 감정보다 이성을 우선해볼게요.',
            emotion: 'normal',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Seraphine Winters',
            text: '얼음은 시간이야. 숨을 천천히 고르고, 상대의 흐름을 읽어. 서두르면 균열이 생기지.',
            emotion: 'normal',
            characterImage: 'characters/seraphine_winters'
          },
          {
            speaker: 'Seraphina',
            text: 'Lucian에게 배운 분석력을 총동원하겠어요. 각 카드의 순서를 더 치밀하게 잡아볼게요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Seraphine Winters',
            text: '좋아. 네가 진정한 드레이크 가문 며느리가 되려면 감정을 얼릴 줄도 알아야 해.',
            emotion: 'normal',
            characterImage: 'characters/seraphine_winters'
          },
          {
            speaker: 'Seraphina',
            text: '이번엔 제가 주도권을 가지고 조종해보겠습니다.',
            emotion: 'angry',
            characterImage: 'characters/seraphina_belmont'
          }
        ],
        postVictory: [
          {
            speaker: 'Seraphine Winters',
            text: '의외네. 감정이 흔들리는 순간을 잘 봉인했어.',
            emotion: 'surprised',
            characterImage: 'characters/seraphine_winters'
          },
          {
            speaker: 'Seraphina',
            text: '얼음 속에서 불꽃이 쉬고 있는 느낌이었어요. 두 속성이 싸우기보다 함께 춤추는 것 같았죠.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Seraphine Winters',
            text: '그 감각을 잃지 마. 곧 번개와 바람이 동시에 너를 흔들 거야.',
            emotion: 'normal',
            characterImage: 'characters/seraphine_winters'
          },
          {
            speaker: 'Seraphina',
            text: '다음 시련도 차분하게 맞이하겠습니다.',
            emotion: 'normal',
            characterImage: 'characters/seraphina_belmont'
          }
        ],
        postDefeat: [
          {
            speaker: 'Seraphine Winters',
            text: '급했다. 마지막 한 수에서 허점을 보였어.',
            emotion: 'normal',
            characterImage: 'characters/seraphine_winters'
          },
          {
            speaker: 'Seraphina',
            text: '얼음이 손에서 미끄러지는 기분이었어요... 다시 호흡을 정돈할게요.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Seraphine Winters',
            text: '눈을 감고, 한겨울의 공기를 떠올려봐. 감각부터 되살리는 거야.',
            emotion: 'normal',
            characterImage: 'characters/seraphine_winters'
          }
        ]
      }
    },
    { 
      id: 14, name: '번개 마스터', theme: 'Lightning2', recommendedPower: 280, 
      firstReward: { gold: 550, shards: 5 }, repeatReward: { gold: 280, shards: 3 }, cleared: false,
      story: {
        description: '번개 마법의 절정을 보여주는 성역. 끝없이 치는 번개와 강력한 전기 에너지.',
        backgroundImage: 'backgrounds/stage_14_lightning_master.webp'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/leon_ardenia.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Leon Ardenia',
            text: '얼음에서 무사히 돌아왔군. 하지만 번개는 기다려주지 않아. 순간의 판단이 전부지.',
            emotion: 'normal',
            characterImage: 'characters/leon_ardenia'
          },
          {
            speaker: 'Seraphina',
            text: 'Leon 님, 지난 번보다 더 빠르게 대응하겠습니다.',
            emotion: 'normal',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Leon Ardenia',
            text: '카이는 지금도 너의 성장 보고를 기다리고 있지. 약혼자에게 보여줄만한 속도를 가져봐.',
            emotion: 'normal',
            characterImage: 'characters/leon_ardenia'
          },
          {
            speaker: 'Seraphina',
            text: '카이에 대한 믿음이 제 번개가 될 거예요. 주저하지 않겠습니다.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Leon Ardenia',
            text: '그 반짝임을 증명해봐. 늦으면 그대로 감전이야.',
            emotion: 'angry',
            characterImage: 'characters/leon_ardenia'
          }
        ],
        postVictory: [
          {
            speaker: 'Leon Ardenia',
            text: '이번엔 내 번개를 따라잡았군. 예상보다 훨씬 빠른 반응이었어.',
            emotion: 'surprised',
            characterImage: 'characters/leon_ardenia'
          },
          {
            speaker: 'Seraphina',
            text: '번개의 선로를 그리면서 싸우니까 흐름이 보였어요.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Leon Ardenia',
            text: '다음은 바람. 번개와 바람이 만날 때 생기는 소용돌이를 기억해둬.',
            emotion: 'normal',
            characterImage: 'characters/leon_ardenia'
          }
        ],
        postDefeat: [
          {
            speaker: 'Leon Ardenia',
            text: '망설였지. 번개는 생각보다 빨라.',
            emotion: 'normal',
            characterImage: 'characters/leon_ardenia'
          },
          {
            speaker: 'Seraphina',
            text: '반응이 늦었어요... 다시 속도를 다듬겠습니다.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Leon Ardenia',
            text: '심호흡 후, 세 번의 맥박을 떠올려. 네 박자 중 하나라도 놓치면 번개가 도망간다.',
            emotion: 'normal',
            characterImage: 'characters/leon_ardenia'
          }
        ]
      }
    },
    {
      id: 15, name: '바람 마스터', theme: 'Wind2', recommendedPower: 300,
      firstReward: { gold: 600, shards: 5 }, repeatReward: { gold: 300, shards: 3 }, cleared: false,
      story: {
        description: '하늘 위에 떠 있는 바람 성궁. 아이리스가 고급 바람 제어법과 순환 전술을 전수한다.',
        backgroundImage: 'backgrounds/stage_15_wind_master.webp'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/iris_belmont.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Iris Belmont',
            text: '언니! 이번엔 바람의 성궁이야. 여기서는 공기까지 내 뜻대로 부릴 수 있어!',
            emotion: 'happy',
            characterImage: 'characters/iris_belmont'
          },
          {
            speaker: 'Seraphina',
            text: '구름 위에서 느꼈던 자유로움이 다시 떠오르네요. 하지만 이번엔 훨씬 섬세해야 할 것 같아요.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Leon Ardenia',
            text: '번개와 바람은 함께 흐를 때 가장 강하다. 네가 만든 속도를 바람이 증폭시키도록 유도해라.',
            emotion: 'normal',
            characterImage: 'characters/leon_ardenia'
          },
          {
            speaker: 'Seraphina',
            text: '카이가 들려준 약속을 떠올리며 한 장 한 장 집중하겠습니다. 감정과 전술을 함께 다듬고 싶어요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Iris Belmont',
            text: '그럼 시작하자! 바람이 언니 편이 되도록 내가 조금은 밀어줄게!',
            emotion: 'happy',
            characterImage: 'characters/iris_belmont'
          }
        ],
        postVictory: [
          {
            speaker: 'Iris Belmont',
            text: '언니, 바람이 언니를 밀어주는 게 느껴졌어! 진짜로 날아다니는 것 같았다니까!',
            emotion: 'happy',
            characterImage: 'characters/iris_belmont'
          },
          {
            speaker: 'Leon Ardenia',
            text: '번개에서 다듬은 리듬이 바람과 함께 어울렸군. 다음 단계로 넘어갈 준비가 됐다.',
            emotion: 'happy',
            characterImage: 'characters/leon_ardenia'
          },
          {
            speaker: 'Seraphina',
            text: '숨이 가빠질 때마다 바람이 도와주더라고요. 오늘 전투를 "바람과의 협력"으로 기억하겠습니다.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Iris Belmont',
            text: '언니 최고! 이제 진짜 바람 마스터라고 불러도 되겠다!',
            emotion: 'happy',
            characterImage: 'characters/iris_belmont'
          }
        ],
        postDefeat: [
          {
            speaker: 'Iris Belmont',
            text: '바람이 갑자기 방향을 틀었지? 그럴 땐 같이 돌지 말고, 잠깐 멈춰서 중심부터 잡아야 해.',
            emotion: 'normal',
            characterImage: 'characters/iris_belmont'
          },
          {
            speaker: 'Seraphina',
            text: '맞아요... 서두르다가 흐름을 잃었어요. 다시 균형부터 맞춰보겠습니다.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Leon Ardenia',
            text: '번개를 다룰 때처럼 맥박을 세어라. 세 번째 박자에서 바람을 타면 늦지 않는다.',
            emotion: 'normal',
            characterImage: 'characters/leon_ardenia'
          },
          {
            speaker: 'Iris Belmont',
            text: '다시 하자! 바람은 언제든 친구가 되어줄 거야!',
            emotion: 'happy',
            characterImage: 'characters/iris_belmont'
          }
        ]
      }
    },
    { 
      id: 16, name: '대지 마스터', theme: 'Storm2', recommendedPower: 320, 
      firstReward: { gold: 650, shards: 6 }, repeatReward: { gold: 325, shards: 3 }, cleared: false,
      story: {
        description: '대지와 폭풍의 힘이 만나는 거대한 지하 동굴. 강력한 대지의 에너지.',
        backgroundImage: 'backgrounds/stage_16_earth_master.webp'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/garen_stone.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Garen Stone',
            text: '바람을 타고 내려온 기분이 어떤가. 하지만 땅 위에서는 그 속도가 무력해질 수 있다.',
            emotion: 'normal',
            characterImage: 'characters/garen_stone'
          },
          {
            speaker: 'Seraphina',
            text: 'Garen 님, 이번엔 제 방어 개념을 다듬고 싶어요.',
            emotion: 'normal',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Garen Stone',
            text: '대지는 버티는 법을 가르치지. 잠깐의 방심도 허용하지 않아. 카드 하나를 두 번 생각하고 써라.',
            emotion: 'angry',
            characterImage: 'characters/garen_stone'
          },
          {
            speaker: 'Seraphina',
            text: 'Marcus 님과의 재대결 전에 꼭 필요하겠네요. 제 뿌리를 더 깊게 박겠습니다.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          }
        ],
        postVictory: [
          {
            speaker: 'Garen Stone',
            text: '네가 만든 방패가 내 저주를 버텼다. 꽤나 단단해졌군.',
            emotion: 'surprised',
            characterImage: 'characters/garen_stone'
          },
          {
            speaker: 'Seraphina',
            text: '대지와 바람이 함께 호흡하는 상상을 했어요. 덕분에 움직임이 끊기지 않았죠.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Garen Stone',
            text: '다음 불 시험에서 그 단단함을 유지할 수 있겠지?',
            emotion: 'normal',
            characterImage: 'characters/garen_stone'
          }
        ],
        postDefeat: [
          {
            speaker: 'Garen Stone',
            text: '뿌리가 얕았다. 쉽게 흔들렸어.',
            emotion: 'normal',
            characterImage: 'characters/garen_stone'
          },
          {
            speaker: 'Seraphina',
            text: '지탱하는 법을 잊어버렸어요... 다시 가다듬을게요.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Garen Stone',
            text: '무릎을 굽혀 땅을 만지고. 그 힘을 다시 느껴라.',
            emotion: 'normal',
            characterImage: 'characters/garen_stone'
          }
        ]
      }
    },
    {
      id: 17, name: '불의 도전', theme: 'Fire3', recommendedPower: 340,
      firstReward: { gold: 700, shards: 6 }, repeatReward: { gold: 350, shards: 3 }, cleared: false,
      story: {
        description: '화염의 원천을 직접 마주하는 고난도 도장. Ariana가 세라피나에게 감정과 불꽃을 합치는 방법을 시험한다.',
        backgroundImage: 'backgrounds/stage_17_fire_challenge.webp'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/ariana_drake.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Ariana',
            text: '장식 없는 불길이야. 마음이 흔들리면 그대로 타버릴 거야. 준비됐어?',
            emotion: 'normal',
            characterImage: 'characters/ariana_drake'
          },
          {
            speaker: 'Seraphina',
            text: '화염 마스터 시험 이후 매일 감정을 정리했어요. 오늘은 그 다짐을 불꽃 위에 올려보겠습니다.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Ariana',
            text: '감정을 숨기면 불꽃이 폭주해. 솔직함만 남겨. 기쁨이든 두려움이든 모두 불길에 맡겨봐.',
            emotion: 'angry',
            characterImage: 'characters/ariana_drake'
          },
          {
            speaker: 'Seraphina',
            text: '그렇다면 감사함을 불러올게요. 여러분이 있기에 제가 여기까지 왔으니까요.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Ariana',
            text: '좋아. 그 따뜻함을 불꽃에 태워. 그리고 내 화염을 능가하는 장면을 보여줘.',
            emotion: 'happy',
            characterImage: 'characters/ariana_drake'
          }
        ],
        postVictory: [
          {
            speaker: 'Ariana',
            text: '내 불꽃이 밀렸네. 감정이 정확히 흐르고 있었어.',
            emotion: 'surprised',
            characterImage: 'characters/ariana_drake'
          },
          {
            speaker: 'Seraphina',
            text: '감정에 이름을 붙여 불꽃에 실으니 길이 보였어요. 진심의 힘을 다시 느꼈습니다.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Ariana',
            text: '곧 Mira와 맞붙게 될 거야. 불꽃으로 따뜻함을 전하는 것도 잊지 마.',
            emotion: 'happy',
            characterImage: 'characters/ariana_drake'
          }
        ],
        postDefeat: [
          {
            speaker: 'Ariana',
            text: '감정을 숨겼지? 불꽃은 거짓을 알고 바로 폭발해.',
            emotion: 'angry',
            characterImage: 'characters/ariana_drake'
          },
          {
            speaker: 'Seraphina',
            text: '네... 두려움을 밀어냈어요. 그대로 인정하고 다시 마주하겠습니다.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Ariana',
            text: '다시 도전해. 이번엔 가장 솔직한 마음부터 불러와.',
            emotion: 'normal',
            characterImage: 'characters/ariana_drake'
          }
        ]
      }
    },
    {
      id: 18, name: '우정의 시험', theme: 'Friendship', recommendedPower: 360,
      firstReward: { gold: 720, shards: 7 }, repeatReward: { gold: 360, shards: 4 }, cleared: false,
      story: {
        description: '세라피나와 시녀 Mira가 서로의 신뢰를 확인하는 시험. 서로를 지탱하는 힘을 보여준다.',
        backgroundImage: 'backgrounds/stage_18_friendship.webp'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/mira.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Mira',
            text: '아가씨, 이번엔 제가 상대해보고 싶어요. 항상 뒤에서만 지켜봤거든요.',
            emotion: 'happy',
            characterImage: 'characters/mira'
          },
          {
            speaker: 'Seraphina',
            text: 'Mira, 네가 없다면 여기까지 못 왔을 거야. 함께 싸울 수 있다면 정말 기뻐.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Mira',
            text: '이번 전투에서 제가 얼마나 성장했는지 보여드릴게요. 언젠가 아가씨 곁에서 함께 전장을 누비고 싶어요.',
            emotion: 'determined',
            characterImage: 'characters/mira'
          },
          {
            speaker: 'Seraphina',
            text: '그 마음을 오래 기억하자. 오늘의 우정은 다음 장을 여는 기념이 될 거야.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Mira',
            text: '그럼 시작할게요! 제가 준비한 지원 마법, 모두 보여드릴게요!',
            emotion: 'happy',
            characterImage: 'characters/mira'
          }
        ],
        postVictory: [
          {
            speaker: 'Mira',
            text: '역시 아가씨는 최고예요! 그래도 제 지원이 조금은 도움이 됐죠?',
            emotion: 'happy',
            characterImage: 'characters/mira'
          },
          {
            speaker: 'Seraphina',
            text: '당연하지. 카드가 완벽한 타이밍으로 연결됐어. 네 이름을 마음속에 크게 새겨둘게.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Mira',
            text: '앞으로도 계속 곁에서 돕겠습니다! 언제든 불러주세요!',
            emotion: 'happy',
            characterImage: 'characters/mira'
          }
        ],
        postDefeat: [
          {
            speaker: 'Mira',
            text: '죄송해요... 제가 긴장해서 카드가 꼬였어요.',
            emotion: 'sad',
            characterImage: 'characters/mira'
          },
          {
            speaker: 'Seraphina',
            text: '괜찮아. 우리 우정은 실패도 함께 견딜 거야. 다시 연습하면 더 빛날 거야.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Mira',
            text: '네! 다음엔 더 침착하게 지원할게요. 꼭 다시 도전하고 싶습니다!',
            emotion: 'determined',
            characterImage: 'characters/mira'
          }
        ]
      }
    },
    { 
      id: 19, name: '어둠 시험', theme: 'Shadow2', recommendedPower: 380, 
      firstReward: { gold: 800, shards: 8 }, repeatReward: { gold: 400, shards: 4 }, cleared: false,
      story: {
        description: '어둠 마법을 시험하는 어두운 미궁. 깊고 어두운 지하 미로.',
        backgroundImage: 'backgrounds/stage_19_shadow.webp'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/darius_blackwood.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Darius Blackwood',
            text: '또 만나게 됐군. 이번엔 어둠 속의 속삭임을 견딜 수 있겠나?',
            emotion: 'normal',
            characterImage: 'characters/darius_blackwood'
          },
          {
            speaker: 'Seraphina',
            text: '전보다 덜 무섭네요. 하지만 여전히 긴장돼요.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Darius Blackwood',
            text: '두려움은 약점이자 힘이다. 인정하고 끌어안으면 네 힘이 된다.',
            emotion: 'angry',
            characterImage: 'characters/darius_blackwood'
          },
          {
            speaker: 'Seraphina',
            text: '어둠 속에서 길을 비추는 빛을 제가 만들겠습니다.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          }
        ],
        postVictory: [
          {
            speaker: 'Darius Blackwood',
            text: '네 그림자가 허공에서 춤췄다. 두려움을 잘 활용했군.',
            emotion: 'surprised',
            characterImage: 'characters/darius_blackwood'
          },
          {
            speaker: 'Seraphina',
            text: '두려움을 숨기려고만 했는데... 인정하니까 오히려 힘이 됐어요.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Darius Blackwood',
            text: '계속 그렇게 스스로를 직면해라. 엘리트 2차에서도 도움이 될 것이다.',
            emotion: 'normal',
            characterImage: 'characters/darius_blackwood'
          }
        ],
        postDefeat: [
          {
            speaker: 'Darius Blackwood',
            text: '두려움을 외면했다. 그래서 어둠에 삼켜진 거야.',
            emotion: 'normal',
            characterImage: 'characters/darius_blackwood'
          },
          {
            speaker: 'Seraphina',
            text: '맞아요... 끝까지 인정하지 못했어요.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Darius Blackwood',
            text: '눈을 감고, 네 안의 어둠을 하나씩 손가락으로 짚어봐. 그게 첫걸음이다.',
            emotion: 'normal',
            characterImage: 'characters/darius_blackwood'
          }
        ]
      }
    },
    { 
      id: 20, name: '정예 2차', theme: 'Elite2', recommendedPower: 400, 
      firstReward: { gold: 900, shards: 9 }, repeatReward: { gold: 450, shards: 5 }, cleared: false,
      story: {
        description: '벨몬트 가문 정예 부대의 본부. 더욱 엄격하고 강력한 훈련 시설.',
        backgroundImage: 'backgrounds/stage_20_elite_advanced.webp'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/marcus_belmont.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Marcus Belmont',
            text: '다시 나를 상대할 자격이 생겼군. 이번에도 네가 긴장을 풀었다면 용서하지 않겠다.',
            emotion: 'angry',
            characterImage: 'characters/marcus_belmont'
          },
          {
            speaker: 'Seraphina',
            text: 'Marcus 님이 인정하는 며느리가 되고 싶어요. 그러려면 이번 시험을 반드시 통과해야죠.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Marcus Belmont',
            text: '전술과 팀워크, 그리고 리더십. 모두 보여줘라. 정예 부대는 단독 승부가 아니다.',
            emotion: 'normal',
            characterImage: 'characters/marcus_belmont'
          },
          {
            speaker: 'Seraphina',
            text: '카이와 함께 꾸릴 미래를 생각하며 싸울게요. 벨몬트 가문에 도움이 되는 사람이 되겠습니다.',
            emotion: 'normal',
            characterImage: 'characters/seraphina_belmont'
          }
        ],
        postVictory: [
          {
            speaker: 'Marcus Belmont',
            text: '...좋다. 이 정도의 판단력이라면 정예 부대를 이끌어도 손색없겠군.',
            emotion: 'happy',
            characterImage: 'characters/marcus_belmont'
          },
          {
            speaker: 'Seraphina',
            text: '감사합니다. 여러분의 힘을 믿으면서 싸웠어요.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Marcus Belmont',
            text: '다음부터는 가문의 외부와도 맞서야 한다. 각오를 다져라.',
            emotion: 'normal',
            characterImage: 'characters/marcus_belmont'
          }
        ],
        postDefeat: [
          {
            speaker: 'Marcus Belmont',
            text: '실수가 반복됐다. 지휘관 자격은 그런 허점을 허용하지 않는다.',
            emotion: 'normal',
            characterImage: 'characters/marcus_belmont'
          },
          {
            speaker: 'Seraphina',
            text: '명심하겠습니다... 다시 체계를 정비할게요.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Marcus Belmont',
            text: '각 카드가 팀원이라 생각하고, 서로의 빈틈을 메우도록 설계해라.',
            emotion: 'normal',
            characterImage: 'characters/marcus_belmont'
          }
        ]
      }
    },
    // Chapter 3: 최종 시련 (Stage 21-29) - TODO: Stage 30은 이미 추가됨
    { 
      id: 21, name: '원소 융합', theme: 'Fusion', recommendedPower: 420, 
      firstReward: { gold: 950, shards: 9 }, repeatReward: { gold: 475, shards: 5 }, cleared: false,
      story: {
        description: '모든 원소가 융합되는 신비로운 장소. 다양한 마법 에너지가 뒤섞인 특별한 공간.',
        backgroundImage: 'backgrounds/stage_21_fusion.webp'
      },
      characterImage: 'characters/seraphina_belmont.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Lucian',
            text: '세라피나, 지금부터는 우리가 가르친 모든 속성을 동시에 다뤄야 한다.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden'
          },
          {
            speaker: 'Ariana',
            text: '불길이 지나가는 경로 위에 얼음이 깔리고, 번개가 그 사이를 파고들 거야. 네가 조율해봐.',
            emotion: 'normal',
            characterImage: 'characters/ariana_drake'
          },
          {
            speaker: 'Seraphina',
            text: '모두가 제게 가르쳐준 것을 한 번에 엮어내는군요. 숨이 막힐 정도로 긴장돼요.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Leon Ardenia',
            text: '긴장감도 리듬이다. 그 박자를 네가 지휘해라.',
            emotion: 'normal',
            characterImage: 'characters/leon_ardenia'
          },
          {
            speaker: 'Seraphina',
            text: '좋아요. 지금까지 배운 모든 지식을 한 장의 악보라고 생각하겠습니다.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          }
        ],
        postVictory: [
          {
            speaker: 'Lucian',
            text: '대단합니다! 네 카드 순환이 모든 속성을 끊김 없이 이어냈어요.',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden'
          },
          {
            speaker: 'Seraphina',
            text: '모두의 목소리가 한 번에 들리는 것 같았어요. 서로 다른 에너지가 화음이 됐죠.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Ariana',
            text: '이제 카이와의 대결에서도 흔들리지 않겠지. 약혼자의 속내까지 읽을 준비해 둬.',
            emotion: 'normal',
            characterImage: 'characters/ariana_drake'
          }
        ],
        postDefeat: [
          {
            speaker: 'Lucian',
            text: '흐름이 한 번 끊어졌습니다. 다시 연결 고리를 정리해보죠.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden'
          },
          {
            speaker: 'Seraphina',
            text: '속성이 서로 싸우기만 했어요... 어떻게 하나로 묶어야 할까요?',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Leon Ardenia',
            text: '하나씩 들어. 불, 얼음, 번개... 각자에 귀 기울이며 다시 조율해라.',
            emotion: 'normal',
            characterImage: 'characters/leon_ardenia'
          }
        ]
      }
    },
    { 
      id: 22, name: '약혼자 시험', theme: 'Kai1', recommendedPower: 450, 
      firstReward: { gold: 1000, shards: 10 }, repeatReward: { gold: 500, shards: 6 }, cleared: false,
      story: {
        description: '드레이크 가문의 연회장에서 약혼자 Kai와 치르는 첫 공식 대결. 감정과 실력이 동시에 시험된다.',
        backgroundImage: 'backgrounds/stage_22_kai.webp'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/kai_drake.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Kai Drake',
            text: '세라피나, 이렇게 마주 서니 결혼식 때보다 더 떨리는군. 각오됐나?',
            emotion: 'happy',
            characterImage: 'characters/kai_drake'
          },
          {
            speaker: 'Seraphina',
            text: 'Kai 님도 긴장하셨나요? 저도 당신의 전술을 정면으로 확인하고 싶어요.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Kai Drake',
            text: '이 연회장은 우리 가문이 중요한 결정을 내릴 때마다 쓰인 곳이야. 오늘은 우리의 미래를 비춰주겠지.',
            emotion: 'normal',
            characterImage: 'characters/kai_drake'
          },
          {
            speaker: 'Seraphina',
            text: '당신과 함께라면 어떤 평가도 두렵지 않아요. 이번 대결이 우리의 새로운 출발이 되길 바랍니다.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Kai Drake',
            text: '좋아. 서로의 힘을 숨기지 말자. 이 승부가 우리를 더 강하게 만들 거야.',
            emotion: 'happy',
            characterImage: 'characters/kai_drake'
          }
        ],
        postVictory: [
          {
            speaker: 'Kai Drake',
            text: '...대단하다. 네 카드가 내 리듬까지 읽어냈어.',
            emotion: 'surprised',
            characterImage: 'characters/kai_drake'
          },
          {
            speaker: 'Seraphina',
            text: 'Kai 님의 움직임도 완벽했어요. 서로를 더 잘 알게 된 기분입니다.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Kai Drake',
            text: '이제 진짜로 같은 방향을 바라볼 수 있겠지. 다음 전장에서는 어깨를 나란히 하자.',
            emotion: 'happy',
            characterImage: 'characters/kai_drake'
          }
        ],
        postDefeat: [
          {
            speaker: 'Kai Drake',
            text: '괜찮아. 이 승부는 서로를 알아가기 위한 과정일 뿐이야.',
            emotion: 'normal',
            characterImage: 'characters/kai_drake'
          },
          {
            speaker: 'Seraphina',
            text: '조금 더 차분히 대응했어야 했어요. 다시 준비해서 도전하겠습니다.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Kai Drake',
            text: '전술을 정리하고 다시 맞서자. 우리 둘의 성장 이야기니까.',
            emotion: 'happy',
            characterImage: 'characters/kai_drake'
          }
        ]
      }
    },
    { 
      id: 23, name: '기사단 최종', theme: 'Lightning3', recommendedPower: 470, 
      firstReward: { gold: 1050, shards: 10 }, repeatReward: { gold: 525, shards: 6 }, cleared: false,
      story: {
        description: '왕국 기사단의 최종 시험장. 번개가 치는 기사단 본부의 전투장.',
        backgroundImage: 'backgrounds/stage_23_knights.webp'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/leon_ardenia.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Leon Ardenia',
            text: '기사단의 최종 시험이다. 번개 속에서 동료를 지휘할 수 있겠느냐?',
            emotion: 'angry',
            characterImage: 'characters/leon_ardenia'
          },
          {
            speaker: 'Seraphina',
            text: '네, 카이와 함께한 전략을 카드에 옮겨놨어요. 기사단의 규율도 익혔고요.',
            emotion: 'normal',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Leon Ardenia',
            text: '속도와 규율, 두 마리 토끼를 동시에 잡아야 한다. 흔들리면 기사단은 무너진다.',
            emotion: 'normal',
            characterImage: 'characters/leon_ardenia'
          },
          {
            speaker: 'Seraphina',
            text: '제 덱은 이미 팀 단위로 움직이도록 설계했어요. 시험해 보세요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          }
        ],
        postVictory: [
          {
            speaker: 'Leon Ardenia',
            text: '좋다. 네 지휘에 기사단이 흔들리지 않았다. 진정한 리더십을 보여줬다.',
            emotion: 'happy',
            characterImage: 'characters/leon_ardenia'
          },
          {
            speaker: 'Seraphina',
            text: '모두가 알려준 전략 덕분이에요. 번개 속에서도 길을 잃지 않았습니다.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Leon Ardenia',
            text: '이제 석화 마법의 심연으로 들어갈 차례다. 무거움 속에서도 균형을 잃지 마라.',
            emotion: 'normal',
            characterImage: 'characters/leon_ardenia'
          }
        ],
        postDefeat: [
          {
            speaker: 'Leon Ardenia',
            text: '지휘가 흔들렸다. 카드 순환에서 손실이 컸다.',
            emotion: 'normal',
            characterImage: 'characters/leon_ardenia'
          },
          {
            speaker: 'Seraphina',
            text: '죄송합니다... 다시 전술을 재정비하겠습니다.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Leon Ardenia',
            text: '동료가 쓰러지는 것을 상상하고, 빈틈을 메우는 카드부터 준비해라.',
            emotion: 'normal',
            characterImage: 'characters/leon_ardenia'
          }
        ]
      }
    },
    { 
      id: 24, name: '석화 완전', theme: 'Storm3', recommendedPower: 490, 
      firstReward: { gold: 1100, shards: 11 }, repeatReward: { gold: 550, shards: 6 }, cleared: false,
      story: {
        description: '석화 마법의 완전한 형태를 보여주는 깊은 동굴. 모든 것이 돌로 변한 공간.',
        backgroundImage: 'backgrounds/stage_24_petrification.webp'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/garen_stone.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Garen Stone',
            text: '이번엔 네 움직임 자체를 돌로 굳히겠다. 그럼에도 버틸 수 있겠나?',
            emotion: 'angry',
            characterImage: 'characters/garen_stone'
          },
          {
            speaker: 'Seraphina',
            text: '석화의 완전한 형태... 다시는 움직일 수 없게 만드는 힘이라 들었어요.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Garen Stone',
            text: '그래서 더 정확한 대응이 필요하지. 가문의 적에게 이 힘을 뺏기면 안 된다.',
            emotion: 'normal',
            characterImage: 'characters/garen_stone'
          },
          {
            speaker: 'Seraphina',
            text: '대지와 바람의 균형으로 대응하겠습니다. 움직임이 멈추지 않도록.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          }
        ],
        postVictory: [
          {
            speaker: 'Garen Stone',
            text: '석화의 틈을 찾아냈군. 네 카드가 돌조차 움직이게 했다.',
            emotion: 'surprised',
            characterImage: 'characters/garen_stone'
          },
          {
            speaker: 'Seraphina',
            text: '움직임을 포기하지 않았어요. 작은 틈이라도 흐름을 유지하면 돌도 갈라지니까요.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Garen Stone',
            text: '어둠 속에서도 길을 찾을 수 있는 눈을 갖춰라. 다음은 어둠 통달이다.',
            emotion: 'normal',
            characterImage: 'characters/garen_stone'
          }
        ],
        postDefeat: [
          {
            speaker: 'Garen Stone',
            text: '멈췄다. 완전히 굳어버렸어.',
            emotion: 'normal',
            characterImage: 'characters/garen_stone'
          },
          {
            speaker: 'Seraphina',
            text: '숨조차 쉴 수 없었어요... 다시 흐름을 만들게요.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Garen Stone',
            text: '심장에 귀를 대고 박동을 찾아라. 움직임은 그곳에서 시작된다.',
            emotion: 'normal',
            characterImage: 'characters/garen_stone'
          }
        ]
      }
    },
    { 
      id: 25, name: '심연 통달', theme: 'ShadowMaster', recommendedPower: 510, 
      firstReward: { gold: 1150, shards: 11 }, repeatReward: { gold: 575, shards: 6 }, cleared: false,
      story: {
        description: '어둠의 심연이 그대로 펼쳐진 전투장. Darius가 심연의 모든 힘을 개방해 시험한다.',
        backgroundImage: 'backgrounds/stage_25_shadow_master.webp'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/darius_blackwood.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Darius Blackwood',
            text: '심연의 속삭임이 들리나? 오늘은 그 목소리를 있는 그대로 마주해야 한다.',
            emotion: 'normal',
            characterImage: 'characters/darius_blackwood'
          },
          {
            speaker: 'Seraphina',
            text: '두려움도, 차가운 공포도 느껴집니다. 하지만 도망치지 않겠습니다.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Darius Blackwood',
            text: '좋다. 감정을 억누르지 말고 정면으로 마주해라. 심연은 진실을 먹고 자라지.',
            emotion: 'normal',
            characterImage: 'characters/darius_blackwood'
          },
          {
            speaker: 'Seraphina',
            text: '제가 쌓아온 빛과 동료들의 목소리를 심연 속에서도 잊지 않을게요.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          }
        ],
        postVictory: [
          {
            speaker: 'Darius Blackwood',
            text: '심연이 너를 인정했다. 네 마음을 삼키지 못했지.',
            emotion: 'happy',
            characterImage: 'characters/darius_blackwood'
          },
          {
            speaker: 'Seraphina',
            text: '두려움을 받아들이니 경계가 명확해졌어요. 어둠 속에서도 길을 찾을 수 있습니다.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Darius Blackwood',
            text: '이제 가문의 심장부로 나아가라. 정예 부대가 너를 기다리고 있다.',
            emotion: 'normal',
            characterImage: 'characters/darius_blackwood'
          }
        ],
        postDefeat: [
          {
            speaker: 'Darius Blackwood',
            text: '심연의 속삭임에 휘둘렸군. 다시 마음을 다져라.',
            emotion: 'angry',
            characterImage: 'characters/darius_blackwood'
          },
          {
            speaker: 'Seraphina',
            text: '목소리에 휩쓸렸어요... 하지만 다시 길을 찾겠습니다.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont'
          }
        ]
      }
    },
    { 
      id: 26, name: '정예 본대', theme: 'Elite3', recommendedPower: 530, 
      firstReward: { gold: 1200, shards: 12 }, repeatReward: { gold: 600, shards: 7 }, cleared: false,
      story: {
        description: '벨몬트 가문 정예 부대의 최종 본부. 모든 정예가 모이는 최고의 시설.',
        backgroundImage: 'backgrounds/stage_26_elite_final.webp'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/marcus_belmont.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Marcus Belmont',
            text: '정예 본대의 사령관들이 모두 모였다. 네가 이들을 설득할 수 있을까?',
            emotion: 'normal',
            characterImage: 'characters/marcus_belmont'
          },
          {
            speaker: 'Seraphina',
            text: '이번엔 전투뿐 아니라 설득과 협력까지 요구되는군요.',
            emotion: 'normal',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Marcus Belmont',
            text: '그래. 카이와 함께 가문을 이끌려면 이들의 신뢰를 얻어야 한다.',
            emotion: 'normal',
            characterImage: 'characters/marcus_belmont'
          },
          {
            speaker: 'Seraphina',
            text: '전략뿐 아니라 진심까지 담아 싸우겠습니다.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          }
        ],
        postVictory: [
          {
            speaker: 'Marcus Belmont',
            text: '정예 본대가 고개를 끄덕였다. 네 진심이 통했다.',
            emotion: 'happy',
            characterImage: 'characters/marcus_belmont'
          },
          {
            speaker: 'Seraphina',
            text: '이제 가문 전체가 하나가 되는 느낌이에요. 모두의 힘을 느꼈어요.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Marcus Belmont',
            text: '곧 드레이크 자매가 기다리고 있다. 감정과 전략이 동시에 필요할 거다.',
            emotion: 'normal',
            characterImage: 'characters/marcus_belmont'
          }
        ],
        postDefeat: [
          {
            speaker: 'Marcus Belmont',
            text: '정예 본대는 빈틈을 허용하지 않는다. 한 명이라도 설득하지 못하면 실패다.',
            emotion: 'normal',
            characterImage: 'characters/marcus_belmont'
          },
          {
            speaker: 'Seraphina',
            text: '더 많은 카드를 준비해야겠어요. 각자의 요구를 맞추기 위해.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Marcus Belmont',
            text: '정보를 모아라. 상대의 성향을 파악하는 것이 첫걸음이다.',
            emotion: 'normal',
            characterImage: 'characters/marcus_belmont'
          }
        ]
      }
    },
    { 
      id: 27, name: '드레이크 자매', theme: 'Sisters', recommendedPower: 550, 
      firstReward: { gold: 1250, shards: 12 }, repeatReward: { gold: 625, shards: 7 }, cleared: false,
      story: {
        description: '드레이크 자매 Elena와 Ariana가 함께 있는 특별한 공간. 따뜻하면서도 경쟁적인 분위기.',
        backgroundImage: 'backgrounds/stage_27_sisters.webp'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/elena_drake.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Elena Drake',
            text: '형수님! 우리 자매가 힘을 합쳤어요. 절대 만만하지 않을걸요?',
            emotion: 'happy',
            characterImage: 'characters/elena_drake'
          },
          {
            speaker: 'Ariana',
            text: 'Elena와 내가 합을 맞추는 건 드문 일이야. 네가 우리 가족이 될 자격이 있는지 확인하려고.',
            emotion: 'normal',
            characterImage: 'characters/ariana_drake'
          },
          {
            speaker: 'Seraphina',
            text: '두 사람의 순환을 맞추려면 엄청난 집중이 필요하겠네요. 하지만 가족으로서 받아들이고 싶어요.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Elena Drake',
            text: '그럼 우리 드레이크 자매의 콤비네이션을 버텨보세요! 특히 내가 더 귀엽다는 걸 잊지 말고요!',
            emotion: 'happy',
            characterImage: 'characters/elena_drake'
          },
          {
            speaker: 'Ariana',
            text: 'Elena, 진지하게 하자. 하지만 네 말대로 그녀가 우리의 리듬을 이해하길 바랄게.',
            emotion: 'angry',
            characterImage: 'characters/ariana_drake'
          }
        ],
        postVictory: [
          {
            speaker: 'Elena Drake',
            text: '우와! 형수님, 정말 멋있어요! 우리 둘을 동시에 상대하다니!',
            emotion: 'happy',
            characterImage: 'characters/elena_drake'
          },
          {
            speaker: 'Ariana',
            text: '네가 우리 가족의 리듬을 이해한 게 느껴졌어. 이제 진짜 드레이크 가문의 일원이야.',
            emotion: 'happy',
            characterImage: 'characters/ariana_drake'
          },
          {
            speaker: 'Seraphina',
            text: '고마워요. 앞으로도 서로 기대며 나아갑시다.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          }
        ],
        postDefeat: [
          {
            speaker: 'Elena Drake',
            text: '괜찮아요? 우리 콤비네이션이 너무 셌던 건가요?',
            emotion: 'surprised',
            characterImage: 'characters/elena_drake'
          },
          {
            speaker: 'Seraphina',
            text: '둘의 연결을 읽지 못했어요... 조금 더 경청해야겠네요.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Ariana',
            text: '대화를 더 많이 나눠보자. 가족은 마음을 공유하는 데서 시작하니까.',
            emotion: 'normal',
            characterImage: 'characters/ariana_drake'
          }
        ]
      }
    },
    { 
      id: 28, name: '다중 전술', theme: 'Multi', recommendedPower: 570, 
      firstReward: { gold: 1300, shards: 13 }, repeatReward: { gold: 650, shards: 7 }, cleared: false,
      story: {
        description: '다양한 전술이 결합된 복합 전투장. 여러 전략이 동시에 펼쳐지는 공간.',
        backgroundImage: 'backgrounds/stage_28_multi_tactics.webp'
      },
      characterImage: 'characters/seraphina_belmont.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Lucian',
            text: '이번 전장은 우리가 가르친 모든 전략이 동시에 등장한다. 매 순간 우선순위를 재정비해야 한다.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden'
          },
          {
            speaker: 'Marcus Belmont',
            text: '정예 부대, 기사단, 드레이크 자매까지 모두 다른 전술을 펼칠 것이다. 혼란을 통제해라.',
            emotion: 'normal',
            characterImage: 'characters/marcus_belmont'
          },
          {
            speaker: 'Seraphina',
            text: '마치 전쟁터 전체를 지휘하는 기분이네요. 하지만 지금까지 배운 것들을 믿겠습니다.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Kai Drake',
            text: '내가 후방에서 지원할게. 정보가 들어오면 곧바로 카드 선택에 반영해.',
            emotion: 'normal',
            characterImage: 'characters/kai_drake'
          }
        ],
        postVictory: [
          {
            speaker: 'Lucian',
            text: '모든 전술 변화를 정확히 읽어냈어요. 정말 훌륭합니다!',
            emotion: 'happy',
            characterImage: 'characters/lucian_rosegarden'
          },
          {
            speaker: 'Seraphina',
            text: '정보를 정리하고 순위를 매기는 연습을 계속한 덕분이에요. 혼란도 패턴으로 바꿀 수 있었어요.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Kai Drake',
            text: '곧 바람 최종 시험이야. 감각을 유지해.',
            emotion: 'normal',
            characterImage: 'characters/kai_drake'
          }
        ],
        postDefeat: [
          {
            speaker: 'Marcus Belmont',
            text: '우선순위가 무너졌다. 한 곳에 집중하느라 다른 전술을 놓쳤다.',
            emotion: 'normal',
            characterImage: 'characters/marcus_belmont'
          },
          {
            speaker: 'Seraphina',
            text: '맞아요... 한 가지에 매달렸어요. 다시 균형을 맞춰볼게요.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Lucian',
            text: '데이터를 다시 정리해보고, 카드 순환 시뮬레이션을 함께 하죠.',
            emotion: 'normal',
            characterImage: 'characters/lucian_rosegarden'
          }
        ]
      }
    },
    { 
      id: 29, name: '여동생 결전', theme: 'IrisFinal', recommendedPower: 590, 
      firstReward: { gold: 1400, shards: 14 }, repeatReward: { gold: 700, shards: 8 }, cleared: false,
      story: {
        description: '바람의 최고 신전에서 여동생 Iris와 치르는 마지막 시험. 가족의 약속을 확인하는 자리.',
        backgroundImage: 'backgrounds/stage_29_wind_final.webp'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/iris_belmont.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Iris Belmont',
            text: '언니! 이제 진짜 마지막이야. 내가 얼마나 성장했는지 보여줄게!',
            emotion: 'happy',
            characterImage: 'characters/iris_belmont'
          },
          {
            speaker: 'Seraphina',
            text: 'Iris, 네 바람은 언제나 따뜻했어. 이번엔 그 힘을 정면으로 느껴볼게.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Iris Belmont',
            text: '가문을 지킬 힘을 갖고 싶어. 언니가 인정해준다면 더할 나위 없겠지?',
            emotion: 'determined',
            characterImage: 'characters/iris_belmont'
          },
          {
            speaker: 'Seraphina',
            text: '서로의 미래를 걸고 싸우자. 오늘 승부는 우리 둘의 약속이 될 거야.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          }
        ],
        postVictory: [
          {
            speaker: 'Iris Belmont',
            text: '역시 언니야! 내 바람이 언니를 더 높은 곳으로 끌어올릴 수 있으면 좋겠어.',
            emotion: 'happy',
            characterImage: 'characters/iris_belmont'
          },
          {
            speaker: 'Seraphina',
            text: '너의 응원 덕분에 여기까지 왔어. 다음 전투는 가주님과의 대결이야.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Iris Belmont',
            text: '할아버지도 분명 기뻐하실 거야. 나중에 같이 축하하자!',
            emotion: 'happy',
            characterImage: 'characters/iris_belmont'
          }
        ],
        postDefeat: [
          {
            speaker: 'Iris Belmont',
            text: '괜찮아 언니! 아직 시간이 많아. 내가 계속 응원할게!',
            emotion: 'happy',
            characterImage: 'characters/iris_belmont'
          },
          {
            speaker: 'Seraphina',
            text: '고마워, Iris. 다시 준비하고 더 강해져서 돌아올게.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          }
        ]
      }
    },
    { 
      id: 30, name: '가주 최종', theme: 'ElderFinal', recommendedPower: 650, 
      firstReward: { gold: 1500, shards: 15 }, repeatReward: { gold: 750, shards: 9 }, cleared: false,
      story: {
        description: '벨몬트 가문의 왕좌실. 가주 Elder Belmont와 치르는 최종 결전. 모든 시련의 종착점.',
        backgroundImage: 'backgrounds/stage_30_final_boss.webp'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/elder_belmont.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Elder Belmont',
            text: '세라피나, 여기까지 올라온 것만으로도 대단하다. 그러나 마지막 시험이 남았다.',
            emotion: 'normal',
            characterImage: 'characters/elder_belmont'
          },
          {
            speaker: 'Seraphina',
            text: '가주님, 오늘의 승부로 제가 이 가문의 일원임을 증명하겠습니다.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Elder Belmont',
            text: '벨몬트의 역사가 담긴 모든 속성, 모든 전술이 나의 카드에 깃들어 있다. 그 흐름을 이겨내 보아라.',
            emotion: 'angry',
            characterImage: 'characters/elder_belmont'
          },
          {
            speaker: 'Seraphina',
            text: '선대의 유산을 이어받아 새로운 장을 열겠습니다. 가문의 미래를 걸고 싸울게요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          }
        ],
        postVictory: [
          {
            speaker: 'Elder Belmont',
            text: '훌륭하다. 벨몬트 가문은 너를 며느리가 아닌 진정한 가족으로써 받아들인다.',
            emotion: 'happy',
            characterImage: 'characters/elder_belmont'
          },
          {
            speaker: 'Seraphina',
            text: '감사합니다. 앞으로도 가문과 왕국을 위해 힘을 다하겠습니다.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Elder Belmont',
            text: '이제 새로운 위협이 다가온다. 하지만 너라면 충분히 맞설 수 있다.',
            emotion: 'normal',
            characterImage: 'characters/elder_belmont'
          }
        ],
        postDefeat: [
          {
            speaker: 'Elder Belmont',
            text: '아직 한 걸음 부족하다. 다시 수련하여 올라오거라.',
            emotion: 'normal',
            characterImage: 'characters/elder_belmont'
          },
          {
            speaker: 'Seraphina',
            text: '포기하지 않겠습니다. 가문의 기대에 부응하도록 더 단단해지겠습니다.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          }
        ]
      }
    },
    { 
      id: 31, name: '결혼식', theme: 'Wedding', recommendedPower: 680, 
      firstReward: { gold: 1500, shards: 15 }, repeatReward: { gold: 750, shards: 9 }, cleared: false,
      story: {
        description: '세라피나와 카이의 결혼식이 열리는 아름다운 장소. 축하와 기쁨이 가득한 공간.',
        backgroundImage: 'backgrounds/stage_31_wedding.webp'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/ariana_drake.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Ariana',
            text: '드디어 결혼식이야! 하지만 그 전에 마지막으로 실전을 점검하자. 행사장에서 돌발 상황이 생기면 어쩔 건데?',
            emotion: 'normal',
            characterImage: 'characters/ariana_drake'
          },
          {
            speaker: 'Seraphina',
            text: '축제라고 해서 방심할 수 없죠. 오늘은 축하와 보호, 두 가지를 동시에 생각해야 해요.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Ariana',
            text: '신부가 직접 재난 대응 훈련을 한다니 역시 너다운 발상이다. 좋아, 화려한 연출과 안전을 동시에 잡아봐.',
            emotion: 'happy',
            characterImage: 'characters/ariana_drake'
          },
          {
            speaker: 'Seraphina',
            text: '카이와 함께할 미래이니만큼 완벽하게 준비할게요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          }
        ],
        postVictory: [
          {
            speaker: 'Ariana',
            text: '멋졌어! 네 덱이 축복과 방어를 동시에 보여줬어. 결혼식에서도 빛날 거야.',
            emotion: 'happy',
            characterImage: 'characters/ariana_drake'
          },
          {
            speaker: 'Seraphina',
            text: '고마워. 모두가 안심하고 웃을 수 있는 시간을 만들고 싶었어요.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Ariana',
            text: '그 마음 잊지 마. 이제 정치 무대에서도 같은 마음으로 나아가자.',
            emotion: 'normal',
            characterImage: 'characters/ariana_drake'
          }
        ],
        postDefeat: [
          {
            speaker: 'Ariana',
            text: '괜찮아? 긴장했나 보네. 신부도 숨을 고를 시간이 필요해.',
            emotion: 'surprised',
            characterImage: 'characters/ariana_drake'
          },
          {
            speaker: 'Seraphina',
            text: '예상보다 준비할 게 많아서 정신이 없었어요... 다시 정리할게요.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Ariana',
            text: '천천히 해. 오늘은 축복받아야 할 날이니까.',
            emotion: 'happy',
            characterImage: 'characters/ariana_drake'
          }
        ]
      }
    },
    { 
      id: 32, name: '정치 음모', theme: 'Aldric', recommendedPower: 700, 
      firstReward: { gold: 1600, shards: 16 }, repeatReward: { gold: 800, shards: 9 }, cleared: false,
      story: {
        description: '정치적 음모가 벌어지는 왕국 의회. 어둡고 음침한 정치의 장.',
        backgroundImage: 'backgrounds/stage_32_politics.webp'
      },
      characterImage: 'characters/seraphina_belmont.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Advisor Aldric',
            text: '세라피나, 가문 내외의 귀족들이 너를 주시하고 있다. 단순한 전투 실력으로는 부족하지.',
            emotion: 'normal'
          },
          {
            speaker: 'Seraphina',
            text: '정치 무대는 카드 배틀보다 더 복잡하다고 들었어요. 하지만 도망치지 않겠습니다.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Advisor Aldric',
            text: '상대의 이해관계를 읽고, 때로는 거래하고, 때로는 압박해야 한다. 카드 한 장으로도 협상을 이끌어야 하지.',
            emotion: 'normal'
          },
          {
            speaker: 'Seraphina',
            text: '모두의 목소리를 듣고 조율하겠습니다. 가문의 이름을 지키기 위해.',
            emotion: 'normal',
            characterImage: 'characters/seraphina_belmont'
          }
        ],
        postVictory: [
          {
            speaker: 'Advisor Aldric',
            text: '놀랍군. 갈등을 유연하게 흡수하면서도 주도권을 놓치지 않았어.',
            emotion: 'normal'
          },
          {
            speaker: 'Seraphina',
            text: '각자의 요구를 카드에 반영하니 협상이 훨씬 수월했어요.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Advisor Aldric',
            text: '하지만 음모는 반복될 것이다. 마음을 단단히 해둬라.',
            emotion: 'normal'
          }
        ],
        postDefeat: [
          {
            speaker: 'Advisor Aldric',
            text: '협상 테이블에서 감정이 앞섰군. 그 틈을 상대가 노렸다.',
            emotion: 'normal'
          },
          {
            speaker: 'Seraphina',
            text: '말이 꼬였어요... 다시 데이터와 감정을 정리하겠습니다.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Advisor Aldric',
            text: '정보를 다시 모으고 접근 방식을 바꿔라. 정치의 핵심은 준비다.',
            emotion: 'normal'
          }
        ]
      }
    },
    { 
      id: 33, name: '하인 최종', theme: 'MiraFinal', recommendedPower: 720,
      firstReward: { gold: 1700, shards: 17 }, repeatReward: { gold: 850, shards: 9 }, cleared: false,
      story: {
        description: '세라피나의 충성스러운 시녀 Mira와의 마지막 시험. 서로의 신뢰와 우정을 확인하는 전용 수련장.',
        backgroundImage: 'backgrounds/stage_33_mira_final.webp'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/mira.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Mira',
            text: '아가씨, 오늘은 제가 끝까지 함께했던 훈련을 모두 펼쳐 마지막 시험을 부탁드리고 싶어요.',
            emotion: 'happy',
            characterImage: 'characters/mira'
          },
          {
            speaker: 'Seraphina',
            text: '나를 위해 이렇게 오래 준비했다니... 이번엔 서로가 얼마나 성장했는지 확인해 보자.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Mira',
            text: '처음엔 아가씨 곁을 지키겠다는 각오뿐이었지만, 이제는 제 힘으로도 도움이 되고 싶어요.',
            emotion: 'determined',
            characterImage: 'characters/mira'
          },
          {
            speaker: 'Seraphina',
            text: '네가 있어서 여기까지 올 수 있었어. 이번 전투는 나도 너에게 전력을 다해 보답할게.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Mira',
            text: '그럼, 우리의 마지막 장면을 가장 아름다운 페이지로 장식해봐요!',
            emotion: 'happy',
            characterImage: 'characters/mira'
          }
        ],
        postVictory: [
          {
            speaker: 'Mira',
            text: '역시 아가씨예요! 제 모든 장치와 메모를 전부 다 읽고 움직이셨어요!',
            emotion: 'happy',
            characterImage: 'characters/mira'
          },
          {
            speaker: 'Seraphina',
            text: '네가 만들어 준 훈련 덕분에 마음이 더 단단해졌어. 이제 어디서든 네가 자랑스러워질 만큼 강해졌다고 자신 있게 말할게.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Mira',
            text: '앞으로도 계속 곁에 있을게요. 이번 경험은 제가 평생 간직할 거예요!',
            emotion: 'happy',
            characterImage: 'characters/mira'
          }
        ],
        postDefeat: [
          {
            speaker: 'Mira',
            text: '괜찮으세요? 제가 너무 무리한 조건을 만든 건 아닌지 걱정돼요...',
            emotion: 'sad',
            characterImage: 'characters/mira'
          },
          {
            speaker: 'Seraphina',
            text: '아니야. 네가 준비한 과정을 제대로 마주하고 싶어. 다시 한 번 도전하게 해줘.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Mira',
            text: '그럼 준비 과정을 조금 손봐서 다시 맞춰둘게요. 아가씨가 웃을 때까지 계속 함께할게요!',
            emotion: 'happy',
            characterImage: 'characters/mira'
          }
        ]
      }
    },
    { 
      id: 34, name: '갈등', theme: 'Marcus2', recommendedPower: 740, 
      firstReward: { gold: 1800, shards: 18 }, repeatReward: { gold: 900, shards: 10 }, cleared: false,
      story: {
        description: '가문 내부의 갈등이 표면화되는 긴장된 공간. 대립과 화해가 공존하는 곳.',
        backgroundImage: 'backgrounds/stage_34_conflict.webp'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/marcus_belmont.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Marcus Belmont',
            text: '정치 무대를 다녀오더니 가문의 일부가 너를 의심하고 있다. 그들의 마음을 직접 돌려세워라.',
            emotion: 'normal',
            characterImage: 'characters/marcus_belmont'
          },
          {
            speaker: 'Seraphina',
            text: '가문을 지키겠다는 제 마음은 변함없어요. 설득이 필요하다면 카드로라도 보여드릴게요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Marcus Belmont',
            text: '갈등을 덮어두면 더 큰 균열이 생긴다. 정면으로 부딪혀라.',
            emotion: 'angry',
            characterImage: 'characters/marcus_belmont'
          }
        ],
        postVictory: [
          {
            speaker: 'Marcus Belmont',
            text: '좋다. 갈등을 도망치지 않고 받아들였군. 모두 고개를 끄덕였다.',
            emotion: 'happy',
            characterImage: 'characters/marcus_belmont'
          },
          {
            speaker: 'Seraphina',
            text: '서로의 불안을 인정하고 함께 해결하자고 말했어요. 이제 좀 더 솔직해질 수 있을 것 같아요.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          }
        ],
        postDefeat: [
          {
            speaker: 'Marcus Belmont',
            text: '갈등을 피하려 했다. 그런 태도는 불신을 키운다.',
            emotion: 'normal',
            characterImage: 'characters/marcus_belmont'
          },
          {
            speaker: 'Seraphina',
            text: '맞아요... 다시 마음을 가다듬겠습니다.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Marcus Belmont',
            text: '눈을 마주 보고, 서로의 두려움을 말하게 해라.',
            emotion: 'normal',
            characterImage: 'characters/marcus_belmont'
          }
        ]
      }
    },
    { 
      id: 35, name: '음모 공격', theme: 'Conspiracy', recommendedPower: 760, 
      firstReward: { gold: 1900, shards: 19 }, repeatReward: { gold: 950, shards: 11 }, cleared: false,
      story: {
        description: '정치적 음모가 실행되는 어두운 본거지. 배신과 음모가 얽힌 공간.',
        backgroundImage: 'backgrounds/stage_35_conspiracy.webp'
      },
      characterImage: 'characters/seraphina_belmont.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Leon Ardenia',
            text: '음모 세력이 직접 움직이기 시작했다. 정치적 공격과 물리적 위협이 동시에 올 것이다.',
            emotion: 'angry',
            characterImage: 'characters/leon_ardenia'
          },
          {
            speaker: 'Advisor Aldric',
            text: '정보에 따르면 그들은 네 약혼을 빌미로 삼아 가문을 흔들려 한다. 준비됐나?',
            emotion: 'normal'
          },
          {
            speaker: 'Seraphina',
            text: '이제 도망치지 않아요. 제가 직접 음모의 고리를 끊어낼게요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          }
        ],
        postVictory: [
          {
            speaker: 'Leon Ardenia',
            text: '훌륭했다. 공격과 음모를 동시에 차단했어.',
            emotion: 'happy',
            characterImage: 'characters/leon_ardenia'
          },
          {
            speaker: 'Advisor Aldric',
            text: '네 대응 덕분에 귀족들의 불만도 누그러졌지. 이제 마법 연구 사고에 대비하자.',
            emotion: 'normal'
          }
        ],
        postDefeat: [
          {
            speaker: 'Leon Ardenia',
            text: '정보가 부족했다. 우리가 놓친 연계가 있었어.',
            emotion: 'normal',
            characterImage: 'characters/leon_ardenia'
          },
          {
            speaker: 'Seraphina',
            text: '다시 자료를 모으고 전략을 재구성할게요.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Advisor Aldric',
            text: '이번엔 내가 더 많은 자료를 제공하마. 다시 준비하자.',
            emotion: 'normal'
          }
        ]
      }
    },
    { 
      id: 36, name: '마법 사고', theme: 'Thorne', recommendedPower: 780, 
      firstReward: { gold: 2000, shards: 20 }, repeatReward: { gold: 1000, shards: 12 }, cleared: false,
      story: {
        description: '마법 실험이 잘못되어 사고가 난 마법 연구소. 위험한 마법 에너지가 넘치는 곳.',
        backgroundImage: 'backgrounds/stage_36_magic_lab.webp'
      },
      characterImage: 'characters/seraphina_belmont.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Archmage Thorne',
            text: '연구소에서 폭주한 마법 에너지가 가문 전체를 위협하고 있다. 통제해야 한다.',
            emotion: 'normal'
          },
          {
            speaker: 'Seraphina',
            text: '사고의 원인을 파악하고 봉인하겠습니다. 제가 배운 모든 속성을 활용해볼게요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Archmage Thorne',
            text: '마법식을 변경하고 에너지 흐름을 재조정해야 한다. 각 단계에서 빠른 판단이 필요하다.',
            emotion: 'normal'
          }
        ],
        postVictory: [
          {
            speaker: 'Archmage Thorne',
            text: '잘했다. 제어 불능의 흐름을 안정시켰군.',
            emotion: 'normal'
          },
          {
            speaker: 'Seraphina',
            text: '이제 마법 연구가 다시 안전해졌어요. 모두의 노력이 헛되지 않았습니다.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          }
        ],
        postDefeat: [
          {
            speaker: 'Archmage Thorne',
            text: '마법식을 한 단계 놓쳤다. 흐름이 역류했어.',
            emotion: 'normal'
          },
          {
            speaker: 'Seraphina',
            text: '다시 계산해볼게요. 안정화 순서를 조정해야겠어요.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont'
          }
        ]
      }
    },
    {
      id: 37, name: '고대 마법', theme: 'AncientMagic', recommendedPower: 800,
      firstReward: { gold: 2100, shards: 21 }, repeatReward: { gold: 1050, shards: 12 }, cleared: false,
      story: {
        description: '고대 문헌에 전해지는 비밀 마법을 재현하는 봉인된 전당. 모든 속성을 조합해야 하는 복합 시험.',
        backgroundImage: 'backgrounds/stage_37_ancient.webp'
      },
      characterImage: 'characters/seraphina_belmont.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Archmage Thorne',
            text: '사고 수습을 잘해냈군. 이제 고대의 마법식 자체를 네 손으로 재현할 차례다.',
            emotion: 'normal'
          },
          {
            speaker: 'Seraphine Winters',
            text: '화염과 얼음을 동시에 다루던 언니의 감각이 필요해요. 네가 중심이 되어 흐름을 묶어주세요.',
            emotion: 'normal',
            characterImage: 'characters/seraphine_winters'
          },
          {
            speaker: 'Seraphina',
            text: '모든 속성이 서로 어긋나지 않도록 호흡을 맞춰볼게. 우리가 함께라면 해낼 수 있어.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Archmage Thorne',
            text: '마법식이 무너지면 다시 폭주가 일어난다. 침착함을 잃지 마라.',
            emotion: 'normal'
          },
          {
            speaker: 'Seraphine Winters',
            text: '고대 마법의 리듬을 같이 불러볼게요. 하나, 둘, 셋... 이제 시작이에요!',
            emotion: 'happy',
            characterImage: 'characters/seraphine_winters'
          }
        ],
        postVictory: [
          {
            speaker: 'Archmage Thorne',
            text: '완벽하다. 네가 짜 올린 흐름이라면 고대 마법도 안전하게 쓰일 수 있겠지.',
            emotion: 'happy'
          },
          {
            speaker: 'Seraphine Winters',
            text: '언니와 호흡을 맞추니 마법이 춤을 추는 것 같았어요. 이 순간은 영원히 잊지 않을게요.',
            emotion: 'happy',
            characterImage: 'characters/seraphine_winters'
          },
          {
            speaker: 'Seraphina',
            text: '모두의 도움이 있었기에 가능한 일이었어요. 이제 이 힘으로 더 많은 사람을 지킬 수 있겠죠.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          }
        ],
        postDefeat: [
          {
            speaker: 'Archmage Thorne',
            text: '마법식이 흔들렸다. 다시 호흡을 정렬해라.',
            emotion: 'normal'
          },
          {
            speaker: 'Seraphine',
            text: '순간 감각이 어긋났어... 다시 흐름을 정리해볼게.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Seraphine Winters',
            text: '언니, 같이 호흡을 세어볼까요? 천천히 맞춰가요.',
            emotion: 'happy',
            characterImage: 'characters/seraphine_winters'
          }
        ]
      }
    },
    { 
      id: 38, name: '라이벌 화해', theme: 'Ariana4', recommendedPower: 820, 
      firstReward: { gold: 2200, shards: 22 }, repeatReward: { gold: 1100, shards: 13 }, cleared: false,
      story: {
        description: '라이벌 Ariana와의 화해가 이루어지는 특별한 공간. 경쟁에서 우정으로.',
        backgroundImage: 'backgrounds/stage_38_reconciliation.webp'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/ariana_drake.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Ariana',
            text: '우리는 늘 경쟁했지. 하지만 이제는 서로를 누구보다 잘 이해하게 된 것 같아.',
            emotion: 'happy',
            characterImage: 'characters/ariana_drake'
          },
          {
            speaker: 'Seraphina',
            text: '라이벌이 있었기에 여기까지 올 수 있었어. 오늘은 서로의 마음을 확인하자.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Ariana',
            text: '좋아! 전력으로 부딪혀서 진심을 보여줘.',
            emotion: 'angry',
            characterImage: 'characters/ariana_drake'
          }
        ],
        postVictory: [
          {
            speaker: 'Ariana',
            text: '멋졌어. 경쟁에서 시작했지만, 이제는 진짜 동료야.',
            emotion: 'happy',
            characterImage: 'characters/ariana_drake'
          },
          {
            speaker: 'Seraphina',
            text: '고마워. 앞으로도 서로의 등을 맡기자.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          }
        ],
        postDefeat: [
          {
            speaker: 'Ariana',
            text: '괜찮아. 우리가 공유한 시간은 변하지 않아.',
            emotion: 'happy',
            characterImage: 'characters/ariana_drake'
          },
          {
            speaker: 'Seraphina',
            text: '조금만 더 다듬어볼게요. 진심을 제대로 전달하고 싶어요.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont'
          }
        ]
      }
    },
    { 
      id: 39, name: '협력 배틀', theme: 'Kai2', recommendedPower: 840, 
      firstReward: { gold: 2300, shards: 23 }, repeatReward: { gold: 1150, shards: 13 }, cleared: false,
      story: {
        description: '약혼자 카이와 함께하는 협력 배틀. 부부가 함께 싸우는 특별한 공간.',
        backgroundImage: 'backgrounds/stage_39_cooperation.webp'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/kai_drake.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Kai Drake',
            text: '이전에는 서로를 시험했지만, 이제는 진짜 협력할 차례다. 우리 둘의 리듬을 맞춰보자.',
            emotion: 'happy',
            characterImage: 'characters/kai_drake'
          },
          {
            speaker: 'Seraphina',
            text: '같이 싸우는 건 언제나 든든해요. 서로의 빈틈을 메우면서 전투를 설계해볼게요.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Kai Drake',
            text: '내 카드와 네 카드가 동시에 발동되는 상황도 있을 거야. 순서를 머릿속으로 그리고 있어.',
            emotion: 'normal',
            characterImage: 'characters/kai_drake'
          }
        ],
        postVictory: [
          {
            speaker: 'Kai Drake',
            text: '완벽했어. 우리 둘의 조합이라면 어떤 전장에서도 통하겠어.',
            emotion: 'happy',
            characterImage: 'characters/kai_drake'
          },
          {
            speaker: 'Seraphina',
            text: '앞으로도 서로에게 기대며 싸워요. 우리의 미래를 위해.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          }
        ],
        postDefeat: [
          {
            speaker: 'Kai Drake',
            text: '괜찮아. 호흡이 맞지 않았던 부분을 찾아보자.',
            emotion: 'normal',
            characterImage: 'characters/kai_drake'
          },
          {
            speaker: 'Seraphina',
            text: '다시 리허설해볼게요. 서로의 카드를 더 잘 이해해야겠어요.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont'
          }
        ]
      }
    },
    { 
      id: 40, name: '어둠 교단', theme: 'Cult', recommendedPower: 860, 
      firstReward: { gold: 2500, shards: 25 }, repeatReward: { gold: 1250, shards: 15 }, cleared: false,
      story: {
        description: '어둠의 교단이 모이는 어두운 성소. 위험하고 신비로운 어둠의 본거지.',
        backgroundImage: 'backgrounds/stage_40_cult.webp'
      },
      characterImage: 'characters/seraphina_belmont.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Dark Cult Leader',
            text: '벨몬트의 새 며느리여, 네가 가문의 힘을 약화시킬 기회라고 생각했는데... 직접 확인해볼까?',
            emotion: 'normal'
          },
          {
            speaker: 'Seraphina',
            text: '어둠 교단의 음모는 여기서 끝낼 거예요.',
            emotion: 'angry',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Dark Cult Leader',
            text: '너는 아직 어둠의 깊이를 모른다. 우리 의식이 완성되면 가문도, 왕국도 손아귀에 들어오지.',
            emotion: 'angry'
          }
        ],
        postVictory: [
          {
            speaker: 'Dark Cult Leader',
            text: '크윽... 네가 이 정도일 줄이야... 하지만 우리는 또 다른 계획을 준비했다...',
            emotion: 'sad'
          },
          {
            speaker: 'Seraphina',
            text: '무슨 계획이든 막아낼 거예요. 가문과 왕국을 위해.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          }
        ],
        postDefeat: [
          {
            speaker: 'Dark Cult Leader',
            text: '네 마음 속에도 어둠이 있다. 그걸 끌어낼 수만 있다면...',
            emotion: 'happy'
          },
          {
            speaker: 'Seraphina',
            text: '다시 마음을 다잡겠어요. 어둠이 제 마음을 흔들게 두지 않겠습니다.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont'
          }
        ]
      }
    },
    // Chapter 5: 어둠의 전쟁 (Stage 41-50)
    { 
      id: 41, name: '어둠 침략', theme: 'Invasion', recommendedPower: 880, 
      firstReward: { gold: 2600, shards: 26 }, repeatReward: { gold: 1300, shards: 15 }, cleared: false,
      story: {
        description: '어둠의 세력이 침략한 전쟁터. 파괴와 혼돈이 가득한 전쟁의 장.',
        backgroundImage: 'backgrounds/stage_41_invasion.webp'
      },
      characterImage: 'characters/seraphina_belmont.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Leon Ardenia',
            text: '어둠 교단이 전면 침공을 시작했다. 전선이 무너져 가고 있어.',
            emotion: 'angry',
            characterImage: 'characters/leon_ardenia'
          },
          {
            speaker: 'Seraphina',
            text: '저도 전선에 서겠습니다. 지금까지의 모든 전술을 활용하겠어요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Darius Blackwood',
            text: '어둠이 어둠과 싸운다는 것도 흥미롭지. 너의 그림자를 다시 시험해보자.',
            emotion: 'normal',
            characterImage: 'characters/darius_blackwood'
          }
        ],
        postVictory: [
          {
            speaker: 'Leon Ardenia',
            text: '전선이 안정됐다. 네가 시간을 벌어준 덕분이다.',
            emotion: 'happy',
            characterImage: 'characters/leon_ardenia'
          },
          {
            speaker: 'Seraphina',
            text: '이 흐름을 이어가야 해요. 더 큰 전투가 다가오고 있으니까요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          }
        ],
        postDefeat: [
          {
            speaker: 'Leon Ardenia',
            text: '전선이 붕괴한다! 다시 정비하자!',
            emotion: 'angry',
            characterImage: 'characters/leon_ardenia'
          },
          {
            speaker: 'Seraphina',
            text: '죄송해요... 다시 전략을 정비하겠습니다.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont'
          }
        ]
      }
    },
    { 
      id: 42, name: '석화 타락', theme: 'Garen4', recommendedPower: 920, 
      firstReward: { gold: 2800, shards: 28 }, repeatReward: { gold: 1400, shards: 17 }, cleared: false,
      story: {
        description: '타락한 Garen의 석화 마법이 만든 어둠의 석화 공간. 더욱 어둡고 위험한 석화 영역.',
        backgroundImage: 'backgrounds/stage_42_corrupted_stone.webp'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/garen_stone.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Garen Stone',
            text: '...어둠이... 내 몸을... 잠식한다...',
            emotion: 'sad',
            characterImage: 'characters/garen_stone'
          },
          {
            speaker: 'Seraphina',
            text: 'Garen 님! 제정신을 되찾으세요. 제가 도와드릴게요!',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Garen Stone',
            text: '타락한 석화가 네 몸까지 굳게 만들 것이다... 막을 수 있다면 막아봐라...',
            emotion: 'angry',
            characterImage: 'characters/garen_stone'
          }
        ],
        postVictory: [
          {
            speaker: 'Garen Stone',
            text: '...고맙다... 어둠이 걷혀간다...',
            emotion: 'happy',
            characterImage: 'characters/garen_stone'
          },
          {
            speaker: 'Seraphina',
            text: '다시 돌아오셔서 다행이에요. 이제 다음 전선을 지켜야 합니다.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          }
        ],
        postDefeat: [
          {
            speaker: 'Garen Stone',
            text: '굳어라... 모두 돌이 되어라...',
            emotion: 'angry',
            characterImage: 'characters/garen_stone'
          },
          {
            speaker: 'Seraphina',
            text: '안돼요... 아직 놓칠 수 없어. 다시 되찾아드릴게요!',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont'
          }
        ]
      }
    },
    {
      id: 43, name: '어둠 통달', theme: 'Darius3', recommendedPower: 960,
      firstReward: { gold: 3000, shards: 30 }, repeatReward: { gold: 1500, shards: 18 }, cleared: false,
      story: {
        description: '어둠의 힘을 온전히 받아들여야 하는 심연의 수련장. 빛과 그림자를 동시에 다루는 고난도 시험.',
        backgroundImage: 'backgrounds/stage_43_absolute_darkness.webp'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/darius_blackwood.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Darius Blackwood',
            text: '석화 타락을 정화했다니 인상 깊군. 이제는 어둠 그 자체를 통제할 수 있는지 시험해보자.',
            emotion: 'normal',
            characterImage: 'characters/darius_blackwood'
          },
          {
            speaker: 'Seraphina',
            text: '어둠을 두려워하지 않으려면 끝까지 바라봐야 한다는 걸 배웠어요. 이번에도 도망치지 않을게요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Darius Blackwood',
            text: '너의 빛과 나의 그림자를 겹치면 새로운 길이 열린다. 감정이 흔들려도 숨을 고르고 집중해라.',
            emotion: 'normal',
            characterImage: 'characters/darius_blackwood'
          },
          {
            speaker: 'Seraphina',
            text: '모든 감정을 받아들이며 버틸게요. 어둠과 빛이 조화를 이루는 순간을 반드시 찾아보겠습니다.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          }
        ],
        postVictory: [
          {
            speaker: 'Darius Blackwood',
            text: '훌륭하다. 어둠이 네 안에서 고요히 숨 쉬는 것이 느껴진다. 이제 어둠도 너의 빛이 되겠지.',
            emotion: 'happy',
            characterImage: 'characters/darius_blackwood'
          },
          {
            speaker: 'Seraphina',
            text: '두려움을 정면으로 바라보니, 어둠 속에서도 방향이 보였어요. 지금이라면 누군가의 그림자도 지켜줄 수 있을 것 같아요.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          }
        ],
        postDefeat: [
          {
            speaker: 'Darius Blackwood',
            text: '어둠이 속삭일 때 마음을 빼앗겼군. 다시 숨을 고르고 들어와라.',
            emotion: 'normal',
            characterImage: 'characters/darius_blackwood'
          },
          {
            speaker: 'Seraphina',
            text: '틈이 생겼어요... 더 깊이까지 어둠을 받아들이는 연습을 다시 해볼게요.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont'
          }
        ]
      }
    },
    { 
      id: 44, name: 'Elena 구출', theme: 'Elena2', recommendedPower: 1000, 
      firstReward: { gold: 3200, shards: 32 }, repeatReward: { gold: 1600, shards: 20 }, cleared: false,
      story: {
        description: '타락한 Elena가 갇혀있는 어둠의 감옥. 구원이 필요한 어둠에 물든 공간.',
        backgroundImage: 'backgrounds/stage_44_corruption_prison.webp'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/elena_drake.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Elena Drake',
            text: '형수님... 저는... 어둠이... 어둠이 제 마음을...',
            emotion: 'sad',
            characterImage: 'characters/elena_drake'
          },
          {
            speaker: 'Seraphina',
            text: 'Elena! 내가 너를 구해줄게. 다시 함께 웃자.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont'
          }
        ],
        postVictory: [
          {
            speaker: 'Elena Drake',
            text: '형수님... 고마워요. 다시 빛을 볼 수 있게 됐어요.',
            emotion: 'happy',
            characterImage: 'characters/elena_drake'
          },
          {
            speaker: 'Seraphina',
            text: '다행이야. 모두가 널 기다리고 있어.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          }
        ],
        postDefeat: [
          {
            speaker: 'Elena Drake',
            text: '어둠이... 날... 삼키는...',
            emotion: 'angry',
            characterImage: 'characters/elena_drake'
          },
          {
            speaker: 'Seraphina',
            text: '조금만 더 버텨줘! 곧 구해줄게!',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont'
          }
        ]
      }
    },
    {
      id: 45, name: '교단 본부', theme: 'CultFinal', recommendedPower: 1050,
      firstReward: { gold: 3600, shards: 36 }, repeatReward: { gold: 1800, shards: 22 }, cleared: false,
      story: {
        description: '어둠 교단의 핵심 본부. 끝없이 울려 퍼지는 주문과 제단이 숨 쉬는 심장부.',
        backgroundImage: 'backgrounds/stage_45_cult_final.webp'
      },
      characterImage: 'characters/seraphina_belmont.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Dark Cult Leader',
            text: '네가 여기까지 들어올 줄은 몰랐지. 하지만 본부의 심장은 쉽게 멈추지 않는다.',
            emotion: 'angry'
          },
          {
            speaker: 'Seraphina',
            text: '교단의 중심을 정면으로 무너뜨리겠어. 더 이상 피해자가 생기지 않도록.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Dark Cult Leader',
            text: '의식이 완성되면 왕국 전체가 우리 의지에 굴복한다. 너의 빛을 짓밟아 보겠다.',
            emotion: 'angry'
          },
          {
            speaker: 'Seraphina',
            text: '어둠이 아무리 커도, 함께 쌓아 올린 다짐과 마음은 꺼지지 않아. 끝까지 버텨서 이곳을 멈춘다.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          }
        ],
        postVictory: [
          {
            speaker: 'Dark Cult Leader',
            text: '믿을 수가... 없어... 심장이 멈추다니...!',
            emotion: 'sad'
          },
          {
            speaker: 'Seraphina',
            text: '의식은 끝났어. 이제 왕국은 우리 스스로 지킬 수 있어.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          }
        ],
        postDefeat: [
          {
            speaker: 'Dark Cult Leader',
            text: '빛이 흔들린다... 결국 어둠은 다시 숨을 쉰다.',
            emotion: 'happy'
          },
          {
            speaker: 'Seraphina',
            text: '다시 돌아와서 확실하게 끝내겠어요. 누구도 더 이상 다치지 않게.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont'
          }
        ]
      }
    },
    {
      id: 46, name: '주동자', theme: 'Mastermind', recommendedPower: 1100,
      firstReward: { gold: 3900, shards: 39 }, repeatReward: { gold: 1950, shards: 24 }, cleared: false,
      story: {
        description: '교단의 배후에서 모든 음모를 지휘하던 주동자 Xander와의 대면. 모든 사건의 실마리가 이어지는 작전 회랑.',
        backgroundImage: 'backgrounds/stage_46_mastermind.webp'
      },
      characterImage: 'characters/seraphina_belmont.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Mastermind Xander',
            text: '드디어 만났군, 세라피나. 네가 걸어온 모든 시련은 내가 설계한 장기 말에 불과했다.',
            emotion: 'normal'
          },
          {
            speaker: 'Seraphina',
            text: '사람들의 마음을 이용해 자신의 욕망을 채우다니, 이제는 그 고리를 끊을 때야.',
            emotion: 'angry',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Mastermind Xander',
            text: '네가 밝힌 빛이 강해질수록, 그림자도 함께 자라났지. 그 어둠의 힘을 내가 거둬들이겠다.',
            emotion: 'angry'
          },
          {
            speaker: 'Seraphina',
            text: '빛과 어둠 모두를 받아들였기에 더 이상 흔들리지 않아. 네 계획은 여기서 끝이야.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          }
        ],
        postVictory: [
          {
            speaker: 'Mastermind Xander',
            text: '불가능해... 모든 가능성을 예측했는데... 네가 그 모든 걸 넘어설 줄은...',
            emotion: 'sad'
          },
          {
            speaker: 'Seraphina',
            text: '사람들의 마음을 장기 말로 여긴 순간 너의 패배는 이미 정해졌어. 이제는 우리가 서로의 미래를 선택할 거야.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          }
        ],
        postDefeat: [
          {
            speaker: 'Mastermind Xander',
            text: '예상대로다. 아직 내 계산 밖은 아니었지. 다시 일어나라, 세라피나.',
            emotion: 'happy'
          },
          {
            speaker: 'Seraphina',
            text: '다시 계산을 넘어서는 길을 찾을게. 곧 너를 멈춰 세우겠다.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont'
          }
        ]
      }
    },
    { 
      id: 47, name: '타락자들', theme: 'Corrupted', recommendedPower: 1150, 
      firstReward: { gold: 4200, shards: 42 }, repeatReward: { gold: 2100, shards: 28 }, cleared: false,
      story: {
        description: '모든 타락한 자들이 모이는 회합장. Garen, Darius, Elena가 함께 있는 어둠의 공간.',
        backgroundImage: 'backgrounds/stage_47_corrupted_gathering.webp'
      },
      characterImage: 'characters/seraphina_belmont.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Garen Stone',
            text: '세라피나... 다시 한 번 시험하겠다. 이 어둠의 잔재를 지워라.',
            emotion: 'normal',
            characterImage: 'characters/garen_stone'
          },
          {
            speaker: 'Darius Blackwood',
            text: '우리가 타락했던 흔적을 완전히 정화할 수 있는지 보여줘라.',
            emotion: 'normal',
            characterImage: 'characters/darius_blackwood'
          },
          {
            speaker: 'Elena Drake',
            text: '형수님... 다시 한 번 빛으로 이끌어주세요.',
            emotion: 'sad',
            characterImage: 'characters/elena_drake'
          },
          {
            speaker: 'Seraphina',
            text: '함께 이겨내요. 이번엔 제가 끝까지 지켜드릴게요.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          }
        ],
        postVictory: [
          {
            speaker: 'Garen Stone',
            text: '어둠의 잔재가 모두 사라졌다. 네가 우리를 완전히 구해냈다.',
            emotion: 'happy',
            characterImage: 'characters/garen_stone'
          },
          {
            speaker: 'Darius Blackwood',
            text: '이제 진정한 동료로서 싸울 수 있겠군.',
            emotion: 'happy',
            characterImage: 'characters/darius_blackwood'
          },
          {
            speaker: 'Elena Drake',
            text: '고마워요! 앞으로는 제가 언니를 지켜드릴게요!',
            emotion: 'happy',
            characterImage: 'characters/elena_drake'
          }
        ],
        postDefeat: [
          {
            speaker: 'Garen Stone',
            text: '아직 어둠이 남아 있다... 다시 도전하라.',
            emotion: 'normal',
            characterImage: 'characters/garen_stone'
          },
          {
            speaker: 'Seraphina',
            text: '더 강해져서 돌아올게요. 모두를 지키기 위해.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont'
          }
        ]
      }
    },
    { 
      id: 48, name: '가주 협력', theme: 'Elder2', recommendedPower: 1200, 
      firstReward: { gold: 4600, shards: 46 }, repeatReward: { gold: 2300, shards: 30 }, cleared: false,
      story: {
        description: '벨몬트 가문 가주와 함께하는 협력 전투. 가문의 힘을 합치는 특별한 공간.',
        backgroundImage: 'backgrounds/stage_48_elder_cooperation.webp'
      },
      characterImage: 'characters/seraphina_belmont.png',
      enemyImage: 'characters/elder_belmont.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Elder Belmont',
            text: '세라피나, 이제 우리가 함께 싸울 차례다. 가문의 힘을 보여주자.',
            emotion: 'normal',
            characterImage: 'characters/elder_belmont'
          },
          {
            speaker: 'Seraphina',
            text: '가주님과 어깨를 나란히 하게 되다니 영광입니다.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          },
          {
            speaker: 'Elder Belmont',
            text: '너의 성장을 직접 확인했지. 이제는 내가 너를 믿고 의지할 차례다.',
            emotion: 'happy',
            characterImage: 'characters/elder_belmont'
          }
        ],
        postVictory: [
          {
            speaker: 'Elder Belmont',
            text: '훌륭하다. 가문의 힘이 이렇게 조화로운 것은 처음 보는군.',
            emotion: 'happy',
            characterImage: 'characters/elder_belmont'
          },
          {
            speaker: 'Seraphina',
            text: '앞으로도 가문을 위해 싸우겠습니다.',
            emotion: 'determined',
            characterImage: 'characters/seraphina_belmont'
          }
        ],
        postDefeat: [
          {
            speaker: 'Elder Belmont',
            text: '괜찮다. 우리는 다시 일어설 수 있다.',
            emotion: 'normal',
            characterImage: 'characters/elder_belmont'
          },
          {
            speaker: 'Seraphina',
            text: '다시 힘을 합쳐서 도전하겠습니다.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont'
          }
        ]
      }
    },
    { 
      id: 49, name: '가족 결사', theme: 'Family', recommendedPower: 1250, 
      firstReward: { gold: 5000, shards: 50 }, repeatReward: { gold: 2500, shards: 33 }, cleared: false,
      story: {
        description: '카이와 Ariana를 포함한 가족이 모두 모이는 결집장. 가족의 힘을 보여주는 곳.',
        backgroundImage: 'backgrounds/stage_49_family.webp'
      },
      characterImage: 'characters/seraphina_belmont.png',
      cutscene: {
        preBattle: [
          {
            speaker: 'Kai Drake',
            text: '우리 가족이 모두 모였다. 이번엔 가족의 힘으로 어둠을 몰아내자.',
            emotion: 'happy',
            characterImage: 'characters/kai_drake'
          },
          {
            speaker: 'Ariana',
            text: '가족끼리 싸울 일이 아니라, 함께 미래를 지키는 싸움이지.',
            emotion: 'happy',
            characterImage: 'characters/ariana_drake'
          },
          {
            speaker: 'Seraphina',
            text: '여러분을 만나 행복해요. 이제 가족으로서 마지막까지 싸워요.',
            emotion: 'happy',
            characterImage: 'characters/seraphina_belmont'
          }
        ],
        postVictory: [
          {
            speaker: 'Kai Drake',
            text: '이것이 우리 가족의 힘이다. 정말 자랑스럽군.',
            emotion: 'happy',
            characterImage: 'characters/kai_drake'
          },
          {
            speaker: 'Ariana',
            text: '앞으로도 함께 걸어가자, Seraphina.',
            emotion: 'happy',
            characterImage: 'characters/ariana_drake'
          }
        ],
        postDefeat: [
          {
            speaker: 'Kai Drake',
            text: '괜찮아. 가족이니까 다시 일어설 수 있어.',
            emotion: 'normal',
            characterImage: 'characters/kai_drake'
          },
          {
            speaker: 'Seraphina',
            text: '그래요. 우리 모두 다시 힘을 모아 도전해요.',
            emotion: 'sad',
            characterImage: 'characters/seraphina_belmont'
          }
        ]
      }
    },
    { 
      id: 50, name: '공허 제왕', theme: 'Void', recommendedPower: 1500, 
      firstReward: { gold: 6000, shards: 60 }, repeatReward: { gold: 3000, shards: 40 }, cleared: false,
      story: {
        description: '최종 보스 공허 제왕의 왕좌. 모든 것을 삼키는 절대적인 공허의 공간.',
        backgroundImage: 'backgrounds/stage_50_void_emperor.webp'
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
