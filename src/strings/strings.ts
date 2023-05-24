/**
 * @since 1.0.8
 */
const typedToUppercase = <T extends string>(t: T) => t.toUpperCase() as Uppercase<T>;

/**
 * @since 1.0.8
 */
const typedToLowercase = <T extends string>(t: T) => t.toLowerCase() as Lowercase<T>;

/**
 * @since 1.0.8
 */
const typedToCapitalize = <T extends string>(t: T) =>
    t.slice(0, 1).toUpperCase().concat(t.slice(1)) as Capitalize<T>;

/**
 * @since 1.0.8
 */
const typedToUncapitalize = <T extends string>(t: T) =>
    t.slice(0, 1).toUpperCase().concat(t.slice(1)) as Uncapitalize<T>;

export { typedToCapitalize, typedToUncapitalize, typedToUppercase, typedToLowercase };
