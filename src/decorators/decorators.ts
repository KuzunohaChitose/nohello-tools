type Constructor<Args extends any[] = any[], Return = any> = new (...args: Args) => Return;

type MethodPropKeys<T> = keyof {
    [P in keyof T as T[P] extends (...args: any[]) => any ? P : never]: unknown;
};

const onMethod = <
    C extends Constructor,
    K extends MethodPropKeys<InstanceType<C>>,
    F extends (...args: any[]) => any = 0 extends 1 & InstanceType<C>[K]
        ? (...args: unknown[]) => unknown
        : InstanceType<C>[K] extends (...args: any[]) => any
            ? InstanceType<C>[K]
            : (...args: unknown[]) => unknown
>(
    dec: (
        con: C,
        key: K
    ) => void | ((args: Parameters<F>, fun: F, instance: InstanceType<C>) => ReturnType<F>)
) =>
    ((
        target: { constructor: C },
        propertyKey: K,
        descriptor: TypedPropertyDescriptor<F>
    ): TypedPropertyDescriptor<(...args: Parameters<F>) => ReturnType<F>> | void => {
        const value = dec(target.constructor, propertyKey);
        if (value !== undefined) {
            return {
                value: function (this: InstanceType<C>, ...args: Parameters<F>) {
                    return value(args, descriptor.value!.bind(this) as F, this);
                },
            };
        }
    }) as MethodDecorator;

const onClass = <C extends Constructor>(
    dec: (con: C) => (new (...args: any[]) => InstanceType<C>) | void
) => ((target: C) => dec(target)) as ClassDecorator;

const onParam = <
    C extends Constructor,
    K extends MethodPropKeys<InstanceType<C>>,
    I extends number,
    P = InstanceType<C>[K] extends (...args: infer P) => any ? P[I] : unknown
>(
    dec: (con: C, key: K, index: I) => void
) =>
    ((target: { constructor: C }, propertyKey: K, parameterIndex: I) =>
        void dec(target.constructor, propertyKey, parameterIndex)) as ParameterDecorator;

const onProp = <C extends Constructor, K extends keyof InstanceType<C>>(
    dec: (con: C, key: K) => void
) =>
    ((target: { constructor: C }, propertyKey: K) =>
        void dec(target.constructor, propertyKey)) as PropertyDecorator;

export { onMethod, onClass, onParam, onProp };
