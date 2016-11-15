"use strict";
import React, {Component} from "react";
import ReactDom from "react-dom";
import Segment from './segment.js'
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
      projects: null,
      pageViews: 0
    };
    this.getData = this.getData.bind(this);
    this.updatePageViews = this.updatePageViews.bind(this);
    this.handleUserSelect = this.handleUserSelect.bind(this);
  }

  getData() {
    $.ajax({
      type: "GET",
      url: "/portfolio",
      dataType: "json",
      success: (data) => {
        this.setState({
          projects: data,
          pageViews: data.projects.pageViews
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
          projects: data
        });
      },
      error: (err) => {
        console.log(err);
        return err;
      }
    });
  }

  render() {
    var portfolioItems = [];
    if(this.state.projects != null){
      version = this.state.projects.version;
      pageViews = this.state.projects.pageViews;
      for(var i = 0; i<this.state.projects.projects.length;i++){
        console.log(this.state.projects.projects[i].image);
        portfolioItems.push(
          <Segment className = "segment" key = {this.state.projects.projects[i].title}
            data={this.state.projects.projects[i]}
            image={this.state.projects.projects[i].image}
            title={this.state.projects.projects[i].title}
            type={this.state.projects.projects[i].type}
            date={this.state.projects.projects[i].date}
            views={this.state.projects.projects[i].views}
            description={this.state.projects.projects[i].description}
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
        {portfolioItems}
        <div>version: {version}</div>
        <div>views: {pageViews}</div>
      </div>
    )
  }
}

const content = document.getElementById('app');

ReactDom.render(<Index />, content);
