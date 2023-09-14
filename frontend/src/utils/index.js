export function truncate(str, n) {
  return str.length > n
    ? str.substr(0, n) + '...' + str.substr(str.length - 4, str.length - 1)
    : str;
}
