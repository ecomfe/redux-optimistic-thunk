/**
 * redux-optimistic-thunk
 *
 * @file index.js
 * @author otakustay
 */

import {createOptimisticManager} from 'redux-optimistic-manager';

const toString = Object.prototype.toString;

const isOptimisticAction = action => {
    const isArray = toString.call(action) === '[object Array]';

    return isArray && action.length === 2 && typeof action[0] === 'function' && typeof action[1] === 'function';
};

export const optimisticThunk = extraArgument => store => {
    const getState = store.getState;
    const {postAction, rollback} = createOptimisticManager(store);

    return next => action => {
        const transactionId = {};

        if (!isOptimisticAction(action)) {
            return next(postAction(action));
        }

        let isActualThunkReturned = false;
        let isOptimisticThunkReturned = false;
        let isOptimisticStateRollbacked = false;

        const actualDispatch = action => {
            // Rollback optimistic state on first async dispatch
            if (isActualThunkReturned && !isOptimisticStateRollbacked) {
                isOptimisticStateRollbacked = true;
                rollback(transactionId, next);
            }

            // Allow call `dispatch` without argument to rollback optimistic actions
            return action ? next(postAction(action)) : null;
        };

        const optimisticDispatch = action => {
            if (isOptimisticThunkReturned) {
                throw new Error('Optimistic thunk must be a sync function');
            }

            return next(postAction(action, transactionId));
        };

        const [actualThunk, optimisticThunk] = action;
        // First call actual thunk to ensure all sync actions are flushed
        const returnValue = actualThunk(actualDispatch, getState, extraArgument);
        isActualThunkReturned = true;
        // Then call optimistic thunk to create optimistic state
        optimisticThunk(optimisticDispatch, getState, extraArgument);
        isOptimisticThunkReturned = true;
        // The return value of actual thunk should be the return value of this mdidleware
        return returnValue;
    };
};

export {createOptimisticReducer} from 'redux-optimistic-manager';
