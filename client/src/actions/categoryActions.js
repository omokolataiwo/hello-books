import axios from 'axios';
import * as actionTypes from '../actions/types';

/**
 * Set Categories
 *
 * @description Set the categories in the store
 *
 * @param {object} categories - Payload of categories to dispatch to store
 *
 * @returns {object} action
 */
const setCategories = categories =>
  ({ type: actionTypes.SET_CATEGORIES, categories });

/**
 * Add Category
 *
 * @description Adds a new category to the store
 *
 * @param {object} category - Payload of single category to add to store
 *
 * @returns {object} action
 */
const addCategory = category =>
  ({ type: actionTypes.ADD_CATEGORY, category });

/**
 * Get Categories
 *
 * @description Makes request to the server to get categories
 *
 * @param {void} null - Has no parameter
 *
 * @returns {object} action
 */
const fetchCategories = () =>
  dispatch =>
    axios.get('/api/v1/categories')
      .then((res) => {
        dispatch(setCategories(res.data.categories));
        return res.data;
      })
      .catch((err) => {
        dispatch(setCategories([]));
        return err.response.data.message;
      });

/**
 * Create/Add Category
 *
 * @description Sends category to be saved to the server
 *
 * @param {object} categoryDetails - Details of the category to be added to the
 * library
 *
 * @returns {object} action
 */
const saveCategory = categoryDetails =>
  dispatch =>
    axios.post('/api/v1/category', categoryDetails)
      .then((res) => {
        const { category, message } = res.data;
        category.cat = [];
        dispatch(addCategory(category));
        Materialize.toast(message, 4000, 'green');
        return { res: res.data, isDone: true };
      })
      .catch((err) => {
        Materialize.toast(err.response.data.message, 4000, 'red');
        return {
          isDone: false
        };
      });

export {
  fetchCategories,
  setCategories,
  saveCategory,
};
