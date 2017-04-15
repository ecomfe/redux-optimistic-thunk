/**
 * redux-optimistic-thunk
 *
 * @file react example
 * @author otakustay
 */

export default (() => {
    let counter = 0;

    return () => ++counter;
})();
