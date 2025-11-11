const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const sourcePath = path.join(rootDir, 'web', 'src', 'store.ts');
const outputPath = path.join(rootDir, '스토리 대화 모음.md');

function extractCampaignStages(source) {
  const marker = 'campaignStages: [';
  const start = source.indexOf(marker);
  if (start === -1) {
    throw new Error('campaignStages 배열을 찾을 수 없습니다.');
  }
  const arrayStart = source.indexOf('[', start);
  if (arrayStart === -1) {
    throw new Error('campaignStages 배열 시작을 찾을 수 없습니다.');
  }

  let depth = 0;
  let arrayEnd = -1;
  for (let i = arrayStart; i < source.length; i += 1) {
    const char = source[i];
    if (char === '[') {
      depth += 1;
    } else if (char === ']') {
      depth -= 1;
      if (depth === 0) {
        arrayEnd = i;
        break;
      }
    }
  }

  if (arrayEnd === -1) {
    throw new Error('campaignStages 배열 끝을 찾을 수 없습니다.');
  }

  return source.slice(arrayStart + 1, arrayEnd);
}

function extractStages(arrayContent) {
  const stages = [];
  const stageRegex = /\{\s*id:\s*(\d+),\s*name:\s*'([^']+)'[\s\S]*?cutscene:\s*\{([\s\S]*?)\}\s*\}/g;

  let stageMatch;
  while ((stageMatch = stageRegex.exec(arrayContent)) !== null) {
    const id = Number(stageMatch[1]);
    const name = stageMatch[2];
    const cutsceneBlock = stageMatch[3];

    const sections = {};
    const sectionRegex = /(preBattle|postVictory|postDefeat):\s*\[([\s\S]*?)\]/g;
    let sectionMatch;

    while ((sectionMatch = sectionRegex.exec(cutsceneBlock)) !== null) {
      const sectionKey = sectionMatch[1];
      const itemsBlock = sectionMatch[2];
      const entries = [];
      const entryRegex = /\{\s*speaker:\s*'([^']+)'[\s\S]*?text:\s*'([\s\S]*?)'[\s\S]*?\}/g;
      let entryMatch;

      while ((entryMatch = entryRegex.exec(itemsBlock)) !== null) {
        const speaker = entryMatch[1];
        const text = entryMatch[2]
          .replace(/\\'/g, "'")
          .replace(/\s+/g, ' ')
          .trim();
        entries.push({ speaker, text });
      }

      sections[sectionKey] = entries;
    }

    stages.push({ id, name, sections });
  }

  stages.sort((a, b) => a.id - b.id);
  return stages;
}

function buildMarkdown(stages) {
  const lines = ['# 스토리 대화 모음'];
  const sectionLabels = {
    preBattle: '전투 전',
    postVictory: '승리 후',
    postDefeat: '패배 후',
  };

  stages.forEach(stage => {
    lines.push('', `## Stage ${stage.id} - ${stage.name}`);

    Object.entries(sectionLabels).forEach(([key, label]) => {
      const entries = stage.sections[key];
      if (!entries || entries.length === 0) {
        return;
      }

      lines.push('', `### ${label}`);
      entries.forEach(entry => {
        lines.push(`- ${entry.speaker}: ${entry.text}`);
      });
    });
  });

  return lines.join('\n');
}

function main() {
  const source = fs.readFileSync(sourcePath, 'utf8');
  const arrayContent = extractCampaignStages(source);
  const stages = extractStages(arrayContent);

  if (!stages.length) {
    throw new Error('추출된 스테이지가 없습니다.');
  }

  const markdown = buildMarkdown(stages);
  fs.writeFileSync(outputPath, markdown, 'utf8');
  console.log(`총 ${stages.length}개의 스테이지 대본을 '${outputPath}'에 저장했습니다.`);
}

main();

