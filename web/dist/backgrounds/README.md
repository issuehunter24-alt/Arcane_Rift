# 🖼️ Background Images Folder

## 📁 Purpose
This folder stores background images for the campaign story mode cutscenes.

## 📐 Image Specifications
- **Size**: 1024 x 768px (4:3 aspect ratio)
- **Format**: PNG (will be converted to WebP for optimization)
- **Quality**: 300-800KB per file

## 📋 Required Files (Variation System)

### **Mandatory (30 files = 10 stages × 3 variations)**

#### **Stage 1: Training Ground**
- `stage_01_training_1.png` - Morning sunlight
- `stage_01_training_2.png` - Noon
- `stage_01_training_3.png` - Evening sunset

#### **Stage 2: Volcano**
- `stage_02_fire_1.png` - Lava flow
- `stage_02_fire_2.png` - Eruption
- `stage_02_fire_3.png` - Smoke

#### **Stage 3: Ice Fortress**
- `stage_03_ice_1.png` - Bright ice palace
- `stage_03_ice_2.png` - Aurora
- `stage_03_ice_3.png` - Blizzard

#### **Stage 4: Lightning Tower**
- `stage_04_lightning_1.png` - Lightning strike
- `stage_04_lightning_2.png` - Heavy rain
- `stage_04_lightning_3.png` - Dark clouds

#### **Stage 5: Sky Temple**
- `stage_05_wind_1.png` - Clear sky
- `stage_05_wind_2.png` - Among clouds
- `stage_05_wind_3.png` - Sunset

#### **Stage 6: Fire/Ice Clash**
- `stage_06_fire_ice_1.png` - Fire dominant
- `stage_06_fire_ice_2.png` - Balanced
- `stage_06_fire_ice_3.png` - Ice dominant

#### **Stage 7: Storm**
- `stage_07_storm_1.png` - Tornado
- `stage_07_storm_2.png` - Lightning storm
- `stage_07_storm_3.png` - Eye of the storm

#### **Stage 8: Elite Facility**
- `stage_08_elite_1.png` - Dark lighting
- `stage_08_elite_2.png` - Torch light
- `stage_08_elite_3.png` - Tactical room

#### **Stage 9: Corridor**
- `stage_09_corridor_1.png` - Corridor start
- `stage_09_corridor_2.png` - Middle
- `stage_09_corridor_3.png` - Before boss room

#### **Stage 10: Throne Room**
- `stage_10_final_boss_1.png` - Front view
- `stage_10_final_boss_2.png` - Side angle
- `stage_10_final_boss_3.png` - Magic circle activated

### **Optional (9 files = 3 types × 3 variations)**

#### **Fallback (Default Background)**
- `fallback_1.png` - Neutral variation 1
- `fallback_2.png` - Neutral variation 2
- `fallback_3.png` - Neutral variation 3

#### **Victory (Success Screen)**
- `victory_1.png` - Golden light
- `victory_2.png` - Radiant
- `victory_3.png` - Majestic

#### **Defeat (Failure Screen)**
- `defeat_1.png` - Dark
- `defeat_2.png` - Somber
- `defeat_3.png` - Grey

### **Total: 39 images (30 mandatory + 9 optional)**

## 🎨 How to Generate Images

See the full guide in: **`기획서/배경_이미지_SD_프롬프트.md`**

This guide contains:
- Detailed SD prompts for each stage
- Positive/Negative prompts
- Color palettes and mood guidelines
- Generation settings (Steps, CFG Scale, etc.)
- Troubleshooting tips

## 📂 File Naming Convention

Use the exact file names listed above. The game will automatically load backgrounds based on stage ID:

```
Stage ID 1 → backgrounds/stage_01_training.png
Stage ID 2 → backgrounds/stage_02_fire.png
...
Stage ID 10 → backgrounds/stage_10_final_boss.png
```

## 🚀 Usage in Game

Once you place PNG files in this folder, they will be automatically loaded by the game's cutscene system. The CSS will handle scaling:

```css
background-size: cover;
background-position: center;
```

This means the 1024x768 images will be stretched to fill the screen (1920x1080 or mobile screens) without distortion.

## 🎮 Variation Usage

### **Scene Transition**
```
Stage Entry → Variation 1
Battle Start → Variation 2
Battle End → Variation 3
```

### **Random Selection**
```javascript
const variation = Math.floor(Math.random() * 3) + 1;
const bg = `stage_01_training_${variation}.png`;
```

### **Difficulty-based**
```
Normal → Variation 1 (bright)
Hard → Variation 2 (medium)
Extreme → Variation 3 (dark)
```

## ✅ Checklist

- [ ] 30 mandatory stage backgrounds (10 × 3 variations)
- [ ] 9 optional backgrounds (3 types × 3 variations)
- [ ] All files are 1024x768px
- [ ] All files use correct naming convention (`stage_XX_name_N.png`)
- [ ] All files are PNG format
- [ ] Total file size < 30MB for all backgrounds

---

**Ready to generate?** Start with the priority order:
1. **Stage 1, 6, 10** (3 variations each = 9 images)
2. **Stage 2, 3, 4, 5, 7** (3 variations each = 15 images)
3. **Stage 8, 9** (3 variations each = 6 images)
4. **Fallback, Victory, Defeat** (3 variations each = 9 images)

