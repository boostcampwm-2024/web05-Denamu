export function debounce<Args extends unknown[]>(
  func: (...args: Args) => void,
  delay: number,
) {
  let timer: ReturnType<typeof setTimeout>;
  const debounced = (...args: Args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
  debounced.cancel = () => clearTimeout(timer);
  return debounced;
}
