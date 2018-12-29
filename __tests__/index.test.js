import * as Specials from '../index';

const type = 'type';
const subtype = 'subtype';
const text = 'text';
const special = (state) => state;
const func = (param) => param;

function internal(rootNode, key, other = undefined) {
    const allKeys = Array.isArray(key) ? key : [key];
    const keys = allKeys.filter(i => i !== undefined && i !== null);
    if (other) {
        keys.push(other);
    }
    return keys.reduce((prv, cur) => {
        if (prv && prv[cur]) {
            return prv[cur];
        } else {
            return undefined;
        }
    }, rootNode);
}

test('Register General', () => {
    const rootNode = {};
    const testFunc = (keys, value) => {
        Specials.register(rootNode, keys, undefined, value);
        expect(internal(rootNode, keys, Specials.DEFAULT_HANDLE)).toBe(value);
    };
    testFunc(type, text);
    testFunc([type], text);
    testFunc([type, subtype], text);
    testFunc(type, func);
    testFunc([type], func);
    testFunc([type, subtype], func);
});

test('Register Special', () => {
    const rootNode = {};
    const testFunc = (keys, value, index) => {
        const identifier = Specials.register(rootNode, keys, special, value);
        expect(internal(rootNode, keys, Specials.SPECIAL_PART)[index])
            .toEqual({
                [Specials.kId]: identifier,
                [Specials.kSpecial]: special,
                [Specials.kHandle]: value,
                [Specials.kPriority]: Specials.PRIORITY.DEFAULT
            });
    };
    testFunc(type, text, 0);
    testFunc([type], text, 1);
    testFunc([type, subtype], text, 0);
    testFunc(type, func, 2);
    testFunc([type], func, 3);
    testFunc([type, subtype], func, 1);
});

test('Get General', () => {
    const rootNode = {};
    const notExistKeys = [type, subtype, type];
    const testFunc = (keys, value) => {
        Specials.register(rootNode, keys, undefined, value);
        expect(Specials.get(rootNode, keys, undefined, undefined)).toBe(value);
        expect(Specials.get(rootNode, notExistKeys, undefined, undefined)).toBe(value);
        Specials.unregister(rootNode, keys, undefined);
    };
    testFunc(type, text);
    testFunc([type], text);
    testFunc([type, subtype], text);
    testFunc(type, func);
    testFunc([type], func);
    testFunc([type, subtype], func);
});

test('Get Special', () => {
    const rootNode = {};
    const testFunc = (keys, value) => {
        const isFunc = typeof value === 'function';
        const index = 1;
        const identifier = Specials.register(rootNode, keys, state => state === index, value);
        expect(Specials.get(rootNode, keys, index, undefined)).toBe(value);
        expect(Specials.get(rootNode, keys, index, index * 10)).toBe(isFunc ? value(index * 10) : value);
        expect(Specials.get(rootNode, keys, index * 100, index * 10)).toBe(undefined);
        Specials.unregister(rootNode, keys, identifier);
    };
    testFunc(type, text);
    testFunc([type], text);
    testFunc([type, subtype], text);
    testFunc(type, func);
    testFunc([type], func);
    testFunc([type, subtype], func);
});

test('Get Special With Priority', () => {
    const rootNode = {};
    const highText = text + text;
    const highFunc = (param) => param * 100;
    const testFunc = (keys, value, highValue) => {
        const isFunc = typeof value === 'function' && typeof highValue === 'function';
        const index = 1;
        const lowId = Specials.register(rootNode, keys, state => state === index, value);
        const highId = Specials.register(rootNode, keys, state => state === index, highValue, Specials.PRIORITY.HIGH);
        expect(Specials.get(rootNode, keys, index, undefined)).toBe(highValue);
        expect(Specials.get(rootNode, keys, index, index * 10)).toBe(isFunc ? highValue(index * 10) : highValue);
        expect(Specials.get(rootNode, keys, index * 100, index * 10)).toBe(undefined);
        Specials.unregister(rootNode, keys, lowId);
        Specials.unregister(rootNode, keys, highId);
    };
    testFunc(type, text, highText);
    testFunc([type], text, highText);
    testFunc([type, subtype], text, highText);
    testFunc(type, func, highFunc);
    testFunc([type], func, highFunc);
    testFunc([type, subtype], func, highFunc);
});

test('Unregister General', () => {
    const rootNode = {};
    const unregisterFunc = (keys, answer = true) => {
        const result = Specials.unregister(rootNode, keys, undefined);
        expect(result).toBe(answer);
    };
    const testFunc = (keys, value) => {
        Specials.register(rootNode, keys, undefined, value);
        unregisterFunc(keys);
        expect(internal(rootNode, keys, Specials.DEFAULT_HANDLE)).toBe(undefined);
    };
    testFunc(type, text);
    testFunc([type], text);
    testFunc([type, subtype], text);
    testFunc(type, func);
    testFunc([type], func);
    testFunc([type, subtype], func);
    unregisterFunc([type], false);
    unregisterFunc([type, subtype], false);
    unregisterFunc([type, subtype, type], false);
});

test('Unregister Special', () => {
    const rootNode = {};
    const unregisterFunc = (keys, identifier, answer = true) => {
        const result = Specials.unregister(rootNode, keys, identifier);
        expect(result).toBe(answer);
    };
    const testFunc = (keys, value) => {
        const identifier = Specials.register(rootNode, keys, special, value);
        unregisterFunc(keys, identifier);
        expect(internal(rootNode, keys, Specials.SPECIAL_PART).length).toBe(0);
    };
    const identifier = '1234567890';
    testFunc(type ,text);
    testFunc([type], text);
    testFunc([type, subtype], text);
    testFunc(type, func);
    testFunc([type], func);
    testFunc([type, subtype], func);
    unregisterFunc([type], identifier, false);
    unregisterFunc([type, subtype], identifier, false);
    unregisterFunc([subtype], identifier, false);
    unregisterFunc([subtype, type], identifier, false);
});