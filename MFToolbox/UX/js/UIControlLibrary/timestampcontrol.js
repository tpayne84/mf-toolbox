( function( $, undefined ) {

	// mfiles.mftimestampcontrol
	$.widget("mfiles.mftimestampcontrol", {
	
		// options.
        options:
		{
			propertydef: -1,
        },
		
		// _create.
        _create: function ()
		{
			this.element.html("");
		},
		
		// Use the _setOption method to respond to changes to options.
		_setOption: function( key, value )
		{
			switch( key ) {
			case "editmode":
				// handle changes to options
				break;
			}
			// In jQuery UI 1.8, you have to manually invoke the _setOption method from the base widget
			$.Widget.prototype._setOption.apply( this, arguments );
			// In jQuery UI 1.9 and above, you use the _super method instead
			this._super( "_setOption", key, value );
		},
		
		// Use the destroy method to clean up any modifications your widget has made to the DOM.
		destroy: function()
		{
			// In jQuery UI 1.8, you must invoke the destroy method from the base widget.
			$.Widget.prototype.destroy.call( this );
			// In jQuery UI 1.9 and above, you would define _destroy instead of destroy and not call the base method.
		},
		
  
		// updateControlFromProperties
		updateControlFromProperties: function( propertyValues )
		{
			var self = this;	
			var element = this.element;
			var propertyDef = this.options.propertydef;
			
			try {
				var propertyValue = propertyValues.SearchForProperty( propertyDef );
				if ( propertyValue === null ) {
					throw exeption("");
					return;
				}
				
				var typedValue = propertyValue.Value;
				if ( typedValue.IsNULL() || typedValue.IsUninitialized() )
				{
					return;
				}
				element.html( propertyValue.GetValueAsLocalizedText() );
			}
			catch ( ex )
			{
			}
		}
				
    });  // end of mftimestampcontrol widget.
	
})( jQuery );