export namespace State {
  export type StateMap<T> = (state: T) => T;
  export type InteractiveStateMap<T> = (states: T[]) => T[];

  export interface StateAggregator<T> {
    attach: (m: StateMap<T>) => StateAggregator<T>;
    run: () => void;
  }

  export interface InteractiveStateAggregator<T> extends StateAggregator<T[]> {
    attachInteraction: (m: InteractiveStateMap<T>) =>
      InteractiveStateAggregator<T>;
  }

  export function returnStateAggregator<T>
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
  }

  export function returnInteractiveStateAggregator<T>
  (initialStates: T[], fn: (s: T[]) => void) : InteractiveStateAggregator<T>
  {
    let states: T[] = initialStates;
    let stateMaps: StateMap<T[]>[] = [];
    return {
      ...returnStateAggregator(states, fn),
      attachInteraction(m: InteractiveStateMap<T>) {
        stateMaps.push(m);
        return this;
      },
      run: () => {
        states = stateMaps.reduce((cStates, m) => m(cStates), states);
        fn(states);
      },
    }
  }
}
