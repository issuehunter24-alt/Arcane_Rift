# 🖼️ 배경 이미지 SD 프롬프트 가이드 (50스테이지)

## 📐 **공통 사양**

### **이미지 사이즈**
```
1024 x 768px (4:3 비율)
```

### **공통 설정**
```
Steps: 30-40
Sampler: DPM++ 2M Karras (또는 Euler a)
CFG Scale: 7-9
```

### **공통 Negative Prompt**
```
people, characters, humans, person, man, woman, girl, boy, face, portrait,
modern, contemporary, car, vehicle, text, watermark, signature, logo,
blurry, low quality, worst quality, jpeg artifacts, duplicate, cropped,
multiple objects, repeated objects, two of same, pair of same, doubled objects,
clone, cloned, copy, copies, duplicate elements, repeated elements,
same object twice, identical objects, mirror objects, symmetrical duplicates
```

---

## 🎨 **스테이지별 배경 이미지 프롬프트**

### 📕 **Chapter 1: 입문과 수련 (Stage 1-10)**

#### 📍 **Stage 1: 입문 (Neutral) - 벨몬트 훈련장**

**컨셉**: 밝고 평화로운 벨몬트 가문의 훈련장. 햇살이 비추는 석조 건물과 초록빛 잔디.

**Positive Prompt**:
```
medieval fantasy training ground, noble family courtyard, bright sunny day,
stone castle architecture, green grass lawn, wooden practice dummies,
colorful training flags fluttering, peaceful atmosphere, clear blue sky,
castle walls in background, detailed stone texture, elegant design,
warm sunlight, fantasy RPG background, high quality, 8k wallpaper,
(masterpiece:1.2), (best quality:1.2), (ultra detailed:1.1),
no people, environment only, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, dark, gloomy, war, destruction, ruins,
modern, text, watermark, blurry, low quality
```

**추천 색조**: 따뜻한 금색, 하늘색, 초록색 - 밝고 희망적인 분위기

**파일명**: `stage_01_training.png`

---

#### 🔥 **Stage 2: 불의 시련 (Fire) - 화산 지대**

**컨셉**: 용암이 흐르는 활화산 지대. 뜨거운 열기와 붉은 빛이 가득한 위험한 장소.

**Positive Prompt**:
```
active volcano landscape, flowing lava rivers, volcanic rocks,
red and orange glowing environment, heat haze effect, smoke rising,
molten lava pools, dark volcanic stone, fire particles in air,
dramatic red lighting, dangerous atmosphere, fantasy fire realm,
obsidian cliffs, ember sparks floating, intense heat visual,
epic fantasy background, cinematic lighting, high quality, 8k,
(masterpiece:1.2), (best quality:1.2), (detailed environment:1.1),
no people, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, ice, snow, water, peaceful, calm,
modern, text, watermark, blurry, low quality
```

**추천 색조**: 붉은색, 주황색, 검은색 - 뜨겁고 위험한 분위기

**파일명**: `stage_02_fire.png`

---

#### ❄️ **Stage 3: 얼음 요새 (Ice) - 빙결 성채**

**컨셉**: 얼음으로 덮인 거대한 성채. 눈송이가 날리고 얼음 기둥이 빛나는 차가운 세계.

**Positive Prompt**:
```
frozen ice castle, massive ice fortress, crystalline ice structures,
snow covered environment, icicles hanging, frozen palace walls,
blue and white color palette, snowflakes falling gently,
ice crystals reflecting light, aurora borealis in sky,
magical ice kingdom, frost patterns, winter atmosphere,
elegant frozen architecture, cold ambient lighting,
fantasy ice realm background, high quality, 8k wallpaper,
(masterpiece:1.2), (best quality:1.2), (ultra detailed ice:1.1),
no people, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, fire, lava, warm colors, summer,
modern, text, watermark, blurry, low quality
```

**추천 색조**: 하늘색, 흰색, 은색, 보라색 - 차갑고 신비로운 분위기

**파일명**: `stage_03_ice.png`

---

#### ⚡ **Stage 4: 뇌전의 탑 (Lightning) - 폭풍우 탑**

**컨셉**: 번개가 치는 거대한 마법 탑. 먹구름과 전기 에너지가 가득한 폭풍우 속.

**Positive Prompt**:
```
tall magical tower, lightning strikes, stormy dark clouds,
electric energy crackling, thunder storm atmosphere, purple lightning bolts,
rain heavy, dramatic weather, ancient wizard tower, stone spire,
electricity flowing through air, tesla coils effect, dark sky,
powerful storm magic, ominous lighting, epic fantasy tower,
lightning illuminating clouds, magical electricity, high quality, 8k,
(masterpiece:1.2), (best quality:1.2), (dramatic lighting:1.1),
no people, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, sunny, calm, peaceful, clear sky,
modern, text, watermark, blurry, low quality
```

**추천 색조**: 보라색, 흰색, 검은색, 파란색 - 위험하고 강력한 분위기

**파일명**: `stage_04_lightning.png`

---

#### 🌪️ **Stage 5: 바람의 신전 (Wind) - 천공 신전**

**컨셉**: 구름 위에 떠있는 고대 신전. 바람이 불고 하늘빛이 아름다운 환상적인 장소.

**Positive Prompt**:
```
floating sky temple, clouds surrounding, ancient wind shrine,
above the clouds, blue sky gradient, wind currents visible,
marble pillars, elegant architecture, peaceful sky realm,
soft wind effect, floating stones, celestial atmosphere,
heavenly light rays, distant horizon, serene environment,
fantasy aerial temple, majestic design, high altitude view,
beautiful cloudscape, high quality, 8k wallpaper,
(masterpiece:1.2), (best quality:1.2), (heavenly atmosphere:1.1),
no people, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, ground level, dark, underground,
modern, text, watermark, blurry, low quality
```

**추천 색조**: 하늘색, 흰색, 금색, 연한 파랑 - 평화롭고 고요한 분위기

**파일명**: `stage_05_wind.png`

---

#### 🔥❄️ **Stage 6: 화염과 빙설 (Fire/Ice) - 대립의 전장**

**컨셉**: 화염과 얼음이 충돌하는 극한의 전장. 한쪽은 불타고 한쪽은 얼어붙은 대비.

