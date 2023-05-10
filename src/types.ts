type Partial<T> = {
    [P in keyof T]?: T[P];
};

type Required<T> = {
    [P in keyof T]-?: T[P];
};

type Readonly<T> = {
    readonly [P in keyof T]: T[P];
};

type Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};

type Record<K extends keyof any, T> = {
    [P in K]: T;
};

type Exclude<T, U> = T extends U ? never : T;

type Extract<T, U> = T extends U ? T : never;

type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

type NonNullable<T> = T & {};

type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;

type ConstructorParameters<T extends abstract new (...args: any) => any> = T extends abstract new (
    ...args: infer P
) => any
    ? P
    : never;

type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;

type InstanceType<T extends abstract new (...args: any) => any> = T extends abstract new (
    ...args: any
) => infer R
    ? R
    : any;

type GetOptional<T, U extends Required<T> = Required<T>, K extends keyof T = keyof T> = Pick<
    T,
    K extends keyof T ? (T[K] extends U[K] ? never : K) : never
>;

type GetRequired<T> = {
    [P in keyof T as T[P] extends Required<T>[P] ? P : never]: T[P];
};

export {
    Partial,
    Exclude,
    Extract,
    InstanceType,
    Omit,
    Required,
    Record,
    ReturnType,
    NonNullable,
    Pick,
    Readonly,
    ConstructorParameters,
    Parameters,
    GetOptional,
    GetRequired,
};
