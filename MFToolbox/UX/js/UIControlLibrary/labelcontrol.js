( function( $, undefined ) {

	/*!
	Implementation of mflabelcontrol UI control.
	This control shown a name of given property, when attached to HTML tag with "mf-control mf-label" class.
	*/
	$.widget( "mfiles.mflabelcontrol", {
	
		// options.
        options:
		{
			propertydef: -1,
        },
		
		// _create.
        _create: function ()
		{
			// Set property name.
			this.element.html( vaultOperations.propertyName( this.options.propertydef ) );
		},
		
		// Use the _setOption method to respond to changes to options.
		_setOption: function( key, value )
		{
			// In jQuery UI 1.8, you have to manually invoke the _setOption method from the base widget
			$.Widget.prototype._setOption.apply( this, arguments );
			// In jQuery UI 1.9 and above, you use the _super method instead
			this._super( "_setOption", key, value );
		},
		
		// Use the destroy method to clean up any modifications your widget has made to the DOM.
		destroy: function()
		{
			// Note: there is no need to restore original content, because it should be empty <span>-tag for mf-label class.
			
			// In jQuery UI 1.8, you must invoke the destroy method from the base widget
			$.Widget.prototype.destroy.call( this );
			// In jQuery UI 1.9 and above, you would define _destroy instead of destroy and not call the base method
		},
				
    } );  // end of mflabelcontrol widget.
	
} )( jQuery );