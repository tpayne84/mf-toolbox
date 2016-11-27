( function( $, undefined ) {
	
	/*!
	Implementation of mfbooleancontrol UI control.
	This control provides the ability to show and edit the value of boolean property, when attached to HTML tag with "mf-control mf-boolean" class.
	*/
	$.widget("mfiles.mfbooleancontrol", {
	
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
        _create: function ()
		{
			var self = this;
			var element = this.element;
			
			// Store original content and clear this element.
			var originalContent = element.html();
			element.data( 'originalContent', originalContent );
			element.html('');
			
			// Append container for controls.
			var container = $('<div class="mf-internal-container" style="width:100%; display:table"></div>');
			element.append( container );
			element.data( 'container', container );
			
			// Get localization strings.
			this.trueText = localization.getText( "BooleanControl-True" );
			this.falseText = localization.getText( "BooleanControl-False" );
			this.notItemText = localization.getText( "BooleanControl-NotItem" );
			
			// Create actual control.
			this._createControl( container, this.options.showhelptext );
			element.data( 'Value', null );
			
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
			} );
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
			
			// In jQuery UI 1.8, you must invoke the destroy method from the base widget
			$.Widget.prototype.destroy.call( this );
			// In jQuery UI 1.9 and above, you would define _destroy instead of destroy and not call the base method
		},
		
		// _createControl.
        _createControl: function ( container, showHelpText )
		{	
			var self = this;
			var element = this.element;
			
			// Remove all contents and unbind events.
			container.find(".mf-internal-text").remove();
			container.find(".mf-internal-openlink").remove();
			
			// Create text field.
			var textFieldControl = '';
			if ( this.options.editmode == true )
			{
				// Input field is used in edit mode.
				textFieldControl = $( '<input class="mf-internal-text" type="text" style="display:table-cell; width:100%" value="" />' );							
			
				// Attach autocomplete-control to input field to show dropdown list.
				var items = [ self.trueText, self.falseText ];			
				textFieldControl.autocomplete( {
					delay: 0,
					minLength: 0,
					autoFocus: true,
					source: items,
					select: function () {
						// Select the text in input field when selection in dropdown list changes. 
						self._setSelection( textFieldControl );				
					}
				} );
				
				// Select the text in input field when user clicks it.
				textFieldControl.bind('click', function() {
					self._setSelection( textFieldControl );	
				} );
				
				// Append input field to container element.
				container.append( textFieldControl );
				
				// Image to open dropdown list.
				var openLink = $('<img src="UIControlLibrary/ArrowDown.png" class="mf-internal-openlink" style="display:table-cell" />')
					.click( function() {
						self._openList();
					} );
				container.append( openLink );
			}
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
				// Plain text is used in view mode.
				textFieldControl = $( '<div class="mf-internal-text">' + text + '</div>' );
			
				// Add hover-effects to text.
				if ( !this.options.readonly )
				{
					textFieldControl.hover(
						function() {
							textFieldControl.css( 'background-color', self.options.highlightcolor ); 
						},
						function() {
							textFieldControl.css( 'background-color', "transparent");
						}
					);
				}
				// Append text element to container.
				container.append( textFieldControl );
			}
			return this;			
        },

		
		// setToNormalMode.
		setToNormalMode: function()
		{
			var self = this;
			var element = this.element;
			
			// Get text from input field.
			var text = element.find(".mf-internal-text").first().val();
			var value = null;
			
			// Try to convert text to boolean value. In case of failure, return focus back to input field.
			if ( text && text.length > 0 )
			{
				value = this._convertTextToValue( text );
				if ( value == null )
				{
					// Inform user about invalid text.
					utilities.showMessage( self, self.notItemText );
				
					//var textFieldControl = element.find(".mf-internal-text").first();
					//self._setSelection( textFieldControl );
					return;
				}
			}
				
			// Re-create the control in edit mode and bind it again to original property.
			this.options.editmode = false;	
			var container = element.data( 'container' );			
			self._createControl( container, false );
			
			// Set value and text.
			element.data( 'Value', value );
			if ( text )
				element.find(".mf-internal-text").first().html( text );
			else
			{
				// In case of empty text restore original content inside text control.
				// Add non-breaking whitespace to ensure that there is place to click to set control to edit mode if original content is empty. 
				var originalContent = element.data( 'originalContent' );
				element.find(".mf-internal-text").first().html( originalContent + "&nbsp;" );
			}
			
			// Inform metadatacard about state change.
			element.closest('.mf-metadatacard').trigger('onStateChanged');
		},
	
		// setToEditMode
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
	
			// Get current text and value.
			var value = this.controlValue();
			var text = this._convertValueToText( value );
			
			// Re-create the control in edit mode.
			this.options.editmode = true;
			var element = this.element;
			var container = element.data( 'container' );			
			this._createControl( container, false );
			
			// Set text and value for recreated control.
			var textField = element.find(".mf-internal-text").first();
			textField.val( text );	
			element.data( 'Value', value );
						
			// Inform metadatacard about state change.
			element.closest('.mf-metadatacard').trigger('onStateChanged');
				
			// Set focus to input field and select text.
			this._setSelection( textField );
		},
  
		// updateControlFromProperties
		updateControlFromProperties: function( propertyValues )
		{
			var self = this;	
			var element = this.element;
			var propertyDef = this.options.propertydef;
			
			// Initial value.
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
				var text = this._convertValueToText( value ); 
				element.data( 'Value', value );
			
				if ( self.options.editmode == true )
					element.find(".mf-internal-text").first().val( text );
				else
					element.find(".mf-internal-text").first().html( text );	
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
				propertyValue.TypedValue.SetValueToNULL( MFDatatypeBoolean );
			else
				propertyValue.TypedValue.SetValue( MFDatatypeBoolean, this.controlValue() );
			return propertyValue;
		},
	
		// isEmpty.
		isEmpty: function()
		{
			return ( this.element.data( 'Value' ) == null );
		},
		
		// inEditMode.
		inEditMode: function()
		{
			return this.options.editmode;
		},
		
		// _openList
		_openList: function()
		{
			// Start search with empty string.
			this.element.find(".mf-internal-text").first().autocomplete( 'search' , '' );
		},

		// _setSelection
		_setSelection: function( element )
		{
			setTimeout( function() {
				element.focus();
				element.select();
			}, 0 );
		},
		
		// _convertValueToText
		_convertValueToText: function ( value )
		{
			return ( value == null ) ? "" : ( value == true ) ? this.trueText : this.falseText;
		},
		
		// _convertTextToValue
		_convertTextToValue: function ( text )
		{
			// Compare given text to both strings that represent true and false values.
			// If comparison fails, return null.		
			var value = null;
			if ( text.toLowerCase() == this.trueText.toLowerCase() )
				value = true;
			else if ( text.toLowerCase() == this.falseText.toLowerCase() )
				value = false;
			return value;
		},
		
		// cancelAdding
		cancelAdding: function()
		{
			// Set focus back to input field of this control and select the text.
			var textField = this.element.find(".mf-internal-text").first();
			textField.focus();
			textField.select();
		},
				
    } );  // end of mfbooleancontrol widget.
	
} )( jQuery );