**Positive Prompt**:
```
fire and ice battlefield, elemental clash, half burning half frozen,
lava meets ice, steam rising, extreme temperature contrast,
red fire side versus blue ice side, elemental war zone,
dramatic split environment, fire flames on left, ice crystals on right,
magical energy collision, epic elemental battle background,
contrasting hot and cold, cracked ground, powerful magic clash,
cinematic split lighting, fantasy dual element realm,
high quality, 8k, (masterpiece:1.2), (best quality:1.2),
(dramatic contrast:1.2), no people, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, uniform temperature, peaceful, calm,
modern, text, watermark, blurry, low quality
```

**추천 색조**: 좌측: 빨강/주황, 우측: 파랑/흰색 - 극적이고 대립적인 분위기

**파일명**: `stage_06_fire_ice.png`

---

#### ⚡🌪️ **Stage 7: 폭풍의 전장 (Lightning/Wind) - 태풍의 중심**

**컨셉**: 거대한 태풍의 중심부. 번개와 강풍이 휘몰아치는 극한의 전투 환경.

**Positive Prompt**:
```
massive storm battlefield, hurricane center, lightning and wind,
violent weather, swirling winds visible, multiple lightning strikes,
tornado forming, dramatic storm clouds, dark ominous sky,
powerful gale force winds, electric storm, debris flying,
chaotic atmosphere, epic storm magic, purple and blue lightning,
dark grey clouds, intense weather phenomenon, fantasy storm realm,
apocalyptic weather, cinematic storm lighting, high quality, 8k,
(masterpiece:1.2), (best quality:1.2), (dynamic weather:1.2),
no people, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, calm, clear sky, sunny, peaceful,
modern, text, watermark, blurry, low quality
```

**추천 색조**: 검은색, 보라색, 청록색, 흰색 - 혼돈스럽고 강력한 분위기

**파일명**: `stage_07_storm.png`

---

#### 🛡️ **Stage 8: 정예 부대 (Elite) - 엘리트 훈련소**

**컨셉**: 벨몬트 가문 최고 엘리트들의 비밀 훈련소. 어두우면서도 고급스러운 분위기.

**Positive Prompt**:
```
elite training facility, underground chamber, dark stone walls,
magical lighting, torch lights, sophisticated design,
military training ground, strategic layout, weapons racks background,
serious atmosphere, professional environment, polished stone floor,
dim ambient lighting, war room aesthetic, tactical space,
high ceiling chamber, gothic architecture, medieval elite barracks,
disciplined environment, fantasy military academy background,
high quality, 8k, (masterpiece:1.2), (best quality:1.2),
(atmospheric lighting:1.1), no people, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, bright, cheerful, outdoor, sunny,
modern, text, watermark, blurry, low quality
```

**추천 색조**: 어두운 회색, 검은색, 금색 포인트 - 진지하고 고급스러운 분위기

**파일명**: `stage_08_elite.png`

---

#### 👹 **Stage 9: 보스 전초전 (Boss Prep) - 어둠의 복도**

**컨셉**: 최종 보스 방 직전의 긴 복도. 불안하고 긴장감 넘치는 어두운 통로.

**Positive Prompt**:
```
long dark corridor, boss approach hallway, ominous atmosphere,
dim purple lighting, stone pillars, ancient architecture,
mysterious fog, shadows deep, gothic cathedral hallway,
leading to final battle, tension building environment,
decorative dark walls, candles flickering, eerie ambience,
grand castle interior, approaching danger, dramatic perspective,
final trial pathway, foreboding environment, dark fantasy corridor,
high quality, 8k, (masterpiece:1.2), (best quality:1.2),
(cinematic perspective:1.1), no people, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, bright, cheerful, outdoor, open space,
modern, text, watermark, blurry, low quality
```

**추천 색조**: 검은색, 어두운 보라색, 회색 - 긴장감 있고 불안한 분위기

**파일명**: `stage_09_corridor.png`

---

#### 👑 **Stage 10: 드레이크 저택 (Elena) - 드레이크 저택 정원**

**컨셉**: 드레이크 가문의 아름다운 저택 정원. 따뜻하고 친근한 분위기의 고급스러운 정원.

**Positive Prompt**:
```
noble mansion garden, elegant estate courtyard, beautiful flower garden,
well-maintained lawn, decorative fountains, marble statues,
warm afternoon sunlight, peaceful aristocratic atmosphere,
ornate garden architecture, rose bushes, ivy-covered walls,
luxurious noble residence, sophisticated garden design,
serene and welcoming environment, fantasy noble estate,
high quality, 8k wallpaper, (masterpiece:1.2), (best quality:1.2),
(elegant atmosphere:1.1), no people, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, dark, gloomy, ruins, destruction,
modern, text, watermark, blurry, low quality
```

**추천 색조**: 따뜻한 초록색, 분홍색, 금색 - 친근하고 따뜻한 분위기

**파일명**: `stage_10_elena.png`

---

### 📘 **Chapter 2: 성장과 시험 (Stage 11-20)**

#### 📍 **Stage 11: 중급 시험 (Lucian2) - 고급 훈련장**

**컨셉**: 더욱 정교해진 벨몬트 가문의 고급 훈련장. 실력 향상을 위한 본격적인 시험장.

**Positive Prompt**:
```
advanced training ground, sophisticated training facility,
enhanced stone architecture, multiple training areas,
magical practice circles, elevated platforms, training obstacles,
professional combat arena, improved equipment, strategic layout,
serious training atmosphere, disciplined environment,
fantasy advanced training center, high quality, 8k,
(masterpiece:1.2), (best quality:1.2), (detailed architecture:1.1),
no people, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, dark, gloomy, ruins, destruction,
modern, text, watermark, blurry, low quality
```

**파일명**: `stage_11_training_advanced.png`

---

#### 🔥 **Stage 12: 화염 마스터 (Fire2) - 화염 성소**

**컨셉**: 화염 마법의 정수를 담은 신성한 성소. 더욱 강렬하고 집중된 불의 에너지.

