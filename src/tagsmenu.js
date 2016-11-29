import React from 'react';
import Tag from './tag.js';

export default class TagsMenu extends React.Component {
  constructor(props) {
    super(props);
    this.handleTagSelect = this.handleTagSelect.bind(this);
  }

  handleTagSelect(tagname){
    this.props.handleTagSelect(tagname);
  }

  render() {
    var tags = [];
    const tagNames = [
      "All",
      "Arduino",
      "Web",
      "Javascript",
      "Processing",
      "Illustrator",
      "Photoshop",
      "Raspberry Pi",
      "P5",
      "React",
      "3D Printing",
      "Laser Cut",
      "Wearable",
      "Swift",
      "IOS",
      "SDR"
    ];

    tagNames.forEach( (tag) => {
      tags.push(
        <Tag
          tagname={tag}
          selectedTags={this.props.selectedTags}
          key={tag}
          handleTagSelect={this.handleTagSelect}
        />
      )
    });

    return (
      <div className="tags_container">
        <ul className="tags_list">{tags}</ul>
      </div>
    )
  }

}
