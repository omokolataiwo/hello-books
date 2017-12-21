import React, { Component } from 'react';
import { connect } from 'react-redux';
import swal from 'sweetalert';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Modal, Button } from 'react-materialize';
import BookForm from './BookForm';
import CategoryForm from './CategoryForm';
import CategoryList from './../category/CategoryList';
import BookList from './BookList';
import { fetchBooks, deleteBook, fetchBooksByCategory }
  from './../../../actions/bookActions';
import { fetchCategories } from './../../../actions/categoryActions';
import { fetchAllBorrowedBooks } from '../../../actions/borrowActions';
import Paginator from './../../../helpers/Paginator';

/**
 * @description represents admin dashboard of the library
 *
 * @class Admin
 *
 * @extends {Component}
 */
export class Admin extends Component {
  /**
   * Creates an instance of Admin.
   *
   * @param {object} props
   *
   * @memberof Admin
   *
   * @constructor
   */
  constructor(props) {
    super(props);
    this.state = {
      showCategoryTitle: false,
      categoryTitle: '',
      more: 10,
      loadMore: false,
      numberOfPages: 2,
      bookToEdit: {},
      wouldEdit: false
    };
    this.query = (this.props.history.location.search).split('=')[1];
    this.handleDelete = this.handleDelete.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.filterBooksByCategory = this.filterBooksByCategory.bind(this);
    this.handleMoreNotification = this.handleMoreNotification.bind(this);
  }

  /**
   * @description Invoked after component has mounted
   *
   * @param {void} null
   *
   * @returns {void} returns nothing
   *
   * @memberof Admin
   */
  componentDidMount() {
    this.props.fetchCategories();
    this.props.fetchAllBorrowedBooks(1, 1, true, 0);
  }

  /**
   * @description Handles editing of a specific book
   *
   * @param {object} book
   *
   * @returns {void} - none
   *
   * @memberof Admin
   */
  handleEdit(book) {
    this.setState({ bookToEdit: { ...book }, wouldEdit: true },
      () => { $('#update-book-modal').modal('open'); });
  }

  /**
   * @description Invoked after component has mounted
   *
   * @param {void} null
   *
   * @returns {void} returns nothing
   *
   * @memberof Admin
   */
  handleMoreNotification() {
    const { more } = this.state;
    this.setState({ more: more + 10 });
    this.props.fetchAllBorrowedBooks(1, 1, true, more)
      .then((res) => {
        const { numberOfPages } = res;
        this.setState({ numberOfPages });
      });
  }

  /**
   * @description deletes a book from the library
   *
   * @param {number} bookId
   *
   * @returns {function} action
   *
   * @memberof Admin
   */
  handleDelete(bookId) {
    swal({
      title: 'Are you sure?',
      text: 'Once deleted, you will not be able to recover this book!',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
    })
      .then((willDelete) => {
        const deleteAction =
          willDelete ? this.props.deleteBook(bookId, this.query) : false;
        return deleteAction;
      });
  }

  /**
   * @description deletes a book from the library
   *
   * @param {number} categoryId - id of the category to filter by
   * @param {object} event - click event
   * @param {string} title - category name
   *
   * @returns {function} action
   *
   * @memberof Admin
   */
  filterBooksByCategory(categoryId, event, title) {
    event.preventDefault();
    this.props.fetchBooksByCategory(this.state.pageId, categoryId, title)
      .then((res) => {
        const { isDone } = res;
        return this.setState({
          showCategoryTitle: true,
          categoryTitle: isDone ? title : `${title} Sorry! no books`
        });
      });
  }

