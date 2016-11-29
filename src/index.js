"use strict";
import React, {Component} from "react";
import ReactDom from "react-dom";
import Segment from './segment.js';
import Tagsmenu from './tagsmenu.js';
import $ from "jquery";

var version = '0.0.0';
var pageViews = 0;

var onloadCallback = function() {
    alert("grecaptcha is ready!");
    grecaptcha.render()
};

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      projects:null,
      version: 0,
      allProjects: null,
      pageViews: 0,
      selectedTags:["All"]
    };
    this.getData = this.getData.bind(this);
    this.updatePageViews = this.updatePageViews.bind(this);
    this.handleUserSelect = this.handleUserSelect.bind(this);
    this.handleSort = this.handleSort.bind(this);
    this.handleTagSelect = this.handleTagSelect.bind(this);
  }

  getData() {
    $.ajax({
      type: "GET",
      url: "/portfolio",
      dataType: "json",
      success: (data) => {
        console.log('Got data');
        this.setState({
          projects: data.projects,
          allProjects: data.projects,
          pageViews: data.projects.pageViews,
          version: data.version
        });
      },
      error: (err) => {
        console.log(err);
        return err;
      }
    });
  }

  updatePageViews() {
    $.ajax({
      type: "PUT",
      url: "/connected",
      dataType: "json",
      data: {'key':'value'},
      async: false,
      success: (data) => {
        console.log(data.projects.pageViews);
        this.setState({
          pageViews: data.projects.pageViews
        });
      },
      error: (err) => {
        console.log(err);
        return err;
      }
    });
  }

  componentDidMount() {
    this.updatePageViews();
    this.getData();
  }

  handleUserSelect(title){
    console.log(title);
    let url = `/segmentViews/${title}`;
    $.ajax({
      type:"PUT",
      url:url,
      data:{'key':'value'},
      success: (data) => {
        this.setSate({
          projects: data.projects
        });
      },
      error: (err) => {
        console.log(err);
        return err;
      }
    });
  }

  handleTagSelect(tagname) {
    console.log(tagname);
    var selected = this.state.selectedTags;
    console.log(selected);
    if (tagname == "All"){
      this.setState({
        projects: this.state.allProjects,
        selectedTags: ['All']
      });
    } else if(selected.indexOf(tagname) > -1){
      //remove the tag, because it already
      //exists and was toggled off
      if(selected[0] == 'All'){
        selected.shift();
      }
      var item = selected.indexOf(tagname);
      if(item > -1){
        selected.splice(item,1);
        this.setState({
          selectedTags: selected
        });
      }
      this.handleSort(tagname);
    } else {
      //add the tag, because it was toggled on
      //and isnt currently in the array.
      if(selected[0] == 'All'){
        selected.shift();
      }
      selected.push(tagname);
      this.setState({
        selectedTags: selected
      });
      this.handleSort(tagname);
    }
  }

  handleSort(tag) {
    var sorted = [];
    // console.log(this.state);
    for(var i = 0; i<this.state.allProjects.length;i++){
      for(var j = 0; j<this.state.allProjects[i].type.length;j++){
        if(this.state.selectedTags.indexOf(this.state.allProjects[i].type[j]) > -1){
          console.log(this.state.allProjects);
          sorted.push(this.state.allProjects[i]);
          // sorted.push(this.state.allProjects[i]);
        }
      }
    }
    console.log('setting state');
    this.setState({
      projects: sorted
    });
  }

  render() {
    var portfolioItems = [];
    if(this.state.projects != null){
      version = this.state.version;
      pageViews = this.state.pageViews;
      console.log(this.state.projects);
      for(var i = 0; i<this.state.projects.length;i++){
        console.log(this.state.projects[i].image);
        portfolioItems.push(
          <Segment className = "segment" key = {this.state.projects[i].title}
            data={this.state.projects[i]}
            image={this.state.projects[i].image}
            title={this.state.projects[i].title}
            type={this.state.projects[i].type}
            date={this.state.projects[i].date}
            views={this.state.projects[i].views}
            description={this.state.projects[i].description}
            handleUserSelect={this.handleUserSelect}
          />
        );
      }
    }

    return (
      <div>
      <h1>Gentry Demchak</h1>
        <ul>
          <li><a href="https://github.com/deevolutionism">Github</a></li>
          <li><a href="https://twitter.com/gdemchak17">Twitter</a></li>
          <li><a href="https://www.linkedin.com/in/gentry-demchak-843a6a79">Linkedin</a></li>
          <li><a href="/assets/GentryDemchak_Resume_2016.pdf" download>Resume</a></li>
        </ul>
        <Tagsmenu handleTagSelect={this.handleTagSelect} selectedTags={this.state.selectedTags}/>
        {portfolioItems}
        <div>version: {version}</div>
        <div>views: {pageViews}</div>
      </div>
    )
  }
}

const content = document.getElementById('app');

ReactDom.render(<Index />, content);
