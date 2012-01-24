var Class = require( 'class' ),
  Abstract;

/**
 * The base component class all other UI components inherit from.
 * @class Abstract
 * @constructor
 * @requires ptclass
 * @param {HTMLElement} element The HTML element surrounded by the control
 * @param {Object} settings Configuration properties for this instance
 */
Abstract = Class.create( ( function() {

  // GLOBAL STATICS

  // RETURN METHODS OBJECT
  return {
    /**
     * Class constructor
     * @method initialize
     * @public
     * @param {Object} $element JQuery object for DOM node wrapped by this component
     * @param {Object} settings Custom settings for this component
     */    
    initialize: function( $element, settings ) {

      // PRIVATE INSTANCE PROPERTIES

      /**
        * Instance of Abstract
        * @property Abstract
        * @type Object
        * @private
        */
      var Abstract = this,

        /**
         * Default configuration values
         * @property defaults
         * @private
         * @type {Object}
         */
        defaults = {

          /**
           * A selector that matches nodes to observe
           * @property observe
           * @type {String}
           */
          observe: '',

          /**
           * A selector that matches nodes to notify of events
           * @property notify
           * @type {String}
           */
          notify: ''
        },

        /**
         * A jQuery collection that is observed for events
         * @property $observe
         * @private
         * @type {Array}
         */
        $observe,

        /**
         * A jQuery collection that is notified of events
         * @property subscribe
         * @private
         * @type {Array}
         */
        $notify,

        /**
         * The namespace used in all event bindings
         * See http://docs.jquery.com/Namespaced_Events.
         * @property namespace
         * @private
         * @type {Object}
         */
        namespace;

      // MIX THE DEFAULTS INTO THE SETTINGS VALUES
      _.defaults( settings, defaults );


      // PRIVATE METHODS

      /**
       * Augments arguments
       * @method parameters
       * @private
       */
      function parameters() {
        var parameters = Array.prototype.slice.call( arguments );
        if( namespace ) {
          parameters[0] = parameters[0].split( ' ' );
          _.each( parameters[0], function( item, index ) {
            parameters[0][index] = item + '.' + namespace;
          } );
          parameters[0] = parameters[0].join( ' ' );
        }
        _.each( parameters, function( item, index ) {
          if( typeof item === 'function' ) {
            parameters[index] = function() {
              //Array.prototype.slice.call( arguments );
              //TODO: if propagation is stopped, and not detecting if the target is itself
              //if( !parameters[0].isPropagationStopped() ) {
                item.apply( $element, arguments );
              //}
            }
          }
        } );
        return parameters;
      }

      /**
       * Creates an event listener for a type
       * @method on
       * @private
       */
      function on() {
        return $element.on.apply( $element, parameters.apply( this, arguments ) );
      }

      /**
       * Creates an event listener for a type, fires exactly once.
       * @method one
       * @private
       */
      function one() {
        return $element.one.apply( $element, parameters.apply( this, arguments ) );
      }

      /**
       * Unbinds event listeners of a type
       * @method off
       * @private
       */
      function off() {
        return $element.off.apply( $element, parameters.apply( this, arguments ) );
      }

      /**
       * Fires a custom event 
       * @method trigger
       * @private
       */
      function trigger( event, parameters ) {
        $element.lu( 'notify', event, parameters );
        return $element.trigger.call( $element, event, parameters );
      }

      /**
       * Observe events from $observer
       * @method observe
       * @private
       * @param {Array} $observer A jQuery collection to be observed
       */
      function observe( $observer ) {
        $observer.lu( 'observe', $element );
      }

      $observe = $( settings.observe );
      $notify = $( settings.notify );

console.log( 'NOTIFY :: ', $notify );
      //Reverse Notification
      //$notify = $( settings.notify ).add( $element.lu( 'getDescendants' ) );

      namespace = settings.namespace;

      if( $observe.length ) {
        observe( $observe );
      }

      if( $notify.length ) {
        $element.lu( 'observe', $notify );
      }

      if( !namespace ) {
        namespace = $element.lu( 'getParent', function( index, item ) {
          var control = $( item ).lu( 'getControl' ),
            namespace;

          if( !control ) {
            return false;
          }

          namespace = control.getNamespace();

          if( namespace ) {
            return true;
          }

          return false;

        } );
        if( namespace.length > 0 ) {
          namespace = namespace.lu( 'getControl' ).getNamespace();
        }
      }

      // PRIVILEGED METHODS

      /**
       * Privileged accessor to on with logging
       * @method on
       * @public
       */
      Abstract.on = function() {
        $element.lu( 'console' ).log( 'on called with arguments :: ', arguments );
        return on.apply( $element, arguments );
      };

      /**
       * Privileged accessor to one with logging
       * @method on
       * @public
       */
      Abstract.one = function() {
        $element.lu( 'console' ).log( 'one called with arguments :: ', arguments );
        return one.apply( $element, arguments );
      };

       /**
        * Privileged accessor to off with logging
        * @method on
        * @public
        */
      Abstract.off = function() {
        $element.lu( 'console' ).log( 'off called with arguments :: ', arguments );
        return off.apply( $element, arguments );
      };

       /**
        * Privileged accessor to trigger with logging
        * @method on
        * @public
        */
      Abstract.trigger = function() {
        $element.lu( 'console' ).log( 'trigger called with arguments :: ', arguments );
        return trigger.apply( $element, arguments );
      };

      /**
       * Privileged accessor to observe with logging
       * @method on
       * @public
       */
      Abstract.observe = function( $observer ) {
        $element.lu( 'console' ).log( 'observe called with arguments :: ', arguments );
        return observe( $observer );
      };

      /**
       * Cease observation of events
       * @method unobserve
       * @public
       * @param {Array} $subscriber A jQuery collection to unsubscribe
       */
      Abstract.unobserve = function( $observer ) {
        $element.lu( 'console' ).log( 'unobserve called with arguments :: ', arguments );
        return $element.lu( 'unobserve', $observer );
      };

      /**
       * Gets the current namspace
       * @method getNamespace
       * @public
       * @return namespace
       */
      Abstract.getNamespace = function(){
        return namespace;
      };

      /**
       * Sets the namespace
       * @method setNamespace
       * @public
       * @param {String} value the new namespace
       * @return namespace
       */
      Abstract.setNamespace = function( value ){
        namespace = value;
        return namespace;
      };

    }
  };

}() ) );

//Export to Common JS Loader
if( module ) {
  if( typeof module.setExports === 'function' ){
    module.setExports( Abstract );
  } else if( module.exports ) {
    module.exports = Abstract; 
  }
}