  /**
   * @description displays the admin dashboard
   *
   * @param {void} null
   *
   * @returns {string} - HTML markup for the dashboard
   *
   * @memberof Admin
   */
  render() {
    const noBorrowHistory = (
      <h5>You have no borrowed book(s)!</h5>
    );
    const historySingle = this.props.borrows.map((borrowedBook, index) =>
      (<li key={borrowedBook.id} className="collection-item">
        <b>{index + 1}. </b>
        <span>{borrowedBook.book.title} borrowed by </span>
        <span>{borrowedBook.user.username} on </span>
        <span>
          {(moment(borrowedBook.createdAt).format('MMMM Do YYYY, h:mm a'))}
          &nbsp;
        </span>
        {borrowedBook.returned ?
          <span className="green-badge">
          &nbsp;Returned on {(moment(borrowedBook.updatedAt)
              .format('MMMM Do YYYY, h:mm a'))}
          </span> :
          <span className="red-badge"> Not yet returned</span>}
      </li>),
    );
    return (
      <div>
        <div className="nav-bottom" />
        <div className="row available-books">
          <h3 className="col s12">
          Admin Dashboard &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            {this.state.showCategoryTitle && (
              <small className="white-text">
                Filtering by: {this.state.categoryTitle}
              </small>)}
          </h3>
          <div className="row">
            <div className="col s12 m12 l3">
              <div className="row">
                <CategoryList
                  id="category-list"
                  handleFilterBooksByCategory={this.filterBooksByCategory}
                  categories={this.props.categories}
                />
                {this.props.categories > 10 ?
                  <p className="category-note white-text">
                    Scroll inside above list to see remaining categories
                  </p> : ''}
              </div>
            </div>
            <div className="col s12 m12 l9">
              <div className="center-align">
                <Modal
                  header="Add New Book"
                  trigger={<Button id="book-form-btn">ADD BOOK</Button>}
                  id="book-form-modal"
                >
                  <BookForm />
                </Modal>&nbsp;&nbsp;
                <Modal
                  header="Add New Category"
                  trigger={<Button id="cat-form-btn" >ADD CATEGORY</Button>}
                  id="category-form-modal"
                >
                  <CategoryForm />
                </Modal>
              </div>
              <BookList
                id="book-list"
                books={this.props.books}
                handleDelete={this.handleDelete}
                handleEdit={this.handleEdit}
              />
              {this.state.wouldEdit && <Modal
                header="Update Book"
                id="update-book-modal"
              >
                <BookForm book={this.state.bookToEdit} />
              </Modal>}
              {!this.state.showCategoryTitle ?
                <Paginator
                  fetchData={this.props.fetchBooks}
                  redirect={this.props.history}
                  pageName={this.props.history.location.pathname}
                /> : ''
              }
            </div>
          </div>
          <div className="notify-section row">
            <h3 className="col s12"> All Notifications</h3>
            <div className="col s12">
              <div className="card-panel">
                {this.props.books.length > 0 ?
                  <div>
                    <b className="notify-note">
                      Click below for more notifications
                    </b>
                    <ul className="collection">
                      {historySingle}
                    </ul>
                    {this.state.numberOfPages > 1 &&
                      <div className="center-align">
                        <button
                          onClick={this.handleMoreNotification}
                          className="btn center-align"
                        > See More
                        </button>
                      </div>}
                  </div> : noBorrowHistory }
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// Type checking for Admin component
Admin.propTypes = {
  books: PropTypes.arrayOf(PropTypes.object).isRequired,
  borrows: PropTypes.arrayOf(PropTypes.object).isRequired,
  fetchBooks: PropTypes.func.isRequired,
  fetchCategories: PropTypes.func.isRequired,
  history: PropTypes.shape({
    location: PropTypes.object.isRequired,
    push: PropTypes.func.isRequired
  }).isRequired,
  categories: PropTypes.arrayOf(PropTypes.object).isRequired,
  fetchBooksByCategory: PropTypes.func.isRequired,
  deleteBook: PropTypes.func.isRequired,
  fetchAllBorrowedBooks: PropTypes.func.isRequired,
};

/**
 * @description maps the state in redux store to Admin props
 *
 * @param {object} state
 *
 * @returns {object} book
 */
export function mapStateToProps(state) {
  return {
    books: state.booksReducer.books,
    borrows: state.borrowsReducer.borrows,
    categories: state.categoryReducer.categories
  };
}

export default connect(mapStateToProps, {
  fetchBooks,
  fetchCategories,
  fetchBooksByCategory,
  deleteBook,
  fetchAllBorrowedBooks
})(Admin);