**Positive Prompt**:
```
sacred fire shrine, intense flame sanctuary, concentrated fire energy,
ancient fire altar, eternal flames burning, red and gold temple,
magical fire crystals, heat distortion effect, powerful fire magic,
ritual fire circle, sacred flame chamber, divine fire realm,
epic fire temple, high quality, 8k, (masterpiece:1.2),
(best quality:1.2), (intense fire:1.2), no people, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, ice, snow, water, peaceful, calm,
modern, text, watermark, blurry, low quality
```

**파일명**: `stage_12_fire_master.png`

---

#### ❄️ **Stage 13: 얼음 마스터 (Ice2) - 얼음 성전**

**컨셉**: 얼음 마법의 극한을 보여주는 성전. 더욱 차갑고 신비로운 얼음의 세계.

**Positive Prompt**:
```
sacred ice temple, ultimate ice sanctuary, crystalline ice cathedral,
massive ice pillars, frozen sacred chamber, blue and silver temple,
magical ice crystals, aurora borealis inside, divine ice realm,
eternal winter shrine, frozen altar, ice magic sanctum,
epic ice temple, high quality, 8k, (masterpiece:1.2),
(best quality:1.2), (mystical ice:1.2), no people, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, fire, lava, warm colors, summer,
modern, text, watermark, blurry, low quality
```

**파일명**: `stage_13_ice_master.png`

---

#### ⚡ **Stage 14: 번개 마스터 (Lightning2) - 뇌전 성역**

**컨셉**: 번개 마법의 절정을 보여주는 성역. 끝없이 치는 번개와 강력한 전기 에너지.

**Positive Prompt**:
```
sacred lightning realm, ultimate thunder sanctuary, electric storm temple,
constant lightning strikes, electric energy field, purple and white temple,
tesla coil structures, electric storm clouds, divine lightning realm,
thunder altar, electric sacred chamber, lightning magic sanctum,
epic lightning temple, high quality, 8k, (masterpiece:1.2),
(best quality:1.2), (powerful lightning:1.2), no people, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, sunny, calm, peaceful, clear sky,
modern, text, watermark, blurry, low quality
```

**파일명**: `stage_14_lightning_master.png`

---

#### 🌪️ **Stage 15: 바람 마스터 (Wind2) - 바람 성궁**

**컨셉**: 바람 마법의 정수를 담은 하늘의 궁전. 더욱 높고 자유로운 바람의 영역.

**Positive Prompt**:
```
sacred wind palace, ultimate sky sanctuary, floating wind temple,
high altitude cloud palace, wind currents visible, white and gold temple,
floating platforms, sky bridges, divine wind realm,
celestial wind shrine, aerial sacred chamber, wind magic sanctum,
epic sky temple, high quality, 8k, (masterpiece:1.2),
(best quality:1.2), (heavenly wind:1.2), no people, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, ground level, dark, underground,
modern, text, watermark, blurry, low quality
```

**파일명**: `stage_15_wind_master.png`

---

#### ⚡🌪️ **Stage 16: 대지 마스터 (Storm2) - 대지의 심장**

**컨셉**: 대지와 폭풍의 힘이 만나는 거대한 지하 동굴. 강력한 대지의 에너지.

**Positive Prompt**:
```
underground earth chamber, massive stone cavern, earth and storm fusion,
crystal formations, earth energy flowing, brown and grey temple,
stone pillars, underground sanctuary, powerful earth magic,
earthquake effects, stone altar, earth magic sanctum,
epic underground temple, high quality, 8k, (masterpiece:1.2),
(best quality:1.2), (powerful earth:1.2), no people, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, bright, sunny, outdoor, open space,
modern, text, watermark, blurry, low quality
```

**파일명**: `stage_16_earth_master.png`

---

#### 🔥 **Stage 17: 불의 도전 (Fire3) - 화염 지옥**

**컨셉**: 최고 난이도의 화염 시험장. 지옥 같은 불의 세계에서의 극한 도전.

**Positive Prompt**:
```
hellfire arena, extreme fire challenge, infernal fire realm,
lava rivers everywhere, fire demons statues, red and black temple,
intense heat waves, fire tornadoes, extreme fire magic,
burning altar, fire challenge chamber, ultimate fire test,
epic fire arena, high quality, 8k, (masterpiece:1.2),
(best quality:1.2), (extreme fire:1.2), no people, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, ice, snow, water, peaceful, calm,
modern, text, watermark, blurry, low quality
```

**파일명**: `stage_17_fire_challenge.png`

---

#### 💚 **Stage 18: 우정의 시험 (Mira) - 친밀한 훈련장**

**컨셉**: 친구와의 우정을 시험하는 따뜻한 훈련장. 밝고 친근한 분위기의 특별한 장소.

**Positive Prompt**:
```
friendly training ground, warm friendship arena, cozy training space,
bright and welcoming, flower decorations, comfortable atmosphere,
intimate training area, supportive environment, friendly competition,
warm lighting, pleasant courtyard, friendship test ground,
epic friendly arena, high quality, 8k, (masterpiece:1.2),
(best quality:1.2), (warm atmosphere:1.1), no people, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, dark, gloomy, ruins, destruction,
modern, text, watermark, blurry, low quality
```

**파일명**: `stage_18_friendship.png`

---

#### 👹 **Stage 19: 어둠 시험 (Shadow2) - 어둠의 미궁**

**컨셉**: 어둠 마법을 시험하는 어두운 미궁. 깊고 어두운 지하 미로.

**Positive Prompt**:
```
dark shadow labyrinth, shadow magic maze, underground dark maze,
dim purple and black lighting, shadow corridors, mysterious passages,
dark magic crystals, shadow portals, ominous dark realm,
shadow altar, dark test chamber, shadow magic trial,
epic dark maze, high quality, 8k, (masterpiece:1.2),
(best quality:1.2), (mysterious dark:1.2), no people, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, bright, cheerful, outdoor, open space,
modern, text, watermark, blurry, low quality
```

**파일명**: `stage_19_shadow.png`

---

#### 🛡️ **Stage 20: 정예 2차 (Elite2) - 정예 본부**

**컨셉**: 벨몬트 가문 정예 부대의 본부. 더욱 엄격하고 강력한 훈련 시설.

