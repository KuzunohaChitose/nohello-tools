import { GetOptional, Required } from "../dependencies/builtin-types";
import { constant, flow, pipe } from "fp-ts/function";
import * as Op from "fp-ts/Option";

/**
 * @since 1.0.1
 */
const key: <T, K extends keyof T>(key: K) => (t: T) => T[K] = (key: any) => (obj: any) => obj[key];
/**
 * @since 1.0.1
 */
const keys: <Obj extends object, Keys extends (keyof Obj)[]>(
    ...args: Keys
) => (obj: Obj) => { [P in Keys[number]]: Obj[P] } =
    (...keys: any[]) =>
    (obj: any) => {
        const res: any = {};
        keys.forEach((key) => (res[key] = obj[key]));
        return res;
    };
/**
 * @since 1.0.1
 */
const call: <P extends any[]>(...args: P) => <R>(fn: (...args: P) => R) => R =
    (...args: any) =>
    (fn: any) =>
        fn(...args);

/**
 * 用于调试
 *
 * @since 1.0.3
 */
const trace: <T>(fn?: (t: T) => void) => (t: T) => T =
    (fn = console.log) =>
    (t) => {
        fn(t);
        return t;
    };

/**
 * 判断值是否存在，若不为null或undefined则返回true<br>
 * 此函数可用于类型保护
 *
 * @template T
 * @param e {T}
 * @returns {boolean}
 */
const isPresent = <T>(e: T | undefined | null): e is T => pipe(e, Op.fromNullable, Op.isSome);

/**
 * 将X类型映射到Y类型，返回一个函数，接收X并将其转换为Y返回
 *
 * @param mapper 两个类型的映射关系
 * @param handler 在做类型转换时所作的处理
 * @returns (input: X) => Y
 */
const typeMapper = <X extends { [i: string]: unknown }, Y extends { [i: string]: unknown }>(
    mapper: { [P in keyof X]: keyof Y },
    handler: {
        [I in keyof X as I extends string ? `_${I}` : never]?: (i: X[I]) => any;
    } = {},
) => {
    return (input: X): Y => {
        const res: any = {};
        Object.keys(mapper).forEach((k) => {
            const f = handler[`_${k}`] ?? ((e) => e);
            res[mapper[k]] = (<any>f)(input[k]);
        });
        return res;
    };
};

/**
 * @since 1.0.1
 */
const loopNext: (elements: any[]) => (update: (i: number) => number) => (index: number) => number =
    (elements) => (update) => (index) => {
        return pipe(
            index,
            update,
            (i) => (i >= elements.length ? 0 : i),
            (i) => (i < 0 ? elements.length - 1 : i),
        );
    };

/**
 * 给对象附加默认值，当对对象具有默认值的键获取值时如不存在则返回默认值
 *
 * @param target 目标对象
 */
const withDefaults: <T extends object>(
    target: T,
) => (defaults: Required<GetOptional<T>>) => Required<T> = (target) => (defaults) =>
    new Proxy(target, {
        get(target: any, p: any) {
            return target[p] ?? (defaults as any)[p];
        },
    });

/**
 * @since 1.0.4
 */
const boolMatch: <R>(yes: () => R, no: () => R) => (flag: boolean) => R = (yes, no) => (flag) =>
    flag ? yes() : no();

/**
 * @since 1.0.4
 */
const keyMatch: <R>(
    match: { [index: string | number]: () => R } & { default: () => R },
) => (key: string | number) => R = (match) =>
    flow(
        (str: string | number) => match[str],
        Op.fromNullable,
        Op.getOrElse(constant(match.default)),
        call(),
    );

/**
 * @since 1.0.5
 */
const assignTo: <T extends object, K extends keyof T>(target: T, key: K) => (value: T[K]) => T[K] =
    (target, key) => (value) =>
        (target[key] = value);

export {
    keys,
    key,
    call,
    withDefaults,
    loopNext,
    typeMapper,
    isPresent,
    trace,
    boolMatch,
    keyMatch,
    assignTo
};
