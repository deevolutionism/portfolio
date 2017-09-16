import React from 'react';
import Tagslist from './tags.js'
import jquery from 'jquery';

export default class Segment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      image: './placeholder.png',
      visible: false
    };
    this.intersectionThreshold = 0;
    this.scrollY = props.scrollY;
    this.handleUserSelect = this.handleUserSelect.bind(this);
    this.handleOnLoad = this.handleOnLoad.bind(this);
    this.handleError = this.handleError.bind(this);
    this.checkIntersection = this.checkIntersection.bind(this);
    this.renderSegment = this.renderSegment.bind(this);
  }

  componentDidMount() {
    // this.checkIntersection()

  }

  // observe() {
  //   let options = {
  //     threshold: [0.5]
  //   };
    
  //   function onEntry(entry) {
  //     console.log('segment # ' + this.props.id + ' entered past the threshold');
  //     entry.target.classList.add('visible');
  //   }

  //   // instantiate a new Intersection Observer
  //   let observer = new IntersectionObserver(onEntry, options);

  //   // element to observe
  //   let segment = document.getElementById(this.props.id);   
  //   observer.observe(segment)
  // }

  shouldComponentUpdate(nextProps,nextState) {
    //if scrollY pos intersects with this elements position, then change the state to visible
    const intersects = this.checkIntersection(nextProps.scrollY, this.segmentBoundaries())
    const loading = this.state.loading !== nextState.loading  

    console.log(this.props.id)
    // console.log(nextProps)
    // console.log(intersects)
    return intersects || loading
  }

  handleUserSelect() {
    this.props.handleUserSelect(this.props.title);
    if (this.props.data.link !== null){
      localStorage.setItem('data',JSON.stringify(this.props.data));
      window.location.href = this.props.data.link;
    }
  }

  checkIntersection(scrollY,boundaries) {
    //return true if it intersects, false if it doesnt
    //check if segment is within the current viewport range
    //if it is, unskew it.  
    //store top of element position
    //if top of element = scrollY, change unskew it!
    //change the classname based on state change?
    let intersects = false
    var segBounds = document.getElementById(this.props.id).getBoundingClientRect()
    // console.log(segBounds)
    var difference =  segBounds.y - (scrollY - window.innerHeight())
    console.log('difference')
    console.log(difference)
    if(difference <= 0 ){
      //then its in the window frame
      this.setState({
        visible: true
      })
      intersects = true
    } else {
      intersects = false
    }

    return intersects

  }

  handleOnLoad() {
    this.setState({
      loading: false,
      image: this.props.image
    });
  }

  segmentBoundaries() {
    var segmentBoundaries = document.getElementById(this.props.id).getBoundingClientRect()
    return segmentBoundaries
  }

  renderSegment() {
    //return className segment with an active or inactive class
    //if the segment is intersecting, then return active, else return inactive
    var el = document.getElementById(this.props.id)

    if (this.state.visible) {
      return 'segment visible'
      // el.style.filter = 'brightness(1)'
      // el.style.transform = 'skew(0deg)'
    } else {
      return 'segment hidden'
      // el.style.filter = 'brightness(0)'
      // el.style.transform = 'skew(-10deg)'
    }
  }

  handleError() {
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

  render() {



    return (
      <div className = {this.renderSegment()} onClick={this.handleUserSelect} id={this.props.id}>
        {this.renderSpinner()}
        <img
          className="project_image"
          src={this.state.image}
          onLoad={this.handleOnLoad}
          onError={this.handleError}
        />
        <h2>{this.props.title}</h2>
        <Tagslist tags={this.props.type}/>
        <p>{this.props.description}</p>
        <div className="project_views_container">
          <p className="project_views">
            <span className="project_views_number">
              {this.props.views}
            </span>
            Views
          </p>
        </div>
        <h3 className="project-date">{this.props.date}</h3>
      </div>
    )
  }
}
