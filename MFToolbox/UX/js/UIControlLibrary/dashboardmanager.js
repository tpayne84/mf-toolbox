// initializeDashboardManager
function initializeDashboardManager( shellUI, dataObject )
{
	// TODO: Check all parameters. enable missing parameters/nulls...
	// TODO: Give "clear" error code if invalid parameters...

	var master = {};
	master.shellUI = shellUI;
	master.dashboards = dataObject.dashboards || [];
	master.commonCallbacks = dataObject.callbacks || {};
	master.dataObject = dataObject;
	master.selectedItems = null;
	master.dashboardLoaded = false;
	master.commands = {};
	
	var dashboardManager = {
		// registerCommand
	    registerCommand: function( commandId, callback ) {
			master.commands[ "command_" + commandId ] = callback;
		},
		
		// createObject
		createObject: function( objectType, classId ) {
			var dashboard = getDashboard( master, objectType, classId );
			if ( dashboard != null )
			{
				// Open new modal metadata card.
				master.shellFrame.ShowPopupDashboard( dashboard.dashboardId, true, {
					dashboardClosed: function() {},
					objectType: objectType,
					classId: classId,
					dashboards: master.dashboards,
					commoncallbacks: master.commonCallbacks
				} );
			}
		}
	};
	
	// Register events only for normal shell frames (no e.g. for common dialogs).
	shellUI.Events.Register( Event_NewNormalShellFrame, function( shellFrame ) {
	   
		master.shellFrame = shellFrame;
		master.selectedItems = null;
		master.dashboardLoaded = null;
		master.commands = {};
		
		// Register NewShellListing event.
		shellFrame.Events.Register( Event_NewShellListing, function( shellListing ) {
				
			// Register SelectionChanged event.
			shellListing.Events.Register( Event_SelectionChanged, function( selectedItems ) {
				return handleSelectionChanged( master, selectedItems );
			} );  // end of registering SelectionChanged event
			
		} );  // end of registering NewShellListing event
		
		// Register Started event.
		shellFrame.Events.Register( Event_Started, function() {
			// call callback function when initialization completed.
			if ( master.commonCallbacks.onStarted )
				master.commonCallbacks.onStarted( dashboardManager, master.shellFrame );
		} );  // end of registering Started event
		
		// Register NewCommands event.
		shellFrame.Events.Register( Event_NewCommands, function( commands ) {			
			// Register CustomCommand event.
			commands.Events.Register( Event_CustomCommand, function( commandId ) {
				return handleCustomCommand( master, commandId );			
			} );  // end of registering CustomCommand event
			
		} );  // end of registering NewCommands event
		
	} );  // end of registering NewShellFrame

	
	// Note: The following functions are inside the scope of initializeDashboardManager function.

	// getDashboard
	function getDashboard( master, objectType, classId )
	{
		for ( var i = 0; i < master.dashboards.length; i++ ) {
			var dashboard = master.dashboards[ i ];			
			if ( ( dashboard.objectType == objectType || dashboard.objectType == '*' ) && ( dashboard.classId == classId || dashboard.classId == '*' ) )
				return dashboard;
		}  // end for
		return null;
	};

	// handleSelectionChanged
	// TODO: Optimize this is possible.
	function handleSelectionChanged( master, selectedItems )
	{
		master.selectedItems = selectedItems;
		var objectVersions = master.selectedItems.ObjectVersions;
		if ( objectVersions != null )
		{
			if( objectVersions.Count > 0 )
			{
				var objectVersion = objectVersions.Item( 1 );
				var currentClassId = objectVersion.Class;
				var currentObjectType = objectVersion.ObjVer.Type;
			
				var dashboard = getDashboard( master, currentObjectType, currentClassId );
				if ( dashboard != null )
				{
					var objectVersionsAndProperties = master.selectedItems.ObjectVersionsAndProperties;
					
					// If dashboard not yet loaded, load it here.
					if ( master.dashboardLoaded == null )
					{
						// If showing allowed, show dashboard here.
						if ( isShowingAllowed( master, objectVersionsAndProperties ) )
						{
							master.shellFrame.RightPane.ShowDashboard( dashboard.dashboardId, {
								dashboardClosed: function() {
									master.dashboardLoaded = null;
								},
								objectType: currentObjectType,
								classId: currentClassId,
								dashboards: master.dashboards,
								commoncallbacks: master.commonCallbacks
							} );
							master.dashboardLoaded = dashboard.dashboardId;
						}
					}
					else
					{
						// Dashboard already loaded. Check that this is correct dashboard for this object.
						// If not, load correct dashboard.
						if ( master.dashboardLoaded != dashboard.dashboardId )
						{
							// If showing allowed, show correct dashboard here.
							if ( isShowingAllowed( master, objectVersionsAndProperties ) )
							{
								master.shellFrame.RightPane.ShowDashboard( dashboard.dashboardId, {
									dashboardClosed: function() {
										master.dashboardLoaded = null;
									},
									objectType: currentObjectType,
									classId: currentClassId,
									dashboards: master.dashboards
								} );
								master.dashboardLoaded = dashboard.dashboardId;
							}
							else
							{
								// Showing of another dashboard not allowed, close current dashboard.
								master.shellFrame.RightPane.ShowDefaultContent();
								master.dashboardLoaded = null;
							}							
						}
						else
						{
							// Correct dashboard, but we should ensure that showing of it is ok with current selection.
							// If not, close dashboard.
							if ( !isShowingAllowed( master, objectVersionsAndProperties ) )
							{
								// Showing of this dashboard is not allowed with current selection, close it.
								master.shellFrame.RightPane.ShowDefaultContent();
								master.dashboardLoaded = null;
							}
						}
					}
				}
				else
				{
					// No dashboard registered for this objectType/classId. If any dashboard is visible, close it.
					if ( master.dashboardLoaded != null )
					{
						master.shellFrame.RightPane.ShowDefaultContent();
						master.dashboardLoaded = null;
					}
				}
			}
			else
			{
				// No selection. If any dashboard is visible, close it.
				if ( master.dashboardLoaded != null )
				{
					master.shellFrame.RightPane.ShowDefaultContent();
					master.dashboardLoaded = null;
				}
			}
		}
	};
	
	// handleCustomCommand
	function handleCustomCommand( master, commandId )
	{
		var propertyName = "command_" + commandId;
		if ( master.commands.hasOwnProperty( propertyName ) )
		{
			// Callback.
			master.commands[ propertyName ]();
		}
	};
	
	// isShowingAllowed
	function isShowingAllowed( master, objectVersionsAndProperties )
	{
		// Get first selected item.
		var objectVersionAndProperties = objectVersionsAndProperties.Item( 1 );
		
		// If common onShowDashboard callback function exists, call it.
		var result = true;
		if ( master.commonCallbacks.hasOwnProperty( "onShowDashboard" ) ) {
			result = master.commonCallbacks.onShowDashboard( objectVersionAndProperties );
		}	
		// Return result. True means that showing is allowed.
		return ( result === true || result === undefined );
	}
	
}  // end of initializeDashboardManager