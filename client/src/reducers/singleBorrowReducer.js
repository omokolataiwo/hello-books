import { BORROWED_FETCHED } from './../actions/types';

// Declare the initial state for a single book
const initialState = {
  borrow: {}
};

/**
 * Singly Borrowed Book Reducer
 *
 * @description Return each action by its type
 *
 * @param {object} state -  The state passed to the singleBorrowReducer
 * @param {object} action - The action passed to the singleBorrowReducer
 *
 * @returns {object} // Borrowed book
 */
const singleBorrowReducer = (state = initialState, action = {}) => {
  switch (action.type) {
    case BORROWED_FETCHED: {
      return { ...state, borrow: action.borrow };
    }
    default:
      return state;
  }
};

export default singleBorrowReducer;