**Positive Prompt**:
```
elite headquarters, advanced elite facility, supreme training center,
military command center, strategic war room, professional elite barracks,
sophisticated equipment, tactical training grounds, elite command post,
discipline chamber, elite test arena, ultimate elite facility,
epic elite headquarters, high quality, 8k, (masterpiece:1.2),
(best quality:1.2), (professional elite:1.2), no people, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, bright, cheerful, outdoor, sunny,
modern, text, watermark, blurry, low quality
```

**파일명**: `stage_20_elite_advanced.png`

---

### 📙 **Chapter 3: 최종 시련 (Stage 21-30)**

#### ✨ **Stage 21: 원소 융합 (Fusion) - 원소 융합장**

**컨셉**: 모든 원소가 융합되는 신비로운 장소. 다양한 마법 에너지가 뒤섞인 특별한 공간.

**Positive Prompt**:
```
elemental fusion chamber, all elements combined, magical fusion realm,
fire ice lightning wind earth mixing, colorful energy streams,
prismatic magic effects, elemental convergence point, fusion altar,
multi-element temple, chaotic magic harmony, elemental balance,
epic fusion arena, high quality, 8k, (masterpiece:1.2),
(best quality:1.2), (elemental fusion:1.2), no people, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, uniform element, single element only,
modern, text, watermark, blurry, low quality
```

**파일명**: `stage_21_fusion.png`

---

#### 💍 **Stage 22: 약혼자 (Kai) - 드레이크 성**

**컨셉**: 약혼자 카이 드레이크와의 대결장. 웅장하고 고귀한 드레이크 가문의 성.

**Positive Prompt**:
```
Drake family castle, noble Drake estate, grand noble mansion,
elegant aristocratic architecture, luxurious castle interior,
golden decorations, royal atmosphere, prestigious noble residence,
ornate castle hall, noble family estate, Drake family stronghold,
epic noble castle, high quality, 8k, (masterpiece:1.2),
(best quality:1.2), (noble elegance:1.2), no people, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, dark, gloomy, ruins, destruction,
modern, text, watermark, blurry, low quality
```

**파일명**: `stage_22_kai.png`

---

#### ⚡ **Stage 23: 기사단 최종 (Lightning3) - 왕국 기사단 본부**

**컨셉**: 왕국 기사단의 최종 시험장. 번개가 치는 기사단 본부의 전투장.

**Positive Prompt**:
```
royal knights headquarters, knights order stronghold, military command center,
lightning storm over castle, knights training arena, royal military base,
thunder and lightning, knights barracks, military discipline hall,
royal knights arena, knights final test, ultimate knights facility,
epic knights headquarters, high quality, 8k, (masterpiece:1.2),
(best quality:1.2), (military power:1.2), no people, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, sunny, calm, peaceful, clear sky,
modern, text, watermark, blurry, low quality
```

**파일명**: `stage_23_knights.png`

---

#### ⚡🌪️ **Stage 24: 석화 완전 (Storm3) - 석화의 심연**

**컨셉**: 석화 마법의 완전한 형태를 보여주는 깊은 동굴. 모든 것이 돌로 변한 공간.

**Positive Prompt**:
```
petrification abyss, stone transformation cave, complete petrification realm,
everything turned to stone, stone statues everywhere, petrified forest,
stone magic chamber, petrification altar, ultimate stone magic,
frozen in stone, stone transformation temple, petrification sanctum,
epic stone realm, high quality, 8k, (masterpiece:1.2),
(best quality:1.2), (complete petrification:1.2), no people, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, bright, colorful, vibrant,
modern, text, watermark, blurry, low quality
```

**파일명**: `stage_24_petrification.png`

---

#### 👹 **Stage 25: 어둠 통달 (Shadow3) - 어둠의 심연**

**컨셉**: 어둠 마법의 완전한 통달을 보여주는 깊은 어둠. 모든 빛이 사라진 공간.

**Positive Prompt**:
```
void of darkness, complete shadow realm, absolute darkness abyss,
no light at all, shadow energy everywhere, dark void chamber,
shadow magic mastery, darkness altar, ultimate shadow magic,
void temple, shadow mastery sanctum, complete darkness realm,
epic void arena, high quality, 8k, (masterpiece:1.2),
(best quality:1.2), (absolute darkness:1.2), no people, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, bright, cheerful, outdoor, open space,
modern, text, watermark, blurry, low quality
```

**파일명**: `stage_25_shadow_master.png`

---

#### 🛡️ **Stage 26: 정예 본대 (Elite3) - 정예 최종 본부**

**컨셉**: 벨몬트 가문 정예 부대의 최종 본부. 모든 정예가 모이는 최고의 시설.

**Positive Prompt**:
```
ultimate elite headquarters, supreme elite command, final elite stronghold,
most advanced training facility, elite war council chamber,
supreme military base, elite final test arena, ultimate elite facility,
elite command center, elite mastery chamber, supreme elite base,
epic elite stronghold, high quality, 8k, (masterpiece:1.2),
(best quality:1.2), (supreme elite:1.2), no people, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, bright, cheerful, outdoor, sunny,
modern, text, watermark, blurry, low quality
```

**파일명**: `stage_26_elite_final.png`

---

#### 👭 **Stage 27: 드레이크 자매 (Sisters) - 드레이크 자매의 방**

**컨셉**: 드레이크 자매 Elena와 Ariana가 함께 있는 특별한 공간. 따뜻하면서도 경쟁적인 분위기.

**Positive Prompt**:
```
Drake sisters chamber, elegant sisters room, noble family private hall,
warm family atmosphere, competitive yet friendly, luxurious interior,
sisters training space, family bond arena, Drake family private area,
elegant decorations, family warmth, sisters challenge ground,
epic sisters chamber, high quality, 8k, (masterpiece:1.2),
(best quality:1.2), (family bond:1.1), no people, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, dark, gloomy, ruins, destruction,
modern, text, watermark, blurry, low quality
```

**파일명**: `stage_27_sisters.png`

---

#### ⚔️ **Stage 28: 다중 전술 (Multi) - 전술 연합장**

**컨셉**: 다양한 전술이 결합된 복합 전투장. 여러 전략이 동시에 펼쳐지는 공간.

