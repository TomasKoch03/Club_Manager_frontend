---
applyTo: '**'
---
Provide project context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.When we build projects, we want to showcase them online. Instead of buying a domain and taking the time to configure it, it's easier just to host it using GitHub Pages.

A project that just uses JavaScript, HTML and CSS is simple to host on GitHub Pages. Projects that are built in React, Vue or Angular require some configurations, though. This gives anyone who visits your application online the same experience you have when you build the application locally.

In this article, I'll show you how to create a simple React application that uses routing and then we'll learn how to upload it to GitHub Pages. We will give special attention to the routing part since it is important to understand and implement.

    ⚠️ This article assumes you have some knowledge of React and Git.

Prerequisites

You need to have Node, yarn and npm installed on your machine. To check if they are installed, open up a terminal window and type the following:

npm -v
yarn -v
node -v

If these commands print out a version number in the terminal, you are good to go. If not, you need to go ahead and install what is missing.

    Node (contains npm)
    Yarn

We will also need to create a repository on GitHub. Head over to your account and create a new repository. Choose whichever name you deem fit for this project, but I will go with starter-project for the rest of this article.

To create our project, we will be using create-react-app. It is a package that lets you create a single page application with ease. To create a project, you need to type the following in the terminal:

npx create-react-app starter-project

Once the operation finishes, you will have a boilerplate React project, ready to go. To see if it works properly, head into the directory of the project (in our example it would be starter-project) and run the command:

yarn start

If everything runs properly, you will see a message in the terminal that says that your application is running on a local server at this address: http://localhost:3000

If you head over there in your browser, you will see this:

Image
How to Deploy Your Project to GitHub

You may have noticed that we have not created any repository in GitHub. So before we move on, we must have our project uploaded there. Head over to your GitHub account and create a repository with the same name as the React project.

    ☝️ Make sure to mark your repository as public. If you mark it as private, you won't be able to use GitHub Pages.

We are going to add this repository as a remote to our project. To do that, in the terminal, type:

git remote add <name-of-remote> <url-of-repository>

So, in our case, the command looks like this:

git remote add origin https://github.com/TomerPacific/starter-project

    It's important to call the remote origin as it will be used in our deploy process.

After executing the command above, we can't push our code yet. First, we need to configure an upstream branch and set the remote as origin.

 git push --set-upstream origin master

Now, we can push all our project's files to our repository.

In order for us to be able to upload our built application to GitHub Pages, we first need to install the gh-pages package.

yarn add gh-pages

This package will help us to deploy our code to the gh-pages branch which will be used to host our application on GitHub Pages.

To allow us to use the gh-pages package properly, we need to add two keys to our scripts value in the package.json file:

"scripts": {
    "start": "react-scripts start",
    "predeploy": "npm run build", <----------- #1
    "deploy": "gh-pages -d build", <---------- #2
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },

Next, we need to modify our package.json file by adding the homepage field. This field is used by React to figure out the root URL in the built HTML file. In it, we will put the URL of our GitHub repository.

{
  "name": "starter-project",
  "homepage": "https://tomerpacific.github.io/starter-project/", <----
  "version": "0.1.0",
  /....
}

To deploy our application, type the following in the terminal:

npm run deploy

Running the command above takes care of building your application and pushing it to a branch called gh-pages, which GitHub uses to link with GitHub Pages.

    🚧 If you did not name your remote origin, you will get an error during this phase stating that: Failed to get remote.origin.url (task must either be run in a git repository with a configured origin remote or must be configured with the "repo" option).

You will know that the process was successful if at the end of it you see the word Published. We can now head to our GitHub repository under Settings and scroll down to the GitHub Pages section.

Image

If you see a message similar to the one above, it means your application is now hosted successfully on GitHub Pages.

