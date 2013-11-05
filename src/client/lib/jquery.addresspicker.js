/*
 * jQuery UI addresspicker @VERSION
 *
 * Copyright 2010, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Progressbar
 *
 * Depends:
 *   jquery.ui.core.js
 *   jquery.ui.widget.js
 *   jquery.ui.autocomplete.js
 */
var init = function( $, google ) {

    var AddressPicker = function(element, options) {
        this.options = options;
        this.$element = $(element);
        this._create()
    }

    AddressPicker.prototype = {

        constructor: AddressPicker,

        marker: function() {
          return this.gmarker;
        },

        map: function() {
          return this.gmap;
        },

        updatePosition: function() {
          this.gmarker.setVisible(true);
          this.reloadPosition();
        },
    
        reloadPosition: function() {
            this.gmap.setCenter(this.gmarker.getPosition());
            this.gmarker.setVisible(true);
            google.maps.event.trigger(this.gmap, 'resize');
        },
    
        selected: function() {
          return this.selectedResult;
        },
    
        _create: function() {
          this.geocoder = new google.maps.Geocoder();

          var self = this;
          this.$element.typeahead({
              minLength:3,
              delay:this.options.typeaheaddelay,
              source: this._geocode.bind(this),
              textproperty: function(item) {
                      return item.formatted_address;
                  }, updater: function(item) {
                      self.$element.trigger('addressChanged',item);
                      return this.textproperty(item);
                  }, matcher: function(item) {
                      return true;
                  }

          });

            if (this.options.map) {
                this.$mapElement = $(this.options.map)[0];
                this._initMap();
            }

        },

        _initMap: function() {

          this.gmap = new google.maps.Map(this.$mapElement, this.options.mapOptions);
          this.gmarker = new google.maps.Marker({
            position: this.options.mapOptions.center,
            map:this.gmap,
            draggable: this.options.draggableMarker});

          google.maps.event.addListener(this.gmarker, 'dragend', $.proxy(this._markerMoved, this));

          this.gmarker.setVisible(false);
          this.$element.on("addressChanged", this._focusAddress.bind(this));
        },
        _getAddressByMarkerPosition: function(markerPos, callback) {
            var self = this;
            this.geocoder.geocode({latLng: markerPos}, function( results, status) {
             if(status == google.maps.GeocoderStatus.OK) {
                 var pickedAddress = results[0];
                 self.$element.trigger("addressChanged", pickedAddress);
                callback(pickedAddress);
             }
            });
        },
        _markerMoved: function() {
          var markerPos= this.gmarker.getPosition();
          markerPos.getAddress = this._getAddressByMarkerPosition.bind(this, markerPos);
          this.$element.trigger("positionChanged",markerPos);
        },

        // Autocomplete source method: fill its suggests with google geocoder results
        _geocode: function(query, process) {
            this.geocoder.geocode({
                'address': query+" ",
                'region': this.options.regionBias
            }, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    var suggestions = [];
                    for (var i = 0; i < results.length; i++) {
                        suggestions.push(results[i]);
                    };
                }
                process(suggestions);
            })
        },
    
        _findInfo: function(result, type) {
          for (var i = 0; i < result.address_components.length; i++) {
            var component = result.address_components[i];
            if (component.types.indexOf(type) !=-1) {
              return component.long_name;
            }
          }
          return false;
        },

        _focusAddress: function(evt,gMapsLocation) {
          if (!gMapsLocation) {
            return;
          }

          if (this.gmarker) {
            this.gmarker.setPosition(gMapsLocation.geometry.location);
            this.gmarker.setVisible(true);
            this.gmap.fitBounds(gMapsLocation.geometry.viewport);
          }

        },
        _addressSelected: function(evt, gMapsLocation) {
            console.dir(gMapsLocation);

            this.selectedResult = gMapsLocation;
        },
        _locationSelected: function(evt, LatLng) {

        }

      };

    $.fn.addresspicker = function (option, val) {
        return this.each(function () {
            var $this = $(this)
            var data = $this.data('addresspicker')
            var options = $.extend(true, {}, $.fn.addresspicker.defaults, $this.data(), typeof option == 'object' && option)
            if (!data)
                $this.data('addresspicker', (data = new AddressPicker(this, options)));

            //API:
            if (typeof option == 'string') //activate methods
                data[option](val)
        });
    }

    $.fn.addresspicker.defaults =  {
        draggableMarker: true,
        regionBias: null,
        map: false,
        typeaheaddelay: 300,
        mapOptions: {
            zoom: 5,
            center: new google.maps.LatLng(52.5122, 13.4194),
            scrollwheel: false,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }

    };

    $.fn.addresspicker.Constructor = AddressPicker;

    $.fn.addresspicker.position = function () {
        return this.selectedResult;
    }

    /*$.extend( $.addresspicker, {
        version: "@VERSION"
      });
*/
      // make IE think it doesn't suck
      if(!Array.indexOf){
        Array.prototype.indexOf = function(obj){
          for(var i=0; i<this.length; i++){
            if(this[i]==obj){
              return i;
            }
          }
          return -1;
        }
      }


};

$(document).ready(function() {
  init( window.jQuery, window.google );
});
