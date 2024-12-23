/**
 * Binary search find in JavaScript.
 *
 * Original Version: https://stackoverflow.com/a/29018745/7149232
 *
 * The array may contain duplicate elements. If there are more than one equal elements in the array,
 * the returned value can be the index of any one of the equal elements.
 *
 * @param {any[]} arr - A sorted array
 * @param {function(number, any[]): number} compare_fn - A comparator function. The function takes two arguments: (a, b)
 * where `a` is and index in `arr` to search and `b` is the array `arr`. It returns:
 *   * a negative number  if the element to find for may be in the previous index;
 *   * 0 if the element is in the current index;
 *   * a positive number of if the element to find may be in the next index.
 *
 * @returns {number} index of of the element in a sorted array or (-n-1) where n is the insertion point for the new element.
 */
export function binarySearchFind(arr, compare_fn) {
  let start = 0;
  let end = arr.length - 1;
  while (start <= end) {
    const midPoint = (end + start) >> 1;
    const cmp = compare_fn(midPoint, arr);
    if (cmp > 0) {
      start = midPoint + 1;
    } else if (cmp < 0) {
      end = midPoint - 1;
    } else {
      return midPoint;
    }
  }
  return ~start;
}
