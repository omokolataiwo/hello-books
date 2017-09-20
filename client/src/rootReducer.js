import { combineReducers } from 'redux';
import flashMessages from './reducers/messageReducer';
import users from './reducers/authReducer';
import books from './reducers/bookReducer';

export default combineReducers({
  flashMessages,
  users,
  books,
});