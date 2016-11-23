using System;
using MFToolbox.Core;
using MFToolbox.UI;

namespace MFToolbox
{
	/// <summary>
	/// MF-Toolbox - M-Files Extension Object Class.
	/// </summary>
	public class MFToolbox : ExtensionObject
	{
		/// <summary>
		/// Extension Object Name.
		/// </summary>
		public const string Name = "MFToolbox";

		/// <summary>
		/// Dashboard View Model.
		/// </summary>
		public ViewModel Model { get; set; }

		/// <summary>
		/// Constructor.
		/// </summary>
		public MFToolbox() : base( Name )
		{
			// Create a new ViewModel instance.
			this.Model = new ViewModel();
			this.Model.HeaderCaption = "MF-Toolbox";

			// Add new tabs here.
			this.Model.Tabs = new[]
			{
				new Tab { Caption = "Alias Tools", ID = 1, View = "AliasTools" }
			};

			// Footer
			this.Model.Footer = new Footer { LeftCaption = "Free as in beer!" };

			// Add new footer links here.
			this.Model.Footer.Links = new[]
			{
				new Link { Href = "#", Index = 0, InnerHTML = "Link 1" },
				new Link { Href = "#", Index = 1, InnerHTML = "Link 2" },
				new Link { Href = "#", Index = 2, InnerHTML = "Link 3" }
			};
		}

		/// <summary>
		/// Returns a JSON String used by the UI Dashboard Controller.
		/// </summary>
		/// <returns>ViewModel as JSON</returns>
		public string GetUIConfiguration()
		{
			return this.Model.ToJson< ViewModel >();
		}

		/// <summary>
		/// Method Execution Proxy.
		/// </summary>
		/// <param name="cmd">Command Name</param>
		/// <param name="args">Arguments</param>
		/// <returns>Variable String Data</returns>
		public string Call( string cmd, object[] args )
		{
			throw new NotImplementedException();
		}
	}
}