/**
 * @summary An attempt to minimize side-effect-related bugs;
 * an alternative to sessionStorage (but shouldn't survive page reloads),
 * as oppose to localStorage.
 */
export default class Store {
  #state = {}; // Note: can declare a private variable by prefixing with "#", as per ECMA spec, experimental, Stage 3
  #initialState = {};
  constructor(initialState = {}) {
    if (initialState === {}) {
      throw new Error("An empty intial state is pointless... Simply don't use this class for that.");
    }
    this.#state = { ...initialState };
    this.#initialState = { ...initialState };
  }
  addKeysPropertyToState = () => {
    this.#state.__keySet = new Set(Object.keys(this.#state));
  };
  get state() {
    if (this.#state.__keySet === undefined) { // lazily add keys to state before it's initially read.
      this.addKeysPropertyToState();
    }
    return this.#state;
  }
  setState = (o = {}) => {
    if (this.#state.__keySet === undefined) { // lazily add keys to state before it's initially read.
      this.addKeysPropertyToState();
    }
    if (typeof o === "function") {
      throw new Error("This isn't React! Just pass in an object.");
    }
    Object.entries(o).forEach(([key, value]) => {
      if (!this.#state.__keySet.has(key)) {
        throw new Error("It is (probably) a bug to create keys on state that aren't explicitly defined upon initialization! Please fix this issue.");
      }
      if (value === undefined) {
        return; // This happens when we only want to mutate some of the properties in this.#state (which is an often action).
      }
      if (typeof value !== typeof this.#state[key]) {
        throw new Error(`It is (probably) a bug to set a value for a key on state that is of a different type from its type at initialization! Please fix this issue. Comparing ${value} with ${this.#state[key]}`);
      }
      if (key === "__keySet") {
        throw new Error("It is (probably) a bug to overwrite the internal __keySet property. Please fix this issue.");
      }
      this.#state[key] = value;
    });
  }
  clearState = () => this.#state = { ...this.#initialState };
  overwriteState = (newState) => this.#state = { ...newState };
}