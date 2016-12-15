using System;
using MFilesAPI;

namespace MFToolbox.Core
{
	/// <summary>
	/// M-Files Server Connection Info Attribute class.
	/// </summary>
	public class MFServerAttribute : Attribute
	{
		/// <summary>
		/// Authentication type.
		/// </summary>
		public MFAuthType AuthType { get; set; } = MFAuthType.MFAuthTypeLoggedOnWindowsUser;

		/// <summary>
		/// User name.
		/// </summary>
		public object UserName { get; set; } = null;

		/// <summary>
		/// Password.
		/// </summary>
		public object Password { get; set; } = null;

		/// <summary>
		/// Domain.
		/// </summary>
		public object Domain { get; set; } = null;

		/// <summary>
		/// Protocol Sequence.
		/// </summary>
		public string ProtocolSequence { get; set; } = "ncacn_ip_tcp";

		/// <summary>
		/// Network address of the M-Files Server.
		/// </summary>
		public string NetworkAddress { get; set; } = "localhost";

		/// <summary>
		/// Server Port.
		/// </summary>
		public string Endpoint { get; set; } = "2266";

		/// <summary>
		/// Local Computer Name.
		/// </summary>
		public string LocalComputerName { get; set; } = "MFToolbox-" + Environment.MachineName;

		/// <summary>
		/// Are anonymous connections allowed?
		/// </summary>
		public bool AllowAnonymousConnection { get; set; } = false;
	}
}
