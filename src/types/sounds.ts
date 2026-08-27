export type RootNote =
  | "C"
  | "C#"
  | "D"
  | "D#"
  | "E"
  | "F"
  | "F#"
  | "G"
  | "G#"
  | "A"
  | "A#"
  | "B";

export const soundCategoryOrder = [
  "kick",
  "snare",
  "clap",
  "hihat",
  "percussion",
  "bass",
  "melodic",
  "synth",
  "brass",
] as const;

export type SoundCategory = (typeof soundCategoryOrder)[number];

export const soundCategoryLabels: Record<SoundCategory, string> = {
  kick: "Kicks",
  snare: "Snares",
  clap: "Claps",
  hihat: "Hi-Hats",
  percussion: "Percussion",
  bass: "Bass",
  melodic: "Melodisch",
  synth: "Synths",
  brass: "Brass",
};

export const soundDefinitions = [
  {
    soundType: "kickdrum_1",
    label: "Kick 1",
    category: "kick",
    tonal: false,
    pitchable: false,
  },
  {
    soundType: "kick_2",
    label: "Kick 2",
    category: "kick",
    tonal: false,
    pitchable: false,
  },
  {
    soundType: "superkickTrace3",
    label: "Superkick Trance",
    category: "kick",
    tonal: false,
    pitchable: false,
  },
  {
    soundType: "light_kick_drum",
    label: "Light Kick",
    category: "kick",
    tonal: false,
    pitchable: false,
  },
  {
    soundType: "snare_1",
    label: "Snare 1",
    category: "snare",
    tonal: false,
    pitchable: false,
  },
  {
    soundType: "snare_2",
    label: "Snare 2",
    category: "snare",
    tonal: false,
    pitchable: false,
  },
  {
    soundType: "snare_3",
    label: "Snare 3",
    category: "snare",
    tonal: false,
    pitchable: false,
  },
  {
    soundType: "snare_4",
    label: "Snare 4",
    category: "snare",
    tonal: false,
    pitchable: false,
  },
  {
    soundType: "snare_ambient",
    label: "Ambient Snare",
    category: "snare",
    tonal: false,
    pitchable: false,
  },
  {
    soundType: "clap_1",
    label: "Clap 1",
    category: "clap",
    tonal: false,
    pitchable: false,
  },
  {
    soundType: "clap_2",
    label: "Clap 2",
    category: "clap",
    tonal: false,
    pitchable: false,
  },
  {
    soundType: "clap_3",
    label: "Clap 3",
    category: "clap",
    tonal: false,
    pitchable: false,
  },
  {
    soundType: "hihat_1",
    label: "Hi-Hat 1",
    category: "hihat",
    tonal: false,
    pitchable: false,
  },
  {
    soundType: "hihat_2",
    label: "Hi-Hat 2",
    category: "hihat",
    tonal: false,
    pitchable: false,
  },
  {
    soundType: "basic_tambourine",
    label: "Tambourine",
    category: "percussion",
    tonal: false,
    pitchable: false,
  },
  {
    soundType: "cowbell",
    label: "Cowbell",
    category: "percussion",
    tonal: false,
    pitchable: false,
  },
  {
    soundType: "x808_3",
    label: "808",
    category: "bass",
    tonal: true,
    pitchable: true,
  },
  {
    soundType: "Gs_bass",
    label: "G# Bass",
    category: "bass",
    tonal: true,
    rootNote: "G#",
    pitchable: true,
  },
  {
    soundType: "c_bass_808_steady",
    label: "808 Bass C",
    category: "bass",
    tonal: true,
    rootNote: "C",
    pitchable: true,
  },
  {
    soundType: "c_phonk_bass",
    label: "Phonk Bass C",
    category: "bass",
    tonal: true,
    rootNote: "C",
    pitchable: true,
  },
  {
    soundType: "trap_base",
    label: "Trap Bass",
    category: "bass",
    tonal: false,
    pitchable: false,
  },
  {
    soundType: "c_Soft_piano",
    label: "Soft Piano C",
    category: "melodic",
    tonal: true,
    rootNote: "C",
    pitchable: true,
  },
  {
    soundType: "c_afro_pipe",
    label: "Afro Pipe C",
    category: "melodic",
    tonal: true,
    rootNote: "C",
    pitchable: true,
  },
  {
    soundType: "synth_1",
    label: "Synth 1",
    category: "synth",
    tonal: true,
    pitchable: false,
  },
  {
    soundType: "synth_2",
    label: "Synth 2",
    category: "synth",
    tonal: true,
    pitchable: false,
  },
  {
    soundType: "synth_3_bonk",
    label: "Synth Bonk",
    category: "synth",
    tonal: true,
    pitchable: false,
  },
  {
    soundType: "synth_4",
    label: "Synth 4",
    category: "synth",
    tonal: true,
    pitchable: false,
  },
  {
    soundType: "synth_5",
    label: "Synth 5",
    category: "synth",
    tonal: true,
    pitchable: false,
  },
  {
    soundType: "phonk_cowbell",
    label: "Synth 6",
    category: "synth",
    tonal: false,
    pitchable: false,
  },
  {
    soundType: "c_punchy_brass_one_shot",
    label: "Punchy Brass C",
    category: "brass",
    tonal: true,
    rootNote: "C",
    pitchable: true,
  },
  {
    soundType: "brass_2",
    label: "Brass 2",
    category: "brass",
    tonal: true,
    pitchable: false,
  },
] as const satisfies readonly {
  soundType: string;
  label: string;
  category: SoundCategory;
  tonal: boolean;
  rootNote?: RootNote;
  pitchable: boolean;
}[];

export type SoundDefinition = (typeof soundDefinitions)[number];
export type SoundType = SoundDefinition["soundType"];

export const soundTypes = soundDefinitions.map(
  (definition) => definition.soundType,
);

export type Sound = {
  soundType: SoundType;
  volume: number;
  note: RootNote;
  duration: string;
};
