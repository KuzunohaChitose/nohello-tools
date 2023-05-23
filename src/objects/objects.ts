/**
 * 设置键
 *
 * @since 1.0.6
 */
const setKey =
    <T extends object, K extends keyof T, N extends string>(oldKey: K, newKey: N) =>
    (
        obj: T,
    ): {
        [P in Exclude<keyof T, K>]: T[P];
    } & { [P2 in N]: T[K] } => {
        const res = {
            ...obj,
            [newKey]: obj[oldKey],
        };
        delete res[oldKey];
        return res as any;
    };

/**
 * 设置值
 *
 * @since 1.0.6
 */
const setVal =
    <T extends object, K extends keyof T, E>(key: K, fn: (e: T[K]) => E) =>
    (
        obj: T,
    ): {
        [P in Exclude<keyof T, K>]: T[P];
    } & { [P2 in K]: E } => {
        return {
            ...obj,
            [key]: fn(obj[key]),
        };
    };

/**
 * 将值分配给键
 *
 * @since 1.0.6
 */
const assignTo =
    <T extends object, K extends keyof T>(target: T, key: K) =>
    (value: T[K]): T[K] => {
        target[key] = value;
        return value;
    };

/**
 * 翻转版的{@link assignTo}
 *
 * @since 1.0.6
 */
const assignToRvs =
    <T extends object, K extends keyof T>(value: T[K], key: K) =>
    (target: T) => {
        target[key] = value;
        return target;
    };

/**
 * 从对象中拿出指定键的值
 *
 * @since 1.0.6
 */
const takeInc =
    <Obj extends object, Keys extends (keyof Obj)[]>(...keys: Keys) =>
    (obj: Obj): { [P in Keys[number]]: Obj[P] } => {
        const res: any = {};
        keys.forEach((key) => (res[key] = obj[key]));
        return res;
    };

/**
 * 从对象中拿出指定键以外的值
 *
 * @since 1.0.6
 */
const takeExc =
    <Obj extends object, Keys extends (keyof Obj)[]>(...keys: Keys) =>
    (obj: Obj): { [P in Exclude<keyof Obj, Keys[number]>]: Obj[P] } => {
        const res: any = {};
        (Object.keys(obj) as any[])
            .filter((k) => keys.indexOf(k) === -1)
            .forEach((key: any) => (res[key] = (obj as any)[key]));
        return res;
    };

export { setVal, setKey, assignTo, assignToRvs, takeExc, takeInc };