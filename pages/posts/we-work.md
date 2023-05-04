---
title: 'WeWork Meeting Room Booking Kiosk App'
date: '2016-07-20'
description: 'A kiosk app for conveniently booking WeWork meeting rooms'
tags: 'React, Javascript, RESTful API, Node, Express, Internship'
author: 'Gentry Demchak'
image: 'https://gentrydemchak-portfolio-content.s3.amazonaws.com/we-work-banner.jpg'
---

### Project Overview
I had the good fortune of joining the R&D team at the WeWork HQ in New York City for a summer internship. I collaborated with a team of full stack engineers and designers to come up with an idea for an accessible and convenient touch point for WeWork members to book meeting rooms from common locations throughout WeWork offices. Essentially we wanted to provide alternative means of booking that went beyond the WeWork mobile app. For that we decided a kiosk app would be a great solution.

### Architecture
After an initial design conversation, I spent some time with the team thinking about and exploring architectural decisions about which frameworks, libraries, and languages to leverage. We explored a few options such as vanila JS, backbone, Ember.js, Ruby on Rails, Elm, and React. We decided to go with React because of its strong community support, component organization, and data binding/reactivity that would ulimately make it easier to build / manipulate the DOM considering there would be some complex UI components/interactions around picking times.

### Development
Some major components of the initial prototype app that I had to develop:
- a few list components for displaying data such as location name, room names, and availability states
- a duration incrementer/decrementer component for selecting meeting duration
- a timeslot picker component for viewing, selecting, and displaying vacant and occupied timeslots
- banner component for displaying images and text about the location or meeting room
- buttons for navigating between views, getting the next available closest room, and for submitting a booking request to the WeWork API
- understanding the endpoints to hit on the WeWork API for booking a meeting room, getting available rooms, times, locations, and related assets.

### Results of the initial prototype

![WeWork Booking Kiosk App](https://gentrydemchak-portfolio-content.s3.amazonaws.com/we-work-kiosk-1+(2).jpg)
*WeWork location selection*

![WeWork Booking Kiosk App](https://gentrydemchak-portfolio-content.s3.amazonaws.com/we-work-kiosk-2+(2).jpg)
*Room Selection*

![WeWork Booking Kiosk App](https://gentrydemchak-portfolio-content.s3.amazonaws.com/we-work-kiosk-3+(2).jpg)
*Selection and continue to booking*

![WeWork Booking Kiosk App](https://gentrydemchak-portfolio-content.s3.amazonaws.com/we-work-kiosk-4+(2).jpg)
*Time Selection*

![WeWork Booking Kiosk App](https://gentrydemchak-portfolio-content.s3.amazonaws.com/we-work-kiosk-5+(2).jpg)
*Multi-time selection*

![WeWork Booking Kiosk App](https://gentrydemchak-portfolio-content.s3.amazonaws.com/we-work-kiosk-6+(2).jpg)
*Reservation*

This was a great project to work on and I learned a lot about React, Javascript, and RESTful API's. Althought the internship was relatively short 2-3 months - we had also discussed some interesting ideas for future iterations, features, and enhacements for the app that would have been nice to continue developing/exploring such as: 
1. Adding a RFC scanner to the app to allow WeWork members to quickly and convieniently log in to the app and book a room.
2. Add transitions and animations to the app to make it more engaging and friendly to use. 
3. Deploying a live version of the kiosk app to a tablet in a WeWork office to get feedback from members and iterate on the design and functionality.