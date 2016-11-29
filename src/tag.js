import React from 'react';

export default class Tag extends React.Component {
  constructor(props) {
    super(props);
    this.handleTagSelect = this.handleTagSelect.bind(this);
    this.state = {
      toggle: false
    }
  }

  handleTagSelect(){
    this.props.handleTagSelect(this.props.tagname);
    // console.log(this.props.selectedTags);
    if(this.props.selectedTags[0] == 'All' && this.props.tagname != 'All'){
      //the All button was pressed, toggle every
      //button that is not All off.
      this.setState({
        toggle: false
      });
    } else if(this.props.selectedTags[0] == 'All' && this.props.tagname == 'All') {
      //if this tag button is the All button, toggle it active.
      // console.log('pressed all');
      this.setState({
        toggle: !this.state.toggle
      });
    } else {
      //user pressed a button that was not the All button.
      // console.log(this.props.tagname)
      this.setState({
        toggle: !this.state.toggle
      });
    }
  }

  componentWillRecieveProps(nextProps) {
    console.log(nextProps);
  }

  status() {
    var status = "tag_off"
    if(this.state.toggle){
      status = "tag_on"
    } else {
      status = "tag_off"
    }
    // console.log(status);
    return status
  }

  render() {
    var cn = `sort_button tag ${this.status()}`;
    return (
      <div className={this.status()} onClick={this.handleTagSelect}>
       <li className={cn}>{this.props.tagname}</li>
      </div>
    )
  }

}
