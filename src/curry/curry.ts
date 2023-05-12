import { Pipe, Tuples, Numbers, Call } from "hotscript";
import { Parameters, ReturnType } from "../dependencies/builtin-types";

/**
 * 获取柯里化函数的参数类型
 *
 * @since 1.0.1
 * @example
 * type CurryArgs = CurriedParameters<(a: number) => (b: number) => number>;
 * type CurryArgs = [[number], [number]];
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
 * @since 1.0.1
 * @example
 * type CurryFn = CurriedFnFromTuple<[[string], [number]], boolean>;
 * type CurryFn = (arg_0: string) => (arg_0: number) => boolean;
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
 * @since 1.0.1
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
 * @since 1.0.1
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

export { CurriedParameters, CurriedFnFromTuple, CurriedReturnType, uncurry };
