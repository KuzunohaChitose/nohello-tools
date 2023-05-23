import { GetOptional, Required } from "../dependencies/builtin-types";
import { $Fn, $Op } from "../fp-ts";

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
 * @since 1.0.1
 */
const isPresent = <T>(e: T | undefined | null): e is T => $Fn.pipe(e, $Op.fromNullable, $Op.isSome);

/**
 * @since 1.0.1
 */
const loopNext: (elements: any[]) => (update: (i: number) => number) => (index: number) => number =
    (elements) => (update) => (index) => {
        return $Fn.pipe(
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
 * @since 1.0.1
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
const keyMatch: <R>(
    match: { [index: string | number]: () => R } & { default: () => R },
) => (key: string | number) => R = (match) =>
    $Fn.flow(
        (str: string | number) => match[str],
        $Op.fromNullable,
        $Op.getOrElse($Fn.constant(match.default)),
        call(),
    );

export { call, withDefaults, loopNext, isPresent, trace, keyMatch };
