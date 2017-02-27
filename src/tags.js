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
      this.props.tags.forEach((tag) => {
        tagItems.push(<li className="tag">{tag}</li>)
      });
      console.log(tagItems);
    }

    return (
    <div className="tags_container">
      <ul className="tags_list">{tagItems}</ul>
    </div>
    )
  }

}
