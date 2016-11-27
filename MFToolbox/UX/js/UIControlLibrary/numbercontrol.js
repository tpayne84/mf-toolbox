( function( $, undefined ) {
	
	// mfiles.mfnumbercontrol
	$.widget("mfiles.mfnumbercontrol", {
	
		// options.
        options:
		{
			datatype: -1,
			propertydef: -1,
			editmode: false,
			readonly: false,
			showhelptext: false,
			highlightcolor: "transparent",
			requesteditmode: null
        },
		
		// _create.
        _create: function()
		{
			var self = this;
			var element = this.element;
			this._isEmpty = true;
			
			// Store original content and clear this element.
			var originalContent = element.html();
			element.data( 'originalContent', originalContent );
			element.html('');
					
			// Append container for controls.
			var container = $('<div class="mf-internal-container" style="width:100%"></div>');
			element.append( container );
			element.data( 'container', container );
			
			element.data( "Value", null );
			
			// Get localization strings.
			this.invalidNumberText = localization.getText( "NumberControl-InvalidNumber" );
			this.invalidIntegerText = localization.getText( "NumberControl-InvalidInteger" );
			this.invalidFloatingText = localization.getText( "NumberControl-InvalidFloating" );
			
			// Create actual control. In case of new object with empty properties, we show helptext here.
			this._createControl( container, this.options.showhelptext );
			
			// Bind to click event to set the control to edit mode when user clicks it.
			element.click( function( event ) {
				if ( !self.options.editmode )
					self.options.requesteditmode( self );
				event.stopPropagation();
			} );
			
			// Bind to custom stopEditing event sent by metadata card.
			element.bind('stopEditing', function( event ) {
				if ( self.options.editmode )
					self.setToNormalMode();
			});
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
			var element = this.element;
		
			// Unbind events.
			this.element.unbind('click');
			this.element.unbind('stopEditing');
		
			// Remove Container and its childs. Unbinds also all events.
			element.data( 'container' ).remove();
			
			// In jQuery UI 1.8, you must invoke the destroy method from the base widget.
			$.Widget.prototype.destroy.call( this );
			// In jQuery UI 1.9 and above, you would define _destroy instead of destroy and not call the base method.
		},
		
		// _createControl.
        _createControl: function ( container, showHelpText )
		{
			var self = this;
			var element = this.element;
			
			// Remove all contents and unbind events.
			container.find(".dummy").remove();
			container.find(".mf-internal-text").remove();
			
			// Create text field.
			var textFieldControl = '';
			if ( this.options.editmode == true )
				textFieldControl = $( '<div class="dummy"><input class="mf-internal-text" type="text" style="width:99%" /></div>' );	
			else
			{
				var text = "";
				if ( showHelpText == true )
				{
					// Get help text from original HTML content.
					var originalContent = element.data( 'originalContent' );
					if ( originalContent )
						text = originalContent + "&nbsp;";
				}
				textFieldControl = $( '<div class="mf-internal-text">'+ text +'</div>' );
			
				// Hover-effects.
				if ( !this.options.readonly )
				{
					textFieldControl.hover(
						function() {
							textFieldControl.css('background-color', self.options.highlightcolor ); 
						},
						function() {
							textFieldControl.css('background-color', "transparent");
						}
					);
				}
			}
			container.append( textFieldControl );
			return this;			
        },

		
		// setToNormalMode.
		setToNormalMode: function()
		{
			var self = this;
			var element = this.element;
			
			// Get current text.
			var value = null;
			var text = self.controlText();
			
			// Text field is not empty, validate its content.
			if ( text && text.length > 0 )
			{
				// Validate the text and convert it to integer or float.
				// If conversion succeeds, _validateNumber stores the converted value so that it is available using controlValue function.
				var validatedText = this._validateNumber( text );
				if ( !validatedText )
					return;
					
				// Get validated text and value.	
				value = this.controlValue();
				//if ( element.hasClass('mf-integer') || element.hasClass('mf-floating') )
					text = validatedText;
				//else
				//	throw "Internal error. Number control without mf-integer or mf-floating class.";
			}
			
			// Re-create the control in edit mode and bind it again to original property.
			this.options.editmode = false;	
			var container = element.data( 'container' );			
			self._createControl( container, false );
			
			element.data( 'Value', value );
			if ( text )
			{
				element.find(".mf-internal-text").first().html( text );
				this._isEmpty = false;
			}
			else
			{
				// In case of empty text restore original content inside text control.
				// Add non-breaking whitespace to ensure that there is place to click to set control to edit mode if original content is empty. 
				var originalContent = element.data( 'originalContent' );
				element.find(".mf-internal-text").first().html( originalContent + "&nbsp;" );
				this._isEmpty = true;
			}
			
			// Inform metadatacard about state change.
			element.closest('.mf-metadatacard').trigger('onStateChanged');
		},
		
		setToEditMode: function()
		{
			var self = this;
			setTimeout( function() {
				self.setToEditMode2();
			}, 1 );
		},
	
		// setToEditMode2.
		setToEditMode2: function()
		{
			if ( this.options.readonly )
				return;
	
			var self = this;
			var element = this.element;
	
			// Get current text and data.
			var text = '';
			var value = self.controlValue();
			if ( value != null )
			{
				if ( element.hasClass('mf-floating') )
					text = this._floatValueToText( value, true );
				else
					text = value.toString();
			}
			
			var textField = element.find(".mf-internal-text").first();
				
			// Re-create the control in edit mode..
			self.options.editmode = true;	
			
			var container = element.data( 'container' );			
			self._createControl( container, false );
			
			var textField2 = element.find(".mf-internal-text").first();
			
			// Set value.
			textField2.val( text );
						
			// Inform metadatacard about state change.
			element.closest('.mf-metadatacard').trigger('onStateChanged');
				
			// Start delayed focus change.					
			this.setFocus();
		},
  
		// updateControlFromProperties.
		updateControlFromProperties: function( propertyValues )
		{
			var self = this;	
			var element = this.element;
			var propertyDef = this.options.propertydef;
			
			// Initial values.
			this._isEmpty = true;
			element.data( "Value", null );
			
			try {
				var propertyValue = propertyValues.SearchForProperty( propertyDef );
				if ( propertyValue === null ) {
					throw exeption("");
					return;
				}
				
				var typedValue = propertyValue.Value;
				if ( typedValue.IsNULL() || typedValue.IsUninitialized() )
				{
					// In case of empty text restore original content inside text control.
					// Add non-breaking whitespace to ensure that there is place to click to set control to edit mode if original content is empty.
					// TODO: Is there possibility that we are in edit mode when updateControlFromProperties is called?????? If not, remove unnecessary code.
					var originalContent = element.data( 'originalContent' );
					if ( self.options.editmode == false )
						element.find(".mf-internal-text").first().html( originalContent + "&nbsp;" );
					else
						element.find(".mf-internal-text").first().val( originalContent + "&nbsp;" );
					return;
				}
				
				var value = typedValue.Value;
				element.data( 'Value', value );
				
				
				if ( element.hasClass('mf-integer') )
					text = value;
				else if ( element.hasClass('mf-floating') )
					text = self._floatValueToText( value, false );
				else
					throw "Internal error. Number control without mf-integer or mf-floating class.";
				
				if ( self.options.editmode == false )
					element.find(".mf-internal-text").first().html( text );
				else
					element.find(".mf-internal-text").first().val( text );
					
				this._isEmpty = false;	
			}
			catch ( ex )
			{
				// All properties are not always available. This exception occurs, if requested property does not exist.
				
				// In case of empty text restore original content inside text control.
				// Add non-breaking whitespace to ensure that there is place to click to set control to edit mode if original content is empty.
				// TODO: Is there possibility that we are in edit mode when updateControlFromProperties is called?????? If not, remove unnecessary code.
				var originalContent = element.data( 'originalContent' );
				if ( self.options.editmode == false )
					element.find(".mf-internal-text").first().html( originalContent + "&nbsp;" );
				else
					element.find(".mf-internal-text").first().val( originalContent + "&nbsp;" );
			}
		},
	
		// controlText
		controlText: function()
		{
			var element = this.element;
			if ( this.options.editmode == false )
				return element.find(".mf-internal-text").first().html();
			else
				return element.find(".mf-internal-text").first().val();		
		},
	
		// controlValue
		controlValue: function()
		{
			return this.element.data( 'Value' );
		},
		
		// controlPropertyValue
		controlPropertyValue: function()
		{
			var propertyValue = MFiles.CreateInstance( "PropertyValue" );		
			propertyValue.PropertyDef = this.options.propertydef;
			
			if ( this.isEmpty() )
				propertyValue.TypedValue.SetValueToNULL( this.options.datatype );
			else if ( this.options.datatype === MFDatatypeInteger )
				propertyValue.TypedValue.SetValue( MFDatatypeInteger, this.controlValue() );
			else if ( this.options.datatype === MFDatatypeFloating )
			{
				var value = this.controlValue();
				// TODO: Check this. Seems weird.
				propertyValue.TypedValue.SetValue( MFDatatypeFloating, value.toString().replace( '.', ',' ) );
			}
			return propertyValue;
		},
		
		// isEmpty.
		isEmpty: function()
		{
			return this._isEmpty;
		},
		
		// inEditMode.
		inEditMode: function()
		{
			return this.options.editmode;
		},
		
		// _validateNumber
		//
		// This function validates and converts text string which represents integer or floating point number
		// to actual number and stores it.
		//
		_validateNumber: function( text )
		{
			var self = this;
			var value = null;
			var validatedText = null;
			
			// Additional checks for number datatypes.
			if ( this.options.datatype == MFDatatypeInteger )
			{
				// Convert to integer.
				var intValue = parseInt( text, 10 );
				
				// Validate result.
				if ( isNaN( intValue ) || text != intValue )
				{
					// Inform user about invalid number.
					utilities.showMessage( self, self.invalidNumberText + "<br/>" + self.invalidIntegerText );
					return null;
				}
				// Ensure that integer value don't go out of bounds (M-Files accepts only 32-bit integers).
				var maxInt = Math.pow( 2, 31 ) - 1;
				var minInt = - Math.pow( 2, 31 );
				intValue = Math.min( intValue, maxInt );
				intValue = Math.max( intValue, minInt );
				
				value = intValue;
				validatedText = intValue.toString();
			}	
			else if ( this.options.datatype == MFDatatypeFloating )
			{
				var floatValue = null;
				try
				{
					var propertyValue = MFiles.CreateInstance( "PropertyValue" );		
					propertyValue.PropertyDef = this.options.propertydef;
					propertyValue.TypedValue.SetValue( this.options.datatype, text );
					
					floatValue = propertyValue.TypedValue.Value;
				}
				catch ( ex ) 
				{
					// Conversion failed, we don't set floatValue.
				}
			
				if ( floatValue == null )
				{
					// Inform user about invalid number.
					utilities.showMessage( self, self.invalidNumberText + "<br/>" + self.invalidFloatingText );
					return null;
				}
			
				value = floatValue;
				validatedText = propertyValue.TypedValue.GetValueAsLocalizedText();
			}				
			else
				throw "Datatype is not valid: " + this.options.datatype;
			
			// Store value.
			this.element.data( 'Value', value );
				
			// Return text.	
			return validatedText;
		},
		
		// _floatValueToText
		_floatValueToText: function( value, longFormat )
		{
			var text = null;
			//if ( longFormat )
			//{
			//	text = value.toString();
			//}
			//else
			{
				var propertyValue = MFiles.CreateInstance( "PropertyValue" );		
				propertyValue.PropertyDef = this.options.propertydef;
				propertyValue.TypedValue.SetValue( this.options.datatype, value );
				text = propertyValue.TypedValue.GetValueAsLocalizedText();
			}
			return text;
		},
		
		// cancelAdding
		cancelAdding: function()
		{
			var textField = this.element.find(".mf-internal-text").first();
			setTimeout( function() {
				textField.focus();
				textField.select();
			}, 0 );
		},

		// setFocus
		setFocus: function()
		{
			var self = this;
			setTimeout( function() {
				self.delayedSetFocus();
			}, 1 );
		},
	
		// delayedFocusMove
		delayedSetFocus: function()
		{
			this.element.find(".mf-internal-text").first().focus();
		},
				
    });  // end of mfnumbercontrol widget.
	
})( jQuery );