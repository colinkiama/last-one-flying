export class Injector {
  dependencyMap;

  constructor() {
    this.dependencyMap = new Map();
  }

  register(key, value) {
    this.dependencyMap.set(key, value);
  }

  get(key) {
    return this.dependencyMap.get(key);
  }
}
