export function getAccountCallbackURL(webOrigin?: string): string {
  return webOrigin === undefined
    ? '/account'
    : new URL('/account', webOrigin).href;
}
