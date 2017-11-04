import React, { Component } from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { Input } from 'react-materialize';
import Dropzone from 'react-dropzone';
import { connect } from 'react-redux';
import SingleInputWithIcon from '../../forms/SingleInputWithIcon';
import TextAreaInput from '../../forms/TextAreaInput';
import { saveBook } from './../../../actions/bookActions';
import { fetchCategories } from './../../../actions/categoryActions';
import handleDrop from './../../../helpers/utilities';
import droploader from '../../../../public/images/dropzone.gif';

/**
 * @description represents form used in Adding a Book detail
 * @class BookForm
 * @extends {Component}
 */
class BookForm extends Component {
  /**
   * Creates an instance of BookForm.
   * @param {object} props
   * @memberof BookForm
   * @constructor
   */
  constructor(props) {
    super(props);
    this.state = {
      isbn: '',
      title: '',
      author: '',
      quantity: '',
      description: '',
      image: '',
      category: 'Unsorted',
      errors: {},
      loading: false,
      coverUploaded: false,
      dropzoneLoader: false,
    };
    this.onChange = this.onChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleFileUpload = this.handleFileUpload.bind(this);
  }

  /**
   * @description Invoked after component has mounted
   * @param {void} null
   * @returns {void} returns nothing
   * @memberof BookForm
   */
  componentDidMount() {
    this.props.fetchCategories();
  }

  /**
   * @description handles changes to the input fields value
   * @param {object} event
   * @returns {void} returns nothing
   * @memberof BookForm
   */
  onChange(event) {
    if (!this.state.errors[event.target.name]) {
      const errors = Object.assign({}, this.state.errors);
      delete errors[event.target.name];
      this.setState({
        [event.target.name]: event.target.value,
        errors,
      });
    } else {
      this.setState({ [event.target.name]: event.target.value });
    }
  }

  /**
   * @description handles file upload to cloudinary
   * @param {array} files
   * @returns {string} // Image url from cloudinary
   * @memberof BookForm
   */
  handleFileUpload(files) {
    this.setState({ dropzoneLoader: true });
    handleDrop(files).then((cloudinaryResponse) => {
      if (cloudinaryResponse.imageUploaded) {
        this.setState({ coverUploaded: true });
        return this.setState({
          dropzoneLoader: false,
          image: cloudinaryResponse.data.secure_url });
      }
      return cloudinaryResponse;
    });
  }

  /**
   * @description handles Book update form submission
   * @param {object} event
   * @returns {void} returns nothing
   * @memberof UpdateBookModal
   */
  handleSubmit(event) {
    event.preventDefault();
    const errors = {};
    if (this.state.isbn.trim() === '' || isNaN(this.state.isbn)) {
      errors.isbn = 'Can\'t be empty and must be number';
    }
    if (this.state.title.trim() === '') errors.title = 'Can\'t be empty';
    if (this.state.author.trim() === '') errors.author = 'Can\'t be empty';
    if (this.state.quantity === '' || isNaN(this.state.quantity)) {
      errors.quantity = 'Can\'t be empty and must be number';
    }
    if (this.state.description.trim() === '') {
      errors.description = 'Can\'t be empty';
    }
    if (this.state.category.trim() === '') {
      errors.category = 'Can\'t be empty';
    }
    this.setState({ errors });
    const isValid = Object.keys(errors).length === 0;

    if (isValid) {
      const { isbn, title, author,
        description, quantity, category, image } = this.state;
      // this.setState({ loading: true });
      saveBook({ isbn, title, author, description, quantity, category, image })
        .then((res) => {
          Materialize.toast(
            res.isDone ? res.res.message : res.errors.message,
            3000,
            res.isDone ? 'green' : 'red',
          );
          if (res.isDone) {
            this.setState({
              isbn: '',
              title: '',
              author: '',
              description: '',
              quantity: '',
              image: '',
              category: 'Unsorted',
            });
          }
        });
    }
  }

