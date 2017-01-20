var Service, Characteristic;
var net = require('net');
var zlib = require('zlib');

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-pixel-styles", "PixelStyles", PixelStylesTable);
}

function appendBufferUntil(buffer, append, until, callback) {
    buffer = Buffer.concat([buffer, append], buffer.length+append.length);
    var index = append.indexOf(until);
    if (index >= 0) {
        buffer = new Buffer(buffer, 0, buffer.length - until.length);
        if (callback != null) {
            callback(buffer);
        }
    }
    return buffer;
}

function socketWrite(host, port, data, callback) {
    var client = new net.Socket();
    client.connect(port, host, function() {
        client.write(data);
        client.destroy();
        callback();
    })
    .on('error', function(err) {
        client.destroy();
        callback();
    });
}

function socketRequest(host, port, data, callback) {
    var client = new net.Socket();
    var read = new Buffer(0);
    client.connect(port, host, function() {
        client.write(data);
    })
    .on('data', function(data) {
        read = appendBufferUntil(read, data, "\r\n", function(buffer) {
            client.destroy(); 
            callback(null, buffer);
        });
    })
    .on('error', function(err) {
        client.destroy();
        callback(err, null);
    });
}

function PixelStylesTable(log, config) {
    this.log = log;

    // url info
    this.host = config["host"];
    this.port = config["port"];
    this.name = config["name"] || "Coffee Table";
    this.manufacturer = config["manufacturer"] || "";
    this.model = config["model"] || "Model not available";
    this.serial = config["serial"] || "Non-defined serial";
}

PixelStylesTable.prototype = {

    setState: function(value, callback) {
        var self = this;
        socketWrite(this.host, this.port, "SetActive_"+(value==true?"1":"0")+"\r\n", function(){
            self.log("'%s' is now %s", self.name, value ? "on" : "off");
            callback(null);
        });
    },

    getState: function (callback) {
        var self = this;
        socketRequest(this.host, this.port, "GetJSON\r\n", function(err, data) {
            if (err) callback(err, null);
            zlib.inflate(data, function(err, buf) {
                if (err) callback(err, null);
                var json = JSON.parse(buf.toString());
                var active = parseInt(json[0].active) == 1;
                self.log("'%s' is currently %s", self.name, active ? "on" : "off");
                callback(null, active);
            });
        });
    },
    
    setBrightness: function(value, callback) {
        var self = this;
        socketWrite(this.host, this.port, "SetBrightness_"+value+"\r\n", function(){
            self.log("'%s' brightness is now at %s%%", self.name, value);
            callback(null);
        });
    },

    getBrightness: function(callback) {
        var self = this;
        socketRequest(this.host, this.port, "GetJSON\r\n", function(err, data) {
            if (err) callback(err, null);
            zlib.inflate(data, function(err, buf) {
                if (err) callback(err, null);
                var json = JSON.parse(buf.toString());
                var brightness = parseInt(json[0].brightness);
                self.log("'%s' brightness is currently at %s%%", self.name, brightness);
                callback(null, brightness);
            });
        });
    },
    
    identify: function (callback) {
        callback();
    },

    getServices: function () {
        var service = new Service.AccessoryInformation();
        service.setCharacteristic(Characteristic.Name, this.name)
               .setCharacteristic(Characteristic.Manufacturer, this.manufacturer)
               .setCharacteristic(Characteristic.Model, this.model);

        var lightService = new Service.Lightbulb(this.name);

        lightService.getCharacteristic(Characteristic.On)
                    .on('set', this.setState.bind(this))
                    .on('get', this.getState.bind(this));

        lightService.getCharacteristic(Characteristic.Brightness)
                    .on('set', this.setBrightness.bind(this))
                    .on('get', this.getBrightness.bind(this));

        return [service, lightService];
    }
};
