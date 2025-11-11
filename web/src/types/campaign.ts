export type DialogueLine = {
  speaker: string;
  text: string;
  emotion?: 'normal' | 'angry' | 'happy' | 'sad' | 'surprised' | 'determined';
  characterImage?: string;
};

export type CampaignStage = {
  id: number;
  name: string;
  theme: string;
  recommendedPower: number;
  firstReward: { gold: number; shards: number; cards?: string[] };
  repeatReward: { gold: number; shards: number };
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