**Positive Prompt**:
```
combined tactics arena, multi-strategy battlefield, tactical fusion ground,
various combat zones, strategic battlefield, multiple tactical areas,
combined forces training ground, multi-tactic arena, strategic warfare field,
tactical command center, multi-strategy chamber, combined tactics sanctum,
epic tactics arena, high quality, 8k, (masterpiece:1.2),
(best quality:1.2), (strategic warfare:1.2), no people, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, single strategy, uniform tactics,
modern, text, watermark, blurry, low quality
```

**파일명**: `stage_28_multi_tactics.png`

---

#### 🌪️ **Stage 29: 바람 최종 (Wind3) - 바람의 정점**

**컨셉**: 바람 마법의 최종 형태를 보여주는 하늘의 정점. 모든 바람이 모이는 곳.

**Positive Prompt**:
```
wind summit, ultimate sky peak, highest wind realm,
clouds swirling below, sky temple peak, wind convergence point,
celestial wind altar, sky summit temple, ultimate wind magic,
heavenly peak, wind mastery sanctum, sky convergence point,
epic sky summit, high quality, 8k, (masterpiece:1.2),
(best quality:1.2), (ultimate wind:1.2), no people, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, ground level, dark, underground,
modern, text, watermark, blurry, low quality
```

**파일명**: `stage_29_wind_final.png`

---

#### 👑 **Stage 30: 최종 보스 (Final Boss) - 벨몬트 대전투장**

**컨셉**: 벨몬트 가문 가주의 웅장한 전투 왕좌. 압도적이고 장엄한 최종 결전지.

**Positive Prompt**:
```
grand throne room, final boss arena, massive chamber, tall pillars,
golden royal throne elevated, dark purple ambient lighting,
magical orbs floating, majestic and intimidating atmosphere,
dramatic lighting from above, epic final battle stage,
ornate decorations, huge scale, imposing architecture,
regal yet dangerous, ancient power, magical circles on floor,
cathedral ceiling, stained glass windows, divine rays of light,
ultimate fantasy boss room, breathtaking scale, cinematic composition,
high quality, 8k wallpaper, (masterpiece:1.3), (best quality:1.2),
(epic composition:1.2), no people, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, small room, cramped, outdoor, bright sunny,
modern, text, watermark, blurry, low quality
```

**추천 색조**: 어두운 보라색, 금색, 검은색, 하얀 빛 - 장엄하고 압도적인 분위기

**파일명**: `stage_30_final_boss.png`

---

### 📗 **Chapter 4: 결혼과 적응 (Stage 31-40)**

#### 💒 **Stage 31: 결혼식 (Wedding) - 결혼식 장소**

**컨셉**: 세라피나와 카이의 결혼식이 열리는 아름다운 장소. 축하와 기쁨이 가득한 공간.

**Positive Prompt**:
```
wedding ceremony hall, beautiful wedding venue, elegant wedding chapel,
white and gold decorations, flower arrangements, wedding altar,
celebration atmosphere, joyful environment, elegant wedding hall,
wedding ceremony space, festive decorations, wedding celebration ground,
epic wedding venue, high quality, 8k, (masterpiece:1.2),
(best quality:1.2), (celebration:1.1), no people, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, dark, gloomy, sad, ruins,
modern, text, watermark, blurry, low quality
```

**파일명**: `stage_31_wedding.png`

---

#### 🏛️ **Stage 32: 정치 음모 (Aldric) - 왕국 의회**

**컨셉**: 정치적 음모가 벌어지는 왕국 의회. 어둡고 음침한 정치의 장.

**Positive Prompt**:
```
royal council chamber, political intrigue hall, dark council room,
shadowy political arena, conspiracy meeting place, political power center,
dim lighting, secretive atmosphere, political manipulation chamber,
council debate hall, political intrigue sanctum, dark political realm,
epic council chamber, high quality, 8k, (masterpiece:1.2),
(best quality:1.2), (political darkness:1.2), no people, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, bright, cheerful, outdoor, sunny,
modern, text, watermark, blurry, low quality
```

**파일명**: `stage_32_politics.png`

---

#### 💚 **Stage 33: 하인 최종 (Mira2) - 친밀한 최종 시험**

**컨셉**: 하인 Mira와의 최종 시험. 우정과 신뢰를 시험하는 특별한 공간.

**Positive Prompt**:
```
final friendship test, ultimate trust arena, intimate final challenge,
warm final test ground, friendship bond chamber, trust trial space,
supportive final arena, friendship sanctum, ultimate bond test,
intimate challenge ground, friendship final chamber, trust sanctum,
epic friendship arena, high quality, 8k, (masterpiece:1.2),
(best quality:1.2), (deep friendship:1.1), no people, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, dark, gloomy, ruins, destruction,
modern, text, watermark, blurry, low quality
```

**파일명**: `stage_33_mira_final.png`

---

#### ⚔️ **Stage 34: 갈등 (Marcus2) - 가문 갈등의 장**

**컨셉**: 가문 내부의 갈등이 표면화되는 긴장된 공간. 대립과 화해가 공존하는 곳.

**Positive Prompt**:
```
family conflict chamber, tension-filled hall, family dispute arena,
confrontation space, family tension ground, conflict resolution chamber,
tense atmosphere, family struggle arena, reconciliation space,
family conflict sanctum, tension chamber, family dispute ground,
epic conflict arena, high quality, 8k, (masterpiece:1.2),
(best quality:1.2), (family tension:1.2), no people, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, bright, cheerful, peaceful, harmonious,
modern, text, watermark, blurry, low quality
```

**파일명**: `stage_34_conflict.png`

---

#### 🗡️ **Stage 35: 음모 공격 (Conspiracy) - 음모의 본거지**

**컨셉**: 정치적 음모가 실행되는 어두운 본거지. 배신과 음모가 얽힌 공간.

**Positive Prompt**:
```
conspiracy headquarters, betrayal den, dark conspiracy lair,
secret meeting place, conspiracy execution ground, betrayal chamber,
shadowy conspiracy room, secret plot arena, conspiracy sanctum,
dark conspiracy hall, betrayal ground, conspiracy execution chamber,
epic conspiracy lair, high quality, 8k, (masterpiece:1.2),
(best quality:1.2), (dark conspiracy:1.2), no people, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, bright, cheerful, peaceful, clear,
modern, text, watermark, blurry, low quality
```

