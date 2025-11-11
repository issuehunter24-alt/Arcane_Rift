export type DialogueLine = {
  speaker: string;
  text: string;
  emotion?: 'normal' | 'angry' | 'happy' | 'sad' | 'surprised' | 'determined';
  characterImage?: string;
};

type StageReward = {
  gold: number;
  shards: number;
  cards?: string[];
};

export type CampaignStage = {
  id: number;
  name: string;
  theme: string;
  recommendedPower: number;
  firstReward: StageReward;
  repeatReward: StageReward;
  cleared: boolean;
  story?: {
    description: string;
    backgroundImage: string;
  };
  cutscene?: {
    preBattle?: DialogueLine[];
    postVictory?: DialogueLine[];
    postDefeat?: DialogueLine[];
  };
  characterImage?: string;
  enemyImage?: string;
};