  /**
   * @description displays the form for updating
   * @param {void} null
   * @returns {string} - HTML markup for the form
   * @memberof UpdateBookModal
   */
  render() {
    const { errors } = this.state;
    const style = {
      marginLeft: '25%',
      width: '50%',
      fit: {
        height: '200px',
        position: 'absolute',
      },
    };
    const selectorOptions = this.props.categories.map(option =>
      (
        <option key={option.id} value={option.title}>
          {option.title}
        </option>
      ),
    );
    return (
      <div>
        {!!this.state.errors.global && <div className="alert-danger">
          {this.state.errors.global}</div>}
        <form onSubmit={this.handleSubmit}>
          <SingleInputWithIcon
            placeholder="ISBN"
            identifier="icon_prefix"
            inputName="isbn"
            inputType="text"
            inputClass="validate"
            controlFunc={this.onChange}
            content={this.state.isbn}
            fieldError={errors.isbn}
            iconClass={'fa fa-list-ol prefix'}
          />
          <SingleInputWithIcon
            placeholder="Title"
            identifier="icon_prefix"
            inputName="title"
            inputType="text"
            inputClass="validate"
            controlFunc={this.onChange}
            content={this.state.title}
            fieldError={errors.title}
            iconClass={'fa fa-pencil prefix'}
          />
          <SingleInputWithIcon
            placeholder="Author"
            identifier="icon_prefix"
            inputName="author"
            inputType="text"
            inputClass="validate"
            controlFunc={this.onChange}
            content={this.state.author}
            fieldError={errors.author}
            iconClass={'fa fa-user-circle prefix'}
          />
          <SingleInputWithIcon
            placeholder="Quantity"
            identifier="icon_prefix"
            inputName="quantity"
            inputType="text"
            inputClass="validate"
            controlFunc={this.onChange}
            content={this.state.quantity}
            fieldError={errors.quantity}
            iconClass={'fa fa-plus-circle prefix'}
          />
          <TextAreaInput
            placeholder={'Enter description'}
            identifier={'description'}
            name={'description'}
            rows={50}
            cols={50}
            controlFunc={this.onChange}
            content={this.state.description}
            fieldError={errors.description}
          />
          <div className={classnames('input-field col s12',
            { 'has-error': !!this.state.errors.category })}
          >
            <i className="fa fa-list fa-2x prefix " />
            <Input
              style={{ marginLeft: '44px !important' }}
              defaultValue={this.state.category}
              name="category"
              type="select"
              onChange={this.onChange}
            >
              <option value="">Unsorted</option>
              {selectorOptions}
            </Input>
            <span style={{ textAlign: 'left', marginLeft: '45px' }}>
              {this.state.errors.category}</span>
          </div>
          <p>Drop book image file below or click below to upload</p>
          <Dropzone
            onDrop={this.handleFileUpload}
            multiple
            accept="image/*"
          >
            {this.state.dropzoneLoader
              && <img style={style} src={droploader} alt="" />}
            {!this.state.dropzoneLoader
              && <img
                style={style.fit}
                src={this.state.image}
                alt=""
                className="card"
              />}
          </Dropzone>
          <div className="center-align col s12">
            <button
              type="submit"
              className="btn waves-effect teal"
              disabled={classnames(this.state.loading ? 'disabled' : '')}
            >
              <i className="fa fa-send" /> Add Book</button>
          </div>
        </form>
      </div>
    );
  }
}

// Type checking for BookForm component
BookForm.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.object).isRequired,
  fetchCategories: PropTypes.func.isRequired,
};

/**
 * @description maps the state in redux store to UpdateBookModal props
 * @param {object} state
 * @returns {object} categories
 */
function mapStateToProps(state) {
  return {
    categories: state.categories,
  };
}

export default connect(mapStateToProps, {
  saveBook, fetchCategories })(BookForm);
