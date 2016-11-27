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
