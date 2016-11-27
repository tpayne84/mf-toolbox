( function( $, undefined ) {
	
	// Map for controls.
	//
	// Each supported MFDataType datatype is mapped to name of UI control, which provides implementation for datatype.  
	uiControls = {
		1: 'mftextcontrol',               // MFDatatypeText
		2: 'mfnumbercontrol',             // MFDatatypeInteger
		3: 'mfnumbercontrol',             // MFDatatypeFloating
		5: 'mfdatecontrol',               // MFDatatypeDate                    
		6: 'mftimecontrol',               // MFDatatypeTime
		7: 'mftimestampcontrol', 		  // MFDatatypeTimestamp		
		8: 'mfbooleancontrol',            // MFDatatypeBoolean
		9: 'mfmultiselectlookupcontrol',  // MFDatatypeLookup
		10: 'mfmultiselectlookupcontrol', // MFDatatypeMultiSelectLookup   
		13: 'mftextcontrol'               // MFDatatypeMultiLineText
	}
	
	// ui.basecontrol
	$.widget( "ui.basecontrol", {
	
		// options.
        options: {
			islabel: false,
			istimestamp: false,
			datatype: -1,
			propertydef: -1,
			valuelist: -1,
			readonly: false,
			showhelptext: false,
			usedefaultvalue: false,
			highlightcolor: "transparent",
			requesteditmode: null
        },
		
		// _create.
        _create: function ()
		{
			if ( this.options.islabel )
			{
				this.element.mflabelcontrol( {
					propertydef: this.options.propertydef
				} );
				return;
			}
			else if ( this.options.istimestamp )
			{
				this.element.mftimestampcontrol( {
					propertydef: this.options.propertydef
				} );
				return;
			}
			this.propertyName = null;
			
			if ( !uiControls.hasOwnProperty( this.options.datatype ) )
				throw "Datatype is not supported: " + this.options.datatype;
			
			// call corresponding constructor to create actual ui control and attach it to same element.
			this.element[ uiControls[ this.options.datatype ] ]( {
				datatype: this.options.datatype,
				propertydef: this.options.propertydef,			
				valuelist: this.options.valuelist,
				editmode: false,
				showhelptext: this.options.showhelptext,
				readonly: this.options.readonly,
				highlightcolor: this.options.highlightcolor,
				requesteditmode: this.options.requesteditmode
			} );
		},
		
		// Use the _setOption method to respond to changes to options.
		_setOption: function( key, value )
		{
		/*
			switch( key ) {
			case "datatype":
			case "valuelistid":
			case "propertydef":
				// handle changes to options
				break;
			}
		*/
			// In jQuery UI 1.8, you have to manually invoke the _setOption method from the base widget
			$.Widget.prototype._setOption.apply( this, arguments );
			// In jQuery UI 1.9 and above, you use the _super method instead
			//this._super( "_setOption", key, value );
		},
		
		// Use the destroy method to clean up any modifications your widget has made to the DOM.
		destroy: function()
		{
			// In jQuery UI 1.8, you must invoke the destroy method from the base widget
			$.Widget.prototype.destroy.call( this );
			// In jQuery UI 1.9 and above, you would define _destroy instead of destroy and not call the base method
		},
		
		// getPropertyName.
		getPropertyName: function()
		{
			if ( this.propertyName === null )
				this.propertyName = vaultOperations.propertyName( this.options.propertydef );	
			return this.propertyName;
		},

		// setToNormalMode.
		setToNormalMode: function()
		{
			if ( !this.options.islabel && !this.options.istimestamp )
				this.element[ uiControls[ this.options.datatype ] ]( "setToNormalMode" );	
		},
	
		// updateControlFromProperties
		updateControlFromProperties: function( propertyValues )
		{
			if ( !this.options.islabel )
			{
				// Update single control using data from propertyValues.
				// Note that this is not called in case of label, but is called in case of timestamp control. 
				this.element[ uiControls[ this.options.datatype ] ]( "updateControlFromProperties", propertyValues );
			}
		},
	
		// controlValue.
		controlValue: function( getNewValue )
		{
			return ( this.options.islabel || this.options.istimestamp ) ? null : this.element[ uiControls[ this.options.datatype ] ]( "controlPropertyValue", getNewValue );
		},
		
		// isReadOnlyControl
		isReadOnlyControl: function()
		{
			return this.options.islabel || this.options.istimestamp;
		},
		
		// isEmpty
		isEmpty: function()
		{
			return ( this.options.islabel || this.options.istimestamp ) ? true : this.element[ uiControls[ this.options.datatype ] ]( "isEmpty" );
		},
		
		// inEditMode
		inEditMode: function()
		{
			return ( this.options.islabel || this.options.istimestamp ) ? false : this.element[ uiControls[ this.options.datatype ] ]( "inEditMode" );
		},
	
		// controlPropertyValue
		controlPropertyValue: function( getNewValue )
		{
			// FIXME: There should be valid return value for timestamp.
			if ( this.options.islabel || this.options.istimestamp )
				return null;
				
			if ( !uiControls.hasOwnProperty( this.options.datatype ) )
				throw "Datatype is not supported: " + this.options.datatype;
		
			return this.controlValue( getNewValue );
		}
					
    } );  // end of basecontrol widget.
	
} )( jQuery );
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
	
} )( jQuery );( function( $, undefined ) {
	
	// mfiles.mfdatecontrol
	$.widget("mfiles.mfdatecontrol", {
	
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
			
			// Get dateFormat.
			this.dateFormat = localization.getDateFormat();

			element.data( 'Value', null );
			
			// Store original content and clear this element.
			var originalContent = element.html();
			element.data( 'originalContent', originalContent );
			element.html('');
			
			// Append container for controls.
			var container = $('<div class="mf-internal-container" style="width:100%; display:table"></div>');
			element.append( container );
			element.data( 'container', container );
			
			// Get localization strings.
			this.invalidDateText = localization.getText( "DateControl-InvalidDate" );
			this.invalidDate2Text = localization.getText( "DateControl-InvalidDate2" );
			this.previousText = localization.getText( "Previous" );
			this.nextText = localization.getText( "Next" );
			this.dayNamesMin = localization.getDayNamesMin();
			this.dayNames = localization.getDayNames();
			this.monthNames = localization.getMonthNames();
			
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
			container.find(".mf-internal-text").remove();
			container.find(".mf-internal-openlink").remove();
			
			// Create text field.
			var textFieldControl = '';
			if ( this.options.editmode == true )
			{
				textFieldControl = $( '<input class="mf-internal-text" type="text" style="display:table-cell; width:100%" value=""/>' );								
				container.append( textFieldControl );			
				var date = element.data( 'Value' );
			
				textFieldControl.datepicker( {
					dateFormat: this.dateFormat,
					prevText: this.previousText,
					nextText: this.nextText,
					defaultDate: date,
					dayNamesMin: this.dayNamesMin,
					dayNames: this.dayNames,
					monthNames: this.monthNames,
					onSelect: function( dateText, inst ) {
						var date = textFieldControl.datepicker("getDate");
						element.data( 'Value', date );
					},
					
				} );
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
			else
			{
				// Text field has value, validate it by trying to convert it to Date datatype.
				var d = null;
				try {
					d = $.datepicker.parseDate( self.dateFormat, text );
				}
				catch ( ex) { }
			
				if ( d == null )
				{
					// Inform user about invalid date.
					utilities.showMessage( self, self.invalidDateText + "<br/>" + self.invalidDate2Text );
					return;
				}
				else if ( value.toString() != d.toString() )
				{
					// Value has been changed by entering new value manually to text field.
					value = d;					
					text = $.datepicker.formatDate( self.dateFormat, d );
				}
			}
			
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
		
		// cancelAdding
		cancelAdding: function()
		{
			// Set focus back to input field of this control and select the text.
			var textField = this.element.find(".mf-internal-text").first();
			
			// Note: Setting of focus is needed for some reason before selecting text.
			// Otherwise page scrolls up automagically. 
			textField.focus();
			textField.select();
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
			
			if ( value != null )	
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
				
				// Note: In this phase datepicker is not available in view mode.
				element.find(".mf-internal-text").first().datepicker( "setDate", date );
				
				var formattedDate = $.datepicker.formatDate( self.dateFormat, date );
				if ( self.options.editmode == true )
					element.find(".mf-internal-text").first().val( "" + formattedDate );
				else
					element.find(".mf-internal-text").first().html( "" + formattedDate );	
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
				propertyValue.TypedValue.SetValueToNULL( MFDatatypeDate );
			else
				propertyValue.TypedValue.SetValue( MFDatatypeDate, this.controlValue() );
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
		}
				
    });  // end of textcontrol widget.
	
})( jQuery );( function( $, undefined ) {
	
	// mfiles.mfdynamiccontrolcontainer
	$.widget("mfiles.mfdynamiccontrolcontainer", {
	
		// options.
        options: {
			propertydef: -1,
			valuelist: -1,
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
			
			
			/*
			
			// Get localization strings.
			this.specifyMoreValuesText = localization.getText( "MSLUControl-SpecifyMoreValues" );
			
			// Check whether this is SSLU or MSLU control.
			this.multiSelect = element.hasClass( 'mf-multiselectlookup' );
			
			// Check whether drop-down list is allowed.
			this.dropDownAllowed = !element.hasClass( 'mf-nodropdown' );
			
			// Set max number of results to default value 50.
			// If max number of results is defined in HTML, read it and use instead of default value.
			this.maxResults = 50;
			element.filter( function () {
				var classes = $( this ).attr('class').split(' ');
				for ( var i = 0; i < classes.length; i++ )
				{
					// If class name starts with substring 'mf-maxresults-', convert the end of class name to value and store it.
					var className = classes[ i ];
					if ( className.slice( 0, 14 ) === 'mf-maxresults-' )
					{
						self.maxResults = parseInt( className.substring( 14 ) );
						return true;
					}
				}
				return false;
			} );
			*/
			
			// Get original content and hide help text.
			var originalContent = element.html();
			element.find(".mf-helptext").hide();
								
			// Append container for embedded controls.
			var controlContainer = $('<div class="mf-internal-controls" style="width:100%;"></div>');
			element.append( controlContainer );
			element.data( 'controlContainer', controlContainer );

/*			
			// Append hidden text to lookup container to represent empty list of lookup controls.
			// This is first element added to the container. It is shown and hidden based on number of actual lookup controls inside this container.
			// FIXME: var emptyList = $('<span class="mf-internal-empty-lookup-list" style="width:100%">' + originalContent + '&nbsp;</span>');
			var emptyList = $('<div class="mf-internal-empty-lookup-list" style="width:100%">' + originalContent + '&nbsp;</div>');
			
			
			
			if ( !this.options.showhelptext )
				emptyList.hide();
			lookupContainer.append( emptyList );
			
			// In case of MSLU, add link to add more lookup values.
			if ( this.multiSelect )
			{
				// Append hidden link to add more lookup controls.
				var addLookupLink = $('<a class="mf-internal-link">' + this.specifyMoreValuesText + '</a>').click( function() {
					// If there was existing lookup controls, they are changed to be deletable.
					var lookupControls = lookupContainer.find(".mf-internal-lookup");
					lookupControls.each(
						function() {
							$(this).mflookupcontrol("setDeletable", true );
						}
					); // End of each-loop.
					
					// Add new deletable lookup control.
					self._specifyMoreValues( true );
				}).hide();
				
				element.append( addLookupLink );
				element.data( 'addLookupLink', addLookupLink );
			}			
				
			// Bind click event to this element with 'lookupcontainer' namespace.
			// Click event sets the control to edit mode when user clicks the control.
			// Moving to edit mode changes the state of embedded lookups controls also to edit mode.
			element.bind( 'click.lookupcontainer', function( event ) {
				// Request change to edit mode from metadatacard control.
				if ( !self.options.editmode )
					self.options.requesteditmode( self );
					
				// Don't forward events to parent.
				// Events are allowed for surrounding metadatacard control only if we click to outside of controls rect.
				// This is because clicking out of controls changes all controls to view mode.				
				event.stopPropagation();				
			} );
			
			// Bind custom stopEditing events sent by metadata card.
			element.bind( 'stopEditing.lookupcontainer', function( event ) {
				if ( self.inEditMode() )
					self.setToNormalMode();
			});
			
			// Hover-effect.
			if ( !this.options.readonly )
			{
				lookupContainer.hover(
					function() {
						if ( self.inEditMode() )
							lookupContainer.css('background-color', "transparent");
						else
							lookupContainer.css('background-color', self.options.highlightcolor ); 
					},
					function() {
						lookupContainer.css('background-color', "transparent");
					}
				);
			}
			
			*/
		},
		
		// Use the _setOption method to respond to changes to options.
		_setOption: function( key, value )
		{
			var self = this;
			
			switch( key ) {
			//case "valuelistid":
			//	break;
				
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
/*			
			// Unbind click and stopEditing events.
			this.element.unbind( 'click.lookupcontainer' );
			this.element.bind('stopEditing.lookupcontainer' );
		*/
		
			// Remove controlContainer and its childs. Unbinds also all events.
			element.data('controlContainer').remove();
			
			
		/*
			
			// In case of MSLU, remove link. Unbinds also all events.
			if ( this.multiSelect )
				element.data('addLookupLink').remove();
		*/
			
			// Put original content visible again.			
			element.find(".mf-helptext").show();
			
			// In jQuery UI 1.8, you must invoke the destroy method from the base widget
			$.Widget.prototype.destroy.call( this );
			// In jQuery UI 1.9 and above, you would define _destroy instead of destroy and not call the base method
		},
		
		// --------------------- Own functionality --------------------
		
		// setToNormalMode
		/*
		setToNormalMode: function()
		{
			var self = this;
			setTimeout( function() {
				self.setToNormalMode2();
			}, 1 );
		
		},
		
		// setToNormalMode.
		setToNormalMode2: function()
		{
			// Get embedded lookup controls.
			var lookupContainer = this.element.data('lookupContainer');
			var lookupControls = lookupContainer.find(".mf-internal-lookup");
			
			// Check the validity of each lookup value.
			// If the value of any lookup control is invalid, change to view mode is not allowed. 			
			var changeAllowed = true;
			lookupControls.each(
				function() {
					var valid = $(this).mflookupcontrol("validate");
					if ( !valid )
					{
						changeAllowed = false;
						return false;
					}
				}
			); // End of each-loop.
			
			if ( changeAllowed )
			{
				// Remove empty lookup controls.
				lookupControls.each(
					function() {
						var isEmpty = $(this).mflookupcontrol("isEmpty");
						if ( isEmpty )
							$(this).remove();						
					}
				); // End of each-loop.
				
				// Get lookup controls again when empty controls are removed.
				var lookupControls2 = lookupContainer.find(".mf-internal-lookup");
				
				// In case of MSLU, hide link.
				if ( this.multiSelect )
					this.element.data('addLookupLink').hide();

				// Set all embedded lookup controls to normal mode.
				lookupControls2.mflookupcontrol("setToNormalMode");
			
				// If there are no embedded lookup controls, show text that represents empty list of lookup controls.
				if ( lookupControls2.length === 0 )
					lookupContainer.find( ".mf-internal-empty-lookup-list" ).show();
				else
					lookupContainer.find( ".mf-internal-empty-lookup-list" ).hide();
			
				this.options.editmode = false;			
			
				// Inform metadatacard about state change.
				this.element.closest('.mf-metadatacard').trigger('onStateChanged');
			}
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
				
			// Set all embedded lookup controls to edit mode.
			// Note that embedded lookupcontrols are not allowed to move to edit mode itself.
			// Their state is controlled by "parent" multiselectlookupcontrol.
			var lookupContainer = this.element.data('lookupContainer');
			var lookupControls = lookupContainer.find(".mf-internal-lookup");
			
			var length = lookupControls.length;
			if ( length < 1 )
			{
				// No existing lookup controls.
				// Add empty lookup control without possibility to delete it by user.
				// Note, this function moves it already to edit mode.
				this._specifyMoreValues( false );
			}
			else if ( length === 1 )
			{
				// One existing lookup control.
				// Set it to edit mode and mark to non-deletable.
				lookupControls.mflookupcontrol("setToEditMode2");
				lookupControls.mflookupcontrol("setDeletable", false );
			}
			else
			{
				// Several lookup controls.
				// Set all controls to edit mode and mark to deletable.
				lookupControls.mflookupcontrol("setToEditMode2");
				lookupControls.mflookupcontrol("setDeletable", true );
			}
					
			// In case of MSLU, show hidden links.
			if ( this.multiSelect )
				this.element.data('addLookupLink').show();
			
			// Hide text that represents empty list of lookup controls.
			lookupContainer.find( ".mf-internal-empty-lookup-list" ).hide();
			
			// Return background back to default color.
			lookupContainer.css('background-color', "transparent");
			
			// Set this control to edit mode.
			this.options.editmode = true;

			// Inform metadatacard about state change.
			this.element.closest('.mf-metadatacard').trigger('onStateChanged');			
		},
	*/
		// updateControlFromProperties.
		updateControlFromProperties: function( propertyValues )
		{
			var self = this;
			var controlContainer = this.element.data('controlContainer');
			
			// Remove existing controls.
			controlContainer.find(".mf-internal-control").remove();
			
			// Add control for each property.
			for ( var i = 0; i < propertyValues.Count; i++ ) {
				var propertyValue = propertyValues.Item( i + 1 );
				self._createSingleControl( controlContainer, propertyValue );
			}
			
			
			
			
		/*	
			try {
				var propertyValue = propertyValues.SearchForProperty( self.options.propertydef );
				if ( propertyValue === null ) {
					throw exeption("");
					return;
				}
				
				var typedValue = propertyValue.Value;
				if ( typedValue.IsNULL() || typedValue.IsUninitialized() )
				{
					// TODO: ensure that this is done only in edit mode!!!!
					lookupContainer.find(".mf-internal-empty-lookup-list").show();
					return;
				}
				
				var lookups = typedValue.GetValueAsLookups();
				var deletable = false;
				if ( lookups.Count > 1 )
					deletable = true;
			
				// Add embedded lookup control for each lookup value from propertyValue.		
				for ( var i = 0; i < lookups.Count; i++ )
				{
					var lookup = lookups.Item( i + 1 );
					this._createLookupControl( lookupContainer, deletable, lookup.DisplayValue, lookup.Item );
				}
				if ( lookups.Count === 0 )
					lookupContainer.find(".mf-internal-empty-lookup-list").show();
				else
					lookupContainer.find(".mf-internal-empty-lookup-list").hide();
			}
			catch ( ex )
			{
				// TODO: ensure that this is done only in edit mode!!!!
				lookupContainer.find(".mf-internal-empty-lookup-list").show();	
			}
		*/
		},

		// controlValue.
		/*
		controlValue: function()
		{
			// TODO: In case of SSLU, return only single value, not array of values.
			
			var lookupContainer = this.element.data('lookupContainer');		
			var lookupControls = lookupContainer.find(".mf-internal-lookup");
			
			// Debug.
			//$("#debug").append( $("<span>Lookup values: </span><br/>") );
					
			// Loop over each lookup control and add value from control to array.
			var returnValue = [];
			lookupControls.each(
				function( index ){
					var controlValue = $(this).mflookupcontrol("controlValue");
					
					// Debug.
					//$("#debug").append($( "<span>" + controlValue +  "</span><br/>") );
					
					returnValue.push( controlValue );
				}
			); // End of each-loop.
			
			// Remove duplicate values and return unique array.
			return this.uniqueArray( returnValue );
		},
		
		// _specifyMoreValues.
		// Adds new lookup control. Parameter tells if control is deletable by user.
		_specifyMoreValues: function( deletable )
		{
			var lookupContainer = this.element.data('lookupContainer');
			this._createLookupControl( lookupContainer, deletable, null, -666 );
			
			// Hide text that represents empty list of lookup controls.
			lookupContainer.find(".mf-internal-empty-lookup-list").hide();
		},
		
		*/
		
		// _createSingleControl. 
		_createSingleControl: function( controlContainer, propertyValue )
		{	
			var self = this;
			
			// Create div-tag and append it to container.
			var divTag = $('<div class="mf-internal-control" style="width:100%;">Single control</div>');
			controlContainer.append( divTag );
				
			// Create control as child control for div-tag.
/*
			divTag.mflookupcontrol({
				propertydef: self.options.propertydef,
				valuelist: self.options.valuelist,
				maxresults: self.maxResults,
				isdeletable: deletable,
				requesteditmode: null,					
				editmode: self.options.editmode,
				readonly: self.options.readonly,
				dropdownallowed: self.dropDownAllowed,
				
				open: function() {
					// Called when suggestion menu is opened.
					// In case of MSLU, hide link.
					if ( self.multiSelect )
						self.element.data('addLookupLink').hide();
				},
				close: function() {
					// Called when suggestion menu is closed.					
					// In case of MSLU, show hidden link.
					if ( self.multiSelect )
						self.element.data('addLookupLink').show();
				},
				remove: function() {
					// Called when lookup control is removed by user.
					// If there is only one lookup control left, set it non-deletable.
					// If there are more controls, set all to deletable.
					var lookupControls = lookupContainer.find(".mf-internal-lookup");
					if ( lookupControls.length > 1 )
						lookupControls.mflookupcontrol("setDeletable", true );
					else
						lookupControls.mflookupcontrol("setDeletable", false );
				}
			});
*/

			
			/*
			if ( name != null )
			{
				// Set value and mark it to valid.
				divTag.mflookupcontrol("updateControl", name, id, true );
			}
			else
				divTag.mflookupcontrol("setToEditMode");
            */

			
		}
	/*
		// _stopEditing.		
		_stopEditing: function()
		{
			this.setToNormalMode();
		},
		
		// isEmpty.		
		isEmpty: function()
		{
			var lookupContainer = this.element.data('lookupContainer');
			var lookupControls = lookupContainer.find(".mf-internal-lookup");
			return ( lookupControls.length == 0 );
		},
		
		// inEditMode.
		inEditMode: function()
		{
			return this.options.editmode;
		},
		
		// Utility functions
		
		// Removes duplicate values and returns new unique array.
		uniqueArray: function( arr )
		{
			var temp = new Array();
			for( var i = 0; i < arr.length; i++ )
			{
				if( !this.contains( temp, arr[ i ] ) )
				{
					temp.length += 1;
					temp[ temp.length - 1 ] = arr[ i ];
				}
			}
			return temp;
		},

		// Check if array already contains the value.
		contains: function( arr, value )
		{
			for( var i = 0; i < arr.length; i++ )
				if( arr[ i ] == value )
					return true;
			return false;
		} 
*/		
				
    });  // end of dynamiccontrolcontainer widget.
	
})( jQuery );
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
	
} )( jQuery );﻿( function( localization, $, undefined ) {

	// initialize.
	localization.initialize = function( shellFrame )
	{
		// Get
		this.vault = shellFrame.ShellUI.Vault;
		this.shellFrame = shellFrame;

		this.resources = {};	
    };
	
	// getDateFormat.
	localization.getDateFormat = function()
	{
		// Get short date format (in Windows-specific format).
		var dateFormat = this.getCalendarInfo( "DateFormat" );
		
		// Do mapping from Windows date format to jQuery UI datapicker format.
		//
		// Windows format returned by getText function consists of:
		//
		// d     Day of the month as digits without leading zeros for single-digit days.
		// dd    Day of the month as digits with leading zeros for single-digit days.
		// ddd   Abbreviated day of the week.
		// dddd  Day of the week.
		//
		// M     Month as digits without leading zeros for single-digit months.
		// MM    Month as digits with leading zeros for single-digit months.
		// MMM   Abbreviated month.
		// MMMM  Month.
		//
		// y     Year represented only by the last digit.
		// yy    Year represented only by the last two digits. A leading zero is added for single-digit years.
		// yyyy  Year represented by a full four or five digits, depending on the calendar used.
		// yyyyy Behaves identically to "yyyy".
		//
		// jQuery Datepicker format consists of:
		//
		// d - day of month (no leading zero)
		// dd - day of month (two digit)
		// o - day of the year (no leading zeros)
		// oo - day of the year (three digit)
		// D - day name short
		// DD - day name long
		// m - month of year (no leading zero)
		// mm - month of year (two digit)
		// M - month name short
		// MM - month name long
		// y - year (two digit)
		// yy - year (four digit) 
		
		
		// Convert day.
		if ( dateFormat.indexOf("dddd") != -1 )
			dateFormat = dateFormat.replace("dddd", "DD");
		else if ( dateFormat.indexOf("ddd") != -1 )
			dateFormat = dateFormat.replace("ddd", "D");
		
		// Convert month.
		if ( dateFormat.indexOf("MMMM") != -1 )
			dateFormat = dateFormat.replace("MMMM", "MM");
		else if ( dateFormat.indexOf("MMM") != -1 )
			dateFormat = dateFormat.replace("MMM", "M");
		else if ( dateFormat.indexOf("MM") != -1 )
			dateFormat = dateFormat.replace("MM", "mm");
		else if ( dateFormat.indexOf("M") != -1 )
			dateFormat = dateFormat.replace("M", "m");			

		// Convert year.
		if ( dateFormat.indexOf("yyyyy") != -1 )
			dateFormat = dateFormat.replace("yyyyy", "yy");
		else if ( dateFormat.indexOf("yyyy") != -1 )
			dateFormat = dateFormat.replace("yyyy", "yy");
		else if ( dateFormat.indexOf("yy") != -1 )
			dateFormat = dateFormat.replace("yy", "y");			
				
		// Return converted dataFormat.
		return dateFormat;
	};
	
	// getTimeInfo.
	localization.getTimeInfo = function()
	{
		// Get time format (in Windows-specific format).
		var timeFormat = this.getCalendarInfo( "TimeFormat" );
		
		// Check if we should use 12-hour or 24-hour clock.
		var use24Hours = false;
		if ( timeFormat.indexOf("H") != -1 )
			use24Hours = true;
			
		// Return time format info used for date control.	
		return {
			show24Hours: use24Hours,
			showSeconds: true,
			separator: ":",
			ampmPrefix: ' ',
			ampmNames: ['AM', 'PM']
		};
	};
	
	// getDayNamesMin.
	localization.getDayNamesMin = function()
	{
		var dayNamesMin = [];
		for ( var i = 0; i < 7; i++ )
		{
			var dayNameMin = this.getCalendarInfo( "DayNameMin-" + ( i + 1 ) );
			dayNamesMin.push( dayNameMin );
		}	
		return dayNamesMin;
	};
	
	// getDayNames.
	localization.getDayNames = function()
	{
		var dayNames = [];
		for ( var i = 0; i < 7; i++ )
		{
			var dayName = this.getCalendarInfo( "DayName-" + ( i + 1 ) );
			dayNames.push( dayName );
		}	
		return dayNames;
	};
	
	// getMonthNames.
	localization.getMonthNames = function()
	{
		var monthNames = [];
		for ( var i = 0; i < 12; i++ )
		{
			var monthName = this.getCalendarInfo( "MonthName-" + ( i + 1 ) );
			monthNames.push( monthName );
		}	
		return monthNames;
	};
		
    // getCalendarInfo.
	localization.getCalendarInfo = function( id )
	{
	    // Get localized calendar info from MFShell.
		var localizedString = null;
		try {
		    localizedString = MFiles.GetCalendarInfo( id );
		}
		catch ( ex ) {
		}
		return ( localizedString != null ) ? localizedString : "";
	};
		
	// getText.
	localization.getText = function( id )
	{
		var idString = null;
		if ( id == "BooleanControl-True")
		{
			// IDS_STRING_YES
			idString = "16225";
		}
		else if ( id == "BooleanControl-False")
		{
			// IDS_STRING_NO
			idString = "16226";
		}
		else if ( id == "NumberControl-InvalidInteger")
		{	
			// IDS_E_MFILES_INVALID_INTEGER_NUMBER
			idString = "22074";
		}
		else if ( id == "NumberControl-InvalidFloating")
		{			
			// IDS_E_MFILES_INVALID_REAL_NUMBER
			idString = "22075";
		}
		else if ( id == "NumberControl-InvalidNumber")
		{			
			// IDS_E_STRINGHELPER_INVALID_NUMBER_FORMAT
			idString = "33750";
		}
		else if ( id == "DateControl-InvalidDate")
		{
			// IDS_E_MFILES_INVALID_DATE_FORMAT
			idString = "22292";
		}
		else if ( id == "DateControl-InvalidDate2")
		{
			// IDS_E_MFILES_INVALID_DATE
			idString = "22293";
		}
		else if ( id == "MSLUControl-SpecifyMoreValues" )
		{
			// IDS_MENUSTR_SPECIFY_MORE_VALUES
			idString = "1204";
		}
		else if ( id == "SSLUControl-ConfirmNewValue" )
		{
			// IDS_DLGTITLE_ADD_NEW_VALUE_TO_LIST
			idString = "28150";
		}
		else if ( id == "SSLUControl-ValueDoesNotExist" )
		{
			// IDS_MSG_VALUE_X_NOT_IN_LIST_BOX_DO_YOU_WANT_TO_ADD_NEW_VALUE
			idString = "27077";
		}
		else if ( id == "SSLUControl-AddingOfValueNotAllowed" )
		{
			// IDS_MSG_VALUE_X_NOT_INLISTBOX_AND_ADDING_NOT_ALLOWED
			idString = "27076";
		}
		else if ( id == "SSLUControl-AddingOfObjectNotAllowed" )
		{
			// TODO: Remove this, previous code already handles this situation.
			// IDS_MSG_VALUE_X_NOT_INLISTBOX_AND_ADDING_NOT_ALLOWED
			idString = "27076";
		}
		else if ( id == "BooleanControl-NotItem" )
		{
			// IDS_MSG_MCOMBO_TEXT_NOT_INLISTBOX
			idString = "28050";
		}
		else if ( id == "MetadataCard-FieldMustNotBeEmpty" )
		{
			// IDS_E_MFILES_REQUIRED_PROPERTY_NOT_SET_DESC
			idString = "21002";
		}
		else if ( id == "Dialog-Ok" )
		{
			// IDS_BTNTITLE_OK
			idString = "26857";
		}
		else if ( id == "Dialog-Cancel" )
		{
			// IDS_BTNTITLE_CANCEL
			idString = "26853";
		}
		else if ( id == "Dialog-Close")
		{
			// IDS_BTNTITLE_CLOSE
			idString = "28154";
		}
		else if ( id == "Dialog-Yes" )
		{
			// IDS_STRING_YES
			idString = "16225";
		}
		else if ( id == "Dialog-No" )
		{
			// IDS_STRING_NO
			idString = "16226";
		}
		else if ( id == "Previous" )
		{
			// IDS_CONTROLHELPER_BTNTITLE_PREVIOUS
			idString = "28067";
		}
		else if ( id == "Next" )
		{
			// IDS_CONTROLHELPER_BTNTITLE_NEXT
			idString = "28068";
		}
		else if ( id == "MetadataCard-MoreProperties" )
		{
			// IDC_BUTTON_MORE_FIELDS
			//idString = "301";
			// FIXME
			return "More properties...";
		}
			
		// Get localized text from MFShell.
		var localizedString = null;
		try {
			localizedString = MFiles.GetStringResource( idString );
		}
		catch ( ex ) {
		}
		return ( localizedString != null ) ? localizedString : "";
	};
	
} ( window.localization = window.localization || {}, jQuery ) );
( function( $, undefined ) {

	// New function prototype for String to replace new line '\n' by HTML line break '<br />'.
	String.prototype.nl2br = function() {
		return this.replace(/\n/gi, "<br />");
	};
	
	// New function prototype for String to encode HTML tags to corresponding entities.
	String.prototype.htmlencode = function() {
		return this.replace(/[&<>"']/g, function( $0 ) {
			return "&" + {"&":"amp", "<":"lt", ">":"gt", '"':"quot", "'":"#39"}[ $0 ] + ";";
		});
	};
	
	// mfiles.lookupcontrol
	$.widget("mfiles.mflookupcontrol", {
	
		// options.
        options: {
			propertydef: -1,
			valuelist: -1,
			maxresults: 50,
			isdeletable: false,
			editmode: false,
			readonly: false,
			dropdownallowed: true,
			remove: null
        },
		
		// _create.
        _create: function ()
		{	
			var self = this;
			var element = this.element;
			
			this.listIsOpen = false;
			this._isEmpty = true;
			this.focusedItem = -1;
			
			// Current text in original format (HTML tags not encoded) and item id are stored in element data.
			element.data( 'Text', null );
			element.data( 'Value', null );
			
			// Default parameters.
			this.maxResults = this.options.maxresults;
			this.showDropdown = false;
			
			// Check whether drop-down list is allowed.
			this.dropDownAllowed = this.options.dropdownallowed;
						
			// Append container for controls.
			var container = $('<div class="mf-internal-container" style="width:100%; display:table;"></div>');
			element.append( container );
			element.data( 'container', container );
			
			// Get localization strings.
			this.valueDoesNotExistText = localization.getText( "SSLUControl-ValueDoesNotExist" );
			this.confirmNewValueText = localization.getText( "SSLUControl-ConfirmNewValue" );
			this.addingOfValueNotAllowedText = localization.getText( "SSLUControl-AddingOfValueNotAllowed" );
			this.addingOfObjectNotAllowedText = localization.getText( "SSLUControl-AddingOfObjectNotAllowed" );
			
			// Create lookup control.
			this._createControl( container );
		},
		
		// Use the _setOption method to respond to changes to options.
		_setOption: function( key, value )
		{
			switch( key ) {
			//case "valuelistid":
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
		
			// Unbind events. TODO: Use own namespace here.
			element.unbind('click');
			
			// Remove Container and its childs. Unbinds also all events.
			element.data( 'container' ).remove();
		
			// In jQuery UI 1.8, you must invoke the destroy method from the base widget
			$.Widget.prototype.destroy.call( this );
			// In jQuery UI 1.9 and above, you would define _destroy instead of destroy and not call the base method
		},

		// _createControl.
        _createControl: function ( container )
		{
			var self = this;
			var element = this.element;
			
			// Remove all contents and unbind events.
			container.find(".mf-internal-openlink").remove();
			container.find(".mf-internal-delete-link").remove();
			container.find(".mf-internal-text").remove();
	 
			if ( !this.options.editmode )
			{
				// Embedded lookup control.
				var textFieldControl = $( '<span class="mf-internal-text" style="display:table-cell; width:100%"></span>' );
				container.append( textFieldControl );
				return;
			}			

			// Edit mode.
			var textFieldControl = $( '<input class="mf-internal-text" type="text" style="display:table-cell; width:100%" value="" />' );							
			container.append( textFieldControl );
			
			// Add open-button for drop-down list if it is allowed.
			if ( this.dropDownAllowed )
			{
				var openLink = $('<img src="UIControlLibrary/ArrowDown.png" class="mf-internal-openlink" style="display:table-cell" />')
					.click( function() {
						if ( !self.listIsOpen )
							self._openList();
						else
							self._closeList();
					});
				container.append( openLink );
			}			
			
			// Add link to remove the lookup control.	
			var removeLink = $('<a class="mf-internal-delete-link" style="display:table-cell"><img src="UIControlLibrary/RemoveProperty.png" /></a>').click( function() {
				self._removeControl();
			});
			if ( !this.options.isdeletable )
				removeLink.hide();
			container.append( removeLink );

			// Key down events from text field.
			textFieldControl.keydown( function( event ) {
				// Check whether enter key is pressed down.							
				if ( event.keyCode == 13 )	
					self.handleChangedText( false );		
			} );	
					
			// Attach autocomplete.  
			textFieldControl.autocomplete({  
				delay: 0,
				minLength: 0,
				autoFocus: false,
				
				// Define callback to format results.  
				source: function( request, add )
				{  
					self.delayed_setLookupResults( textFieldControl, request, add ); 
				},
				
				select: function (event, ui)
				{
					element.data( 'Text', ui.item.label );
					element.data( 'Value', ui.item.mf_value );
					self._isEmpty = false;					
					self.listIsOpen = false;
					
					// Set focus back to input field.
					self.setFocus();				
				},
				
				open: function (event, ui)
				{
					var value = textFieldControl.val();
					if ( value.length > 0 )
					{			
						// Get internal autocomplete object and activate requested item.
						if ( self.focusedItem != -1 ) 
						{
							var autocomplete = $( this ).data( "autocomplete" );
							var menu = autocomplete.menu;
							
							var item = menu.element.children().eq( self.focusedItem );
							menu.activate( event, item );
							self.focusedItem = -1;
						}
					}						
					// When list is open, set focus back to input field.
					setTimeout( function() {
						textFieldControl.focus();
					}, 10 )
				}
			});
			return this;		
        },

		// setToNormalMode.
		setToNormalMode: function()
		{
			var self = this;
			var element = this.element;
			
			// Get current data.
			// We are still in edit-mode, so controlText returns text as is. 		
			var text = self.controlText();
			var value = self.controlValue();		

			// TODO: Check that _createControl don't perform unnecessary/illegal tasks.
			// Re-create the control and bind it again to original property.
			this.options.editmode = false;
			var container = element.data( 'container', container );			
			self._createControl( container );
			
			// Update re-created control.
			if ( self.isEmpty() )
				text = "";
			self.updateControl( text, value, false );
		},
	
		// delayed_setToNormalMode
		delayed_setToNormalMode: function()
		{
			var self = this;
			setTimeout( function() {
				self.setToNormalMode();
			}, 1 );
		},
		
		// setToEditMode
		setToEditMode: function()
		{
			var self = this;
			setTimeout( function() {
				self.setToEditMode2();
			}, 1 );
		},
		
		// setDeletable
		setDeletable: function( deletable )
		{
			this.options.isdeletable = deletable;
			var deleteLink = this.element.find(".mf-internal-delete-link").first();
			if ( deletable )
				deleteLink.show();
			else
				deleteLink.hide();	
		},
		
		// delayed_setLookupResults
		//
		// Starts asynchronous search.
		delayed_setLookupResults: function( textFieldControl, request, add )
		{
			var self = this;
			setTimeout( function() {
				self.showLookupResults( textFieldControl, request, add );
			}, 1 );
		},
		
		// showLookupResults
		showLookupResults: function( textFieldControl, request, add )
		{
			var self = this;
			
			// Create array for response objects.  
            var suggestions = [];
			
			// Search values based on request term and add each searched value to response array.
			// TODO: Optimize this...
			var count = 0;
			if ( this.showDropdown || request.term.length > 0 )
			{
				var arr = vaultOperations.getValueListValues( request.term, this.options.propertydef, this.options.valuelist, this.maxResults );
				for( var i = 0; i < arr.length / 2; i++ )
				{
					var name = arr[ i * 2 ];
					var id = arr[ i * 2 + 1 ];
					var item = { "label" : name , "mf_value" : id };
					
					// If value in the text field matches to value in the list, set focus to matching item.
					// TODO: Check if this should be done based on id, not based on name.
					if ( textFieldControl.val() == name.toString() )
						self.focusedItem = count;
						
					count++;
					suggestions.push( item );
				}
			}			
			// After search, set parameters back to default values.
			this.maxResults = this.options.maxresults;
			this.showDropdown = false;
            add( suggestions );
		},
	
		// setToEditMode2.
		setToEditMode2: function()
		{
			if ( this.options.readonly )
				return;
	
			var self = this;
			var element = this.element;
	
			// Get current data.
			var text = null;
			if ( this.isEmpty() )
				text = "";
			else
				text = self.controlText();
							
			var value = self.controlValue();
			var textField = self.element.find(".mf-internal-text").first();
			
			// Get textfield style.
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
				
			this.options.editmode = true;
			this.listIsOpen = false;

			// Re-create the control and add it to the container.
			var container = element.data( 'container', container );			
			self._createControl( container );
			
			// Set style.
			var textField2 = self.element.find(".mf-internal-text").first();
			
			/*
			textField2
				.css( 'font-size', fontSize )
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
			
			// Update re-created control.
			self.updateControl( text, value, false );
			
			// Set focus back to input field.
			self.setFocus();
		},
		
		// updateControl
		updateControl: function( text, value, setToValid )
		{
			var element = this.element;
			if ( this.options.editmode == false )
			{
				if ( !text || text.length == 0 )
					text = "...";

				// Sanitize possible HTML.
				var sanitizedHtml = text.htmlencode().nl2br();			
				element.find( ".mf-internal-text" ).first().html( sanitizedHtml );
			}
			else
				element.find( ".mf-internal-text" ).first().val( text );
			
			element.data( 'Text', text );
			element.data( 'Value', value );
			if ( setToValid )
				this._isEmpty = false;
		},
	
		// controlText
		controlText: function()
		{		
			if ( this.options.editmode == true )
				return this.element.find(".mf-internal-text").first().val();
			else
				return this.element.data( 'Text' );
		},
	
		// controlValue
		controlValue: function()
		{
			return this.element.data( 'Value' );
		},
		
		// isEmpty
		isEmpty: function()
		{
			return this._isEmpty;
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
			this.element.find(".mf-internal-text").first().select();
		},
		
		// _openList
		_openList: function()
		{
			// maxResults tells number of max shown items.	
			this.maxResults = this.options.maxresults;
			this.showDropdown = true;
			
			// Start search with empty string.
			var textField = this.element.find(".mf-internal-text").first();
			textField.autocomplete('search', '*');
			this.listIsOpen = true;
		},
		
		// _closeList
		_closeList: function()
		{
			// Start search.
			var textField = this.element.find(".mf-internal-text").first();
			textField.autocomplete('close');
			this.listIsOpen = false;
		},
		
		// _removeControl
		//
		// It is possible to remove embedded lookup controls from multiselection lookup control.
		// This function is called to remove these controls.
		_removeControl: function()
		{
			// Remove this control.
			this.element.remove();
			
			// Inform parent MSLU-control that control is removed.
			this.options.remove();	
		},
		
		// confirmValueAdding.
		confirmValueAdding: function( changedText )
		{
			var self = this;
			
			// Ask confirmation from the user.
			// User is able to change the text in this dialog before final accepting.
			var dlg = $( ".mf-internal-confirmnewvalue-dialog" );
			
			dlg.find( ".value" ).val( changedText );
			dlg.find( ".mf-dialogtext" ).html( self.confirmNewValueText );
			dlg.data( 'lookupControl', self ).dialog( 'open' );
		},
		
		// addValueToList.
		addValueToList: function( changedText )
		{
			var self = this;
			var valuelist = this.options.valuelist;
			
			var resultID = vaultOperations.addNewValueToList( changedText, valuelist );
			if ( resultID != null )
			{
				// Store the id of created value list item. Set also text again, because user may have changed the text.
				self.updateControl( changedText, resultID, true )
			}
			else
				throw new Error( "Adding of a new value failed. Valuelist: " + valuelist + " Text: " + changedText );			
		},
		
		// cancelAdding
		cancelAdding: function()
		{
			// Set focus back to input field of this control and select the text.
			var textField = this.element.find(".mf-internal-text").first();
			textField.select();
		},
		
		
		// validate
		validate: function()
		{
			var changedText = this.element.find(".mf-internal-text").first().val();
			return this.handleChangedText2( changedText, true );	
		},
		
		// handleChangedText
		handleChangedText: function( allowChangeToViewMode )
		{		
			var self = this;
			var changedText = this.element.find(".mf-internal-text").first().val();
		
			// Call asynchronously.
			setTimeout( function() {
				self.handleChangedText2( changedText, allowChangeToViewMode );	
			}, 0 );
		},
		
		// handleChangedText2.
		//
		// This function is called to check if text has been changed in input field of lookup control.
		// If it has been changed and don't match with stored value, the needed operations are done to store the correct value.
		handleChangedText2: function( changedText, allowChangeToViewMode )
		{		
			var self = this;
			var valueList = this.options.valuelist;
			
			// Check if text field is empty.
			if ( changedText.length === 0 )
			{
				self._isEmpty = true;
			}					
			// If text field is not empty, check whether this is a new value (which means that value doesn't exist in the list).
			else if ( !vaultOperations.valueExists( changedText, valueList ) )
			{
				// This is a new value.
				// Sanitize possible HTML.
				var sanitizedHtml = changedText.htmlencode().nl2br();
			
				// New value. Check if it is allowed to add new values to the list.
				if ( vaultOperations.isAddingAllowed( valueList ) )
				{
					// Adding of a new value was allowed.
					// Check if valuelist contains real object. Adding of real objects is not supported.
					if ( vaultOperations.hasRealObjects( valueList ) )
					{
						// Inform user that adding of real objects is not allowed.
						utilities.parseAndShowMessage( self, self.addingOfObjectNotAllowedText, sanitizedHtml );
						return false;
					}
					
					// Ask if user wants to add new value to valuelist.
					utilities.showNewValueMessage( self, self.valueDoesNotExistText, sanitizedHtml, changedText );
				}
				else
				{
					// Show message that given value is not allowed.
					utilities.parseAndShowMessage( self, self.addingOfValueNotAllowedText, sanitizedHtml );
				}
				// Return false to indicate that value is not valid. So, it is not reasonable to move focus to another control.
				return false;			
			}
			// No new value. User has entered existing (but probably changed) value.
			else
			{
				// If text has been changed, id must be updated based on changed text.
				var originalText = self.element.data( "Text" );
				if ( originalText != changedText )
				{
					// Get id based on changed text and store it.
					// TODO: Change this so that ID is retrieved already in first call to vaultOperations.valueExists.
					var id = vaultOperations.valueExists( changedText, valueList );
					
					// Store text and id.
					self.element.data( "Text", changedText );
					self.element.data( "Value", id );
					self._isEmpty = false;
				}
			}	
			// Return true to indicate that value is valid. So, it is reasonable to move focus to another control.
			return true;	
		}
				
    });  // end of lookupcontrol widget.
	
})( jQuery );
var g_offset = 0;

( function( $, undefined ) {
	
	// mfiles.metadatacard
	$.widget("mfiles.metadatacard", {
	
		// options.
        options: {
			highlightcolor: "transparent",
			objecttype: -1,
			classid: -1,
			closewhensaved: true,
			initialproperties: null,
			onInitialize: null,
			onEnableControls: null,
			onDisableControls: null,
			onSave: null,
			onClose: null,
			onEdit: null,
			onPropertyValueChange: null
        },

		// _create.
		// Creates this metadatacard widget.
        _create: function ()
		{
			var self = this;
			this.dashboard = null;
			this.currentObject = null;
			this.controlToActivate = null;
			this.closeWhenSaved = this.options.closewhensaved;
						
			// Get localization strings.
			this.fieldMustNotBeEmpty = localization.getText( "MetadataCard-FieldMustNotBeEmpty" );
			this.moreProperties = localization.getText( "MetadataCard-MoreProperties" );
			
			// Associative array for custom properties set by user.
			this.customProperties = null;
			
			// Associative array for excluded properties set by user.
			this.excludedProperties = null;
			
			this.framework = {
			
				// Sets all properties to metadata card. Used e.g. for creating of new object.
				setAllProperties: function( properties ) {
					// Check duplicates.
					var props = {};
					for ( var i = 0 ; i < properties.Count; i++ )
					{
						var propertyValue = properties.Item( i + 1 );
						if ( props.hasOwnProperty( propertyValue.propertyDef ) )
							throw "Duplicate property value. Property def: " + propertyValue.propertyDef;
						props[ propertyValue.propertyDef ] = true;
					}
					
					// Store properties.
					self.customProperties = properties;
					
					// Set class property if it does not exist.
					var classPropertyValue = MFiles.CreateInstance( "PropertyValue" );		
					classPropertyValue.PropertyDef = 100;
					var lookup = MFiles.CreateInstance( "Lookup" );
					lookup.Item = self.options.classid;
					classPropertyValue.TypedValue.SetValueToLookup( lookup );
					
					// Note: If index is -1 (class property not found), new property is added to the end. Otherwise old value is replaced.		
					var index = self.customProperties.IndexOf( 100 );
					self.customProperties.Add( index, classPropertyValue );
				},
				
				// getAllProperties TODO: --> propertyValues
				// Gets all properties from controls in metadata card.
				getAllProperties: function() {
					// Create PropertyValues object and fill it based on values from controls.
					var propertyValues = MFiles.CreateInstance( "PropertyValues" );
					$( ".mf-control" ).each( function() {
						if ( $( this ).basecontrol( "isEmpty" ) === false )
						{		
							var propertyValue = $( this ).basecontrol( "controlPropertyValue" );
							propertyValues.Add( -1, propertyValue );
						}
					} );
					return propertyValues;
				},
				
				mergeProperties: function( properties, overwrite ) {
					
					// Merge properties.
					var props = {};
					for ( var i = 0 ; i < properties.Count; i++ )
					{
						var propertyValue = properties.Item( i + 1 );
						
						// Check duplicates in incoming properties.
						if ( props.hasOwnProperty( propertyValue.propertyDef ) )
							throw "Duplicate property value. Property def: " + propertyValue.propertyDef;
						props[ propertyValue.propertyDef ] = true;
						
						// Check if property exist. If not, add it.
						var index = self.customProperties.IndexOf( propertyValue.propertyDef );
						if ( index == -1 )
							self.customProperties.Add( -1, propertyValue );
						else
						{			
							// Property already exists. Overwrite it if requested.
							if ( overwrite )
							{
								self.customProperties.Remove( index );
								self.customProperties.Add( -1, propertyValue );
							}
						}
					}						
				},
				
				// setExcludedProperties
				setExcludedProperties: function( properties ) {
					self.excludedProperties = properties;
				},
				
				// getExcludedProperties
				getExcludedProperties: function() {
					return self.excludedProperties;
				},
				
				// update
				update: function() {
					setTimeout( function() {
						// Update controls. Use flag to force external update.
						self.updateControls( self.currentObject, false );
					}, 10 );
				},
				
				getObjectType: function() {
					return self.options.objecttype;
				},
				
				getClassId: function() {
					return self.options.classid;
				},
				
				setClassId: function( classId ) {
					self.options.classid = classId;
				}
				
			};
			
			// Associative array for persistent properties.
			this.persistentProperties = {};
			
			// Associative array for properties which are added to metadata card, but not yet saved.
			this.addedProperties = {};
			
			// Associative array for properties which are removed from metadata card, but not yet from actual object.
			this.removedProperties = {};
			
			// Callback handler 
			//
			// Callbacks:
			//	onSave
			//	onClose
			//	onShowDashboard
			//	onUpdateDashboard
			//	onEdit
			//	onPropertyValueChange
			this.callbackHandler = {};	
			
			// Bind click event to this element with 'metadatacard' namespace.
			this.element.bind( "click.metadatacard", function( event ) {
			
				// Check if any controls are in edit mode.
				var controls = [];
				$( ".mf-control" ).each( function() {
					if ( $( this ).basecontrol( "inEditMode" ) )
					{
						controls.push( $( this ) );
						return false;
					}
				} );					
				
				// Send event to controls to change them from edit mode to view mode.
				// FIXME: Add loop to handle all controls...		
				if ( controls.length > 0 )
				{
					// Send event to controls to change them from edit mode to view mode.
					var controlInEditMode = controls.pop();
		
					// Call onPropertyValueChange to check if changing of value is allowed.
					// If changing of value is allowed, stop editing of control which is in edit mode.
					var newPropertyValue = controlInEditMode.basecontrol( "controlPropertyValue", true );					
					if ( self.options.onPropertyValueChange( newPropertyValue ) )		
						controlInEditMode.trigger( "stopEditing" );			
				}		
			} );
			
        },
		 
        // Use the _setOption method to respond to changes to options.
		_setOption: function( key, value )
		{
			switch( key ) {
			case "highlightcolor":
				// TODO: Handle changes to highlightcolor option.
				break;
			case "objecttype":
				// Handle changes to objecttype option.
				this.options.objecttype = value;
				break;
			case "classid":
				// Handle changes to classicid option.
				this.options.classid = value;
				break;
			case "closewhensaved":
				// TODO: Handle changes to closewhensaved option.
				break;
			case "initialproperties":
				// TODO: Handle changes to initialproperties option.
				break;
			}
			// In jQuery UI 1.8, you have to manually invoke the _setOption method from the base widget
			$.Widget.prototype._setOption.apply( this, arguments );
			// In jQuery UI 1.9 and above, you use the _super method instead
			//this._super( "_setOption", key, value );
		},
		
		// Use the destroy method to clean up any modifications your widget has made to the DOM.
		destroy: function()
		{
			// Unbind click and onStateChanged events.
			this.element.unbind( "click.metadatacard" );
			this.element.bind( "onStateChanged.metadatacard" );
			
			// TODO: destroy rest of controls etc...
			
			// In jQuery UI 1.8, you must invoke the destroy method from the base widget.
			$.Widget.prototype.destroy.call( this );
			// In jQuery UI 1.9 and above, you would define _destroy instead of destroy and not call the base method.
		},
		
		// initialize.
        initialize: function ( dashboard, isNewObject )
		{	
			var self = this;
			this.dashboard = dashboard;
			var shellFrame = dashboard.Parent.ShellFrame;
			if ( dashboard.IsPopupDashboard )
				shellFrame = dashboard.Parent;
			
			this.isNewObject = isNewObject;
		
			// Set this element's class to 'mf-metadatacard' if it is not yet. 
			this.element.attr('class', 'mf-metadatacard');
			
			// Initialize vaultOperations object. 
			vaultOperations.initialize( shellFrame );
			
			// Initialize localization object. 
			localization.initialize( shellFrame );
			
			// Create subcontrols based on HTML "template".
			$( ".mf-control" ).each( function() {
				
				// Read property def from own attribute.
				var propertyDef = $( this ).data( "mf-propertydef" );
				
				var valueList = -1;
				
				// Read value of read-only flag from class attribute.
				var readOnly = $( this ).hasClass( "mf-readonly" );
				
				// Read control type from class attribute.
				var dataType = MFDatatypeUninitialized;
				if ( $( this ).hasClass( "mf-text" ) )
					dataType = MFDatatypeText;
				else if ( $( this ).hasClass( "mf-multilinetext" ) )
					dataType = MFDatatypeMultiLineText;
				else if ( $( this ).hasClass( "mf-lookup" ) )
				{
					dataType = MFDatatypeLookup;
					valueList = vaultOperations.getValueListByPropertyDef( propertyDef );
				}
				else if ( $( this ).hasClass( "mf-multiselectlookup" ) )
				{
					dataType = MFDatatypeMultiSelectLookup;
					valueList = vaultOperations.getValueListByPropertyDef( propertyDef );
				}
				else if ( $( this ).hasClass( "mf-date" ) )
					dataType = MFDatatypeDate;
				else if ( $( this ).hasClass( "mf-time" ) )
					dataType = MFDatatypeTime;
				else if ( $( this ).hasClass( "mf-timestamp" ) )
					dataType = MFDatatypeTimestamp;
				else if ( $( this ).hasClass( "mf-integer" ) )
					dataType = MFDatatypeInteger;
				else if ( $( this ).hasClass( "mf-floating" ) )
					dataType = MFDatatypeFloating;
				else if ( $( this ).hasClass( "mf-boolean" ) )
					dataType = MFDatatypeBoolean;
				else if ( $( this ).hasClass( "mf-label" ) )
					dataType = MFDatatypeUninitialized;
				else {
					var classes = $( this ).attr( "class" );
					throw "Control type not defined by element's class-attribute. Assigned classes: " + classes;
				}
						
				// Create actual control(s).
				if ( dataType == MFDatatypeUninitialized )
				{
				    // Create label control.
					$( this ).basecontrol( {
						islabel: true,
						propertydef: propertyDef
					} );
				}
				else if ( dataType == MFDatatypeTimestamp )
				    // Create timestamp control.
					$( this ).basecontrol( {
						istimestamp: true,
						datatype: dataType,
						propertydef: propertyDef
					} );
				else
				{
                    // Create control.				
				    self._createSingleControl( $( this ), dataType, propertyDef, valueList, readOnly, isNewObject );
					
					// Add property to array of persistent properties.
					self.persistentProperties[ propertyDef ] = true;
				}
				
			} ); // end of each loop
			
			// Create dynamic controls.
			this._createDynamicControls();
			
			// Create save button(s).
			$( ".mf-savebutton" ).button().click( function() {
				if ( self.save() && self.closeWhenSaved )
					self.close();
			} );
			
			// Create close button(s).
			$( ".mf-closebutton" ).button().click( function() {
				self.close();
			} );
						
			// Bind onStateChanged events to this element with 'metadatacard' namespace.
			// Events are sent by subcontrols and used to inform metadatacard when subcontrols are changed
			// to edit mode and back to normal mode.
			this.element.bind( "onStateChanged.metadatacard", function( event ) {
			
				// Check if any controls are in edit mode.
				var editMode = false;
				$( ".mf-control" ).each( function() {
					if ( $( this ).basecontrol( "inEditMode" ) )
					{
						editMode = true;
						return false;
					}
				} );
			
				// Save and close buttons are disabled always if any subcontrol is in edit mode.
				// This is done because for some reason default button "Save" is activated automatically if user presses enter in some subcontrols.
				// By disabling defaut buttons this unwanted side-effect is prevented.			
				if ( editMode )
				{
					$( ".mf-savebutton" ).button( "disable" );
					$( ".mf-closebutton" ).button( "disable" );
					
					// Callback to inform caller that controls have been disabled.
					self.options.onDisableControls( self.framework );
				}
				else
				{
					if ( self.controlToActivate != null )
					{
						// Call onEdit to check if changing to edit mode is allowed.
						if ( self.options.onEdit( /*self.currentObject, self.controlToActivate*/ ) )
							self.controlToActivate.setToEditMode();
						self.controlToActivate = null;
					}
				
					$( ".mf-savebutton" ).button( "enable" );
					$( ".mf-closebutton" ).button( "enable" );
					
					// Callback to inform caller that controls have been enabled.
					self.options.onEnableControls( self.framework );
				}
			});

			// Initialize dialogs.
			utilities.initializeDialogs( self );

			// Callback to inform caller that metadatacard has been initialized and user is ready to do own initialization.
			self.options.onInitialize( self.framework );
		
			// HACK
			//vaultOperations.setNamedValue( "name1", "value2 " );
			//var value = vaultOperations.getNamedValue( "name1" );
            //alert( "stored value: " + value );			
			
        }, // end of initialize
		
		// updateControls.
		// Called to update control data from properties.
        updateControls: function ( objectVersionAndProperties, internalCall )
		{	
			var self = this;
			this.controlToActivate = null;
			this.currentObject = objectVersionAndProperties;
			
			// If there are open dialogs, close them.
			utilities.closeDialogs();
			
			// Verify that all controls are in view mode.
			// TODO: How to handle the situation that user has changed values and "selection change event" or other 
			// "external event" causes the call to updateControls?
			this.setToNormalMode();
				
		
			var properties = null;
			if ( this.customProperties != null )
				properties = this.customProperties;
			else if ( objectVersionAndProperties !== null )
			{
				 properties = objectVersionAndProperties.Properties;
			
				// Update special read-only fields.
				$( ".mf-objectid" ).text( objectVersionAndProperties.ObjVer.ID );
				$( ".mf-objectversion" ).text( objectVersionAndProperties.ObjVer.Version );
			}
			
			// Update dynamic controls first.
			this._updateDynamicControls( properties, internalCall );
			
			
			// Loop over each subcontrol and update it.
			$( ".mf-control" ).each( function( index ) {
			
				var isAllowed = true;
				
				// Call onShowControl to check if showing of control is allowed. NOTE: Not implemented yet.
				//if ( self.options.onShowControl( objectVersionAndProperties, null ) )	
				if ( isAllowed ) 
				{
					// If controls are linked to existing object, update all controls from target object only if existing object changes.
					if ( objectVersionAndProperties !== null && !internalCall )
					{
						$( this ).basecontrol( "updateControlFromProperties", properties );
					}
					// If controls are linked to existing object, update only empty controls when user adds or removes dynamic controls.
					else if ( objectVersionAndProperties !== null && internalCall )
					{
						if ( $( this ).basecontrol( "isEmpty" ) )
							$( this ).basecontrol( "updateControlFromProperties", properties );
					}
					// Controls are NOT linked to any object, e.g. in case of new object creations.
					else if ( objectVersionAndProperties === null )
					{
						if ( internalCall )
						{
							// In case of internal update,
							// fields which are not empty are filled by user, don't change them.
							if ( $( this ).basecontrol( "isEmpty" ) )
								$( this ).basecontrol( "updateControlFromProperties", properties );
						}
						else
						{
							// In case of external update, update all.
							$( this ).basecontrol( "updateControlFromProperties", properties );
						}
					
					}
				
				}
				
			} );
			
        },
		
		// setToNormalMode.
		setToNormalMode: function()
		{
			// Send event to change all controls back to view mode.
			$( ".mf-control" ).trigger('stopEditing');
		},
		
		// _createSingleControl
		_createSingleControl: function( element, dataType, propertyDef, valueList, readOnly, isNewObject )
		{
			var self = this;
			
		    // Create single control.
			element.basecontrol( {
				datatype: dataType,
				propertydef: propertyDef,
				valuelist: valueList,
				readonly: readOnly,
				showhelptext: isNewObject,
				highlightcolor: self.options.highlightcolor,
				// Function to make decision if edit mode is allowed.
				requesteditmode: function( control ) {
						
					self.controlToActivate = null;
						
					// Check if any controls are in edit mode.
					var inEditMode = [];
					var editMode = false;
					$( ".mf-control" ).each( function() {
						// Note, we need === to compare values here.
						// basecontrol("inEditMode") returns value which is converted to true if == comparison is used, when inEditMode function does not exist at all!
						if ( $( this ).basecontrol( "inEditMode" ) === true )
						{
							inEditMode.push( $( this ) );
							editMode = true;
							// This return breaks each-loop.
							return false;
						}
					} ); // each-loop	

					// If there are any controls in edit mode, we store reference to control which requested activation.
					// It will be activated right away when other controls change back to view mode. And other controls change back to 
					// view mode when we send stopEditing event to them.
					// If there are not any controls in edit mode, set requested control to edit mode now.		
					if ( editMode )
					{
						// Call onPropertyValueChange to check if changing of value is allowed.
						// If changing of value is not allowed, we won't stop editing of current control.
						var controlInEditMode = inEditMode.pop();
						var newPropertyValue = controlInEditMode.basecontrol( "controlPropertyValue", true );
											
						if ( self.options.onPropertyValueChange( newPropertyValue /*self.currentObject, controlInEditMode*/ ) )
						{
							self.controlToActivate = control;		
							// Send event to change control which is in edit mode back to view mode.
							controlInEditMode.trigger( "stopEditing" );
						}						
					}
					else
					{
						// Call onEdit to check if changing to edit mode is allowed.
						if ( self.options.onEdit( /*self.currentObject, control*/ ) )
							control.setToEditMode();
					}
					
				}  // closure for requesteditmode
						
			} );  // basecontrol constructor

		},
		
		// _createDynamicControls
		_createDynamicControls: function()
		{
			var self = this;
			$( ".mf-dynamic-controls" ).each( function() {
			
				// Create container for dynamic controls.
				var controlContainer = $( '<div class="mf-internal-dynamic-controls"></div>' );
				self.element.data( "dynamic-controls", controlContainer );
				$( this ).append( controlContainer );
				
				// Append link to add more properties.
				var morePropertiesLink = $( '<a href="">' + self.moreProperties + '</a>' ).click( function() {
					self._moreProperties();
					return false;
				});
				$( this ).append( $( "<div></div>" ) ).append( morePropertiesLink );
				
				// Handle only first found mf-dynamic-controls-tag and break each loop.
				return false;
			} );
		},
		
		// _updateDynamicControls
		// TODO: Optimize this...
		_updateDynamicControls: function( propertyValues, internalCall )
		{
			// Get container of dynamic controls.
			var controlContainer = this.element.data( "dynamic-controls" );
			if ( controlContainer )
			{
				if ( internalCall )
					this._updateDynamicControlsInternal( controlContainer, propertyValues );
				else
					this._updateDynamicControlsExternal( controlContainer, propertyValues );
			}
		},
		
		// _updateDynamicControlsInternal
		_updateDynamicControlsInternal: function( controlContainer, propertyValues )
		{
			var self = this;
			var table = controlContainer.find( "#table" ).first();
				
			// Remove controls for removed properties.
			// These are properties removed by user but not yet saved.
			for ( var i in self.removedProperties ) {
				if ( self.removedProperties[ i ] === false )
					continue;
					
				// Remove control if it exists.
				if ( table.find( "#" + i ).length != 0 )
					table.find( "#" + i ).first().remove();
			}	
			
			// Create controls for added properties.
			// These are properties added by user but not yet saved.
			for ( var i in self.addedProperties ) {
				if ( self.addedProperties[ i ] === false )
					continue;
					
				// Create control if it does not exist.
				if ( table.find( "#" + i ).length == 0 ) 
					self._addDynamicControl( table, i, vaultOperations.getDatatypeByPropertyDef( i ) );
			}					
		},
		
		// _updateDynamicControlsExternal
		_updateDynamicControlsExternal: function( controlContainer, propertyValues )
		{
			var self = this;
			
			// Remove added and removed properties from the arrays if this was not internal call.
			self.addedProperties = {};
			self.removedProperties = {};
			
			// Remove existing controls from this container. 
			controlContainer.empty();
				
			// Create table where to add controls.	
			var table = $( '<table class="mf-dynamic-table" id="table"></table>' );
			controlContainer.append( table );
			
			// Create and add rest of existing properties dynamically.
			for ( var i = 0 ; propertyValues !== null && i < propertyValues.Count; i++ )
			{
				var propertyValue = propertyValues.Item( i + 1 );
							
				// If there is a persistent control for the property in the metadata card, don't add it to dynamic controls area.  				
				if ( propertyValue.propertyDef in self.persistentProperties && self.persistentProperties[ propertyValue.propertyDef ] === true )
					continue;

				// Skip excluded properties.
				var excluded = false;
				if ( self.excludedProperties && self.excludedProperties.length > 0 )
				{
					for ( var j = 0; j < self.excludedProperties.length; j++ ) {
						if ( self.excludedProperties[ j ] == propertyValue.propertyDef )
						{
							// Break for loop.
							excluded = true;
							break;
						}
					}
				}
				if ( excluded )
					continue;
						
				// Create actual control.
				self._addDynamicControl( table, propertyValue.propertyDef, propertyValue.Value.DataType );
					
			}  // end for ( property values in current object )
					
		},
		
		// _addDynamicControl
		_addDynamicControl: function( table, propertyDef, dataType )
		{
			var self = this;
		
			// Container tags for label and control
			var labelControl = $( '<span class="mf-control"></span>' );
			var singleControl = $( '<span class="mf-control mf-dynamic-control"><span class="mf-helptext">---</span></span>' );
					
			// Add new line to table, contains own row for label and control.
			// TODO: If there will be support for several metadatacard in same HTML page, this id needs prefix from metadatacard name
			var line = $( '<tr id="' + propertyDef + '"></tr>' );					
			line.append( $( '<td class="mf-dynamic-namefield"></td>' ).append( labelControl ) );
			line.append( $( '<td class="mf-dynamic-controlfield"></td>' ).append( singleControl ) );
			
			// Append link to remove control.
			var removeControlLink = $( '<a href="">Remove</a>' ).click( function() {
				self.removeProperty( propertyDef );
				return false;
			} );
			line.append( $( '<td class="mf-dynamic-lastfield"></td>' ).append( removeControlLink ) );
			table.append( line );
		
			try {		
				// Add propertydef to element's data and control type to element's class.
				var valueList = -1;
				singleControl.data( "mf-propertydef", propertyDef );
							
				if ( dataType == MFDatatypeText )
					singleControl.addClass( "mf-text" );
				else if ( dataType == MFDatatypeMultiLineText )
					singleControl.addClass( "mf-multilinetext" );
				else if ( dataType == MFDatatypeLookup )
				{
					singleControl.addClass( "mf-lookup" );
					valueList = vaultOperations.getValueListByPropertyDef( propertyDef );
				}
				else if ( dataType == MFDatatypeMultiSelectLookup )
				{
					singleControl.addClass( "mf-multiselectlookup" );
					valueList = vaultOperations.getValueListByPropertyDef( propertyDef );
				}
				else if ( dataType == MFDatatypeDate )
				{
					singleControl.addClass( "mf-date" );
				}
				else if ( dataType == MFDatatypeTime )
				{
					singleControl.addClass( "mf-time" );
				}
				else if ( dataType == MFDatatypeTimestamp )
				{
					singleControl.addClass( "mf-timestamp" );
				}
				else if ( dataType == MFDatatypeInteger )
				{
					singleControl.addClass( "mf-integer" );
				}
				else if ( dataType == MFDatatypeFloating )
				{
					singleControl.addClass( "mf-floating" );
				}
				else if ( dataType == MFDatatypeBoolean )
				{
					singleControl.addClass( "mf-boolean" );
				}
				else
				{
					throw "Unknown datatype: " + dataType;
				}
						
				// Create label control.
				labelControl.basecontrol( {
					islabel: true,
					propertydef: propertyDef
				} );
							
				// Create actual control. Note that timestamp control is created differently.
				if ( dataType == MFDatatypeTimestamp )
				{
					singleControl.basecontrol( {
						istimestamp: true,
						datatype: dataType,
						propertydef: propertyDef
					} );
				}
				else
					self._createSingleControl( singleControl, dataType, propertyDef, valueList, false, false );
						
			}  // end try
			catch( ex ) {
				alert( "Error in creation of dynamic control: " + ex );
			}  // end catch
			
			//return singleControl;
		},
		
		// _moreProperties
		_moreProperties: function()
		{
			var self = this;
			
			// Get current properties shown in metadatacard.
			var excludedProperties = {};
			$( ".mf-control" ).each( function() {
				// TODO: Check that this works ok, so that propertydef is always valid.
				var propertyDef = $( this ).basecontrol( "option", "propertydef" );
				excludedProperties[ propertyDef ] = null;
			});

			// Add other excluded properties.
			if ( self.excludedProperties && self.excludedProperties.length > 0 )
			{			
				for ( var i = 0; i < self.excludedProperties.length; i++ ) {
					excludedProperties[ self.excludedProperties[ i ] ] = null;					
				}			
			}
		    // Show add properties-dialog. Don't show properties which are already shown on metadata card.
			utilities.showAddPropertiesDialog( excludedProperties );
		},
		
		// addProperty
		addProperty: function( propertyDef )
		{
			this.addedProperties[ propertyDef ] = true;
			if ( this.removedProperties[ propertyDef ] === true )
				this.removedProperties[ propertyDef ] = false;
	
			// Call updateControls internally. 
			this.updateControls( this.currentObject, true );
		},
		
		// removeProperty
		removeProperty: function( propertyDef )
		{
			this.removedProperties[ propertyDef ] = true;
			if ( this.addedProperties[ propertyDef ] === true )
				this.addedProperties[ propertyDef ] = false; 
			
			// Call updateControls internally. 
			this.updateControls( this.currentObject, true );
		},
				
		// save.
		save: function()
		{		
			var self = this;
			
			// Check that all required fields are filled.
			var failed = false;
			$( ".mf-required" ).each( function() {
				if ( $( this ).basecontrol( "isEmpty" ) )
				{	
					// Inform user about mandatory fields.
					var propertyName = $( this ).basecontrol( "getPropertyName" );
					utilities.parseAndShowMessage( self, self.fieldMustNotBeEmpty, propertyName );
					failed = true;
					
					// Returning false breaks each-loop.
					return false;
				}
			});
			
			if ( failed )
				return false;
			
			if ( this.isNewObject == true )
			{
				// Create new object.
				// Read default object type and class id from options.
				var objectType = this.options.objecttype;
				var classId = this.options.classid;
				
				// Property values.
				var propertyValues = MFiles.CreateInstance( "PropertyValues" );
				
				// Get initial properties defined in metadatacard HTML.
				if ( this.options.initialproperties )
					propertyValues = this.options.initialproperties( vaultOperations.getVault(), objectType, classId, propertyValues );
				
				// Get other properties.
				var classFound = false;
				$('.mf-control').each(function() {
					if ( $( this ).basecontrol( "isEmpty" ) === false )
					{		
						var propertyValue = $( this ).basecontrol( "controlPropertyValue" );
						propertyValues.Add( -1, propertyValue );

						if ( propertyValue.propertyDef === 100 ) // Class
							classFound = true;
					}
				} );
				
				// If properties don't include class, add it here.
				if ( !classFound )
					propertyValues.Add( -1, utilities.createProperty( MFDatatypeLookup, MFBuiltInPropertyDefClass, classId ) );
				
				// Create a new object.
				vaultOperations.createNewObject( objectType, propertyValues );
			}
			else
			{
				// Get properties.
				var propertyValues = MFiles.CreateInstance( "PropertyValues" );
				$( ".mf-control" ).each( function() {
				
					// Add properties retrieved from normal controls, ignore label and timestamp controls.
					if ( $( this ).basecontrol( "isReadOnlyControl" ) === false )
					{								
						var propertyValue = $( this ).basecontrol( "controlPropertyValue" );
						propertyValues.Add( -1, propertyValue );
					}
				});
				
				// Check that saving is not prevented by callback function.
				if ( !this.options.onSave( this.currentObject, propertyValues ) ) return false;
			
				// Save object.
				vaultOperations.saveObject( this.currentObject, propertyValues, self.removedProperties );
				
				// Remove added and removed properties from the arrays. 
				self.addedProperties = {};
				self.removedProperties = {};
				
				// Setting metadatacard to "normal" mode stops editing of all controls.
				// This is ok, because current values are already stored in call to saveObject.
				this.element.metadatacard( "setToNormalMode" );
			}
			return true;
		},
		
		// close.
		close: function()
		{
			// Check that closing is not prevented by callback function.
			if ( !this.options.onClose() ) return false;
			
			if ( this.dashboard.IsPopupDashboard )
				this.dashboard.Window.Close();
			else
			{
				this.dashboard.Parent.ShowDefaultContent();
				this.dashboard.Parent.Visible = false;
			}
		},
		
		// This is dummy function called by error dialog.
		cancelAdding: function()
		{
		},
		
		// getFramework
		getFramework: function()
		{
			return this.framework;
		}
		
    } ); // End of widget 'metadatacard'.
  
} )( jQuery );( function( $, undefined ) {

	// TODO: Change the name of this widget to lookupcontrolcontainer,
	// because this widget is used as container for both normal lookup control and multiselect lookup control.
	
	// mfiles.mfmultiselectlookupcontrol
	$.widget("mfiles.mfmultiselectlookupcontrol", {
	
		// options.
        options: {
			propertydef: -1,
			valuelist: -1,
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
			
			// Get localization strings.
			this.specifyMoreValuesText = localization.getText( "MSLUControl-SpecifyMoreValues" );
			
			// Check whether this is SSLU or MSLU control.
			this.multiSelect = element.hasClass( 'mf-multiselectlookup' );
			
			// Check whether drop-down list is allowed.
			this.dropDownAllowed = !element.hasClass( 'mf-nodropdown' );
			
			// Set max number of results to default value 50.
			// If max number of results is defined in HTML, read it and use instead of default value.
			this.maxResults = 50;
			element.filter( function () {
				var classes = $( this ).attr('class').split(' ');
				for ( var i = 0; i < classes.length; i++ )
				{
					// If class name starts with substring 'mf-maxresults-', convert the end of class name to value and store it.
					var className = classes[ i ];
					if ( className.slice( 0, 14 ) === 'mf-maxresults-' )
					{
						self.maxResults = parseInt( className.substring( 14 ) );
						return true;
					}
				}
				return false;
			} );
			
			// Get original content and hide help text.
			var originalContent = element.html();
			element.find(".mf-helptext").hide();
						
			// Append container for embedded lookup controls.
			var lookupContainer = $('<div class="mf-internal-lookups" style="width:100%;"></div>');
			element.append( lookupContainer );
			element.data( 'lookupContainer', lookupContainer );
			
			// Append hidden text to lookup container to represent empty list of lookup controls.
			// This is first element added to the container. It is shown and hidden based on number of actual lookup controls inside this container.
			// FIXME: var emptyList = $('<span class="mf-internal-empty-lookup-list" style="width:100%">' + originalContent + '&nbsp;</span>');
			var emptyList = $('<div class="mf-internal-empty-lookup-list" style="width:100%">' + originalContent + '&nbsp;</div>');
			
			
			
			if ( !this.options.showhelptext )
				emptyList.hide();
			lookupContainer.append( emptyList );
			
			// In case of MSLU, add link to add more lookup values.
			if ( this.multiSelect )
			{
				// Append hidden link to add more lookup controls.
				var addLookupLink = $('<a class="mf-internal-link">' + this.specifyMoreValuesText + '</a>').click( function() {
					// If there was existing lookup controls, they are changed to be deletable.
					var lookupControls = lookupContainer.find(".mf-internal-lookup");
					lookupControls.each(
						function() {
							$(this).mflookupcontrol("setDeletable", true );
						}
					); // End of each-loop.
					
					// Add new deletable lookup control.
					self._specifyMoreValues( true );
				}).hide();
				
				element.append( addLookupLink );
				element.data( 'addLookupLink', addLookupLink );
			}			
				
			// Bind click event to this element with 'lookupcontainer' namespace.
			// Click event sets the control to edit mode when user clicks the control.
			// Moving to edit mode changes the state of embedded lookups controls also to edit mode.
			element.bind( 'click.lookupcontainer', function( event ) {
				// Request change to edit mode from metadatacard control.
				if ( !self.options.editmode )
					self.options.requesteditmode( self );
					
				// Don't forward events to parent.
				// Events are allowed for surrounding metadatacard control only if we click to outside of controls rect.
				// This is because clicking out of controls changes all controls to view mode.				
				event.stopPropagation();				
			} );
			
			// Bind custom stopEditing events sent by metadata card.
			element.bind( 'stopEditing.lookupcontainer', function( event ) {
				if ( self.inEditMode() )
					self.setToNormalMode();
			});
			
			// Hover-effect.
			if ( !this.options.readonly )
			{
				lookupContainer.hover(
					function() {
						if ( self.inEditMode() )
							lookupContainer.css('background-color', "transparent");
						else
							lookupContainer.css('background-color', self.options.highlightcolor ); 
					},
					function() {
						lookupContainer.css('background-color', "transparent");
					}
				);
			}
		},
		
		// Use the _setOption method to respond to changes to options.
		_setOption: function( key, value )
		{
			var self = this;
			
			switch( key ) {
			//case "valuelistid":
			//	break;
				
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
			
			// Unbind click and stopEditing events.
			this.element.unbind( 'click.lookupcontainer' );
			this.element.bind('stopEditing.lookupcontainer' );
			
			// Remove lookupContainer and its childs. Unbinds also all events.
			element.data('lookupContainer').remove();
			
			// In case of MSLU, remove link. Unbinds also all events.
			if ( this.multiSelect )
				element.data('addLookupLink').remove();
			
			// Put original content visible again.			
			element.find(".mf-helptext").show();
			
			// In jQuery UI 1.8, you must invoke the destroy method from the base widget
			$.Widget.prototype.destroy.call( this );
			// In jQuery UI 1.9 and above, you would define _destroy instead of destroy and not call the base method
		},
		
		// --------------------- Own functionality --------------------
		
		// setToNormalMode
		setToNormalMode: function()
		{
			var self = this;
			setTimeout( function() {
				self.setToNormalMode2();
			}, 1 );
		
		},
		
		// setToNormalMode.
		setToNormalMode2: function()
		{
			// Get embedded lookup controls.
			var lookupContainer = this.element.data('lookupContainer');
			
			// FIXME: This may fail, if user has opened lookup control and changes the current object.
			// Probably, because setToNormalMode2 is called after timeout.
			var lookupControls = lookupContainer.find(".mf-internal-lookup");
			
			// Check the validity of each lookup value.
			// If the value of any lookup control is invalid, change to view mode is not allowed. 			
			var changeAllowed = true;
			lookupControls.each(
				function() {
					var valid = $(this).mflookupcontrol("validate");
					if ( !valid )
					{
						changeAllowed = false;
						return false;
					}
				}
			); // End of each-loop.
			
			if ( changeAllowed )
			{
				// Remove empty lookup controls.
				lookupControls.each(
					function() {
						var isEmpty = $(this).mflookupcontrol("isEmpty");
						if ( isEmpty )
							$(this).remove();						
					}
				); // End of each-loop.
				
				// Get lookup controls again when empty controls are removed.
				var lookupControls2 = lookupContainer.find(".mf-internal-lookup");
				
				// In case of MSLU, hide link.
				if ( this.multiSelect )
					this.element.data('addLookupLink').hide();

				// Set all embedded lookup controls to normal mode.
				lookupControls2.mflookupcontrol("setToNormalMode");
			
				// If there are no embedded lookup controls, show text that represents empty list of lookup controls.
				if ( lookupControls2.length === 0 )
					lookupContainer.find( ".mf-internal-empty-lookup-list" ).show();
				else
					lookupContainer.find( ".mf-internal-empty-lookup-list" ).hide();
			
				this.options.editmode = false;			
			
				// Inform metadatacard about state change.
				this.element.closest('.mf-metadatacard').trigger('onStateChanged');
			}
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
				
			// Set all embedded lookup controls to edit mode.
			// Note that embedded lookupcontrols are not allowed to move to edit mode itself.
			// Their state is controlled by "parent" multiselectlookupcontrol.
			
			var lookupContainer = this.element.data('lookupContainer');
			var lookupControls = lookupContainer.find(".mf-internal-lookup");
			
			var length = lookupControls.length;
			if ( length < 1 )
			{
				// No existing lookup controls.
				// Add empty lookup control without possibility to delete it by user.
				// Note, this function moves it already to edit mode.
				this._specifyMoreValues( false );
			}
			else if ( length === 1 )
			{
				// One existing lookup control.
				// Set it to edit mode and mark to non-deletable.
				lookupControls.mflookupcontrol("setToEditMode2");
				lookupControls.mflookupcontrol("setDeletable", false );
			}
			else
			{
				// Several lookup controls.
				// Set all controls to edit mode and mark to deletable.
				lookupControls.mflookupcontrol("setToEditMode2");
				lookupControls.mflookupcontrol("setDeletable", true );
			}
					
			// In case of MSLU, show hidden links.
			if ( this.multiSelect )
				this.element.data('addLookupLink').show();
			
			// Hide text that represents empty list of lookup controls.
			lookupContainer.find( ".mf-internal-empty-lookup-list" ).hide();
			
			// Return background back to default color.
			lookupContainer.css('background-color', "transparent");
			
			// Set this control to edit mode.
			this.options.editmode = true;

			// Inform metadatacard about state change.
			this.element.closest('.mf-metadatacard').trigger('onStateChanged');			
		},
	
		// updateControlFromProperties.
		// TODO: Is this called only in normal mode???
		updateControlFromProperties: function( propertyValues )
		{
			var self = this;
			var propertyDef = this.options.propertydef;
			var lookupContainer = this.element.data('lookupContainer');
			
			// Remove existing lookup controls.
			lookupContainer.find(".mf-internal-lookup").remove();
			
			try {
				var propertyValue = propertyValues.SearchForProperty( self.options.propertydef );
					
				var typedValue = propertyValue.Value;
				if ( typedValue.IsNULL() || typedValue.IsUninitialized() )
				{
					// TODO: ensure that this is done only in edit mode!!!!
					lookupContainer.find(".mf-internal-empty-lookup-list").show();
					return;
				}
				
				var lookups = typedValue.GetValueAsLookups();
				var deletable = false;
				if ( lookups.Count > 1 )
					deletable = true;
					
				// Add embedded lookup control for each lookup value from propertyValue.		
				for ( var i = 0; i < lookups.Count; i++ )
				{
					var lookup = lookups.Item( i + 1 );
					var displayValue = lookup.DisplayValue;
					
					//alert("lookup, displayvalue: " + lookup.DisplayValue + " item " + lookup.Item );
					
					// Get display value if it does not exist.
					if ( !displayValue || displayValue.length == 0 )
					{
						displayValue = vaultOperations.getValueListItemNameByID( self.options.valuelist, lookup.Item );
					}
					this._createLookupControl( lookupContainer, deletable, displayValue, lookup.Item );
				}
				if ( lookups.Count === 0 )
					lookupContainer.find(".mf-internal-empty-lookup-list").show();
				else
					lookupContainer.find(".mf-internal-empty-lookup-list").hide();
			}
			catch ( ex )
			{
				// TODO: ensure that this is done only in edit mode!!!!
				lookupContainer.find(".mf-internal-empty-lookup-list").show();	
			}
		},

		// controlValue.
		controlValue: function()
		{
			var self = this;
			
			// TODO: In case of SSLU, return only single value, not array of values.
			
			var lookupContainer = this.element.data('lookupContainer');		
			var lookupControls = lookupContainer.find(".mf-internal-lookup");
						
			// Loop over each lookup control and add value from control to array.
			var returnValue = [];
			lookupControls.each(
				function( index ){
					
					// Get text from text field of single lookup control.
					var text = $( this ).mflookupcontrol( "controlText" );
					
					// If this is empty, don't add this value to array.
					if ( !text || text.length == 0 )
						return false;
					
					
					// TODO: Optimize. There is no need to check this if we have already checked this before.
					// This is relevant only when called to ensure value is ok before calling onPropertyValueChange.					
					
					// Ensure that user has not given text that does not match to items in valuelist.
					if ( !vaultOperations.valueExists( text, self.options.valuelist ) )
						return false;
					
					var controlValue = $( this ).mflookupcontrol( "controlValue" );	
					returnValue.push( controlValue );
					//alert( "Value of single lookup inside MSLU: " + controlValue + "editmode: " + self.options.editmode );	
					
				}
			); // End of each-loop.
			
			// Remove duplicate values and return unique array.
			return this.uniqueArray( returnValue );
		},
		
		// controlPropertyValue
		controlPropertyValue: function( getNewValue )
		{
			var propertyValue = MFiles.CreateInstance( "PropertyValue" );		
			propertyValue.PropertyDef = this.options.propertydef;
			
			if ( this.multiSelect )
			{
				var value = this.controlValue();
				var lookups = MFiles.CreateInstance( "Lookups" );
				
				for ( var i = 0; i < value.length; i++ )
				{
					var lookup = MFiles.CreateInstance( "Lookup" );
					lookup.Item = value[ i ];
					lookups.Add( -1, lookup );
				}
				propertyValue.TypedValue.SetValueToMultiSelectLookup( lookups );
			}
			else
			{
				var value = this.controlValue();
				if ( this.isEmpty() || value.length == 0 )
					propertyValue.TypedValue.SetValueToNULL( MFDatatypeLookup );
				else	
					propertyValue.TypedValue.SetValue( MFDatatypeLookup, value );
			}
			return propertyValue;
		},
		
		// _specifyMoreValues.
		// Adds new lookup control. Parameter tells if control is deletable by user.
		_specifyMoreValues: function( deletable )
		{
			var lookupContainer = this.element.data('lookupContainer');
			this._createLookupControl( lookupContainer, deletable, null, -666 );
			
			// Hide text that represents empty list of lookup controls.
			lookupContainer.find(".mf-internal-empty-lookup-list").hide();
		},
		
		// _createLookupControl. 
		_createLookupControl: function( lookupContainer, deletable, name, id )
		{	
			var self = this;
			
			// Create div-tag and append it to container.
			var divTag = $('<div class="mf-internal-lookup" style="width:100%;"></div>');
			lookupContainer.append( divTag );
				
			// Create lookupcontrol as child control for div-tag.
			divTag.mflookupcontrol({
				propertydef: self.options.propertydef,
				valuelist: self.options.valuelist,
				maxresults: self.maxResults,
				isdeletable: deletable,
				requesteditmode: null,					
				editmode: self.options.editmode,
				readonly: self.options.readonly,
				dropdownallowed: self.dropDownAllowed,
				
				open: function() {
					// Called when suggestion menu is opened.
					// In case of MSLU, hide link.
					if ( self.multiSelect )
						self.element.data('addLookupLink').hide();
				},
				close: function() {
					// Called when suggestion menu is closed.					
					// In case of MSLU, show hidden link.
					if ( self.multiSelect )
						self.element.data('addLookupLink').show();
				},
				remove: function() {
					// Called when lookup control is removed by user.
					// If there is only one lookup control left, set it non-deletable.
					// If there are more controls, set all to deletable.
					var lookupControls = lookupContainer.find(".mf-internal-lookup");
					if ( lookupControls.length > 1 )
						lookupControls.mflookupcontrol("setDeletable", true );
					else
						lookupControls.mflookupcontrol("setDeletable", false );
				}
			});
			
			if ( name != null )
			{
				// Set value and mark it to valid.
				divTag.mflookupcontrol("updateControl", name, id, true );
			}
			else
				divTag.mflookupcontrol("setToEditMode");			
		},
	
		// _stopEditing.		
		_stopEditing: function()
		{
			this.setToNormalMode();
		},
		
		// isEmpty.		
		isEmpty: function()
		{
			var lookupContainer = this.element.data('lookupContainer');
			var lookupControls = lookupContainer.find(".mf-internal-lookup");
			return ( lookupControls.length == 0 );
		},
		
		// inEditMode.
		inEditMode: function()
		{
			return this.options.editmode;
		},
		
		// Utility functions
		
		// Removes duplicate values and returns new unique array.
		uniqueArray: function( arr )
		{
			var temp = [];
			for( var i = 0; i < arr.length; i++ )
			{
				if( !this.contains( temp, arr[ i ] ) )
				{
					temp.length += 1;
					temp[ temp.length - 1 ] = arr[ i ];
				}
			}
			return temp;
		},

		// Check if array already contains the value.
		contains: function( arr, value )
		{
			for( var i = 0; i < arr.length; i++ )
				if( arr[ i ] == value )
					return true;
			return false;
		} 		
				
    });  // end of multiselectlookupcontrol widget.
	
})( jQuery );
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
	
})( jQuery );( function( $, undefined ) {

	// New function prototype for String to replace new line '\n' by HTML line break '<br />'.
	String.prototype.nl2br = function() {
		return this.replace(/\n/gi, "<br />");
	};
	
	// New function prototype for String to encode HTML tags to corresponding entities.
	String.prototype.htmlencode = function() {
		return this.replace(/[&<>"']/g, function( $0 ) {
			return "&" + {"&":"amp", "<":"lt", ">":"gt", '"':"quot", "'":"#39"}[ $0 ] + ";";
		});
	};
	
	// mfiles.mftextcontrol
	$.widget( "mfiles.mftextcontrol", {
	
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
			this._isEmpty = true;
			
			// Store original content and clear this element.
			var originalContent = element.html();
			element.data( 'originalContent', originalContent );
			element.html('');
			
			// Append container for controls.
			var container = $( '<div class="mf-internal-container" style="width:100%"></div>' );
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
			element.bind( 'stopEditing', function( event ) {
				if ( self.options.editmode )
					self.setToNormalMode();
			});
			
			// Hover-effects.
			container.hover(
				function() {
					if ( !self.options.readonly )
						container.css( 'background-color', self.options.highlightcolor ); 
				},
				function() {
					container.css( 'background-color', "transparent" );
				}
			);
			
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
			this.element.unbind( "click" );
			this.element.unbind( "stopEditing" );
		
			// Remove Container and its childs. Unbinds also all events.
			element.data( "container" ).remove();
			
			// In jQuery UI 1.8, you must invoke the destroy method from the base widget.
			$.Widget.prototype.destroy.call( this );
			// In jQuery UI 1.9 and above, you would define _destroy instead of destroy and not call the base method.
		},
		
		// _createControl.
        _createControl: function ( container, showHelpText )
		{
			var self = this;
			var element = this.element;
			
			//var width2 = container.find( ".mf-internal-text" ).first().css( "width" );
			
			// Remove all contents and unbind events.
			container.find( ".mf-auto-resize" ).remove();
			container.find( ".mf-internal-text" ).remove();
			container.find( ".dummy" ).remove();
			
			// Create text field.
			var textFieldControl = '';
			var isResizable = false;
			if ( this.options.editmode == true )
			{
				// In case of normal text, create simple input field.
				// Otherwise, in case of multiline-text, create auto-resizable textarea.
				if ( element.hasClass( "mf-text" ) )
				{
					textFieldControl = $( '<div class="dummy"><input class="mf-internal-text" type="text" style="width:99%" /></div>' );	
				}
				else
				{
					var width = element.parent( ".mf-dynamic-controlfield" ).css( "width" );
					isResizable = true;
					if ( width === undefined )
					{ 
						width = "300px";
					//	textFieldControl = $( '<div class="mf-auto-resize" style="width:400px;"><textarea class="mf-auto-resize mf-internal-text" style="width:400px;"></textarea></div>' );	
						textFieldControl = $( '<div class="mf-auto-resize" style="width:' + width + ';"><textarea class="mf-auto-resize mf-internal-text" style="width:' + width + ';"></textarea></div>' );	
					
					}
					else
					{
						textFieldControl = $( '<div class="mf-auto-resize" style="width:' + width + ';"><textarea class="mf-auto-resize mf-internal-text" style="width:' + width + ';"></textarea></div>' );	
					}
				}
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
				textFieldControl = $( '<div class="mf-internal-text" style="overflow-x: hidden; overflow-y: hidden;">'+ text +'</div>' );
			}
			container.append( textFieldControl );
			
			// Set text area to auto-resizable.
			if ( isResizable )
			{			
				var textTag = container.find( ".mf-internal-text" )[ 0 ];
				var divTag = container.find( ".mf-auto-resize" )[ 0 ];
				self.setResizable( divTag, textTag );
			}
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
			
			if ( text && text.length > 0 )
			{
				// Store the value.
				this.element.data( "Value", text );
					
				// Get value.	
				value = this.controlValue();
			}
			
			// Re-create the control in edit mode and bind it again to original property.
			this.options.editmode = false;	
			var container = element.data( "container" );			
			self._createControl( container, false );
			
			element.data( "Value", value );
			if ( text )
			{
				// Sanitize possible HTML.
				var sanitizedHtml = text.htmlencode().nl2br();
				element.find( ".mf-internal-text" ).first().html( sanitizedHtml );
				this._isEmpty = false;
			}
			else
			{
				// In case of empty text restore original content inside text control.
				// Add non-breaking whitespace to ensure that there is place to click to set control to edit mode if original content is empty. 
				var originalContent = element.data( "originalContent" );
				element.find( ".mf-internal-text" ).first().html( originalContent + "&nbsp;" );
				this._isEmpty = true;
			}
			
			// Inform metadatacard about state change.
			element.closest( ".mf-metadatacard" ).trigger( "onStateChanged" );
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
	
			// Store page offset. Needed to scroll to same Y-coordinate later.
			g_offset = window.pageYOffset;
	
			// Get current text and data.
			var text = '';
			var value = self.controlValue();
			if ( value )
				text = value.toString();
			
			var textField = element.find( ".mf-internal-text" ).first();
			
			// Get existing style.
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
				
			
			
			// Re-create the control in edit mode.
			self.options.editmode = true;	
			
			var container = element.data( 'container' );			
			self._createControl( container, false );
			
			var textField2 = element.find( ".mf-internal-text" ).first();
			
			// Set style and value.
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
				.css( 'margin-right', marginRight )
				.val( text );
						
			// Inform metadatacard about state change.
			element.closest( '.mf-metadatacard' ).trigger( 'onStateChanged' );
				
			// Start delayed focus change.					
			this.setFocus();
		},
  
		// updateControlFromProperties
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
					throw exeption( "" );
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
						element.find( ".mf-internal-text" ).first().html( originalContent + "&nbsp;" );
					else
						element.find( ".mf-internal-text" ).first().val( originalContent + "&nbsp;" );
					return;
				}
				
				
				var text = propertyValue.GetValueAsUnlocalizedText();
				element.data( 'Value', text );
				
				if ( self.options.editmode == false )
				{
					// Sanitize possible HTML.
					var sanitizedHtml = text.htmlencode().nl2br();
					element.find( ".mf-internal-text" ).first().html( sanitizedHtml );
				}
				else
					element.find( ".mf-internal-text" ).first().val( text );
					
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
					element.find( ".mf-internal-text" ).first().html( originalContent + "&nbsp;" );
				else
					element.find( ".mf-internal-text" ).first().val( originalContent + "&nbsp;" );
			}
		},
	
		// controlText
		controlText: function()
		{
			var element = this.element;
			if ( this.options.editmode == false )
				return element.find( ".mf-internal-text" ).first().html();
			else
				return element.find( ".mf-internal-text" ).first().val();		
		},
	
		// controlValue
		controlValue: function()
		{
			return this.element.data( 'Value' );
		},
		
		// newControlValue
		newControlValue: function()
		{
			// Get current text.
			var text = this.controlText();
			if ( text && text.length > 0 )
			{
				return text.htmlencode().nl2br();
			}
			return null;
		},
		
		// controlPropertyValue
		controlPropertyValue: function( getNewValue )
		{
			var propertyValue = MFiles.CreateInstance( "PropertyValue" );		
			propertyValue.PropertyDef = this.options.propertydef;
			
			if ( getNewValue === true )
			{
				var value = this.newControlValue();
				if ( !value )
					propertyValue.TypedValue.SetValueToNULL( this.options.datatype );
				else
					propertyValue.TypedValue.SetValue( this.options.datatype, value );
			}
			else
			{
				if ( this.isEmpty() )
					propertyValue.TypedValue.SetValueToNULL( this.options.datatype );
				else
					propertyValue.TypedValue.SetValue( this.options.datatype, this.controlValue() );
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
			
		// setResizable
		setResizable: function( divTag, textTag )
		{
			var textNode = document.createTextNode( '' );
			divTag.appendChild( textNode );
			
			textTag.onkeypress = textTag.onkeyup = textTag.onkeydown = textTag.onchange = textTag.onfocus = function () {
				textNode.nodeValue = textTag.value + '\n\n';
			}
			textNode.nodeValue = textTag.value + '\n\n';
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
			this.element.find( ".mf-internal-text" ).first().focus();
		}
				
    } );  // end of textcontrol widget.
	
} )( jQuery );( function( $, undefined ) {
	
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
	
} )( jQuery );( function( $, undefined ) {

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
	
})( jQuery );﻿( function( MFiles_UIControls, $, undefined ) {

	// initialize
	MFiles_UIControls.initialize = function( dashboard, callbacks, initialProperties )
	{
	    var master = {};
	    master.dashboard = dashboard;
		master.commonCallbacks = dashboard.CustomData.commoncallbacks || {};
		master.localCallbacks = callbacks || {};
		initialProperties = initialProperties || function( vault, objectType, classId, propertyValues ) {
			return propertyValues;
		}
		
		// Insert internal HTML before (first) metadatacard tag if it doesn't exist. This contains HTML e.g. for UI control dialogs.
		var internalHtml = $( ".mf-internal-html" );
		if ( internalHtml.length == 0 )
		{
			var container = $( '<div class=".mf-internal-html"></div>' );
		    $( ".mf-metadatacard" ).first().prepend( container );
			container.load( "UIControlLibrary/internal.html" );
		}
		
		// List of preloaded JavaScript files.
		var jsFiles = [];
		
		// jQuery, jQuery UI and other needed plugins.
		jsFiles.push( "jquery-ui-1.8.19/js/jquery-ui-1.8.19.custom.min.js" );
		jsFiles.push( "jquery.timeentry-1.4.9/jquery.timeentry.js" );
		
		// Own UI controls
		jsFiles.push( "utilities.js" );
		jsFiles.push( "vaultoperations.js" );
		jsFiles.push( "localization.js" );
		jsFiles.push( "textcontrol.js" );
		jsFiles.push( "lookupcontrol.js" );
		jsFiles.push( "multiselectlookupcontrol.js" );
		jsFiles.push( "booleancontrol.js" );
		jsFiles.push( "numbercontrol.js" );
		jsFiles.push( "datecontrol.js" );
		jsFiles.push( "timecontrol.js" );
		jsFiles.push( "timestampcontrol.js" );
		jsFiles.push( "labelcontrol.js" );
		jsFiles.push( "dynamiccontrolcontainer.js" );
		jsFiles.push( "basecontrol.js" );
		jsFiles.push( "metadatacard.js" );
		
		// Preload JavaScript files. When all are loaded, callback funtion is called to register Started and Stop events for dashboard.
		MFiles_UIControls.preLoadJsFiles( jsFiles, function() {
			// Register event handler for dashboard Started event.
			master.dashboard.Events.Register( Event_Started, function() {
				
				master.isPopup = false;
				master.shellFrame = master.dashboard.Parent.ShellFrame;
				if ( master.dashboard.IsPopupDashboard )
				{
					master.isPopup = true;
					master.shellFrame = dashboard.Parent;
				}
				// Creates and initializes metadatacard.
				MFiles_UIControls.createDashboard( master, initialProperties );
			} );

			// Register event handler for dashboard Stop event.
			master.dashboard.Events.Register( Event_Stop, function() {
				if ( master.dashboard.CustomData && master.dashboard.CustomData.dashboardClosed )
					master.dashboard.CustomData.dashboardClosed();
			} );
		} );	
	}

	// preLoadJsFiles	
	MFiles_UIControls.preLoadJsFiles = function( jsFiles, mainCallback )
	{
		// Callback function for script loading.
		var count = 0;
		var loaded = function( fileName ) {
		    count++;
			// When all files are loaded, call main callback funtion which continue the initialization.
			if ( count == jsFiles.length )
				mainCallback();
		}
		
		// Loop for all files.
		for ( var i = 0; i < jsFiles.length; i++ ) {
		// HACK!!!!
			//$.getScript( "UIControlLibrary/" + jsFiles[ i ], function(){
				loaded( jsFiles[ i ] );
			//} );
		}
	}

	// Create and initialize metadatacard.
    MFiles_UIControls.createDashboard = function( master, initialProperties )
	{
		var self = this;
		
		 // Register event handler for selection changed event.
		master.shellFrame.Listing.Events.Register( Event_SelectionChanged, function( selectedItems ) {
			MFiles_UIControls.onSelectionChanged( master, selectedItems );
		} );

		// Register event handler for selected items changed event.
		master.shellFrame.Listing.Events.Register( Event_SelectedItemsChanged, function( selectedItems ) {
			MFiles_UIControls.onSelectedItemsChanged( master, selectedItems );
		} );
		
		// Create and initialize metadatacard widget.
		$('.mf-metadatacard').metadatacard({
			highlightcolor: "#eeeeee",
			objecttype: master.dashboard.CustomData.objectType,  // Default object type.
			classid: master.dashboard.CustomData.classId,  // Default class id.
			closewhensaved: master.isPopup,
			initialproperties: initialProperties, // Function to return initial properties.
			
			// callbacks.
			onInitialize: function( metadatacard ) { 
				return self._performCallback( master, true, 'onInitialize', metadatacard );
			},
			onEnableControls: function( metadatacard ) { 
				return self._performCallback( master, true, 'onEnableControls' );
			},
			onDisableControls: function( metadatacard ) { 
				return self._performCallback( master, true, 'onDisableControls' );
			},
			onSave: function( objectVersionAndProperties, changedProperties ) {
				// Allow saving if not prevented by callback.
				return self._performCallback( master, true, 'onSave', objectVersionAndProperties, changedProperties );
			},
			onClose: function() {
				// Allow closing if not prevented by callback.
				return self._performCallback( master, true, 'onClose' );
			},
			onEdit: function() {
				// Allow editing of controls if not prevented by callback.
				return self._performCallback( master, true, 'onEdit' );
			},
			onPropertyValueChange: function( newPropertyValue ) {
				return self._performCallback( master, true, 'onPropertyValueChange', newPropertyValue );
			}
			
		} );
		// Note: objecttype and classid can be set also via options at the later phase.
		
		$( ".mf-metadatacard" ).metadatacard( "initialize", master.dashboard, master.isPopup );		

		// Current selection.
		var objectVersionAndProperties = null;
		
		// Update controls.	
		if ( !master.isPopup )
		{
			// Get current selection. The type of selection is objectVersionAndProperties.
			objectVersionAndProperties = MFiles_UIControls.getCurrentObject( master, master.shellFrame.Listing.CurrentSelection );
		}
		
		// Call onUpdateDashboard callback method. It is not possible to cancel updating by callback function.
		self._performCallback( master, true, "onUpdateDashboard", objectVersionAndProperties );
		
		// Update metadatacard.
		$('.mf-metadatacard').metadatacard( "updateControls", objectVersionAndProperties, false );
	}
		
	// getCurrentObject.
	MFiles_UIControls.getCurrentObject = function( master, selectedItems )
	{
		var currentObject = null;
		var currentObjectType = -1;
		var currentClassId = -1
		
		var objectVersionsAndProperties = selectedItems.ObjectVersionsAndProperties;
		if ( objectVersionsAndProperties != null && objectVersionsAndProperties.Count > 0 )
		{
			currentObject = objectVersionsAndProperties.Item( 1 );
			currentObjectType = currentObject.ObjVer.Type;		
			
			var objectVersions = selectedItems.ObjectVersions;	
			if ( objectVersions && objectVersions.Count > 0 )
			{
				var objectVersion = objectVersions.Item( 1 );
				currentClassId = objectVersion.Class;
			}
			
			// Check if object type and class id matches to any of registered dashboard.
			if ( !this.isAllowedObject( master, currentObjectType, currentClassId ) )
				currentObject = null;
		}
		return currentObject;
	}
	
	// isAllowedObject
	MFiles_UIControls.isAllowedObject = function( master, objectType, classId )
	{
	    var dashboards = master.dashboard.CustomData.dashboards;
		for ( var i = 0; i < dashboards.length; i++ ) {
			var dashboard = dashboards[ i ];
			if ( ( dashboard.objectType == objectType || dashboard.objectType == '*' ) && ( dashboard.classId == classId || dashboard.classId == '*' ) )
				return true
		}
		return false;
	}
	
	// onSelectionChanged.
	MFiles_UIControls.onSelectionChanged = function( master, selectedItems )
	{
		var self = this;
		
		// Get current selection.
		var objectVersionAndProperties = MFiles_UIControls.getCurrentObject( master, selectedItems );
		
		// Call onUpdateDashboard callback method. It is not possible to cancel updating by callback function.
		self._performCallback( master, true, "onUpdateDashboard", objectVersionAndProperties );
		
		// Update metadatacard.
		if ( objectVersionAndProperties != null )
			$( ".mf-metadatacard" ).metadatacard( "updateControls", objectVersionAndProperties, false );
	}

	// onSelectedItemsChanged.
	MFiles_UIControls.onSelectedItemsChanged = function( master, selectedItems )
	{
		var self = this;
		
		// Get current selection.
		var objectVersionAndProperties = MFiles_UIControls.getCurrentObject( master, selectedItems );
		
		// Call onUpdateDashboard callback method. It is not possible to cancel updating by callback function.
		self._performCallback( master, true, "onUpdateDashboard", objectVersionAndProperties );
		
		// Update metadatacard.
		if ( objectVersionAndProperties != null )
			$( ".mf-metadatacard" ).metadatacard( "updateControls", objectVersionAndProperties, false );
	}
	
	// _performCallback
	MFiles_UIControls._performCallback = function( master, isLocal, callbackName )
	{	
		var result = true;
		// If callback is not local and common callback function for dashboards exists, call it.
		if ( !isLocal && master.commonCallbacks.hasOwnProperty( callbackName ) )
		{
			// Get target function and call it with additional arguments (skip master and callbackName arguments).
			// Note that apply-function can not be used, because callback function is not real java objects.
			var targetFunction = master.commonCallbacks[ callbackName ];
			var args = arguments.length - 3;
			if ( args == 0 )	
				result = targetFunction();
			else if ( args == 1 )	
				result = targetFunction( arguments[ 3 ] ) ;
			else if ( args == 2 )
			{
				result = targetFunction( arguments[ 3 ], arguments[ 4 ] ) ;
			}
			else if ( args == 3 )	
				result = targetFunction( arguments[ 3 ], arguments[ 4 ], arguments[ 5 ] ) ;
			else throw "More than 3 arguments are not supported.";	
		}
		// If common callback function returns true or does not return anything,
		// perform local (dashboard-specific) callback function.
		if ( result === true || result === undefined )
		{
			// If local callback function for dashboard exists, call it.
			if ( master.localCallbacks.hasOwnProperty( callbackName ) )
			{
				// Get target function and call it with additional arguments (skip master and callbackName arguments).
				// Note that apply-function can not be used, because callback function is not real java objects.
				var targetFunction = master.localCallbacks[ callbackName ];
				var args = arguments.length - 3;
				if ( args == 0 )	
					result = targetFunction();
				else if ( args == 1 )	
					result = targetFunction( arguments[ 3 ] ) ;
				else if ( args == 2 )	
					result = targetFunction( arguments[ 3 ], arguments[ 4 ] ) ;
				else if ( args == 3 )	
					result = targetFunction( arguments[ 3 ], arguments[ 4 ], arguments[ 5 ] ) ;
				else throw "More than 3 arguments are not supported.";
			}
		}		
		// Return result. True means that actual operation based on event should be performed.
		return ( result === true || result === undefined );
	}
	
}( window.MFiles_UIControls = window.MFiles_UIControls || {}, jQuery ) );
﻿( function( utilities, $, undefined ) {

	// showMessage
	utilities.showMessage = function( caller, message )
	{
		// Show dialog.
		var dlg = $( ".mf-internal-invalidvalue-dialog" );
		dlg.find( ".mf-dialogtext" ).html( message );
		dlg.data( "caller", caller ).dialog( "open" );		
	};
	
	// parseAndShowMessage
	utilities.parseAndShowMessage = function( caller, message, value )
	{		
		// Parse value to localized string.
		var i = message.indexOf( "%s" );
		var text = message.substr( 0, i ) + value + message.substr( i + 2 );
					
		// Show dialog.
		this.showMessage( caller, text );
	};
	
	// showNewValueMessage
	utilities.showNewValueMessage = function( self, message, value, changedText )
	{		
		var i = message.indexOf( "%s" );
		var text = message.substr( 0, i ) + value + message.substr( i + 2 );
		
		var dlg = $( ".mf-internal-newvalue-dialog" );
	    dlg.find( ".mf-dialogtext" ).html( text );
		dlg.data( 'lookupControl', self ).data( 'changedText', changedText ).dialog( 'open' );
	};
	
	// showAddPropertiesDialog
	utilities.showAddPropertiesDialog = function( excludedProperties )
	{		
		// Show add properties-dialog.
		var dlg = $( ".mf-internal-addproperties-dialog" );
		var propertyList = dlg.find( ".mf-internal-addproperties-dialog-propertylist" );
		
		// Set empty string to search field.
		propertyList.val("");
		propertyList.data( "selection", -1 );
		var propertyDefs = null;
		
		// Attach autocomplete.  
		propertyList.autocomplete( {  
			delay: 0,
			minLength: 0,
			autoFocus: false,
			// Callback to format results.  			
			source: function( request, add ) {
			
				// TODO: Optimize this!!
			
				// Get propertyDefs
				if ( propertyDefs == null )
					propertyDefs = vaultOperations.getPropertyDefs();
				
				// Sort array based on name.
				var nameArray = []
				var idMap = {};
				for( var i = 0; i < propertyDefs.length / 2; i++ )
				{ 
					var name = propertyDefs[ i * 2 ];
					var id = propertyDefs[ i * 2 + 1 ];
					
					// Skip properties which are already shown on metadata card or otherwise excluded.
					if ( excludedProperties.hasOwnProperty( id ) )
						continue;
					
					nameArray.push( name );
					idMap[ name ] = id;
				}
				nameArray.sort();

				// Set results.	
				var results = [];
				for( var i = 0; i < nameArray.length; i++ ) {
					var name = nameArray[ i ];
					if ( request.term.length > 0 && name.length >= request.term.length && name.substring( 0, request.term.length ).toLowerCase() == request.term.toLowerCase() )
					{
						results.push( { "label" : name , "mf_value" : idMap[ name ] } );
					}						
				}				
				add( results );
			},
			select: function ( event, ui )
			{
				propertyList.data( "selection", ui.item.mf_value );			
			}
		});
		dlg.dialog( 'open' );
	};
	
	// initializeDialogs
	utilities.initializeDialogs = function( metadatacard )
	{
		this.initializeErrorDialog( metadatacard );
		this.initializeConfirmNewValueDialog( metadatacard );
		this.initializeValueDoesNotExistDialog( metadatacard );
		this.initializeAddPropertiesDialog( metadatacard );
	}
	
	// initializeErrorDialog
	utilities.initializeErrorDialog = function( metadatacard )
	{
		// Get localized text for button.
		var okButton = localization.getText( "Dialog-Ok" );
		
		var localizedButtons = {};
		localizedButtons[ okButton ] = function() {
					
			// Caller object is passed via element's data.
			var caller = $( this ).data('caller');
						
			// Clear reference to clicked control so that it will not move to edit mode when user closes the dialog. 
			metadatacard.controlToActivate = null;
						
			// Close dialog.
			$( this ).dialog( "close" );
						
			// TODO: Better name for function.
			caller.cancelAdding();
			return true;
		};
	
		// Dialog to inform user about error.
		$(".mf-internal-invalidvalue-dialog").dialog( {
			autoOpen: false,
			modal: true,	
			title: "M-Files",
			buttons: localizedButtons
		});		
		
	};
	
	// initializeValueDoesNotExistDialog
	utilities.initializeValueDoesNotExistDialog = function( metadatacard )
	{
		// Get localized text for buttons.
		var yesButton = localization.getText( "Dialog-Yes" );
		var noButton = localization.getText( "Dialog-No" );
		
		var localizedButtons = {};
		localizedButtons[ yesButton ] = function() {
			// Caller object (lookup control) and changed text are passed via element's data.
			var lookupControl = $( this ).data( "lookupControl" );
			var changedText = $( this ).data( "changedText" );
						
			// Clear reference to clicked control so that it will not move to edit mode when user closes the dialog. 
			metadatacard.controlToActivate = null;
						
			// Close dialog and call function in lookup control to confirm adding of value to list.
			$( this ).dialog( "close" );
			lookupControl.confirmValueAdding( changedText );
			return true;		
		};
		localizedButtons[ noButton ] = function() {
			// Caller object (lookup control) is passed via element's data.
			var lookupControl = $( this ).data( "lookupControl" );
						
			// Clear reference to clicked control so that it will not move to edit mode when user closes the dialog. 
			metadatacard.controlToActivate = null;
						
			// Close dialog and call function in lookup control to cancel adding of a new value.
			$( this ).dialog( "close" );
			lookupControl.cancelAdding();
			return false;
		};
	
		// Dialog to inform user about new value.
		$( ".mf-internal-newvalue-dialog" ).dialog( {
			autoOpen: false,
			modal: true,
			title: "M-Files",	
			buttons: localizedButtons
		} );	
	};
	
	// initializeConfirmNewValueDialog
	utilities.initializeConfirmNewValueDialog = function( metadatacard )
	{
		// Get localized text for buttons.
		var okButton = localization.getText( "Dialog-Ok" );
		var cancelButton = localization.getText( "Dialog-Cancel" );
		
		var localizedButtons = {};
		localizedButtons[ okButton ] = function() {
			// Caller object (lookup control) and changed text are passed via element's data.
			var lookupControl = $( this ).data( "lookupControl" );
			
			// It is possible that user has changed the value in this phase.
			// Get value from the input field. 
			var changedText = $( this ).find( ".value" ).val();
						
			// Clear reference to clicked control so that it will not move to edit mode when user closes the dialog. 
			metadatacard.controlToActivate = null;
						
			// Close dialog and call function in lookup control to add the new value to list.
			$( this ).dialog( "close" );
			lookupControl.addValueToList( changedText );
			return true;
		};
		localizedButtons[ cancelButton ] = function() {
			// Caller object (lookup control) is passed via element's data.
			var lookupControl = $( this ).data( "lookupControl" );
						
			// Clear reference to clicked control so that it will not move to edit mode when user closes the dialog. 
			metadatacard.controlToActivate = null;
						
			// Close dialog and call function in lookup control to cancel adding of a new value.
			$( this ).dialog( "close" );
			lookupControl.cancelAdding();
			return false;
		};
	
		// Dialog to confirm adding of new value.
		$( ".mf-internal-confirmnewvalue-dialog" ).dialog( {
			autoOpen: false,
			modal: true,	
			title: "M-Files",
			buttons: localizedButtons
		} );
	};
	
	// initializeAddPropertiesDialog
	utilities.initializeAddPropertiesDialog = function( metadatacard )
	{
		// Get localized text for buttons.
		var okButton = localization.getText( "Dialog-Ok" );
		var closeButton = localization.getText( "Dialog-Close" );
		
		// Add buttons and handlers for buttons.
		var localizedButtons = {};
		localizedButtons[ okButton ] = function() {
			// Add selected property and close dialog.
			var dlg = $( ".mf-internal-addproperties-dialog" );
			var propertyList = dlg.find( ".mf-internal-addproperties-dialog-propertylist" );
			var selectedProperty = propertyList.data( "selection" );
			metadatacard.addProperty( selectedProperty );
			return true;
		};
		localizedButtons[ closeButton ] = function() {
			// Close dialog.
			$( this ).dialog( "close" );
			return false;
		};
	
		// Dialog to confirm adding of new value.
		$( ".mf-internal-addproperties-dialog" ).dialog( {
			autoOpen: false,
			modal: true,	
			title: "M-Files",
			buttons: localizedButtons
		} );
	};
	
	// closeDialogs
	utilities.closeDialogs = function()
	{
		$( ".mf-internal-invalidvalue-dialog" ).dialog( "close" );	
		$( ".mf-internal-newvalue-dialog" ).dialog( "close" );
		$( ".mf-internal-confirmnewvalue-dialog" ).dialog( "close" );
		$( ".mf-internal-addproperties-dialog" ).dialog( "close" );
	}
	
	// createProperty: TODO: Move this to vaultOperations???
	utilities.createProperty = function( valueType, propertyDef, value )
	{
		var property = MFiles.CreateInstance( "PropertyValue" );
		property.PropertyDef = propertyDef;
		property.TypedValue.SetValue( valueType, value );
		return property;
	};
	
} ( window.utilities = window.utilities || {}, jQuery ) );
﻿( function( vaultOperations, $, undefined ) {

	// initialize.
	vaultOperations.initialize = function( shellFrame )
	{
		this.vault = shellFrame.ShellUI.Vault;
		this.shellFrame = shellFrame;	
    };
	
	// getVault.
	vaultOperations.getVault = function()
	{
		return this.vault;
	};
	
	// getValueListValues.
	vaultOperations.getValueListValues = function( searchCondition, propertyDef, valueListId, maxResults )
	{
		// TODO: check if there is better way to implement sorting of names/ids together.
		// TODO: Check whether this works in case of value list values with equal name but different id.
		
		// Get lookup values from MFShell.
		// Returned array contains the following values:
		//
		// Element 0: Name of first lookup item.
		// Element 1: Id of first lookup item.
		// Element 2: Name of second lookup item.
		// Element 3: Id of second lookup item.
		// etc.
		var values = {};
		var lookupValues = this.shellFrame.GetLookupValues( this.vault, valueListId, maxResults, searchCondition );
		var arr = ( new VBArray( lookupValues ) ).toArray();
		
		// Sort array.
		var nameArray = []
		var idMap = {};
		for( var i = 0; i < arr.length / 2; i++ )
		{ 
			var name = arr[ i * 2 ];
			nameArray.push( name );
			idMap[ name ] = arr[ i * 2 + 1 ];
		}
		var ascendingSort = vaultOperations.sortIsAscending( propertyDef );
		nameArray.sort( function( a, b ) {
			return vaultOperations.caseInsensitiveSort( a, b, ascendingSort )
		} );
		var resultArray = [];
		for( var i = 0; i < nameArray.length; i++ )
		{
			var name = nameArray[ i ];
			resultArray.push( name );
			resultArray.push( idMap[ name ] );			
		}
		return resultArray;
	};
	
	// getPropertyDefs.
	vaultOperations.getPropertyDefs = function()
	{
		var result = [];
		var propertyDefs = this.vault.PropertyDefOperations.GetPropertyDefs();
		for ( var i = 0; i < propertyDefs.Count; i++ )
		{
			var propertyDef = propertyDefs.Item( i + 1 );
			result.push( propertyDef.Name );
			result.push( propertyDef.ID );	
		}
		return result;
	};
	
	// isNewValue.
	vaultOperations.valueExists = function( value, valueListId )
	{		
		return ( this.shellFrame.ValueExists( this.vault, valueListId, value ) === -1 ) ? false : true;
	};
	
	// isAddingAllowed.
	vaultOperations.isAddingAllowed = function( valueListId )
	{		
		var objType = this.vault.ValueListOperations.GetValueList( valueListId );
		return objType.AllowAdding;
	};
	
	// hasRealObjects.
	vaultOperations.hasRealObjects = function( valueListId )
	{		
		var objType = this.vault.ValueListOperations.GetValueList( valueListId );
		return objType.RealObjectType;
	};
	
	// sortIsAscending
	vaultOperations.sortIsAscending = function( propertyDef )
	{
		var propertyDefObject = this.vault.PropertyDefOperations.GetPropertyDef( propertyDef );
		if ( propertyDefObject.SortAscending == true )
			return true
		return false;
	};
	
	// propertyName
	vaultOperations.propertyName = function( propertyDef )
	{
	    var propertyName = "";
	    try {
		    var propertyDefObject = this.vault.PropertyDefOperations.GetPropertyDef( propertyDef );
			if ( propertyDefObject )
			    propertyName = propertyDefObject.Name;
	    }
		catch ( ex )
		{
		}
		return propertyName;
	};
	
	// addNewValueToList.
	vaultOperations.addNewValueToList = function( value, valueListId )
	{
		// Create new value list item and add it to the value list.
		var valueListItem = MFiles.CreateInstance( "ValueListItem" );
		valueListItem.ValueListID = valueListId;
		valueListItem.Name = value;
		
		var result = null;
		try
		{
			result = this.vault.ValueListItemOperations.AddValueListItem( valueListId, valueListItem, false ).ID;
		}
		catch ( ex )
		{
			// Adding new values to the list is not allowed.
		}
		return result;
	};
	
	// getValueListByPropertyDef
	vaultOperations.getValueListByPropertyDef = function( propertyDef )
	{
		var propertyDefObject = null;
		try {
		    propertyDefObject = this.vault.PropertyDefOperations.GetPropertyDef( propertyDef );
			if ( propertyDefObject )
			{
			    if ( propertyDefObject.BasedOnValueList == false )
			        return -1;
				return propertyDefObject.ValueList;
			}
		}
		catch ( ex ) {
		}
	    return -1;
	};
	
	// getDatatypeByPropertyDef
	vaultOperations.getDatatypeByPropertyDef = function( propertyDef )
	{
		var propertyDefObject = null;
		try {
		    propertyDefObject = this.vault.PropertyDefOperations.GetPropertyDef( propertyDef );
			if ( propertyDefObject )
				return propertyDefObject.DataType;
		}
		catch ( ex ) {
		}
	    return -1;
	};
	
	// getValueListItemNameByID
	vaultOperations.getValueListItemNameByID = function( valueList, id )
	{
		var displayName = "";
		try {
		    var valueListItem = this.vault.ValueListItemOperations.GetValueListItemByID( valueList, id );
			if ( valueListItem )
				displayName = valueListItem.Name;
		}
		catch ( ex ) {
		}
	    return displayName;
	};

	// createObject
	vaultOperations.createNewObject = function( objectType, propertyValues )
	{	
		// Create new object.
		var objectFiles = MFiles.CreateInstance( "SourceObjectFiles" );
		var accessControlList = MFiles.CreateInstance( "AccessControlList" );
		var objectVersionAndProperties =  this.vault.ObjectOperations.CreateNewObject(
			objectType, propertyValues, objectFiles, accessControlList );

		// Check in the newly created object if not checked yet.
		try {
			this.vault.ObjectOperations.CheckIn( objectVersionAndProperties.ObjVer );
		}
		catch ( ex ) {
		}
    };
	
	// saveObject
	vaultOperations.saveObject = function( objectVersionAndProperties, changedProperties, removedProperties )
	{
		var objVer = objectVersionAndProperties.ObjVer;
		var type = objVer.Type;
		
		// Get latest version.
		var objectVersionAndProperties = this.vault.ObjectOperations.GetLatestObjectVersionAndProperties( objVer.ObjID, true );
		var properties = objectVersionAndProperties.Properties;
		
		// Merge changed propertyValues.
		// TODO: What if properties of latest object have been changed???
		for ( var i = 0; i < changedProperties.Count; i++ )
		{
			var changedProperty = changedProperties.Item( i + 1 );
			var index = properties.IndexOf( changedProperty.PropertyDef );
			if ( index != -1 )
			{
				properties.Remove( index );
			}
			properties.Add( -1, changedProperty );
		}
		// Remove properties which are marked to be removed by user.
		for ( var removedPropertyDef in removedProperties ) {
			
			if ( removedProperties[ removedPropertyDef ] === false )
				continue;
			
			var index = properties.IndexOf( removedPropertyDef );
			if ( index != -1 )
				properties.Remove( index );
		}
		
		this.vault.ObjectPropertyOperations.SetAllProperties( objectVersionAndProperties.ObjVer, true, properties );
    };
	
	vaultOperations.setNamedValue = function( name, value )
	{
	    var storageOperations = this.vault.NamedValueStorageOperations;
		var namedValues = MFiles.CreateInstance( "NamedValues" );
		namedValues.Value( name ) = value;
		storageOperations.SetNamedValues( MFUserDefinedValue, "TestApplication", namedValues );
	}
	
	vaultOperations.getNamedValue = function( name )
	{
	    var storageOperations = this.vault.NamedValueStorageOperations;
		var namedValues = storageOperations.GetNamedValues( MFUserDefinedValue, "TestApplication" );
		return namedValues.Value( name );
	}
	
	vaultOperations.getDefaultPropertyValues = function( classId, onlyRequiredValues )
	{
		// Get associated property defs.
		var objectClass = this.vault.ClassOperations.GetObjectClass( classId );
		var associatedPropertyDefs = objectClass.AssociatedPropertyDefs;
					
		// Create property values array.
		var propertyValues = MFiles.CreateInstance( "PropertyValues" );
		for ( var i = 0; i < associatedPropertyDefs.Count; i++ )
		{
			// Get associated propery def.
			var associatedPropertyDef = associatedPropertyDefs.Item( i + 1 );
			if ( onlyRequiredValues && !associatedPropertyDef.Required ) continue;
			
			var propertyDef = associatedPropertyDef.PropertyDef;
								
			// Add new property value based on associated property def.
			var propertyValue = MFiles.CreateInstance( "PropertyValue" );		
			propertyValue.PropertyDef = propertyDef;
			var dataType = vaultOperations.getDatatypeByPropertyDef( propertyDef )
			propertyValue.TypedValue.SetValueToNULL( dataType );
			propertyValues.Add( -1, propertyValue );
		}
		return propertyValues;
	}
	
	vaultOperations.caseInsensitiveSort = function( a, b, ascendingSort )
	{
		var ret = 0;
		a = a.toLowerCase();
		b = b.toLowerCase();
		if( a > b ) 
			ret = (ascendingSort) ? 1 : -1;
		if( a < b ) 
			ret = (ascendingSort) ? -1 : 1; 
		return ret;
	};
	
}( window.vaultOperations = window.vaultOperations || {}, jQuery ) );
