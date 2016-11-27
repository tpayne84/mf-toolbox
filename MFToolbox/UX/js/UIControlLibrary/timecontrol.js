( function( $, undefined ) {
	
	// mfiles.mftimecontrol
	$.widget("mfiles.mftimecontrol", {
	
		// options.
        options: {
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
			element.data( 'Value', null );
			
			// Store original content and clear this element.
			var originalContent = element.html();
			element.data( 'originalContent', originalContent );
			element.html('');
			
			// Append container for controls.
			var container = $('<div class="mf-internal-container" style="width:100%;"></div>');
			element.append( container );
			element.data( 'container', container );
			
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
			
			// In jQuery UI 1.8, you must invoke the destroy method from the base widget
			$.Widget.prototype.destroy.call( this );
			// In jQuery UI 1.9 and above, you would define _destroy instead of destroy and not call the base method
		},
		
		// _createControl.
        _createControl: function ( container, showHelpText )
		{	
			// Assert.
			if ( showHelpText && this.options.editmode )
				throw "ASSERT: FirstTime == true && editmode == true";
		
			var self = this;
			var element = this.element;
			
			// Remove all contents and unbind events.
			container.find(".mf-internal-text").timeEntry('destroy');
			container.find(".mf-internal-text").remove();
			container.find(".mf-internal-openlink").remove();
			
			//container.find(".dummy").remove();
			
			
			// Create text field.
			var textFieldControl = '';
			if ( this.options.editmode == true )
			{
				textFieldControl = $( '<input class="mf-internal-text" type="text" style="display:table-cell; width:100%" value=""/>' );								
				//textFieldControl = $( '<div class="dummy" style="display:table-cell; width:100%"><input class="mf-internal-text" type="text" style="width:99%" value=""/></div>' );								
				
				
				container.append( textFieldControl );
				
				var date = element.data( 'Value' );
				var timeInfo = localization.getTimeInfo();
				
				textFieldControl.timeEntry( {
					show24Hours: timeInfo.show24Hours,
					showSeconds: timeInfo.showSeconds,
					separator: timeInfo.separator,
					ampmPrefix: timeInfo.ampmPrefix,
					ampmNames: timeInfo.ampmNames,
					defaultTime: date,
					spinnerImage: '',					
					beforeSetTime: function( oldTime, newTime, minTime, maxTime ) {
						// Note: This callback is not called if user uses 'paste' to input the text.
						// Set new time.
						element.data( 'Value', newTime );
						return newTime;
					}
				} );
				
				//$.timeEntry.setDefaults( $.timeEntry.regional[''] );				
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
				textFieldControl = $( '<div class="mf-internal-text" style="display:table-cell; width:100%">'+ text +'</div>' );
			
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
				container.append( textFieldControl );
			}
			return this;			
        },

		
		// setToNormalMode.
		setToNormalMode: function()
		{
			var self = this;
			var element = this.element;
			
			var text = element.find(".mf-internal-text").first().val();
			var value = element.data( 'Value' );
			
			// Validate entered value.
			if ( text == null || text.length == 0 )
			{
				// Text field is empty, clear the stored date value.
				value = null;
			}
			else if ( value == null )
				text = "";
			
			// Re-create the control in edit mode and bind it again to original property.
			this.options.editmode = false;	
			var container = element.data( 'container' );			
			self._createControl( container, false );
			
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
			var value = element.data( 'Value' );
			
			var textField = element.find(".mf-internal-text").first();
			var text = element.find(".mf-internal-text").first().html();
			
			// Get existing style.
			/*
			var fontSize = textField.css( 'font-size' );
			var fontFamily = textField.css( 'font-family' );
			var fontStyle = textField.css( 'font-style' );
			var fontWeight = textField.css( 'font-weight' );
			var lineHeight = textField.css( 'line-height' );
			var letterSpacing = textField.css( 'letter-spacing' );
			var color = textField.css( 'color' );
			var paddingLeft = textField.css( 'padding-left' );
			var paddingRight = textField.css( 'padding-right' );
			var marginLeft = textField.css( 'margin-left' );
			var marginRight = textField.css( 'margin-right' );
			*/
				
			// Re-create the control in edit mode..
			self.options.editmode = true;	
			
			var container = element.data( 'container' );			
			self._createControl( container, false );
			
			var textField2 = element.find(".mf-internal-text").first();
			
			// Set style and value.
			/*
			textField2.css( 'font-size', fontSize )
				.css( 'font-family', fontFamily )
				.css( 'font-style', fontStyle )
				.css( 'font-weight', fontWeight )
				.css( 'line-height', lineHeight )
				.css( 'letter-spacing', letterSpacing )
				.css( 'color', color )
				.css( 'padding-left', paddingLeft )
				.css( 'padding-right', paddingRight )
				.css( 'margin-left', marginLeft )
				.css( 'margin-right', marginRight );
				*/
				
			textField2.val( text );
								
			element.data( 'Value', value );
						
			// Inform metadatacard about state change.
			element.closest('.mf-metadatacard').trigger('onStateChanged');
				
			// Start delayed focus change.					
			this.setFocus();
		},
  
		// updateControlFromProperties
		updateControlFromProperties: function( propertyValues )
		{
			var self = this;	
			var element = this.element;
			var propertyDef = this.options.propertydef;
			
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
				
				// Convert M-Files time to JavaScript time.
				var date = new Date( Date.parse( typedValue.Value ) );
				
				// Store converted time and set it to text field.
				element.data( "Value", date );
				
				// Convert to showable format:
				var time = self._convertToShowable( date );
				
				if ( self.options.editmode == true )
					element.find(".mf-internal-text").first().val( time );
				else
					element.find(".mf-internal-text").first().html( time );	
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
		
		// controlValue
		controlValue: function()
		{
			var value = this.element.data( "Value" );
			if ( value != null )
				return value.getVarDate();
			return null;
		},
		
		// controlPropertyValue
		controlPropertyValue: function()
		{
			var propertyValue = MFiles.CreateInstance( "PropertyValue" );		
			propertyValue.PropertyDef = this.options.propertydef;
			
			if ( this.isEmpty() )
				propertyValue.TypedValue.SetValueToNULL( MFDatatypeTime );
			else
				propertyValue.TypedValue.SetValue( MFDatatypeTime, this.controlValue() );		
			return propertyValue;
		},
		
		// isEmpty.
		isEmpty: function()
		{
			return ( this.element.data( "Value" ) == null ) ? true :  false;
		},
		
		// inEditMode.
		inEditMode: function()
		{
			return this.options.editmode;
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
		
		// _convertToShowable
		_convertToShowable: function( date )
		{
			// FIXME: This doesn't handle 12-hour format correctly.
			var hours = date.getHours();
			var minutes = date.getMinutes();
			var seconds = date.getSeconds();
			return ( hours < 10 ? '0' : '' ) + hours + ":" + ( minutes < 10 ? '0' : '' ) + minutes + ":" + ( seconds < 10 ? '0' : '' ) + seconds;
		}
				
    } );  // end of textcontrol widget.
	
} )( jQuery );