Image _Photo by [Unsplash](https://unsplash.com/@noahglynn?utm_source=ghost&utm_medium=referral&utm_campaign=api-credit">Noah Glynn / <a href="https://unsplash.com/?utm_source=ghost&utm_medium=referral&utmcampaign=api-credit)
Routing in React

So far - so good:

    We have a basic React application that is hosted on GitHub Pages
    We also have a streamlined process to deploy it when we want to make changes

But since the purpose of this article is to show a more complex application than the one we initially created, we will be discussing routing.

One component that is missing from out application is navigation. Our application won't just be one page, it will probably have many pages. So, how will users be able to navigate between them?

Routing is the practice of selecting a path for traffic in a network. Or in more basic terms, what happens when you click on a link inside of a webpage and where you get redirected.

React is a library, and it does not contain everything you need for your application out of the box (in our case, routing). Therefore, we will need to install react router.

React router has different components for web applications and for native ones. Since we are building a web application, we will be using react-router-dom.

yarn add react-router-dom

To make use of routing in our application, let's create a navigation element which will be visible at the top of the application. We will be adding this inside our App.js file and replacing the current HTML markup that is there.

 <div>
     <nav>
         <ul id="navigation">
             <li>
                 <Link to="/">Home</Link>
             </li>
             <li>
                 <Link to="/about">About</Link>
             </li>
             <li>
                 <Link to="/contact">Contact</Link>
             </li>
         </ul>
     </nav>
</div>

Usually, in a non React project, we would put a relative path to our HTML pages for each section. That way, the browser knows where to load the data from.

But in our project, we won't have different HTML pages for each section. We will just load a different component. The markup that used to be inside of App.js will now be found inside of a component called Home.

import './App.css';
import React from 'react';
import logo from './logo.svg';

class Home extends React.Component {
    render() {
        return (
            <div className="App">
                <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <p>
                    Edit <code>src/App.js</code> and save to reload.
                </p>
                <a
                    className="App-link"
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Learn React
                </a>
                </header>
            </div>

        );
    }

}

export default Home;

As we have created three sections in our navgiation and taken care of the home section, let's give another example with the About section.

We'll create a new file called About.jsx that will hold our template and code for the about section.

import React from 'react';

const divStyle = {
    color:'white'
};

class About extends React.Component {

    render() {
        return (
            <div style={divStyle}>
                <h2>About Page</h2>
                <main>
                    <p>This section contains information about...</p>
                </main>
            </div>
        )
    }
}



export default About;

You may be asking yourself, how will the application know to redirect the user once they click on the about link? For that we will use a component called Route.

The Route is one of the most important components in react-router because it lets you render different component based on the path of the URL. For our project, we will use the code below inside of App.js just below the navigation markup.

<Switch>
    <Route exact path="/">
    <Home />
    </Route>
    <Route path="/about">
    <About />
    </Route>
</Switch>

You can see that we created two routes for home and about. The Switch component lets us group route components together and it will only match one of them.

Our combined App.js file looks like this:

import './App.css';
import React from 'react';
import { Route, Switch, Link } from "react-router-dom";
import About from './About';
import Home from './Home';

class App extends React.Component {
  render() {
      return (
        <div className="App">
          <div>
            <nav>
              <ul id="navigation">
                <li>
                  <Link to="/">Home</Link>
                </li>
                <li>
                <Link to="/about">About</Link>
                </li>
                <li>
                <Link to="/contact">Contact</Link>
                </li>
              </ul>
            </nav>
          </div>
            <Switch>
            <Route exact path="/">
              <Home />
            </Route>
            <Route path="/about">
              <About />
            </Route>
          </Switch>
          </div>
            );
  }
}

export default App;

One last thing we should do is wrap our entire project in a Router component. We need to do this because it enables us to use routing in our application. We will be using the BrowserRouter component as it uses HTML5's history API.

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

If we run things locally, everything seems to work. Let's deploy our augmented project to GitHub Pages and see what the result is.
How to Handle Routing Using HashRouter

At first glance, everything seems to be working fine. But when you try refreshing the page or navigating through the browser itself, you'll keep getting 404 errors.

Why does this happen? Because GitHub Pages does not support browser history like your browser does. In our case, the route https://tomerpacific.github.io/starter-project/about doesn't help GitHub Pages understand where to point the user (since it is a frontend route).

To overcome this problem, we need to use a Hash Router instead of a Browser Router in our application. This type of router uses the hash portion of the URL to keep the UI in sync with the URL.

ReactDOM.render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

You can read more about this here.

Deploy your application again and you'll be satisfied with the result. No more 404 errors.