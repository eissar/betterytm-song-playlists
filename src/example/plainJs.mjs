/**
 * @type {number|undefined}
 * This variable would always be `any`, but with this JSDoc comment, it's explicitly typed.
 */
let globalVar;

/**
 * This is a plain JS function, but it can have types associated by using JSDoc comments like this one.  
 * Visit this page to learn more: https://jsdoc.app/  
 * ⚠️ There will be no compile-time or runtime type checking, but IDEs like VSCode can use this information to provide better intellisense.
 * @param {number} arg
 */
export function jsdocPow(arg) {
  console.log("Hello from JS!");
  return Math.pow(arg, globalVar ?? 1);
}

// The argument of this function will have its type set to `any` because this isn't a JSDoc comment.
// This makes it more likely to introduce bugs, so it's always recommended to at least add JSDoc comments with @param annotations.
export function plainJsSetFactor(arg) {
  console.log("Hello from JS!", arg);
  // Because this variable is typed, the IDE will hint that it should be a number.
  return globalVar = arg;
}
