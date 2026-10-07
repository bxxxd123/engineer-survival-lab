export function flashClass(el, className, duration) {
  el.classList.add(className);
  setTimeout(function () {
    el.classList.remove(className);
  }, duration);
}
