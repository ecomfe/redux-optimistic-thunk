/**
 * redux-optimistic-thunk
 *
 * @file index.js
 * @author otakustay
 */

import {createOptimisticManager} from 'redux-optimistic-manager';

let toString = Object.prototype.toString;

let isOptimisticAction = action => {
    let isArray = toString.call(action) === '[object Array]';

    return isArray && action.length === 2 && typeof action[0] === 'function' && typeof action[1] === 'function';
};

export let optimisticThunk = extraArgument => store => {
    let getState = store.getState;
    let transaction = createOptimisticManager(store);

    return next => action => {
        let {postAction, postOptimisticAction, postExternalAction, rollback} = transaction(next);

        if (!isOptimisticAction(action)) {
            postExternalAction(action);
            return next(action);
        }

        let isActualThunkReturned = false;
        let isOptimisticThunkReturned = false;
        let isOptimisticStateRollbacked = false;

        let actualDispatch = action => {
            // Rollback optimistic state on first async dispatch
            if (isActualThunkReturned && !isOptimisticStateRollbacked) {
                isOptimisticStateRollbacked = true;
                rollback();
            }

            postAction(action);
            return action ? next(action) : null;
        };

        let optimisticDispatch = action => {
            if (isOptimisticThunkReturned) {
                throw new Error('Optimistic thunk must be a sync function');
            }

            postOptimisticAction(action);
            return next(action);
        };

        let [actualThunk, optimisticThunk] = action;
        // First call actual thunk to ensure all sync actions are flushed
        let returnValue = actualThunk(actualDispatch, getState, extraArgument);
        isActualThunkReturned = true;
        // Then call optimistic thunk to create optimistic state
        optimisticThunk(optimisticDispatch, getState, extraArgument);
        isOptimisticThunkReturned = true;
        // The return value of actual thunk should be the return value of this mdidleware
        return returnValue;
    };
};

export {createOptimisticReducer} from 'redux-optimistic-manager';
