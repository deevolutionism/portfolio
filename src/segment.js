import React from 'react';
import jquery from 'jquery';

export default class Segment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      image: 'placeholder.png'
    };
    this.handleUserSelect = this.handleUserSelect.bind(this);
    this.handleOnLoad = this.handleOnLoad.bind(this);
    this.handleError = this.handleError.bind(this);
  }

  handleUserSelect() {
    this.props.handleUserSelect(this.props.title);
    if (this.props.data.link !== null){
      localStorage.setItem('data',JSON.stringify(this.props.data));
      window.location.href = this.props.data.link;
    }
  }

  handleOnLoad() {
    this.setState({
      loading: false,
      image: this.props.image
    });
  }

  handleError(){
    this.setState({
      loading: false,
      image: 'placeholder.png'
    });
  }

  renderSpinner() {
    if(this.state.loading){
      return <div className="loader"></div>
    } else {
      return null
    }
  }

  render(){
    return (
      <div className = "segment" onClick={this.handleUserSelect}>
        {this.renderSpinner()}
        <img
          className="project_image"
          src={this.state.image}
          onLoad={this.handleOnLoad}
          onError={this.handleError}
        />
        <h2>{this.props.title}</h2>
        <h3>{this.props.type}</h3>
        <h3>{this.props.date}</h3>
        <p>{this.props.description}</p>
        <div className="project_views_container">
          <p className="project_views">
            views
            <span className="project_views_number">
              {this.props.views}
            </span>
          </p>
        </div>
      </div>
    )
  }
}
