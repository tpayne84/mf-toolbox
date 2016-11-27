
"use strict";

function OnNewShellUI( shellUI ) {
	/// <summary>The entry point of ShellUI module.</summary>
	/// <param name="shellUI" type="MFiles.ShellUI">The new shell UI object.</param>

	// Dashboards for certain object types/classes.
	// All object types/classes will be registered to "MetadataCard".
	var dashboards = [ { objectType : "*", classId : "*", dashboardId : "MetadataCard" } ];

	// Initialize dashboard manager.
	initializeDashboardManager( shellUI, {
		dashboards: dashboards
	} );
};