var positionAbove = function () {
  
  /**
   * The cached position of the tip
   * @property position
   * @type Object
   * @private
   */
  var position;
  
  
  return function( instance ){

    /**
     * Used to determine the position of the tip
     * @private
     * @method getPosition
     * @param {Boolean} cache Uses the cached position by default or if set to true.
     * @return {Object} position And object containing a top and left
     */
    instance.getPosition = function ( cache, settings ){
      var elOffset = instance.$element.offset(),
        elHeight = instance.$element.height(),
        elWidth = instance.$element.width();

      if( !position || !cache){
        position = {
          top: elOffset.top - instance.$tip.height() - settings.offsetTop,
          left: elOffset.left + elWidth / 2 - instance.$tip.width() / 2 - settings.offsetLeft
        };
      }
      
      return position;
    };

  };
};

//Export to Common JS Loader
if( typeof module !== 'undefined' ){
  if( typeof module.setExports === 'function' ){
    module.setExports( positionAbove() );
  } else if( module.exports ){
   module.exports = positionAbove();
  }
}