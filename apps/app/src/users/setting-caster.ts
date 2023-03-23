import { PlainSettingValue, SettingType, SettingValue } from './types';

export const SettingCaster = {
    to(type: SettingType, value: PlainSettingValue): SettingValue {
        if (value === null) {
            return value;
        } else if (type === 'number') {
            return Number(value);
        } else if (type === 'boolean') {
            const number = Number(value);

            return isNaN(number) ? false : Boolean(number);
        } else if (type === 'object') {
            return JSON.parse(value);
        } else {
            throw new Error(`Unsupported type [${type}]`);
        }
    },

    from(type: SettingType, value: SettingValue): PlainSettingValue {
        if (type === 'object') {
            return JSON.stringify(value);
        } else if (type === 'boolean') {
            const number = Number(value);

            return isNaN(number) ? '0' : String(Number(Boolean(number)));
        } else {
            return String(value);
        }
    },
};