/**
 * redux-optimistic-thunk
 *
 * @file index.js
 * @author otakustay
 */

let toString = Object.prototype.toString;

let isOptimisticAction = action => {
    let isArray = toString.call(action) === '[object Array]';

    return isArray && action.length === 2 && typeof action[0] === 'function' && typeof action[1] === 'function';
};

let uid = (() => {
    let counter = 0;

    return () => ++counter;
})();

let knownActionTypes = {
    rollback: '@@redux-optimistic-thunk/ROLLBACK',
    mark: '@@redux-optimistic-thunk/MARK'
};

let isKnownActionType = (() => {
    let values = Object.keys(knownActionTypes).reduce(
        (values, key) => ({...values, [knownActionTypes[key]]: true}),
        {}
    );

    return type => values.hasOwnProperty(type);
})();

let isPlainAction = action => toString.call(action) === '[object Object]' && !isKnownActionType(action.type);

export let optimisticThunk = extraArgument => ({dispatch, getState}) => {
    // The last save point to rollback to
    let savePoint = null;
    let dispatchedActions = [];

    let saveActionOnDemand = (value, optimistic, transactionId) => {
        if (savePoint && isPlainAction(value)) {
            dispatchedActions.push({value, optimistic, transactionId});
        }
    };

    let markStateOptimisticOnDemand = action => {
        if (isPlainAction(action) && !getState().optimistic) {
            dispatch({type: knownActionTypes.mark});
        }
    };

    return next => {
        // rollback state to save point and apply all valid actions later by a transaction id
        let rollback = transactionId => {
            if (!savePoint) {
                return;
            }

            // Force state to match save point
            dispatch({type: knownActionTypes.rollback, state: savePoint});

            let newSavePoint = null;
            let newDispatchedActions = [];

            // Because we will dispatch previously saved actions, make a copy here to prevent infinite loops
            for (let savedAction of dispatchedActions.slice()) {
                // Ignore all optimistic actions produced by the same transaction
                if (savedAction.transactionId === transactionId && savedAction.optimistic) {
                    continue;
                }

                // The next save point should be the first time an optimistic action is dispatched,
                // so any actions earlier than new save point should be safe to discard
                if (!newSavePoint && savedAction.optimistic) {
                    newSavePoint = getState();
                }

                if (newSavePoint) {
                    newDispatchedActions.push(savedAction);
                }

                // Apply remaining action to make state up to time,
                // here we just need to apply all middlewares **after** redux-optimistic-thunk,
                // so use `next` instead of global `dispatch`
                next(savedAction.value);

                // Still mark state to optimistic if an optimistic action occurs
                if (savedAction.optimistic && !getState().optimistic) {
                    dispatch({type: knownActionTypes.mark});
                }
            }

            savePoint = newSavePoint;
            dispatchedActions = newDispatchedActions;
        };

        return action => {
            saveActionOnDemand(action, false, null);

            if (!isOptimisticAction(action)) {
                return next(action);
            }

            let transactionId = uid();
            let isActualThunkReturned = false;
            let isOptimisticThunkReturned = false;
            let isOptimisticStateRollbacked = false;

            let actualDispatch = action => {
                // Any sync actions flush immediately, any actions after rollback are treated as simple actions
                if (!isActualThunkReturned || isOptimisticStateRollbacked) {
                    saveActionOnDemand(action, false, transactionId);
                    return action ? next(action) : null;
                }

                // Rollback optimistic state on first async dispatch
                isOptimisticStateRollbacked = true;

                rollback(transactionId);

                saveActionOnDemand(action, false, transactionId);
                return action ? next(action) : null;
            };

            let optimisticDispatch = action => {
                if (isOptimisticThunkReturned) {
                    throw new Error('Optimistic thunk must be a sync function');
                }

                saveActionOnDemand(action, true, transactionId);

                let returnValue = next(action);
                markStateOptimisticOnDemand(action);
                return returnValue;
            };

            let [actualThunk, optimisticThunk] = action;
            // First call actual thunk to ensure all sync actions are flushed
            let returnValue = actualThunk(actualDispatch, getState, extraArgument);
            isActualThunkReturned = true;
            // Then create a save point if required, later dispatch in actual thunk will rollback to save point
            if (!savePoint) {
                savePoint = getState();
            }
            // Then call optimistic thunk to create optimistic state
            optimisticThunk(optimisticDispatch, getState, extraArgument);
            isOptimisticThunkReturned = true;
            // The return value of actual thunk should be the return value of this mdidleware
            return returnValue;
        };
    };
};

export let createOptimisticReducer = nextReducer => (state, action) => {
    if (state.optimistic === undefined) {
        return {...state, optimistic: false};
    }

    switch (action.type) {
        case knownActionTypes.rollback:
            return action.state;
        case knownActionTypes.mark:
            return state.optimistic ? state : {...state, optimistic: true};
        default:
            return nextReducer(state, action);
    }
};
