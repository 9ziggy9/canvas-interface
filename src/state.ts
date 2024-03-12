// TODO:
// An implementation of "interactions" of ensembles must be done.
// Even if done over permutations of substates, this could allow
// for binding of operations in a uniform manner.
// Consider removing tuple as possible Stateful var.
// type State should probably be renamed to Substate.

export namespace State {
  type StatefulVar = number | string | [number, number];

  export type State = {
    [attribute: string]: StatefulVar;
  };

  export type Ensemble<S extends State> = {
    [substateName: string]: S;
  };
  
  export type StateMap<S extends State | Ensemble<State>> = (state: S) => S;

  export interface StateAggregator<S extends State | Ensemble<State>> {
    attach: (m: StateMap<S>) => StateAggregator<S>;
    run: () => void;
  };

  export function unit<S extends State | Ensemble<State>>
  (initialState: S, fn: (s: S) => void) : StateAggregator<S> {
    let state: S = initialState;
    let stateMaps: StateMap<S>[] = [];
    return {
      attach(m: StateMap<S>) {
        stateMaps.push(m);
        return this;
      },
      run: () => {
        state = stateMaps.reduce((cState, m) => m(cState), state);
        fn(state);
      },
    };
  };
}
