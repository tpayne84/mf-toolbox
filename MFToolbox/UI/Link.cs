namespace MFToolbox.UI
{
	/// <summary>
	/// UI - ViewModel - Link Class.
	/// </summary>
	public class Link
	{
		/// <summary>
		/// Index is used to sort links within a link[] collection.
		/// </summary>
		public int Index { get; set; }
		
		/// <summary>
		/// Link URL.
		/// </summary>
		public string Href { get; set; }

		/// <summary>
		/// Inner HTML of the 'a' tag.
		/// </summary>
		public string InnerHTML { get; set; }
	}
}
