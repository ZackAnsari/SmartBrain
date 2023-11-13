import './App.css';
import React, { Component } from 'react';
import ParticlesBg from 'particles-bg'
import Navigation from './components/Navigation/Navigation';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm'
import Rank from './components/Rank/Rank';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';




const setupClarifai = (imageURL) => {
  const PAT = '65a2d1e7b9b7454db526e13a0d598747';
  const USER_ID = 'zackansari';
  const APP_ID = 'SmartBrain';
  // const MODEL_ID = 'face-detection';
  const IMAGE_URL = imageURL;
  const raw = JSON.stringify({
    "user_app_id": {
      "user_id": USER_ID,
      "app_id": APP_ID
    },
    "inputs": [
      {
        "data": {
          "image": {
            "url": IMAGE_URL
          }
        }
      }
    ]
  });

  const requestOptions = {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Key ' + PAT
    },
    body: raw
  };

  return requestOptions

}
const initialState = {
    input: '',
    imageURL: '',
    box: [],
    route: 'signin',
    isSignedIn: false,
    user: {
      id: '',
      name: '',
      email: '',
      entries: 0,
      joined: ''
    }
}


class App extends Component {
  constructor() {
    super()
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
      }
    })
  }


  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions.map(region => region.region_info.bounding_box);
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);

    return clarifaiFace.map(face => {
      return {
        leftCol: face.left_col * width,
        topRow: face.top_row * height,
        rightCol: width - (face.right_col * width),
        bottomRow: height - (face.bottom_row * height)
      }
    });

  }

  displayFaceBox = (box) => {
    console.log(box);
    this.setState({ box: box });
  }




  onInputChange = (event) => {
    this.setState({ input: event.target.value });
  }

  onButtonSubmit = () => {
    this.setState({ imageURL: this.state.input })
    fetch(`https://api.clarifai.com/v2/models/face-detection/outputs`, setupClarifai(this.state.input))
      .then((response) => response.json())
      .then((response) => {
        // console.log("hi", response.outputs[0].data.regions[0].region_info.bounding_box);
        if (response) {
          fetch('http://localhost:3000/image', {
            method: 'put',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
            .then(response => response.json())
            .then(count => {
              this.setState(Object.assign(this.state.user, { entries: count }))
            })
            .catch(console.log)

        }
        this.displayFaceBox(this.calculateFaceLocation(response))

      })
      .catch(err => console.log(err));

  }

  onRouteChange = (route) => {
    if (route === "signout") {
      this.setState(initialState)
    } else if (route === "home") {
      this.setState({ isSignedIn: true })
    }
    this.setState({ route: route });
  }
  render() {
    const { isSignedIn, route, imageURL, box } = this.state;
    return (
      <div className="App">

        <div>
          <ParticlesBg type="circle" bg={true} />
        </div>

        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
        {route === 'home' ?
          <div>
            <Logo />
            <Rank name={this.state.user.name} entries={this.state.user.entries}/>
            <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit} />
            <FaceRecognition box={box} imageURL={imageURL} />
          </div>

          : (
            route === "signin"
              ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
              :
              <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
          )


        }

      </div>
    );
  }
}

export default App;
