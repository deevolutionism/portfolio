import React from 'react';

export default class Tagslist extends React.Component {
  //this component builds out a segment's list of related tags.
  constructor(props) {
    super(props);

  }


  render() {

    if(this.props.tags){
      // var tagItems = this.props.tags.map((tag, index) => {
      //   <li className = "tag" key = {index}>{tag}</li>
      // });
      var tagItems = [];
      this.props.tags.forEach((tag,index) => {
        tagItems.push(<li className="tag" key={index}><p>{tag}</p></li>)
      });
      
    }

    return (
    <div className="tags_container">
      <ul className="tags_list">{tagItems}</ul>
    </div>
    )
  }

}
