export type PsychometricTestType = 'battery' | 'iq' | 'personality';

export type BigFiveTraitKey = 'O' | 'C' | 'E' | 'A' | 'S';
export type RiasecKey = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
export type BatterySubtestKey = 'BD' | 'SI' | 'MR' | 'DS' | 'CD' | 'VC' | 'FW' | 'SR' | 'SP' | 'SS';
export type BatteryIndexKey = 'VCI' | 'VSI' | 'FRI' | 'WMI' | 'PSI';
export type IqDomainKey = 'Gf-M' | 'Gf-S' | 'Gc' | 'Gv';

export interface PsychometricParticipant {
  studentId?: string;
  name: string;
  age: number;
  band: string;
  cls: string;
  gender: string;
}

export interface PsychometricValidity {
  flags: string[];
  valid: boolean;
  // Optional personality-specific diagnostics
  acFail?: number;
  longest?: number;
  sd?: number;
  secPerItem?: number;
}

export interface BigFiveTraitResult {
  mean: number;
  pomp: number; // 0-100
  n: number;
}

export interface PsychometricPersonalityRecord {
  id: string;
  schoolId: string;
  studentId?: string;
  ts: number;
  type: 'personality';
  p: PsychometricParticipant;
  bf: number[]; // length 50, values 1-5
  ac: number[]; // length 2, values 1-5
  ri: number[]; // length 36, values 1-5
  durationSec: number;
  traits: Record<BigFiveTraitKey, BigFiveTraitResult>;
  riasec: Record<RiasecKey, number>;
  code: string; // 3-letter Holland code e.g. "IAS"
  differentiation: number;
  validity: PsychometricValidity;
  administeredBy?: string;
  version: string;
}

export interface IqDomainScore {
  name: string;
  n: number;
  c: number;
}

export interface PsychometricIqRecord {
  id: string;
  schoolId: string;
  studentId?: string;
  ts: number;
  type: 'iq';
  p: PsychometricParticipant;
  choices: number[]; // length 40
  times: number[]; // length 40, seconds
  durationSec: number;
  correct: number[]; // length 40, 0 or 1
  raw: number;
  theta: number;
  se: number;
  iq: number;
  ci: number;
  band: string;
  domains: Record<IqDomainKey, IqDomainScore>;
  answered: number;
  guttman: number;
  validity: PsychometricValidity;
  administeredBy?: string;
  version: string;
}

export interface BatteryMcSubtestResult {
  raw: number;
  items: number[];
  choices: number[];
  times: number[];
  disc: boolean;
}

export interface BatteryBdSubtestResult {
  raw: number;
  items: number[];
  times: Array<number | null>;
  disc: boolean;
}

export interface BatteryDsSubtestResult {
  raw: number;
  F: number;
  B: number;
  S: number;
  longest: { F: number; B: number; S: number };
  trials: Array<{ part: 'F' | 'B' | 'S'; len: number; ok: number }>;
}

export interface BatterySpSubtestResult {
  raw: number;
  longest: number;
  trials: Array<{ len: number; ok: number }>;
}

export interface BatteryCdSubtestResult {
  raw: number;
  errors: number;
  attempted: number;
}

export interface BatterySsSubtestResult {
  raw: number;
  correct: number;
  errors: number;
  attempted: number;
}

export interface BatterySubtestResultsMap {
  BD: BatteryBdSubtestResult;
  SI: BatteryMcSubtestResult;
  MR: BatteryMcSubtestResult;
  DS: BatteryDsSubtestResult;
  CD: BatteryCdSubtestResult;
  VC: BatteryMcSubtestResult;
  FW: BatteryMcSubtestResult;
  SR: BatteryMcSubtestResult;
  SP: BatterySpSubtestResult;
  SS: BatterySsSubtestResult;
}

export interface PsychometricBatterySnapshot {
  FSIQ: number;
  GAI: number;
  CPI: number;
  VCI: number;
  VSI: number;
  FRI: number;
  WMI: number;
  PSI: number;
  local: boolean;
}

export interface PsychometricBatteryRecord {
  id: string;
  schoolId: string;
  studentId?: string;
  ts: number;
  type: 'battery';
  p: PsychometricParticipant;
  raw: Record<BatterySubtestKey, number>;
  res: BatterySubtestResultsMap;
  durationSec: number;
  validity: PsychometricValidity;
  snapshot: PsychometricBatterySnapshot;
  administeredBy?: string;
  version: string;
}

export type PsychometricRecord =
  | PsychometricBatteryRecord
  | PsychometricIqRecord
  | PsychometricPersonalityRecord;

export interface BatteryCompositeScore {
  sum: number;
  score: number;
  ci: [number, number];
  pct: number;
  band: string;
}

export interface BatteryNormInfo {
  m: number;
  sd: number;
  local: boolean;
  n: number;
}

export interface ScoredBatteryProfile {
  ss: Record<BatterySubtestKey, number>;
  idx: Record<BatteryIndexKey, BatteryCompositeScore>;
  FSIQ: BatteryCompositeScore;
  GAI: BatteryCompositeScore;
  CPI: BatteryCompositeScore;
  sw: Record<BatteryIndexKey, '' | 'S' | 'W'>;
  spread: number;
  meanIdx: number;
  local: boolean;
  normN: number;
}
