class Store {
  static #data = new Map();

  static all() {
    return Array.from(this.#data);
  }

  static get(key) {
    return this.#data.get(key);
  }

  static set(key, value) {
    this.#data.set(key, value);
    return value;
  }

  static has(key) {
    return this.#data.has(key);
  }

  static delete(key) {
    return this.#data.delete(key);
  }

  static clear() {
    this.#data.clear();
  }
}

module.exports = Store;
