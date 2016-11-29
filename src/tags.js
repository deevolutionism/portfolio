import React from 'react';

export default class Tagslist extends React.Component {
  constructor(props) {
    super(props);

  }


  render() {
    var tagItems = <li></li>
    if(this.props.tags){
      const tags = this.props.tags;
      tagItems = tags.map((tag, index) =>
        <li className = "tag" key = {index}>{tag}</li>
      );
    }

    return (
    <div className="tags_container">
      <ul className="tags_list">{tagItems}</ul>
    </div>
    )
  }

}
