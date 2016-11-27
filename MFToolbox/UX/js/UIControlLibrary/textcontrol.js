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
	
} )( jQuery );