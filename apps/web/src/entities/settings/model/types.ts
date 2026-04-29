export type UserSettings = {
  defaultLevelMin: number;
  defaultLevelMax: number;
  defaultTimeLimit: number;
  strictMode: boolean;
  autoAdvanceAfterAnswer: boolean;
};

export type UserSettingsPatch = Partial<UserSettings>;