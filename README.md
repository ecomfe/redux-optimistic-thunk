# redux-optimistic-thunk

redux-optimistic-thunk is a redux [redux-thunk](https://github.com/gaearon/redux-thunk) like middleware with optimistic UI supported.

## Why this middleware

There are plenty of middlewares for optimistic UI in redux ecosystem, such as [redux-optimistic](https://github.com/ForbesLindesay/redux-optimist) and [redux-optimistic-ui](https://github.com/mattkrick/redux-optimistic-ui), but both of them comes with several shortcomes:

- They try to mix some properties in your plain action objects, this makes a high invasive design of your app, you should be aware of optimistic transactions everywhere and it's hard to conditionally decide to be optimistic or not.
- They make developers manage transaction id themselvs, if a complex business logic spreads over more than one functions, it is not a good experience to keep the transaction id in sync.
- They take a commit-or-rollback term as its general design, however optimistic UI is not as simple as a transaction, for example, one may mark a newly created item `pending` when it's in an optimistic state to prevent user delete it. In fact both optimistic action and non-optimistic (actual) action are simple logics, they can be identical or different from each other.

In these cases, we decide to create a simpler and business-centric middleware to support optimistic UI development.

## How this middleware works

redux-optimistic-thunk is generally combined with 2 parts:

1. A middleware that handles optimistic action.
2. A higher order function to create reducer for optimistic UI.

The middleware comsumes a special type of action (like redux-thunks consumes actions of type function), a optimistic action must be an array includes exactly 2 functions (thunks):

1. The first function is exactly the same as what you will pass to redux-thunk, we call it a **actual thunk**.
2. The second function is also a thunk accepting `(dispatch, getState, [extraArgument])`as arguments, but it's used for dispatching actions to produce optimistic states, we call it **optimistic thunk**.

As you see, all two functions are simple thunks so you can write whatever code for the well known redux-thunk middleware, redux-optimistic-thunk handles actual and optimistic thunks implicitly, creates state save point, applies optimistic actions, rollback them when actual thunk dispatches actual actions, it takes no effect on your action objects, and it is easy to remove optimistic UI (just delete the second item of array) or to conditionally choose whether to be optimistic (reuse the first item of array).

## How to use

### Create your store

Use of redux-optimistic-thunk is quite simple, you should apply the provided middleware and reducers:

```javascript
import {createStore, applyMiddleware} from 'redux';
import optimisticThunk, {createOptimisticReducer} from 'redux-optimistic-thunk';

let reducer = (state, action) => (action.type === 'PUSH' ? state.concat(action.value) : state);
let store = createStore(
    createOptimisticReducer(reducer), // Wrap your reducer in createOptimisticReducer
    [],
    applyMiddleware(optimisticThunk()) // Apply middleware
);
```

Note that different from redux-thunk, the export of redux-optimistic-thunk is a function which return a middleware, so instead of `applyMiddleware(optimisticThunk)`, you should have a extra invocation `applyMiddleware(optimisticThunk())`, you can provide an `extraArgument` on invocation.

The default export comes with redux-thunk bundled so you are not required to apply redux-thunk anymore, if you want some other middleware between redux-optimistic-thunk and redux-thunk, use `standalone` named export instead:


```javascript
import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import logger from 'redux-logger';
import {standalone as optimisticThunk, createOptimisticReducer} from 'redux-optimistic-thunk';

let reducer = (state, action) => (action.type === 'PUSH' ? state.concat(action.value) : state);
let store = createStore(
    createOptimisticReducer(reducer),
    [],
    applyMiddleware(thunk, logger, optimisticThunk()) // Make sure optimisticThunk applies before thunk
);
```

In order for redux-optimistic-thunk to work, it must be applied **before** redux-thunk, so the order of middlewares is important.

After middleware is applied, just wrap your reducer into the `createOptimisticReducer` function redux-optimistic-thunk provides, wrapped reducer adds optimistic state rollback ability to your store, it is a must.

### Write your thunk

Suppose oure requirement is adding a newly submitted todo to list immediately (optimistic) before it is saved in server, however the optimistic todo cannot be deleted before it completes persistence:

```javascript
// action/todo.js

import {addLog} from './log';
import {warn} from './modal';
import {saveTodo} from '../api';

let newTodo = todo => ({type: 'NEW_TODO', todo: todo});

// A optimistic action consists of 2 thunks
let createTodo = todo => [
    // The first thunk (actual thunk) contains your actual business logic
    async dispatch => {
        // Any sync dispatches will apply first
        dispatch(addLog(`Submitted ${todo.title} task`));

        try {
            // Async logic goes here
            let createdTodo = await saveTodo(todo);

            // The first async dispatch rollbacks actions produced by optimistic thunk,
            // it will rollback your state to the point **after** "Submitted xxx task" log
            dispatch(addLog(`Created ${createdTodo.title} task`));
            dispatch(newTodo(createdTodo)); // No pending mark so the actually persisted todo can be deleted
        }
        catch (ex) {
            dispatch(warn(`Failed to create ${todo.title} task`));
        }
    },

    // The second thunk (optimistic thunk) dispatches actions to produce optimistic states
    dispatch => {
        // Optimistic thunk must be sync, any async dispatch throws error
        dispatch(addLog(`Created ${todo.title} task`));
        dispatch(newTodo({...todo, pending: true})); // Add a pending mark, disable the delete button if pending
    }
];
```

It's simple, you just write 2 business logics, no extra properties to your plain action object, no transaction id and commit/revert signals.

## Run example

From running CLI example you could have an overview on how redux-optimistic-thunk manages your state:

```shell
npm install
npm run start-cli
```

See [test/cli/main.js](test/cli/main.js) for detail code.
