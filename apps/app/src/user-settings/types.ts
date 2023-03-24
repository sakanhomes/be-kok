export type SettingType = 'string' | 'number' | 'boolean' | 'object';
export type SettingValue = string | number | boolean | object;
export type PlainSettingValue = string | null;
export type SettingConfig = {
    type: SettingType,
    default: SettingValue,
};
export type Settings = Record<string, SettingValue>;