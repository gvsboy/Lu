var id = 'ui:Button:Play',
  Class = li.require( 'libraries/ptclass' ),
  Abstract = li.require( 'ui/Abstract' ),
  Button = li.require( 'ui/Button' ),
  PlayButton;

/**
 * Representation of a button element
 * @class PlayButton
 * @constructor
 * @extends Abstract
 * @param {HTMLElement} element The HTML element surrounded by the control
 * @param {Object} settings Configuration properties for this instance
 */
PlayButton =  Class.create( {
  initialize: function ( $element, settings ){
    /**
     * Instance of PlayButton
     * @property PlayButton
     * @type Object
     */
    var PlayButton = this,
    /**
     * Default configuration values
     * @property defaults
     * @type Object
     */
    defaults = {
      action: 'play'
    };

    settings = _.extend( defaults, settings );

    return new Button( $element, settings );
  }
} );

if ( typeof module !== 'undefined' && module.exports ) {
  module.exports = PlayButton;
}

