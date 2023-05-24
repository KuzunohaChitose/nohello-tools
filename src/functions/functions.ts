import { GetOptional, Required, Parameters, ReturnType } from "../dependencies/builtin-types";
import { $Fn, $Op } from "../dependencies/fp-ts";
import { Pipe, Tuples, Numbers, Call } from "hotscript";

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



/**
 * 获取柯里化函数的参数类型
 *
 * @since 1.0.8
 */
type CurriedParameters<
    F extends (...args: any[]) => any,
    P extends any[] = [],
> = ReturnType<F> extends (...args: any[]) => any
    ? CurriedParameters<ReturnType<F>, [...P, Parameters<F>]>
    : [...P, Parameters<F>];

/**
 * 从元组构建一个柯里化函数类型
 *
 * @since 1.0.8
 */
type CurriedFnFromTuple<
    Input extends unknown[][],
    Return = unknown,
    Index extends number = Pipe<Pipe<Input, [Tuples.Length]>, [Numbers.Sub<1>]> extends number
        ? Pipe<Pipe<Input, [Tuples.Length]>, [Numbers.Sub<1>]>
        : -1,
    Fn = Return,
> = Index extends -1
    ? Fn
    : CurriedFnFromTuple<
        Input,
        Return,
        Pipe<Index, [Numbers.Sub<1>]>,
        (...args: Input[Index]) => Fn
    >;

/**
 * 获取一个柯里化函数的返回值
 *
 * @since 1.0.8
 */
type CurriedReturnType<
    F extends (...args: any[]) => any,
    L = Pipe<CurriedParameters<F>, [Tuples.Length]>,
> = Pipe<L, [Numbers.Equal<0>]> extends true
    ? F
    : ReturnType<F> extends (...args: any[]) => any
        ? CurriedReturnType<ReturnType<F>, Pipe<L, [Numbers.Sub<1>]>>
        : ReturnType<F>;

/**
 * 反柯里化
 *
 * @since 1.0.8
 */
const uncurry: <
    F extends (...args: any[]) => any,
    L extends Pipe<
        Call<Tuples.Range<0>, Pipe<CurriedParameters<F>, [Tuples.Length]>>,
        [Tuples.ToUnion]
    > = Pipe<CurriedParameters<F>, [Tuples.Length]>,
    P extends Pipe<CurriedParameters<F>, [Tuples.Take<L>]> = Pipe<
        CurriedParameters<F>,
        [Tuples.Take<L>]
    >,
>(
    ...args: P
) => (fn: F) => CurriedReturnType<F, L> =
    (...args: any[]) =>
        (fn) =>
            [fn, ...args].reduce((a, b) => a(...b)) as any;

export { call, withDefaults, loopNext, isPresent, trace, keyMatch, uncurry };
export type { CurriedReturnType, CurriedParameters, CurriedFnFromTuple };
