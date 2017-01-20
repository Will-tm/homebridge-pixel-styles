# Homebridge-Pixel-Styles
homebridge-plugin for RGB Styles Pixel-Styles control with Apple-Homekit. 

#Installation
Follow the instruction in [NPM](https://www.npmjs.com/package/homebridge) for the homebridge server 
installation. The plugin is published through [NPM](https://www.npmjs.com/package/homebridge-pixel-styles) and 
should be installed "globally" by typing:

    sudo npm install -g Homebridge-pixel-styles

#Configuration

config.json

Example:

    {
      "bridge": {
          "name": "Homebridge",
          "username": "CC:22:3D:E3:CE:51",
          "port": 51826,
          "pin": "031-45-154"
      },
      "description": "This is an example configuration file for homebridge pixel-styles plugin",
      "hint": "Always paste into jsonlint.com validation page before starting your homebridge, saves a lot of frustration",
      "accessories": [
        {
            "accessory": "PixelStyles",
            "name": "Coffee Table",
            "host": "10.0.0.7",
            "port": 56615
        }
     ]
    }