**파일명**: `stage_35_conspiracy.png`

---

#### 🔮 **Stage 36: 마법 사고 (Thorne) - 마법 연구소**

**컨셉**: 마법 실험이 잘못되어 사고가 난 마법 연구소. 위험한 마법 에너지가 넘치는 곳.

**Positive Prompt**:
```
magic research laboratory, magical accident site, unstable magic lab,
chaotic magic energy, experimental magic chamber, magic disaster area,
unstable magical experiments, magic research facility, dangerous magic lab,
magical accident chamber, unstable magic sanctum, experimental magic realm,
epic magic lab, high quality, 8k, (masterpiece:1.2),
(best quality:1.2), (chaotic magic:1.2), no people, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, stable, safe, controlled, peaceful,
modern, text, watermark, blurry, low quality
```

**파일명**: `stage_36_magic_lab.png`

---

#### 🔮❄️ **Stage 37: 고대 마법 (Ancient) - 고대 마법 유적**

**컨셉**: 고대 마법이 깃든 오래된 유적. Seraphine과 Thorne의 고대 마법 연구장.

**Positive Prompt**:
```
ancient magic ruins, old magical temple, ancient magic research site,
ancient runes, old magic circles, ancient magical artifacts,
ancient magic chamber, old magic sanctum, ancient magic research ground,
ancient ruins temple, old magic laboratory, ancient magic realm,
epic ancient ruins, high quality, 8k, (masterpiece:1.2),
(best quality:1.2), (ancient power:1.2), no people, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, modern, contemporary, new construction,
modern, text, watermark, blurry, low quality
```

**파일명**: `stage_37_ancient.png`

---

#### 🔥 **Stage 38: 라이벌 화해 (Ariana4) - 화해의 장소**

**컨셉**: 라이벌 Ariana와의 화해가 이루어지는 특별한 공간. 경쟁에서 우정으로.

**Positive Prompt**:
```
reconciliation chamber, rival friendship hall, reconciliation ground,
warm reconciliation space, rival bond arena, friendship reconciliation chamber,
healing atmosphere, rival understanding ground, reconciliation sanctum,
friendship healing chamber, rival bond sanctum, reconciliation temple,
epic reconciliation arena, high quality, 8k, (masterpiece:1.2),
(best quality:1.2), (healing friendship:1.1), no people, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, dark, gloomy, conflict, tension,
modern, text, watermark, blurry, low quality
```

**파일명**: `stage_38_reconciliation.png`

---

#### 💍 **Stage 39: 협력 배틀 (Kai2) - 부부 협력장**

**컨셉**: 약혼자 카이와 함께하는 협력 배틀. 부부가 함께 싸우는 특별한 공간.

**Positive Prompt**:
```
cooperation battle arena, couple teamwork ground, partnership battle chamber,
united front arena, couple cooperation space, teamwork battle ground,
partnership sanctum, couple bond arena, cooperation battle sanctum,
united battle chamber, teamwork sanctum, partnership battle temple,
epic cooperation arena, high quality, 8k, (masterpiece:1.2),
(best quality:1.2), (united strength:1.1), no people, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, dark, gloomy, conflict, tension,
modern, text, watermark, blurry, low quality
```

**파일명**: `stage_39_cooperation.png`

---

#### 👹 **Stage 40: 어둠 교단 (Cult) - 어둠 교단 성소**

**컨셉**: 어둠의 교단이 모이는 어두운 성소. 위험하고 신비로운 어둠의 본거지.

**Positive Prompt**:
```
dark cult sanctuary, shadow cult temple, dark cult gathering place,
ominous cult chamber, dark cult altar, shadow cult sanctum,
dark cult headquarters, shadow cult meeting hall, dark cult realm,
cult ritual chamber, dark cult temple, shadow cult stronghold,
epic cult sanctuary, high quality, 8k, (masterpiece:1.2),
(best quality:1.2), (dark cult:1.2), no people, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, bright, cheerful, peaceful, light,
modern, text, watermark, blurry, low quality
```

**파일명**: `stage_40_cult.png`

---

### 📙 **Chapter 5: 어둠의 전쟁 (Stage 41-50)**

#### 👹 **Stage 41: 어둠 침략 (Invasion) - 침략 현장**

**컨셉**: 어둠의 세력이 침략한 전쟁터. 파괴와 혼돈이 가득한 전쟁의 장.

**Positive Prompt**:
```
dark invasion battlefield, war-torn landscape, invasion war zone,
destruction everywhere, dark forces invasion, chaotic battlefield,
invasion destruction, war chaos, dark invasion ground,
invasion war chamber, dark forces arena, invasion battlefield sanctum,
epic invasion battlefield, high quality, 8k, (masterpiece:1.2),
(best quality:1.2), (war chaos:1.2), no people, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, peaceful, calm, intact, undamaged,
modern, text, watermark, blurry, low quality
```

**파일명**: `stage_41_invasion.png`

---

#### ⚡🌪️ **Stage 42: 석화 타락 (Garen4) - 타락한 석화의 심연**

**컨셉**: 타락한 Garen의 석화 마법이 만든 어둠의 석화 공간. 더욱 어둡고 위험한 석화 영역.

**Positive Prompt**:
```
corrupted petrification realm, dark stone transformation, corrupted stone abyss,
dark petrified landscape, corrupted stone magic, evil petrification chamber,
dark stone altar, corrupted petrification sanctum, evil stone transformation,
corrupted stone temple, dark petrification realm, evil stone magic,
epic corrupted stone realm, high quality, 8k, (masterpiece:1.2),
(best quality:1.2), (corrupted stone:1.2), no people, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, bright, colorful, light, natural stone,
modern, text, watermark, blurry, low quality
```

**파일명**: `stage_42_corrupted_stone.png`

---

#### 👹 **Stage 43: 어둠 통달 (Darius4) - 절대 어둠**

**컨셉**: 타락한 Darius의 절대적인 어둠 마법. 모든 빛을 삼키는 완전한 어둠.

