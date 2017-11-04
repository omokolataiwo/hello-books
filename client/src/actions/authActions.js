import axios from 'axios';
import jwt from 'jsonwebtoken';
import { SET_CURRENT_USER, UNSET_CURRENT_USER } from '../actions/types';
import setAuthorizationHeader from '../utils/setAuthorizationToken';
import store from '../../src/index';

/**
 * Set Current User
 * @description Set the current user
 * @param {object} user - user to set
 * @returns {object} action
 */
const setCurrentUser = user =>
  ({ type: SET_CURRENT_USER, user, });

/**
 * Unset Current User
 * @description Unset the current user
 * @param {object} user - user to unset
 * @returns {object} action
 */
const unsetCurrentUser = user =>
  ({ type: UNSET_CURRENT_USER, user, });

/**
 * Log in User
 * @description Sign in user to the library
 * @param {object} userData - user details
 * @returns {object} action
 */
const login = userData =>
  axios.post('/api/v1/users/signin', userData)
    .then((res) => {
      let user;
      const token = res.data.token;
      jwt.verify(token, 'hello-books', (err, decoded) => {
        user = decoded.data;
      });
      localStorage.setItem('jwtToken', token);
      store.dispatch(setCurrentUser(user));
      setAuthorizationHeader(token);
      return {
        isAuthenticated: true,
        message: res.data.message,
      };
    })
    .catch(err =>
      ({
        isAuthenticated: false,
        message: err.response.data.message,
      }),
    );

/**
 * Register and Logs in User with Google
 * @description Gets user details from google,
 * then signs in the user with the detail gotten
 * @param {object} userData - user details
 * @returns {object} action
 */
const googleAuth = (userData) => {
  const user = {
    token: userData.tokenObj.access_token,
    username: userData.w3.ig.split(' ')[0],
    email: userData.w3.U3,
    role: 'normal',
    password: userData.tokenObj.id_token,
    passwordConfirmation: userData.tokenObj.id_token,
  };
  return axios.post('/api/v1/auth/google', user)
    .then((res) => {
      Materialize.toast(res.data.message, 4000, 'green');
      const token = res.data.token;
      localStorage.setItem('jwtToken', token);
      store.dispatch(setCurrentUser(user));
      setAuthorizationHeader(token);
      return {
        success: res.data.success,
        message: res.data.message,
      };
    })
    .catch((err) => {
      Materialize.toast(err.response.data.message, 4000, 'red');
      return {
        success: err.response.data.success,
        message: err.response.data.message,
      };
    });
};

/**
 * Logout User
 * @description Signs out user from the library
 * @param {void} none - takes no argument
 * @returns {object} action
 */
const logout = () => {
  const user = {};
  store.dispatch(unsetCurrentUser(user));
  localStorage.removeItem('jwtToken');
  localStorage.removeItem('userDetails');
};

/**
 * Registers User
 * @description Gets user details by registering them
 * @param {object} userData - user details
 * @returns {object} action
 */
const userSignUpRequest = userData =>
  () => axios.post('/api/v1/users/signup', userData);

/**
 * Check User existence
 * @description Checks if a users exists in the library
 * @param {object} userData - user details
 * @returns {object} action
 */
const isUserExists = userData =>
  () => axios.post('/api/v1/users', userData);


export {
  setCurrentUser,
  userSignUpRequest,
  login,
  isUserExists,
  logout,
  googleAuth,
};
