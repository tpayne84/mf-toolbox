using MFToolbox.Core;
using Newtonsoft.Json;

namespace MFToolbox.UI
{
	/// <summary>
	/// UI : ViewModel class.
	/// </summary>
	public class ViewModel
	{
		/// <summary>
		/// Main Header Caption.
		/// </summary>
		public string HeaderCaption { get; set; }

		/// <summary>
		/// Main Header Left Icon image.
		/// </summary>
		public string HeaderImgPath { get; set; }

		/// <summary>
		/// Active Tab ID.
		/// </summary>
		public int ActiveTab { get; set; }

		/// <summary>
		/// Tab collection.
		/// </summary>
		public Tab[] Tabs { get; set; }

		/// <summary>
		/// Footer Element Data.
		/// </summary>
		public Footer Footer { get; set; }
	}
}
