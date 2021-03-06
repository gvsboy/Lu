var constants = require( 'lu/constants' ),
  helpers = require( 'lu/helpers' ),
  Switch = require( 'lu/Switch' ),
  Container;

/**
* Contains content and maintains state
* @class Container
* @constructor
* @extends Switch
* @version 0.2.4
*/

Container = Switch.extend( function ( base ) {
  /**
   * Default configuration values
   * @property defaults
   * @type Object
   * @private
   * @final
   */
  var defaults = {
    /**
     * The default state or states to be applied to the Container.
     * This can be an Array of strings or comma-delimited string
     * representing multiple states.
     * It can also be a string representing a single state
     * @property states
     * @type {String|Array}
     * @default null
     */
    states: null,
    content: null,
    /**
     * A URL to be used as a content source.
     * @property url
     * @type {String}
     * @default null
     */
    url: null,
    /**
     * A CSS selctor for an element to be used as a content source.
     * @property selector
     * @type {String}
     * @default null
     */
    selector: null,
    /**
     * Set to true if the content should be loaded in an iframe
     * @property frame
     * @type {Boolean}
     * @default false
     */
    frame: false,
    /**
     * When true the $element's height is set to the content height.
     * @property autoHeight
     * @type {Boolean}
     * @default false
     */
    autoHeight: false,
    /**
     * When true the $element's width is set to the content width.
     * @property autoWidth
     * @type {Boolean}
     * @default false
     */
    autoWidth: false,
    /**
     * A selector that specifies a target within the Container to inject content.
     * @property target
     * @type {String}
     * @default null
     */
    target: null
  };

  return {
    /**
     * Constructor
     * @method init
     * @public
     * @param {Object} $element JQuery object for the element wrapped by
     * the component
     * @param {Object} settings Configuration settings
     */
    init: function( $element, settings ){
      /**
       * Instance of Container
       * @property Container
       * @type Object
       * @private
       */
      var self = this,
        /**
         * The content of the container
         * @property content
         * @type String
         * @private
         */
        content,
        target;

      _.defaults( settings, defaults );

      base.init.call( self, $element, settings );

      /**
       * A cache to store the height and width of the $element
       * @property cache
       * @type Object
       * @public
       */
      self.cache = {};

      /**
       * A jquery object to inject content into
       * @property target
       * @type {Object}
       * @public
       */
      self.$target = null;

      target = settings.target;

      if( target ){
        self.$target = $element.find( target );
      } else {
        self.$target = $element;
      }

      /**
       * Loads content and then triggers an update event. Called on load event.
       * @method load
       * @private
       * @param {Object} $target Jquery object for the target node
       * @param {String|Object} source The source to load or obtain a URL from
       * @param {String} method the method to be used when inserting content
       * @return {Object} Container
       */
      function load( $target, source, method ){
        var isUrl = helpers.isUrl( source ),
          loadedContent,
          tmpData,
          url;

        if( !isUrl ){
          if (typeof source === "object" && source.getUrl) {
            url = source.getUrl();
          }
          else if (typeof source === "string") {
            url = source;
          }
          else if ( $target.is( 'a' ) ){
            url = $target.attr( 'href' );
          }

          // DO WE NEED THIS???
          if( !url && arguments.length > 1 ){
            method = url;
          }
        }

        if( url.indexOf( '#' ) === 0 ){
          loadedContent = $( url ).html();
          self.trigger( constants.events.UPDATE, [loadedContent, method] );
          return self;
        }

        if( settings.frame === true ){
          loadedContent = '<iframe src="' + url + '"></iframe>';
          self.trigger( constants.events.UPDATE, [loadedContent, method] );
          return self;
        }

        self.removeState( constants.states.LOADED );
        self.addState( constants.states.LOADING );

        $.ajax( {
          url: url,
          success: function( data, textStatus, jXHR ){
            var newContent,
              anchor = helpers.parseUri( url ).anchor;

            if( settings.selector ){
              newContent = $( data ).find( settings.selector ).html();
            } else if( anchor ){
              newContent = $( data ).find( '#' + anchor ).html() || data;
            } else {
              newContent = data;
            }

            self.removeState( constants.states.LOADING );
            self.addState( constants.states.LOADED );
            self.trigger( constants.events.UPDATE, [newContent, method] );
          },
          failure: function(){
           self.removeState( constants.states.LOADING ).addState( constants.states.ERRED );
          }
        } );

        return self;
      }

      /*
       * Updates content on an update event
       * @method update
       * @private
       * @param {Object} $target Jquery object for the target node
       * @param {String} updateContent The content to set
       * @param {String} method The method to use for setting the content.
       * This can specified as 'prepend' or 'append'. If theese are not
       * specified the content is replaced.
       * @return {Function} Container.setState
       */
      function update( $target, updateContent, method ){
        switch( method ){
          case 'append':
            self.appendContent( updateContent );
            break;
          case 'prepend':
            self.prependContent( updateContent );
            break;
          default:
            self.setContent( updateContent );
            break;
        }
      }

      /**
       * Returns the contents of the Container
       * @method getContent
       * @public
       * @return {Array} contents
       */
      self.getContent = function(){
        return content;
      };

      /**
       * Sets the content of the Container replacing current content
       * @method setContent
       * param {String} value The content to set.
       * @public
       * @return {Object} Container
       */
      self.setContent = function( value ){
        content = value;

        self.$target.html( content );

        if( settings.autoHeight ){
          delete this.cache.height;
          self.setHeight( this.getHeight() );
        }

        if( settings.autoWidth ){
          delete this.cache.width;
          self.setWidth( this.getWidth() );
        }

        self.trigger( constants.events.UPDATED, $element );
        return self;
      };

      /**
       * Appends content to the Container
       * @method appendContent
       * param {String} value The content to append.
       * @public
       * @return {Function} Container.setContent
       */
      self.appendContent = function( value ){
        self.setContent( content + value );
        return self;
      };

      /**
       * Prepend content to the Container
       * @method prepend Content
       * param {String} value The content to prepend.
       * @public
       * @return {Function} self.setContent
       */
      self.prependContent = function( value ){
        return self.setContent( value + content );
      };

      if( settings.url ){
        //Load content from url
        self.trigger( constants.events.LOAD );
      } else {
        //Store the $elements content
        content = $element.html();
      }

      //sets the height of the container automagically if autoHeight is set to true.
      if( settings.autoHeight ){
        this.setHeight( this.getHeight() );
      }

      //sets the width of the container automagically if autoHeight is set to true.
      if( settings.autoWidth ){
        self.setWidth( self.getWidth() );
      }

      // //Bind update event to update
      self.on( constants.events.UPDATE, function(event, content, method ) {
        event.stopPropagation();
        update( $( event.target ), content, method );
      });

      //Bind load event to load
      self.on( constants.events.LOAD, function(event, content, method ) {
        event.stopPropagation();
        //load( $(event.target), content, method );
        var things = [$(event.target)];
        if (content) {
          things.push(content);
        }
        if (method) {
          things.push(method);
        }
        load.apply(this, things);
      });
      
    },
    /**
     * Returns the computed height of the Container; result has no units
     * @method getHeight
     * @public
     * @return {Integer} Computed height of the Container (result drops units)
     */
    getHeight: function(){
      var height = this.cache.height,
          $target = this.$target;

      if( !height ){
        if( $target ){
          height = $target.height();
        } else {
          height = this.$element.height();
        }
        this.cache.height = height;
      }
      return height;
    },
    /**
     * Sets the height of the Container.
     * @method setHeight
     * @param {Integer} value The height in pixels to set
     * @public
     * @return {Object} Container
     */
    setHeight: function( value ){
      var $target = this.$target;

      this.cache.height = value;
      if( $target ){
        $target.height( value );
      } else {
        this.$element.height( value );
      }
      return this;
    },
    /**
     * Returns the computed width of the Container; result has no units
     * @method getHeight
     * @public
     * @return {Integer} Computed height of the Container (result drops units)
     */
    getWidth: function(){
      var width = this.cache.width,
          $target = this.$target;

      if( !width ) {
        if( $target ){
          width = $target.width();
        } else {
          width = this.$element.width();
        }
        this.cache.width = width;
      }
      return width;
    },
    /**
     * Sets the width of the Container
     * @method setWidth
     * @param {Integer} value The width in pixels to set
     * @public
     * @return {Object} Container
     */
    setWidth: function( value ){
      var $target = this.$target;

      this.cache.width = value;
      if( $target ){
        $target.width( value );
      } else {
        this.$element.width( value );
      }
      return this;
    }
  };
} );



//Export to Common JS Loader
if( typeof module !== 'undefined' ){
  if( typeof module.setExports === 'function' ){
    module.setExports( Container );
  } else if( module.exports ){
   module.exports = Container;
  }
}