**Positive Prompt**:
```
absolute void darkness, complete shadow mastery, ultimate dark void,
all-consuming darkness, absolute shadow realm, complete dark abyss,
void of all light, absolute darkness chamber, ultimate shadow sanctum,
complete void temple, absolute dark realm, ultimate shadow mastery,
epic absolute void, high quality, 8k, (masterpiece:1.2),
(best quality:1.2), (absolute void:1.2), no people, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, bright, light, colorful, cheerful,
modern, text, watermark, blurry, low quality
```

**파일명**: `stage_43_absolute_darkness.png`

---

#### 👑 **Stage 44: Elena 구출 (Elena2) - 타락한 Elena의 감옥**

**컨셉**: 타락한 Elena가 갇혀있는 어둠의 감옥. 구원이 필요한 어둠에 물든 공간.

**Positive Prompt**:
```
corrupted Elena prison, dark corruption chamber, shadow prison cell,
corruption containment, dark prison realm, shadow corruption chamber,
corrupted prison sanctum, dark containment area, shadow prison temple,
corruption prison ground, dark prison arena, shadow corruption sanctum,
epic corruption prison, high quality, 8k, (masterpiece:1.2),
(best quality:1.2), (dark corruption:1.2), no people, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, bright, cheerful, free, open space,
modern, text, watermark, blurry, low quality
```

**파일명**: `stage_44_corruption_prison.png`

---

#### 👹 **Stage 45: 교단 본부 (Cult2) - 어둠 교단 최종 본부**

**컨셉**: 어둠 교단의 최종 본부. 모든 어둠의 세력이 모이는 최악의 장소.

**Positive Prompt**:
```
ultimate dark cult headquarters, final cult stronghold, supreme cult temple,
dark cult command center, ultimate cult sanctum, final cult chamber,
supreme dark cult base, ultimate cult arena, final cult stronghold,
dark cult final temple, ultimate cult realm, supreme cult sanctum,
epic cult headquarters, high quality, 8k, (masterpiece:1.2),
(best quality:1.2), (ultimate cult:1.2), no people, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, bright, cheerful, peaceful, light,
modern, text, watermark, blurry, low quality
```

**파일명**: `stage_45_cult_final.png`

---

#### 👹 **Stage 46: 주동자 (Xander) - 주동자의 성**

**컨셉**: 모든 음모의 주동자 Xander의 성. 어둠의 계획이 시작된 곳.

**Positive Prompt**:
```
mastermind Xander castle, conspiracy master stronghold, mastermind headquarters,
dark mastermind chamber, conspiracy origin point, mastermind command center,
ultimate conspiracy base, mastermind sanctum, dark mastermind temple,
conspiracy master realm, mastermind final chamber, ultimate conspiracy sanctum,
epic mastermind castle, high quality, 8k, (masterpiece:1.2),
(best quality:1.2), (mastermind power:1.2), no people, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, bright, cheerful, peaceful, light,
modern, text, watermark, blurry, low quality
```

**파일명**: `stage_46_mastermind.png`

---

#### 👹👹👹 **Stage 47: 타락자들 (Corrupted) - 타락의 회합장**

**컨셉**: 모든 타락한 자들이 모이는 회합장. Garen, Darius, Elena가 함께 있는 어둠의 공간.

**Positive Prompt**:
```
corrupted gathering hall, fallen ones assembly, corruption meeting chamber,
all corrupted together, dark assembly ground, corruption convergence point,
fallen ones sanctum, corruption assembly temple, dark gathering realm,
corrupted convergence chamber, fallen ones arena, corruption assembly sanctum,
epic corruption hall, high quality, 8k, (masterpiece:1.2),
(best quality:1.2), (multiple corruption:1.2), no people, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, bright, cheerful, peaceful, light,
modern, text, watermark, blurry, low quality
```

**파일명**: `stage_47_corrupted_gathering.png`

---

#### 👑 **Stage 48: 가주 협력 (Elder2) - 가주와의 협력장**

**컨셉**: 벨몬트 가문 가주와 함께하는 협력 전투. 가문의 힘을 합치는 특별한 공간.

**Positive Prompt**:
```
elder cooperation arena, family head partnership, elder collaboration chamber,
united family power, elder teamwork ground, family head cooperation space,
elder partnership sanctum, family unity arena, elder collaboration temple,
united family chamber, elder teamwork sanctum, family head cooperation realm,
epic elder cooperation, high quality, 8k, (masterpiece:1.2),
(best quality:1.2), (family unity:1.1), no people, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, dark, gloomy, conflict, division,
modern, text, watermark, blurry, low quality
```

**파일명**: `stage_48_elder_cooperation.png`

---

#### 👭💍 **Stage 49: 가족 결사 (Family) - 가족 결집장**

**컨셉**: 카이와 Ariana를 포함한 가족이 모두 모이는 결집장. 가족의 힘을 보여주는 곳.

**Positive Prompt**:
```
family gathering hall, united family arena, family bond chamber,
all family together, family unity ground, family gathering sanctum,
united family temple, family bond arena, family gathering realm,
family unity chamber, family bond sanctum, united family temple,
epic family gathering, high quality, 8k, (masterpiece:1.2),
(best quality:1.2), (family bond:1.1), no people, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, dark, gloomy, conflict, division,
modern, text, watermark, blurry, low quality
```

**파일명**: `stage_49_family.png`

---

#### 👹👑 **Stage 50: 공허 제왕 (Void) - 공허의 왕좌**

**컨셉**: 최종 보스 공허 제왕의 왕좌. 모든 것을 삼키는 절대적인 공허의 공간.

**Positive Prompt**:
```
void emperor throne, absolute void realm, void emperor palace,
all-consuming void, void emperor sanctum, absolute emptiness,
void throne chamber, void emperor arena, absolute void temple,
void convergence point, void emperor realm, absolute void sanctum,
epic void throne, high quality, 8k, (masterpiece:1.3),
(best quality:1.2), (absolute void:1.3), no people, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, bright, light, colorful, cheerful, solid matter,
modern, text, watermark, blurry, low quality
```

**파일명**: `stage_50_void_emperor.png`

---

## 🎨 **추가 배경 (선택사항)**

### 🏆 **승리 결과 화면 배경**

**컨셉**: 환한 빛이 비추는 승리의 순간. 황금빛과 밝은 색상.

