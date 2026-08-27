import type { Sound, SoundType } from "../types/sounds";
import kickDrumSampleUrl from "../assets/sounds/KickDrum.mp3";
import hihat_1 from "../assets/sounds/hihat.wav";
import hihat_2 from "../assets/sounds/hihat_2.wav";
import snare_1 from "../assets/sounds/snare.wav";
import snare_2 from "../assets/sounds/snare_2.mp3";
import snare_3 from "../assets/sounds/snare_3.mp3";
import snare_4 from "../assets/sounds/snare_4.mp3";
import snare_ambient from "../assets/sounds/snare_ambient.mp3";
import clap_1 from "../assets/sounds/Clap_1.mp3";
import clap_2 from "../assets/sounds/Clap_2.mp3";
import clap_3 from "../assets/sounds/Clap_3.mp3";
import superkickTrace3 from "../assets/sounds/superkickTrance3.wav";
import kick_2 from "../assets/sounds/kick2.mp3";
import light_kick_drum from "../assets/sounds/light_kick_drum.mp3";
import x808_3 from "../assets/sounds/808_3.wav";
import bass_Gsharp from "../assets/sounds/BASS_Gsharp.wav";
import c_Soft_piano from "../assets/sounds/freesound_community-c-soft-44021.wav";
import c_afro_pipe from "../assets/sounds/afro-pipe-c_C.wav";
import basic_tambourine from "../assets/sounds/basic-tambourine.wav";
import c_bass_808_steady from "../assets/sounds/bass-808-c-note-steady_C_major.wav";
import c_phonk_bass from "../assets/sounds/phonk-bass-c-major-note_12bpm_C_major.wav";
import c_punchy_brass_one_shot from "../assets/sounds/punchy-brass-one-shot_C.wav";
import brass_2 from "../assets/sounds/brass_2.mp3";
import cowbell from "../assets/sounds/cowbell.mp3";
import phonk_cowbell from "../assets/sounds/Phonk_Cowbell.mp3";
import synth_1 from "../assets/sounds/Synth_1.mp3";
import synth_2 from "../assets/sounds/Synth_2.wav";
import synth_3_bonk from "../assets/sounds/Synth_3_bonk.wav";
import synth_4 from "../assets/sounds/synth_4.wav";
import synth_5 from "../assets/sounds/synth_5.mp3";
import trap_base from "../assets/sounds/TrapBase.mp3";
import { Howl, Howler } from "howler";

export const pentatonicTranslation = [-12, -10, -8, -5, -3, 0, 2, 4, 7, 9, 12];

const sampleSources: Record<SoundType, string> = {
  kickdrum_1: kickDrumSampleUrl,
  hihat_1: hihat_1,
  hihat_2: hihat_2,
  snare_1: snare_1,
  snare_2: snare_2,
  snare_3: snare_3,
  snare_4: snare_4,
  snare_ambient: snare_ambient,
  clap_1: clap_1,
  clap_2: clap_2,
  clap_3: clap_3,
  superkickTrace3: superkickTrace3,
  kick_2: kick_2,
  light_kick_drum: light_kick_drum,
  x808_3: x808_3,
  Gs_bass: bass_Gsharp,
  c_Soft_piano: c_Soft_piano,
  c_afro_pipe: c_afro_pipe,
  basic_tambourine: basic_tambourine,
  cowbell: cowbell,
  phonk_cowbell: phonk_cowbell,
  c_bass_808_steady: c_bass_808_steady,
  c_phonk_bass: c_phonk_bass,
  c_punchy_brass_one_shot: c_punchy_brass_one_shot,
  brass_2: brass_2,
  synth_1: synth_1,
  synth_2: synth_2,
  synth_3_bonk: synth_3_bonk,
  synth_4: synth_4,
  synth_5: synth_5,
  trap_base: trap_base,
};

const soundPool = new Map<SoundType, Howl>();

const soundGainAdjustments: Record<SoundType, number> = {
  kickdrum_1: 1,
  kick_2: 1,
  superkickTrace3: 1,
  light_kick_drum: 1,
  snare_1: 1,
  snare_2: 1,
  snare_3: 1,
  snare_4: 1,
  snare_ambient: 1,
  clap_1: 1,
  clap_2: 1,
  clap_3: 1,
  hihat_1: 2,
  hihat_2: 2.8,
  basic_tambourine: 1.4,
  cowbell: 1,
  phonk_cowbell: 1,
  x808_3: 1.2,
  Gs_bass: 1.2,
  c_bass_808_steady: 1.2,
  c_phonk_bass: 0.65,
  trap_base: 1.2,
  c_Soft_piano: 1,
  c_afro_pipe: 1,
  synth_1: 2,
  synth_2: 1.4,
  synth_3_bonk: 2,
  synth_4: 0.7,
  synth_5: 1,
  c_punchy_brass_one_shot: 0.65,
  brass_2: 1.5,
};

// ============================================================================================

function getHowl(soundType: SoundType) {
  const existing = soundPool.get(soundType);
  if (existing) return existing;

  const howl = new Howl({
    src: [sampleSources[soundType]],
    volume: 1,
    preload: true,
    pool: 16,
  });

  soundPool.set(soundType, howl);
  return howl;
}

export function prepareSound(shapeId: string, soundType: SoundType) {
  getHowl(soundType);
}

export function waitForAudioLoaded() {
  return Promise.resolve();
}

// ============================================================================================

export function playSound(shapeId: string, sound: Sound, pitchSection: number) {
  const howl = getHowl(sound.soundType);

  const semitoneShift = pentatonicTranslation[pitchSection] ?? 0;
  const rate = Math.pow(2, semitoneShift / 12);

  const id = howl.play();
  const baseGain = shapeVolumeToGain(sound.volume ?? 0);
  const soundGain = soundGainAdjustments[sound.soundType] ?? 1;

  howl.volume(Math.min(1, baseGain * soundGain), id);
  howl.rate(rate, id);
}

function shapeVolumeToGain(volume: number) {
  const normalizedVolume = Math.min(1, Math.max(0, (volume + 20) / 40));
  return 0.15 + normalizedVolume * 0.85;
}

export function setMasterVolume(volume: number) {
  Howler.volume(volume / 100);
}
// ============================================================================================

export async function startAudio() {
  if (!Howler.ctx || Howler.ctx.state === "closed") {
    return;
  }

  if (Howler.ctx.state === "suspended") {
    try {
      await Howler.ctx.resume();
    } catch {
      return;
    }
  }
}
