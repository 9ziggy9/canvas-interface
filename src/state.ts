export namespace State {
  export type StateMap<T> = (state: T) => T;

  export interface StateAggregator<T> {
    attach: (m: StateMap<T>) => StateAggregator<T>;
    run: () => void;
  };

  export function unit<T>
  (initialState: T, fn: (s: T) => void) : StateAggregator<T>
  {
    let state: T = initialState;
    let stateMaps: StateMap<T>[] = [];
    return {
      attach(m: StateMap<T>) {
        stateMaps.push(m);
        return this;
      },
      run: () => {
        state = stateMaps.reduce((cState, m) => m(cState), state);
        fn(state);
      },
    }
  };
}
