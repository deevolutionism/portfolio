import React from 'react';

export default class Tagslist extends React.Component {
  constructor(props) {
    super(props);

  }


  render() {
    // var tagItems = <li></li>
    var tagItems = [];
    if(this.props.tags){
      // var tags = this.props.tags;
      tagItems = this.props.tags.map((tag, index) => {
        <li className = "tag" key = {index}>{tag}</li>
      });
      // this.props.tags.forEach((tag) => {
      //   tagItems.push(<li className = "tag" key = {tag}>{tag}</li>);
      // });
    }

    return (
    <div className="tags_container">
      <ul className="tags_list">{tagItems}</ul>
    </div>
    )
  }

}