**Positive Prompt**:
```
victory celebration environment, bright golden light, triumphant atmosphere,
rays of light from above, golden particles falling, glory moment,
beautiful sky, warm colors, success ambience, achievement background,
heavenly light, winner's stage, majestic golden palace hall,
bright and hopeful, fantasy victory scene, high quality, 8k,
(masterpiece:1.2), (best quality:1.2), (glorious lighting:1.1),
no people, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, dark, gloomy, sad, defeat,
modern, text, watermark, blurry, low quality
```

**파일명**: `victory.png`

---

### 💀 **패배 결과 화면 배경**

**컨셉**: 어둡고 쓸쓸한 패배의 순간. 회색빛과 어두운 색상.

**Positive Prompt**:
```
defeat aftermath environment, dark grey atmosphere, somber mood,
overcast sky, dim lighting, melancholic scene, loss ambience,
ruins background, fading light, grey clouds, disappointment setting,
quiet battlefield, aftermath of loss, dark fantasy scene,
muted colors, sad atmosphere, high quality, 8k,
(masterpiece:1.2), (best quality:1.2), (melancholic atmosphere:1.1),
no people, 1024x768
```

**Negative Prompt**:
```
people, characters, humans, bright, cheerful, victory, celebration,
modern, text, watermark, blurry, low quality
```

**파일명**: `defeat.png`

---

## 📋 **생성 체크리스트**

### **필수 배경 (50개)**
- [ ] Stage 1-10: Chapter 1 (10개)
- [ ] Stage 11-20: Chapter 2 (10개)
- [ ] Stage 21-30: Chapter 3 (10개)
- [ ] Stage 31-40: Chapter 4 (10개)
- [ ] Stage 41-50: Chapter 5 (10개)

### **선택 배경 (2개)**
- [ ] Victory: 승리 결과 화면
- [ ] Defeat: 패배 결과 화면

**총 52개 이미지**

---

## 💾 **파일 명명 규칙**

```
# Chapter 1
stage_01_training.png
stage_02_fire.png
stage_03_ice.png
stage_04_lightning.png
stage_05_wind.png
stage_06_fire_ice.png
stage_07_storm.png
stage_08_elite.png
stage_09_corridor.png
stage_10_elena.png

# Chapter 2
stage_11_training_advanced.png
stage_12_fire_master.png
stage_13_ice_master.png
stage_14_lightning_master.png
stage_15_wind_master.png
stage_16_earth_master.png
stage_17_fire_challenge.png
stage_18_friendship.png
stage_19_shadow.png
stage_20_elite_advanced.png

# Chapter 3
stage_21_fusion.png
stage_22_kai.png
stage_23_knights.png
stage_24_petrification.png
stage_25_shadow_master.png
stage_26_elite_final.png
stage_27_sisters.png
stage_28_multi_tactics.png
stage_29_wind_final.png
stage_30_final_boss.png

# Chapter 4
stage_31_wedding.png
stage_32_politics.png
stage_33_mira_final.png
stage_34_conflict.png
stage_35_conspiracy.png
stage_36_magic_lab.png
stage_37_ancient.png
stage_38_reconciliation.png
stage_39_cooperation.png
stage_40_cult.png

# Chapter 5
stage_41_invasion.png
stage_42_corrupted_stone.png
stage_43_absolute_darkness.png
stage_44_corruption_prison.png
stage_45_cult_final.png
stage_46_mastermind.png
stage_47_corrupted_gathering.png
stage_48_elder_cooperation.png
stage_49_family.png
stage_50_void_emperor.png

# 기타
victory.png
defeat.png
```

---

## 🎯 **품질 최적화 팁**

### **고품질 생성을 위한 설정**
```
Sampling Steps: 35-40
CFG Scale: 7.5-8
Denoising Strength: 0.5 (img2img 사용 시)
Clip Skip: 2
```

### **후처리 권장 사항**
1. **Upscale**: 필요시 1.5배 업스케일 (1536x1152)
2. **색보정**: 채도 +5~10% 조정
3. **샤프닝**: 약간의 샤프 필터 적용
4. **압축**: PNG → WebP 변환 (80-90% 품질)

---

## 📂 **저장 위치**

```
D:\AI_Projects\Gals\web\public\backgrounds\
```

모든 PNG 파일을 위 폴더에 저장하면 자동으로 로드됩니다.

---

## ✅ **최종 체크**

생성 완료 후 확인사항:
- [ ] 해상도: 1024x768px 정확히 맞음
- [ ] 파일 크기: 각 300-800KB
- [ ] 캐릭터 없음: 사람/얼굴 등장 안 함
- [ ] 텍스트 없음: 워터마크/로고 없음
- [ ] 테마 일치: 스테이지 컨셉과 일치
- [ ] 색조 적절: 각 스테이지 분위기에 맞음
- [ ] 품질 양호: 선명하고 깨끗함

---

## 📞 **문제 해결**

### **Q1: 캐릭터가 계속 나와요**
**A**: Negative Prompt에 더 강조
```
(people:1.3), (characters:1.3), (humans:1.3), (person:1.3),
face, portrait, character design
```

### **Q2: 해상도가 안 맞아요**
**A**: 프롬프트 끝에 명시
```
1024x768, aspect ratio 4:3, resolution 1024x768
```

### **Q3: 분위기가 너무 어두워요/밝아요**
**A**: 프롬프트에 lighting 키워드 추가
```
# 밝게
bright lighting, well-lit, daylight, sunny

# 어둡게
dark lighting, dim, shadows, night
```

### **Q4: 품질이 떨어져요**
**A**: 고품질 키워드 강화
```
(masterpiece:1.3), (best quality:1.3), (ultra detailed:1.2),
8k, high resolution, sharp focus, detailed
```

### **Q5: 원하는 색감이 안 나와요**
**A**: 색상 키워드 명시
```
# 따뜻한 톤
warm colors, golden hour, orange tint, cozy atmosphere

# 차가운 톤
cold colors, blue tint, cool atmosphere, icy
```

---

**생성 행운을 빕니다!** 🎨✨

완료 후 `web/public/backgrounds/` 폴더에 모든 파일을 저장하면
게임에서 자동으로 로드됩니다! 🎮
